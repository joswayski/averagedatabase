import {
  MAX_REQUEST_RECORDS,
  MAX_REQUEST_VALUE_CHARS,
  MAX_STRING_BYTES,
  MAX_VALUE_CHARS,
  parseTxtValue,
} from "./route53-records.ts";
import {
  ChangeRejectedError,
  type ListCursor,
  type RecordChange,
  type Route53ControlPlane,
  type TxtRecordSet,
  type TxtResolver,
} from "./route53-store.ts";

const MAX_VALUES_PER_RECORD_SET = 400;
const PAGE_SIZE = 300;

// A hosted zone in memory for local development and tests. It enforces the
// Route 53 limits and atomic change batches the real store relies on, and
// answers lookups immediately (real changes take up to a minute).
export class MemoryRoute53Zone implements Route53ControlPlane, TxtResolver {
  private records = new Map<string, TxtRecordSet>();
  private readonly recordLimit: number;

  constructor(recordLimit = 10_000) {
    this.recordLimit = recordLimit;
  }

  async changeRecords(changes: RecordChange[]): Promise<void> {
    validateRequest(changes);

    const next = new Map(this.records);
    for (const { action, record } of changes) {
      const key = normalizeName(record.name);
      const existing = next.get(key);
      const label = `[name='${key}.', type='TXT']`;

      if (action === "DELETE") {
        if (!existing) {
          throw new ChangeRejectedError(
            `Tried to delete resource record set ${label} but it was not found`,
          );
        }
        if (!sameRecordSet(existing, record)) {
          throw new ChangeRejectedError(
            `Tried to delete resource record set ${label} but the values provided do not match the current values`,
          );
        }
        next.delete(key);
      } else {
        if (existing) {
          throw new ChangeRejectedError(
            `Tried to create resource record set ${label} but it already exists`,
          );
        }
        next.set(key, { ...record, name: `${key}.` });
      }
    }

    // SOA and NS records count toward the quota too.
    if (next.size + 2 > this.recordLimit) {
      throw new ChangeRejectedError(
        `The change would exceed the maximum of ${this.recordLimit} records in the hosted zone`,
      );
    }
    this.records = next;
  }

  async getRecord(name: string): Promise<TxtRecordSet | null> {
    return this.records.get(normalizeName(name)) ?? null;
  }

  async listRecords(
    cursor?: ListCursor,
  ): Promise<{ records: TxtRecordSet[]; next: ListCursor | null }> {
    const sorted = Array.from(this.records.values()).sort((left, right) =>
      sortKey(left.name).localeCompare(sortKey(right.name)),
    );
    const start = cursor
      ? sorted.findIndex(
          (record) => sortKey(record.name) >= sortKey(cursor.name),
        )
      : 0;
    if (start === -1) {
      return { records: [], next: null };
    }

    const page = sorted.slice(start, start + PAGE_SIZE);
    const following = sorted[start + PAGE_SIZE];
    return {
      records: page,
      next: following ? { name: following.name, type: "TXT" } : null,
    };
  }

  async getRecordLimit(): Promise<{ count: number; limit: number }> {
    return { count: this.records.size + 2, limit: this.recordLimit };
  }

  async lookupTxt(name: string): Promise<string[][] | null> {
    const record = this.records.get(normalizeName(name));
    return record ? record.values.map(parseTxtValue) : null;
  }
}

function validateRequest(changes: RecordChange[]): void {
  if (changes.length === 0) {
    throw new Error("A change batch needs at least one change");
  }

  let values = 0;
  let characters = 0;
  for (const { record } of changes) {
    if (
      record.values.length === 0 ||
      record.values.length > MAX_VALUES_PER_RECORD_SET
    ) {
      throw new ChangeRejectedError(
        `A record set needs between 1 and ${MAX_VALUES_PER_RECORD_SET} values`,
      );
    }
    if (new Set(record.values).size !== record.values.length) {
      throw new ChangeRejectedError("Duplicate Resource Record");
    }

    for (const value of record.values) {
      if (value.length > MAX_VALUE_CHARS) {
        throw new ChangeRejectedError(
          `TXT values are limited to ${MAX_VALUE_CHARS} characters`,
        );
      }
      for (const string of parseTxtValue(value)) {
        if (new TextEncoder().encode(string).length > MAX_STRING_BYTES) {
          throw new ChangeRejectedError(
            `TXT character-strings are limited to ${MAX_STRING_BYTES} characters`,
          );
        }
      }
      values += 1;
      characters += value.length;
    }
  }

  // Route 53 reports these as validation errors, not InvalidChangeBatch.
  if (values > MAX_REQUEST_RECORDS) {
    throw new Error(`More than ${MAX_REQUEST_RECORDS} ResourceRecord elements`);
  }
  if (characters > MAX_REQUEST_VALUE_CHARS) {
    throw new Error(
      `More than ${MAX_REQUEST_VALUE_CHARS} characters in Value elements`,
    );
  }
}

function sameRecordSet(left: TxtRecordSet, right: TxtRecordSet): boolean {
  if (left.ttl !== right.ttl || left.values.length !== right.values.length) {
    return false;
  }
  const values = new Set(left.values);
  return right.values.every((value) => values.has(value));
}

function normalizeName(name: string): string {
  return name.replace(/\.$/, "").toLowerCase();
}

// ListResourceRecordSets orders names with their labels reversed.
function sortKey(name: string): string {
  return `${normalizeName(name).split(".").reverse().join(".")}.`;
}
