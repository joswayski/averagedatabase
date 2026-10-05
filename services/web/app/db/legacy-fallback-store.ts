import type { AverageStore, Caller, UploadSlot } from "./store.ts";

// Writes go to the new store. Reads that miss fall back to the old one, so
// keys and values created before the cutover keep working until they expire
// (three days), after which the old store can be removed.
export class LegacyFallbackStore implements AverageStore {
  private readonly primary: AverageStore;
  private readonly legacy: AverageStore;

  constructor(primary: AverageStore, legacy: AverageStore) {
    this.primary = primary;
    this.legacy = legacy;
  }

  get maxValueBytes(): number {
    return this.primary.maxValueBytes;
  }

  get propagationSeconds(): number {
    return this.primary.propagationSeconds;
  }

  createApiKey(now: number) {
    return this.primary.createApiKey(now);
  }

  async isApiKeyValid(apiKey: string, now: number): Promise<boolean> {
    return (
      (await this.primary.isApiKeyValid(apiKey, now)) ||
      this.legacy.isApiKeyValid(apiKey, now)
    );
  }

  async putItem(
    caller: Caller,
    value: string,
    now: number,
  ): Promise<string | null> {
    const itemKey = await this.primary.putItem(caller, value, now);
    if (itemKey !== null || !(await this.isLegacyKey(caller, now))) {
      return itemKey;
    }
    return this.primary.putItem({ ...caller, trusted: true }, value, now);
  }

  async getItem(
    apiKey: string,
    itemKey: string,
    now: number,
  ): Promise<string | null> {
    return (
      (await this.primary.getItem(apiKey, itemKey, now)) ??
      this.legacy.getItem(apiKey, itemKey, now)
    );
  }

  async claimUploadSlot(caller: Caller, now: number): Promise<UploadSlot> {
    const slot = await this.primary.claimUploadSlot(caller, now);
    if (slot !== "unauthorized" || !(await this.isLegacyKey(caller, now))) {
      return slot;
    }
    return this.primary.claimUploadSlot({ ...caller, trusted: true }, now);
  }

  async cleanup(now: number): Promise<void> {
    await this.primary.cleanup(now);
    await this.legacy.cleanup(now);
  }

  private async isLegacyKey(caller: Caller, now: number): Promise<boolean> {
    return !caller.trusted && this.legacy.isApiKeyValid(caller.apiKey, now);
  }
}
