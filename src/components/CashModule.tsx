import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Mic,
  Calendar,
  Filter,
  Search,
  Settings,
  Lock,
  Unlock,
  History,
  Tag,
  CreditCard,
  User,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  XCircle,
  FileText,
  Clock,
  ArrowUpDown,
  Download,
  Layers,
  ChevronRight,
  Info,
  Scale
} from 'lucide-react';
import {
  CashTransaction,
  CashInitialBalance,
  CashSession,
  CashCategoryItem,
  CashPaymentMethod,
  CashTransactionType,
  AppUser
} from '../types';
import {
  getCashTransactions,
  getCashInitialBalance,
  getCashCategories,
  getCashSessions,
  getCurrentOpenCashSession,
  calculateCashSummary,
  CashSummary,
  saveCashCategory,
  deleteCashCategory
} from '../services/data/repositories/cashRepository';
import { CashAudioModal } from './CashAudioModal';
import { CashTransactionModal } from './CashTransactionModal';
import { CashInitialBalanceModal } from './CashInitialBalanceModal';
import { CashSessionModal } from './CashSessionModal';
import { CashCancelModal } from './CashCancelModal';

interface CashModuleProps {
  currentUser?: AppUser | null;
}

export const CashModule: React.FC<CashModuleProps> = ({ currentUser }) => {
  // Estados principais
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [initialBalance, setInitialBalance] = useState<CashInitialBalance | null>(null);
  const [categories, setCategories] = useState<CashCategoryItem[]>([]);
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [activeSession, setActiveSession] = useState<CashSession | null>(null);
  const [summary, setSummary] = useState<CashSummary | null>(null);

  // Aba ativa
  const [activeTab, setActiveTab] = useState<'movimentacoes' | 'fechamentos' | 'categorias'>('movimentacoes');

  // Modais
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<CashTransactionType>('saida');
  const [editingTransaction, setEditingTransaction] = useState<CashTransaction | null>(null);
  const [prefilledTxData, setPrefilledTxData] = useState<Partial<CashTransaction> | null>(null);
  
  const [isInitialBalanceModalOpen, setIsInitialBalanceModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionModalMode, setSessionModalMode] = useState<'open' | 'close'>('open');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellingTransaction, setCancellingTransaction] = useState<CashTransaction | null>(null);
  
  const [selectedTxDetails, setSelectedTxDetails] = useState<CashTransaction | null>(null);

  // Filtros
  const [periodFilter, setPeriodFilter] = useState<'hoje' | 'ontem' | '7dias' | 'mes' | 'todos'>('hoje');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'entrada' | 'saida' | 'cancelado'>('todos');
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Categorias tab states
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'entrada' | 'saida' | 'ambos'>('saida');

  // Carregar dados
  const loadData = () => {
    const txs = getCashTransactions();
    const init = getCashInitialBalance();
    const cats = getCashCategories();
    const sess = getCashSessions();
    const openSess = getCurrentOpenCashSession();
    const sum = calculateCashSummary();

    setTransactions(txs);
    setInitialBalance(init);
    setCategories(cats);
    setSessions(sess);
    setActiveSession(openSess);
    setSummary(sum);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtragem de movimentações
  const filteredTransactions = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Data de ontem
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Data de 7 dias atrás
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    // Início do mês
    const startOfMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;

    return transactions.filter((tx) => {
      // Filtro de Período
      if (periodFilter === 'hoje' && tx.date !== todayStr) return false;
      if (periodFilter === 'ontem' && tx.date !== yesterdayStr) return false;
      if (periodFilter === '7dias' && (tx.date < sevenDaysAgoStr || tx.date > todayStr)) return false;
      if (periodFilter === 'mes' && tx.date < startOfMonthStr) return false;

      // Filtro de Tipo / Status
      if (typeFilter === 'cancelado') {
        if (tx.status !== 'cancelado') return false;
      } else {
        if (tx.status === 'cancelado' && typeFilter !== 'todos') return false;
        if (typeFilter !== 'todos' && tx.type !== typeFilter) return false;
      }

      // Filtro de Categoria
      if (categoryFilter !== 'todas' && tx.categoryId !== categoryFilter) return false;

      // Filtro de Forma de Pagamento
      if (paymentMethodFilter !== 'todas' && tx.paymentMethod !== paymentMethodFilter) return false;

      // Filtro de Busca Textual
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = tx.description.toLowerCase().includes(q);
        const matchCat = tx.categoryName.toLowerCase().includes(q);
        const matchClient = tx.clientName ? tx.clientName.toLowerCase().includes(q) : false;
        const matchSale = tx.saleCode ? tx.saleCode.toLowerCase().includes(q) : false;
        const matchUser = tx.userName ? tx.userName.toLowerCase().includes(q) : false;
        if (!matchDesc && !matchCat && !matchClient && !matchSale && !matchUser) return false;
      }

      return true;
    });
  }, [transactions, periodFilter, typeFilter, categoryFilter, paymentMethodFilter, searchQuery]);

  const paymentMethodLabels: Record<CashPaymentMethod, string> = {
    dinheiro: 'Dinheiro',
    pix: 'PIX',
    cartao_credito: 'Cartão Crédito',
    cartao_debito: 'Cartão Débito',
    transferencia: 'Transferência',
    cheque: 'Cheque',
    outro: 'Outro',
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    saveCashCategory({
      id: '',
      name: newCatName.trim(),
      type: newCatType,
    });

    setNewCatName('');
    loadData();
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      const ok = deleteCashCategory(id);
      if (ok) loadData();
      else alert('Categorias padrão do sistema não podem ser excluídas.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* CABEÇALHO PRINCIPAL DO CAIXA */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-amber-500 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/20 font-black">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Caixa & Controle Financeiro
              </h1>
              {activeSession ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Caixa Aberto
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  Modo Contínuo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Movimento financeiro diário, controle de entradas, despesas e conferência de saldo real.
            </p>
          </div>
        </div>

        {/* BOTÕES DE AÇÃO RÁPIDA */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Lançar por Áudio */}
          <button
            type="button"
            onClick={() => setIsAudioModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-md active:scale-95 transition-all flex items-center gap-2"
          >
            <Mic className="w-4 h-4 text-slate-950" />
            <span>Lançar por Áudio</span>
          </button>

          {/* + Entrada */}
          <button
            type="button"
            onClick={() => {
              setEditingTransaction(null);
              setPrefilledTxData(null);
              setTxModalType('entrada');
              setIsTxModalOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Entrada</span>
          </button>

          {/* - Despesa */}
          <button
            type="button"
            onClick={() => {
              setEditingTransaction(null);
              setPrefilledTxData(null);
              setTxModalType('saida');
              setIsTxModalOpen(true);
            }}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-2xl shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Minus className="w-4 h-4" />
            <span>Despesa</span>
          </button>

          {/* Abrir / Fechar Caixa */}
          {activeSession ? (
            <button
              type="button"
              onClick={() => {
                setSessionModalMode('close');
                setIsSessionModalOpen(true);
              }}
              className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-2xl border border-indigo-200 transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>Fechar Caixa</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSessionModalMode('open');
                setIsSessionModalOpen(true);
              }}
              className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-xs rounded-2xl border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Unlock className="w-4 h-4 text-slate-500" />
              <span>Abrir Caixa</span>
            </button>
          )}

          {/* Saldo Inicial Config */}
          <button
            type="button"
            onClick={() => setIsInitialBalanceModalOpen(true)}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl border border-slate-200 transition-colors"
            title="Configurar Saldo Inicial"
          >
            <Settings className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* DASHBOARD DE RESUMO FINANCEIRO (CARDS PRINCIPAIS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: SALDO ATUAL DO CAIXA (DESTAQUE MÁXIMO) */}
        <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl shadow-xl space-y-3 relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              Saldo Atual em Caixa
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full">
              Tempo Real
            </span>
          </div>

          <div className="text-3xl font-black font-mono tracking-tight text-white">
            R$ {(summary?.currentBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
            <span>Saldo Inicial: R$ {(summary?.initialBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <button
              onClick={() => setIsInitialBalanceModalOpen(true)}
              className="text-amber-400 hover:underline font-bold text-[10px]"
            >
              Histórico
            </button>
          </div>
        </div>

        {/* CARD 2: ENTRADAS DE HOJE */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Entradas Hoje
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
              {summary?.todayCountEntries || 0} lançamentos
            </span>
          </div>

          <div className="text-2xl font-black font-mono tracking-tight text-emerald-600">
            + R$ {(summary?.todayEntries || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
            Total acumulado: R$ {(summary?.totalEntries || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* CARD 3: SAÍDAS / DESPESAS DE HOJE */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              Despesas Hoje
            </span>
            <span className="text-[10px] bg-rose-50 text-rose-700 font-extrabold px-2 py-0.5 rounded-full border border-rose-200">
              {summary?.todayCountExits || 0} lançamentos
            </span>
          </div>

          <div className="text-2xl font-black font-mono tracking-tight text-rose-600">
            - R$ {(summary?.todayExits || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
            Total acumulado: R$ {(summary?.totalExits || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* CARD 4: RESULTADO DO DIA (LUCRO/FLUXO LÍQUIDO) */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-500" />
              Resultado do Dia
            </span>
            <span className="text-[10px] text-slate-400 font-bold">
              Entradas - Saídas
            </span>
          </div>

          <div
            className={`text-2xl font-black font-mono tracking-tight ${
              (summary?.todayResult || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {(summary?.todayResult || 0) >= 0 ? '+' : ''} R${' '}
            {(summary?.todayResult || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2.5 flex items-center justify-between">
            <span>Dinheiro: R$ {(summary?.byPaymentMethodToday.dinheiro || 0).toFixed(2)}</span>
            <span>PIX: R$ {(summary?.byPaymentMethodToday.pix || 0).toFixed(2)}</span>
          </div>
        </div>

      </div>

      {/* BANNER DE CAIXA ABERTO (SE HOUVER SESSÃO ATIVA) */}
      {activeSession && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Unlock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold">
                Caixa aberto em {new Date(activeSession.openedAt).toLocaleDateString('pt-BR')} às{' '}
                {new Date(activeSession.openedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-[11px] text-emerald-800">
                Responsável: <strong>{activeSession.openedBy}</strong> | Saldo de Abertura: R${' '}
                {activeSession.initialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSessionModalMode('close');
              setIsSessionModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            Fechar e Conferir Caixa
          </button>
        </div>
      )}

      {/* NAVEGAÇÃO DE ABAS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('movimentacoes')}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${
            activeTab === 'movimentacoes'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Movimentações ({filteredTransactions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fechamentos')}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${
            activeTab === 'fechamentos'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Histórico de Fechamentos ({sessions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categorias')}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${
            activeTab === 'categorias'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Categorias ({categories.length})</span>
        </button>
      </div>

      {/* CONTEÚDO DA ABA 1: MOVIMENTAÇÕES */}
      {activeTab === 'movimentacoes' && (
        <div className="space-y-4">
          
          {/* BARRA DE FILTROS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              
              {/* Filtro de Período Rápido */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                {[
                  { id: 'hoje', label: 'Hoje' },
                  { id: 'ontem', label: 'Ontem' },
                  { id: '7dias', label: 'Últimos 7 dias' },
                  { id: 'mes', label: 'Este Mês' },
                  { id: 'todos', label: 'Todos' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPeriodFilter(p.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      periodFilter === p.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Filtro de Tipo */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'entrada', label: 'Entradas' },
                  { id: 'saida', label: 'Saídas' },
                  { id: 'cancelado', label: 'Cancelados' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTypeFilter(t.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      typeFilter === t.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

            </div>

            {/* Linha Secundária: Categoria, Forma de Pagamento e Busca */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
              
              {/* Busca Textual */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por descrição, cliente, venda..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Filtro de Categoria */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-hidden"
                >
                  <option value="todas">Todas as Categorias</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type === 'saida' ? 'Saída' : 'Entrada'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Forma de Pagamento */}
              <div>
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-hidden"
                >
                  <option value="todas">Todas as Formas de Pagamento</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="pix">PIX</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="transferencia">Transferência</option>
                  <option value="cheque">Cheque</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

            </div>

          </div>

          {/* TABELA / LISTAGEM DE MOVIMENTAÇÕES */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <DollarSign className="w-12 h-12 mx-auto text-slate-300" />
                <h3 className="text-sm font-bold text-slate-700">
                  Nenhuma movimentação encontrada
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Não há lançamentos para os filtros selecionados. Utilize os botões acima para registrar uma entrada ou despesa.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Data / Hora</th>
                      <th className="py-3 px-4">Descrição & Cliente</th>
                      <th className="py-3 px-4">Categoria</th>
                      <th className="py-3 px-4">Forma de Pagto</th>
                      <th className="py-3 px-4 text-right">Valor (R$)</th>
                      <th className="py-3 px-4 text-center">Ações</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map((tx) => {
                      const isCancelled = tx.status === 'cancelado';
                      return (
                        <tr
                          key={tx.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isCancelled ? 'opacity-50 bg-slate-50/40' : ''
                          }`}
                        >
                          {/* Tipo */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isCancelled ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-200 text-slate-600">
                                <XCircle className="w-3 h-3" />
                                Cancelado
                              </span>
                            ) : tx.type === 'entrada' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <TrendingUp className="w-3.5 h-3.5" />
                                Entrada
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200">
                                <TrendingDown className="w-3.5 h-3.5" />
                                Saída
                              </span>
                            )}
                          </td>

                          {/* Data / Hora */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                            <div className="font-bold">
                              {new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                            </div>
                            <div className="text-[10px] text-slate-400">{tx.time || '12:00'}</div>
                          </td>

                          {/* Descrição & Cliente */}
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-900">{tx.description}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2">
                              {tx.clientName && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-400" />
                                  {tx.clientName}
                                </span>
                              )}
                              {tx.saleCode && (
                                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono text-[10px]">
                                  {tx.saleCode}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Categoria */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                              {tx.categoryName}
                            </span>
                          </td>

                          {/* Forma de Pagamento */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                            <span className="flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-amber-500" />
                              {paymentMethodLabels[tx.paymentMethod] || tx.paymentMethod}
                            </span>
                          </td>

                          {/* Valor */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono font-black text-sm">
                            <span
                              className={
                                isCancelled
                                  ? 'line-through text-slate-400'
                                  : tx.type === 'entrada'
                                  ? 'text-emerald-600'
                                  : 'text-rose-600'
                              }
                            >
                              {tx.type === 'entrada' ? '+' : '-'} R${' '}
                              {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </td>

                          {/* Ações */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1">
                              
                              {/* Visualizar */}
                              <button
                                type="button"
                                onClick={() => setSelectedTxDetails(tx)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Ver Detalhes & Auditoria"
                              >
                                <Info className="w-4 h-4" />
                              </button>

                              {!isCancelled && (
                                <>
                                  {/* Editar */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingTransaction(tx);
                                      setTxModalType(tx.type);
                                      setIsTxModalOpen(true);
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                    title="Editar Lançamento"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>

                                  {/* Cancelar */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCancellingTransaction(tx);
                                      setIsCancelModalOpen(true);
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Cancelar Lançamento"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* CONTEÚDO DA ABA 2: FECHAMENTOS DE CAIXA */}
      {activeTab === 'fechamentos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Histórico de Fechamentos de Caixa</h3>
              <p className="text-xs text-slate-500">
                Auditoria de aberturas, conferências físicas e apuração de sobras/faltas
              </p>
            </div>

            {activeSession ? (
              <button
                type="button"
                onClick={() => {
                  setSessionModalMode('close');
                  setIsSessionModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-xs"
              >
                Encerrar Caixa Aberto
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSessionModalMode('open');
                  setIsSessionModalOpen(true);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-xs"
              >
                Abrir Novo Caixa
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
              <History className="w-10 h-10 mx-auto text-slate-300" />
              <h4 className="text-xs font-bold text-slate-700">Nenhum fechamento registrado</h4>
              <p className="text-xs text-slate-400">
                A abertura e fechamento de caixa são opcionais. Caso deseje utilizar para conferência diária, clique em "Abrir Novo Caixa".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((sess) => {
                const isClosed = sess.status === 'fechado';
                const diff = sess.difference || 0;
                return (
                  <div
                    key={sess.id}
                    className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4"
                  >
                    {/* Topo do Card de Sessão */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-xl text-white ${
                            isClosed ? 'bg-slate-800' : 'bg-emerald-600'
                          }`}
                        >
                          {isClosed ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">
                            Caixa do dia {new Date(sess.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </h4>
                          <span
                            className={`text-[10px] font-extrabold uppercase ${
                              isClosed ? 'text-slate-500' : 'text-emerald-600'
                            }`}
                          >
                            {isClosed ? 'Fechado' : 'Em Aberto'}
                          </span>
                        </div>
                      </div>

                      {/* Badge de Diferença */}
                      {isClosed && (
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl ${
                            Math.abs(diff) < 0.01
                              ? 'bg-emerald-100 text-emerald-800'
                              : diff > 0
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {Math.abs(diff) < 0.01
                            ? 'Saldo Exato'
                            : diff > 0
                            ? `Sobra: +R$ ${diff.toFixed(2)}`
                            : `Falta: -R$ ${Math.abs(diff).toFixed(2)}`}
                        </span>
                      )}
                    </div>

                    {/* Dados Financeiros da Sessão */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          Saldo de Abertura
                        </span>
                        <span className="font-mono font-black text-slate-800">
                          R$ {sess.initialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      {isClosed ? (
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">
                            Saldo Contado
                          </span>
                          <span className="font-mono font-black text-slate-800">
                            R$ {(sess.countedBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ) : (
                        <div className="bg-emerald-50 p-2.5 rounded-xl">
                          <span className="text-[10px] text-emerald-600 font-bold uppercase block">
                            Status
                          </span>
                          <span className="font-bold text-emerald-900">Em movimentação</span>
                        </div>
                      )}
                    </div>

                    {/* Dados de Responsabilidade e Datas */}
                    <div className="text-[11px] text-slate-500 space-y-1 border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between">
                        <span>Aberto por: <strong>{sess.openedBy}</strong></span>
                        <span>{new Date(sess.openedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {sess.closedAt && (
                        <div className="flex items-center justify-between">
                          <span>Fechado por: <strong>{sess.closedBy}</strong></span>
                          <span>{new Date(sess.closedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                      {sess.differenceNotes && (
                        <p className="text-[10px] italic text-slate-600 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
                          Justificativa: "{sess.differenceNotes}"
                        </p>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA 3: CATEGORIAS */}
      {activeTab === 'categorias' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Formulário de Nova Categoria */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-500" />
              <span>Nova Categoria</span>
            </h3>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Almoço, Frete, Manutenção..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tipo de Aplicação *
                </label>
                <select
                  value={newCatType}
                  onChange={(e) => setNewCatType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:outline-hidden"
                >
                  <option value="saida">Saída / Despesa</option>
                  <option value="entrada">Entrada / Recebimento</option>
                  <option value="ambos">Ambos (Entrada e Saída)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Categoria</span>
              </button>
            </form>
          </div>

          {/* Listagem de Categorias */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900">Categorias Cadastradas</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        cat.type === 'entrada'
                          ? 'bg-emerald-500'
                          : cat.type === 'saida'
                          ? 'bg-rose-500'
                          : 'bg-indigo-500'
                      }`}
                    />
                    <span className="font-extrabold text-slate-800">{cat.name}</span>
                    <span className="text-[10px] text-slate-400">
                      ({cat.type === 'entrada' ? 'Entrada' : cat.type === 'saida' ? 'Saída' : 'Ambos'})
                    </span>
                  </div>

                  {!cat.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Excluir Categoria"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* MODAL DETALHES & AUDITORIA DA TRANSAÇÃO */}
      {selectedTxDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Detalhes & Auditoria do Lançamento
              </h3>
              <button
                onClick={() => setSelectedTxDetails(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
                <span className="text-slate-500 font-bold">Valor:</span>
                <span
                  className={`text-lg font-black font-mono ${
                    selectedTxDetails.type === 'entrada' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {selectedTxDetails.type === 'entrada' ? '+' : '-'} R${' '}
                  {selectedTxDetails.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Categoria</span>
                  <span className="font-extrabold text-slate-800">{selectedTxDetails.categoryName}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Forma Pagto</span>
                  <span className="font-extrabold text-slate-800">{paymentMethodLabels[selectedTxDetails.paymentMethod] || selectedTxDetails.paymentMethod}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Descrição</span>
                <span className="text-slate-800">{selectedTxDetails.description}</span>
              </div>

              {selectedTxDetails.clientName && (
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Cliente</span>
                  <span className="font-bold text-slate-800">{selectedTxDetails.clientName}</span>
                </div>
              )}

              {selectedTxDetails.notes && (
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Observações</span>
                  <span className="text-slate-700 italic">{selectedTxDetails.notes}</span>
                </div>
              )}

              {/* Rastreabilidade de Auditoria */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5 text-[11px] text-amber-950">
                <span className="font-extrabold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  Rastreabilidade & Registro:
                </span>
                <p>Criado em: {new Date(selectedTxDetails.createdAt).toLocaleString('pt-BR')} por <strong>{selectedTxDetails.userName || 'Administrador'}</strong></p>
                
                {selectedTxDetails.editedAt && (
                  <p className="border-t border-amber-200/60 pt-1">
                    Editado em {new Date(selectedTxDetails.editedAt).toLocaleString('pt-BR')} por <strong>{selectedTxDetails.editedBy}</strong>. Motivo: "{selectedTxDetails.editReason}"
                  </p>
                )}

                {selectedTxDetails.status === 'cancelado' && (
                  <p className="text-rose-700 border-t border-rose-200/60 pt-1 font-bold">
                    Cancelado em {new Date(selectedTxDetails.cancelledAt || '').toLocaleString('pt-BR')} por <strong>{selectedTxDetails.cancelledBy}</strong>. Motivo: "{selectedTxDetails.cancellationReason}"
                  </p>
                )}
              </div>

            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTxDetails(null)}
                className="px-5 py-2 bg-slate-900 text-white font-black text-xs rounded-xl"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE LANÇAMENTO POR ÁUDIO */}
      <CashAudioModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        currentUser={currentUser}
        onSaveSuccess={() => {
          loadData();
        }}
        onOpenManualEdit={(prefilled) => {
          setEditingTransaction(null);
          setPrefilledTxData(prefilled);
          setTxModalType(prefilled.type || 'saida');
          setIsTxModalOpen(true);
        }}
      />

      {/* MODAL DE TRANSAÇÃO MANUAL / EDIÇÃO */}
      <CashTransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
          setPrefilledTxData(null);
        }}
        currentUser={currentUser}
        defaultType={txModalType}
        editingTransaction={editingTransaction}
        prefilledData={prefilledTxData}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* MODAL DE CONFIGURAÇÃO DO SALDO INICIAL */}
      <CashInitialBalanceModal
        isOpen={isInitialBalanceModalOpen}
        onClose={() => setIsInitialBalanceModalOpen(false)}
        currentUser={currentUser}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* MODAL DE SESSÃO (ABRIR / FECHAR CAIXA) */}
      <CashSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        mode={sessionModalMode}
        currentUser={currentUser}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* MODAL DE CANCELAMENTO */}
      <CashCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setCancellingTransaction(null);
        }}
        transaction={cancellingTransaction}
        currentUser={currentUser}
        onSuccess={() => {
          loadData();
        }}
      />

    </div>
  );
};
