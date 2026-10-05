import {
  MAX_ITEM_BYTES,
  MAX_REQUEST_RECORDS,
  MAX_REQUEST_VALUE_CHARS,
  decodeItem,
  encodeItemValues,
  formatTxtValue,
  parseTxtValue,
  readFields,
} from "./route53-records.ts";
import {
  DatabaseBusyError,
  DatabaseFullError,
  MAX_UPLOADS_PER_HOUR,
  RETENTION_SECONDS,
  newItemKey,
  randomHex,
  sha256Hex,
  type AverageStore,
  type Caller,
  type UploadSlot,
} from "./store.ts";

// A TXT record set as Route 53's API spells it: values are in presentation
// format, for example `"c=1" "e=1767225600"`.
export type TxtRecordSet = { name: string; ttl: number; values: string[] };

export type RecordChange = {
  action: "CREATE" | "DELETE";
  record: TxtRecordSet;
};

export type ListCursor = { name: string; type: string };

// Writes, and the reads that must observe them immediately.
export interface Route53ControlPlane {
  // Applies every change or none of them.
  changeRecords(changes: RecordChange[]): Promise<void>;
  getRecord(name: string): Promise<TxtRecordSet | null>;
  listRecords(
    cursor?: ListCursor,
  ): Promise<{ records: TxtRecordSet[]; next: ListCursor | null }>;
  getRecordLimit(): Promise<{ count: number; limit: number }>;
}

// Plain DNS against the zone's authoritative nameservers.
export interface TxtResolver {
  lookupTxt(name: string): Promise<string[][] | null>;
}

// Route 53 refused a change batch (InvalidChangeBatch). Because batches are
// atomic, this is how a failed precondition shows up.
export class ChangeRejectedError extends Error {}

const RECORD_TTL_SECONDS = 60;
const UPLOAD_WINDOW_SECONDS = 60 * 60;
const MAX_CAS_ATTEMPTS = 4;
const MAX_CLEANUP_PAGES = 50;
const MAX_CLEANUP_BATCHES = 100;
const MAX_CHANGES_PER_CLEANUP_BATCH = 200;
const TRIM_START_RATIO = 0.9;
const TRIM_TARGET_RATIO = 0.8;
const API_KEY_PATTERN = /^avg_([0-9a-f]{8})[0-9a-f]{24}$/;
const ITEM_SUFFIX_PATTERN = /^[0-9a-f]{20}$/;

// Records live under one zone, by API key hash so a DNS name never reveals a
// key and enterprise keys of any shape become valid labels:
//
//   <key hash>.k.<zone>                   "e=<expires>"
//   <item id>.<key hash>.i.<zone>         "m" "c=…" "e=…" "b=…" "n=…", "0" "<base64>"…
//   <hour hex>.<key hash>.u.<zone>        "c=<uploads>" "e=<expires>"
//
// API keys embed their expiry (avg_<8 hex expiry><24 hex random>) so a write
// can rebuild the key's record exactly and require it in the same atomic
// change batch: Route 53 rejects a DELETE that does not match, so
// DELETE + CREATE of the unchanged record works as a condition check.
export class Route53Store implements AverageStore {
  readonly maxValueBytes = MAX_ITEM_BYTES;
  // Route 53 typically reaches every authoritative server within 60 seconds.
  readonly propagationSeconds = 60;
  private readonly zoneName: string;
  private readonly control: Route53ControlPlane;
  private readonly resolver: TxtResolver;

  constructor(
    zoneName: string,
    control: Route53ControlPlane,
    resolver: TxtResolver,
  ) {
    this.zoneName = zoneName.replace(/\.$/, "").toLowerCase();
    this.control = control;
    this.resolver = resolver;
  }

  async createApiKey(now: number) {
    const expiresAt = now + RETENTION_SECONDS;
    const apiKey = `avg_${expiresAt.toString(16).padStart(8, "0")}${randomHex(24)}`;

    await this.change([
      { action: "CREATE", record: await this.apiKeyRecord(apiKey) },
    ]);
    return { apiKey, expiresAt };
  }

  async isApiKeyValid(apiKey: string, now: number): Promise<boolean> {
    if (!isUnexpiredApiKey(apiKey, now)) {
      return false;
    }

    const records = await this.resolver.lookupTxt(await this.keyName(apiKey));
    return (records ?? []).some(
      (strings) => (readFields(strings).get("e") ?? 0) > now,
    );
  }

