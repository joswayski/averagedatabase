const legitData = [
  {
    name: "30d",
    stat: "100%",
    changeType: "same",
  },
  {
    name: "90d",
    stat: "100%",
    changeType: "same",
  },
  {
    name: "All Time",
    stat: "100%",
    changeType: "same",
  },
];

const stats = [
  {
    title: "API",
  },
  {
    title: "Database",
  },
  {
    title: "Backups",
  },
  {
    title: "Dashboard",
  },
  {
    title: "Team Morale",
  },
];

export default function Uptime() {
  return (
    <div className="flex flex-col space-y-6 p-12 border border-blue-500 w-full max-w-4xl ">
      <div className=" border border-indigo-700 rounded-md">
        <div className="bg-indigo-500 rounded-t-md p-4 text-white">
          <h1 className="text-3xl font-bold text-white">
            We are fully operational!
          </h1>
        </div>
        <div className="p-4">
          <p className="text-slate-700">
            We are not aware of any issues affecting our systems. Ping us on
            Twitter if something goes down.
          </p>
        </div>
      </div>

      <div>
        {stats.map((stat) => (
          <div key={stat.title}>
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              {stat.title}
            </h3>
            <dl className="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow md:grid-cols-3 md:divide-x md:divide-y-0">
              {legitData.map((item) => (
                <div key={item.name} className="px-4 py-5 sm:p-6">
                  <dt className="text-base font-normal text-gray-900">
                    {item.name}
                  </dt>
                  <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                    <div className="flex items-baseline text-2xl font-semibold text-indigo-600">
                      {item.stat}
                    </div>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
