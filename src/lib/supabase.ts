import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

// Endereço e chave PÚBLICA (publishable/anon) do projeto.
// Esta chave é pública por definição: a proteção dos dados é feita pelas políticas RLS no banco.
export const DEFAULT_SUPABASE_URL = 'https://mvcioslwzrbwiikjkazc.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_mHG7C53XivQerakOoyJy7g_FISzEohr';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
export const supabaseAnonKey = rawSupabaseAnonKey.trim();

/**
 * Uma única instância por projeto. Isso é essencial para o login:
 * a sessão do usuário (token) precisa ser compartilhada por todas as chamadas ao banco.
 */
const clientCache = new Map<string, SupabaseClient>();

function getOrCreateClient(url: string, key: string): SupabaseClient {
  const cacheKey = `${url}|${key}`;
  let client = clientCache.get(cacheKey);
  if (!client) {
    client = createClient(url, key);
    clientCache.set(cacheKey, client);
  }
  return client;
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? getOrCreateClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getSupabaseClient(customUrl?: string, customKey?: string): SupabaseClient | null {
  let storedUrl: string | null = null;
  let storedKey: string | null = null;
  try {
    storedUrl = localStorage.getItem('smart_vidros_supabase_url');
    storedKey = localStorage.getItem('smart_vidros_supabase_key');
  } catch {
    // Armazenamento indisponível (ex.: modo privado restrito): usa a configuração padrão
  }

  const urlParam = customUrl || storedUrl || supabaseUrl || DEFAULT_SUPABASE_URL;
  const keyParam = customKey || storedKey || supabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY;

  const cleanUrl = normalizeSupabaseUrl(urlParam);
  const cleanKey = keyParam.trim();

  if (!cleanUrl || !cleanKey) return null;

  return getOrCreateClient(cleanUrl, cleanKey);
}
