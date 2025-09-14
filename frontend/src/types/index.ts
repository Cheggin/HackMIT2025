export interface FinancialEvent {
  id: string;
  timestamp: string;
  eventType: string;
  amount: number;
  currency: string;
  location: string;
  taxCategory: string;
  status: 'success' | 'pending' | 'failed';
  transactionType: string;
  sourceAccount: string;
  destAccount: string;
  sourceBalanceBefore: number;
  sourceBalanceAfter: number;
  destBalanceBefore: number;
  destBalanceAfter: number;
  isFraud: boolean;
  isFlaggedFraud: boolean;
  metadata: {
    processingTime: number;
    riskScore: number;
    step: number;
    balanceChange: number;
  };
}

export interface Anomaly {
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
}

export interface DatasetInfo {
  totalRecords: number;
  currentPosition: number;
  percentageProcessed: number;
  fraudCount: number;
  flaggedCount: number;
  maxRowsLoaded?: number;
  chartWindowSize?: number;
  currentChartDataSize?: number;
  tableSize?: number;
}

export interface Chart {
  type: string;
  title: string;
  justification: string;
  data: ChartData[];
  priority: number;
}

export interface ChartData {
  time?: string;
  name?: string;
  volume?: number;
  amount?: number;
  fraudCount?: number;
  count?: number;
  avgAmount?: number;
  fraudRate?: number;
  value?: number;
  percentage?: number;
  location?: string;
  hour?: number;
  timestamp?: number;
  source?: string;
  target?: string;
}

export interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}