import { useState, useEffect, useCallback, useRef } from 'react';
import { recommendCharts } from '../utils/chartRecommendationEngine';
import {
  initializeSupabaseConnection,
  fetchInitialTransactions,
  fetchNewTransactions,
  detectSupabaseAnomaly,
  subscribeToTransactions
} from '../utils/supabaseDataLoader';
import type { FinancialEvent, Chart, Anomaly, DatasetInfo } from '../types';

const CHART_WINDOW_SIZE = 100; // Process only last 100 events for charts (for sliding window)
const TABLE_HISTORY_SIZE = 500; // Keep last 500 events in table (increased for better history)

interface UseFinancialDataReturn {
  events: FinancialEvent[];
  charts: Chart[];
  anomalies: Anomaly[];
  isConnected: boolean;
  isLoading: boolean;
  datasetInfo: DatasetInfo;
  startDataStream: () => Promise<void>;
  stopDataStream: () => void;
  clearData: () => void;
  updateFrequencyRate: (newFrequency: number) => void;
}

export function useFinancialData(updateFrequency: number = 3000): UseFinancialDataReturn { // Default to 3s updates
  const [events, setEvents] = useState<FinancialEvent[]>([]);
  const [chartData, setChartData] = useState<FinancialEvent[]>([]); // Separate state for chart processing
  const [charts, setCharts] = useState<Chart[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState<DatasetInfo>({
    totalRecords: 0,
    currentPosition: 0,
    percentageProcessed: 0,
    fraudCount: 0,
    flaggedCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const updateCounterRef = useRef(0);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const eventBatchRef = useRef<FinancialEvent[]>([]);
  const lastFetchTimeRef = useRef(0);
  const isFetchingRef = useRef(false);

  const updateCharts = useCallback((data: FinancialEvent[], forceUpdate = false, eventCount = 1) => {
    // Force update on initial load
    if (forceUpdate) {
      const recommendations = recommendCharts(data, 4);
      setCharts(recommendations);
      updateCounterRef.current = 0;
      return;
    }

    // Accumulate event count
    updateCounterRef.current += eventCount;

    // Only update when we have exactly 3 or more events
    if (updateCounterRef.current >= 3) {
      console.log(`Updating charts with ${updateCounterRef.current} accumulated events`);
      const recommendations = recommendCharts(data, 4);
      setCharts(recommendations);
      updateCounterRef.current = 0;
    }
  }, []);


  const addEvents = useCallback((newEvents: FinancialEvent[], isInitialLoad = false) => {
    console.log(`addEvents called with ${newEvents.length} events, isInitialLoad: ${isInitialLoad}`);

    // Add all events at once but ensure they maintain order for animation
    // Sort by timestamp to ensure proper sequencing
    const sortedEvents = [...newEvents].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Keep track of actually added events for anomaly detection and dataset info
    let actuallyAddedEvents: FinancialEvent[] = [];

    // Update table events (keep last TABLE_HISTORY_SIZE)
    setEvents(prevEvents => {
      // Filter out any duplicates based on ID
      const existingIds = new Set(prevEvents.map(e => e.id));
      const uniqueNewEvents = sortedEvents.filter(e => !existingIds.has(e.id));

      console.log(`Table: Filtered to ${uniqueNewEvents.length} unique events out of ${sortedEvents.length}`);

      if (uniqueNewEvents.length === 0) {
        return prevEvents; // No new events to add
      }

      actuallyAddedEvents = uniqueNewEvents;
      const updatedEvents = [...prevEvents, ...uniqueNewEvents];
      return updatedEvents.slice(-TABLE_HISTORY_SIZE);
    });

    // Update chart data with sliding window (keep last CHART_WINDOW_SIZE)
    setChartData(prevChartData => {
      // Filter out duplicates for chart data as well
      const existingChartIds = new Set(prevChartData.map(e => e.id));
      const uniqueChartEvents = sortedEvents.filter(e => !existingChartIds.has(e.id));

      console.log(`Chart: Filtered to ${uniqueChartEvents.length} unique events out of ${sortedEvents.length}`);

      const updatedChartData = [...prevChartData, ...uniqueChartEvents];
      const windowedData = updatedChartData.slice(-CHART_WINDOW_SIZE);

      // Only update charts if we have new events (not on duplicates)
      if (uniqueChartEvents.length > 0) {
        updateCharts(windowedData, isInitialLoad, uniqueChartEvents.length);
      }

      return windowedData;
    });

    // Detect anomalies for new unique events only
    if (actuallyAddedEvents.length > 0) {
      actuallyAddedEvents.forEach(event => {
        const eventAnomalies = detectSupabaseAnomaly(event);
        if (eventAnomalies.length > 0) {
          setAnomalies(prev => [...prev, ...eventAnomalies].slice(-10));
        }
      });

      // Update dataset info only for actually added events
      setDatasetInfo(prev => ({
        ...prev,
        totalRecords: prev.totalRecords + actuallyAddedEvents.length,
        currentPosition: prev.currentPosition + actuallyAddedEvents.length,
        fraudCount: prev.fraudCount + actuallyAddedEvents.filter(e => e.isFraud).length,
        flaggedCount: prev.flaggedCount + actuallyAddedEvents.filter(e => e.isFlaggedFraud).length
      }));
    }
  }, [updateCharts]);

  const startDataStream = useCallback(async () => {
    if (intervalRef.current) return;

    setIsLoading(true);

    try {
      // Initialize Supabase connection
      const connected = await initializeSupabaseConnection();
      if (!connected) {
        throw new Error('Failed to connect to Supabase');
      }

      setIsConnected(true);

      // Load initial 50 transactions
      const initialTransactions = await fetchInitialTransactions(50);
      if (initialTransactions.length > 0) {
        addEvents(initialTransactions, true); // Pass true for initial load
      }

      // Set up polling for new transactions with debouncing
      intervalRef.current = setInterval(async () => {
        // Prevent concurrent fetches
        if (isFetchingRef.current) {
          console.log('Skipping fetch - already fetching');
          return;
        }

        // Debounce: ensure minimum time between fetches
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchTimeRef.current;
        if (timeSinceLastFetch < 2500) { // Minimum 2.5 seconds between fetches
          console.log(`Skipping fetch - only ${timeSinceLastFetch}ms since last fetch`);
          return;
        }

        isFetchingRef.current = true;
        lastFetchTimeRef.current = now;

        const newTransactions = await fetchNewTransactions();
        if (newTransactions.length > 0) {
          console.log(`Fetched ${newTransactions.length} events at ${new Date().toISOString()}`);
          addEvents(newTransactions);
        }

        isFetchingRef.current = false;
      }, updateFrequency);

      // Comment out real-time subscription to avoid duplicates
      // The polling mechanism is sufficient for our needs
      /*
      unsubscribeRef.current = subscribeToTransactions((event) => {
        console.log('Subscription: Adding 1 event');
        addEvents([event]);
      });
      */

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to start data stream:', error);
      setIsConnected(false);
      setIsLoading(false);
    }
  }, [updateFrequency]);

  const stopDataStream = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Subscription is disabled, so no need to unsubscribe
    /*
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    */

    setIsConnected(false);
  }, []);

  const clearData = useCallback(() => {
    setEvents([]);
    setChartData([]);
    setCharts([]);
    setAnomalies([]);
    updateCounterRef.current = 0;
    setDatasetInfo({
      totalRecords: 0,
      currentPosition: 0,
      percentageProcessed: 0,
      fraudCount: 0,
      flaggedCount: 0
    });
  }, []);

  const updateFrequencyRate = useCallback((newFrequency: number) => {
    stopDataStream();
    setTimeout(() => {
      startDataStream();
    }, 100);
  }, [startDataStream, stopDataStream]);

  useEffect(() => {
    // Clear any existing data on mount (page refresh)
    clearData();
    // Start fresh data stream
    startDataStream();
    return () => {
      stopDataStream();
    };
  }, []); // Empty dependency array to run only on mount

  return {
    events,
    charts,
    anomalies,
    isConnected,
    isLoading,
    datasetInfo: {
      ...datasetInfo,
      chartWindowSize: CHART_WINDOW_SIZE,
      currentChartDataSize: chartData.length,
      tableSize: events.length
    },
    startDataStream,
    stopDataStream,
    clearData,
    updateFrequencyRate,
  };
}