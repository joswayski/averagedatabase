import { AreaChart, getFilteredChartTooltipPayload } from '@mantine/charts';
import { Text, Stack, Group, Paper } from '@mantine/core';
import { queryLatencyData } from '../data';
import type { QueryLatencyDataPoint } from '../types';
import { NoDataAlert } from '../shared/NoDataAlert';

interface QueryLatencyProps {
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
          <Text size="sm">
          {entry.name}
          </Text>
          <Text size="sm" fw={600}>{Math.round(entry.value)}ms</Text>
          {entry.name === 'AvgDB' && (
            <span role="img" aria-label="fastest" title="Fastest">⚡</span>
          )}
        </Group>
      ))}
    </Paper>
  );
}

export default function QueryLatency({ enabledDbs }: QueryLatencyProps) {
  const enabledData = queryLatencyData.filter(db => enabledDbs[db.id]);

  if (enabledData.length === 0) {
    return <NoDataAlert />;
  }
  
  // Transform data for the chart
  const chartData = enabledData[0].data.map((_: QueryLatencyDataPoint, index: number) => {
    const point: Record<string, any> = {
      date: (enabledData[0].data as QueryLatencyDataPoint[])[index].date,
    };
    
    enabledData.forEach(db => {
      point[db.name] = (db.data as QueryLatencyDataPoint[])[index].value;
    });
    
    return point;
  });

  return (
    <Stack>
      <AreaChart
        h={400}
        data={chartData}
        dataKey="date"
        series={enabledData.map(db => ({
          name: db.name,
          color: db.color,
        }))}
        curveType="step"
        tickLine="xy"
        gridAxis="x"
        withXAxis={false}
        withGradient={true}
        withTooltip={true}
        valueFormatter={(value) => Math.round(value).toString()}
        tooltipProps={{
          content: ({ label, payload }) => <CustomTooltip label={label} payload={payload ?? []} />,
        }}
      />
    </Stack>
  );
}
