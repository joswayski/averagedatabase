import handler from "@tanstack/react-start/server-entry";

const INCIDENT_PATH =
  "/status/incident-report-april-1-2026-control-plane-degradation";
const INCIDENT_REDIRECT_URL = "https://www.youtube.com/watch?v=KnVu-qNEcrg";
const BOT_USER_AGENT =
  /Twitterbot|facebookexternalhit|Slackbot|LinkedInBot|Discordbot|WhatsApp|Googlebot|bingbot|Applebot/i;

type WorkerEnv = {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
};

export default {
  async fetch(request: Request, env: WorkerEnv) {
    const url = new URL(request.url);

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
};
