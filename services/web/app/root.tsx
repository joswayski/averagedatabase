import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useActionData,
  useNavigate,
  useRouteError,
} from "@remix-run/react";

// eslint-disable-next-line import/no-unresolved
import stylesheet from "~/tailwind.css?url";
import { LinksFunction } from "@remix-run/node";
import { ArrowLeftCircleIcon } from "@heroicons/react/20/solid";
import { useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useClipboard } from "@mantine/hooks";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const action = async ({ request }) => {
  const body = await request.formData();

  const { _action, ...values } = Object.fromEntries(body);

  try {
    // Random number between 200 and 2000
    const random = Math.floor(Math.random() * 1800) + 200;

    await new Promise((resolve) => setTimeout(resolve, random));
    const key = await axios.post(
      `${process.env.BASE_API_URL || "http://localhost:80"}/api/gibs-key`,
      {}
    );
    return key.data;
  } catch (error) {
    console.error(`error man :/`);
    console.error(error);
    return { error: "sorry bruh we messed up :/" };
  }
};

const ToastContent = ({ apiKey, sponsorMessage }) => {
  const clipboard = useClipboard({ timeout: 3000 });

  return (
    <div className="bg-white rounded-md drop-shadow p-3  flex flex-col  h-full  flex-grow max-w-xl">
      <div className="">
        <div className="text-lg font-bold text-slate-800">
          Your API key has been created!
        </div>
        <p>
          {clipboard.copied ? `Copied! ✅` : "Click to copy ➡️"}
          <button
            className={`ml-4 font-bold text-indigo-600 p-1 border border-slate-200 rounded-md hover:bg-slate-100`}
            onClick={() => {
              clipboard.copy(apiKey);
            }}
          >
            {apiKey}
          </button>

          <Link
            to={{
              pathname: "/docs",
            }}
            className="text-indigo-600 font-semibold hover:underline pl-4"
          >
            View Docs
          </Link>
        </p>
      </div>
      <div className="pt-2 ">
        <p className="text-sm text-slate-400">Sponsor:</p>
        <p className="text-sm text-slate-600 font-semibold">{sponsorMessage}</p>
      </div>
    </div>
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useActionData<any>();

  useEffect(() => {
    if (data?.api_key) {
      toast.custom(
        (t) => (
          <ToastContent
            apiKey={data.api_key}
            sponsorMessage={data.brought_to_you_by}
          />
        ),
        {
          duration: 5000, // Adjust as needed
        }
      );
      return;
    }

    if (data?.error) {
      toast.error(data.error);
    }
  }, [data]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const navigate = useNavigate();

  const error = useRouteError();
  console.error(error);
  return (
    <html lang="en">
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            <p className="text-base font-semibold text-indigo-600">FUCK</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              You broke it.
            </h1>
            <p className="mt-6 text-base leading-7 text-gray-600">
              That&apos;s what we get for using React.. again.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Go home
              </Link>

              <button
                onClick={() => navigate(-1)}
                className="top-0 inline-flex items-center gap-x-2 rounded-md px-3.5 py-2.5 text-sm font-semibold border border-zinc-300 text-slate-800 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <ArrowLeftCircleIcon
                  className="-ml-0.5 h-5 w-5"
                  aria-hidden="true"
                />
                Go Back
              </button>

              {/* <a href="#" className="text-sm font-semibold text-gray-900">
                Contact support <span aria-hidden="true">&rarr;</span>
              </a> */}
            </div>
          </div>
        </main>
        <Scripts />
      </body>
    </html>
  );
}
