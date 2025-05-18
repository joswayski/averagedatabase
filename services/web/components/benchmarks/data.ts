import { type Database } from "./types";

// Generate random data points with some variance but keeping AvgDB consistently better
const generateDataPoints = (
  baseValue: number,
  variance: number,
  isAvgDB: boolean
) => {
  const dates = [
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
    "Twenty",
    "TwentyOne",
    "TwentyTwo",
    "TwentyThree",
    "TwentyFour",
    "TwentyFive",
    "TwentySix",
    "TwentySeven",
    "TwentyEight",
    "TwentyNine",
    "Thirty",
    "ThirtyOne",
    "ThirtyTwo",
    "ThirtyThree",
    "ThirtyFour",
    "ThirtyFive",
    "ThirtySix",
    "ThirtySeven",
    "ThirtyEight",
  ];
  return dates.map((day) => {
    // Increase spread for non-AvgDB, keep AvgDB fastest
    const extraSpread = isAvgDB ? 0 : Math.random() * 15 + 5; // 5-20ms extra for non-AvgDB
    const randomVariance = (Math.random() - 0.5) * variance * (isAvgDB ? 1 : 2); // double variance for non-AvgDB
    let value = isAvgDB
      ? baseValue * 0.7 + randomVariance
      : baseValue + randomVariance + extraSpread;
    value = Math.round(value * 100) / 100; // Two decimals
    return {
      date: ``,
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
    color: "red.4",
    description: "Amazon's traditional relational database service",
  },
  {
    id: "aurora",
    name: "AWS Aurora",
    color: "gray.6",
    description: "AWS's cloud-native database",
  },
  {
    id: "neondb",
    name: "NeonDB",
    color: "green.3",
    description: "Serverless Postgres platform",
  },
  {
    id: "planetscale",
    name: "PlanetScale",
    color: "orange.6",
    description: "MySQL-compatible serverless platform",
  },
  {
    id: "supabase",
    name: "Supabase",
    color: "teal.8",
    description: "Open source Firebase alternative",
  },
  {
    id: "cockroachdb",
    name: "CockroachDB",
    color: "violet.6",
    description: "Distributed SQL database",
  },
  {
    id: "turso",
    name: "Turso",
    color: "cyan.3",
    description: "Edge-hosted SQLite platform",
  },
];

export const queryLatencyData = databases.map((db) => {
  let baseValue;
  let variance;
  if (db.id === "avgdb") {
    baseValue = 7;
    variance = 6;
  } else if (db.id === "planetscale") {
    baseValue = 40; // 2nd best, a little faster
    variance = 20;
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
export const backupRestorationData = databases.map((db) => {
  let data;
  if (db.id === "avgdb") {
    data = [
      { size: "500 GB", minutes: 0 },
      { size: "1 TB", minutes: 0 },
      { size: "10 TB", minutes: 0 },
      { size: "100 TB", minutes: 0 },
    ];
  } else if (db.id === "planetscale") {
    data = [
      { size: "500 GB", minutes: 20 + Math.random() * 10 },
      { size: "1 TB", minutes: 30 + Math.random() * 20 },
      { size: "10 TB", minutes: 60 + Math.random() * 40 },
      { size: "100 TB", minutes: 120 + Math.random() * 60 },
    ];
  } else {
    data = [
      { size: "500 GB", minutes: 50 + Math.random() * 30 },
      { size: "1 TB", minutes: 110 + Math.random() * 40 },
      { size: "10 TB", minutes: 250 + Math.random() * 80 },
      { size: "100 TB", minutes: 400 + Math.random() * 100 },
    ];
  }
  return {
    ...db,
    data,
  };
});
