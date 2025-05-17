import { useState } from 'react';
import { Tabs } from '@mantine/core';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Checkbox, Group, Paper, Text, Title, Stack } from '@mantine/core';

// Mock data for query latency (in milliseconds)
const queryLatencyData = [
  { workload: 'Read Light', AvgDB: 0.5, 'AWS RDS': 2.1, Aurora: 1.8, NeonDB: 1.5, PlanetScale: 1.7, Supabase: 2.0, CockroachDB: 1.9, MongoDB: 2.5 },
  { workload: 'Read Heavy', AvgDB: 0.8, 'AWS RDS': 3.2, Aurora: 2.8, NeonDB: 2.5, PlanetScale: 2.7, Supabase: 3.0, CockroachDB: 2.9, MongoDB: 3.8 },
  { workload: 'Write Light', AvgDB: 1.2, 'AWS RDS': 4.5, Aurora: 3.8, NeonDB: 3.5, PlanetScale: 3.7, Supabase: 4.2, CockroachDB: 4.0, MongoDB: 5.0 },
  { workload: 'Write Heavy', AvgDB: 1.5, 'AWS RDS': 5.8, Aurora: 4.9, NeonDB: 4.5, PlanetScale: 4.7, Supabase: 5.2, CockroachDB: 5.0, MongoDB: 6.5 },
  { workload: 'Mixed', AvgDB: 1.0, 'AWS RDS': 4.0, Aurora: 3.5, NeonDB: 3.2, PlanetScale: 3.4, Supabase: 3.8, CockroachDB: 3.6, MongoDB: 4.5 },
];

// Mock data for backup restoration (in seconds)
const backupRestorationData = [
  { size: '1GB', AvgDB: 2, 'AWS RDS': 15, Aurora: 12, NeonDB: 10, PlanetScale: 11, Supabase: 14, CockroachDB: 13, MongoDB: 18 },
  { size: '10GB', AvgDB: 5, 'AWS RDS': 45, Aurora: 38, NeonDB: 35, PlanetScale: 37, Supabase: 42, CockroachDB: 40, MongoDB: 55 },
  { size: '100GB', AvgDB: 15, 'AWS RDS': 120, Aurora: 100, NeonDB: 95, PlanetScale: 98, Supabase: 110, CockroachDB: 105, MongoDB: 150 },
  { size: '1TB', AvgDB: 45, 'AWS RDS': 300, Aurora: 250, NeonDB: 240, PlanetScale: 245, Supabase: 280, CockroachDB: 270, MongoDB: 400 },
];

// Mock data for price per CPU/Memory (in USD)
const priceData = [
  { metric: 'CPU/Hour', AvgDB: 0.05, 'AWS RDS': 0.17, Aurora: 0.15, NeonDB: 0.12, PlanetScale: 0.14, Supabase: 0.16, CockroachDB: 0.15, MongoDB: 0.20 },
  { metric: 'Memory/GB', AvgDB: 0.02, 'AWS RDS': 0.10, Aurora: 0.08, NeonDB: 0.07, PlanetScale: 0.08, Supabase: 0.09, CockroachDB: 0.08, MongoDB: 0.12 },
];

const COLORS = {
  AvgDB: '#2563eb', // blue-600
  'AWS RDS': '#dc2626', // red-600
  Aurora: '#d97706', // amber-600
  NeonDB: '#059669', // emerald-600
  PlanetScale: '#7c3aed', // violet-600
  Supabase: '#db2777', // pink-600
  CockroachDB: '#9333ea', // purple-600
  MongoDB: '#ea580c', // orange-600
};

const competitors = Object.keys(COLORS);

export function Benchmarks() {
  const [activeTab, setActiveTab] = useState<string | null>('query-latency');
  const [visibleCompetitors, setVisibleCompetitors] = useState<string[]>(competitors);

  const toggleCompetitor = (competitor: string) => {
    setVisibleCompetitors(prev => 
      prev.includes(competitor) 
        ? prev.filter(c => c !== competitor)
        : [...prev, competitor]
    );
  };

  const renderChart = (data: any[], title: string, description: string, yAxisLabel: string) => (
    <Paper className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800">
      <Stack spacing="md">
        <Title order={2} className="text-2xl font-bold text-gray-900 dark:text-white">{title}</Title>
        <Text className="text-gray-600 dark:text-gray-300">{description}</Text>
        
        <Group className="flex-wrap gap-2 mb-4">
          {competitors.map(competitor => (
            <Checkbox
              key={competitor}
              label={competitor}
              checked={visibleCompetitors.includes(competitor)}
              onChange={() => toggleCompetitor(competitor)}
              color={competitor === 'AvgDB' ? 'blue' : 'gray'}
              className="text-sm"
            />
          ))}
        </Group>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={data[0]?.workload ? 'workload' : 'size' || 'metric'} />
              <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              {visibleCompetitors.map(competitor => (
                <Line
                  key={competitor}
                  type="monotone"
                  dataKey={competitor}
                  stroke={COLORS[competitor as keyof typeof COLORS]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Stack>
    </Paper>
  );

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <Title order={1} className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
        Performance Benchmarks
      </Title>

      <Tabs value={activeTab} onChange={setActiveTab} className="w-full">
        <Tabs.List className="flex flex-wrap justify-center gap-2 mb-8">
          <Tabs.Tab value="query-latency" className="px-6 py-2 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            Query Latency
          </Tabs.Tab>
          <Tabs.Tab value="backup-restoration" className="px-6 py-2 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            Backup Restoration
          </Tabs.Tab>
          <Tabs.Tab value="price" className="px-6 py-2 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            Price Comparison
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="query-latency">
          {renderChart(
            queryLatencyData,
            "Query Latency Comparison",
            "Average query latency across different workload types. Lower is better.",
            "Latency (ms)"
          )}
        </Tabs.Panel>

        <Tabs.Panel value="backup-restoration">
          {renderChart(
            backupRestorationData,
            "Backup Restoration Time",
            "Time taken to restore backups of different sizes. Lower is better.",
            "Time (seconds)"
          )}
        </Tabs.Panel>

        <Tabs.Panel value="price">
          {renderChart(
            priceData,
            "Price Comparison",
            "Cost per CPU hour and memory allocation. Lower is better.",
            "Price (USD)"
          )}
        </Tabs.Panel>
      </Tabs>
    </section>
  );
} 
