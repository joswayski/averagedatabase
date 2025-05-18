import { BarChart, getFilteredChartTooltipPayload } from '@mantine/charts';
import { Text, Stack, Group, Paper } from '@mantine/core';
import { backupRestorationData } from '../data';
import type { BackupRestorationPoint } from '../types';
import { NoDataAlert } from '../shared/NoDataAlert';

interface BackupRestorationProps {
  enabledDbs: Record<string, boolean>;
}

function CustomTooltip({ label, payload }: { label: string; payload: any[] }) {
  if (!payload) return null;
  const filtered = getFilteredChartTooltipPayload(payload);
  return (
    <Paper shadow="md" p="sm" radius="md">
      <Text fw={600} mb={4}>{label}</Text>
      {filtered.map((entry: any) => (
        <Group key={entry.name} gap="xs" align="center">
          <span style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: entry.color,
          }} />
          <Text size="sm">{entry.name}</Text>
          <Text size="sm" fw={600}>{Math.round(entry.value)} min</Text>
          {entry.name === 'AvgDB' && (
            <span role="img" aria-label="never down" title="Never needs restore">⚡</span>
          )}
        </Group>
      ))}
    </Paper>
  );
}

export function BackupRestoration({ enabledDbs }: BackupRestorationProps) {
  const enabledData = backupRestorationData.filter(db => enabledDbs[db.id]);

  if (enabledData.length === 0) {
    return <NoDataAlert />;
  }
  
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
        Time to restore databases of different sizes (in minutes, lower is better). <b>AvgDB never goes down, so you'll never need to do a backup.</b>
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
        withTooltip={true}
        valueFormatter={(value) => Math.round(value).toString()}
        tooltipProps={{
          content: ({ label, payload }) => <CustomTooltip label={label} payload={payload ?? []} />,
        }}
        cursorFill="gray.1"
      />
    </Stack>
  );
} 
