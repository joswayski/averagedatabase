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
    // Increase spread for non-AvgDB, keep AvgDB fastest
    const extraSpread = isAvgDB ? 0 : Math.random() * 15 + 5; // 5-20ms extra for non-AvgDB
    const randomVariance = (Math.random() - 0.5) * variance * (isAvgDB ? 1 : 2); // double variance for non-AvgDB
    let value = isAvgDB
      ? baseValue * 0.7 + randomVariance
      : baseValue + randomVariance + extraSpread;
    value = Math.round(value * 100) / 100; // Two decimals
    return {
      date: `${month} 23`,
      value,
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
    name: "AWS Aurora",
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
    id: "turso",
    name: "Turso",
    color: "cyan.6",
    description: "Edge-hosted SQLite platform",
  },
];

// Query Latency Data (ms)
export const queryLatencyData = databases.map((db) => {
  let baseValue;
  let variance;
  if (db.id === "avgdb") {
    baseValue = 15;
    variance = 10;
  } else if (db.id === "planetscale") {
    baseValue = 40; // 2nd best, a little faster
    variance = 40;
  } else {
    baseValue = 90 + Math.random() * 60; // 90-150ms for others
    variance = 60; // much larger spread
  }
  return {
    ...db,
    data: generateDataPoints(baseValue, variance, db.id === "avgdb"),
  };
});

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
