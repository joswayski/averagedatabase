import { createFileRoute } from "@tanstack/react-router";

const API_KEY_ENDPOINT = "https://api.averagedatabase.com/gibs-key";

export const Route = createFileRoute("/api/gibs-key")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const upstreamResponse = await fetch(API_KEY_ENDPOINT, {
            method: "POST",
            headers: {
              Accept: "application/json",
            },
          });
          const headers = new Headers(upstreamResponse.headers);
          headers.set("Cache-Control", "no-store");

          return new Response(upstreamResponse.body, {
            status: upstreamResponse.status,
            statusText: upstreamResponse.statusText,
            headers,
          });
        } catch (error) {
          console.error("Failed to request an Average Database API key", error);

          return Response.json(
            { error: "sorry bruh we messed up :/" },
            {
              status: 502,
              headers: { "Cache-Control": "no-store" },
            },
          );
        }
      },
    },
  },
});
