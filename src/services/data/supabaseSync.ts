import { getSupabaseClient, normalizeSupabaseUrl, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '../../lib/supabase';
import {
  CompanyInfo,
  UserAccount,
  Client,
  Quote,
  Sale,
  Receivable,
  Receipt,
  CatalogItem,
  ManagerTask,
} from '../../types';

const SYNC_TIMESTAMP_KEY = 'smart_vidros_last_supabase_sync';
const SUPABASE_URL_KEY = 'smart_vidros_supabase_url';
const SUPABASE_KEY_KEY = 'smart_vidros_supabase_key';
const KEEP_ALIVE_KEY = 'smart_vidros_supabase_last_ping';

export interface SupabaseConfig {
  url: string;
  key: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  pushedCount?: number;
  pulledCount?: number;
}

// Obter Configurações
export function getSupabaseConfig(): SupabaseConfig {
  const url = normalizeSupabaseUrl(
    import.meta.env.VITE_SUPABASE_URL ||
    localStorage.getItem(SUPABASE_URL_KEY) ||
    DEFAULT_SUPABASE_URL
  );
  const key = (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    localStorage.getItem(SUPABASE_KEY_KEY) ||
    DEFAULT_SUPABASE_ANON_KEY
  ).trim();
  return { url, key };
}

// Salvar Configurações
export function saveSupabaseConfig(url: string, key: string) {
  const cleanUrl = normalizeSupabaseUrl(url);
  const cleanKey = key.trim();
  localStorage.setItem(SUPABASE_URL_KEY, cleanUrl);
  localStorage.setItem(SUPABASE_KEY_KEY, cleanKey);
}

// Obter Timestamp da Última Sincronização
export function getLastSyncTime(): string | null {
  return localStorage.getItem(SYNC_TIMESTAMP_KEY);
}

// Obter Timestamp do Último Keep-Alive
export function getLastKeepAliveTime(): string | null {
  return localStorage.getItem(KEEP_ALIVE_KEY);
}

// Testar Conexão com Supabase
export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = getSupabaseClient(customUrl, customKey);
    if (!client) {
      return { success: false, message: 'URL ou Chave Anon do Supabase não configuradas.' };
    }

    const { error } = await client.from('companies').select('id').limit(1);
    if (error) {
      return { success: false, message: `Erro ao conectar no Supabase: ${error.message}` };
    }

    // Registra o ping de keep-alive bem-sucedido
    localStorage.setItem(KEEP_ALIVE_KEY, new Date().toISOString());

    return { success: true, message: 'Conexão com o banco Supabase estabelecida com sucesso!' };
  } catch (err: any) {
    return { success: false, message: `Falha na conexão: ${err.message || 'Erro desconhecido'}` };
  }
}

// ============================================================
// KEEP-ALIVE ANTI-INATIVIDADE (PLANO GRATUITO SUPABASE)
// ============================================================
export async function pingSupabase(): Promise<{ success: boolean; timestamp: string; message: string }> {
  try {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, timestamp: '', message: 'Supabase não conectado.' };
    }
    const { error } = await client.from('companies').select('id').limit(1);
    const now = new Date().toISOString();
    if (error) {
      return { success: false, timestamp: now, message: error.message };
    }
    localStorage.setItem(KEEP_ALIVE_KEY, now);
    return { success: true, timestamp: now, message: 'Banco de dados ativo e pronto para uso!' };
  } catch (err: any) {
    return { success: false, timestamp: '', message: err.message || 'Erro no ping do banco.' };
  }
}

let keepAliveIntervalId: any = null;
export function initSupabaseKeepAlive(): void {
  if (keepAliveIntervalId) return;
  // Dispara um ping leve inicial
  pingSupabase().catch(() => {});
  // Repete a cada 4 horas enquanto o app estiver em execução
  keepAliveIntervalId = setInterval(() => {
    pingSupabase().catch(() => {});
  }, 4 * 60 * 60 * 1000);
}

