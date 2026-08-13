# Guia de Preparação e Futura Integração com Supabase - Smart Vidros

> **STATUS ATUAL DA APLICAÇÃO**:
> A aplicação **Smart Vidros** está **100% operacional** utilizando a nova **Camada de Dados Centralizada** (`src/services/data/repositories/`).
> Neste momento, a aplicação **NÃO ESTÁ CONECTADA** ao Supabase remoto, permitindo desenvolvimento, testes e uso imediato sem nenhuma pendência ou dependência de chaves externas.

---

## 1. Arquitetura da Camada de Dados

A aplicação foi estruturada seguindo o padrão de repositórios desacoplados da interface:

```text
COMPONENTES (UI)
      ↓
SERVIÇOS DE NEGÓCIO / HOOKS
      ↓
REPOSITÓRIOS (src/services/data/repositories/)
      │
      ├── clientsRepository.ts
      ├── productsRepository.ts
      ├── servicesRepository.ts
      ├── budgetsRepository.ts (Orçamentos)
      ├── salesRepository.ts (Vendas)
      ├── paymentsRepository.ts
      ├── receiptsRepository.ts
      ├── accountsReceivableRepository.ts
      ├── companyRepository.ts
      └── managerTasksRepository.ts
      ↓
STORAGE ADAPTER (src/services/data/storageAdapter.ts)
      │
      ├── LocalStorageAdapter (Ativo - Desenvolvimento Local)
      └── SupabaseStorageAdapter (Futuro - Produção em Nuvem)
```

Nenhum componente React da interface manipula diretamente `localStorage`. Todas as mutações e leituras trafegam obrigatoriamente pela Camada de Dados.

---

## 2. Passos para Futura Conexão com o Supabase

Quando você desejar migrar a persistência local para o Supabase, siga estes passos em ordem:

### Passo 1: Criar o Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com) e crie uma nova organização/projeto com o nome **Smart Vidros**.
2. Defina uma senha forte para o banco de dados PostgreSQL.
3. Escolha a região mais próxima dos usuários (ex: `sa-east-1` São Paulo).

### Passo 2: Configurar Variáveis de Ambiente
1. No painel do Supabase, vá em **Project Settings > API**.
2. Copie a **URL do Projeto** e a **anon / public key**.
3. No arquivo `.env` da aplicação (ou nas variáveis de ambiente da hospedagem Cloud Run / Vercel), preencha:

```env
VITE_SUPABASE_URL=https://seuerp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### Passo 3: Executar o Schema PostgreSQL (Tabelas)
No **SQL Editor** do Supabase, execute o script SQL de criação das tabelas e relacionamentos:

```sql
-- Habilitar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Empresas (Multi-tenant)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_name TEXT,
  cnpj TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  logo_url TEXT,
  pix_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Clientes
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID,
  name TEXT NOT NULL,
  cpf_cnpj TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Catálogo de Produtos e Serviços
CREATE TABLE catalog_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('dimensao', 'simples')),
  category TEXT CHECK (category IN ('produto', 'servico')),
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT DEFAULT 'm²',
  default_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT CHECK (status IN ('ativo', 'inativo')) DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Orçamentos
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  client_name TEXT,
  client_phone TEXT,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('rascunho', 'aprovado', 'convertido', 'cancelado')) DEFAULT 'rascunho',
  discount_type TEXT CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC(10, 2) DEFAULT 0.00,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(10, 2) DEFAULT 0.00,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  down_payment_type TEXT,
  down_payment_value NUMERIC(10, 2),
  down_payment_amount NUMERIC(10, 2),
  down_payment_method TEXT,
  notes TEXT,
  delivery_date DATE,
  internal_notes TEXT,
  work_status TEXT CHECK (work_status IN ('pendente', 'em_producao', 'pronto', 'entregue')) DEFAULT 'pendente',
  converted_at TIMESTAMPTZ,
  converted_sale_id UUID,
  converted_sale_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Itens do Orçamento
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('dimensao', 'simples')),
  name TEXT NOT NULL,
  description TEXT,
  length_mm NUMERIC(10, 2),
  width_mm NUMERIC(10, 2),
  area_m2 NUMERIC(10, 4),
  price_per_m2 NUMERIC(10, 2),
  unit_price NUMERIC(10, 2),
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- 6. Tabela de Vendas (PDV)
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  quote_code TEXT,
  client_name TEXT,
  client_phone TEXT,
  date DATE NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount_type TEXT,
  discount_value NUMERIC(10, 2) DEFAULT 0.00,
  discount_amount NUMERIC(10, 2) DEFAULT 0.00,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_fiado NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT CHECK (status IN ('concluida', 'cancelada')) DEFAULT 'concluida',
  receivable_id UUID,
  receipt_id UUID,
  notes TEXT,
  delivery_date DATE,
  internal_notes TEXT,
  work_status TEXT CHECK (work_status IN ('pendente', 'em_producao', 'pronto', 'entregue')) DEFAULT 'pendente',
  has_changes_from_quote BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Pagamentos da Venda
