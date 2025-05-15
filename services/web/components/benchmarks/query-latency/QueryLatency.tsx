import { AreaChart } from '@mantine/charts';
import { Text, Stack } from '@mantine/core';
import { queryLatencyData } from '../data';
import type { QueryLatencyDataPoint } from '../types';
import { NoDataAlert } from '../shared/NoDataAlert';

interface QueryLatencyProps {
  enabledDbs: Record<string, boolean>;
}

export function QueryLatency({ enabledDbs }: QueryLatencyProps) {
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
      <Text size="xl" fw={600} ta="center" className="mb-2">
        Query Latency Comparison
      </Text>
      <Text size="sm" c="dimmed" ta="center" className="mb-6">
        Average query response time in milliseconds (lower is better)
      </Text>

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
        withLegend
        withGradient={true}
        legendProps={{ verticalAlign: 'bottom' }}
      />
    </Stack>
  );
}
