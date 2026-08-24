import React, { useState, useEffect } from 'react';
import {
  Quote,
  Sale,
  Receivable,
  ManagerTask,
  WorkLogEntry,
} from '../types';
import {
  getQuotes,
  getSales,
  getReceivables,
  getManagerTasks,
  saveManagerTask,
  toggleManagerTask,
  deleteManagerTask,
  updateWorkDetails,
  addWorkLogEntry,
  payReceivableInstallment,
} from '../services/storage';
import {
  Wrench,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  DollarSign,
  Search,
  Plus,
  Trash2,
  Edit3,
  MessageCircle,
  FileText,
  ChevronRight,
  Package,
  ArrowRight,
  Check,
  History,
  User,
  Send,
  Shield,
  Tag,
} from 'lucide-react';

interface OperationsModuleProps {
  onOpenReceivablesTab?: () => void;
  onRefresh?: () => void;
}

export const OperationsModule: React.FC<OperationsModuleProps> = ({
  onOpenReceivablesTab,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'obras' | 'cobrancas' | 'tarefas'>('obras');

  // Data State
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [tasks, setTasks] = useState<ManagerTask[]>([]);

  // Obras Filter & Search
  const [obrasFilter, setObrasFilter] = useState<'todos' | 'atrasadas' | 'proximas' | 'em_producao' | 'pronto' | 'entregue'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal para Editar Status / Anotações da Obra
  const [editingObra, setEditingObra] = useState<{
    type: 'sale' | 'quote';
    id: string;
    code: string;
    clientName: string;
    deliveryDate: string;
    internalNotes: string;
    workStatus: 'pendente' | 'em_producao' | 'pronto' | 'entregue';
    logNote?: string;
  } | null>(null);

  // Modal de Histórico e Registro de Atendimento / Ticket
  const [viewingTicketHistory, setViewingTicketHistory] = useState<{
    type: 'sale' | 'quote' | 'task';
    id: string;
    code: string;
    clientName: string;
    workStatus?: string;
    deliveryDate?: string;
    workLogs: WorkLogEntry[];
  } | null>(null);

  // Anotação rápida dentro do Modal de Histórico
  const [quickNoteText, setQuickNoteText] = useState('');
  const [quickNoteAuthor, setQuickNoteAuthor] = useState('Gestor Smart Vidros');

  // Nova Tarefa State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskPriority, setNewTaskPriority] = useState<'alta' | 'media' | 'baixa'>('media');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    setQuotes(getQuotes());
    setSales(getSales());
    setReceivables(getReceivables());
    setTasks(getManagerTasks());
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Agrupar todas as obras/serviços (Vendas e Orçamentos com data de entrega ou em acompanhamento)
  const allObras = [
    ...sales.map((s) => ({
      type: 'sale' as const,
      id: s.id,
      code: s.code,
      clientName: s.clientName,
      clientPhone: s.clientPhone,
      total: s.total,
      deliveryDate: s.deliveryDate || '',
      internalNotes: s.internalNotes || '',
      workStatus: s.workStatus || 'pendente',
      itemsCount: s.items?.length || 0,
      items: s.items || [],
      date: s.date,
      workLogs: s.workLogs || [],
    })),
    ...quotes
      .filter((q) => q.status !== 'convertido' && q.status !== 'cancelado')
      .map((q) => ({
        type: 'quote' as const,
        id: q.id,
        code: q.code,
        clientName: q.clientName || 'Cliente',
        clientPhone: q.clientPhone || '',
        total: q.total,
        deliveryDate: q.deliveryDate || '',
        internalNotes: q.internalNotes || '',
        workStatus: q.workStatus || 'pendente',
        itemsCount: q.items?.length || 0,
        items: q.items || [],
        date: q.date,
        workLogs: q.workLogs || [],
      })),
  ];

  // Filtrar Obras
  const filteredObras = allObras.filter((o) => {
    // Busca por nome do cliente ou código
    const matchesSearch =
      o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.internalNotes.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (obrasFilter === 'todos') return true;
    if (obrasFilter === 'atrasadas') {
      return o.deliveryDate && o.deliveryDate < todayStr && o.workStatus !== 'entregue';
    }
    if (obrasFilter === 'proximas') {
      if (!o.deliveryDate || o.workStatus === 'entregue') return false;
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      return o.deliveryDate >= todayStr && o.deliveryDate <= nextWeekStr;
    }
    if (obrasFilter === 'em_producao') return o.workStatus === 'em_producao';
    if (obrasFilter === 'pronto') return o.workStatus === 'pronto';
    if (obrasFilter === 'entregue') return o.workStatus === 'entregue';

    return true;
  });

  // Estatísticas de Obras
  const atrasadasCount = allObras.filter((o) => o.deliveryDate && o.deliveryDate < todayStr && o.workStatus !== 'entregue').length;
  const emProducaoCount = allObras.filter((o) => o.workStatus === 'em_producao').length;
  const prontasCount = allObras.filter((o) => o.workStatus === 'pronto').length;

  // Filtrar Cobranças (Contas a Receber)
  const pendingInstallments: {
    receivableId: string;
    installmentId: string;
    clientName: string;
    saleCode: string;
    number: number;
    amount: number;
    paidAmount: number;
    dueDate: string;
    status: 'pendente' | 'parcial' | 'vencida';
  }[] = [];

  receivables.forEach((r) => {
    if (r.status !== 'pago') {
      r.installments.forEach((inst) => {
        if (inst.status !== 'pago') {
          const isOverdue = inst.dueDate < todayStr;
          pendingInstallments.push({
            receivableId: r.id,
            installmentId: inst.id,
            clientName: r.clientName,
            saleCode: r.saleCode,
            number: inst.number,
            amount: inst.amount,
            paidAmount: inst.paidAmount || 0,
            dueDate: inst.dueDate,
            status: isOverdue ? 'vencida' : inst.status === 'parcial' ? 'parcial' : 'pendente',
          });
        }
      });
    }
  });

  // Ordenar parcelas por data de vencimento
  pendingInstallments.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const cobrancasAtrasadas = pendingInstallments.filter((i) => i.dueDate < todayStr);
  const cobrancasHoje = pendingInstallments.filter((i) => i.dueDate === todayStr);
  const cobrancasProximas = pendingInstallments.filter((i) => i.dueDate > todayStr);

  // Manipular Tarefas
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    saveManagerTask({
      title: newTaskTitle.trim(),
      dueDate: newTaskDueDate || undefined,
      priority: newTaskPriority,
      completed: false,
    });
    setNewTaskTitle('');
    setTasks(getManagerTasks());
    onRefresh?.();
  };

  const handleToggleTask = (id: string) => {
    const updated = toggleManagerTask(id);
    setTasks(updated);
    onRefresh?.();
  };

  const handleDeleteTask = (id: string) => {
    const updated = deleteManagerTask(id);
    setTasks(updated);
    onRefresh?.();
  };

  const handleSaveObraEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingObra) return;

    updateWorkDetails(editingObra.type, editingObra.id, {
      deliveryDate: editingObra.deliveryDate || undefined,
      internalNotes: editingObra.internalNotes,
      workStatus: editingObra.workStatus,
      logNote: editingObra.logNote?.trim() || undefined,
    });

    setEditingObra(null);
    loadAllData();
    onRefresh?.();
  };

  const handleSaveQuickTicketNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingTicketHistory || !quickNoteText.trim()) return;

    if (viewingTicketHistory.type === 'task') {
      const allTasks = getManagerTasks();
      const t = allTasks.find((x) => x.id === viewingTicketHistory.id);
      if (t) {
        const logs = t.taskLogs ? [...t.taskLogs] : [];
        logs.unshift({
          id: 'log-' + Date.now(),
          date: new Date().toISOString(),
          authorName: quickNoteAuthor || 'Gestor Smart Vidros',
          action: 'Anotação / Registro na Tarefa',
          notes: quickNoteText.trim(),
        });
        saveManagerTask({ ...t, taskLogs: logs });
        setViewingTicketHistory({ ...viewingTicketHistory, workLogs: logs });
      }
    } else {
      addWorkLogEntry(
        viewingTicketHistory.type,
        viewingTicketHistory.id,
        {
          notes: quickNoteText.trim(),
          action: 'Atendimento / Contato com Cliente',
          authorName: quickNoteAuthor || 'Gestor Smart Vidros',
        }
      );
      loadAllData();
      const updatedSales = getSales();
      const updatedQuotes = getQuotes();
      const item =
        viewingTicketHistory.type === 'sale'
          ? updatedSales.find((s) => s.id === viewingTicketHistory.id)
          : updatedQuotes.find((q) => q.id === viewingTicketHistory.id);
      if (item) {
        setViewingTicketHistory({
          ...viewingTicketHistory,
          workLogs: item.workLogs || [],
        });
      }
    }

    setQuickNoteText('');
    loadAllData();
    onRefresh?.();
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Não definida';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const getStatusBadge = (status: 'pendente' | 'em_producao' | 'pronto' | 'entregue') => {
    switch (status) {
      case 'pendente':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full">Pendente</span>;
      case 'em_producao':
        return <span className="bg-blue-100 text-blue-900 border border-blue-300 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Em Produção</span>;
      case 'pronto':
        return <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Pronto / Ag. Instal.</span>;
      case 'entregue':
        return <span className="bg-slate-200 text-slate-800 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full">Concluído / Entregue</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho da Seção Operacional */}
      <div className="bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-900 rounded-3xl p-6 text-white border-2 border-amber-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Módulo de Acompanhamento Operacional
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Wrench className="w-7 h-7 text-amber-400" />
            <span>Gestão de Obras, Entregas & Tarefas</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Acompanhe a fabricação, prazos de entrega nas obras e tarefas diárias do gestor da vidraçaria.
          </p>
        </div>

        {/* Resumo Rápido em Cards no Topo */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-800/80 border border-amber-500/30 px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Em Atraso</span>
              <span className="text-lg font-black text-amber-400">{atrasadasCount} obras</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-blue-500/30 px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Em Produção</span>
              <span className="text-lg font-black text-blue-400">{emProducaoCount} obras</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-emerald-500/30 px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Prontas</span>
              <span className="text-lg font-black text-emerald-400">{prontasCount} obras</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação de Abas Internas */}
      <div className="flex border-b border-slate-200 gap-2 bg-slate-100 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('obras')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'obras'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Acompanhamento de Obras ({allObras.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cobrancas')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'cobrancas'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Alertas de Cobranças ({pendingInstallments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tarefas')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'tarefas'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Minhas Tarefas do Gestor ({tasks.filter((t) => !t.completed).length})</span>
        </button>
      </div>

      {/* CONTEÚDO 1: ACOMPANHAMENTO DE OBRAS & ENTREGAS */}
      {activeTab === 'obras' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Barra de Filtros e Busca */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por cliente, código ou anotação..."
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Botoes de Filtro de Status */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              <button
                onClick={() => setObrasFilter('todos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  obrasFilter === 'todos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setObrasFilter('atrasadas')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  obrasFilter === 'atrasadas' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                }`}
              >
                ⚠️ Em Atraso
              </button>
              <button
                onClick={() => setObrasFilter('proximas')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  obrasFilter === 'proximas' ? 'bg-amber-500 text-slate-950' : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                📅 Próximas (7 Dias)
              </button>
              <button
                onClick={() => setObrasFilter('em_producao')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  obrasFilter === 'em_producao' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                🔨 Em Produção
              </button>
              <button
                onClick={() => setObrasFilter('pronto')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  obrasFilter === 'pronto' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                ✅ Pronto
              </button>
            </div>
          </div>

          {/* Lista de Cards de Obras */}
          {filteredObras.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">Nenhuma obra ou serviço encontrado</h3>
              <p className="text-xs text-slate-500 mt-1">
                Ajuste os filtros de busca ou crie novos orçamentos/vendas informando a data prevista de entrega.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredObras.map((obra) => {
                const isOverdue = obra.deliveryDate && obra.deliveryDate < todayStr && obra.workStatus !== 'entregue';
                const hasWhatsApp = obra.clientPhone && obra.clientPhone.replace(/\D/g, '').length >= 10;
                const cleanPhone = obra.clientPhone.replace(/\D/g, '');

                return (
                  <div
                    key={`${obra.type}-${obra.id}`}
                    className={`bg-white rounded-2xl p-5 border-2 shadow-xs transition-all hover:shadow-md flex flex-col justify-between space-y-4 ${
                      isOverdue ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Topo do Card: Tipo & Status */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                              obra.type === 'sale'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-slate-100 text-slate-800 border border-slate-300'
                            }`}
                          >
                            {obra.type === 'sale' ? 'Venda' : 'Orçamento'}
                          </span>
                          <span className="font-mono font-bold text-slate-900 text-xs">{obra.code}</span>
                        </div>
                        {getStatusBadge(obra.workStatus)}
                      </div>

                      {/* Cliente e Contato */}
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                          {obra.clientName}
                        </h3>
                        {obra.clientPhone && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500 font-medium">{obra.clientPhone}</span>
                            {hasWhatsApp && (
                              <a
                                href={`https://wa.me/55${cleanPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md hover:bg-emerald-100 border border-emerald-200"
                              >
                                <MessageCircle className="w-3 h-3 text-emerald-600" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Data Prevista de Entrega */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Data Prevista de Entrega:</span>
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] font-extrabold text-red-600 bg-red-100 px-1.5 py-0.2 rounded uppercase">
                              ATRASADO
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm font-black font-mono ${
                            isOverdue ? 'text-red-600' : obra.deliveryDate ? 'text-slate-900' : 'text-slate-400 italic'
                          }`}
                        >
                          {formatDate(obra.deliveryDate)}
                        </p>
                      </div>

                      {/* Anotações da Obra / Serviço */}
                      {obra.internalNotes ? (
                        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-1">
                          <span className="font-extrabold text-amber-900 text-[10px] uppercase block">
                            Anotações da Obra (Uso Interno):
                          </span>
                          <p className="text-amber-950 font-medium leading-relaxed whitespace-pre-line">
                            {obra.internalNotes}
                          </p>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic px-1">
                          Nenhuma anotação interna registrada.
                        </div>
                      )}
                    </div>

                    {/* Rodapé do Card: Ações */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-800 font-mono">
                        {formatCurrency(obra.total)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setViewingTicketHistory({
                              type: obra.type,
                              id: obra.id,
                              code: obra.code,
                              clientName: obra.clientName,
                              workStatus: obra.workStatus,
                              deliveryDate: obra.deliveryDate,
                              workLogs: obra.workLogs || [],
                            })
                          }
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                          title="Ver Histórico de Alterações e Atendimentos do Ticket"
                        >
                          <History className="w-3.5 h-3.5 text-slate-600" />
                          <span>Histórico ({obra.workLogs?.length || 0})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setEditingObra({
                              type: obra.type,
                              id: obra.id,
                              code: obra.code,
                              clientName: obra.clientName,
                              deliveryDate: obra.deliveryDate,
                              internalNotes: obra.internalNotes,
                              workStatus: obra.workStatus,
                              logNote: '',
                            })
                          }
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Status</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO 2: ALERTAS DE COBRANÇAS (CONTAS A RECEBER) */}
      {activeTab === 'cobrancas' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <h3 className="font-bold text-amber-950 text-sm">Resumo Diário de Cobranças da Vidraçaria</h3>
                <p className="text-xs text-amber-800">
                  Acompanhe parcelas vencidas e a vencer para manter o caixa da empresa equilibrado.
                </p>
              </div>
            </div>

            {onOpenReceivablesTab && (
              <button
                onClick={onOpenReceivablesTab}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>Ir para Contas a Receber</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 1. Parcelas Vencidas */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-red-600 text-sm uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Cobranças Em Atraso ({cobrancasAtrasadas.length})</span>
              </h3>
            </div>

            {cobrancasAtrasadas.length === 0 ? (
              <p className="text-xs text-emerald-600 font-bold p-3 bg-emerald-50 rounded-xl">
                ✓ Nenhuma cobrança em atraso no momento.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {cobrancasAtrasadas.map((item) => (
                  <div key={`${item.receivableId}-${item.installmentId}`} className="py-3 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block">{item.clientName}</span>
                      <span className="text-xs text-slate-500 font-mono">
                        Venda {item.saleCode} • Parcela {item.number} • Venceu em {formatDate(item.dueDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-red-600 font-mono block">
                          {formatCurrency(item.amount - item.paidAmount)}
                        </span>
                        <span className="text-[10px] text-slate-400">Pendente</span>
                      </div>

                      {onOpenReceivablesTab && (
                        <button
                          onClick={onOpenReceivablesTab}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl"
                        >
                          Dar Baixa
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Parcelas Vencendo Hoje */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-amber-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Vencendo Hoje ({cobrancasHoje.length})</span>
              </h3>
            </div>

            {cobrancasHoje.length === 0 ? (
              <p className="text-xs text-slate-500 p-3 bg-slate-50 rounded-xl">
                Nenhuma parcela vencendo na data de hoje.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {cobrancasHoje.map((item) => (
                  <div key={`${item.receivableId}-${item.installmentId}`} className="py-3 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block">{item.clientName}</span>
                      <span className="text-xs text-slate-500 font-mono">
                        Venda {item.saleCode} • Parcela {item.number}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-amber-700 font-mono block">
                          {formatCurrency(item.amount - item.paidAmount)}
                        </span>
                        <span className="text-[10px] text-slate-400">Vence Hoje</span>
                      </div>

                      {onOpenReceivablesTab && (
                        <button
                          onClick={onOpenReceivablesTab}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl"
                        >
                          Receber
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Próximas Cobranças */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Próximos Vencimentos ({cobrancasProximas.length})</span>
              </h3>
            </div>

            {cobrancasProximas.length === 0 ? (
              <p className="text-xs text-slate-500 p-3 bg-slate-50 rounded-xl">
                Nenhuma próxima parcela agendada no contas a receber.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {cobrancasProximas.slice(0, 10).map((item) => (
                  <div key={`${item.receivableId}-${item.installmentId}`} className="py-3 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block">{item.clientName}</span>
                      <span className="text-xs text-slate-500 font-mono">
                        Venda {item.saleCode} • Parcela {item.number} • Vence em {formatDate(item.dueDate)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-900 font-mono block">
                        {formatCurrency(item.amount - item.paidAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTEÚDO 3: TAREFAS PESSOAIS DO GESTOR */}
      {activeTab === 'tarefas' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Formulário para Adicionar Tarefa */}
          <form onSubmit={handleAddTask} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
              + Nova Tarefa do Gestor
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-6">
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ex: Encomendar kit de alumínio preto para a obra do João..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="md:col-span-3">
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="alta">Prioridade Alta</option>
                  <option value="media">Prioridade Média</option>
                  <option value="baixa">Prioridade Baixa</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <button
                  type="submit"
                  className="w-full h-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl py-2.5 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Lista de Tarefas */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
              Minhas Anotações & Lembretes
            </h3>

            {tasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Nenhuma tarefa pendente. Adicione lembretes acima!
              </p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      task.completed ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-600 text-white'
                            : 'bg-white border-slate-300 hover:border-amber-500'
                        }`}
                      >
                        {task.completed && <Check className="w-4 h-4" />}
                      </button>

                      <div>
                        <span
                          className={`text-xs font-extrabold block ${
                            task.completed ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </span>

                        {task.dueDate && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            Data limite: {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setViewingTicketHistory({
                            type: 'task',
                            id: task.id,
                            code: `TAREFA-${task.id.slice(-4)}`,
                            clientName: task.title,
                            workLogs: task.taskLogs || [],
                          })
                        }
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                        title="Ver Histórico de Alterações da Tarefa"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          task.priority === 'alta'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'media'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {task.priority}
                      </span>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL EDITAR DETALHES / STATUS DA OBRA */}
      {editingObra && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-lg w-full border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase block">Acompanhamento Operacional</span>
                <h3 className="font-black text-slate-900 text-lg">
                  Obra: {editingObra.clientName} ({editingObra.code})
                </h3>
              </div>
              <button
                onClick={() => setEditingObra(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveObraEdits} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Status Atual da Obra / Execução
                </label>
                <select
                  value={editingObra.workStatus}
                  onChange={(e) => setEditingObra({ ...editingObra, workStatus: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="pendente">🟡 Pendente (Aguardando Medição / Início)</option>
                  <option value="em_producao">🔨 Em Produção / Corte do Vidro</option>
                  <option value="pronto">🟢 Pronto / Aguardando Instalação</option>
                  <option value="entregue">✅ Concluído / Entregue no Cliente</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Data Prevista para Entrega / Execução
                </label>
                <input
                  type="date"
                  value={editingObra.deliveryDate}
                  onChange={(e) => setEditingObra({ ...editingObra, deliveryDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Anotações Internas da Obra (Instalação, Perfis, Equipe)
                </label>
                <textarea
                  rows={3}
                  value={editingObra.internalNotes}
                  onChange={(e) => setEditingObra({ ...editingObra, internalNotes: e.target.value })}
                  placeholder="Ex: Medidas ajustadas no local, cor do alumínio branco, faltou silicone para acabamento..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Novo Campo: Registro para o Histórico do Ticket */}
              <div className="p-3 bg-amber-50/70 border border-amber-300/80 rounded-2xl space-y-1.5">
                <label className="block text-xs font-extrabold text-amber-950 uppercase flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-amber-600" />
                  <span>Motivo da Alteração / Registro no Histórico do Ticket</span>
                </label>
                <input
                  type="text"
                  value={editingObra.logNote || ''}
                  onChange={(e) => setEditingObra({ ...editingObra, logNote: e.target.value })}
                  placeholder="Ex: Cliente ligou pedindo para adiar para sexta-feira às 14h..."
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[10px] text-amber-800 font-medium">
                  💡 Fica registrado no histórico da obra com data e hora para caso o cliente ligue perguntando sobre o status do pedido.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingObra(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl cursor-pointer shadow-sm"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE HISTÓRICO & AUDITORIA DE TICKETS / ATENDIMENTO */}
      {viewingTicketHistory && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 overflow-hidden">
            {/* Topo do Modal */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      Histórico do Ticket
                    </span>
                    <span className="font-mono font-bold text-amber-300 text-xs">
                      {viewingTicketHistory.code}
                    </span>
                  </div>
                  <h3 className="font-black text-white text-base sm:text-lg leading-tight mt-0.5">
                    {viewingTicketHistory.clientName}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  setViewingTicketHistory(null);
                  setQuickNoteText('');
                }}
                className="text-slate-400 hover:text-white text-2xl font-bold p-1 leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Linha do Tempo de Alterações (Timeline) */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
              {viewingTicketHistory.workLogs.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                  <History className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="font-extrabold text-slate-800 text-sm">Nenhuma alteração registrada ainda</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Todas as mudanças de status, alterações de datas e notas de atendimento registradas nesta obra aparecerão listadas aqui com data e hora.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-amber-300 space-y-4">
                  {viewingTicketHistory.workLogs.map((log, idx) => {
                    const logDate = new Date(log.date);
                    const formattedDate = !isNaN(logDate.getTime())
                      ? `${logDate.toLocaleDateString('pt-BR')} às ${logDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                      : log.date;

                    return (
                      <div key={log.id || idx} className="relative group">
                        {/* Marcador na linha do tempo */}
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-xs"></div>

                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-black text-slate-900">
                                {log.action || 'Atualização'}
                              </span>
                              {log.authorName && (
                                <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-400" />
                                  <span>{log.authorName}</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono font-medium">
                              {formattedDate}
                            </span>
                          </div>

                          {/* Diffs de Status / Prazo */}
                          {(log.previousStatus || log.newStatus || log.previousDeliveryDate || log.newDeliveryDate) && (
                            <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                              {log.previousStatus && log.newStatus && log.previousStatus !== log.newStatus && (
                                <div className="bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg">
                                  <span>Status: </span>
                                  <span className="line-through text-slate-500 mr-1">{log.previousStatus}</span>
                                  <span>➔ </span>
                                  <span className="text-amber-950 font-black">{log.newStatus}</span>
                                </div>
                              )}
                              {log.previousDeliveryDate && log.newDeliveryDate && log.previousDeliveryDate !== log.newDeliveryDate && (
                                <div className="bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-lg">
                                  <span>Prazo: </span>
                                  <span className="line-through text-slate-500 mr-1">{formatDate(log.previousDeliveryDate)}</span>
                                  <span>➔ </span>
                                  <span className="text-blue-950 font-black">{formatDate(log.newDeliveryDate)}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Notas / Mensagens da Alteração */}
                          {log.notes && (
                            <p className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100 whitespace-pre-line leading-relaxed">
                              {log.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Formulário Inferior para Registrar Nova Nota / Atendimento */}
            <form onSubmit={handleSaveQuickTicketNote} className="p-4 bg-white border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-amber-500" />
                  <span>Registrar Atendimento / Nova Anotação no Ticket</span>
                </label>
                <span className="text-[10px] text-slate-500">Gravado com data e hora atual</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={quickNoteText}
                  onChange={(e) => setQuickNoteText(e.target.value)}
                  placeholder="Ex: Cliente ligou perguntando do prazo. Informado que a equipe vai amanhã às 14h..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                <button
                  type="submit"
                  disabled={!quickNoteText.trim()}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
