import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface User {
  id: string;
  name: string;
  display_name: string;
  created_at: string;
}

export interface Update {
  id: string;
  user_id: string;
  content: string;
  emotion_type: string;
  timestamp: string;
  is_read: boolean;
  created_at: string;
}

export interface HeartbeatConfig {
  id: string;
  start_date: string;
  updated_at: string;
}