  async putItem(
    caller: Caller,
    value: string,
    now: number,
  ): Promise<string | null> {
    if (!caller.trusted && !isUnexpiredApiKey(caller.apiKey, now)) {
      return null;
    }

    const itemKey = newItemKey(caller.apiKey);
    const item: TxtRecordSet = {
      name: await this.itemName(caller.apiKey, itemKey),
      ttl: RECORD_TTL_SECONDS,
      values: encodeItemValues(value, {
        createdAt: now,
        expiresAt: now + RETENTION_SECONDS,
        sizeBytes: new TextEncoder().encode(value).byteLength,
      }),
    };

    try {
      await this.change([
        ...(await this.requireApiKey(caller)),
        { action: "CREATE", record: item },
      ]);
    } catch (error) {
      if (
        error instanceof ChangeRejectedError &&
        !caller.trusted &&
        !(await this.control.getRecord(await this.keyName(caller.apiKey)))
      ) {
        return null;
      }
      throw error;
    }
    return itemKey;
  }

  async getItem(
    apiKey: string,
    itemKey: string,
    now: number,
  ): Promise<string | null> {
    if (!ITEM_SUFFIX_PATTERN.test(itemKey.slice(apiKey.length + 1))) {
      return null;
    }

    const records = await this.resolver.lookupTxt(
      await this.itemName(apiKey, itemKey),
    );
    const item = records ? decodeItem(records) : null;
    return item && item.meta.expiresAt > now ? item.value : null;
  }

  // An optimistic counter: read the current count from the control plane,
  // then swap it for count + 1 in a batch that fails if anyone else got
  // there first.
  async claimUploadSlot(caller: Caller, now: number): Promise<UploadSlot> {
    if (!caller.trusted && !isUnexpiredApiKey(caller.apiKey, now)) {
      return "unauthorized";
    }

    const windowStart = Math.floor(now / UPLOAD_WINDOW_SECONDS) * UPLOAD_WINDOW_SECONDS;
    const hash = await this.keyHash(caller.apiKey);
    const name = `${windowStart.toString(16)}.${hash}.u.${this.zoneName}`;

    for (let attempt = 0; attempt < MAX_CAS_ATTEMPTS; attempt += 1) {
      const current = await this.control.getRecord(name);
      const count = current
        ? (readFields(current.values.flatMap(parseTxtValue)).get("c") ?? 0)
        : 0;
      if (count >= MAX_UPLOADS_PER_HOUR) {
        return "rate_limited";
      }

      const next: TxtRecordSet = {
        name,
        ttl: RECORD_TTL_SECONDS,
        values: [
          formatTxtValue([
            `c=${count + 1}`,
            `e=${windowStart + 2 * UPLOAD_WINDOW_SECONDS}`,
          ]),
        ],
      };

      try {
        await this.change([
          ...(await this.requireApiKey(caller)),
          ...(current ? [{ action: "DELETE" as const, record: current }] : []),
          { action: "CREATE", record: next },
        ]);
        return "ok";
      } catch (error) {
        if (!(error instanceof ChangeRejectedError)) {
          throw error;
        }
        if (
          !caller.trusted &&
          !(await this.control.getRecord(await this.keyName(caller.apiKey)))
        ) {
          return "unauthorized";
        }
        // Another upload changed the counter first. Read it again.
      }
    }

    throw new DatabaseBusyError("Too many uploads are racing for this API key");
  }

  async cleanup(now: number): Promise<void> {
    const expired: TxtRecordSet[] = [];
    const live: Array<{ record: TxtRecordSet; expiresAt: number }> = [];

    let cursor: ListCursor | undefined;
    for (let page = 0; page < MAX_CLEANUP_PAGES; page += 1) {
      const { records, next } = await this.control.listRecords(cursor);
      for (const record of records) {
        const expiresAt = this.recordExpiry(record);
        if (expiresAt === null) {
          continue;
        }
        if (expiresAt <= now) {
          expired.push(record);
        } else {
          live.push({ record, expiresAt });
        }
      }
      if (!next) {
        break;
      }
      cursor = next;
    }

    await this.deleteRecords(expired);

    // Like the old 5 GB soft cap: when the zone nears its record quota,
    // delete whatever would have expired soonest.
    const { count, limit } = await this.control.getRecordLimit();
    if (!(count > limit * TRIM_START_RATIO)) {
      return;
    }
    const excess = count - Math.floor(limit * TRIM_TARGET_RATIO);
    live.sort((left, right) => left.expiresAt - right.expiresAt);
    await this.deleteRecords(
      live.slice(0, excess).map(({ record }) => record),
    );
  }

