const logos = [
  {
    file: "meta-logo.png",
    width: 105,
    height: 48,
    className: "max-h-12 w-full object-contain object-left",
  },
  {
    file: "apple-logo.png",
    width: 105,
    height: 48,
    className: "max-h-12 w-full object-contain object-left",
  },
  {
    file: "amazon-logo.png",
    width: 105,
    height: 48,
    className: "max-h-12 w-full object-contain object-left",
  },
  {
    file: "google-logo.png",
    width: 105,
    height: 48,
    className: "max-h-12 w-full object-contain object-left",
  },
  {
    file: "microsoft-logo.png",
    width: 105,
    height: 48,
    className: "max-h-12 w-full object-contain object-left",
  },
  {
    file: "nvidia-logo.png",
    width: 105,
    height: 48,
    className: "max-h-12 w-full object-contain object-left",
  },
];

export default function Logos() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-x-2 gap-y-16 lg:grid-cols-2 ">
          <div className="mx-auto w-full max-w-xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Trusted by the most innovative teams
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Developers from these companies have IPs that show up in our logs
              that when traced back on a GeoIP lookup resolve to that
              company&apos;s headquarters
            </p>
            {/* <div className="mt-8 flex items-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Create account
              </a>
              <a href="#" className="text-sm font-semibold text-gray-900">
                Contact us <span aria-hidden="true">&rarr;</span>
              </a>
            </div> */}
          </div>
          <div className="grid grid-cols-3 grid-rows-2 gap-10 place-content-center  justify-items-center">
            {logos.map((logo) => (
              <div className=" flex justify-items-center" key={logo.file}>
                <img
                  className={logo.className}
                  src={logo.file}
                  alt="Tuple"
                  width={logo.width}
                  height={logo.height}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
