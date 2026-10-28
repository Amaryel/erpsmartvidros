-- =============================================================================
-- SMART VIDROS ERP • ESQUEMA COMPLETO DO BANCO (SUPABASE) — MODELO SEGURO
-- -----------------------------------------------------------------------------
-- Para uma instalação NOVA do zero (projeto Supabase vazio):
--   1. Rode este arquivo inteiro no SQL Editor.
--   2. Crie o primeiro usuário em Authentication > Users > Add user (Auto Confirm).
--   3. Promova-o: update public.user_accounts set status = 'aprovado', role = 'superadmin'
--                 where email = '<email do administrador>';
--   4. Publique a Edge Function "admin-users" (supabase/functions/admin-users).
--
-- Segurança:
--   * Senhas ficam somente no Supabase Auth (nunca nesta base).
--   * RLS: cada usuário aprovado acessa só os dados da própria empresa.
--   * Visitantes sem login não acessam tabelas; a Vitrine usa get_public_catalog().
--   * NUNCA crie políticas "USING (true)" nestas tabelas.
-- =============================================================================

begin;

create extension if not exists "uuid-ossp";

-- 1. Empresas
create table if not exists public.companies (
  id text primary key default 'comp-smart-vidros-001',
  name text not null default 'Smart Vidros',
  owner_name text,
  cnpj text,
  phone text,
  email text,
  address text,
  city text,
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Perfis de usuário (credenciais ficam SOMENTE no Supabase Auth)
create table if not exists public.user_accounts (
  id text primary key,
  auth_user_id uuid unique references auth.users (id) on delete set null,
  company_id text references public.companies(id) on delete cascade,
  name text not null,
  email text unique not null,
  username text unique not null,
  role text not null default 'vendedor',
  status text not null default 'pendente',
  permissions jsonb,
  approved_at timestamptz,
  approved_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Clientes
create table if not exists public.clients (
  id text primary key,
  company_id text references public.companies(id) on delete cascade,
  name text not null,
  document text,
  phone text,
  email text,
  address text,
  city text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Orçamentos
create table if not exists public.quotes (
  id text primary key,
  company_id text references public.companies(id) on delete cascade,
  code text not null,
  client_name text not null,
  client_phone text,
  total_amount numeric(12, 2) default 0.00,
  discount_amount numeric(12, 2) default 0.00,
  status text not null default 'pendente',
  items jsonb default '[]'::jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Vendas & PDV
create table if not exists public.sales (
  id text primary key,
  company_id text references public.companies(id) on delete cascade,
  quote_id text references public.quotes(id) on delete set null,
  code text not null,
  client_name text not null,
  client_phone text,
  total_amount numeric(12, 2) not null default 0.00,
  payment_method text default 'PIX',
  status text not null default 'concluido',
  items jsonb default '[]'::jsonb,
  notes text,
  created_at timestamptz default now(),
  finalized_at timestamptz default now()
);

-- 6. Contas a Receber
create table if not exists public.accounts_receivable (
  id text primary key,
  company_id text references public.companies(id) on delete cascade,
  sale_id text references public.sales(id) on delete set null,
  quote_id text references public.quotes(id) on delete set null,
  client_name text not null,
  description text,
  amount numeric(12, 2) not null default 0.00,
  due_date timestamptz not null,
  status text not null default 'pendente',
  installment_number int default 1,
  total_installments int default 1,
  created_at timestamptz default now()
);

-- 7. Recibos
create table if not exists public.receipts (
  id text primary key,
  company_id text references public.companies(id) on delete cascade,
  sale_id text references public.sales(id) on delete set null,
  receivable_id text references public.accounts_receivable(id) on delete set null,
  code text not null,
  client_name text not null,
  amount numeric(12, 2) not null default 0.00,
  payment_method text default 'PIX',
  description text,
  created_at timestamptz default now()
);

-- 8. Catálogo & Produtos
create table if not exists public.catalog_items (
  id text primary key,
  company_id text references public.companies(id) on delete cascade,
  name text not null,
  description text,
  unit_price numeric(12, 2) not null default 0.00,
  type text not null default 'produto',
  category text,
  stock_quantity numeric default 0,
  unit_of_measure text default 'un',
  created_at timestamptz default now()
);

-- 9. Tarefas do Gerente
create table if not exists public.manager_tasks (
  id text primary key,
  company_id text references public.companies(id) on delete cascade,
  title text not null,
  description text,
  priority text default 'media',
  completed boolean default false,
  due_date timestamptz,
  created_at timestamptz default now()
);

-- 10. Contratos
create table if not exists public.contracts (
  id text primary key,
  company_id text references public.companies(id) on delete cascade,
  sale_id text references public.sales(id) on delete set null,
  quote_id text references public.quotes(id) on delete set null,
  code text not null,
  client_name text not null,
  total_amount numeric(12, 2) not null default 0.00,
  status text not null default 'ativo',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 11. Contracheques / Holerites
create table if not exists public.payslips (
  id text primary key,
  company_id text references public.companies(id) on delete cascade,
  code text,
  employee_name text,
  employee_role text,
  employee_cpf text,
  employee_pix text,
  reference_month text,
  payment_type text,
  payment_date text,
  base_salary numeric(12, 2) default 0,
  earnings jsonb default '[]'::jsonb,
  deductions jsonb default '[]'::jsonb,
  total_earnings numeric(12, 2) default 0,
  total_deductions numeric(12, 2) default 0,
  net_amount numeric(12, 2) default 0,
  payment_method text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into public.companies (id, name) values ('comp-smart-vidros-001', 'Smart Vidros')
on conflict (id) do nothing;

-- ============================ FUNÇÕES E CADASTRO ============================
alter table public.user_accounts
  add column if not exists auth_user_id uuid unique references auth.users (id) on delete set null;

comment on column public.user_accounts.auth_user_id is
  'Usuário do Supabase Auth dono deste perfil. Credenciais ficam SOMENTE no Supabase Auth.';

-- -----------------------------------------------------------------------------
-- 2. Senha em texto puro deixa de ser obrigatória (remoção definitiva na Fase 4)
-- -----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_accounts' and column_name = 'password'
  ) then
    alter table public.user_accounts alter column password drop not null;
    alter table public.user_accounts alter column password drop default;
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 3. Funções auxiliares (schema privado, fora da API)
-- -----------------------------------------------------------------------------
create schema if not exists app_private;
revoke all on schema app_private from public;
-- As políticas de RLS executam estas funções em nome de quem faz a requisição.
grant usage on schema app_private to anon, authenticated;

-- Empresa do usuário logado (somente perfis APROVADOS; pendente/rejeitado = sem acesso)
create or replace function app_private.current_company_id()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select ua.company_id
  from public.user_accounts ua
  where ua.auth_user_id = auth.uid()
    and ua.status = 'aprovado'
  limit 1
$$;

-- Papel do usuário logado (superadmin, admin, vendedor, funcionario, operador)
create or replace function app_private.current_app_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select ua.role
  from public.user_accounts ua
  where ua.auth_user_id = auth.uid()
    and ua.status = 'aprovado'
  limit 1
$$;

create or replace function app_private.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(app_private.current_app_role() = 'superadmin', false)
$$;

create or replace function app_private.is_company_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(app_private.current_app_role() in ('admin', 'superadmin'), false)
$$;

revoke all on all functions in schema app_private from public;
grant execute on function app_private.current_company_id() to anon, authenticated;
grant execute on function app_private.current_app_role()   to anon, authenticated;
grant execute on function app_private.is_superadmin()      to anon, authenticated;
grant execute on function app_private.is_company_admin()   to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 4a. RPC de login por NOME DE USUÁRIO
--     O app converte "smartvidros" -> e-mail e então autentica no Supabase Auth.
--     Não retorna senha nem qualquer outro dado.
-- -----------------------------------------------------------------------------
create or replace function public.get_login_email(p_identifier text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select ua.email
  from public.user_accounts ua
  where lower(ua.username) = lower(trim(p_identifier))
     or lower(ua.email)    = lower(trim(p_identifier))
  limit 1
$$;

revoke all on function public.get_login_email(text) from public;
grant execute on function public.get_login_email(text) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 4b. RPC público da VITRINE (catálogo para clientes, sem login)
--     Expõe somente dados comerciais públicos da empresa e o catálogo.
-- -----------------------------------------------------------------------------
create or replace function public.get_public_catalog(p_company_id text default 'comp-smart-vidros-001')
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'company', (
      select jsonb_build_object(
        'id', c.id, 'name', c.name, 'phone', c.phone, 'email', c.email,
        'address', c.address, 'city', c.city, 'logo_url', c.logo_url
      )
      from public.companies c
      where c.id = p_company_id
    ),
    'items', coalesce((
      select jsonb_agg(to_jsonb(ci) - 'company_id' order by ci.name)
      from public.catalog_items ci
      where ci.company_id = p_company_id
    ), '[]'::jsonb)
  )
$$;

revoke all on function public.get_public_catalog(text) from public;
grant execute on function public.get_public_catalog(text) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 5. Cadastro pelo app ("Solicitar Cadastro") -> perfil PENDENTE automático
--     Regras de segurança:
--       * Se já existe perfil com o mesmo e-mail, NÃO vincula automaticamente
--         (evita que alguém se cadastre com o e-mail de outra pessoa e "herde" a conta).
--         O vínculo de contas existentes é feito pelo script da Fase 2.
--       * Todo cadastro novo entra como 'vendedor' + 'pendente' na empresa padrão;
--         só um administrador aprova, muda o papel ou a empresa.
-- -----------------------------------------------------------------------------
create or replace function app_private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name     text;
  v_username text;
begin
  if exists (select 1 from public.user_accounts where lower(email) = lower(new.email)) then
    return new;
  end if;

  v_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1));
  v_username := lower(coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), split_part(new.email, '@', 1)));

  if exists (select 1 from public.user_accounts where lower(username) = v_username) then
    v_username := v_username || '-' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;

  insert into public.user_accounts (
    id, auth_user_id, company_id, name, email, username, role, status, created_at, updated_at
  ) values (
    'usr-' || new.id::text, new.id, 'comp-smart-vidros-001', v_name, lower(new.email), v_username,
    'vendedor', 'pendente', now(), now()
  );

  return new;
end;
$$;

revoke all on function app_private.handle_new_auth_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app_private.handle_new_auth_user();

-- ============================ POLÍTICAS (RLS) ============================
do $$
declare
  r record;
begin
  for r in
    select p.schemaname, p.tablename, p.policyname
    from pg_policies p
    where p.schemaname = 'public'
      and (
        p.tablename in ('companies', 'user_accounts')
        or exists (
          select 1 from information_schema.columns c
          where c.table_schema = 'public' and c.table_name = p.tablename and c.column_name = 'company_id'
        )
      )
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- 2. Tabelas de negócio (todas as tabelas com company_id, exceto user_accounts)
--    clients, quotes, sales, accounts_receivable, receipts, catalog_items,
--    manager_tasks, contracts, payslips ... e qualquer tabela futura com company_id.
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
  v_tenant text := '(company_id = (select app_private.current_company_id()) or (select app_private.is_superadmin()))';
begin
  for t in
    select c.table_name
    from information_schema.columns c
    join information_schema.tables tb
      on tb.table_schema = c.table_schema and tb.table_name = c.table_name and tb.table_type = 'BASE TABLE'
    where c.table_schema = 'public'
      and c.column_name = 'company_id'
      and c.table_name <> 'user_accounts'
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select to authenticated using %s', 'tenant_select', t, v_tenant);
    execute format('create policy %I on public.%I for insert to authenticated with check %s', 'tenant_insert', t, v_tenant);
    execute format('create policy %I on public.%I for update to authenticated using %s with check %s', 'tenant_update', t, v_tenant, v_tenant);
    execute format('create policy %I on public.%I for delete to authenticated using %s', 'tenant_delete', t, v_tenant);
    raise notice 'RLS por empresa aplicado em public.%', t;
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- 3. companies
-- -----------------------------------------------------------------------------
alter table public.companies enable row level security;

create policy company_select on public.companies
  for select to authenticated
  using (id = (select app_private.current_company_id()) or (select app_private.is_superadmin()));

create policy company_update on public.companies
  for update to authenticated
  using (
    (id = (select app_private.current_company_id()) and (select app_private.is_company_admin()))
    or (select app_private.is_superadmin())
  )
  with check (
    (id = (select app_private.current_company_id()) and (select app_private.is_company_admin()))
    or (select app_private.is_superadmin())
  );

create policy company_insert on public.companies
  for insert to authenticated
  with check ((select app_private.is_superadmin()));

create policy company_delete on public.companies
  for delete to authenticated
  using ((select app_private.is_superadmin()));

-- -----------------------------------------------------------------------------
-- 4. user_accounts
-- -----------------------------------------------------------------------------
alter table public.user_accounts enable row level security;

-- Ler: o próprio perfil (mesmo pendente, para o app mostrar "aguardando aprovação"),
--       os colegas da mesma empresa, ou tudo se for superadmin.
create policy users_select on public.user_accounts
  for select to authenticated
  using (
    auth_user_id = (select auth.uid())
    or company_id = (select app_private.current_company_id())
    or (select app_private.is_superadmin())
  );

-- Criar perfil manualmente: só administradores (o cadastro normal é feito pelo gatilho da Fase 1
-- e pela Edge Function admin-users, que rodam com privilégio de servidor).
create policy users_insert on public.user_accounts
  for insert to authenticated
  with check (
    ((select app_private.is_company_admin()) and company_id = (select app_private.current_company_id()))
    or (select app_private.is_superadmin())
  );

-- Alterar: o próprio perfil (somente dados pessoais — ver gatilho abaixo) ou, se admin, os da empresa.
create policy users_update on public.user_accounts
  for update to authenticated
  using (
    auth_user_id = (select auth.uid())
    or ((select app_private.is_company_admin()) and company_id = (select app_private.current_company_id()))
    or (select app_private.is_superadmin())
  )
  with check (
    auth_user_id = (select auth.uid())
    or ((select app_private.is_company_admin()) and company_id = (select app_private.current_company_id()))
    or (select app_private.is_superadmin())
  );

-- Excluir: admin da empresa (nunca a si mesmo) ou superadmin.
create policy users_delete on public.user_accounts
  for delete to authenticated
  using (
    (
      (select app_private.is_company_admin())
      and company_id = (select app_private.current_company_id())
      and auth_user_id is distinct from (select auth.uid())
    )
    or (select app_private.is_superadmin())
  );

-- Gatilho: impede escalada de privilégio pela API (ex.: vendedor se tornar admin).
create or replace function app_private.protect_user_account_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_super boolean;
  v_is_admin boolean;
begin
  -- Sem usuário logado = SQL Editor, service_role ou Edge Function: sem restrição.
  if auth.uid() is null then
    return new;
  end if;

  v_is_super := app_private.is_superadmin();
  v_is_admin := app_private.is_company_admin();

  if tg_op = 'INSERT' then
    if not v_is_super then
      if new.role = 'superadmin' then
        raise exception 'Somente o superadmin pode criar outro superadmin.';
      end if;
      new.company_id := app_private.current_company_id();
      new.auth_user_id := null; -- vínculo com o Auth só via Edge Function / script
    end if;
    return new;
  end if;

  -- UPDATE
  if not v_is_admin then
    -- Usuário comum: só altera dados pessoais (nome, nome de usuário)
    new.email        := old.email;
    new.role         := old.role;
    new.status       := old.status;
    new.company_id   := old.company_id;
    new.auth_user_id := old.auth_user_id;
    new.approved_at  := old.approved_at;
    new.approved_by  := old.approved_by;
    -- Limites e módulos liberados (ex.: % máximo de desconto) só mudam por administradores
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'user_accounts' and column_name = 'permissions'
    ) then
      new := jsonb_populate_record(new, jsonb_build_object('permissions', to_jsonb(old) -> 'permissions'));
    end if;
  elsif not v_is_super then
    if old.role = 'superadmin' then
      raise exception 'Administradores não podem alterar a conta do superadmin.';
    end if;
    if new.role = 'superadmin' then
      raise exception 'Somente o superadmin pode conceder o papel de superadmin.';
    end if;
    new.company_id   := old.company_id;
    new.auth_user_id := old.auth_user_id;
  end if;

  return new;
end;
$$;

revoke all on function app_private.protect_user_account_changes() from public, anon, authenticated;

drop trigger if exists protect_user_account_changes on public.user_accounts;
create trigger protect_user_account_changes
  before insert or update on public.user_accounts
  for each row execute function app_private.protect_user_account_changes();

-- -----------------------------------------------------------------------------
-- 5. Visitantes sem login não gravam nada (camada extra além do RLS)
--    SELECT continua concedido: com RLS, o resultado para anon é sempre vazio
--    (mantém o "ping" de conexão do app funcionando).
-- -----------------------------------------------------------------------------
revoke insert, update, delete, truncate on all tables in schema public from anon;

commit;
