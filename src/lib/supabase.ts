import { createClient } from '@supabase/supabase-js';

export function normalizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let clean = rawUrl.trim();
  if (!clean) return '';
  
  // Remove leading/trailing quotes if user accidentally pasted with quotes
  clean = clean.replace(/^['"]+|['"]+$/g, '');

  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'https://' + clean;
  }

  try {
    const urlObj = new URL(clean);
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch {
    return clean.replace(/\/+$/, '');
  }
}

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
export const supabaseAnonKey = rawSupabaseAnonKey.trim();

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getSupabaseClient(customUrl?: string, customKey?: string) {
  const urlParam = customUrl || supabaseUrl || localStorage.getItem('smart_vidros_supabase_url') || '';
  const keyParam = customKey || supabaseAnonKey || localStorage.getItem('smart_vidros_supabase_key') || '';
  
  const cleanUrl = normalizeSupabaseUrl(urlParam);
  const cleanKey = keyParam.trim();

  if (!cleanUrl || !cleanKey) return null;
  
  return createClient(cleanUrl, cleanKey);
}

