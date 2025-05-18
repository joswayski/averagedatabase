import { AreaChart } from '@mantine/charts';
import { Text, Stack } from '@mantine/core';
import { queryLatencyData } from '../data';
import type { QueryLatencyDataPoint } from '../types';
import { NoDataAlert } from '../shared/NoDataAlert';

interface QueryLatencyProps {
  enabledDbs: Record<string, boolean>;
}

export const data = [
  {
    date: 'Mar 22',
    Apples: 2890,
    Oranges: 2338,
    Tomatoes: 2452,
  },
  {
    date: 'Mar 23',
    Apples: 2756,
    Oranges: 2103,
    Tomatoes: 2402,
  },
  {
    date: 'Mar 24',
    Apples: 3322,
    Oranges: 986,
    Tomatoes: 1821,
  },
  {
    date: 'Mar 25',
    Apples: 3470,
    Oranges: 2108,
    Tomatoes: 2809,
  },
  {
    date: 'Mar 26',
    Apples: 3129,
    Oranges: 1726,
    Tomatoes: 2290,
  },
];

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
      <Text size="xl" fw={600} ta="center" className="mb-10">
        Query Latency Comparison
      </Text>
      <Text size="sm" c="dimmed" ta="center" className="mb-6">
        Average query response time in milliseconds (lower is better). Results are recalculated on every page refresh. 
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
        withGradient={true}
        withTooltip={true}
        valueFormatter={(value) => value.toFixed(2)}
        tooltipProps={{
          formatter: (value: number) => value.toFixed(2),
        }}
      />
    </Stack>
  );
}
