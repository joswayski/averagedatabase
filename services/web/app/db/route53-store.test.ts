import assert from "node:assert/strict";
import { test } from "node:test";
import { LegacyFallbackStore } from "./legacy-fallback-store.ts";
import { MemoryRoute53Zone } from "./memory-route53.ts";
import { MAX_ITEM_BYTES, formatTxtValue } from "./route53-records.ts";
import { Route53Store } from "./route53-store.ts";
import {
  DatabaseFullError,
  MAX_UPLOADS_PER_HOUR,
  RETENTION_SECONDS,
  type AverageStore,
  type Caller,
  type UploadSlot,
} from "./store.ts";

const ZONE = "db.averagedatabase.test";
const NOW = 1_790_000_000;

function setup(recordLimit?: number) {
  const zone = new MemoryRoute53Zone(recordLimit);
  return { zone, store: new Route53Store(ZONE, zone, zone) };
}

function caller(apiKey: string): Caller {
  return { apiKey, trusted: apiKey.startsWith("enterprise-") };
}

test("stores API keys and values as TXT records", async () => {
  const { zone, store } = setup();
  const { apiKey, expiresAt } = await store.createApiKey(NOW);

  assert.match(apiKey, /^avg_[0-9a-f]{32}$/);
  assert.equal(expiresAt, NOW + RETENTION_SECONDS);
  assert.equal(await store.isApiKeyValid(apiKey, NOW), true);

  const value = JSON.stringify({ hello: "world", emoji: "🗄️" });
  const itemKey = await store.putItem(caller(apiKey), value, NOW);
  assert.ok(itemKey?.startsWith(`${apiKey}:`));
  assert.equal(await store.getItem(apiKey, itemKey!, NOW + 1), value);

  // One API key record and one item record, beside the SOA and NS records.
  assert.deepEqual(await zone.getRecordLimit(), { count: 4, limit: 10_000 });
});

test("rejects API keys that do not exist or have expired", async () => {
  const { store } = setup();
  const forged = `avg_${(NOW + 100).toString(16)}${"0".repeat(24)}`;

  assert.equal(await store.isApiKeyValid(forged, NOW), false);
  assert.equal(await store.putItem(caller(forged), "x", NOW), null);
  assert.equal(await store.claimUploadSlot(caller(forged), NOW), "unauthorized");
  assert.equal(await store.isApiKeyValid("avg_not-a-key", NOW), false);

  const { apiKey } = await store.createApiKey(NOW);
  const later = NOW + RETENTION_SECONDS;
  assert.equal(await store.isApiKeyValid(apiKey, later), false);
  assert.equal(await store.putItem(caller(apiKey), "x", later), null);
});

test("lets enterprise keys write without a stored key", async () => {
  const { store } = setup();
  const enterprise = caller("enterprise-Acme Corp. ✨");

  const itemKey = await store.putItem(enterprise, "paid in full", NOW);
  assert.ok(itemKey);
  assert.equal(
    await store.getItem(enterprise.apiKey, itemKey, NOW),
    "paid in full",
  );
  assert.equal(await store.claimUploadSlot(enterprise, NOW), "ok");
});

test("stops returning values once they expire", async () => {
  const { store } = setup();
  const { apiKey } = await store.createApiKey(NOW);
  const itemKey = (await store.putItem(caller(apiKey), "brief", NOW))!;

  assert.equal(await store.getItem(apiKey, itemKey, NOW + RETENTION_SECONDS), null);
  assert.equal(await store.getItem(apiKey, `${apiKey}:../../etc`, NOW), null);
});

test("fits the largest value in one change batch", async () => {
  const { store } = setup();
  const { apiKey } = await store.createApiKey(NOW);
  const value = "é".repeat(MAX_ITEM_BYTES / 2);

  const itemKey = (await store.putItem(caller(apiKey), value, NOW))!;
  assert.equal(await store.getItem(apiKey, itemKey, NOW), value);
});

