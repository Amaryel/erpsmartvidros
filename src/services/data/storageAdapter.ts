/**
 * Interface genérica do Adaptador de Armazenamento.
 * Permite alternar entre LocalStorageAdapter (atual) e SupabaseAdapter (futuro)
 * sem alterar a lógica de negócio ou os componentes da interface.
 */

export interface IStorageAdapter {
  getItem<T>(key: string, defaultValue?: T): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
}

export class LocalStorageAdapter implements IStorageAdapter {
  getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const data = localStorage.getItem(key);
      if (data === null) {
        return defaultValue !== undefined ? defaultValue : null;
      }
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`[LocalStorageAdapter] Erro ao ler a chave "${key}":`, error);
      return defaultValue !== undefined ? defaultValue : null;
    }
  }

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`[LocalStorageAdapter] Erro ao salvar a chave "${key}":`, error);
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`[LocalStorageAdapter] Erro ao remover a chave "${key}":`, error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('[LocalStorageAdapter] Erro ao limpar o armazenamento:', error);
    }
  }
}

/**
 * Placeholder para o futuro Adaptador Supabase.
 * Quando o Supabase for conectado futuramente, este adaptador será implementado
 * para consultar as tabelas remotas via Supabase Client (`@supabase/supabase-js`).
 */
export class SupabaseAdapterPlaceholder implements IStorageAdapter {
  getItem<T>(_key: string, _defaultValue?: T): T | null {
    throw new Error('SupabaseAdapter não está conectado nesta fase de preparação. Use LocalStorageAdapter.');
  }

  setItem<T>(_key: string, _value: T): void {
    throw new Error('SupabaseAdapter não está conectado nesta fase de preparação. Use LocalStorageAdapter.');
  }

  removeItem(_key: string): void {
    throw new Error('SupabaseAdapter não está conectado nesta fase de preparação. Use LocalStorageAdapter.');
  }

  clear(): void {
    throw new Error('SupabaseAdapter não está conectado nesta fase de preparação. Use LocalStorageAdapter.');
  }
}

// Instância ativa padrão para o ambiente de desenvolvimento local
export const storageAdapter: IStorageAdapter = new LocalStorageAdapter();
