import Papa from 'papaparse';

let fraudData = [];
let currentIndex = 0;
let isLoading = false;
let loadPromise = null;

// Reset the index on page load to start fresh
if (typeof window !== 'undefined') {
  currentIndex = 0;
}

// Load a smaller sample of the data for better performance
const MAX_ROWS_TO_LOAD = 50000; // Load only first 50k rows instead of entire 493MB file

export async function loadFraudData() {
  if (isLoading) return loadPromise;
  if (fraudData.length > 0) return fraudData;

  isLoading = true;
  loadPromise = new Promise(async (resolve, reject) => {
    try {
      console.log('Starting to fetch Fraud.csv...');
      const response = await fetch('/Fraud.csv');

      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
      }

      console.log('CSV fetched, starting streaming parse...');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let partialLine = '';
      let rowCount = 0;
      let headerParsed = false;
      let headers = [];

      // Process the CSV in chunks
      const processChunk = async () => {
        const { done, value } = await reader.read();

        if (done) {
          console.log(`Finished loading ${fraudData.length} fraud records`);
          isLoading = false;
          resolve(fraudData);
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = (partialLine + chunk).split('\n');
        partialLine = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          if (!headerParsed) {
            headers = line.split(',');
            headerParsed = true;
            continue;
          }

          if (rowCount >= MAX_ROWS_TO_LOAD) {
            console.log(`Reached max rows limit (${MAX_ROWS_TO_LOAD})`);
            reader.cancel();
            break;
          }

          // Parse CSV line manually for better performance
          const values = line.split(',');
          const row = {};
          headers.forEach((header, index) => {
            const value = values[index];
            // Parse numbers
            if (header === 'step' || header === 'amount' ||
                header.includes('balance') || header === 'isFraud' ||
                header === 'isFlaggedFraud') {
              row[header] = parseFloat(value) || 0;
            } else {
              row[header] = value;
            }
          });

          fraudData.push(row);
          rowCount++;

          // Log progress every 10000 rows
          if (rowCount % 10000 === 0) {
            console.log(`Loaded ${rowCount} rows...`);
          }
        }

        // Continue reading if not done
        if (rowCount < MAX_ROWS_TO_LOAD) {
          await processChunk();
        } else {
          reader.cancel();
          console.log(`Loaded ${fraudData.length} fraud records (limited to ${MAX_ROWS_TO_LOAD})`);

          // Sort by step (time) to ensure chronological order
          fraudData.sort((a, b) => a.step - b.step);
          currentIndex = 0;

          isLoading = false;
          resolve(fraudData);
        }
      };

      await processChunk();
    } catch (error) {
      console.error('Error loading fraud data:', error);
      isLoading = false;
      reject(error);
    }
  });

  return loadPromise;
}

let lastTimestamp = Date.now();

export function getNextBatch(batchSize = 10) {
  if (currentIndex >= fraudData.length) {
    // Reset to beginning if we've reached the end
    currentIndex = 0;
  }

  const batch = [];
  for (let i = 0; i < batchSize && currentIndex < fraudData.length; i++) {
    // Add a small time offset for each item in the batch
    // This ensures each row has a slightly different timestamp
    const itemWithTimestamp = {
      ...fraudData[currentIndex],
      _batchTimestamp: lastTimestamp + (i * 100) // 100ms between items in batch
    };
    batch.push(itemWithTimestamp);
    currentIndex++;
  }

  lastTimestamp = Date.now(); // Update for next batch
  return batch;
}

export function convertFraudDataToEvent(fraudRow) {
  if (!fraudRow) return null;

  // Generate a unique ID
  const id = `TXN-${fraudRow.step}-${Math.random().toString(36).substring(2, 8)}`;

  // Determine status based on fraud flag
  let status = 'success';
  if (fraudRow.isFraud === 1) {
    status = 'failed';
  } else if (fraudRow.isFlaggedFraud === 1) {
    status = 'pending';
  }

  // Map transaction type to our event types
  const typeMapping = {
    'PAYMENT': 'transaction',
    'TRANSFER': 'transaction',
    'CASH_OUT': 'payout',
    'CASH_IN': 'transaction',
    'DEBIT': 'fee'
  };

  const eventType = typeMapping[fraudRow.type] || 'transaction';

  // Create timestamp using current time or batch timestamp for better chart visualization
  // Use the batch timestamp if available, otherwise use current time
  const timestamp = fraudRow._batchTimestamp ? new Date(fraudRow._batchTimestamp) : new Date();

  return {
    id,
    timestamp: timestamp.toISOString(),
    eventType,
    amount: Math.abs(fraudRow.amount),
    currency: 'USD',
    location: fraudRow.type === 'PAYMENT' ? 'Online' :
              fraudRow.type === 'TRANSFER' ? 'Bank Transfer' :
              fraudRow.type === 'CASH_OUT' ? 'ATM' :
              fraudRow.type === 'CASH_IN' ? 'Branch' : 'Digital',
    taxCategory: fraudRow.amount > 10000 ? 'Reportable' : 'Standard',
    status,
    transactionType: fraudRow.type,
    sourceAccount: fraudRow.nameOrig,
    destAccount: fraudRow.nameDest,
    sourceBalanceBefore: fraudRow.oldbalanceOrg,
    sourceBalanceAfter: fraudRow.newbalanceOrig,
    destBalanceBefore: fraudRow.oldbalanceDest,
    destBalanceAfter: fraudRow.newbalanceDest,
    isFraud: fraudRow.isFraud === 1,
    isFlaggedFraud: fraudRow.isFlaggedFraud === 1,
    metadata: {
      processingTime: Math.floor(Math.random() * 1000) + 50,
      riskScore: fraudRow.isFraud === 1 ? 0.95 : fraudRow.isFlaggedFraud === 1 ? 0.7 : Math.random() * 0.5,
      step: fraudRow.step,
      balanceChange: Math.abs(fraudRow.oldbalanceOrg - fraudRow.newbalanceOrig)
    }
  };
}

export function detectFraudAnomaly(event) {
  const anomalies = [];

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

export function getDatasetInfo() {
  const totalLoaded = fraudData.length;
  const fraudCount = fraudData.filter(row => row.isFraud === 1).length;
  const flaggedCount = fraudData.filter(row => row.isFlaggedFraud === 1).length;

  return {
    totalRecords: totalLoaded,
    currentPosition: currentIndex,
    percentageProcessed: totalLoaded > 0 ? (currentIndex / totalLoaded) * 100 : 0,
    fraudCount: fraudCount,
    flaggedCount: flaggedCount,
    maxRowsLoaded: MAX_ROWS_TO_LOAD
  };
}