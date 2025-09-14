import { createClient } from '@supabase/supabase-js';
import type { FinancialEvent, Anomaly } from '../types';

// Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Types
interface TransactionRow {
  id: number;
  type: string;
  properties: {
    step: string;
    amount: string;
    isFraud: string;
    nameDest: string;
    nameOrig: string;
    oldbalanceOrg: string;
    newbalanceOrig: string;
    oldbalanceDest: string;
    newbalanceDest: string;
    isFlaggedFraud: string;
  };
  time: number;
}

interface PaginationState {
  cursor: number | null;
  hasMore: boolean;
  totalCount: number;
}

interface FetchOptions {
  limit?: number;
  cursor?: number | null;
  direction?: 'forward' | 'backward';
}

// State management
class DataLoaderState {
  private pagination: PaginationState = {
    cursor: null,
    hasMore: true,
    totalCount: 0
  };
  
  private isInitialized = false;

  getPaginationState(): PaginationState {
    return { ...this.pagination };
  }

  setPaginationState(state: Partial<PaginationState>): void {
    this.pagination = { ...this.pagination, ...state };
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  setInitialized(value: boolean): void {
    this.isInitialized = value;
  }

  reset(): void {
    this.pagination = {
      cursor: null,
      hasMore: true,
      totalCount: 0
    };
    this.isInitialized = false;
  }
}

const state = new DataLoaderState();

// Core data fetching functions
export async function initializeSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('events')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }

    state.setInitialized(true);
    console.log('Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return false;
  }
}

export async function fetchTotalCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching total count:', error);
      return 0;
    }

    const totalCount = count || 0;
    state.setPaginationState({ totalCount });
    return totalCount;
  } catch (error) {
    console.error('Failed to fetch total count:', error);
    return 0;
  }
}

