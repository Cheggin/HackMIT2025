import { format } from 'date-fns';

const EVENT_TYPES = ['transaction', 'fee', 'reversal', 'payout', 'tax', 'benefit'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
const LOCATIONS = ['New York', 'London', 'Tokyo', 'Sydney', 'Toronto', 'Paris', 'Singapore', 'Hong Kong', 'Frankfurt', 'Chicago'];
const TAX_CATEGORIES = ['VAT', 'GST', 'Sales Tax', 'Income Tax', 'Capital Gains', 'Withholding', 'None'];
const STATUSES = ['success', 'pending', 'failed'];

const STATUS_WEIGHTS = {
  success: 0.75,
  pending: 0.20,
  failed: 0.05
};

const EVENT_TYPE_WEIGHTS = {
  transaction: 0.60,
  fee: 0.15,
  reversal: 0.05,
  payout: 0.10,
  tax: 0.05,
  benefit: 0.05
};

function weightedRandom(items, weights) {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (const [item, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) return item;
  }

  return Object.keys(weights)[0];
}

function generateTransactionId() {
  return 'TXN-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateAmount(eventType) {
  const ranges = {
    transaction: [10, 50000],
    fee: [0.5, 500],
    reversal: [10, 10000],
    payout: [100, 100000],
    tax: [1, 5000],
    benefit: [10, 2000]
  };

  const [min, max] = ranges[eventType] || [10, 1000];
  const amount = min + Math.random() * (max - min);

  // Add occasional anomalies (5% chance)
  if (Math.random() < 0.05) {
    return amount * (5 + Math.random() * 10);
  }

  return Math.round(amount * 100) / 100;
}

function getSeasonalMultiplier() {
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();

  // Business hours boost
  const hourMultiplier = (hour >= 9 && hour <= 17) ? 1.5 : 0.7;

  // Weekday boost
  const dayMultiplier = (dayOfWeek >= 1 && dayOfWeek <= 5) ? 1.3 : 0.8;

  // End of month boost
  const date = new Date().getDate();
  const endOfMonthMultiplier = date >= 25 ? 1.4 : 1.0;

  return hourMultiplier * dayMultiplier * endOfMonthMultiplier;
}

export function generateFinancialEvent() {
  const eventType = weightedRandom(EVENT_TYPES, EVENT_TYPE_WEIGHTS);
  const status = weightedRandom(STATUSES, STATUS_WEIGHTS);

  const event = {
    id: generateTransactionId(),
    timestamp: new Date().toISOString(),
    eventType,
    amount: generateAmount(eventType),
    currency: CURRENCIES[Math.floor(Math.random() * CURRENCIES.length)],
    location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
    taxCategory: TAX_CATEGORIES[Math.floor(Math.random() * TAX_CATEGORIES.length)],
    status,
    metadata: {
      processingTime: Math.floor(Math.random() * 1000) + 50,
      riskScore: Math.random(),
      merchantCategory: Math.floor(Math.random() * 9999),
      seasonalMultiplier: getSeasonalMultiplier()
    }
  };

  // Add specific fields based on event type
  switch (eventType) {
    case 'transaction':
      event.metadata.merchantName = `Merchant_${Math.floor(Math.random() * 1000)}`;
      break;
    case 'fee':
      event.metadata.feeType = ['processing', 'service', 'platform', 'exchange'][Math.floor(Math.random() * 4)];
      break;
    case 'reversal':
      event.metadata.originalTransactionId = generateTransactionId();
      event.metadata.reason = ['dispute', 'error', 'fraud', 'customer_request'][Math.floor(Math.random() * 4)];
      break;
    case 'tax':
      event.metadata.taxRate = Math.round((Math.random() * 0.3) * 100) / 100;
      break;
  }

  return event;
}

export function generateBatchEvents(count = 10) {
  return Array.from({ length: count }, generateFinancialEvent);
}

export function detectAnomaly(event, recentEvents = []) {
  const anomalies = [];

  // High amount anomaly
  if (event.amount > 100000) {
    anomalies.push({
      type: 'high_amount',
      severity: 'high',
      message: `Unusually high amount: ${event.currency} ${event.amount.toLocaleString()}`
    });
  }

  // Failed transaction pattern
  if (event.status === 'failed') {
    const recentFailed = recentEvents.filter(e =>
      e.status === 'failed' &&
      new Date(e.timestamp) > new Date(Date.now() - 60000)
    ).length;

    if (recentFailed > 3) {
      anomalies.push({
        type: 'multiple_failures',
        severity: 'medium',
        message: `Multiple failed transactions detected (${recentFailed} in last minute)`
      });
    }
  }

  // High risk score
  if (event.metadata?.riskScore > 0.9) {
    anomalies.push({
      type: 'high_risk',
      severity: 'high',
      message: `High risk score: ${(event.metadata.riskScore * 100).toFixed(1)}%`
    });
  }

  // Unusual location pattern
  if (recentEvents.length > 0) {
    const lastEvent = recentEvents[recentEvents.length - 1];
    if (lastEvent.location !== event.location) {
      const timeDiff = new Date(event.timestamp) - new Date(lastEvent.timestamp);
      if (timeDiff < 60000) { // Less than 1 minute
        anomalies.push({
          type: 'location_jump',
          severity: 'medium',
          message: `Rapid location change: ${lastEvent.location} → ${event.location}`
        });
      }
    }
  }

  return anomalies;
}