  private async deleteRecords(records: TxtRecordSet[]): Promise<void> {
    let batch: RecordChange[] = [];
    let batchValues = 0;
    let batchChars = 0;
    let batches = 0;

    const flush = async () => {
      if (batch.length > 0 && batches < MAX_CLEANUP_BATCHES) {
        batches += 1;
        try {
          await this.change(batch);
        } catch (error) {
          // A record changed after we listed it. The next run retries.
          if (!(error instanceof ChangeRejectedError)) {
            throw error;
          }
          console.warn("Route 53 cleanup batch was rejected", error);
        }
      }
      batch = [];
      batchValues = 0;
      batchChars = 0;
    };

    for (const record of records) {
      const chars = valueChars(record);
      if (
        batch.length >= MAX_CHANGES_PER_CLEANUP_BATCH ||
        batchValues + record.values.length > MAX_REQUEST_RECORDS ||
        batchChars + chars > MAX_REQUEST_VALUE_CHARS
      ) {
        await flush();
      }
      batch.push({ action: "DELETE", record });
      batchValues += record.values.length;
      batchChars += chars;
    }
    await flush();
  }

  // Only records this store owns have an expiry; anything else in the zone
  // (SOA, NS, hand-made records) is left alone.
  private recordExpiry(record: TxtRecordSet): number | null {
    const name = record.name.replace(/\.$/, "").toLowerCase();
    const suffix = `.${this.zoneName}`;
    if (
      !name.endsWith(suffix) ||
      !/^([0-9a-f]+\.)?[0-9a-f]+\.[iku]$/.test(name.slice(0, -suffix.length))
    ) {
      return null;
    }

    for (const value of record.values) {
      const expiresAt = readFields(parseTxtValue(value)).get("e");
      if (expiresAt !== undefined) {
        return expiresAt;
      }
    }
    return null;
  }

  private async change(changes: RecordChange[]): Promise<void> {
    try {
      await this.control.changeRecords(changes);
    } catch (error) {
      if (
        error instanceof ChangeRejectedError &&
        /limit|maximum|exceed/i.test(error.message)
      ) {
        throw new DatabaseFullError(error.message);
      }
      throw error;
    }
  }

  // DELETE and re-CREATE the caller's API key record, unchanged. The batch
  // fails unless the record exists exactly as created.
  private async requireApiKey(caller: Caller): Promise<RecordChange[]> {
    if (caller.trusted) {
      return [];
    }
    const record = await this.apiKeyRecord(caller.apiKey);
    return [
      { action: "DELETE", record },
      { action: "CREATE", record },
    ];
  }

  private async apiKeyRecord(apiKey: string): Promise<TxtRecordSet> {
    return {
      name: await this.keyName(apiKey),
      ttl: RECORD_TTL_SECONDS,
      values: [formatTxtValue([`e=${apiKeyExpiry(apiKey)}`])],
    };
  }

  private async keyHash(apiKey: string): Promise<string> {
    return (await sha256Hex(apiKey)).slice(0, 32);
  }

  private async keyName(apiKey: string): Promise<string> {
    return `${await this.keyHash(apiKey)}.k.${this.zoneName}`;
  }

  private async itemName(apiKey: string, itemKey: string): Promise<string> {
    const itemId = itemKey.slice(apiKey.length + 1);
    return `${itemId}.${await this.keyHash(apiKey)}.i.${this.zoneName}`;
  }
}


function apiKeyExpiry(apiKey: string): number {
  const match = API_KEY_PATTERN.exec(apiKey);
  return match ? parseInt(match[1], 16) : 0;
}

function isUnexpiredApiKey(apiKey: string, now: number): boolean {
  return apiKeyExpiry(apiKey) > now;
}

function valueChars(record: TxtRecordSet): number {
  return record.values.reduce((total, value) => total + value.length, 0);
}
