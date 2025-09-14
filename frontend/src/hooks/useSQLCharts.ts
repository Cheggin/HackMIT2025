import { useState, useEffect, useCallback } from 'react';
import { supabase, getPaginationState, hasValidCursor, paginationEvents } from '../utils/supabaseDataLoader';
import { generateChartsFromSQL } from '../utils/sqlChartService';
import type { AnyChartData } from '../types/charts';

// Legacy interface removed: we now consume results from generateChartsFromSQL

export function useSQLCharts(updateFrequency: number = 3000) {
  const [charts, setCharts] = useState<{ type: string; title: string; data: AnyChartData }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [waitingForPagination, setWaitingForPagination] = useState(true);

  // No adapter: return typed charts directly for new components

  // Fetch charts from the database (via typed SQL generator)
  const fetchCharts = useCallback(async () => {
    // Wait for pagination to have a valid cursor
    if (!hasValidCursor()) {
      console.log('SQL charts waiting for pagination to load first page...');
      setWaitingForPagination(true);
      return;
    }

    setWaitingForPagination(false);

    try {
      // Get the current pagination cursor from supabaseDataLoader
      const paginationState = getPaginationState();
      const before = paginationState.cursor;
      
      if (!before) {
        console.warn('No valid cursor available, skipping chart fetch');
        return;
      }
      
      console.log('Fetching SQL charts with before timestamp:', before);
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

  // Poll for pagination readiness
  useEffect(() => {
    if (waitingForPagination) {
      const paginationCheckInterval = setInterval(() => {
        if (hasValidCursor()) {
          console.log('Pagination ready, fetching SQL charts...');
          fetchCharts();
          clearInterval(paginationCheckInterval);
        }
      }, 100); // Check every 100ms for pagination readiness

      return () => clearInterval(paginationCheckInterval);
    }
  }, [waitingForPagination, fetchCharts]);

  // Keep-alive: also refresh on a fixed cadence aligned with pagination
  // This ensures charts keep updating (e.g., recomputing windows) even when
  // the cursor hasn't advanced, while still staying in sync with pagination.
  useEffect(() => {
    if (!waitingForPagination) {
      const interval = setInterval(() => {
        if (hasValidCursor()) {
          fetchCharts();
        }
      }, updateFrequency);

      return () => clearInterval(interval);
    }
  }, [waitingForPagination, updateFrequency, fetchCharts]);

  // Listen for pagination changes and update charts accordingly
  useEffect(() => {
    if (!waitingForPagination) {
      const unsubscribe = paginationEvents.subscribe(() => {
        console.log('Pagination cursor changed, updating SQL charts...');
        fetchCharts();
      });

      return unsubscribe;
    }
  }, [waitingForPagination, fetchCharts]);

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
    isLoading: isLoading || waitingForPagination,
    error,
    waitingForPagination,
    refetch: fetchCharts
  };
}