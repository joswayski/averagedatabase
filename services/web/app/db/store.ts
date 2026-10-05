export const RETENTION_SECONDS = 3 * 24 * 60 * 60;
export const MAX_UPLOADS_PER_HOUR = 10;

// Enterprise customers bring their own API keys, so nothing is stored for
// them and they skip the API key check.
export type Caller = { apiKey: string; trusted: boolean };

export type UploadSlot = "ok" | "unauthorized" | "rate_limited";

export interface AverageStore {
  // The largest value, in UTF-8 bytes, that this store accepts.
  readonly maxValueBytes: number;
  // Seconds a new API key or value may take to become readable.
  readonly propagationSeconds: number;

  createApiKey(now: number): Promise<{ apiKey: string; expiresAt: number }>;
  isApiKeyValid(apiKey: string, now: number): Promise<boolean>;
  // Writes check the API key themselves and return null when it is invalid.
  putItem(caller: Caller, value: string, now: number): Promise<string | null>;
  getItem(apiKey: string, itemKey: string, now: number): Promise<string | null>;
  claimUploadSlot(caller: Caller, now: number): Promise<UploadSlot>;
  cleanup(now: number): Promise<void>;
}

// The store is throttled or overloaded; the request may be retried.
export class DatabaseBusyError extends Error {}

// The store has no room for new records until the next cleanup.
export class DatabaseFullError extends Error {}

export function randomHex(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(Math.ceil(length / 2)));
  return toHex(bytes).slice(0, length);
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return toHex(new Uint8Array(digest));
}

export function newItemKey(apiKey: string): string {
  return `${apiKey}:${randomHex(20)}`;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}
