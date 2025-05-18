import { useState } from 'react';
import { Card, Group, Switch, Text, Stack, Center, SegmentedControl } from '@mantine/core';
import { IconClock, IconDatabase } from '@tabler/icons-react';
import QueryLatency from './query-latency/QueryLatency';
import { BackupRestoration } from './backup-restoration/BackupRestoration';
import { databases } from './data';

export function Benchmarks() {
  const [activeTab, setActiveTab] = useState<string>('query-latency');
  const [enabledDbs, setEnabledDbs] = useState<Record<string, boolean>>(
    Object.fromEntries(databases.map(db => [db.id, true]))
  );

  const toggleDatabase = (dbId: string) => {
    setEnabledDbs(prev => ({
      ...prev,
      [dbId]: !prev[dbId]
    }));
  };

  const renderBenchmark = () => {
    switch (activeTab) {
      case 'query-latency':
        return <QueryLatency enabledDbs={enabledDbs} />;
      case 'backup':
        return <BackupRestoration enabledDbs={enabledDbs} />;
      default:
        return null;
    }
  };

  // Convert Mantine color to CSS variable
  const getColorVar = (color: string) => {
    const [baseColor, shade = '6'] = color.split('.');
    return `var(--mantine-color-${baseColor}-${shade})`;
  };

  return (
    <div id="benchmarks" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-2">Benchmarks</h2>
        <Text size="lg" className="text-center  text-gray-600">
          Compare AvgDB against other popular databases across different performance metrics
        </Text>

        <Card shadow="sm" padding="lg" radius="md" withBorder className="mb-8 mt-4">
          <Group justify="center" className="mb-2">
            <SegmentedControl
              value={activeTab}
              onChange={setActiveTab}
              data={[
                {
                  value: 'query-latency',
                  label: (
                    <Center style={{ gap: 10 }}>
                      <IconClock size={16} />
                      <span>Query Latency</span>
                    </Center>
                  ),
                },
                {
                  value: 'backup',
                  label: (
                    <Center style={{ gap: 10 }}>
                      <IconDatabase size={16} />
                      <span>Backup Restore</span>
                    </Center>
                  ),
                },
              ]}
              size="lg"
            />


          </Group>

          <div className="mb-6">


{activeTab === 'query-latency' && (
  <Text size="sm" c="dimmed" ta="center" className="mb-6">
    Average query response time in milliseconds (lower is better). Results are recalculated on every page refresh.
  </Text>
)}

{activeTab === 'backup' && (
  <Text size="sm" c="dimmed" ta="center" className="mb-6">
    Time to restore databases of different sizes (in minutes, lower is better). <b>AvgDB never goes down, so you'll never need to do a backup.</b>
  </Text>
)}

</div>
          <Group justify="center" className="mb-6">
            {databases.map((db) => (
              <Switch
                key={db.id}
                checked={enabledDbs[db.id]}
                onChange={() => toggleDatabase(db.id)}
                label={db.name}
                labelPosition="left"
                className="mx-2 cursor-pointer z-1"
                color={db.color}
                styles={{
                  root: { cursor: 'pointer' }, 
                  track: {
                    backgroundColor: enabledDbs[db.id] ? getColorVar(db.color) : undefined,
                    borderColor: enabledDbs[db.id] ? getColorVar(db.color) : undefined,
                  }
                }}
              />
            ))}
          </Group>

          {renderBenchmark()}
        </Card>
      </div>
    </div>
  );
} 
