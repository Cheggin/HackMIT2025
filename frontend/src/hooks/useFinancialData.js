import { useState, useEffect, useCallback, useRef } from 'react';
import { recommendCharts } from '../utils/chartRecommendationEngine';
import {
  loadFraudData,
  getNextBatch,
  convertFraudDataToEvent,
  detectFraudAnomaly,
  getDatasetInfo
} from '../utils/csvDataLoader';

const CHART_WINDOW_SIZE = 100; // Process only last 100 events for charts (for sliding window)
const TABLE_HISTORY_SIZE = 200; // Keep last 200 events in table

export function useFinancialData(updateFrequency = 2000) {
  const [events, setEvents] = useState([]);
  const [chartData, setChartData] = useState([]); // Separate state for chart processing
  const [charts, setCharts] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);
  const updateCounterRef = useRef(0);

  const updateCharts = useCallback((data) => {
    // Update charts every 3 new events for smoother sliding window
    updateCounterRef.current++;
    if (updateCounterRef.current >= 3 || data.length <= 10) {
      const recommendations = recommendCharts(data, 4);
      setCharts(recommendations);
      updateCounterRef.current = 0;
    }
  }, []);

  const addEvents = useCallback((newEvents) => {
    const convertedEvents = newEvents.map(convertFraudDataToEvent).filter(Boolean);

    // Update table events (keep last TABLE_HISTORY_SIZE)
    setEvents(prevEvents => {
      const updatedEvents = [...prevEvents, ...convertedEvents];
      return updatedEvents.slice(-TABLE_HISTORY_SIZE);
    });

    // Update chart data with sliding window (keep last CHART_WINDOW_SIZE)
    setChartData(prevChartData => {
      const updatedChartData = [...prevChartData, ...convertedEvents];
      const windowedData = updatedChartData.slice(-CHART_WINDOW_SIZE);

      // Update charts with the windowed data
      updateCharts(windowedData);

      return windowedData;
    });

    // Detect anomalies for new events
    convertedEvents.forEach(event => {
      const eventAnomalies = detectFraudAnomaly(event);
      if (eventAnomalies.length > 0) {
        setAnomalies(prev => [...prev, ...eventAnomalies].slice(-10));
      }
    });

    // Update dataset info
    setDatasetInfo(getDatasetInfo());
  }, [updateCharts]);

  const startDataStream = useCallback(async () => {
    if (intervalRef.current) return;

    setIsLoading(true);
    setIsConnected(true);

    try {
      // Load the CSV data
      await loadFraudData();
      console.log('Fraud data loaded successfully');

      // Load 50 transactions initially for a good starting view
      const initialBatch = getNextBatch(50);
      addEvents(initialBatch);

      // Start streaming with smaller batches for smoother real-time effect
      intervalRef.current = setInterval(() => {
        const batch = getNextBatch(3); // Get 3 events at a time for smoother updates
        if (batch.length > 0) {
          addEvents(batch);
        }
      }, updateFrequency);

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load fraud data:', error);
      setIsConnected(false);
      setIsLoading(false);
    }
  }, [updateFrequency, addEvents]);

  const stopDataStream = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setEvents([]);
    setChartData([]);
    setCharts([]);
    setAnomalies([]);
    updateCounterRef.current = 0;
  }, []);

  const updateFrequencyRate = useCallback((newFrequency) => {
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