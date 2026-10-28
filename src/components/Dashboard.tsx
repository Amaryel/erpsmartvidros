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
  Wallet
} from 'lucide-react';
import { Quote, Sale, Receivable, Receipt, CompanyInfo, UserAccount, AppUser } from '../types';
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

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('T')[0].split('-');
    return d && m && y ? `${d}/${m}/${y}` : iso;
  };

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

  const todayLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const card = 'bg-white border border-slate-200 rounded-xl';
  const sectionTitle = 'text-sm font-semibold text-slate-900';
  const linkButton =
    'inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-md px-2 py-1 -mr-2 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500';

  return (
    <div className="space-y-5 sm:space-y-6 pb-8 font-sans notranslate" translate="no" id="dashboard-main">
      {/* Cabeçalho da página */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 first-letter:uppercase">{todayLabel}</p>
          <h1 className="mt-1 text-2xl sm:text-[28px] font-semibold tracking-tight text-slate-900">Painel</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Visão geral de {companyInfo.name || 'Smart Vidros'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <button
            type="button"
            onClick={onNewQuote}
            className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Novo orçamento</span>
          </button>
          <button
            type="button"
            onClick={onOpenPdv}
            className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg bg-amber-500 text-sm font-semibold text-slate-950 hover:bg-amber-400 active:bg-amber-600 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Abrir PDV</span>
          </button>
        </div>
      </header>

      {/* Filtros */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex w-full sm:w-auto overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 [scrollbar-width:none]"
          role="group"
          aria-label="Período"
        >
          {periodOptions.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPeriod(p.id)}
              aria-pressed={selectedPeriod === p.id}
              className={`flex-1 sm:flex-none whitespace-nowrap px-3.5 h-9 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === p.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {users.length > 0 && (
          <label className="flex items-center gap-2 text-sm text-slate-500">
            <span className="shrink-0">Vendedor</span>
            <select
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              className="h-10 w-full sm:w-56 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            >
              <option value="all">Todos</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Indicadores principais */}
      <section aria-label="Indicadores" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className={`${card} p-4 sm:p-5`}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-medium text-slate-500">Faturamento</span>
            <TrendingUp className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-semibold text-slate-900 tabular-nums truncate">
            {brl(totalFaturamento)}
          </div>
          <p className="mt-1 text-xs text-slate-500 truncate">
            {validSales.length} {validSales.length === 1 ? 'venda' : 'vendas'} · {brl(totalRecebidoNaoFiado)} recebido
          </p>
        </div>

        <div className={`${card} p-4 sm:p-5`}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-medium text-slate-500">Orçamentos</span>
            <FileText className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-semibold text-slate-900 tabular-nums">
            {filteredQuotes.length}
          </div>
          <p className="mt-1 text-xs text-slate-500 truncate">
            {orcamentosPendentes} em aberto · {orcamentosAprovados} aprovados
          </p>
        </div>

        <div className={`${card} p-4 sm:p-5`}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-medium text-slate-500">A receber</span>
            <ShieldCheck className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <div
            className={`mt-2 text-lg sm:text-2xl font-semibold tabular-nums truncate ${
              totalFiadoPendenteGeral > 0 ? 'text-rose-700' : 'text-slate-900'
            }`}
          >
            {brl(totalFiadoPendenteGeral)}
          </div>
          <p className="mt-1 text-xs text-slate-500 truncate">
            {receivables.filter((r) => r.remainingAmount > 0).length} clientes com saldo em aberto
          </p>
        </div>

        <div className={`${card} p-4 sm:p-5`}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-medium text-slate-500">Ticket médio</span>
            <BarChart3 className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-semibold text-slate-900 tabular-nums truncate">
            {brl(ticketMedio)}
          </div>
          <button type="button" onClick={() => onNavigate('reports')} className={`${linkButton} mt-0.5 -ml-2`}>
            Ver relatórios
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Caixa */}
      <section className={`${card} p-4 sm:p-5`} aria-labelledby="dash-caixa">
        <div className="flex flex-wrap items-center justify-between gap-3">
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
            Abrir caixa
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200">
          <div className="bg-white p-3 sm:p-4">
            <dt className="text-xs font-medium text-slate-500">Saldo atual</dt>
            <dd className="mt-1 text-base sm:text-xl font-semibold text-slate-900 tabular-nums truncate">
              {brl(cashSummary.currentBalance)}
            </dd>
          </div>
          <div className="bg-white p-3 sm:p-4">
            <dt className="text-xs font-medium text-slate-500">Entradas hoje</dt>
            <dd className="mt-1 text-base sm:text-xl font-semibold text-emerald-700 tabular-nums truncate">
              {brl(cashSummary.todayEntries)}
            </dd>
          </div>
          <div className="bg-white p-3 sm:p-4">
            <dt className="text-xs font-medium text-slate-500">Saídas hoje</dt>
            <dd className="mt-1 text-base sm:text-xl font-semibold text-rose-700 tabular-nums truncate">
              {brl(cashSummary.todayExits)}
            </dd>
          </div>
          <div className="bg-white p-3 sm:p-4">
            <dt className="text-xs font-medium text-slate-500">Resultado do dia</dt>
            <dd
              className={`mt-1 text-base sm:text-xl font-semibold tabular-nums truncate ${
                cashSummary.todayResult >= 0 ? 'text-slate-900' : 'text-rose-700'
              }`}
            >
              {brl(cashSummary.todayResult)}
            </dd>
          </div>
        </dl>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('cash')}
            className="inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Entrada</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('cash')}
            className="inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <Minus className="w-4 h-4 text-rose-600" aria-hidden="true" />
            <span>Despesa</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('cash')}
            className="inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <Mic className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <span>Por áudio</span>
          </button>
        </div>
      </section>

      {/* Pendências: entregas e parcelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <section className={`${card} p-4 sm:p-5`} aria-labelledby="dash-entregas">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 id="dash-entregas" className={sectionTitle}>
                Entregas e obras
              </h2>
              <p className="text-xs text-slate-500">Atrasadas ou com prazo próximo</p>
            </div>
            <button type="button" onClick={() => onNavigate('operations')} className={linkButton}>
              Ver todas
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {urgentObras.length === 0 ? (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-5 text-sm text-slate-600">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
              Nenhuma entrega atrasada ou com prazo próximo.
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {urgentObras.map((obra) => {
                const isOverdue = obra.deliveryDate < todayStr;
                return (
                  <li key={`${obra.type}-${obra.id}`}>
                    <button
                      type="button"
                      onClick={() => onNavigate('operations')}
                      className="w-full flex items-center justify-between gap-3 py-3 text-left rounded-md hover:bg-slate-50 -mx-2 px-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{obra.clientName}</p>
                        <p className="text-xs text-slate-500 tabular-nums">
                          {obra.code} · entrega {formatDate(obra.deliveryDate)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-slate-900 tabular-nums">{brl(obra.total)}</p>
                        <span
                          className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            isOverdue ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {isOverdue ? 'Atrasada' : 'Prazo próximo'}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={`${card} p-4 sm:p-5`} aria-labelledby="dash-parcelas">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 id="dash-parcelas" className={sectionTitle}>
                Parcelas a receber
              </h2>
              <p className="text-xs text-slate-500">Vencidas ou vencendo nos próximos 7 dias</p>
            </div>
            <button type="button" onClick={() => onNavigate('receivables')} className={linkButton}>
              Ver todas
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {urgentReceivablesList.length === 0 ? (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-5 text-sm text-slate-600">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
              Nenhuma parcela vencida ou vencendo nesta semana.
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {urgentReceivablesList.map((item) => {
                const isToday = item.dueDate === todayStr;
                return (
                  <li key={`${item.receivableId}-${item.installmentId}`}>
                    <button
                      type="button"
                      onClick={() => onNavigate('receivables')}
                      className="w-full flex items-center justify-between gap-3 py-3 text-left rounded-md hover:bg-slate-50 -mx-2 px-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{item.clientName}</p>
                        <p className="text-xs text-slate-500 tabular-nums">
                          {item.saleCode} · parcela {item.number} · vence {formatDate(item.dueDate)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-slate-900 tabular-nums">
                          {brl(item.amount - item.paidAmount)}
                        </p>
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
      </div>

      {/* Movimento recente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <section className={`${card} p-4 sm:p-5`} aria-labelledby="dash-vendas">
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
            <p className="mt-4 rounded-lg bg-slate-50 px-4 py-5 text-sm text-slate-500">
              Nenhuma venda no período selecionado.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {recentSales.map((sale) => (
                <li key={sale.id}>
                  <button
                    type="button"
                    onClick={() => onViewSale(sale)}
                    className="w-full flex items-center justify-between gap-3 py-3 text-left rounded-md hover:bg-slate-50 -mx-2 px-2 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {sale.clientName || 'Cliente balcão'}
                      </p>
                      <p className="text-xs text-slate-500 tabular-nums">
                        {sale.code} · {formatDate(sale.date || sale.createdAt)} · {sale.items.length}{' '}
                        {sale.items.length === 1 ? 'item' : 'itens'}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 tabular-nums shrink-0">
                      {brl(sale.total)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={`${card} p-4 sm:p-5`} aria-labelledby="dash-orcamentos">
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
            <p className="mt-4 rounded-lg bg-slate-50 px-4 py-5 text-sm text-slate-500">
              Nenhum orçamento no período selecionado.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {recentQuotes.map((quote) => (
                <li key={quote.id}>
                  <button
                    type="button"
                    onClick={() => onViewQuote(quote)}
                    className="w-full flex items-center justify-between gap-3 py-3 text-left rounded-md hover:bg-slate-50 -mx-2 px-2 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{quote.clientName || 'Cliente'}</p>
                      <p className="text-xs text-slate-500 tabular-nums">
                        {quote.code} · {formatDate(quote.date || quote.createdAt)} · {quote.items.length}{' '}
                        {quote.items.length === 1 ? 'item' : 'itens'}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 tabular-nums shrink-0">
                      {brl(quote.total)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Atalhos */}
      <section aria-labelledby="dash-atalhos">
        <h2 id="dash-atalhos" className={`${sectionTitle} mb-3`}>
          Atalhos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => onNavigate(link.id)}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
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
