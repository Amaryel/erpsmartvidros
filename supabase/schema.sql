-- SCRIPT DDL SUPABASE SMART VIDROS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

CREATE TABLE IF NOT EXISTS public.manager_tasks (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    priority TEXT DEFAULT 'media',
    completed BOOLEAN DEFAULT FALSE,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso Total Companies" ON public.companies;
DROP POLICY IF EXISTS "Acesso Total Companies" ON companies;
CREATE POLICY "Acesso Total Companies" ON public.companies FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso Total UserAccounts" ON public.user_accounts;
DROP POLICY IF EXISTS "Acesso Total UserAccounts" ON user_accounts;
CREATE POLICY "Acesso Total UserAccounts" ON public.user_accounts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso Total Clients" ON public.clients;
DROP POLICY IF EXISTS "Acesso Total Clients" ON clients;
CREATE POLICY "Acesso Total Clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso Total Quotes" ON public.quotes;
DROP POLICY IF EXISTS "Acesso Total Quotes" ON quotes;
CREATE POLICY "Acesso Total Quotes" ON public.quotes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso Total Sales" ON public.sales;
DROP POLICY IF EXISTS "Acesso Total Sales" ON sales;
CREATE POLICY "Acesso Total Sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso Total AccountsReceivable" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Acesso Total AccountsReceivable" ON accounts_receivable;
CREATE POLICY "Acesso Total AccountsReceivable" ON public.accounts_receivable FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso Total Receipts" ON public.receipts;
DROP POLICY IF EXISTS "Acesso Total Receipts" ON receipts;
CREATE POLICY "Acesso Total Receipts" ON public.receipts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso Total CatalogItems" ON public.catalog_items;
DROP POLICY IF EXISTS "Acesso Total CatalogItems" ON catalog_items;
CREATE POLICY "Acesso Total CatalogItems" ON public.catalog_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso Total ManagerTasks" ON public.manager_tasks;
DROP POLICY IF EXISTS "Acesso Total ManagerTasks" ON manager_tasks;
CREATE POLICY "Acesso Total ManagerTasks" ON public.manager_tasks FOR ALL USING (true) WITH CHECK (true);
