import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  FileText,
  ShoppingBag,
  ReceiptText,
  CreditCard,
  Plus,
  X
} from 'lucide-react';
import { Receivable, Installment, PaymentMethod, CompanyInfo, AppUser } from '../types';
import { payReceivableInstallment, updateInstallmentDueDate } from '../services/storage';
import { getUserPermissions } from '../utils/permissions';

interface ReceivablesListProps {
  receivables: Receivable[];
  companyInfo: CompanyInfo;
  currentUser?: AppUser | null;
  onRefresh: () => void;
  onDeleteReceivable: (id: string) => void;
  onOpenSale?: (saleId: string) => void;
  onOpenQuote?: (quoteId: string) => void;
  onOpenReceipt?: (receiptId: string) => void;
  onShowToast?: (msg: string) => void;
}

interface SplitPaymentRow {
  id: string;
  method: PaymentMethod;
  amount: number;
  notes?: string;
}

export const ReceivablesList: React.FC<ReceivablesListProps> = ({
  receivables,
  companyInfo,
  currentUser,
  onRefresh,
  onDeleteReceivable,
  onOpenSale,
  onOpenQuote,
  onOpenReceipt,
  onShowToast,
}) => {
  const perms = getUserPermissions(currentUser);
  const canSettle = perms.canSettleReceivables !== false;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendente' | 'parcial' | 'pago'>('todos');

  // Modal de Baixa de Parcela
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [generateReceiptOption, setGenerateReceiptOption] = useState<boolean>(true);
  
  const [splitPayments, setSplitPayments] = useState<SplitPaymentRow[]>([
    { id: '1', method: 'pix', amount: 0, notes: '' }
  ]);

  // Edição Manual de Data de Vencimento de Parcela
  const [editingDueDateInstId, setEditingDueDateInstId] = useState<string | null>(null);
  const [tempDueDate, setTempDueDate] = useState<string>('');

  const handleStartEditDueDate = (instId: string, currentDueDate: string) => {
    setEditingDueDateInstId(instId);
    setTempDueDate(currentDueDate);
  };

  const handleSaveDueDate = (recId: string, instId: string) => {
    if (!tempDueDate) return;
    const updated = updateInstallmentDueDate(recId, instId, tempDueDate);
    if (updated) {
      onRefresh();
      setEditingDueDateInstId(null);
      if (onShowToast) {
        onShowToast(`Data de vencimento atualizada para ${new Date(tempDueDate + 'T00:00:00').toLocaleDateString('pt-BR')}`);
      }
    }
  };

  const filtered = receivables.filter((r) => {
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (r.code || '').toLowerCase().includes(term) ||
      (r.clientName || '').toLowerCase().includes(term) ||
      (r.saleCode || '').toLowerCase().includes(term) ||
      (r.quoteCode || '').toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'todos' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalFiadoGeral = receivables.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalRecebidoGeral = receivables.reduce((sum, r) => sum + r.paidAmount, 0);
  const totalPendenteGeral = receivables.reduce((sum, r) => sum + r.remainingAmount, 0);

  // Abrir Modal de Baixa
  const handleOpenPayModal = (rec: Receivable, inst: Installment) => {
    setSelectedReceivable(rec);
    setSelectedInstallment(inst);
    setGenerateReceiptOption(true);
    const remainingInInst = inst.amount - (inst.paidAmount || 0);
    setSplitPayments([
      {
        id: 'pay-1',
        method: 'pix',
        amount: Math.max(0, Math.round(remainingInInst * 100) / 100),
        notes: '',
      },
    ]);
  };

  const handleAddSplitRow = () => {
    if (!selectedInstallment) return;
    const remainingInInst = selectedInstallment.amount - (selectedInstallment.paidAmount || 0);
    const currentTotal = splitPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const remainingToAutoFill = Math.max(0, Math.round((remainingInInst - currentTotal) * 100) / 100);

    setSplitPayments((prev) => [
      ...prev,
      {
        id: 'pay-' + Date.now(),
        method: 'dinheiro',
        amount: remainingToAutoFill,
        notes: '',
      },
    ]);
  };

  const handleRemoveSplitRow = (id: string) => {
    if (splitPayments.length <= 1) return;
    setSplitPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateSplitRow = (id: string, field: keyof SplitPaymentRow, value: any) => {
    setSplitPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleAutoFillRow = (id: string) => {
    if (!selectedInstallment) return;
    const remainingInInst = selectedInstallment.amount - (selectedInstallment.paidAmount || 0);
    const otherRowsTotal = splitPayments
      .filter((p) => p.id !== id)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const remainingToAutoFill = Math.max(0, Math.round((remainingInInst - otherRowsTotal) * 100) / 100);

    handleUpdateSplitRow(id, 'amount', remainingToAutoFill);
  };

  const totalBaixaValue = splitPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const currentInstRemaining = selectedInstallment
    ? Math.max(0, selectedInstallment.amount - (selectedInstallment.paidAmount || 0))
    : 0;
  const balanceAfterBaixa = Math.max(0, currentInstRemaining - totalBaixaValue);

  // Confirmar Baixa / Recebimento da Parcela
  const handleConfirmPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceivable || !selectedInstallment) return;

    if (totalBaixaValue <= 0) {
      alert('Informe um valor de recebimento maior que zero.');
      return;
    }

    const result = payReceivableInstallment(
      selectedReceivable.id,
      selectedInstallment.id,
      splitPayments
    );

    if (result) {
      onRefresh();
      const createdReceipt = result.receipt;
      setSelectedReceivable(null);
      setSelectedInstallment(null);

      if (onShowToast) {
        onShowToast(
          `Baixa de R$ ${totalBaixaValue.toFixed(2)} confirmada! ${
            createdReceipt ? `Recibo ${createdReceipt.code} gerado.` : ''
          }`
        );
      }

      if (generateReceiptOption && createdReceipt && onOpenReceipt) {
        onOpenReceipt(createdReceipt.id);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Contas a Receber (Fiado & Parcelas)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão financeira de vendas fiadas, acompanhamento de parcelas, datas de vencimento e baixa de pagamentos
          </p>
        </div>
      </div>

      {/* Cards Financeiros de Contas a Receber */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950 text-white p-4 rounded-xl border border-slate-800 shadow-md">
          <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider block">
            Total Fiado Concedido
          </span>
          <span className="text-2xl font-black text-white mt-1 block">
            {totalFiadoGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">{receivables.length} conta(s) registrada(s)</span>
        </div>

        <div className="bg-emerald-950/80 text-white p-4 rounded-xl border border-emerald-800 shadow-md">
          <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider block">
            Total Já Recebido / Baixado
          </span>
          <span className="text-2xl font-black text-emerald-300 mt-1 block">
            {totalRecebidoGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <span className="text-[10px] text-emerald-200/70 font-semibold">Baixas efetuadas</span>
        </div>

        <div className="bg-amber-950/80 text-white p-4 rounded-xl border border-amber-800 shadow-md">
          <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider block">
            Saldo Pendente A Receber
          </span>
          <span className="text-2xl font-black text-amber-300 mt-1 block">
            {totalPendenteGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <span className="text-[10px] text-amber-200/70 font-semibold">Aguardando recebimento</span>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, código ou venda..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-sm w-full sm:w-auto">
          {(['todos', 'pendente', 'parcial', 'pago'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Lançamentos de Contas a Receber */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-3">
            <ShieldCheck className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-sm font-semibold">Nenhuma conta a receber registrada.</p>
            <p className="text-xs text-slate-500">
              Quando uma venda for efetuada com pagamento Fiado, o lançamento aparecerá automaticamente nesta lista.
            </p>
          </div>
        ) : (
          filtered.map((rec) => (
            <div
              key={rec.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
            >
              
              {/* Topo do Card de Conta a Receber */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-sm">{rec.code}</span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        rec.status === 'pago'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : rec.status === 'parcial'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {rec.status === 'pago' ? 'Liquidado' : rec.status === 'parcial' ? 'Parcialmente Pago' : 'Pendente'}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 mt-0.5">{rec.clientName}</h3>
                  <p className="text-xs text-slate-500">
                    Venda: <strong className="text-slate-800">{rec.saleCode}</strong>
                    {rec.quoteCode && ` • Orçamento: ${rec.quoteCode}`}
                    {rec.clientPhone && ` • Whats: ${rec.clientPhone}`}
                  </p>
                </div>

                {/* Resumo de Valores e Ações de Vínculo */}
                <div className="flex flex-col sm:items-end gap-1">
                  <div className="text-xs font-bold text-slate-700">
                    Total Fiado: <span className="font-black text-slate-900 text-sm">R$ {rec.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-600">
                    Já Pago: <span>R$ {rec.paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-xs font-black text-amber-600">
                    Restante: <span>R$ {rec.remainingAmount.toFixed(2)}</span>
                  </div>

                  {/* Vínculos com Venda e Orçamento (#11) */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {onOpenSale && (
                      <button
                        onClick={() => onOpenSale(rec.saleId)}
                        className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-2 py-0.5 rounded transition-colors"
                      >
                        Ver Venda
                      </button>
                    )}

                    {rec.quoteId && onOpenQuote && (
                      <button
                        onClick={() => onOpenQuote(rec.quoteId!)}
                        className="text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded transition-colors"
                      >
                        Ver Orçamento
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`Deseja excluir o registro da conta a receber ${rec.code}?`)) {
                          onDeleteReceivable(rec.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                      title="Excluir Conta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabela de Parcelas do Fiado e Ação "Dar Baixa" */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-slate-800 tracking-wider block">
                  Parcelas do Parcelamento ({rec.installments.length}x)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {rec.installments.map((inst) => {
                    const isPaid = inst.status === 'pago';
                    const remainingInInst = inst.amount - (inst.paidAmount || 0);

                    return (
                      <div
                        key={inst.id}
                        className={`border rounded-xl p-3 text-xs space-y-2 transition-all ${
                          isPaid
                            ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                            : 'bg-white border-slate-200 shadow-sm hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900">
                            Parcela {inst.number}/{rec.installments.length}
                          </span>

                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                              isPaid
                                ? 'bg-emerald-600 text-white'
                                : inst.status === 'parcial'
                                ? 'bg-amber-500 text-slate-950 font-black'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {inst.status === 'pago'
                              ? 'Paga'
                              : inst.status === 'parcial'
                              ? 'Parcial'
                              : 'Pendente'}
                          </span>
                        </div>

                        <div className="space-y-0.5 font-medium">
                          <div className="flex justify-between text-slate-600">
                            <span>Valor:</span>
                            <strong className="text-slate-900 font-bold">R$ {inst.amount.toFixed(2)}</strong>
                          </div>

                          {editingDueDateInstId === inst.id ? (
                            <div className="flex flex-col gap-1 pt-1 mt-1 border-t border-slate-200">
                              <label className="text-[10px] font-bold text-amber-800 uppercase">Alterar Vencimento:</label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="date"
                                  value={tempDueDate}
                                  onChange={(e) => setTempDueDate(e.target.value)}
                                  className="bg-amber-50 border border-amber-400 rounded px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none flex-1"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveDueDate(rec.id, inst.id)}
                                  className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] rounded transition-colors"
                                >
                                  Salvar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingDueDateInstId(null)}
                                  className="p-1 text-slate-400 hover:text-slate-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center text-slate-500 text-[11px]">
                              <span>Vencimento:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-800 font-mono">
                                  {new Date(inst.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                                </span>
                                {!isPaid && (
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditDueDate(inst.id, inst.dueDate)}
                                    className="p-1 text-slate-400 hover:text-amber-700 hover:bg-amber-100 rounded transition-colors"
                                    title="Alterar data de vencimento manualmente"
                                  >
                                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {inst.paidAmount > 0 && (
                            <div className="flex justify-between text-emerald-700 text-[11px] font-bold pt-1 border-t border-slate-100">
                              <span>Pago:</span>
                              <span>R$ {inst.paidAmount.toFixed(2)}</span>
                            </div>
                          )}
                        </div>

                        {/* Botão Dar Baixa */}
                        {!isPaid ? (
                          canSettle ? (
                            <button
                              onClick={() => handleOpenPayModal(rec, inst)}
                              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-1.5 rounded-lg shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1 mt-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Dar Baixa (R$ {remainingInInst.toFixed(2)})</span>
                            </button>
                          ) : (
                            <div
                              title="Seu perfil não possui permissão para dar baixa em contas"
                              className="w-full bg-slate-100 text-slate-400 font-bold text-[11px] py-1.5 rounded-lg flex items-center justify-center gap-1 mt-1 cursor-not-allowed border border-slate-200"
                            >
                              <span>🔒 Baixa Restrita</span>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 py-1 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Quitada em {inst.paidAt ? new Date(inst.paidAt + 'T00:00:00').toLocaleDateString('pt-BR') : 'hoje'}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE DAR BAIXA EM PARCELA */}
      {selectedReceivable && selectedInstallment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-2 border-amber-500 space-y-5 animate-in fade-in zoom-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Dar Baixa — Parcela {selectedInstallment.number}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Venda Nº <strong className="text-slate-800">{selectedReceivable.saleCode}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedReceivable(null);
                  setSelectedInstallment(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* RESUMO FINANCEIRO DA PARCELA */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Cliente:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedReceivable.clientName}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Valor Parcela</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    R$ {selectedInstallment.amount.toFixed(2)}
                  </span>
                </div>

                <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <span className="text-[10px] uppercase text-emerald-700 font-bold block">Já Pago</span>
                  <span className="font-mono font-bold text-emerald-900 text-xs">
                    R$ {(selectedInstallment.paidAmount || 0).toFixed(2)}
                  </span>
                </div>

                <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <span className="text-[10px] uppercase text-amber-800 font-bold block">Saldo Pendente</span>
                  <span className="font-mono font-black text-amber-900 text-xs">
                    R$ {currentInstRemaining.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmPay} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Formas de Recebimento nesta Baixa:
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSplitRow}
                    className="text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Dividir Pagamento</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {splitPayments.map((row, idx) => (
                    <div key={row.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>Forma #{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAutoFillRow(row.id)}
                            className="text-[10px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-300 transition-colors"
                            title="Preencher automaticamente com o saldo restante"
                          >
                            ⚡ Completar Restante
                          </button>
                          {splitPayments.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSplitRow(row.id)}
                              className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 ml-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                            Forma de Pagamento
                          </label>
                          <select
                            value={row.method}
                            onChange={(e) =>
                              handleUpdateSplitRow(row.id, 'method', e.target.value as PaymentMethod)
                            }
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          >
                            <option value="pix">PIX</option>
                            <option value="dinheiro">Dinheiro</option>
                            <option value="cartao_credito">Cartão de Crédito</option>
                            <option value="cartao_debito">Cartão de Débito</option>
                            <option value="transferencia">Transferência</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                            Valor (R$)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={row.amount || ''}
                            onChange={(e) =>
                              handleUpdateSplitRow(
                                row.id,
                                'amount',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="0,00"
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={row.notes || ''}
                          onChange={(e) => handleUpdateSplitRow(row.id, 'notes', e.target.value)}
                          placeholder="Observação (opcional, ex: N° PIX, comprovante...)"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-700 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* RESUMO DA BAIXA E SALDO RESTANTE */}
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1 text-xs font-bold text-amber-950">
                  <div className="flex items-center justify-between">
                    <span>Total sendo pago nesta baixa:</span>
                    <span className="font-mono text-base font-black text-amber-700">
                      R$ {totalBaixaValue.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-amber-200 text-[11px]">
                    <span className="text-slate-600">Saldo Restante na Parcela após a Baixa:</span>
                    <span className={`font-mono font-bold ${balanceAfterBaixa > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                      {balanceAfterBaixa > 0 ? `R$ ${balanceAfterBaixa.toFixed(2)}` : 'QUITADA TOTALMENTE!'}
                    </span>
                  </div>
                </div>
              </div>

              {/* OPÇÃO DE GERAR/ABRIR RECIBO DA BAIXA */}
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="generateReceiptCheckbox"
                  checked={generateReceiptOption}
                  onChange={(e) => setGenerateReceiptOption(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="generateReceiptCheckbox" className="text-xs text-slate-800 font-bold cursor-pointer select-none">
                  Gerar e abrir o Recibo de Pagamento desta baixa
                </label>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReceivable(null);
                    setSelectedInstallment(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Baixa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
