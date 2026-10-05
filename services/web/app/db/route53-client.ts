import { AwsClient } from "aws4fetch";
import { DatabaseBusyError } from "./store.ts";
import {
  ChangeRejectedError,
  type ListCursor,
  type RecordChange,
  type Route53ControlPlane,
  type TxtRecordSet,
} from "./route53-store.ts";

const ROUTE53_ENDPOINT = "https://route53.amazonaws.com/2013-04-01";
const ROUTE53_NAMESPACE = "https://route53.amazonaws.com/doc/2013-04-01/";
const MAX_ATTEMPTS = 4;
const RETRYABLE_CODES = new Set([
  "Throttling",
  "ThrottlingException",
  "PriorRequestNotComplete",
  "ServiceUnavailable",
]);

export type Route53Credentials = {
  accessKeyId: string;
  secretAccessKey: string;
};

// The Route 53 control plane: every write, plus the few reads that must see
// writes immediately. It lives in us-east-1, is throttled per AWS account
// (about ten requests and a hundred record changes per second), and is not
// part of the 100% SLA.
export class Route53ApiClient implements Route53ControlPlane {
  private readonly aws: AwsClient;
  private readonly zonePath: string;
  private readonly zoneId: string;

  constructor(hostedZoneId: string, credentials: Route53Credentials) {
    this.zoneId = hostedZoneId.replace(/^\/?hostedzone\//, "");
    this.zonePath = `${ROUTE53_ENDPOINT}/hostedzone/${encodeURIComponent(this.zoneId)}`;
    this.aws = new AwsClient({
      ...credentials,
      service: "route53",
      region: "us-east-1",
      retries: 0,
    });
  }

  async changeRecords(changes: RecordChange[]): Promise<void> {
    await this.request(`${this.zonePath}/rrset/`, {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: changeBatchXml(changes),
    });
  }

  async getRecord(name: string): Promise<TxtRecordSet | null> {
    const { records } = await this.listRecords({ name, type: "TXT" }, 1);
    const record = records[0];
    return record && sameName(record.name, name) ? record : null;
  }

  async listRecords(
    cursor?: ListCursor,
    maxItems = 300,
  ): Promise<{ records: TxtRecordSet[]; next: ListCursor | null }> {
    const params = new URLSearchParams({ maxitems: String(maxItems) });
    if (cursor) {
      params.set("name", cursor.name);
      params.set("type", cursor.type);
    }

    const xml = await this.request(`${this.zonePath}/rrset?${params}`, {
      method: "GET",
    });
    return parseRecordSets(xml);
  }

  async getRecordLimit(): Promise<{ count: number; limit: number }> {
    const xml = await this.request(
      `${ROUTE53_ENDPOINT}/hostedzonelimit/${encodeURIComponent(this.zoneId)}/MAX_RRSETS_BY_ZONE`,
      { method: "GET" },
    );
    return {
      count: Number(firstTag(xml, "Count") ?? Number.NaN),
      limit: Number(firstTag(firstTag(xml, "Limit") ?? "", "Value") ?? Number.NaN),
    };
  }

  private async request(url: string, init: RequestInit): Promise<string> {
    for (let attempt = 1; ; attempt += 1) {
      const response = await this.aws.fetch(url, init);
      const body = await response.text();
      if (response.ok) {
        return body;
      }

      const code = firstTag(body, "Code") ?? "";
      if (body.includes("<InvalidChangeBatch") || code === "InvalidChangeBatch") {
        throw new ChangeRejectedError(
          allTags(body, "Message").map(decodeXml).join("; ") || body,
        );
      }

      const retryable =
        RETRYABLE_CODES.has(code) ||
        response.status === 429 ||
        response.status >= 500;
      if (retryable && attempt < MAX_ATTEMPTS) {
        await sleep(2 ** attempt * 100 + Math.random() * 100);
        continue;
      }
      if (retryable) {
        throw new DatabaseBusyError(`Route 53 is busy: ${code || response.status}`);
      }

      const message = decodeXml(firstTag(body, "Message") ?? body);
      throw new Error(`Route 53 ${code || response.status}: ${message}`);
    }
  }
}

export function changeBatchXml(changes: RecordChange[]): string {
  const changeXml = changes
    .map(
      ({ action, record }) =>
        `<Change><Action>${action}</Action><ResourceRecordSet>` +
        `<Name>${escapeXml(record.name)}</Name><Type>TXT</Type>` +
        `<TTL>${record.ttl}</TTL><ResourceRecords>` +
        record.values
          .map(
            (value) =>
              `<ResourceRecord><Value>${escapeXml(value)}</Value></ResourceRecord>`,
          )
          .join("") +
        `</ResourceRecords></ResourceRecordSet></Change>`,
    )
    .join("");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<ChangeResourceRecordSetsRequest xmlns="${ROUTE53_NAMESPACE}">` +
    `<ChangeBatch><Changes>${changeXml}</Changes></ChangeBatch>` +
    `</ChangeResourceRecordSetsRequest>`
  );
}

export function parseRecordSets(xml: string): {
  records: TxtRecordSet[];
  next: ListCursor | null;
} {
  const records = allTags(xml, "ResourceRecordSet")
    .filter((recordXml) => firstTag(recordXml, "Type") === "TXT")
    .map((recordXml) => ({
      name: decodeXml(firstTag(recordXml, "Name") ?? ""),
      ttl: Number(firstTag(recordXml, "TTL") ?? 0),
      values: allTags(recordXml, "Value").map(decodeXml),
    }));

  const truncated = firstTag(xml, "IsTruncated") === "true";
  const nextName = firstTag(xml, "NextRecordName");
  const nextType = firstTag(xml, "NextRecordType");
  return {
    records,
    next:
      truncated && nextName && nextType
        ? { name: decodeXml(nextName), type: nextType }
        : null,
  };
}

// Route 53 responses have a small, fixed shape, so a tag scanner is enough.
function allTags(xml: string, tag: string): string[] {
  const pattern = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "g");
  return Array.from(xml.matchAll(pattern), (match) => match[1]);
}

function firstTag(xml: string, tag: string): string | undefined {
  return allTags(xml, tag)[0];
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function decodeXml(value: string): string {
  return value.replace(
    /&(?:#(\d+)|#x([0-9a-f]+)|(lt|gt|amp|quot|apos));/gi,
    (_, decimal: string, hex: string, named: string) => {
      if (decimal) return String.fromCodePoint(Number(decimal));
      if (hex) return String.fromCodePoint(parseInt(hex, 16));
      return { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" }[
        named.toLowerCase() as "lt" | "gt" | "amp" | "quot" | "apos"
      ];
    },
  );
}

function sameName(left: string, right: string): boolean {
  const normalize = (name: string) => name.replace(/\.$/, "").toLowerCase();
  return normalize(left) === normalize(right);
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