export async function fetchTransactions(options: FetchOptions = {}): Promise<{
  data: FinancialEvent[];
  pagination: PaginationState;
}> {
  const {
    limit = 50,
    cursor = null,
    direction = 'forward'
  } = options;


  try {
    let query = supabase
      .from('events')
      .select('*')
      .order('time', { ascending: direction === 'forward' })
      .limit(limit);

    // Apply cursor-based pagination
    if (cursor !== null) {
      if (direction === 'forward') {
        query = query.gt('time', cursor);
      } else {
        query = query.lt('time', cursor);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      return { data: [], pagination: state.getPaginationState() };
    }

    if (!data || data.length === 0) {
      state.setPaginationState({ hasMore: false });
      return { data: [], pagination: state.getPaginationState() };
    }

    // Convert to FinancialEvent objects
    const events = data
      .map(convertSupabaseRowToEvent)
      .filter(Boolean) as FinancialEvent[];

    // Update pagination state
    const newCursor = direction === 'forward' 
      ? Math.max(...data.map(row => row.time))
      : Math.min(...data.map(row => row.time));

    const hasMore = data.length === limit;
    
    state.setPaginationState({
      cursor: newCursor,
      hasMore
    });

    return {
      data: events,
      pagination: state.getPaginationState()
    };
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return { data: [], pagination: state.getPaginationState() };
  }
}

export async function fetchInitialTransactions(limit: number = 50): Promise<FinancialEvent[]> {
  // Reset state for fresh start
  state.reset();
  
  // Fetch total count
  await fetchTotalCount();
  
  // Fetch initial data
  const result = await fetchTransactions({ limit });
  return result.data;
}

export async function fetchNextTransactions(limit: number = 50): Promise<FinancialEvent[]> {
  const currentState = state.getPaginationState();
  
  if (!currentState.hasMore) {
    console.log('No more data available');
    return [];
  }

  const result = await fetchTransactions({
    limit,
    cursor: currentState.cursor,
    direction: 'forward'
  });

  return result.data;
}

export async function fetchPreviousTransactions(limit: number = 50): Promise<FinancialEvent[]> {
  const currentState = state.getPaginationState();
  
  if (!currentState.cursor) {
    console.log('No previous data available');
    return [];
  }

  const result = await fetchTransactions({
    limit,
    cursor: currentState.cursor,
    direction: 'backward'
  });

  return result.data;
}

// Data transformation
function convertSupabaseRowToEvent(row: TransactionRow): FinancialEvent | null {
  if (!row) return null;

  const props = row.properties;

  // Parse numeric values
  const amount = parseFloat(props.amount) || 0;
  const isFraud = props.isFraud === '1';
  const isFlaggedFraud = props.isFlaggedFraud === '1';
  const step = parseInt(props.step) || 0;

  // Determine status based on fraud flags
  let status: 'success' | 'pending' | 'failed' = 'success';
  if (isFraud) {
    status = 'failed';
  } else if (isFlaggedFraud) {
    status = 'pending';
  }

  // Map transaction type to our event types
  const typeMapping: Record<string, string> = {
    'PAYMENT': 'transaction',
    'TRANSFER': 'transaction',
    'CASH_OUT': 'payout',
    'CASH_IN': 'transaction',
    'DEBIT': 'fee'
  };

  const eventType = typeMapping[row.type] || 'transaction';

  // Use the actual timestamp from the database
  const timestamp = new Date(row.time);

  // Create unique ID
  const uniqueId = `TXN-${row.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  return {
    id: uniqueId,
    timestamp: timestamp.toISOString(),
    eventType,
    amount: Math.abs(amount),
    currency: 'USD',
    location: getLocationFromType(row.type),
    taxCategory: amount > 10000 ? 'Reportable' : 'Standard',
    status,
    transactionType: row.type,
    sourceAccount: props.nameOrig || '',
    destAccount: props.nameDest || '',
    sourceBalanceBefore: parseFloat(props.oldbalanceOrg) || 0,
    sourceBalanceAfter: parseFloat(props.newbalanceOrig) || 0,
    destBalanceBefore: parseFloat(props.oldbalanceDest) || 0,
    destBalanceAfter: parseFloat(props.newbalanceDest) || 0,
    isFraud,
    isFlaggedFraud,
    metadata: {
      processingTime: Math.floor(Math.random() * 1000) + 50,
      riskScore: isFraud ? 0.95 : isFlaggedFraud ? 0.7 : Math.random() * 0.5,
      step,
      balanceChange: Math.abs(parseFloat(props.oldbalanceOrg) - parseFloat(props.newbalanceOrig))
    }
  };
}

function getLocationFromType(type: string): string {
  const locationMap: Record<string, string> = {
    'PAYMENT': 'Online',
    'TRANSFER': 'Bank Transfer',
    'CASH_OUT': 'ATM',
    'CASH_IN': 'Branch',
    'DEBIT': 'Digital'
  };
  return locationMap[type] || 'Digital';
}

// Anomaly detection
export function detectSupabaseAnomaly(event: FinancialEvent): Anomaly[] {
  const anomalies: Anomaly[] = [];

  // High amount anomaly
  if (event.amount > 200000) {
    anomalies.push({
      type: 'high_amount',
      severity: 'high',
      message: `Unusually high amount: $${event.amount.toLocaleString()}`
    });
  }

  // Fraud detection
  if (event.isFraud) {
    anomalies.push({
      type: 'fraud_detected',
      severity: 'high',
      message: `Fraudulent transaction detected: ${event.transactionType} of $${event.amount.toLocaleString()}`
    });
  }

  // Flagged as suspicious
  if (event.isFlaggedFraud) {
    anomalies.push({
      type: 'suspicious_activity',
      severity: 'medium',
      message: `Transaction flagged as suspicious: ${event.id}`
    });
  }

  // Large balance change
  if (event.metadata.balanceChange > 100000) {
    anomalies.push({
      type: 'large_balance_change',
      severity: 'medium',
      message: `Large balance change detected: $${event.metadata.balanceChange.toLocaleString()}`
    });
  }

  // Zero balance after transaction
  if (event.sourceBalanceAfter === 0 && event.sourceBalanceBefore > 0) {
    anomalies.push({
      type: 'account_emptied',
      severity: 'high',
      message: `Account ${event.sourceAccount} emptied completely`
    });
  }

  return anomalies;
}

// Real-time subscription
export function subscribeToTransactions(callback: (event: FinancialEvent) => void) {
  const subscription = supabase
    .channel('events-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'events'
      },
      (payload) => {
        const event = convertSupabaseRowToEvent(payload.new as TransactionRow);
        if (event) {
          callback(event);
        }
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

// Utility functions
export function getConnectionStatus(): boolean {
  return state.isReady();
}

export function getPaginationState(): PaginationState {
  return state.getPaginationState();
}

export function resetPagination(): void {
  state.reset();
}

// Legacy compatibility (for existing code)
export async function fetchNewTransactions(): Promise<FinancialEvent[]> {
  return fetchNextTransactions(3);
}