import { type Database } from "./types";

// Generate random data points with some variance but keeping AvgDB consistently better
const generateDataPoints = (
  baseValue: number,
  variance: number,
  isAvgDB: boolean
) => {
  const dates = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return dates.map((month) => {
    const randomVariance = (Math.random() - 0.5) * variance;
    return {
      date: `${month} 23`,
      value: isAvgDB
        ? baseValue * 0.7 + randomVariance // AvgDB is consistently better
        : baseValue + randomVariance, // Other DBs have higher latency
    };
  });
};

export const databases: Database[] = [
  {
    id: "avgdb",
    name: "AvgDB",
    color: "violet.6",
    description: "The world's most performant database",
  },
  {
    id: "aws-rds",
    name: "AWS RDS",
    color: "orange.6",
    description: "Amazon's traditional relational database service",
  },
  {
    id: "aurora",
    name: "Aurora",
    color: "blue.6",
    description: "AWS's cloud-native database",
  },
  {
    id: "neondb",
    name: "NeonDB",
    color: "green.6",
    description: "Serverless Postgres platform",
  },
  {
    id: "planetscale",
    name: "PlanetScale",
    color: "yellow.6",
    description: "MySQL-compatible serverless platform",
  },
  {
    id: "supabase",
    name: "Supabase",
    color: "grape.6",
    description: "Open source Firebase alternative",
  },
  {
    id: "cockroachdb",
    name: "CockroachDB",
    color: "red.6",
    description: "Distributed SQL database",
  },
  {
    id: "mongodb",
    name: "MongoDB",
    color: "green.8",
    description: "Popular NoSQL database",
  },
];

// Query Latency Data (ms)
export const queryLatencyData = databases.map((db) => ({
  ...db,
  data: generateDataPoints(
    db.id === "avgdb" ? 15 : Math.random() * 30 + 30, // Base latency
    10, // Variance
    db.id === "avgdb"
  ),
}));

// Pricing Data ($ per CPU/hour)
export const pricingData = databases.map((db) => ({
  ...db,
  data: [
    {
      cpu: "1 CPU",
      price: db.id === "avgdb" ? 0.015 : 0.02 + Math.random() * 0.03,
    },
    {
      cpu: "2 CPU",
      price: db.id === "avgdb" ? 0.03 : 0.04 + Math.random() * 0.06,
    },
    {
      cpu: "4 CPU",
      price: db.id === "avgdb" ? 0.06 : 0.08 + Math.random() * 0.12,
    },
    {
      cpu: "8 CPU",
      price: db.id === "avgdb" ? 0.12 : 0.16 + Math.random() * 0.24,
    },
    {
      cpu: "16 CPU",
      price: db.id === "avgdb" ? 0.24 : 0.32 + Math.random() * 0.48,
    },
  ],
}));

// Backup Restoration Data (minutes to restore different data sizes)
export const backupRestorationData = databases.map((db) => ({
  ...db,
  data: [
    {
      size: "100 GB",
      minutes: db.id === "avgdb" ? 3 : 5 + Math.random() * 5,
    },
    {
      size: "500 GB",
      minutes: db.id === "avgdb" ? 12 : 20 + Math.random() * 15,
    },
    {
      size: "1 TB",
      minutes: db.id === "avgdb" ? 22 : 35 + Math.random() * 25,
    },
    {
      size: "5 TB",
      minutes: db.id === "avgdb" ? 95 : 160 + Math.random() * 80,
    },
    {
      size: "10 TB",
      minutes: db.id === "avgdb" ? 180 : 300 + Math.random() * 120,
    },
  ],
}));
