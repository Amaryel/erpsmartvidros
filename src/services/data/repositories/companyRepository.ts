import { CompanyInfo } from '../../../types';
import { storageAdapter } from '../storageAdapter';
import { getCurrentCompanyId } from '../auth';
import { autoSyncEntityChange } from '../supabaseSync';
import { getSupabaseClient } from '../../../lib/supabase';

const COMPANY_KEY = 'smart_vidros_company';

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  id: getCurrentCompanyId(),
  companyId: getCurrentCompanyId(),
  name: 'Smart Vidros',
  ownerName: 'James Clayton do Nascimento',
  cnpj: '51.840.669/0001-22',
  phone: '(89) 9 9991-0028',
  email: 'contato.smartvidros@gmail.com',
  address: 'Rua Projetada – Sussuapara-PI',
  city: 'Picos – PI',
  logoUrl: '/logo.png',
};

export function getCompanyInfo(): CompanyInfo {
  const data = storageAdapter.getItem<CompanyInfo>(COMPANY_KEY, null);
  if (!data) return DEFAULT_COMPANY_INFO;
  
  // Limpa logos antigas que tinham fundo cinza/quadrado ou formatos incompatíveis
  let currentLogo = data.logoUrl;
  if (
    !currentLogo ||
    currentLogo.includes('178') ||
    currentLogo.includes('badge') ||
    currentLogo.includes('smart_vidros_') ||
    currentLogo.endsWith('.jpg') ||
    currentLogo.includes('.svg')
  ) {
    currentLogo = '/logo.png';
  }

  return {
    ...DEFAULT_COMPANY_INFO,
    ...data,
    logoUrl: currentLogo,
  };
}

export function saveCompanyInfo(info: CompanyInfo): void {
  const now = new Date().toISOString();
  const updatedInfo: CompanyInfo = {
    ...DEFAULT_COMPANY_INFO,
    ...info,
    updatedAt: now,
  };
  storageAdapter.setItem(COMPANY_KEY, updatedInfo);
  autoSyncEntityChange('companies', 'upsert', updatedInfo);
}

export interface ResetOptions {
  products?: boolean;
  clients?: boolean;
  quotes?: boolean;
  receipts?: boolean;
  sales?: boolean;
  receivables?: boolean;
  contracts?: boolean;
}

/**
 * Função central de zerar dados do sistema (Local + Nuvem Supabase)
 */
export async function resetSystemDatabase(options: ResetOptions): Promise<void> {
  const supabase = getSupabaseClient();

  // 1. Catálogo de Produtos
  if (options.products) {
    storageAdapter.setItem('smart_vidros_catalog', []);
    if (supabase) {
      try {
        await supabase.from('catalog_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.warn('[Reset] Erro ao limpar catalog_items no Supabase:', err);
      }
    }
  }

  // 2. Clientes
  if (options.clients) {
    storageAdapter.setItem('smart_vidros_clients', []);
    if (supabase) {
      try {
        await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.warn('[Reset] Erro ao limpar clients no Supabase:', err);
      }
    }
  }

  // 3. Orçamentos
  if (options.quotes) {
    storageAdapter.setItem('smart_vidros_quotes', []);
    storageAdapter.setItem('smart_vidros_counter', '1');
    if (supabase) {
      try {
        await supabase.from('quotes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.warn('[Reset] Erro ao limpar quotes no Supabase:', err);
      }
    }
  }

  // 4. Recibos
  if (options.receipts) {
    storageAdapter.setItem('smart_vidros_receipts', []);
    storageAdapter.setItem('smart_vidros_receipts_counter', '1');
    if (supabase) {
      try {
        await supabase.from('receipts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.warn('[Reset] Erro ao limpar receipts no Supabase:', err);
      }
    }
  }

  // 5. Vendas, Contas a Receber e Contratos
  if (options.sales) {
    storageAdapter.setItem('smart_vidros_sales', []);
    storageAdapter.setItem('smart_vidros_sales_counter', '1');
    storageAdapter.setItem('smart_vidros_receivables', []);
    storageAdapter.setItem('smart_vidros_receivables_counter', '1');
    storageAdapter.setItem('smart_vidros_contracts', []);
    storageAdapter.setItem('smart_vidros_contracts_counter', '1');
    if (supabase) {
      try {
        await Promise.allSettled([
          supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          supabase.from('accounts_receivable').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          supabase.from('contracts').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        ]);
      } catch (err) {
        console.warn('[Reset] Erro ao limpar sales/receivables/contracts no Supabase:', err);
      }
    }
  }
}