test("counts uploads per API key per hour, even when they race", async () => {
  const { store } = setup();
  const { apiKey } = await store.createApiKey(NOW);
  const hour = Math.ceil(NOW / 3600) * 3600;

  const racing = await Promise.all([
    store.claimUploadSlot(caller(apiKey), hour),
    store.claimUploadSlot(caller(apiKey), hour),
    store.claimUploadSlot(caller(apiKey), hour),
  ]);
  assert.deepEqual(racing, ["ok", "ok", "ok"]);

  const slots: UploadSlot[] = [];
  for (let upload = 3; upload <= MAX_UPLOADS_PER_HOUR; upload += 1) {
    slots.push(await store.claimUploadSlot(caller(apiKey), hour + 60));
  }
  assert.deepEqual(slots, [
    ...Array(MAX_UPLOADS_PER_HOUR - 3).fill("ok"),
    "rate_limited",
  ]);

  assert.equal(await store.claimUploadSlot(caller(apiKey), hour + 3600), "ok");
});

test("cleanup deletes expired records and leaves everything else", async () => {
  const { zone, store } = setup();
  await zone.changeRecords([
    {
      action: "CREATE",
      record: {
        name: `hello.${ZONE}`,
        ttl: 300,
        values: [formatTxtValue(["e=1"])],
      },
    },
  ]);

  const old = await store.createApiKey(NOW);
  await store.putItem(caller(old.apiKey), "old", NOW);
  await store.claimUploadSlot(caller(old.apiKey), NOW);

  const later = NOW + RETENTION_SECONDS;
  const current = await store.createApiKey(later);
  const itemKey = (await store.putItem(caller(current.apiKey), "new", later))!;

  await store.cleanup(later);

  assert.deepEqual(await zone.getRecordLimit(), { count: 5, limit: 10_000 });
  assert.ok(await zone.getRecord(`hello.${ZONE}`));
  assert.equal(await store.getItem(current.apiKey, itemKey, later), "new");
});

test("cleanup trims the oldest records when the zone is nearly full", async () => {
  const { zone, store } = setup(20);
  const { apiKey } = await store.createApiKey(NOW);
  for (let index = 0; index < 16; index += 1) {
    await store.putItem(caller(apiKey), `value ${index}`, NOW + index);
  }
  assert.equal((await zone.getRecordLimit()).count, 19);

  await store.cleanup(NOW + 16);

  // The three records closest to expiring went, including the API key.
  assert.equal((await zone.getRecordLimit()).count, 16);
  assert.equal(await store.putItem(caller(apiKey), "orphaned", NOW + 17), null);

  const enterprise = caller("enterprise-big");
  for (let index = 0; index < 4; index += 1) {
    await store.putItem(enterprise, `more ${index}`, NOW + 17);
  }
  await assert.rejects(
    store.putItem(enterprise, "one too many", NOW + 17),
    DatabaseFullError,
  );
});

test("falls back to the legacy store for keys and values from before the cutover", async () => {
  const { store } = setup();
  const legacy = new FakeLegacyStore("avg_legacy", "avg_legacy:0123456789abcdef0123");
  const combined = new LegacyFallbackStore(store, legacy);

  assert.equal(combined.maxValueBytes, MAX_ITEM_BYTES);
  assert.equal(await combined.isApiKeyValid("avg_legacy", NOW), true);
  assert.equal(
    await combined.getItem("avg_legacy", "avg_legacy:0123456789abcdef0123", NOW),
    "from D1",
  );

  const itemKey = (await combined.putItem(caller("avg_legacy"), "to Route 53", NOW))!;
  assert.equal(await store.getItem("avg_legacy", itemKey, NOW), "to Route 53");
  assert.equal(await combined.claimUploadSlot(caller("avg_legacy"), NOW), "ok");

  assert.equal(await combined.putItem(caller("avg_unknown"), "nope", NOW), null);
  assert.equal(
    await combined.claimUploadSlot(caller("avg_unknown"), NOW),
    "unauthorized",
  );
});

class FakeLegacyStore implements AverageStore {
  readonly maxValueBytes = 1_000_000;
  readonly propagationSeconds = 0;
  private readonly apiKey: string;
  private readonly itemKey: string;

  constructor(apiKey: string, itemKey: string) {
    this.apiKey = apiKey;
    this.itemKey = itemKey;
  }

  async createApiKey(): Promise<never> {
    throw new Error("The legacy store no longer creates keys");
  }

  async isApiKeyValid(apiKey: string) {
    return apiKey === this.apiKey;
  }

  async putItem(): Promise<never> {
    throw new Error("The legacy store no longer stores values");
  }

  async getItem(apiKey: string, itemKey: string) {
    return apiKey === this.apiKey && itemKey === this.itemKey ? "from D1" : null;
  }

  async claimUploadSlot(): Promise<never> {
    throw new Error("The legacy store no longer counts uploads");
  }

  async cleanup() {}
}
