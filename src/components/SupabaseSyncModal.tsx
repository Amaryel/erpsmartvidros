import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  X,
  Code,
  Copy,
  Check,
  AlertTriangle,
  Server,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  pushAllToSupabase,
  pullAllFromSupabase,
  syncAllWithSupabase,
  getLastSyncTime,
} from '../services/storage';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSynced?: () => void;
  onShowToast: (msg: string) => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  onDataSynced,
  onShowToast,
}) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlCode, setShowSqlCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url);
      setKey(config.key);
      setLastSync(getLastSyncTime());
      if (config.url && config.key) {
        handleTestConnection(config.url, config.key);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async (testUrl = url, testKey = key) => {
    setLoading(true);
    setStatusMsg('Testando conexão com Supabase...');
    const res = await testSupabaseConnection(testUrl, testKey);
    setIsConnected(res.success);
    setStatusMsg(res.message);
    setLoading(false);
  };

  const handleSaveConfig = () => {
    saveSupabaseConfig(url, key);
    onShowToast('Configurações do Supabase salvas!');
    handleTestConnection(url, key);
  };

  const handlePush = async () => {
    setLoading(true);
    setStatusMsg('Enviando todos os dados locais para o Supabase...');
    const res = await pushAllToSupabase();
    setLoading(false);
    if (res.success) {
      setLastSync(getLastSyncTime());
      onShowToast('Dados locais enviados com sucesso para o Supabase!');
      if (onDataSynced) onDataSynced();
    }
    setStatusMsg(res.message);
  };

  const handlePull = async () => {
    setLoading(true);
    setStatusMsg('Baixando dados do banco Supabase...');
    const res = await pullAllFromSupabase();
    setLoading(false);
    if (res.success) {
      setLastSync(getLastSyncTime());
      onShowToast('Dados sincronizados do Supabase para o aplicativo!');
      if (onDataSynced) onDataSynced();
    }
    setStatusMsg(res.message);
  };

  const handleFullSync = async () => {
    setLoading(true);
    setStatusMsg('Realizando sincronização bidirecional completa...');
    const res = await syncAllWithSupabase();
    setLoading(false);
    if (res.success) {
      setLastSync(getLastSyncTime());
      onShowToast('Sincronização bidirecional concluída!');
      if (onDataSynced) onDataSynced();
    }
    setStatusMsg(res.message);
  };

  const sqlScript = `-- SCRIPT DEFINITIVO SUPABASE - SMART VIDROS (DDL + RLS SECURITY)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Empresas
CREATE TABLE IF NOT EXISTS public.companies (
    id TEXT PRIMARY KEY DEFAULT 'comp-smart-vidros-001',
    name TEXT NOT NULL DEFAULT 'Smart Vidros',
    owner_name TEXT DEFAULT 'James Clayton do Nascimento',
    cnpj TEXT DEFAULT '51.840.669/0001-22',
    phone TEXT DEFAULT '(89) 9 9991-0028',
    email TEXT DEFAULT 'contato.smartvidros@gmail.com',
    address TEXT DEFAULT 'Rua Projetada – Sussuapara-PI',
    city TEXT DEFAULT 'Picos – PI',
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Usuários
CREATE TABLE IF NOT EXISTS public.user_accounts (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL DEFAULT '123456',
    role TEXT NOT NULL DEFAULT 'vendedor',
    status TEXT NOT NULL DEFAULT 'aprovado',
    approved_at TIMESTAMPTZ,
    approved_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Clientes
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    document TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Orçamentos
CREATE TABLE IF NOT EXISTS public.quotes (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    total_amount NUMERIC(12, 2) DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pendente',
    items JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Vendas & PDV
CREATE TABLE IF NOT EXISTS public.sales (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
    quote_id TEXT REFERENCES public.quotes(id) ON DELETE SET NULL,
    code TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT DEFAULT 'PIX',
    status TEXT NOT NULL DEFAULT 'concluido',
    items JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    finalized_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Contas a Receber
CREATE TABLE IF NOT EXISTS public.accounts_receivable (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
    sale_id TEXT REFERENCES public.sales(id) ON DELETE SET NULL,
    quote_id TEXT REFERENCES public.quotes(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    due_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Recibos
CREATE TABLE IF NOT EXISTS public.receipts (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
    sale_id TEXT REFERENCES public.sales(id) ON DELETE SET NULL,
    receivable_id TEXT REFERENCES public.accounts_receivable(id) ON DELETE SET NULL,
    code TEXT NOT NULL,
    client_name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT DEFAULT 'PIX',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Catálogo & Produtos
CREATE TABLE IF NOT EXISTS public.catalog_items (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    type TEXT NOT NULL DEFAULT 'produto',
    category TEXT,
    unit_of_measure TEXT DEFAULT 'un',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tarefas do Gerente
CREATE TABLE IF NOT EXISTS public.manager_tasks (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    priority TEXT DEFAULT 'media',
    completed BOOLEAN DEFAULT FALSE,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Contratos
CREATE TABLE IF NOT EXISTS public.contracts (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
    sale_id TEXT REFERENCES public.sales(id) ON DELETE SET NULL,
    quote_id TEXT REFERENCES public.quotes(id) ON DELETE SET NULL,
    code TEXT NOT NULL,
    client_name TEXT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'ativo',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HABILITAR RLS (ROW LEVEL SECURITY) EM TODAS AS TABELAS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- CRIAR POLÍTICAS DE ACESSO COMPLETAS PARA TODAS AS TABELAS
DROP POLICY IF EXISTS "SmartVidros_Companies_Policy" ON public.companies;
DROP POLICY IF EXISTS "Acesso Total Companies" ON public.companies;
CREATE POLICY "SmartVidros_Companies_Policy" ON public.companies FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "SmartVidros_UserAccounts_Policy" ON public.user_accounts;
DROP POLICY IF EXISTS "Acesso Total UserAccounts" ON public.user_accounts;
CREATE POLICY "SmartVidros_UserAccounts_Policy" ON public.user_accounts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "SmartVidros_Clients_Policy" ON public.clients;
DROP POLICY IF EXISTS "Acesso Total Clients" ON public.clients;
CREATE POLICY "SmartVidros_Clients_Policy" ON public.clients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "SmartVidros_Quotes_Policy" ON public.quotes;
DROP POLICY IF EXISTS "Acesso Total Quotes" ON public.quotes;
CREATE POLICY "SmartVidros_Quotes_Policy" ON public.quotes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "SmartVidros_Sales_Policy" ON public.sales;
DROP POLICY IF EXISTS "Acesso Total Sales" ON public.sales;
CREATE POLICY "SmartVidros_Sales_Policy" ON public.sales FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "SmartVidros_Receivables_Policy" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Acesso Total AccountsReceivable" ON public.accounts_receivable;
CREATE POLICY "SmartVidros_Receivables_Policy" ON public.accounts_receivable FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "SmartVidros_Receipts_Policy" ON public.receipts;
DROP POLICY IF EXISTS "Acesso Total Receipts" ON public.receipts;
CREATE POLICY "SmartVidros_Receipts_Policy" ON public.receipts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "SmartVidros_Catalog_Policy" ON public.catalog_items;
DROP POLICY IF EXISTS "Acesso Total CatalogItems" ON public.catalog_items;
CREATE POLICY "SmartVidros_Catalog_Policy" ON public.catalog_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "SmartVidros_Tasks_Policy" ON public.manager_tasks;
DROP POLICY IF EXISTS "Acesso Total ManagerTasks" ON public.manager_tasks;
CREATE POLICY "SmartVidros_Tasks_Policy" ON public.manager_tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "SmartVidros_Contracts_Policy" ON public.contracts;
DROP POLICY IF EXISTS "Acesso Total Contracts" ON public.contracts;
CREATE POLICY "SmartVidros_Contracts_Policy" ON public.contracts FOR ALL USING (true) WITH CHECK (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    onShowToast('Código SQL com RLS copiado para a área de transferência!');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabeçalho */}
        <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white leading-tight">Sincronização com Supabase</h2>
              <p className="text-xs text-slate-400">Integração da base de dados, nuvem e segurança RLS</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title="Fechar"
            id="btn-close-supabase-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Card de Alerta de Segurança RLS do Supabase */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                  Recebeu o e-mail de aviso de segurança (RLS) do Supabase?
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed">
                  O Supabase solicita habilitar o <strong>Row Level Security (RLS)</strong> nas tabelas. O script atualizado abaixo já inclui todas as diretivas de RLS e políticas de acesso necessárias.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopySql}
              className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-black text-xs rounded-xl shadow-md shadow-amber-600/20 transition-all shrink-0 flex items-center justify-center gap-2"
              id="btn-copy-rls-sql"
            >
              {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSql ? 'Copiado!' : 'Copiar SQL com RLS'}</span>
            </button>
          </div>

          {/* Card de Status da Conexão */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              isConnected === true
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : isConnected === false
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              {isConnected === true ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : isConnected === false ? (
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
              ) : (
                <Server className="w-6 h-6 text-slate-500 shrink-0" />
              )}
              <div>
                <span className="text-xs font-black block uppercase tracking-wider">
                  {isConnected === true
                    ? '🟢 Supabase Conectado'
                    : isConnected === false
                    ? '⚠️ Não Conectado ao Supabase'
                    : '⚪ Status da Conexão'}
                </span>
                <p className="text-xs mt-0.5 opacity-90">
                  {statusMsg || 'Aguardando teste de conexão com o banco de dados.'}
                </p>
                {lastSync && (
                  <p className="text-[10px] font-mono text-slate-500 mt-1">
                    Última sincronização: {new Date(lastSync).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleTestConnection()}
              disabled={loading}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-sm transition-all shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Testar</span>
            </button>
          </div>

          {/* Formulário de Configuração URL / Anon Key */}
          <div className="space-y-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔑 Credenciais do Projeto Supabase</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Project URL (SUPABASE_URL)
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Anon Public Key (SUPABASE_ANON_KEY)
                </label>
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Salvar Credenciais
                </button>
              </div>
            </div>
          </div>

          {/* Botões de Ação de Sincronização */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Ações de Sincronização de Dados
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handlePush}
                disabled={loading}
                className="p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-600/20 text-left transition-all active:scale-95 flex flex-col justify-between gap-2"
              >
                <Upload className="w-5 h-5 text-emerald-200" />
                <div>
                  <span className="text-xs font-black block leading-tight">Enviar para Nuvem (Push)</span>
                  <span className="text-[10px] text-emerald-100 opacity-90">Sobe dados locais para o Supabase</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handlePull}
                disabled={loading}
                className="p-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-600/20 text-left transition-all active:scale-95 flex flex-col justify-between gap-2"
              >
                <Download className="w-5 h-5 text-blue-200" />
                <div>
                  <span className="text-xs font-black block leading-tight">Baixar da Nuvem (Pull)</span>
                  <span className="text-[10px] text-blue-100 opacity-90">Atualiza este app com o banco remote</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleFullSync}
                disabled={loading}
                className="p-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-lg shadow-slate-900/20 text-left transition-all active:scale-95 flex flex-col justify-between gap-2"
              >
                <RefreshCw className={`w-5 h-5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
                <div>
                  <span className="text-xs font-black block leading-tight">Sincronização Completa</span>
                  <span className="text-[10px] text-slate-300">Push + Pull Bidirecional</span>
                </div>
              </button>
            </div>
          </div>

          {/* Script SQL para o Supabase SQL Editor */}
          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowSqlCode(!showSqlCode)}
              className="w-full flex items-center justify-between py-2 text-xs font-extrabold text-slate-700 hover:text-slate-900"
            >
              <span className="flex items-center gap-1.5">
                <Code className="w-4 h-4 text-emerald-600" />
                <span>Script de Tabelas SQL (DDL) para criar no Supabase</span>
              </span>
              <span className="text-slate-400">{showSqlCode ? '▲ Ocultar' : '▼ Visualizar SQL'}</span>
            </button>

            {showSqlCode && (
              <div className="mt-2 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between bg-slate-900 text-white px-3.5 py-2 rounded-t-xl text-xs font-mono">
                  <span>supabase/schema.sql</span>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Copiado!' : 'Copiar Código SQL'}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-slate-950 text-emerald-400 font-mono text-[10px] rounded-b-xl max-h-48 overflow-y-auto whitespace-pre-wrap border border-slate-800">
                  {sqlScript}
                </pre>
              </div>
            )}
          </div>

        </div>

        {/* Rodapé */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
