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
    Cost: 69,
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
    name: "Redis®*",
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
    Performance: -40,
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
      <div className="  max-w-7xl w-full">
        <h1 className="font-bold text-xl text-center py-4">
          The stats don&apos;t lie.
        </h1>
        <ResponsiveContainer width="100%" height={350}>
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
              stroke="#888888"
              fontSize={18}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />

            <Bar dataKey="Performance" fill="#4f45e4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Cost" fill="#F87315" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
