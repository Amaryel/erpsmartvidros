import React from 'react';
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
  Scale
} from 'lucide-react';
import { Quote, Sale, Receivable, Receipt, CompanyInfo } from '../types';
import { calculateCashSummary } from '../services/data/repositories/cashRepository';
import smartVidrosLogoImg from '../assets/images/smart_vidros_logo_1786536378370.jpg';

interface DashboardProps {
  quotes: Quote[];
  sales: Sale[];
  receivables: Receivable[];
  receipts: Receipt[];
  companyInfo: CompanyInfo;
  onNavigate: (tab: any) => void;
  onNewQuote: () => void;
  onOpenPdv: () => void;
  onNewReceipt: () => void;
  onViewQuote: (quote: Quote) => void;
  onViewSale: (sale: Sale) => void;
  onViewReceipt: (receipt: Receipt) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  quotes,
  sales,
  receivables,
  receipts,
  companyInfo,
  onNavigate,
  onNewQuote,
  onOpenPdv,
  onNewReceipt,
  onViewQuote,
  onViewSale,
  onViewReceipt,
}) => {
  // Cálculos do Dashboard
  const totalFaturamento = sales.reduce((sum, s) => sum + s.total, 0);
  const totalRecebidoNaoFiado = sales.reduce((sum, s) => sum + s.totalPaid, 0);
  
  const orcamentosPendentes = quotes.filter((q) => q.status === 'pendente' || q.status === 'rascunho').length;
  const orcamentosAprovados = quotes.filter((q) => q.status === 'aprovado').length;
  
  const totalFiadoPendente = receivables.reduce((sum, r) => sum + r.remainingAmount, 0);
  const totalRecibosValor = receipts.reduce((sum, r) => sum + r.amount, 0);

  // Resumo do Módulo de Caixa / Fluxo Diário
  const cashSummary = calculateCashSummary();

  // Vendas Recentes (Últimas 5)
  const recentSales = [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  // Orçamentos Recentes (Últimos 5)
  const recentQuotes = [...quotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  // Contas a Receber com Saldo
  const pendingReceivablesList = receivables.filter((r) => r.remainingAmount > 0).slice(0, 5);

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

  return (
    <div className="space-y-6 pb-8">
      
      {/* Banner de Boas-Vindas com Logo Oficial */}
      <div className="bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-950 border border-amber-500/40 rounded-2xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-amber-400/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-amber-500 text-slate-950 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full tracking-wider shadow-sm">
                  Painel de Controle
                </span>
                <span className="text-xs text-amber-200/80 font-medium">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Gestão</span>
                <span className="text-amber-400">Smart Vidros</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl font-normal leading-relaxed">
                Bem-vindo ao sistema da <strong className="text-amber-400 font-bold">{companyInfo.name || 'Smart Vidros'}</strong>. Controle orçamentos, vendas no PDV, recibos e contas a receber com facilidade.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenPdv}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-3 rounded-xl shadow-lg active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Abrir PDV</span>
            </button>

            <button
              onClick={onNewQuote}
              className="flex items-center gap-2 bg-zinc-800/90 hover:bg-zinc-700 text-amber-400 border border-amber-500/40 font-bold text-xs px-4 py-3 rounded-xl shadow-sm active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Orçamento</span>
            </button>
          </div>
        </div>
      </div>

      {/* MÓDULO DE CAIXA E FLUXO DIÁRIO - CARD DE DESTAQUE */}
      <div className="bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950 border-2 border-amber-500/40 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Dados de Saldo e Movimento */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold shadow-md">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                  <span>Caixa & Movimento Financeiro</span>
                  {cashSummary.activeSession ? (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                      Caixa Aberto
                    </span>
                  ) : (
                    <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Saldo Contínuo
                    </span>
                  )}
                </h3>
                <p className="text-xs text-zinc-400">
                  Saldo real apurado com base no saldo inicial e movimentações registradas
                </p>
              </div>
            </div>

            {/* Grid de Valores do Caixa */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              
              {/* Saldo Atual */}
              <div className="bg-zinc-900/80 border border-amber-500/30 p-3.5 rounded-2xl">
                <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider block">
                  Saldo Atual em Caixa
                </span>
                <div className="text-xl font-black font-mono text-white mt-0.5">
                  R$ {cashSummary.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Entradas Hoje */}
              <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-2xl">
                <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider block">
                  Entradas Hoje
                </span>
                <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">
                  + R$ {cashSummary.todayEntries.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Saídas Hoje */}
              <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-2xl">
                <span className="text-[10px] font-extrabold uppercase text-rose-400 tracking-wider block">
                  Saídas Hoje
                </span>
                <div className="text-xl font-black font-mono text-rose-400 mt-0.5">
                  - R$ {cashSummary.todayExits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Resultado do Dia */}
              <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-2xl">
                <span className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider block">
                  Resultado do Dia
                </span>
                <div
                  className={`text-xl font-black font-mono mt-0.5 ${
                    cashSummary.todayResult >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {cashSummary.todayResult >= 0 ? '+' : ''} R${' '}
                  {cashSummary.todayResult.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

            </div>
          </div>

          {/* Botões de Ação Rápida no Caixa */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('cash')}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4 text-slate-950" />
                <span>Lançar por Áudio</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('cash')}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Ver Caixa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('cash')}
                className="flex-1 px-3.5 py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Entrada</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('cash')}
                className="flex-1 px-3.5 py-2 bg-rose-600/90 hover:bg-rose-500 text-white font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>- Despesa</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Faturamento Total */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Faturamento em Vendas</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <span className="text-emerald-700 font-bold">R$ {totalRecebidoNaoFiado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> recebidos no ato
          </p>
        </div>

        {/* Card 2: Orçamentos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Orçamentos</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {quotes.length} <span className="text-xs font-semibold text-slate-400">cadastrados</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-[11px] font-medium">
            <span className="text-amber-700 font-bold">{orcamentosPendentes} pendentes</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">{orcamentosAprovados} aprovados</span>
          </div>
        </div>

        {/* Card 3: Fiado / Contas a Receber */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">A Receber (Fiado)</span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono">
            R$ {totalFiadoPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {receivables.filter((r) => r.remainingAmount > 0).length} clientes com saldo em aberto
          </p>
        </div>

        {/* Card 4: Recibos Emitidos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Recibos Emitidos</span>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
              <ReceiptText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {receipts.length} <span className="text-xs font-semibold text-slate-400">emitidos</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Total em recibos: R$ {totalRecibosValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

      </div>

      {/* SEÇÃO PRINCIPAL DE ALERTAS OPERACIONAIS & VENCIMENTOS DE CLIENTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* BLOCO 1: OBRAS & ENTREGAS COM PRAZO PRÓXIMO OU ATRASADO */}
        <div className="bg-white border-2 border-amber-400 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl shadow-xs font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-base leading-tight">
                    Obras & Entregas no Prazo
                  </h2>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Prazos de execução e entrega de serviços
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('operations')}
                className="text-xs font-black text-amber-900 hover:text-slate-950 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl border border-amber-300 transition-colors flex items-center gap-1 shadow-xs"
              >
                <span>Ver Painel ({urgentObras.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {urgentObras.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-extrabold text-slate-700">Tudo em dia com as entregas!</p>
                <p className="text-[11px] text-slate-500">Nenhuma obra em atraso ou com entrega urgente marcada.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {urgentObras.map((obra) => {
                  const isOverdue = obra.deliveryDate < todayStr;
                  const [y, m, d] = obra.deliveryDate.split('-');
                  const formattedDate = `${d}/${m}/${y}`;

                  return (
                    <div
                      key={`${obra.type}-${obra.id}`}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        isOverdue
                          ? 'bg-rose-50 border-rose-300'
                          : 'bg-amber-50/80 border-amber-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              isOverdue
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-500 text-slate-950'
                            }`}
                          >
                            {isOverdue ? '⚠️ Delivery Atrasado' : '📅 Entrega Prevista'}
                          </span>
                          <span className="font-mono font-bold text-slate-900 text-xs">{obra.code}</span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{obra.clientName}</h4>
                        <span className="text-[11px] text-slate-600 font-medium block">
                          Prazo: <strong className={isOverdue ? 'text-rose-700 font-black' : 'text-slate-900 font-bold'}>{formattedDate}</strong>
                        </span>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <span className="text-xs font-black font-mono text-slate-900 block">
                          R$ {obra.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <button
                          onClick={() => onNavigate('operations')}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-[11px] rounded-lg transition-colors shadow-2xs"
                        >
                          Acompanhar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* BLOCO 2: VENCIMENTOS & COBRANÇAS DE CLIENTES */}
        <div className="bg-white border-2 border-rose-300 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-xs font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-base leading-tight">
                    Vencimentos de Clientes (Fiado)
                  </h2>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Parcelas vencidas ou com vencimento próximo
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('receivables')}
                className="text-xs font-black text-rose-800 hover:text-rose-950 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-xl border border-rose-300 transition-colors flex items-center gap-1 shadow-xs"
              >
                <span>Ver Fiado ({urgentReceivablesList.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {urgentReceivablesList.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-extrabold text-slate-700">Sem cobranças pendentes!</p>
                <p className="text-[11px] text-slate-500">Todas as contas de fiado estão quitadas ou em dia.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {urgentReceivablesList.map((item) => {
                  const [y, m, d] = item.dueDate.split('-');
                  const formattedDueDate = `${d}/${m}/${y}`;
                  const isToday = item.dueDate === todayStr;

                  return (
                    <div
                      key={`${item.receivableId}-${item.installmentId}`}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        item.isOverdue
                          ? 'bg-rose-50 border-rose-300'
                          : isToday
                          ? 'bg-amber-50 border-amber-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              item.isOverdue
                                ? 'bg-rose-600 text-white'
                                : isToday
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {item.isOverdue ? '⚠️ Parcela Vencida' : isToday ? '⏰ Vence Hoje' : '📅 Próxima'}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-slate-600">
                            Venda {item.saleCode} • Parc {item.number}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{item.clientName}</h4>
                        <span className="text-[11px] text-slate-600 font-medium block">
                          Vencimento: <strong className={item.isOverdue ? 'text-rose-700 font-black' : 'text-slate-900 font-bold'}>{formattedDueDate}</strong>
                        </span>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <span className="text-xs font-black font-mono text-slate-900 block">
                          R$ {(item.amount - item.paidAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <button
                          onClick={() => onNavigate('receivables')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition-colors shadow-2xs"
                        >
                          Dar Baixa
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Acesso Rápido aos Módulos */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider mb-4 flex items-center gap-2">
          <span>Acesso Rápido aos Módulos</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <button
            onClick={() => onNavigate('operations')}
            className="flex flex-col items-center p-4 rounded-xl border-2 border-amber-400 bg-amber-50/80 hover:bg-amber-100 transition-all text-center group shadow-xs"
          >
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 group-hover:scale-110 transition-transform mb-2 shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="font-black text-xs text-slate-950">Obras & Operações</span>
            <span className="text-[10px] text-amber-800 font-bold">Acompanhamento</span>
          </button>

          <button
            onClick={() => onNavigate('quotes')}
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-amber-50 hover:border-amber-300 transition-all text-center group"
          >
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-amber-600 group-hover:scale-110 transition-transform mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xs text-slate-900">Orçamentos</span>
            <span className="text-[10px] text-slate-500">{quotes.length} salvos</span>
          </button>

          <button
            onClick={() => onNavigate('sales')}
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-amber-50 hover:border-amber-300 transition-all text-center group"
          >
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-amber-600 group-hover:scale-110 transition-transform mb-2">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xs text-slate-900">Vendas & PDV</span>
            <span className="text-[10px] text-slate-500">{sales.length} vendas</span>
          </button>

          <button
            onClick={() => onNavigate('receivables')}
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-amber-50 hover:border-amber-300 transition-all text-center group"
          >
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-amber-600 group-hover:scale-110 transition-transform mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xs text-slate-900">A Receber</span>
            <span className="text-[10px] text-slate-500">{receivables.length} contas</span>
          </button>

          <button
            onClick={() => onNavigate('receipts')}
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-amber-50 hover:border-amber-300 transition-all text-center group"
          >
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-amber-600 group-hover:scale-110 transition-transform mb-2">
              <ReceiptText className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xs text-slate-900">Recibos</span>
            <span className="text-[10px] text-slate-500">{receipts.length} emitidos</span>
          </button>

          <button
            onClick={() => onNavigate('catalog')}
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-amber-50 hover:border-amber-300 transition-all text-center group"
          >
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-amber-600 group-hover:scale-110 transition-transform mb-2">
              <Package className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xs text-slate-900">Catálogo</span>
            <span className="text-[10px] text-slate-500">Produtos & Serviços</span>
          </button>

          <button
            onClick={() => onNavigate('company')}
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-amber-50 hover:border-amber-300 transition-all text-center group"
          >
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-amber-600 group-hover:scale-110 transition-transform mb-2">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xs text-slate-900">Empresa</span>
            <span className="text-[10px] text-slate-500">Dados & Logo</span>
          </button>
        </div>
      </div>

      {/* Duas Colunas: Vendas Recentes & Orçamentos Ativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Vendas Recentes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              <span>Últimas Vendas Concluídas</span>
            </h2>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {recentSales.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">
                Nenhuma venda registrada ainda. Clique em "Abrir PDV" para iniciar.
              </p>
            ) : (
              recentSales.map((sale) => (
                <div key={sale.id} className="py-3 flex items-center justify-between hover:bg-slate-50/80 rounded-lg px-2 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-slate-900 font-mono">{sale.code}</span>
                      <span className="text-xs font-bold text-slate-800">{sale.clientName || 'Cliente Balcão'}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {new Date(sale.date + 'T00:00:00').toLocaleDateString('pt-BR')} • {sale.items.length} itens
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 font-mono block">
                      R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <button
                      onClick={() => onViewSale(sale)}
                      className="text-[10px] font-bold text-amber-700 hover:underline"
                    >
                      Detalhes
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Orçamentos Recentes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Orçamentos Recentes</span>
            </h2>
            <button
              onClick={() => onNavigate('quotes')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {recentQuotes.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">
                Nenhum orçamento cadastrado.
              </p>
            ) : (
              recentQuotes.map((quote) => (
                <div key={quote.id} className="py-3 flex items-center justify-between hover:bg-slate-50/80 rounded-lg px-2 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-slate-900 font-mono">{quote.code}</span>
                      <span className="text-xs font-bold text-slate-800">{quote.clientName || 'Cliente'}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {new Date(quote.date + 'T00:00:00').toLocaleDateString('pt-BR')} • {quote.items.length} itens
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-amber-600 font-mono block">
                      R$ {quote.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <button
                      onClick={() => onViewQuote(quote)}
                      className="text-[10px] font-bold text-amber-700 hover:underline"
                    >
                      Ver Orçamento
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
