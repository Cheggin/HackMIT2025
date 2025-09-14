import { createClient } from '@supabase/supabase-js';
import type { FinancialEvent, Anomaly } from '../types';

// Initialize Supabase client - you'll need to add these to your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Database table interface matching your Supabase schema
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

// Track the last fetched timestamp and ID for continuous polling
let lastFetchedTime: number | null = null;
let isInitialized = false;
let totalRowCount = 0;

export async function initializeSupabaseConnection(): Promise<boolean> {
  try {
    // Test the connection - using public schema
    const { data, error } = await supabase
      .from('events')  // Using public schema
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }

    isInitialized = true;
    console.log('Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return false;
  }
}

export async function fetchInitialTransactions(limit: number = 50): Promise<FinancialEvent[]> {
  try {
    // Get total count of rows
    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    if (count) {
      totalRowCount = count;
    }

    // Fetch the first batch of transactions
    const { data, error } = await supabase
      .from('events')  // Using public schema
      .select('*')
      .order('time', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching initial transactions:', error);
      return [];
    }

    if (data && data.length > 0) {
      // Update the last fetched ID and timestamp
      lastFetchedTime = Math.max(...data.map((row: TransactionRow) => row.time));

      // Convert and return with timestamps spaced 1 second apart for initial batch
      const currentTime = Date.now();
      return data
        .map((row, index) => {
          const event = convertSupabaseRowToEvent(row);
          if (event) {
            // Space initial events 1 second apart
            event.timestamp = new Date(currentTime + (index * 1000)).toISOString();
          }
          return event;
        })
        .filter(Boolean) as FinancialEvent[];
    }

    return [];
  } catch (error) {
    console.error('Failed to fetch initial transactions:', error);
    return [];
  }
}

export async function fetchNewTransactions(): Promise<FinancialEvent[]> {
  if (lastFetchedTime === null) {
    // If we haven't fetched anything yet, get initial data
    return fetchInitialTransactions();
  }

  try {
    // Fetch next batch of transactions after the last fetched ID
    let query = supabase
      .from('events')
      .select('*')
      .order('time', { ascending: true })
      .limit(3); // Get 3 rows per update

    // Get next rows after last fetched ID
    query = query.gt('time', lastFetchedTime + 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching new transactions:', error);
      return [];
    }

    if (data && data.length > 0) {
      // Update the last fetched ID
      lastFetchedTime = Math.max(...data.map((row: TransactionRow) => row.time));
      console.log(`Fetched ${data.length} new transactions, IDs: ${data.map((r: TransactionRow) => r.id).join(', ')}`);

      // Convert and return with timestamps spaced 1 second apart
      const currentTime = Date.now();
      return data
        .map((row, index) => {
          const event = convertSupabaseRowToEvent(row);
          if (event) {
            // Space events 1 second apart for clear separation
            event.timestamp = new Date(currentTime + (index * 1000)).toISOString();
          }
          return event;
        })
        .filter(Boolean) as FinancialEvent[];
    } else {
      // If no more data, fetch from beginning but skip already fetched IDs
      console.log('Reached end of data, cycling back to beginning');

      const { data: firstBatch, error: firstError } = await supabase
        .from('events')
        .select('*')
        .order('time', { ascending: true })
        .limit(3);

      if (firstError || !firstBatch || firstBatch.length === 0) {
        return [];
      }

      // Update the last fetched ID to continue from here
        lastFetchedTime = Math.max(...data.map((row: TransactionRow) => row.time));


      const currentTime = Date.now();
      return firstBatch
        .map((row, index) => {
          const event = convertSupabaseRowToEvent(row);
          if (event) {
            // Space events 1 second apart
            event.timestamp = new Date(currentTime + (index * 1000)).toISOString();
          }
          return event;
        })
        .filter(Boolean) as FinancialEvent[];
    }
  } catch (error) {
    console.error('Failed to fetch new transactions:', error);
    return [];
  }
}

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

  // Create unique ID by combining row ID with timestamp to avoid duplicates
  const uniqueId = `TXN-${row.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  return {
    id: uniqueId,
    timestamp: timestamp.toISOString(),
    eventType,
    amount: Math.abs(amount),
    currency: 'USD',
    location: row.type === 'PAYMENT' ? 'Online' :
              row.type === 'TRANSFER' ? 'Bank Transfer' :
              row.type === 'CASH_OUT' ? 'ATM' :
              row.type === 'CASH_IN' ? 'Branch' : 'Digital',
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

// Subscribe to real-time updates (optional - for live data)
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

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}

export function getConnectionStatus(): boolean {
  return isInitialized;
}