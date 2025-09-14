import { supabase } from '../utils/supabaseDataLoader';

export interface GeneratedGraph {
  id: string;
  type: string;
  title: string;
  sql_query: string;
  extra?: any;
  justification?: string;
}

export interface GeneratedChartData {
  graph: GeneratedGraph;
  data: any[];
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://hackmit2025-api.loca.lt';

export async function generateGraphFromPrompt(prompt: string): Promise<GeneratedGraph> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/generate-graph`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request: prompt
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate graph');
    }

    const graph: GeneratedGraph = await response.json();
    return graph;
  } catch (error) {
    console.error('Error generating graph:', error);
    throw error;
  }
}

export async function executeGeneratedGraph(graph: GeneratedGraph): Promise<any[]> {
  try {
    // Get the current pagination cursor for time filtering
    const { getPaginationState, hasValidCursor } = await import('../utils/supabaseDataLoader');

    // Get the current time cursor
    let before: number;
    if (hasValidCursor()) {
      const paginationState = getPaginationState();
      before = paginationState.cursor || Date.now();
    } else {
      // Use current timestamp if no pagination cursor available
      before = Date.now();
    }

    // Wrap the query with a CTE to filter by time, just like the existing charts do
    const modifiedQuery = `WITH events AS (SELECT * FROM public.events WHERE time <= ${before})\n${graph.sql_query}`;

    console.log('Executing exploratory SQL query with before timestamp:', before);
    console.log('Modified query:', modifiedQuery);

    // Execute the SQL query using the RPC function
    const { data, error } = await supabase.rpc('sql', {
      modifiedquery: modifiedQuery
    });

    if (error) {
      console.error('Error executing generated SQL:', error);
      throw error;
    }

    console.log('Exploratory SQL query result:', data);
    return data || [];
  } catch (error) {
    console.error('Error executing graph query:', error);
    throw error;
  }
}

export async function generateAndExecuteGraph(prompt: string): Promise<GeneratedChartData> {
  // First, generate the graph from the prompt
  const graph = await generateGraphFromPrompt(prompt);

  // Then execute the SQL to get the data
  const data = await executeGeneratedGraph(graph);

  return {
    graph,
    data
  };
}