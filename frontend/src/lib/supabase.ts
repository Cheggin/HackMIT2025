import { createClient } from '@supabase/supabase-js';

// These will be replaced with actual environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for Supabase tables
export interface DbProduct {
  id: string;
  name: string;
  tagline: string;
  description?: string;
  logo_url?: string;
  website?: string;
  categories: string[];
  submitted_by: string;
  created_at: string;
  updated_at: string;
}

export interface DbAIAnalysis {
  id: string;
  product_id: string;
  agent_id: string;
  score: number;
  summary: string;
  pros: string[];
  cons: string[];
  created_at: string;
}

export interface DbThread {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface DbUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
}