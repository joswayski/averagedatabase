import { D1Store } from "./d1-store.ts";
import { AuthoritativeTcpResolver } from "./dns-tcp.ts";
import { LegacyFallbackStore } from "./legacy-fallback-store.ts";
import { MemoryRoute53Zone } from "./memory-route53.ts";
import { Route53ApiClient } from "./route53-client.ts";
import { Route53Store } from "./route53-store.ts";
import type { AverageStore } from "./store.ts";

export {
  DatabaseBusyError,
  DatabaseFullError,
  MAX_UPLOADS_PER_HOUR,
  RETENTION_SECONDS,
  sha256Hex,
  randomHex,
  type AverageStore,
} from "./store.ts";

export type StoreEnv = {
  DB: D1Database;
  ROUTE53_HOSTED_ZONE_ID?: string;
  ROUTE53_ZONE_NAME?: string;
  // Comma-separated, as assigned to the hosted zone.
  ROUTE53_NAME_SERVERS?: string;
  ROUTE53_ACCESS_KEY_ID?: string;
  ROUTE53_SECRET_ACCESS_KEY?: string;
  // "true" stores data in an in-memory zone instead (local development).
  ROUTE53_EMULATOR?: string;
};

const EMULATED_ZONE_NAME = "db.averagedatabase.test";
let emulatedZone: MemoryRoute53Zone | undefined;

// Route 53 serves once every setting is present; set them together (for
// example with `wrangler secret bulk`) to cut over atomically. Until then
// the Worker keeps using D1.
export function createStore(env: StoreEnv): AverageStore {
  const legacy = new D1Store(env.DB);
  const {
    ROUTE53_HOSTED_ZONE_ID: hostedZoneId,
    ROUTE53_ZONE_NAME: zoneName,
    ROUTE53_NAME_SERVERS: nameServers,
    ROUTE53_ACCESS_KEY_ID: accessKeyId,
    ROUTE53_SECRET_ACCESS_KEY: secretAccessKey,
  } = env;

  if (hostedZoneId && zoneName && nameServers && accessKeyId && secretAccessKey) {
    const route53 = new Route53Store(
      zoneName,
      new Route53ApiClient(hostedZoneId, { accessKeyId, secretAccessKey }),
      new AuthoritativeTcpResolver(
        nameServers
          .split(",")
          .map((server) => server.trim())
          .filter(Boolean),
      ),
    );
    return new LegacyFallbackStore(route53, legacy);
  }

  if (import.meta.env.DEV || env.ROUTE53_EMULATOR === "true") {
    emulatedZone ??= new MemoryRoute53Zone();
    return new Route53Store(EMULATED_ZONE_NAME, emulatedZone, emulatedZone);
  }

  if (hostedZoneId || zoneName || nameServers || accessKeyId || secretAccessKey) {
    console.warn("Route 53 is partly configured; still using D1");
  }
  return legacy;
}
