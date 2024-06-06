import { getPercentageOf } from "~/utils/getPct";
import { getRandomNumber } from "~/utils/randomNumber";

import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/20/solid";

const;
const legitData = [
  {
    name: "Uptime 30d",
    stat: "100%",
    changeType: "same",
  },
  {
    name: "Uptime 90d",
    stat: "100%",
    changeType: "same",
  },
  {
    name: "Uptime All Time",
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
    title: "Team Morale",
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Uptime() {
  return (
    <div className="flex flex-col space-y-6 p-12">
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
                  <div className="flex items-baseline text-2xl font-semibold text-emerald-600">
                    {item.stat}
                  </div>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