// ============================================================
// MAPER DE ENTIDADES LOCAIS PARA TABELAS DO SUPABASE
// ============================================================
function mapEntityToSupabaseRow(table: string, entity: any): Record<string, any> | null {
  if (!entity) return null;

  switch (table) {
    case 'companies':
      return {
        id: entity.id || 'comp-smart-vidros-001',
        name: entity.name || 'Smart Vidros',
        owner_name: entity.ownerName || '',
        cnpj: entity.cnpj || '',
        phone: entity.phone || '',
        email: entity.email || '',
        address: entity.address || '',
        city: entity.city || '',
        logo_url: entity.logoUrl || null,
        updated_at: new Date().toISOString(),
      };

    case 'user_accounts':
      return {
        id: entity.id,
        company_id: entity.companyId || 'comp-smart-vidros-001',
        name: entity.name,
        email: entity.email,
        username: entity.username || entity.email.split('@')[0],
        password: entity.password || '123456',
        role: entity.role || 'operador',
        status: entity.status || 'pendente',
        approved_at: entity.approvedAt || null,
        approved_by: entity.approvedBy || null,
        created_at: entity.createdAt || new Date().toISOString(),
        updated_at: entity.updatedAt || new Date().toISOString(),
      };

    case 'clients':
      return {
        id: entity.id,
        company_id: entity.companyId || 'comp-smart-vidros-001',
        name: entity.name,
        document: entity.cpfCnpj || null,
        phone: entity.phone || entity.whatsapp || null,
        email: entity.email || null,
        address: entity.address || null,
        city: entity.city || null,
        notes: entity.notes || null,
        created_at: entity.createdAt || new Date().toISOString(),
        updated_at: entity.updatedAt || new Date().toISOString(),
      };

    case 'quotes':
      return {
        id: entity.id,
        company_id: entity.companyId || 'comp-smart-vidros-001',
        code: entity.code,
        client_name: entity.clientName || 'Cliente',
        client_phone: entity.clientPhone || null,
        total_amount: entity.total || 0,
        discount_amount: entity.discountAmount || 0,
        status: entity.status || 'rascunho',
        items: entity.items || [],
        notes: entity.notes || null,
        created_at: entity.createdAt || new Date().toISOString(),
        updated_at: entity.updatedAt || new Date().toISOString(),
      };

    case 'sales':
      return {
        id: entity.id,
        company_id: entity.companyId || 'comp-smart-vidros-001',
        quote_id: entity.quoteId || null,
        code: entity.code,
        client_name: entity.clientName || 'Cliente Balcão',
        client_phone: entity.clientPhone || null,
        total_amount: entity.total || 0,
        payment_method: entity.payments && entity.payments[0] ? entity.payments[0].method : 'PIX',
        status: entity.status === 'concluida' ? 'concluido' : 'cancelado',
        items: entity.items || [],
        notes: entity.notes || null,
        created_at: entity.createdAt || new Date().toISOString(),
        finalized_at: entity.updatedAt || new Date().toISOString(),
      };

    case 'accounts_receivable':
      return {
        id: entity.id,
        company_id: entity.companyId || 'comp-smart-vidros-001',
        sale_id: entity.saleId || null,
        quote_id: entity.quoteId || null,
        client_name: entity.clientName || 'Cliente',
        description: entity.notes || `Conta a receber ${entity.saleCode || ''}`,
        amount: entity.totalAmount || entity.remainingAmount || 0,
        due_date: entity.installments && entity.installments[0] ? entity.installments[0].dueDate : new Date().toISOString(),
        status: entity.status || 'pendente',
        created_at: entity.createdAt || new Date().toISOString(),
      };

    case 'receipts':
      return {
        id: entity.id,
        company_id: entity.companyId || 'comp-smart-vidros-001',
        sale_id: entity.saleId || null,
        receivable_id: entity.receivableId || null,
        code: entity.code,
        client_name: entity.clientName || 'Cliente',
        amount: entity.amount || 0,
        payment_method: 'PIX',
        description: entity.service || null,
        created_at: entity.createdAt || new Date().toISOString(),
      };

    case 'catalog':
      return {
        id: entity.id,
        company_id: entity.companyId || 'comp-smart-vidros-001',
        name: entity.name,
        category: entity.category || 'vidros',
        unit: entity.unit || 'm2',
        unit_price: entity.unitPrice || entity.pricePerM2 || 0,
        description: entity.description || null,
        created_at: entity.createdAt || new Date().toISOString(),
      };

    case 'contracts':
      return {
        id: entity.id,
        company_id: entity.companyId || 'comp-smart-vidros-001',
        sale_id: entity.saleId || null,
        quote_id: entity.quoteId || null,
        code: entity.code,
        client_name: entity.clientName || 'Cliente',
        total_amount: entity.totalAmount || 0,
        status: entity.status || 'ativo',
        created_at: entity.createdAt || new Date().toISOString(),
        updated_at: entity.updatedAt || new Date().toISOString(),
      };

    default:
      return null;
  }
}

