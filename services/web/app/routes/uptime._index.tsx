import { getPercentageOf } from "~/utils/getPct";
import { getRandomNumber } from "~/utils/randomNumber";

const users = getRandomNumber(8000, 100000);
const freeTier = getPercentageOf(90, users);

const stats = [
  {
    id: 1,
    name: "Happy Users",
    value: users,
    color: "",
  },
  { id: 2, name: "Outages. Ever.", value: "0" },
  { id: 3, name: "Uptime guarantee", value: "99.99999%" },
  { id: 4, name: "Paid out to creators", value: "$70M" },
];

export default function Uptime() {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 border border-blue-500 mt-40">
      <div className="mx-auto max-w-2xl lg:max-w-none">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Schrodinger&apos;s Uptime
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            If we don&apos;t update the status page is because we&apos;re so
            busy making sure everything is always up and running :)
          </p>
        </div>
        <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="flex flex-col bg-gray-400/5 p-8">
              <dt className="text-sm font-semibold leading-6 text-gray-600">
                {stat.name}
              </dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString()
                  : stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
