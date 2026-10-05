// How AverageDB data is laid out in TXT records, within Route 53's limits.
//
// A TXT record set holds several values. Each value is one or more quoted
// character-strings of at most 255 bytes. Route 53 accepts at most 4,000
// characters per value and 32,000 characters across every value in one
// ChangeResourceRecordSets request.

export const MAX_STRING_BYTES = 255;
export const MAX_VALUE_CHARS = 4_000;
export const MAX_REQUEST_VALUE_CHARS = 32_000;
export const MAX_REQUEST_RECORDS = 1_000;

// Each item is written in a single request alongside the two API key
// records that guard it, so it must fit comfortably inside one request.
export const MAX_ITEM_BYTES = 20_000;

const STRINGS_PER_CHUNK = 15;
const META_MARKER = "m";

export type ItemMeta = {
  createdAt: number;
  expiresAt: number;
  sizeBytes: number;
};

// Values are base64 so arbitrary UTF-8 never needs Route 53 escaping. The
// order of values in a record set is not preserved, so every chunk starts
// with its index and a separate value carries the metadata.
export function encodeItemValues(value: string, meta: ItemMeta): string[] {
  const base64 = toBase64(new TextEncoder().encode(value));
  const strings = splitEvery(base64, MAX_STRING_BYTES);
  const chunks: string[] = [];

  for (let index = 0; index * STRINGS_PER_CHUNK < strings.length; index += 1) {
    const chunk = strings.slice(
      index * STRINGS_PER_CHUNK,
      (index + 1) * STRINGS_PER_CHUNK,
    );
    chunks.push(formatTxtValue([String(index), ...chunk]));
  }

  return [
    formatTxtValue([
      META_MARKER,
      `c=${meta.createdAt}`,
      `e=${meta.expiresAt}`,
      `b=${meta.sizeBytes}`,
      `n=${chunks.length}`,
    ]),
    ...chunks,
  ];
}

// Takes the character-strings of every TXT record in the set, as DNS
// returns them, and reassembles the value. Returns null for anything that
// is not a complete item.
export function decodeItem(
  records: string[][],
): { meta: ItemMeta; value: string } | null {
  const metaRecord = records.find((strings) => strings[0] === META_MARKER);
  if (!metaRecord) {
    return null;
  }

  const fields = readFields(metaRecord.slice(1));
  const chunkCount = fields.get("n");
  const meta = {
    createdAt: fields.get("c"),
    expiresAt: fields.get("e"),
    sizeBytes: fields.get("b"),
  };
  if (
    chunkCount === undefined ||
    meta.createdAt === undefined ||
    meta.expiresAt === undefined ||
    meta.sizeBytes === undefined
  ) {
    return null;
  }

  const chunks = new Map<number, string>();
  for (const [index, ...strings] of records) {
    if (/^\d+$/.test(index)) {
      chunks.set(Number(index), strings.join(""));
    }
  }

  let base64 = "";
  for (let index = 0; index < chunkCount; index += 1) {
    const chunk = chunks.get(index);
    if (chunk === undefined) {
      return null;
    }
    base64 += chunk;
  }

  const bytes = fromBase64(base64);
  if (bytes.byteLength !== meta.sizeBytes) {
    return null;
  }
  return {
    meta: meta as ItemMeta,
    value: new TextDecoder().decode(bytes),
  };
}

// Reads "name=number" fields from character-strings.
export function readFields(strings: string[]): Map<string, number> {
  const fields = new Map<string, number>();
  for (const field of strings) {
    const match = /^([a-z])=(\d+)$/.exec(field);
    if (match) {
      fields.set(match[1], Number(match[2]));
    }
  }
  return fields;
}

// Route 53 presentation format: each string quoted, separated by spaces,
// with \" and \\ escapes and \ooo octal codes for unprintable bytes.
export function formatTxtValue(strings: string[]): string {
  return strings
    .map((string) => `"${string.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`)
    .join(" ");
}

export function parseTxtValue(value: string): string[] {
  const strings: string[] = [];
  const pattern = /"((?:[^"\\]|\\.)*)"|(\S+)/g;
  for (const match of value.matchAll(pattern)) {
    const raw = match[1] ?? match[2];
    strings.push(
      raw.replace(/\\([0-7]{3}|.)/g, (_, escaped: string) =>
        escaped.length === 3
          ? String.fromCharCode(parseInt(escaped, 8))
          : escaped,
      ),
    );
  }
  return strings;
}

function splitEvery(value: string, size: number): string[] {
  const parts: string[] = [];
  for (let offset = 0; offset < value.length; offset += size) {
    parts.push(value.slice(offset, offset + size));
  }
  return parts;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

function fromBase64(base64: string): Uint8Array {
  try {
    return Uint8Array.from(atob(base64), (character) =>
      character.charCodeAt(0),
    );
  } catch {
    return new Uint8Array(0);
  }
}
