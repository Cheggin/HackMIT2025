import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseDataLoader';
import { generateChartsFromSQL } from '../utils/sqlChartService';
import type { AnyChartData } from '../types/charts';

// Legacy interface removed: we now consume results from generateChartsFromSQL

export function useSQLCharts(refreshInterval: number = 3000) {
  const [charts, setCharts] = useState<{ type: string; title: string; data: AnyChartData }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // No adapter: return typed charts directly for new components

  // Fetch charts from the database (via typed SQL generator)
  const fetchCharts = useCallback(async () => {
    try {
      const before = 0;
      const typedCharts = await generateChartsFromSQL(before);
      setCharts(typedCharts);
      setError(null);
    } catch (err) {
      console.error('Error in fetchCharts:', err);
      setError('Failed to fetch charts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up polling
  useEffect(() => {
    fetchCharts(); // Initial fetch

    const interval = setInterval(fetchCharts, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchCharts, refreshInterval]);

  // Subscribe to changes in the graphs table
  useEffect(() => {
    const subscription = supabase
      .channel('graphs_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'graphs'
      }, () => {
        // When graphs table changes, refetch charts
        fetchCharts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchCharts]);

  return {
    charts,
    isLoading,
    error,
    refetch: fetchCharts
  };
}