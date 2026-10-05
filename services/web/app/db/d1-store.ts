import {
  MAX_UPLOADS_PER_HOUR,
  RETENTION_SECONDS,
  newItemKey,
  type AverageStore,
  type Caller,
  type UploadSlot,
} from "./store.ts";

const MAX_VALUE_BYTES = 1_000_000;
const DATABASE_HIGH_WATER_BYTES = 5 * 1024 * 1024 * 1024;
const CLEANUP_BATCH_SIZE = 1_000;
const MAX_CLEANUP_BATCHES = 20;

// The pre-Route 53 store. It serves until the Route 53 settings are present,
// then only answers for keys and values created before the cutover.
export class D1Store implements AverageStore {
  readonly maxValueBytes = MAX_VALUE_BYTES;
  readonly propagationSeconds = 0;
  private readonly db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async createApiKey(now: number) {
    const apiKey = `avg_${crypto.randomUUID().replaceAll("-", "")}`;
    const expiresAt = now + RETENTION_SECONDS;

    await this.db
      .prepare(
        `INSERT INTO api_keys (api_key, created_at, expires_at)
         VALUES (?, ?, ?)`,
      )
      .bind(apiKey, now, expiresAt)
      .run();

    return { apiKey, expiresAt };
  }

  async isApiKeyValid(apiKey: string, now: number): Promise<boolean> {
    const row = await this.db
      .prepare(
        "SELECT api_key FROM api_keys WHERE api_key = ? AND expires_at > ?",
      )
      .bind(apiKey, now)
      .first<{ api_key: string }>();

    return row !== null;
  }

  async putItem(
    caller: Caller,
    value: string,
    now: number,
  ): Promise<string | null> {
    if (!caller.trusted && !(await this.isApiKeyValid(caller.apiKey, now))) {
      return null;
    }

    const itemKey = newItemKey(caller.apiKey);
    await this.db
      .prepare(
        `INSERT INTO items
          (item_key, api_key, value, size_bytes, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        itemKey,
        caller.apiKey,
        value,
        new TextEncoder().encode(value).byteLength,
        now,
        now + RETENTION_SECONDS,
      )
      .run();

    return itemKey;
  }

  async getItem(
    apiKey: string,
    itemKey: string,
    now: number,
  ): Promise<string | null> {
    const item = await this.db
      .prepare(
        `SELECT value
         FROM items
         WHERE item_key = ? AND api_key = ? AND expires_at > ?`,
      )
      .bind(itemKey, apiKey, now)
      .first<{ value: string }>();

    return item?.value ?? null;
  }

  async claimUploadSlot(caller: Caller, now: number): Promise<UploadSlot> {
    if (!caller.trusted && !(await this.isApiKeyValid(caller.apiKey, now))) {
      return "unauthorized";
    }

    const windowStart = Math.floor(now / 3600) * 3600;
    const row = await this.db
      .prepare(
        `INSERT INTO upload_limits (api_key, window_start, count)
         VALUES (?, ?, 1)
         ON CONFLICT (api_key, window_start)
         DO UPDATE SET count = count + 1
         RETURNING count`,
      )
      .bind(caller.apiKey, windowStart)
      .first<{ count: number }>();

    return Number(row?.count ?? 1) > MAX_UPLOADS_PER_HOUR
      ? "rate_limited"
      : "ok";
  }

  async cleanup(now: number): Promise<void> {
    await this.deleteInBatches("items", "item_key", "expires_at <= ?", now);
    await this.deleteInBatches("api_keys", "api_key", "expires_at <= ?", now);
    await this.deleteUploadLimitsInBatches(now - 2 * 60 * 60);

    const sizeProbe = await this.db.prepare("SELECT 1").run();
    let databaseBytes = Number(sizeProbe.meta.size_after ?? 0);

    for (
      let batch = 0;
      databaseBytes > DATABASE_HIGH_WATER_BYTES && batch < MAX_CLEANUP_BATCHES;
      batch += 1
    ) {
      const result = await this.db
        .prepare(
          `DELETE FROM items
           WHERE item_key IN (
             SELECT item_key
             FROM items
             ORDER BY created_at ASC
             LIMIT ?
           )`,
        )
        .bind(CLEANUP_BATCH_SIZE)
        .run();

      if (Number(result.meta.changes ?? 0) === 0) {
        break;
      }

      databaseBytes = Number(result.meta.size_after ?? databaseBytes);
    }
  }

  private async deleteInBatches(
    table: "api_keys" | "items",
    keyColumn: "api_key" | "item_key",
    predicate: string,
    value: number,
  ): Promise<void> {
    for (let batch = 0; batch < MAX_CLEANUP_BATCHES; batch += 1) {
      const result = await this.db
        .prepare(
          `DELETE FROM ${table}
           WHERE ${keyColumn} IN (
             SELECT ${keyColumn}
             FROM ${table}
             WHERE ${predicate}
             LIMIT ?
           )`,
        )
        .bind(value, CLEANUP_BATCH_SIZE)
        .run();

      if (Number(result.meta.changes ?? 0) < CLEANUP_BATCH_SIZE) {
        break;
      }
    }
  }

  private async deleteUploadLimitsInBatches(before: number): Promise<void> {
    for (let batch = 0; batch < MAX_CLEANUP_BATCHES; batch += 1) {
      const result = await this.db
        .prepare(
          `DELETE FROM upload_limits
           WHERE (api_key, window_start) IN (
             SELECT api_key, window_start
             FROM upload_limits
             WHERE window_start < ?
             LIMIT ?
           )`,
        )
        .bind(before, CLEANUP_BATCH_SIZE)
        .run();

      if (Number(result.meta.changes ?? 0) < CLEANUP_BATCH_SIZE) {
        break;
      }
    }
  }
}
