import { FinancialEvent, Chart, Anomaly, DatasetInfo } from '../types';

export function useFinancialData(updateFrequency?: number): {
  events: FinancialEvent[];
  charts: Chart[];
  anomalies: Anomaly[];
  isConnected: boolean;
  isLoading: boolean;
  datasetInfo: DatasetInfo;
  startDataStream: () => void;
  stopDataStream: () => void;
  clearData: () => void;
  updateFrequencyRate: (newFrequency: number) => void;
};