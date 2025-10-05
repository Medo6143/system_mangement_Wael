import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-supabase-url.com';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Record = {
  id: string;
  user_id: string;
  date: string;
  students_count: number;
  price_per_student: number;
  teacher_profit: number;
  school_profit: number;
  total: number;
  created_at: string;
};

export type Archive = {
  id: string;
  user_id: string;
  month: number;
  year: number;
  total_students: number;
  total_teacher_profit: number;
  total_school_profit: number;
  total_income: number;
  records_data: Record[];
  created_at: string;
};
