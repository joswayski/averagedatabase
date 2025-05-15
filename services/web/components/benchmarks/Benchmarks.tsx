import { useState } from 'react';
import { Card, Tabs, Group, Switch, Text, Stack } from '@mantine/core';
import { QueryLatency } from './query-latency/QueryLatency';
import { Pricing } from './pricing/Pricing';
import { databases } from './data';

export function Benchmarks() {
  const [activeTab, setActiveTab] = useState<string | null>('query-latency');
  const [enabledDbs, setEnabledDbs] = useState<Record<string, boolean>>(
    Object.fromEntries(databases.map(db => [db.id, true]))
  );

  const toggleDatabase = (dbId: string) => {
    setEnabledDbs(prev => ({
      ...prev,
      [dbId]: !prev[dbId]
    }));
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-8">Benchmarks</h2>
        <Text size="lg" className="text-center mb-12 text-gray-600">
          Compare AvgDB against other popular databases across different performance metrics
        </Text>

        <Card shadow="sm" padding="lg" radius="md" withBorder className="mb-8">
          <Group justify="center" className="mb-6">
            {databases.map((db) => (
              <Switch
                key={db.id}
                checked={enabledDbs[db.id]}
                onChange={() => toggleDatabase(db.id)}
                label={db.name}
                labelPosition="left"
                className="mx-2"
              />
            ))}
          </Group>

          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List grow className="mb-6">
              <Tabs.Tab value="query-latency">Query Latency</Tabs.Tab>
              <Tabs.Tab value="pricing">Pricing</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="query-latency">
              <QueryLatency enabledDbs={enabledDbs} />
            </Tabs.Panel>

            <Tabs.Panel value="pricing">
              <Pricing enabledDbs={enabledDbs} />
            </Tabs.Panel>
          </Tabs>
        </Card>
      </div>
    </div>
  );
} 
