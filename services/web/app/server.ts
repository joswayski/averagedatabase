import handler from "@tanstack/react-start/server-entry";
import { cleanupDatabase, handleApiRequest, type WorkerEnv } from "./api";
import {
  AVATAR_CACHE_TTL_SECONDS,
  AVATAR_PATH_PREFIX,
  findTestimonialByHandle,
  isXTestimonial,
  resolveXAvatarUrl,
} from "./avatar";

const INCIDENT_PATH =
  "/status/incident-report-april-1-2026-control-plane-degradation";
const INCIDENT_REDIRECT_URL = "https://www.youtube.com/watch?v=KnVu-qNEcrg";
const BOT_USER_AGENT =
  /Twitterbot|facebookexternalhit|Slackbot|LinkedInBot|Discordbot|WhatsApp|Googlebot|bingbot|Applebot/i;

type WorkerContext = {
  waitUntil(promise: Promise<unknown>): void;
};

type ScheduledEvent = {
  cron: string;
  scheduledTime: number;
};

type WorkerCacheStorage = CacheStorage & {
  default?: Cache;
};

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: WorkerContext) {
    const url = new URL(request.url);

    if (url.pathname.startsWith(AVATAR_PATH_PREFIX)) {
      return handleAvatarRequest(request, url, ctx);
    }

    if (url.pathname.startsWith("/api/")) {
      return handleApiRequest(request, env, ctx);
    }

    if (url.pathname === INCIDENT_PATH) {
      if (request.headers.get("x-avgdb-prerender") === "1") {
        return handler.fetch(request);
      }

      const userAgent = request.headers.get("user-agent") ?? "";

      if (!BOT_USER_AGENT.test(userAgent)) {
        return new Response(null, {
          status: 302,
          headers: {
            "Cache-Control": "private, no-store",
            Location: INCIDENT_REDIRECT_URL,
            Vary: "User-Agent",
          },
        });
      }

      return env.ASSETS.fetch(request);
    }

    return handler.fetch(request);
  },

  async scheduled(_event: ScheduledEvent, env: WorkerEnv, _ctx: WorkerContext) {
    await cleanupDatabase(env.DB);
  },
};

function avatarCache(): Cache | undefined {
  return (caches as WorkerCacheStorage).default;
}

function avatarCacheKey(origin: string, handle: string): Request {
  return new Request(
    new URL(`${AVATAR_PATH_PREFIX}${handle.toLowerCase()}`, origin),
  );
}

async function handleAvatarRequest(
  request: Request,
  url: URL,
  ctx: WorkerContext,
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("method not allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  }

  const handle = decodeURIComponent(
    url.pathname.slice(AVATAR_PATH_PREFIX.length),
  ).replace(/\/+$/, "");

  if (!handle || handle.includes("/")) {
    return new Response("not found", { status: 404 });
  }

  const testimonial = findTestimonialByHandle(handle);
  if (!testimonial) {
    return new Response("not found", { status: 404 });
  }

  const cache = avatarCache();
  const cacheKey = avatarCacheKey(url.origin, handle);
  const cached = cache ? await cache.match(cacheKey) : undefined;
  if (cached) {
    return cached;
  }

  const location = isXTestimonial(testimonial)
    ? await resolveXAvatarUrl(testimonial.handle, testimonial.imageUrl)
    : testimonial.imageUrl;

  const response = new Response(null, {
    status: 302,
    headers: {
      Location: location,
      "Cache-Control": `public, max-age=${AVATAR_CACHE_TTL_SECONDS}`,
    },
  });

  if (cache) {
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
  }

  return response;
}