// ============================================================
// AUTO-SYNC HOOK EM TEMPO REAL
// ============================================================
export function autoSyncEntityChange(
  table: 'companies' | 'user_accounts' | 'clients' | 'quotes' | 'sales' | 'accounts_receivable' | 'receipts' | 'catalog' | 'contracts',
  action: 'upsert' | 'delete',
  data: any
): void {
  // Executa de forma assíncrona em segundo plano sem bloquear a interface
  setTimeout(async () => {
    try {
      const client = getSupabaseClient();
      if (!client) return;

      if (action === 'delete') {
        const id = typeof data === 'string' ? data : data?.id;
        if (id) {
          await client.from(table).delete().eq('id', id);
        }
      } else {
        const mappedRow = mapEntityToSupabaseRow(table, data);
        if (mappedRow) {
          await client.from(table).upsert([mappedRow]);
        }
      }
    } catch (err) {
      console.warn(`[AutoSync] Não foi possível persistir no Supabase (${table}):`, err);
    }
  }, 100);
}

// ============================================================
// ENVIAR DADOS LOCAIS PARA O SUPABASE (PUSH)
// ============================================================
export async function pushAllToSupabase(): Promise<SyncResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase não está configurado. Informe a URL e Chave.' };
  }

  try {
    let totalPushed = 0;

    // 1. Empresa
    const companyDataStr = localStorage.getItem('smart_vidros_company');
    if (companyDataStr) {
      const company: CompanyInfo = JSON.parse(companyDataStr);
      const row = {
        id: company.id || 'comp-smart-vidros-001',
        name: company.name || 'Smart Vidros',
        owner_name: company.ownerName || '',
        cnpj: company.cnpj || '',
        phone: company.phone || '',
        email: company.email || '',
        address: company.address || '',
        city: company.city || '',
        logo_url: company.logoUrl || null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await client.from('companies').upsert([row]);
      if (!error) totalPushed++;
    }

    // 2. Usuários
    const usersStr = localStorage.getItem('smart_vidros_user_accounts');
    if (usersStr) {
      const users: UserAccount[] = JSON.parse(usersStr);
      if (users.length > 0) {
        const rows = users.map((u) => ({
          id: u.id,
          company_id: u.companyId || 'comp-smart-vidros-001',
          name: u.name,
          email: u.email,
          username: u.username || u.email.split('@')[0],
          password: u.password || '123456',
          role: u.role,
          status: u.status,
          approved_at: u.approvedAt || null,
          approved_by: u.approvedBy || null,
          created_at: u.createdAt || new Date().toISOString(),
          updated_at: u.updatedAt || new Date().toISOString(),
        }));
        const { error } = await client.from('user_accounts').upsert(rows);
        if (!error) totalPushed += users.length;
      }
    }

    // 3. Clientes
    const clientsStr = localStorage.getItem('smart_vidros_clients');
    if (clientsStr) {
      const clients: Client[] = JSON.parse(clientsStr);
      if (clients.length > 0) {
        const rows = clients.map((c) => ({
          id: c.id,
          company_id: c.companyId || 'comp-smart-vidros-001',
          name: c.name,
          document: c.cpfCnpj || null,
          phone: c.phone || c.whatsapp || null,
          email: c.email || null,
          address: c.address || null,
          city: c.city || null,
          notes: c.notes || null,
          created_at: c.createdAt || new Date().toISOString(),
          updated_at: c.updatedAt || new Date().toISOString(),
        }));
        const { error } = await client.from('clients').upsert(rows);
        if (!error) totalPushed += clients.length;
      }
    }

    // 4. Orçamentos
    const quotesStr = localStorage.getItem('smart_vidros_quotes');
    if (quotesStr) {
      const quotes: Quote[] = JSON.parse(quotesStr);
      if (quotes.length > 0) {
        const rows = quotes.map((q) => ({
          id: q.id,
          company_id: q.companyId || 'comp-smart-vidros-001',
          code: q.code,
          client_name: q.clientName || 'Cliente não identificado',
          client_phone: q.clientPhone || null,
          total_amount: q.total || 0,
          discount_amount: q.discountAmount || 0,
          status: q.status || 'rascunho',
          items: q.items || [],
          notes: q.notes || null,
          created_at: q.createdAt || new Date().toISOString(),
          updated_at: q.updatedAt || new Date().toISOString(),
        }));
        const { error } = await client.from('quotes').upsert(rows);
        if (!error) totalPushed += quotes.length;
      }
    }

    // 5. Vendas / PDV
    const salesStr = localStorage.getItem('smart_vidros_sales');
    if (salesStr) {
      const sales: Sale[] = JSON.parse(salesStr);
      if (sales.length > 0) {
        const rows = sales.map((s) => ({
          id: s.id,
          company_id: s.companyId || 'comp-smart-vidros-001',
          quote_id: s.quoteId || null,
          code: s.code,
          client_name: s.clientName || 'Cliente Balcão',
          client_phone: s.clientPhone || null,
          total_amount: s.total || 0,
          payment_method: s.payments && s.payments[0] ? s.payments[0].method : 'PIX',
          status: s.status === 'concluida' ? 'concluido' : 'cancelado',
          items: s.items || [],
          notes: s.notes || null,
          created_at: s.createdAt || new Date().toISOString(),
          finalized_at: s.updatedAt || new Date().toISOString(),
        }));
        const { error } = await client.from('sales').upsert(rows);
        if (!error) totalPushed += sales.length;
      }
    }

    // 6. Contas a Receber / Fiados
    const recsStr = localStorage.getItem('smart_vidros_receivables');
    if (recsStr) {
      const recs: Receivable[] = JSON.parse(recsStr);
      if (recs.length > 0) {
        const rows = recs.map((r) => ({
          id: r.id,
          company_id: r.companyId || 'comp-smart-vidros-001',
          sale_id: r.saleId || null,
          quote_id: r.quoteId || null,
          client_name: r.clientName || 'Cliente',
          description: r.notes || `Venda ${r.saleCode}`,
          amount: r.totalAmount || 0,
          due_date: r.installments && r.installments[0] ? r.installments[0].dueDate : new Date().toISOString(),
          status: r.status || 'pendente',
          created_at: r.createdAt || new Date().toISOString(),
        }));
        const { error } = await client.from('accounts_receivable').upsert(rows);
        if (!error) totalPushed += recs.length;
      }
    }

    // 7. Recibos
    const receiptsStr = localStorage.getItem('smart_vidros_receipts');
    if (receiptsStr) {
      const receipts: Receipt[] = JSON.parse(receiptsStr);
      if (receipts.length > 0) {
        const rows = receipts.map((rc) => ({
          id: rc.id,
          company_id: rc.companyId || 'comp-smart-vidros-001',
          sale_id: rc.saleId || null,
          receivable_id: rc.receivableId || null,
          code: rc.code,
          client_name: rc.clientName,
          amount: rc.amount || 0,
          payment_method: 'PIX',
          description: rc.service || null,
          created_at: rc.createdAt || new Date().toISOString(),
        }));
        const { error } = await client.from('receipts').upsert(rows);
        if (!error) totalPushed += receipts.length;
      }
    }

    // 8. Catálogo / Produtos
    const catalogStr = localStorage.getItem('smart_vidros_catalog');
    if (catalogStr) {
      const catalog: CatalogItem[] = JSON.parse(catalogStr);
      if (catalog.length > 0) {
        const rows = catalog.map((ci) => ({
          id: ci.id,
          company_id: ci.companyId || 'comp-smart-vidros-001',
          name: ci.name,
          description: ci.description || null,
          unit_price: ci.defaultPrice || 0,
          type: ci.type || 'produto',
          category: ci.category || 'produto',
          unit_of_measure: ci.unit || 'un',
          created_at: ci.createdAt || new Date().toISOString(),
        }));
        const { error } = await client.from('catalog_items').upsert(rows);
        if (!error) totalPushed += catalog.length;
      }
    }

    // 9. Tarefas do Gerente
    const tasksStr = localStorage.getItem('smart_vidros_manager_tasks');
    if (tasksStr) {
      const tasks: ManagerTask[] = JSON.parse(tasksStr);
      if (tasks.length > 0) {
        const rows = tasks.map((t) => ({
          id: t.id,
          company_id: t.companyId || 'comp-smart-vidros-001',
          title: t.title,
          priority: t.priority || 'media',
          completed: !!t.completed,
          due_date: t.dueDate || null,
          created_at: t.createdAt || new Date().toISOString(),
        }));
        const { error } = await client.from('manager_tasks').upsert(rows);
        if (!error) totalPushed += tasks.length;
      }
    }

    const now = new Date().toISOString();
    localStorage.setItem(SYNC_TIMESTAMP_KEY, now);

    return {
      success: true,
      message: 'Todos os dados locais foram enviados com sucesso para o banco Supabase!',
      pushedCount: totalPushed,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao enviar dados para o Supabase: ${err.message || 'Erro na requisição'}`,
    };
  }
}

// ============================================================
// BAIXAR DADOS DO SUPABASE PARA O LOCALSTORAGE (PULL)
// ============================================================
export async function pullAllFromSupabase(): Promise<SyncResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase não está configurado.' };
  }

  try {
    let pulledTotal = 0;

    // 1. Empresa
    const { data: companies } = await client.from('companies').select('*');
    if (companies && companies.length > 0) {
      const c = companies[0];
      const companyModel: CompanyInfo = {
        id: c.id,
        name: c.name,
        ownerName: c.owner_name,
        cnpj: c.cnpj,
        phone: c.phone,
        email: c.email,
        address: c.address,
        city: c.city,
        logoUrl: c.logo_url,
      };
      localStorage.setItem('smart_vidros_company', JSON.stringify(companyModel));
      pulledTotal++;
    }

    // 2. Usuários
    const { data: users } = await client.from('user_accounts').select('*');
    if (users && users.length > 0) {
      const userModels: UserAccount[] = users.map((u) => ({
        id: u.id,
        companyId: u.company_id || 'comp-smart-vidros-001',
        name: u.name,
        email: u.email,
        username: u.username,
        password: u.password,
        role: u.role || 'vendedor',
        status: u.status || 'aprovado',
        createdAt: u.created_at,
        updatedAt: u.updated_at,
        approvedAt: u.approved_at,
        approvedBy: u.approved_by,
      }));
      localStorage.setItem('smart_vidros_user_accounts', JSON.stringify(userModels));
      pulledTotal += users.length;
    }

    // 3. Clientes
    const { data: clients } = await client.from('clients').select('*');
    if (clients && clients.length > 0) {
      const clientModels: Client[] = clients.map((c) => ({
        id: c.id,
        companyId: c.company_id,
        name: c.name,
        cpfCnpj: c.document,
        phone: c.phone,
        whatsapp: c.phone,
        email: c.email,
        address: c.address,
        city: c.city,
        notes: c.notes,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));
      localStorage.setItem('smart_vidros_clients', JSON.stringify(clientModels));
      pulledTotal += clients.length;
    }

    // 4. Orçamentos
    const { data: quotes } = await client.from('quotes').select('*');
    if (quotes && quotes.length > 0) {
      const quoteModels: Quote[] = quotes.map((q) => ({
        id: q.id,
        companyId: q.company_id,
        code: q.code,
        clientName: q.client_name,
        clientPhone: q.client_phone,
        date: q.created_at ? q.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: q.created_at,
        updatedAt: q.updated_at,
        status: q.status || 'rascunho',
        items: q.items || [],
        discountType: 'fixed',
        discountValue: q.discount_amount || 0,
        subtotal: (q.total_amount || 0) + (q.discount_amount || 0),
        discountAmount: q.discount_amount || 0,
        total: q.total_amount || 0,
        notes: q.notes,
      }));
      localStorage.setItem('smart_vidros_quotes', JSON.stringify(quoteModels));
      pulledTotal += quotes.length;
    }

    // 5. Vendas
    const { data: sales } = await client.from('sales').select('*');
    if (sales && sales.length > 0) {
      const saleModels: Sale[] = sales.map((s) => ({
        id: s.id,
        companyId: s.company_id,
        code: s.code,
        quoteId: s.quote_id,
        clientName: s.client_name,
        clientPhone: s.client_phone,
        date: s.created_at ? s.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: s.created_at,
        updatedAt: s.finalized_at || s.created_at,
        items: s.items || [],
        subtotal: s.total_amount || 0,
        discountType: 'fixed',
        discountValue: 0,
        discountAmount: 0,
        total: s.total_amount || 0,
        payments: [{ id: 'p1', method: s.payment_method || 'pix', amount: s.total_amount || 0 }],
        totalPaid: s.total_amount || 0,
        totalFiado: 0,
        status: s.status === 'concluido' ? 'concluida' : 'cancelada',
        notes: s.notes,
      }));
      localStorage.setItem('smart_vidros_sales', JSON.stringify(saleModels));
      pulledTotal += sales.length;
    }

    const now = new Date().toISOString();
    localStorage.setItem(SYNC_TIMESTAMP_KEY, now);

    return {
      success: true,
      message: 'Sincronização concluída! Os dados do banco Supabase foram baixados com sucesso.',
      pulledCount: pulledTotal,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao baixar dados do Supabase: ${err.message || 'Erro na requisição'}`,
    };
  }
}

// Sincronização Completa (Push + Pull)
export async function syncAllWithSupabase(): Promise<SyncResult> {
  const pushRes = await pushAllToSupabase();
  if (!pushRes.success) return pushRes;

  const pullRes = await pullAllFromSupabase();
  if (!pullRes.success) return pullRes;

  return {
    success: true,
    message: `Sincronização bidirecional concluída com sucesso! (${pushRes.pushedCount || 0} enviados, ${pullRes.pulledCount || 0} recebidos)`,
  };
}