CREATE TABLE sale_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  notes TEXT
);

-- 8. Tabela de Recibos
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  service TEXT NOT NULL,
  down_payment_type TEXT,
  down_payment_value NUMERIC(10, 2),
  down_payment_amount NUMERIC(10, 2),
  date DATE NOT NULL,
  notes TEXT,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  quote_code TEXT,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  sale_code TEXT,
  receivable_id UUID,
  sale_total_amount NUMERIC(10, 2),
  sale_paid_amount NUMERIC(10, 2),
  sale_fiado_amount NUMERIC(10, 2),
  payment_methods_summary TEXT,
  installments_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabela de Contas a Receber
CREATE TABLE accounts_receivable (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  sale_code TEXT NOT NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  quote_code TEXT,
  receipt_id UUID REFERENCES receipts(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  sale_date DATE NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  remaining_amount NUMERIC(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('pendente', 'parcial', 'pago')) DEFAULT 'pendente',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Parcelas do Contas a Receber
CREATE TABLE installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receivable_id UUID REFERENCES accounts_receivable(id) ON DELETE CASCADE,
  number INT NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  paid_amount NUMERIC(10, 2) DEFAULT 0.00,
  status TEXT CHECK (status IN ('pendente', 'parcial', 'pago')) DEFAULT 'pendente',
  paid_at DATE
);

-- 11. Tarefas do Gestor
CREATE TABLE manager_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID,
  title TEXT NOT NULL,
  due_date DATE,
  priority TEXT CHECK (priority IN ('alta', 'media', 'baixa')) DEFAULT 'media',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Passo 4: Políticas de Segurança RLS (Row Level Security)
Para garantir isolamento de dados por empresa (multi-tenant):

```sql
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Isolamento por Empresa - Clientes" ON clients
  FOR ALL USING (company_id = (auth.jwt() ->> 'company_id')::uuid);

CREATE POLICY "Isolamento por Empresa - Orçamentos" ON quotes
  FOR ALL USING (company_id = (auth.jwt() ->> 'company_id')::uuid);

CREATE POLICY "Isolamento por Empresa - Vendas" ON sales
  FOR ALL USING (company_id = (auth.jwt() ->> 'company_id')::uuid);
```

### Passo 5: Criar o Cliente Supabase na Aplicação
Crie o arquivo `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Passo 6: Trocar o Adaptador de Dados nos Repositórios
Em `src/services/data/storageAdapter.ts`, substitua a exportação da instância ativa:

```typescript
// De:
export const storageAdapter: IStorageAdapter = new LocalStorageAdapter();

// Para (ao conectar o Supabase):
export const storageAdapter: IStorageAdapter = new SupabaseAdapter();
```

---

## 3. Futura Edge Function `health` + UptimeRobot (Keep-Alive)

Para evitar que a instância gratuita do Supabase entre em hibernação por inatividade:

### Configuração da Edge Function
1. Instale o CLI do Supabase: `npm i -g supabase`.
2. Crie a função: `supabase functions new health`.
3. Código da função (`supabase/functions/health/index.ts`):

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Atividade mínima no banco para manter ativo
  const { count } = await supabase.from('companies').select('*', { count: 'exact', head: true });

  return new Response(
    JSON.stringify({ status: 'ok', timestamp: new Date().toISOString(), companiesCount: count }),
    { headers: { "Content-Type": "application/json" } }
  );
});
```

4. Faça o deploy: `supabase functions deploy health --no-verify-jwt`.

### Configuração no UptimeRobot
1. Crie uma conta no [UptimeRobot](https://uptimerobot.com).
2. Adicione um novo Monitor do tipo **HTTP(s)**.
3. Insira a URL da Edge Function: `https://<seu-projeto>.supabase.co/functions/v1/health`.
4. Defina o intervalo para **a cada 5 minutos**.

---

## 4. Roteiro de Teste do Fluxo Completo

Após a futura conexão, execute o seguinte protocolo de validação:

1. **Cadastros**: Criar, editar e excluir Cliente, Produto e Serviço.
2. **Orçamentos**: Criar orçamento com cálculo m², aplicar desconto, editar e gerar PDF.
3. **Conversão em Venda**: Converter orçamento para venda no PDV. Confirmar que o orçamento original é mantido com status `convertido` e a nova venda criada no histórico.
4. **Pagamentos Divididos e Fiado**: Finalizar venda com entrada no PIX e restante Fiado.
5. **Contas a Receber e Parcelas**: Verificar geração automática no Contas a Receber, alterar vencimento de parcela e registrar baixa com emissão de recibo.
6. **Persistência**: Fechar o navegador, reabrir e confirmar que os dados permanecem salvos e intactos.
