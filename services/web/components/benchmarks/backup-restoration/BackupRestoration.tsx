import { BarChart } from '@mantine/charts';
import { Text, Stack } from '@mantine/core';
import { backupRestorationData } from '../data';
import type { BackupRestorationPoint } from '../types';

interface BackupRestorationProps {
  enabledDbs: Record<string, boolean>;
}

export function BackupRestoration({ enabledDbs }: BackupRestorationProps) {
  const enabledData = backupRestorationData.filter(db => enabledDbs[db.id]);
  
  // Transform data for the chart
  const chartData = (enabledData[0].data as BackupRestorationPoint[]).map((point, index) => {
    const dataPoint: Record<string, any> = {
      size: point.size,
    };
    
    enabledData.forEach(db => {
      dataPoint[db.name] = (db.data as BackupRestorationPoint[])[index].minutes;
    });
    
    return dataPoint;
  });

  return (
    <Stack>
      <Text size="xl" fw={600} ta="center" className="mb-2">
        Backup Restoration Speed
      </Text>
      <Text size="sm" c="dimmed" ta="center" className="mb-6">
        Time to restore databases of different sizes (minutes, lower is better)
      </Text>

      <BarChart
        h={400}
        data={chartData}
        dataKey="size"
        series={enabledData.map(db => ({
          name: db.name,
          color: db.color
        }))}
        tickLine="xy"
        gridAxis="xy"
        withLegend
        legendProps={{ verticalAlign: 'bottom' }}
      />
    </Stack>
  );
} 
