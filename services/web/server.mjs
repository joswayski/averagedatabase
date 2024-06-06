// Commented this out due to recent vite changes dont care enough to revert right now

// import dotenv from "dotenv";
// dotenv.config();
// import { remix } from "remix-hono/handler";
// import { broadcastDevReady } from "@remix-run/node";
// import { Hono } from "hono";
// import { serve } from "@hono/node-server";
// import * as build from "./build/server";
// import { serveStatic } from "@hono/node-server/serve-static";

// const app = new Hono();

// app.get("/api/health", (c) => c.json({ message: "Saul Goodman" }));
// app.get("/health", (c) => c.json({ message: "Saul Goodman" }));

// app.use("/build/*", serveStatic({ root: "public" }));

// const gracefulShutdown = async () => {
//   console.log("Closing server gracefully.", new Date().toISOString());
//   server.close(() => {
//     console.log("HTTP server closed.", new Date().toISOString());
//   });

//   // Wait for existing connections to close
//   await new Promise((resolve) => setTimeout(resolve, 8000));
//   console.log(
//     "Finished all requests, shutting down.",
//     new Date().toISOString()
//   );
//   process.exit(0);
// };

// app.use("*", remix({ build, mode: "production" }));

// const server = serve(app, () => {
//   // eslint-disable-next-line no-undef
//   if (process.env.NODE_ENV === "development") {
//     broadcastDevReady(build);
//   }
//   console.log("Server is running on http://localhost:3000");
// });
// process.on("SIGTERM", gracefulShutdown);
// process.on("SIGINT", gracefulShutdown);

import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import express from "express";

installGlobals();

const viteDevServer =
  // @ts-expect-error asdas
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

const app = express();

// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  app.use(
    "/assets",
    express.static("build/client/assets", {
      immutable: true,
      maxAge: "1y",
    })
  );
}
app.use(express.static("build/client", { maxAge: "1h" }));

app.get("/api/health", (req, res) => {
  res.json({ message: "Saul Goodman" });
  return;
});

app.get("/health", (req, res) => {
  res.json({ message: "Saul Goodman" });
  return;
});
// handle SSR requests
app.all(
  "*",
  createRequestHandler({
    build: viteDevServer
      ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
      : await import("./build/server/index.js"),
  })
);

const port = 3000;
app.listen(port, () => console.log("http://localhost:" + port));
