/// <reference types="vite/client" />

import { createTheme, MantineProvider } from "@mantine/core";
import mantineCss from "@mantine/core/styles.css?url";
import { Notifications } from "@mantine/notifications";
import notificationsCss from "@mantine/notifications/styles.css?url";
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "../app.css?url";

const theme = createTheme({
  cursorType: "pointer",
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Average Database" },
      {
        name: "description",
        content:
          "The world's most performant, secure, scalable, reliable, free-est, open source data platform",
      },
    ],
    links: [
      { rel: "stylesheet", href: mantineCss },
      { rel: "stylesheet", href: notificationsCss },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
      },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  component: RootDocument,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});

function RootDocument() {
  const isStatic404 = useRouterState({
    select: (state) => state.location.pathname === "/404",
  });

  return (
    <RootHtml includeScripts={!isStatic404}>
      <Outlet />
    </RootHtml>
  );
}

function RootHtml({
  children,
  includeScripts,
}: {
  children: ReactNode;
  includeScripts: boolean;
}) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Notifications />
          {children}
        </MantineProvider>
        {includeScripts && <Scripts />}
      </body>
    </html>
  );
}

function NotFoundPage() {
  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
      <Link to="/">Return home →</Link>
    </main>
  );
}

function ErrorPage({ error }: { error: Error }) {
  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>Oops!</h1>
      <p>
        {import.meta.env.DEV
          ? error.message
          : "An unexpected error occurred."}
      </p>
      <Link to="/">Return home →</Link>
      {import.meta.env.DEV && error.stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{error.stack}</code>
        </pre>
      )}
    </main>
  );
}
