import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart({
      srcDirectory: "app",
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: true,
        crawlLinks: true,
        failOnError: true,
      },
      pages: [
        {
          path: "/404",
          sitemap: { exclude: true },
          prerender: {
            crawlLinks: false,
            outputPath: "/404.html",
          },
        },
        {
          path: "/status/incident-report-april-1-2026-control-plane-degradation",
          prerender: {
            crawlLinks: false,
            headers: {
              "x-avgdb-prerender": "1",
            },
          },
        },
      ],
    }),
    viteReact(),
    tailwindcss(),
  ],
});
