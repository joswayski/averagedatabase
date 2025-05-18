import '@mantine/core/styles.css';

import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { createTheme, MantineProvider } from '@mantine/core';
import axios from 'axios';

import "./app.css";


const theme = createTheme({
  cursorType: 'pointer',
});


export const links = () => [
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
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
      <MantineProvider theme={theme}>{children}</MantineProvider>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />

}


export const action = async ({ request }: { request: Request }) => {
  const body = await request.formData();

  const { _action, ...values } = Object.fromEntries(body);

  try {
    // Random number between 200 and 2000
    const random = Math.floor(Math.random() * 1800) + 200;

    await new Promise((resolve) => setTimeout(resolve, random));
    const key = await axios.post(
      `${
        process.env.BASE_API_URL || "https://api.averagedatabase.com"
      }/gibs-key`,
      {}
    );
    return key.data;
  } catch (error) {
    console.error(`error man :/`);
    console.error(error);
    console.error(process.env.BASE_API_URL);
    return { error: "sorry bruh we messed up :/" };
  }
};


export function ErrorBoundary({ error }: { error: any }) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
