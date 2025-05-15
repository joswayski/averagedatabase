export interface Database {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface QueryLatencyDataPoint {
  date: string;
  value: number;
}

export interface PricingDataPoint {
  cpu: string;
  price: number;
}

export interface BackupRestorationPoint {
  size: string;
  minutes: number;
}

export interface BenchmarkData extends Database {
  data: QueryLatencyDataPoint[] | PricingDataPoint[] | BackupRestorationPoint[];
}
