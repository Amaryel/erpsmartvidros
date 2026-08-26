import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Filter,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ArrowUpRight,
  Sparkles,
  PieChart as PieChartIcon,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { Sale, Quote, CompanyInfo, AppUser, UserAccount } from '../types';

interface ReportsModuleProps {
  sales: Sale[];
  quotes: Quote[];
  companyInfo: CompanyInfo;
  users?: UserAccount[];
  currentUser?: AppUser | null;
  onViewSale?: (sale: Sale) => void;
  onViewQuote?: (quote: Quote) => void;
}

type PeriodPreset = 'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'last_month' | 'this_year' | 'all' | 'custom';

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  sales,
  quotes,
  companyInfo,
  users = [],
  currentUser,
  onViewSale,
  onViewQuote,
}) => {
  // Estado dos Filtros
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('this_month');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'concluida' | 'cancelada'>('all');
  const [sellerFilter, setSellerFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'sales_list' | 'sellers' | 'products'>('overview');

  // Calcular datas limites baseadas no preset
  const dateRange = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (periodPreset === 'custom') {
      return { start: customStartDate, end: customEndDate };
    }

    if (periodPreset === 'today') {
      return { start: todayStr, end: todayStr };
    }

    if (periodPreset === 'yesterday') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      return { start: yStr, end: yStr };
    }

    if (periodPreset === '7days') {
      const d = new Date(today);
      d.setDate(d.getDate() - 6);
      return { start: d.toISOString().split('T')[0], end: todayStr };
    }

    if (periodPreset === '30days') {
      const d = new Date(today);
      d.setDate(d.getDate() - 29);
      return { start: d.toISOString().split('T')[0], end: todayStr };
    }

    if (periodPreset === 'this_month') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: d.toISOString().split('T')[0], end: todayStr };
    }

    if (periodPreset === 'last_month') {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      };
    }

    if (periodPreset === 'this_year') {
      const start = new Date(today.getFullYear(), 0, 1);
      return { start: start.toISOString().split('T')[0], end: todayStr };
    }

    // 'all'
    return { start: '2000-01-01', end: '2099-12-31' };
  }, [periodPreset, customStartDate, customEndDate]);

  // Filtrar Vendas
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      // Filtro de Data
      const saleDate = sale.date || sale.createdAt?.split('T')[0] || '';
      if (saleDate < dateRange.start || saleDate > dateRange.end) {
        return false;
      }

      // Filtro de Status
      if (statusFilter !== 'all' && sale.status !== statusFilter) {
        return false;
      }

      // Filtro de Vendedor
      if (sellerFilter !== 'all') {
        if (sale.userId !== sellerFilter) {
          return false;
        }
      }

      // Filtro de Método de Pagamento
      if (paymentMethodFilter !== 'all') {
        const hasMethod = sale.payments?.some((p) => p.method === paymentMethodFilter);
        if (!hasMethod) return false;
      }

      // Filtro de Busca Textual
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchCode = sale.code?.toLowerCase().includes(term);
        const matchClient = sale.clientName?.toLowerCase().includes(term);
        const matchItems = sale.items?.some((i) => i.name.toLowerCase().includes(term));
        if (!matchCode && !matchClient && !matchItems) return false;
      }

      return true;
    });
  }, [sales, dateRange, statusFilter, sellerFilter, paymentMethodFilter, searchTerm]);

  // Filtrar Orçamentos no mesmo período
  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      const qDate = quote.date || quote.createdAt?.split('T')[0] || '';
      if (qDate < dateRange.start || qDate > dateRange.end) {
        return false;
      }
      if (sellerFilter !== 'all' && quote.userId !== sellerFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchCode = quote.code?.toLowerCase().includes(term);
        const matchClient = quote.clientName?.toLowerCase().includes(term);
        if (!matchCode && !matchClient) return false;
      }
      return true;
    });
  }, [quotes, dateRange, sellerFilter, searchTerm]);

  // Métricas Consolidadas
  const metrics = useMemo(() => {
    const validSales = filteredSales.filter((s) => s.status !== 'cancelada');
    const totalGross = validSales.reduce((acc, s) => acc + (s.total || 0), 0);
    const totalPaidNow = validSales.reduce((acc, s) => acc + (s.totalPaid || 0), 0);
    const totalFiado = validSales.reduce((acc, s) => acc + (s.totalFiado || 0), 0);
    const totalDiscounts = validSales.reduce((acc, s) => acc + (s.discountAmount || 0), 0);
    const totalSubtotal = validSales.reduce((acc, s) => acc + (s.subtotal || 0), 0);
    const salesCount = validSales.length;
    const canceledCount = filteredSales.filter((s) => s.status === 'cancelada').length;
    const ticketMedio = salesCount > 0 ? totalGross / salesCount : 0;

    // Orçamentos e Taxa de Conversão
    const totalQuotesCount = filteredQuotes.length;
    const convertedQuotesCount = filteredQuotes.filter((q) => q.status === 'convertido').length;
    const conversionRate = totalQuotesCount > 0 ? (convertedQuotesCount / totalQuotesCount) * 100 : 0;

    return {
      totalGross,
      totalPaidNow,
      totalFiado,
      totalDiscounts,
      totalSubtotal,
      salesCount,
      canceledCount,
      ticketMedio,
      totalQuotesCount,
      convertedQuotesCount,
      conversionRate,
    };
  }, [filteredSales, filteredQuotes]);

  // Dados para Gráfico de Evolução de Vendas Diárias / Mensais
  const timelineChartData = useMemo(() => {
    const validSales = filteredSales.filter((s) => s.status !== 'cancelada');
    const mapByDate: Record<string, { date: string; label: string; total: number; count: number }> = {};

    validSales.forEach((sale) => {
      const d = sale.date || sale.createdAt?.split('T')[0] || 'Sem Data';
      if (!mapByDate[d]) {
        const [year, month, day] = d.split('-');
        const formattedLabel = day ? `${day}/${month}` : d;
        mapByDate[d] = { date: d, label: formattedLabel, total: 0, count: 0 };
      }
      mapByDate[d].total += sale.total || 0;
      mapByDate[d].count += 1;
    });

    return Object.values(mapByDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSales]);

  // Dados para Gráfico de Métodos de Pagamento
  const paymentMethodsChartData = useMemo(() => {
    const validSales = filteredSales.filter((s) => s.status !== 'cancelada');
    const counts: Record<string, number> = {
      PIX: 0,
      Dinheiro: 0,
      'Cartão de Crédito': 0,
      'Cartão de Débito': 0,
      'Fiado (A Prazo)': 0,
      Transferência: 0,
    };

    validSales.forEach((sale) => {
      if (sale.payments && sale.payments.length > 0) {
        sale.payments.forEach((p) => {
          if (p.method === 'pix') counts.PIX += p.amount;
          else if (p.method === 'dinheiro') counts.Dinheiro += p.amount;
          else if (p.method === 'cartao_credito') counts['Cartão de Crédito'] += p.amount;
          else if (p.method === 'cartao_debito') counts['Cartão de Débito'] += p.amount;
          else if (p.method === 'fiado') counts['Fiado (A Prazo)'] += p.amount;
          else if (p.method === 'transferencia') counts.Transferência += p.amount;
        });
      } else {
        if (sale.totalPaid > 0) counts.PIX += sale.totalPaid;
        if (sale.totalFiado > 0) counts['Fiado (A Prazo)'] += sale.totalFiado;
      }
    });

    const COLORS: Record<string, string> = {
      PIX: '#10B981', // Verde esmeralda
      Dinheiro: '#F59E0B', // Âmbar
      'Cartão de Crédito': '#6366F1', // Indigo
      'Cartão de Débito': '#06B6D4', // Ciano
      'Fiado (A Prazo)': '#F43F5E', // Rosa
      Transferência: '#8B5CF6', // Roxo
    };

    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: COLORS[name] || '#94A3B8',
      }));
  }, [filteredSales]);

  // Ranking de Produtos Mais Vendidos
  const topProductsData = useMemo(() => {
    const validSales = filteredSales.filter((s) => s.status !== 'cancelada');
    const productMap: Record<string, { name: string; quantity: number; totalRevenue: number; type: string }> = {};

    validSales.forEach((sale) => {
      sale.items?.forEach((item) => {
        const key = item.name.trim();
        if (!productMap[key]) {
          productMap[key] = {
            name: item.name,
            quantity: 0,
            totalRevenue: 0,
            type: item.type === 'dimensao' ? 'Vidro sob medida' : 'Item avulso / serviço',
          };
        }
        productMap[key].quantity += Number(item.quantity || 1);
        productMap[key].totalRevenue += Number(item.totalPrice || 0);
      });
    });

    return Object.values(productMap)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
  }, [filteredSales]);

  // Desempenho por Vendedor
  const sellerPerformanceData = useMemo(() => {
    const validSales = filteredSales.filter((s) => s.status !== 'cancelada');
    const sellerMap: Record<string, { id: string; name: string; salesCount: number; totalGross: number; totalPaid: number }> = {};

    validSales.forEach((sale) => {
      const uId = sale.userId || 'usr-padrao';
      const uAccount = users.find((u) => u.id === uId);
      const sellerName = uAccount?.name || 'Vendedor Smart Vidros';

      if (!sellerMap[uId]) {
        sellerMap[uId] = {
          id: uId,
          name: sellerName,
          salesCount: 0,
          totalGross: 0,
          totalPaid: 0,
        };
      }
      sellerMap[uId].salesCount += 1;
      sellerMap[uId].totalGross += sale.total || 0;
      sellerMap[uId].totalPaid += sale.totalPaid || 0;
    });

    return Object.values(sellerMap).sort((a, b) => b.totalGross - a.totalGross);
  }, [filteredSales, users]);

  // Exportar para CSV
  const handleExportCSV = () => {
    const headers = ['Código', 'Data', 'Cliente', 'Telefone', 'Subtotal', 'Desconto', 'Total', 'Valor Pago', 'Fiado', 'Status', 'Itens'];
    const rows = filteredSales.map((s) => [
      `"${s.code || ''}"`,
      `"${s.date || s.createdAt?.split('T')[0] || ''}"`,
      `"${(s.clientName || 'Cliente').replace(/"/g, '""')}"`,
      `"${s.clientPhone || ''}"`,
      s.subtotal?.toFixed(2) || '0.00',
      s.discountAmount?.toFixed(2) || '0.00',
      s.total?.toFixed(2) || '0.00',
      s.totalPaid?.toFixed(2) || '0.00',
      s.totalFiado?.toFixed(2) || '0.00',
      `"${s.status}"`,
      `"${s.items?.map((i) => `${i.quantity}x ${i.name}`).join('; ') || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_vendas_smart_vidros_${dateRange.start}_a_${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Imprimir Relatório
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 font-sans notranslate" translate="no" id="relatorios-module">
      {/* Cabeçalho Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-zinc-800 p-5 sm:p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                Relatórios de Vendas & Faturamento
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Acompanhe o faturamento, ticket médio, conversão e desempenho por período
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Ação: Exportar e Imprimir */}
        <div className="flex items-center gap-2 self-start md:self-auto print:hidden">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-zinc-700 text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Exportar dados filtrados para planilha Excel/CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            title="Imprimir relatório gerencial formatado"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* PAINEL DE FILTROS AVANÇADOS */}
      <div className="bg-slate-900 border border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-lg space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Filtros do Relatório</span>
          </div>
          <span className="text-xs text-slate-400">
            Exibindo <strong className="text-amber-400">{filteredSales.length}</strong> venda(s) encontrada(s)
          </span>
        </div>

        {/* Botões de Período Rápido */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'today', label: 'Hoje' },
            { id: 'yesterday', label: 'Ontem' },
            { id: '7days', label: 'Últimos 7 Dias' },
            { id: '30days', label: 'Últimos 30 Dias' },
            { id: 'this_month', label: 'Este Mês' },
            { id: 'last_month', label: 'Mês Anterior' },
            { id: 'this_year', label: 'Este Ano' },
            { id: 'all', label: 'Todo o Histórico' },
            { id: 'custom', label: 'Personalizado' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => setPeriodPreset(preset.id as PeriodPreset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                periodPreset === preset.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-zinc-700/60'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Linha de Controles de Filtros Detalhados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Período Personalizado se selecionado */}
          {periodPreset === 'custom' ? (
            <div className="sm:col-span-2 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Data Final
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Intervalo Aplicado
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {dateRange.start.split('-').reverse().join('/')} até {dateRange.end.split('-').reverse().join('/')}
                </span>
              </div>
            </div>
          )}

          {/* Filtro de Vendedor */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Vendedor / Usuário
            </label>
            <select
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
              className="w-full bg-slate-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos os Vendedores</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Método de Pagamento */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Forma de Pagamento
            </label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full bg-slate-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todas as Formas</option>
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro em Espécie</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="fiado">Fiado (A Prazo)</option>
              <option value="transferencia">Transferência Bancária</option>
            </select>
          </div>

          {/* Busca Textual */}
          <div className={periodPreset === 'custom' ? 'sm:col-span-2 lg:col-span-1' : ''}>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Buscar Cliente / Código / Produto
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ex: Maria, VEN-2026, Espelho..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 placeholder-slate-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CARDS DE KPIS / MÉTRICAS PRINCIPAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Faturamento Bruto */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 p-5 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Faturamento Total</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-tight">
            R$ {metrics.totalGross.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>{metrics.salesCount} venda(s) no período</span>
            {metrics.canceledCount > 0 && (
              <span className="text-rose-400 font-semibold">({metrics.canceledCount} cancelada)</span>
            )}
          </div>
        </div>

        {/* Total Recebido no Ato */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 p-5 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Recebido no Ato</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono tracking-tight">
            R$ {metrics.totalPaidNow.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Entradas imediatas</span>
            <span className="text-emerald-400 font-bold">
              {metrics.totalGross > 0 ? `${((metrics.totalPaidNow / metrics.totalGross) * 100).toFixed(0)}%` : '0%'}
            </span>
          </div>
        </div>

        {/* Total Fiado / A Receber */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-rose-500/30 p-5 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Fiado / A Prazo</span>
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-300 font-mono tracking-tight">
            R$ {metrics.totalFiado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>A receber futuro</span>
            <span className="text-rose-400 font-bold">
              {metrics.totalGross > 0 ? `${((metrics.totalFiado / metrics.totalGross) * 100).toFixed(0)}%` : '0%'}
            </span>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-indigo-500/30 p-5 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Ticket Médio</span>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono tracking-tight">
            R$ {metrics.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Conversão: {metrics.conversionRate.toFixed(0)}%</span>
            <span>{metrics.totalQuotesCount} orçamentos</span>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO DE SUB-ABAS DO RELATÓRIO */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto print:hidden">
        {[
          { id: 'overview', label: 'Gráficos & Visão Geral', icon: BarChart3 },
          { id: 'sales_list', label: `Listagem de Vendas (${filteredSales.length})`, icon: ShoppingBag },
          { id: 'sellers', label: `Por Vendedor (${sellerPerformanceData.length})`, icon: Users },
          { id: 'products', label: `Itens & Produtos Mais Vendidos (${topProductsData.length})`, icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                activeSubTab === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ABA 1: GRÁFICOS & VISÃO GERAL */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico 1: Evolução Temporal de Vendas */}
            <div className="lg:col-span-2 bg-slate-900 border border-zinc-800 p-5 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>Evolução do Faturamento no Período</span>
                  </h3>
                  <p className="text-xs text-slate-400">Distribuição dos valores vendidos ao longo dos dias</p>
                </div>
              </div>

              {timelineChartData.length > 0 ? (
                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                      <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `R$${v}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#F59E0B',
                          borderRadius: '0.75rem',
                          color: '#F8FAFC',
                          fontSize: '12px',
                        }}
                        formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Faturamento']}
                      />
                      <Area type="monotone" dataKey="total" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <BarChart3 className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
                  <span>Nenhuma venda registrada no período selecionado.</span>
                </div>
              )}
            </div>

            {/* Gráfico 2: Formas de Pagamento */}
            <div className="bg-slate-900 border border-zinc-800 p-5 rounded-2xl shadow-xl flex flex-col">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-emerald-400" />
                  <span>Formas de Pagamento</span>
                </h3>
                <p className="text-xs text-slate-400">Divisão do faturamento por modalidade</p>
              </div>

              {paymentMethodsChartData.length > 0 ? (
                <div className="h-56 w-full flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodsChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {paymentMethodsChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          color: '#F8FAFC',
                          fontSize: '12px',
                        }}
                        formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Total']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <span>Sem dados para exibir o gráfico de formas de pagamento.</span>
                </div>
              )}

              {/* Legenda dos Métodos */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                {paymentMethodsChartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-100 font-mono">
                      R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Destaques: Top Produtos e Vendedores em Mini-Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Produtos */}
            <div className="bg-slate-900 border border-zinc-800 p-5 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Top 5 Produtos & Serviços Mais Vendidos</span>
                </h3>
                <button
                  onClick={() => setActiveSubTab('products')}
                  className="text-xs text-amber-400 hover:underline font-bold"
                >
                  Ver todos →
                </button>
              </div>

              <div className="space-y-3">
                {topProductsData.slice(0, 5).map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-zinc-800/80"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-200 line-clamp-1">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.quantity} unidade(s) vendida(s)</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-amber-400 font-mono">
                        R$ {p.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
                {topProductsData.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-500">Nenhum produto registrado no período.</div>
                )}
              </div>
            </div>

            {/* Desempenho Vendedores */}
            <div className="bg-slate-900 border border-zinc-800 p-5 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Desempenho por Vendedor</span>
                </h3>
                <button
                  onClick={() => setActiveSubTab('sellers')}
                  className="text-xs text-indigo-400 hover:underline font-bold"
                >
                  Ver todos →
                </button>
              </div>

              <div className="space-y-3">
                {sellerPerformanceData.map((seller, idx) => (
                  <div
                    key={seller.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-zinc-800/80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 font-black text-xs flex items-center justify-center">
                        {seller.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{seller.name}</div>
                        <div className="text-[10px] text-slate-400">{seller.salesCount} venda(s) realizadas</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-indigo-300 font-mono">
                        R$ {seller.totalGross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        R$ {seller.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} recebido
                      </div>
                    </div>
                  </div>
                ))}
                {sellerPerformanceData.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-500">Nenhum vendedor com vendas no período.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: LISTAGEM DETALHADA DE VENDAS */}
      {activeSubTab === 'sales_list' && (
        <div className="bg-slate-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Vendas Registradas ({filteredSales.length})</span>
            </h3>
            <span className="text-xs text-slate-400">
              Total Faturado:{' '}
              <strong className="text-amber-400 font-mono">
                R$ {metrics.totalGross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Código / Data</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Itens Principais</th>
                  <th className="py-3 px-4">Formas Pgto</th>
                  <th className="py-3 px-4 text-right">Desconto</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Recebido / Fiado</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-amber-400">{sale.code}</div>
                      <div className="text-[10px] text-slate-500">
                        {sale.date ? sale.date.split('-').reverse().join('/') : sale.createdAt?.split('T')[0]}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-200">{sale.clientName || 'Cliente Balcão'}</div>
                      {sale.clientPhone && <div className="text-[10px] text-slate-500">{sale.clientPhone}</div>}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      <span className="text-slate-300">
                        {sale.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ') || 'Venda PDV'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {sale.payments?.map((p, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-zinc-700"
                          >
                            {p.method} (R$ {p.amount.toFixed(0)})
                          </span>
                        )) || (
                          <span className="text-slate-500 text-[10px]">Padrão</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {sale.discountAmount > 0 ? `R$ ${sale.discountAmount.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-black font-mono text-slate-100">
                      R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono">
                      <div className="text-emerald-400 font-bold">
                        R$ {sale.totalPaid?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                      </div>
                      {sale.totalFiado > 0 && (
                        <div className="text-rose-400 text-[10px]">
                          Fiado: R$ {sale.totalFiado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {sale.status === 'concluida' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Concluída</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" />
                          <span>Cancelada</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {onViewSale && (
                        <button
                          onClick={() => onViewSale(sale)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-bold transition-all border border-zinc-700"
                        >
                          Ver Venda
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                      Nenhuma venda encontrada para os filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: POR VENDEDOR */}
      {activeSubTab === 'sellers' && (
        <div className="bg-slate-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Consolidação por Vendedor no Período</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sellerPerformanceData.map((seller, idx) => {
              const share = metrics.totalGross > 0 ? (seller.totalGross / metrics.totalGross) * 100 : 0;
              return (
                <div
                  key={seller.id}
                  className="bg-slate-950 border border-zinc-800 p-5 rounded-xl space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 font-black text-sm flex items-center justify-center">
                        {seller.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-100">{seller.name}</div>
                        <div className="text-[11px] text-slate-400">{seller.salesCount} vendas realizadas</div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                      {share.toFixed(1)}% do total
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px]">Faturamento Bruto:</span>
                      <div className="font-bold text-slate-200 font-mono">
                        R$ {seller.totalGross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Recebido no Ato:</span>
                      <div className="font-bold text-emerald-400 font-mono">
                        R$ {seller.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${share}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 4: ITENS & PRODUTOS MAIS VENDIDOS */}
      {activeSubTab === 'products' && (
        <div className="bg-slate-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Itens, Vidros e Serviços Mais Faturados</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Posição</th>
                  <th className="py-3 px-4">Nome do Item</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4 text-center">Quantidade Total</th>
                  <th className="py-3 px-4 text-right">Faturamento Gerado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {topProductsData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-100">{item.name}</td>
                    <td className="py-3 px-4 text-slate-400">{item.type}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-200">{item.quantity}</td>
                    <td className="py-3 px-4 text-right font-black font-mono text-amber-400">
                      R$ {item.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RODAPÉ DO RELATÓRIO PARA IMPRESSÃO */}
      <div className="hidden print:block text-center text-xs text-slate-500 pt-6 border-t border-zinc-800 mt-8">
        <p className="font-bold text-slate-800">{companyInfo.name} — CNPJ: {companyInfo.cnpj}</p>
        <p>{companyInfo.address} — {companyInfo.city} — Tel: {companyInfo.phone}</p>
        <p className="text-[10px] mt-1">Relatório gerado em {new Date().toLocaleString('pt-BR')}</p>
      </div>
    </div>
  );
};
