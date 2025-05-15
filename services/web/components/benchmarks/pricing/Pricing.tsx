import { BarChart } from '@mantine/charts';
import { Text, Stack } from '@mantine/core';
import { pricingData } from '../data';
import type { PricingDataPoint } from '../types';

interface PricingProps {
  enabledDbs: Record<string, boolean>;
}

export function Pricing({ enabledDbs }: PricingProps) {
  const enabledData = pricingData.filter(db => enabledDbs[db.id]);
  
  // Transform data for the chart
  const chartData = (enabledData[0].data as PricingDataPoint[]).map((point, index) => {
    const dataPoint: Record<string, any> = {
      cpu: point.cpu,
    };
    
    enabledData.forEach(db => {
      dataPoint[db.name] = (db.data as PricingDataPoint[])[index].price;
    });
    
    return dataPoint;
  });

  return (
    <Stack>
      <Text size="xl" fw={600} ta="center" className="mb-2">
        Pricing Comparison
      </Text>
      <Text size="sm" c="dimmed" ta="center" className="mb-6">
        Cost per CPU per hour in USD (lower is better)
      </Text>

      <BarChart
        h={400}
        data={chartData}
        dataKey="cpu"
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
