import React, { useState, useMemo } from 'react';
import {
  FileText,
  ShoppingBag,
  ShieldCheck,
  ReceiptText,
  PlusCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Package,
  Building2,
  DollarSign,
  Users,
  Wrench,
  Mic,
  Minus,
  Scale,
  Scroll,
  BarChart3,
  Filter,
  Calendar,
  Scissors,
  BadgeDollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Quote, Sale, Receivable, Receipt, CompanyInfo, UserAccount, AppUser } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { calculateCashSummary } from '../services/data/repositories/cashRepository';


interface DashboardProps {
  quotes: Quote[];
  sales: Sale[];
  receivables: Receivable[];
  receipts: Receipt[];
  payslipsCount?: number;
  companyInfo: CompanyInfo;
  users?: UserAccount[];
  currentUser?: AppUser | null;
  onNavigate: (tab: any) => void;
  onNewQuote: () => void;
  onOpenPdv: () => void;
  onNewReceipt: () => void;
  onViewQuote: (quote: Quote) => void;
  onViewSale: (sale: Sale) => void;
  onViewReceipt: (receipt: Receipt) => void;
}

type DashboardPeriod = 'today' | '7days' | 'this_month' | 'this_year' | 'all';

export const Dashboard: React.FC<DashboardProps> = ({
  quotes,
  sales,
  receivables,
  receipts,
  payslipsCount = 0,
  companyInfo,
  users = [],
  currentUser,
  onNavigate,
  onNewQuote,
  onOpenPdv,
  onNewReceipt,
  onViewQuote,
  onViewSale,
  onViewReceipt,
}) => {
  // Filtros dinâmicos do Dashboard
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>('this_month');
  const [selectedSeller, setSelectedSeller] = useState<string>('all');

  // Intervalo de Datas para o Dashboard
  const dateRange = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (selectedPeriod === 'today') {
      return { start: todayStr, end: todayStr, label: 'Hoje' };
    }
    if (selectedPeriod === '7days') {
      const d = new Date(today);
      d.setDate(d.getDate() - 6);
      return { start: d.toISOString().split('T')[0], end: todayStr, label: 'Últimos 7 dias' };
    }
    if (selectedPeriod === 'this_month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      return { start, end: todayStr, label: 'Este Mês' };
    }
    if (selectedPeriod === 'this_year') {
      const start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      return { start, end: todayStr, label: 'Este Ano' };
    }
    return { start: '2000-01-01', end: '2099-12-31', label: 'Todo o Histórico' };
  }, [selectedPeriod]);

  // Vendas filtradas pelo período e vendedor
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const sDate = s.date || s.createdAt?.split('T')[0] || '';
      if (sDate < dateRange.start || sDate > dateRange.end) return false;
      if (selectedSeller !== 'all' && s.userId !== selectedSeller) return false;
      return true;
    });
  }, [sales, dateRange, selectedSeller]);

  // Orçamentos filtrados
  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const qDate = q.date || q.createdAt?.split('T')[0] || '';
      if (qDate < dateRange.start || qDate > dateRange.end) return false;
      if (selectedSeller !== 'all' && q.userId !== selectedSeller) return false;
      return true;
    });
  }, [quotes, dateRange, selectedSeller]);

  // Cálculos do Dashboard baseados nas vendas filtradas
  const validSales = filteredSales.filter((s) => s.status !== 'cancelada');
  const totalFaturamento = validSales.reduce((sum, s) => sum + s.total, 0);
  const totalRecebidoNaoFiado = validSales.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalFiadoPeriodo = validSales.reduce((sum, s) => sum + s.totalFiado, 0);
  const ticketMedio = validSales.length > 0 ? totalFaturamento / validSales.length : 0;
  
  const orcamentosPendentes = filteredQuotes.filter((q) => q.status === 'pendente' || q.status === 'rascunho').length;
  const orcamentosAprovados = filteredQuotes.filter((q) => q.status === 'aprovado' || q.status === 'convertido').length;
  
  const totalFiadoPendenteGeral = receivables.reduce((sum, r) => sum + r.remainingAmount, 0);
  const totalRecibosValor = receipts.reduce((sum, r) => sum + r.amount, 0);

  // Resumo do Módulo de Caixa / Fluxo Diário
  const cashSummary = calculateCashSummary();

  // Vendas Recentes (Últimas 5 filtradas ou gerais)
  const recentSales = [...(filteredSales.length > 0 ? filteredSales : sales)]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Orçamentos Recentes (Últimos 5)
  const recentQuotes = [...(filteredQuotes.length > 0 ? filteredQuotes : quotes)]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Datas e cálculo de urgência
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  // Agrupar obras com prazo de entrega próximo ou atrasado
  const urgentObras = [
    ...sales
      .filter((s) => s.deliveryDate && s.workStatus !== 'entregue')
      .map((s) => ({
        type: 'sale' as const,
        id: s.id,
        code: s.code,
        clientName: s.clientName,
        deliveryDate: s.deliveryDate!,
        workStatus: s.workStatus || 'pendente',
        total: s.total,
      })),
    ...quotes
      .filter((q) => q.deliveryDate && q.status !== 'convertido' && q.status !== 'cancelado' && q.workStatus !== 'entregue')
      .map((q) => ({
        type: 'quote' as const,
        id: q.id,
        code: q.code,
        clientName: q.clientName || 'Cliente',
        deliveryDate: q.deliveryDate!,
        workStatus: q.workStatus || 'pendente',
        total: q.total,
      })),
  ]
    .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate))
    .slice(0, 5);

  // Agrupar parcelas do contas a receber em atraso ou vencendo em breve
  const urgentReceivables: {
    receivableId: string;
    installmentId: string;
    clientName: string;
    saleCode: string;
    number: number;
    amount: number;
    paidAmount: number;
    dueDate: string;
    isOverdue: boolean;
  }[] = [];

  receivables.forEach((r) => {
    if (r.status !== 'pago') {
      r.installments.forEach((inst) => {
        if (inst.status !== 'pago') {
          const isOverdue = inst.dueDate < todayStr;
          const isDueSoon = inst.dueDate <= nextWeekStr;
          if (isOverdue || isDueSoon) {
            urgentReceivables.push({
              receivableId: r.id,
              installmentId: inst.id,
              clientName: r.clientName,
              saleCode: r.saleCode,
              number: inst.number,
              amount: inst.amount,
              paidAmount: inst.paidAmount || 0,
              dueDate: inst.dueDate,
              isOverdue,
            });
          }
        }
      });
    }
  });

  urgentReceivables.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const urgentReceivablesList = urgentReceivables.slice(0, 5);

  const brl = (value: number) =>
    (Number(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const brlCompact = (value: number) =>
    (Number(value) || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1,
    });

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('T')[0].split('-');
    return d && m && y ? `${d}/${m}/${y}` : iso;
  };

  // ---------------------------------------------------------------------------
  // Comparação com o período anterior de mesmo tamanho
  // ---------------------------------------------------------------------------
  const DAY_MS = 86_400_000;
  const toKey = (d: Date) => d.toISOString().split('T')[0];
  const parseKey = (key: string) => new Date(`${key}T00:00:00Z`);
  const saleDateKey = (s: Sale) => s.date || s.createdAt?.split('T')[0] || '';

  const salesBetween = (start: string, end: string) =>
    sales.filter((s) => {
      if (s.status === 'cancelada') return false;
      if (selectedSeller !== 'all' && s.userId !== selectedSeller) return false;
      const key = saleDateKey(s);
      return key >= start && key <= end;
    });

  const previousRange = (() => {
    if (selectedPeriod === 'all') return null;
    const start = parseKey(dateRange.start);
    const end = parseKey(dateRange.end);
    const days = Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
    const prevEnd = new Date(start.getTime() - DAY_MS);
    const prevStart = new Date(prevEnd.getTime() - (days - 1) * DAY_MS);
    return { start: toKey(prevStart), end: toKey(prevEnd) };
  })();

  const previousSales = previousRange ? salesBetween(previousRange.start, previousRange.end) : [];
  const previousFaturamento = previousSales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
  const previousTicket = previousSales.length > 0 ? previousFaturamento / previousSales.length : 0;

  const variation = (current: number, previous: number): number | null => {
    if (!previousRange || previous <= 0) return null;
    return ((current - previous) / previous) * 100;
  };
  const faturamentoDelta = variation(totalFaturamento, previousFaturamento);
  const ticketDelta = variation(ticketMedio, previousTicket);

  // ---------------------------------------------------------------------------
  // Gráfico de faturamento (uma série, barras por dia ou por mês)
  // ---------------------------------------------------------------------------
  const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  const chart = (() => {
    const today = parseKey(new Date().toISOString().split('T')[0]);
    const buckets: { key: string; label: string; start: string; end: string; total: number }[] = [];

    if (selectedPeriod === 'today' || selectedPeriod === '7days' || selectedPeriod === 'this_month') {
      const first =
        selectedPeriod === 'this_month'
          ? parseKey(dateRange.start)
          : new Date(today.getTime() - 6 * DAY_MS);
      for (let d = first; d.getTime() <= today.getTime(); d = new Date(d.getTime() + DAY_MS)) {
        const key = toKey(d);
        const [, m, day] = key.split('-');
        buckets.push({ key, label: selectedPeriod === 'this_month' ? String(Number(day)) : `${day}/${m}`, start: key, end: key, total: 0 });
      }
    } else {
      const year = today.getUTCFullYear();
      const month = today.getUTCMonth();
      const months =
        selectedPeriod === 'this_year'
          ? Array.from({ length: month + 1 }, (_, i) => ({ y: year, m: i }))
          : Array.from({ length: 12 }, (_, i) => {
              const offset = month - 11 + i;
              return { y: year + Math.floor(offset / 12), m: ((offset % 12) + 12) % 12 };
            });
      months.forEach(({ y, m }) => {
        const start = toKey(new Date(Date.UTC(y, m, 1)));
        const end = toKey(new Date(Date.UTC(y, m + 1, 0)));
        const label = selectedPeriod === 'this_year' ? MONTHS_SHORT[m] : `${MONTHS_SHORT[m]}/${String(y).slice(2)}`;
        buckets.push({ key: start, label, start, end, total: 0 });
      });
    }

    if (buckets.length > 0) {
      salesBetween(buckets[0].start, buckets[buckets.length - 1].end).forEach((s) => {
        const key = saleDateKey(s);
        const bucket = buckets.find((b) => key >= b.start && key <= b.end);
        if (bucket) bucket.total += Number(s.total) || 0;
      });
    }

    const subtitle =
      selectedPeriod === 'this_month'
        ? 'Por dia, neste mês'
        : selectedPeriod === 'this_year'
        ? 'Por mês, neste ano'
        : selectedPeriod === 'all'
        ? 'Por mês, últimos 12 meses'
        : 'Por dia, últimos 7 dias';

    const total = buckets.reduce((sum, b) => sum + b.total, 0);
    const best = buckets.reduce<(typeof buckets)[number] | null>((acc, b) => (b.total > (acc?.total || 0) ? b : acc), null);
    return { data: buckets, subtitle, total, best };
  })();

  // ---------------------------------------------------------------------------
  // Funil de orçamentos do período
  // ---------------------------------------------------------------------------
  const funnelSteps = [
    { id: 'aberto', label: 'Em aberto', match: ['rascunho', 'pendente'] },
    { id: 'aprovado', label: 'Aprovados', match: ['aprovado'] },
    { id: 'convertido', label: 'Viraram venda', match: ['convertido'] },
    { id: 'cancelado', label: 'Cancelados', match: ['cancelado'] },
  ].map((step) => {
    const list = filteredQuotes.filter((q) => step.match.includes(q.status));
    return { ...step, count: list.length, value: list.reduce((sum, q) => sum + (Number(q.total) || 0), 0) };
  });
  const funnelMax = Math.max(1, ...funnelSteps.map((s) => s.count));
  const convertedCount = funnelSteps.find((s) => s.id === 'convertido')?.count || 0;
  const conversionRate = filteredQuotes.length > 0 ? (convertedCount / filteredQuotes.length) * 100 : null;

  const overdueCount = urgentReceivables.filter((r) => r.isOverdue).length;
  const receivedShare = totalFaturamento > 0 ? Math.min(100, (totalRecebidoNaoFiado / totalFaturamento) * 100) : 0;

  // ---------------------------------------------------------------------------
  // Textos e estilos
  // ---------------------------------------------------------------------------
  const periodOptions: { id: DashboardPeriod; label: string }[] = [
    { id: 'today', label: 'Hoje' },
    { id: '7days', label: '7 dias' },
    { id: 'this_month', label: 'Este mês' },
    { id: 'this_year', label: 'Este ano' },
    { id: 'all', label: 'Tudo' },
  ];

  const quickLinks: { id: string; label: string; detail: string; icon: React.ElementType }[] = [
    { id: 'quotes', label: 'Orçamentos', detail: `${quotes.length} cadastrados`, icon: FileText },
    { id: 'sales', label: 'Vendas', detail: `${sales.length} registradas`, icon: ShoppingBag },
    { id: 'clients', label: 'Clientes', detail: 'Cadastro e histórico', icon: Users },
    { id: 'cash', label: 'Caixa', detail: 'Entradas e saídas', icon: Wallet },
    { id: 'receivables', label: 'A receber', detail: `${receivables.length} contas`, icon: ShieldCheck },
    { id: 'receipts', label: 'Recibos', detail: `${receipts.length} emitidos`, icon: ReceiptText },
    { id: 'contracts', label: 'Contratos', detail: 'Emissão e PDF', icon: Scroll },
    { id: 'operations', label: 'Obras', detail: 'Produção e entregas', icon: Wrench },
    { id: 'payslips', label: 'Contracheques', detail: payslipsCount > 0 ? `${payslipsCount} emitidos` : 'Folha e holerites', icon: BadgeDollarSign },
    { id: 'products', label: 'Produtos', detail: 'Vidros e acessórios', icon: Package },
    { id: 'services', label: 'Serviços', detail: 'Mão de obra', icon: Wrench },
    { id: 'reports', label: 'Relatórios', detail: 'Vendas e faturamento', icon: BarChart3 },
  ];

  const now = new Date();
  const todayLabel = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = (currentUser?.name || '').trim().split(' ')[0];
  const periodLabel = periodOptions.find((p) => p.id === selectedPeriod)?.label.toLowerCase() || '';

  const quoteStatus: Record<string, { label: string; className: string }> = {
    rascunho: { label: 'Rascunho', className: 'bg-slate-100 text-slate-600' },
    pendente: { label: 'Pendente', className: 'bg-amber-50 text-amber-800' },
    aprovado: { label: 'Aprovado', className: 'bg-sky-50 text-sky-700' },
    convertido: { label: 'Virou venda', className: 'bg-emerald-50 text-emerald-700' },
    cancelado: { label: 'Cancelado', className: 'bg-rose-50 text-rose-700' },
  };

  const saleStatus = (s: Sale) =>
    s.status === 'cancelada'
      ? { label: 'Cancelada', className: 'bg-slate-100 text-slate-500' }
      : (Number(s.totalFiado) || 0) > 0
      ? { label: 'A receber', className: 'bg-amber-50 text-amber-800' }
      : { label: 'Pago', className: 'bg-emerald-50 text-emerald-700' };

  const initials = (name?: string) =>
    (name || '?')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || '')
      .join('') || '?';

  const card = 'bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04)]';
  const sectionTitle = 'text-[15px] font-semibold text-slate-900';
  const sectionHint = 'text-xs text-slate-500';
  const linkButton =
    'inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-md px-2 py-1 -mr-2 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500';
  const rowButton =
    'w-full flex items-center gap-3 py-3 text-left rounded-lg hover:bg-slate-50 -mx-2 px-2 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500';

  const DeltaBadge: React.FC<{ value: number | null }> = ({ value }) => {
    if (value === null) {
      return previousRange ? <span className="text-xs text-slate-400">sem vendas no período anterior</span> : null;
    }
    const up = value >= 0;
    const Icon = up ? ArrowUpRight : ArrowDownRight;
    return (
      <span
        className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
          up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        }`}
        title="Comparado ao período anterior de mesmo tamanho"
      >
        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
        {Math.abs(value).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%
        <span className="sr-only">{up ? 'acima' : 'abaixo'} do período anterior</span>
      </span>
    );
  };

  const EmptyState: React.FC<{ text: string; ok?: boolean; tall?: boolean }> = ({ text, ok, tall }) => (
    <div
      className={`mt-4 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-600 ${
        tall ? 'h-56 sm:h-64 justify-center' : ''
      }`}
    >
      {ok ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
      ) : (
        <Clock className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
      )}
      {text}
    </div>
  );

  return (
    <div className="space-y-5 sm:space-y-6 pb-8 font-sans notranslate" translate="no" id="dashboard-main">
      {/* Boas-vindas */}
      <header className="relative overflow-hidden rounded-2xl bg-zinc-950 text-white px-5 py-6 sm:px-8 sm:py-7">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(600px 220px at 100% 0%, rgba(245,158,11,0.16), transparent 70%), radial-gradient(420px 200px at 0% 100%, rgba(255,255,255,0.05), transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-400 first-letter:uppercase">{todayLabel}</p>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-semibold tracking-tight">
              {greeting}
              {firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Resumo de {companyInfo.name || 'Smart Vidros'} · {periodLabel}
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end lg:gap-8">
            <div className="sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Faturamento</p>
              <p className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums">{brl(totalFaturamento)}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 sm:justify-end">
                <DeltaBadge value={faturamentoDelta} />
              </div>
              <p className="mt-1.5 text-xs text-zinc-400">
                {validSales.length} {validSales.length === 1 ? 'venda' : 'vendas'} · {brl(totalRecebidoNaoFiado)} recebido
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-col">
              <button
                type="button"
                onClick={onOpenPdv}
                className="inline-flex items-center justify-center gap-2 h-11 px-3 sm:px-4 rounded-xl whitespace-nowrap bg-amber-500 text-sm font-semibold text-slate-950 hover:bg-amber-400 active:bg-amber-600 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                Abrir PDV
              </button>
              <button
                type="button"
                onClick={onNewQuote}
                className="inline-flex items-center justify-center gap-2 h-11 px-3 sm:px-4 rounded-xl whitespace-nowrap border border-white/15 bg-white/5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <PlusCircle className="w-4 h-4" aria-hidden="true" />
                Novo orçamento
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex w-full sm:w-auto overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 [scrollbar-width:none]"
          role="group"
          aria-label="Período"
        >
          {periodOptions.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPeriod(p.id)}
              aria-pressed={selectedPeriod === p.id}
              className={`flex-1 sm:flex-none whitespace-nowrap px-3.5 h-9 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === p.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {users.length > 0 && (
          <label className="flex items-center gap-2 text-sm text-slate-500">
            <Filter className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="sr-only">Vendedor</span>
            <select
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              className="h-10 w-full sm:w-56 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            >
              <option value="all">Todos os vendedores</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Indicadores */}
      <section aria-label="Indicadores" className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className={`${card} p-4 sm:p-5`}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Wallet className="w-4 h-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-slate-600">Recebido</span>
          </div>
          <div className="mt-3 text-xl sm:text-2xl font-semibold text-slate-900 tabular-nums truncate">
            {brl(totalRecebidoNaoFiado)}
          </div>
          <div className="mt-2.5">
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden" aria-hidden="true">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${receivedShare}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-slate-500 truncate">
              {receivedShare.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}% do faturamento do período
            </p>
          </div>
        </div>

        <div className={`${card} p-4 sm:p-5`}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <FileText className="w-4 h-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-slate-600">Orçamentos</span>
          </div>
          <div className="mt-3 text-xl sm:text-2xl font-semibold text-slate-900 tabular-nums">{filteredQuotes.length}</div>
          <p className="mt-1 text-xs text-slate-500 truncate">
            {conversionRate === null
              ? 'Nenhum orçamento no período'
              : `${conversionRate.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}% viraram venda · ${orcamentosPendentes} em aberto`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('receivables')}
          className={`${card} p-4 sm:p-5 text-left hover:border-slate-300 transition-colors`}
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-slate-600">A receber</span>
          </div>
          <div className="mt-3 text-xl sm:text-2xl font-semibold text-slate-900 tabular-nums truncate">
            {brl(totalFiadoPendenteGeral)}
          </div>
          <p className="mt-1 text-xs truncate">
            {overdueCount > 0 ? (
              <span className="inline-flex items-center gap-1 font-medium text-rose-700">
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                {overdueCount} {overdueCount === 1 ? 'parcela vencida' : 'parcelas vencidas'}
              </span>
            ) : (
              <span className="text-slate-500">
                {receivables.filter((r) => r.remainingAmount > 0).length} clientes com saldo
              </span>
            )}
          </p>
        </button>

        <div className={`${card} p-4 sm:p-5`}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
              <BarChart3 className="w-4 h-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-slate-600">Ticket médio</span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-xl sm:text-2xl font-semibold text-slate-900 tabular-nums truncate">{brl(ticketMedio)}</span>
            <DeltaBadge value={ticketDelta} />
          </div>
          <button type="button" onClick={() => onNavigate('reports')} className={`${linkButton} mt-1 -ml-2`}>
            Ver relatórios
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Gráfico + funil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <section className={`${card} p-4 sm:p-6 lg:col-span-2`} aria-labelledby="dash-grafico">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="dash-grafico" className={sectionTitle}>
                Faturamento
              </h2>
              <p className={sectionHint}>{chart.subtitle}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-slate-900 tabular-nums">{brl(chart.total)}</p>
              {chart.best && chart.best.total > 0 && (
                <p className="text-xs text-slate-500">
                  Melhor: {chart.best.label} · {brl(chart.best.total)}
                </p>
              )}
            </div>
          </div>

          {chart.total === 0 ? (
            <EmptyState tall text="Ainda não há vendas neste período. Escolha outro período acima para ver o histórico." />
          ) : (
            <div className="mt-4 h-56 sm:h-64 -ml-2" role="img" aria-label={`Gráfico de faturamento: ${chart.subtitle.toLowerCase()}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart.data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="22%">
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="0" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    interval="preserveStartEnd"
                    minTickGap={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={64}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={(v: number) => brlCompact(v)}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(15,23,42,0.04)' }}
                    formatter={(v: any) => [brl(Number(v)), 'Faturamento']}
                    labelFormatter={(l: any) => (selectedPeriod === 'this_month' ? `Dia ${l}` : String(l))}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="total" fill="#d97706" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tabela acessível do gráfico */}
          <table className="sr-only">
            <caption>Faturamento {chart.subtitle.toLowerCase()}</caption>
            <tbody>
              {chart.data.map((b) => (
                <tr key={b.key}>
                  <th scope="row">{b.label}</th>
                  <td>{brl(b.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={`${card} p-4 sm:p-6`} aria-labelledby="dash-funil">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="dash-funil" className={sectionTitle}>
                Orçamentos
              </h2>
              <p className={sectionHint}>Situação no período</p>
            </div>
            {conversionRate !== null && (
              <div className="text-right">
                <p className="text-lg font-semibold text-slate-900 tabular-nums">
                  {conversionRate.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%
                </p>
                <p className="text-xs text-slate-500">conversão</p>
              </div>
            )}
          </div>

          {filteredQuotes.length === 0 ? (
            <EmptyState text="Nenhum orçamento no período." />
          ) : (
            <ul className="mt-5 space-y-4">
              {funnelSteps.map((step) => (
                <li key={step.id}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-medium text-slate-700">{step.label}</span>
                    <span className="text-slate-900 font-semibold tabular-nums">{step.count}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden" aria-hidden="true">
                    <div
                      className="h-full rounded-full bg-amber-600"
                      style={{ width: `${(step.count / funnelMax) * 100}%`, opacity: step.id === 'cancelado' ? 0.35 : 1 }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 tabular-nums">{brl(step.value)}</p>
                </li>
              ))}
            </ul>
          )}

          <button type="button" onClick={() => onNavigate('quotes')} className={`${linkButton} mt-4 -ml-2`}>
            Ver orçamentos
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </section>
      </div>

      {/* Caixa, parcelas e entregas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <section className={`${card} p-4 sm:p-6`} aria-labelledby="dash-caixa">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h2 id="dash-caixa" className={sectionTitle}>
                Caixa
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                  cashSummary.activeSession
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${cashSummary.activeSession ? 'bg-emerald-500' : 'bg-slate-400'}`}
                  aria-hidden="true"
                />
                {cashSummary.activeSession ? 'Aberto' : 'Saldo contínuo'}
              </span>
            </div>
            <button type="button" onClick={() => onNavigate('cash')} className={linkButton}>
              Abrir
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <p className="mt-4 text-xs font-medium text-slate-500">Saldo atual</p>
          <p className="mt-0.5 text-2xl font-semibold text-slate-900 tabular-nums truncate">{brl(cashSummary.currentBalance)}</p>

          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-slate-50 px-2 py-2.5">
              <dt className="text-[11px] font-medium text-slate-500">Entradas</dt>
              <dd className="mt-0.5 text-sm font-semibold text-emerald-700 tabular-nums truncate">{brl(cashSummary.todayEntries)}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 px-2 py-2.5">
              <dt className="text-[11px] font-medium text-slate-500">Saídas</dt>
              <dd className="mt-0.5 text-sm font-semibold text-rose-700 tabular-nums truncate">{brl(cashSummary.todayExits)}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 px-2 py-2.5">
              <dt className="text-[11px] font-medium text-slate-500">Resultado</dt>
              <dd
                className={`mt-0.5 text-sm font-semibold tabular-nums truncate ${
                  cashSummary.todayResult >= 0 ? 'text-slate-900' : 'text-rose-700'
                }`}
              >
                {brl(cashSummary.todayResult)}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-[11px] text-slate-400 text-center">Movimento de hoje</p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: 'Entrada', icon: PlusCircle, color: 'text-emerald-600' },
              { label: 'Despesa', icon: Minus, color: 'text-rose-600' },
              { label: 'Por áudio', icon: Mic, color: 'text-slate-500' },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => onNavigate('cash')}
                  className="inline-flex items-center justify-center gap-1.5 h-10 px-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <Icon className={`w-4 h-4 ${a.color}`} aria-hidden="true" />
                  <span>{a.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className={`${card} p-4 sm:p-6`} aria-labelledby="dash-parcelas">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 id="dash-parcelas" className={sectionTitle}>
                Parcelas a receber
              </h2>
              <p className={sectionHint}>Vencidas ou nos próximos 7 dias</p>
            </div>
            <button type="button" onClick={() => onNavigate('receivables')} className={linkButton}>
              Ver todas
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {urgentReceivablesList.length === 0 ? (
            <EmptyState ok text="Nenhuma parcela vencida ou vencendo nesta semana." />
          ) : (
            <ul className="mt-2 divide-y divide-slate-100">
              {urgentReceivablesList.map((item) => {
                const isToday = item.dueDate === todayStr;
                return (
                  <li key={`${item.receivableId}-${item.installmentId}`}>
                    <button type="button" onClick={() => onNavigate('receivables')} className={rowButton}>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{item.clientName}</p>
                        <p className="text-xs text-slate-500 tabular-nums">
                          Parcela {item.number} · vence {formatDate(item.dueDate)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-slate-900 tabular-nums">{brl(item.amount - item.paidAmount)}</p>
                        <span
                          className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            item.isOverdue
                              ? 'bg-rose-50 text-rose-700'
                              : isToday
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.isOverdue ? 'Vencida' : isToday ? 'Vence hoje' : 'Próxima'}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={`${card} p-4 sm:p-6`} aria-labelledby="dash-entregas">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 id="dash-entregas" className={sectionTitle}>
                Entregas e obras
              </h2>
              <p className={sectionHint}>Atrasadas ou com prazo próximo</p>
            </div>
            <button type="button" onClick={() => onNavigate('operations')} className={linkButton}>
              Ver todas
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {urgentObras.length === 0 ? (
            <EmptyState ok text="Nenhuma entrega atrasada ou com prazo próximo." />
          ) : (
            <ul className="mt-2 divide-y divide-slate-100">
              {urgentObras.map((obra) => {
                const isOverdue = obra.deliveryDate < todayStr;
                return (
                  <li key={`${obra.type}-${obra.id}`}>
                    <button type="button" onClick={() => onNavigate('operations')} className={rowButton}>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{obra.clientName}</p>
                        <p className="text-xs text-slate-500 tabular-nums">
                          {obra.code} · {formatDate(obra.deliveryDate)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          isOverdue ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {isOverdue ? 'Atrasada' : 'Prazo próximo'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Movimento recente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <section className={`${card} p-4 sm:p-6`} aria-labelledby="dash-vendas">
          <div className="flex items-center justify-between gap-3">
            <h2 id="dash-vendas" className={sectionTitle}>
              Últimas vendas
            </h2>
            <button type="button" onClick={() => onNavigate('sales')} className={linkButton}>
              Ver todas
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {recentSales.length === 0 ? (
            <EmptyState text="Nenhuma venda registrada ainda." />
          ) : (
            <ul className="mt-2 divide-y divide-slate-100">
              {recentSales.map((sale) => {
                const status = saleStatus(sale);
                return (
                  <li key={sale.id}>
                    <button type="button" onClick={() => onViewSale(sale)} className={rowButton}>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                        {initials(sale.clientName || 'Cliente balcão')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{sale.clientName || 'Cliente balcão'}</p>
                        <p className="text-xs text-slate-500 tabular-nums truncate">
                          {sale.code} · {formatDate(sale.date || sale.createdAt)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-slate-900 tabular-nums">{brl(sale.total)}</p>
                        <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={`${card} p-4 sm:p-6`} aria-labelledby="dash-orcamentos">
          <div className="flex items-center justify-between gap-3">
            <h2 id="dash-orcamentos" className={sectionTitle}>
              Orçamentos recentes
            </h2>
            <button type="button" onClick={() => onNavigate('quotes')} className={linkButton}>
              Ver todos
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {recentQuotes.length === 0 ? (
            <EmptyState text="Nenhum orçamento criado ainda." />
          ) : (
            <ul className="mt-2 divide-y divide-slate-100">
              {recentQuotes.map((quote) => {
                const status = quoteStatus[quote.status] || quoteStatus.rascunho;
                return (
                  <li key={quote.id}>
                    <button type="button" onClick={() => onViewQuote(quote)} className={rowButton}>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                        {initials(quote.clientName || 'Cliente')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{quote.clientName || 'Cliente'}</p>
                        <p className="text-xs text-slate-500 tabular-nums truncate">
                          {quote.code} · {formatDate(quote.date || quote.createdAt)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-slate-900 tabular-nums">{brl(quote.total)}</p>
                        <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Atalhos */}
      <section aria-labelledby="dash-atalhos">
        <h2 id="dash-atalhos" className={`${sectionTitle} mb-3`}>
          Acesso rápido
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => onNavigate(link.id)}
                className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 text-left hover:border-amber-300 hover:bg-amber-50/40 transition-colors"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-900 truncate">{link.label}</span>
                  <span className="block text-xs text-slate-500 truncate">{link.detail}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
