import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function safeQuery(handler, fallback = []) {
  if (!supabase) return { data: fallback, error: 'Supabase não configurado' };
  try {
    const response = await handler();
    return response;
  } catch (error) {
    return { data: fallback, error: error.message || 'Erro inesperado' };
  }
}
