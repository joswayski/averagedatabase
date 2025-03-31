import { ArrowLeftCircleIcon } from "@heroicons/react/20/solid";
import { Link, Outlet } from "@remix-run/react";

export default function DocsPage() {
  return (
    <div className="bg-white flex justify-center py-8">
      <div className="flex flex-col">
        <div className="ml-4">
          <Link
            to="/"
            className="top-0 inline-flex items-center gap-x-2 rounded-md px-3.5 py-2.5 text-sm font-semibold border border-zinc-300 text-slate-800 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <ArrowLeftCircleIcon
              className="-ml-0.5 h-5 w-5"
              aria-hidden="true"
            />
            Go back
          </Link>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
