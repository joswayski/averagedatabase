import { Dialog, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { Form, Link, useNavigation } from "@remix-run/react";
import { useState } from "react";

const navigation = [
  { name: "Pricing", href: "#pricing" },
  { name: "Docs", href: "/docs" },
  { name: "Uptime", href: "/uptime", blinking: true },
];

export const Hero = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigation2 = useNavigation();

  const loading = navigation2.state === "submitting";
  return (
    <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-48 ">
      <div className="flex justify-center max-w-8xl ">
        <header className="fixed inset-x-0 top-0 z-50 bg-zinc-50 flex flex-row max-w-8xl ">
          <nav
            className="fixed top-4 left-1/2 -translate-x-1/2
         bg-white shadow-md px-6 py-3
         flex items-center space-x-6
         rounded-xl justify-center"
          >
            <div className="flex items-center space-x-2 flex-shrink-0">
              <img
                className="h-5 sm:h-10 w-auto"
                src="logo-sm.png"
                alt="Average Labs LLC logo"
              />
              {/* <span className="text-xl font-bold">MyApp</span> */}
            </div>

            <ul className="flex items-center space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-sm font-semibold leading-6 text-slate-600"
                >
                  <span>
                    {item.blinking ? (
                      <span className="ml-12 absolute flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="absolute inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    ) : null}
                    <p>{item.name}</p>
                  </span>
                </Link>
              ))}
            </ul>
          </nav>

          <Dialog
            className="lg:hidden"
            open={mobileMenuOpen}
            onClose={setMobileMenuOpen}
          >
            <div className="fixed inset-0 z-50" />
            <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
              <div className="flex items-center justify-between">
                <a
                  href="https://github.com/joswayski/averagedatabase"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="-m-1.5 p-1.5"
                >
                  <span className="sr-only">AverageDB</span>
                  <img
                    className="h-8 w-auto"
                    src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                    alt=""
                  />
                </a>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/25">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-300 hover:bg-gray-800"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  <div className="py-6">
                    <a
                      href="https://github.com/joswayski/averagedatabase"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-slate-300 hover:bg-gray-800"
                    >
                      Log in (coming soon!)
                    </a>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </Dialog>
        </header>
        <Link
          to="/we-rich-lmao"
          className="inline-flex items-center gap-x-2 bg-white border border-gray-200 text-xs text-gray-600 p-2 px-3 rounded-full transition hover:border-gray-300 "
        >
          ✨Announcing our $50m Series A funding round✨
          <span className="flex items-center gap-x-1">
            <span className="border-s border-gray-200 text-blue-600 ps-2 ">
              Become Humbled 🙏
            </span>
            <svg
              className="flex-shrink-0 size-4 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </span>
        </Link>
      </div>

      <div className="mt-5 max-w-xl text-center mx-auto">
        <h1 className="block font-bold text-gray-800 text-4xl md:text-5xl lg:text-6xl ">
          The ultimate database platform
        </h1>
      </div>

      <div className="mt-5 max-w-3xl text-center mx-auto">
        <p className="text-lg text-gray-600 ">
          AverageDB was built from the ground up to meet the needs of the
          average developer
        </p>
      </div>

      <div className="mt-8 gap-3 flex justify-center space-x-20 items-center">
        <a
          className="inline-flex justify-center items-center gap-x-3 text-center bg-white border-2 border-slate-800  text-slate-800 hover:bg-slate-800 hover:text-white text-sm font-medium rounded-full py-3 px-4 "
          href="https://github.com/joswayski/averagedatabase"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            className="flex-shrink-0 size-4"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
          </svg>
          View on GitHub
        </a>
        <Form method="post" action="/">
          <input type="hidden" name="gibs" value="didnt-scroll" />
          <button
            type="submit"
            value={`didnt-scroll`}
            name="_action"
            aria-describedby={"didnt-scroll"}
            className={`${
              loading
                ? "bg-indigo-200 hover:bg-indigo-200 cursor-progress"
                : "hover:bg-indigo-500 bg-indigo-600"
            } text-white shadow-sm  focus-visible:outline-indigo-600  block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 `}
          >
            {loading ? "Creating... (fake delay)" : `Get API Key`}
          </button>
        </Form>
      </div>
    </div>
  );
};
