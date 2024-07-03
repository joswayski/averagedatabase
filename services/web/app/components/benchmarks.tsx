import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
} from "recharts";

const data = [
  {
    name: "AverageDB",
    Performance: 100,
    Cost: 1,
  },
  {
    name: "SingleStore",
    Performance: 2,
    Cost: 64,
  },
  {
    name: "Vercel Postgres",
    Performance: 2,
    Cost: 70,
  },
  {
    name: "Upstash",
    Performance: 2,
    Cost: 60,
  },
  {
    name: "AWS RDS",
    Performance: 2,
    Cost: 30,
  },
  {
    name: "CockroachDB",
    Performance: 2,
    Cost: 58,
  },
  {
    name: "Squeal Light",
    Performance: 2,
    Cost: 10,
  },
  {
    name: "MongoDB",
    Performance: 2,
    Cost: 45,
  },
  {
    name: "Redis®",
    Performance: 2,
    Cost: 40,
  },

  {
    name: "Route53",
    Performance: 30,
    Cost: 25,
  },
  {
    name: "Yugabyte",
    Performance: 2,
    Cost: 50,
  },
  {
    name: "Oracle",
    Performance: -20,
    Cost: 100,
  },
  {
    name: "Planetscale",
    Performance: 2,
    Cost: 60,
  },
  {
    name: "Supabase",
    Performance: 2,
    Cost: 35,
  },
];

export function BarCharts() {
  return (
    <div className="w-full flex justify-center items-center ">
      <div className="  max-w-7xl w-full ">
        <h1 className="font-bold text-xl text-center py-4">
          The numbers don&apos;t lie.
        </h1>
        <div className="lg:flex hidden justify-center">
          <img src="horizontal.png" height={1000} width={1000} alt="boop"></img>
          {/* <ResponsiveContainer width="99%" aspect={4}>
            <BarChart data={data}>
              <Legend z={"Higher is better"} />
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="Performance"
                stroke="#888888"
                fontSize={18}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip />

              <Bar dataKey="Performance" fill="#4f45e4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Cost" fill="#F87315" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer> */}
        </div>

        <div className="lg:hidden  flex justify-center w-full">
          <img src="vertical.png" height={800} width={800} alt="beep"></img>

          {/* <ResponsiveContainer width={"99%"} aspect={1}>
            <BarChart
              data={data}
              layout="vertical"
              className="overflow-visible "
            >
              <Legend z={"Higher is better"} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                className=""
              />
              <XAxis
                type="number"
                stroke="#888888"
                fontSize={18}
                tickLine={false}
                axisLine={false}
              />
              <XAxis type="number" />
              <YAxis type="category" />
              <Tooltip />

              <Bar dataKey="Performance" fill="#4f45e4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Cost" fill="#F87315" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer> */}
        </div>
      </div>
    </div>
  );
}
