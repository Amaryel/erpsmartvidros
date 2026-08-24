import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Calendar,
  FileText,
  History,
  CheckCircle2,
  X,
  AlertCircle,
  ShieldCheck,
  Clock,
  User
} from 'lucide-react';
import { CashInitialBalance, AppUser } from '../types';
import {
  getCashInitialBalance,
  setCashInitialBalance,
} from '../services/data/repositories/cashRepository';

interface CashInitialBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (balance: CashInitialBalance) => void;
  currentUser?: AppUser | null;
}

export const CashInitialBalanceModal: React.FC<CashInitialBalanceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}) => {
  const [currentBalanceData, setCurrentBalanceData] = useState<CashInitialBalance | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'config' | 'history'>('config');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const data = getCashInitialBalance();
      setCurrentBalanceData(data);
      setAmount(data.amount.toString());
      setDate(data.date || new Date().toISOString().split('T')[0]);
      setNotes(data.notes || '');
      setError(null);
      setActiveTab('config');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount < 0) {
      setError('Por favor, informe um valor de saldo inicial válido.');
      return;
    }

    if (!date) {
      setError('Por favor, informe a data inicial.');
      return;
    }

    const updated = setCashInitialBalance(
      numericAmount,
      date,
      notes.trim() || undefined,
      currentUser?.name || 'Administrador'
    );

    onSuccess(updated);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
        
        {/* Topo do Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-md font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Saldo Inicial do Caixa
              </h2>
              <p className="text-xs text-slate-500">
                Ponto de partida do controle financeiro com rastreabilidade completa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas: Configuração vs Histórico de Alterações */}
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'config'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Definir Saldo Inicial
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Histórico de Alterações ({currentBalanceData?.history?.length || 0})</span>
          </button>
        </div>

        {/* Conteúdo da Aba: Configuração */}
        {activeTab === 'config' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Banner de Segurança & Auditoria */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-2.5 text-xs text-blue-800">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
              <div>
                <span className="font-extrabold">Auditoria Ativa:</span> Não são permitidas alterações silenciosas. Toda modificação neste saldo gera um registro histórico com usuário, data e valor anterior.
              </div>
            </div>

            {/* Saldo Inicial (R$) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Valor do Saldo Inicial (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                  R$
                </span>
                <input
                  type="text"
                  required
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-black text-lg focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>
            </div>

            {/* Data Inicial */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Data de Início do Saldo *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-xs focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>
            </div>

            {/* Observações / Motivo */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Observação / Justificativa (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Contagem física do dinheiro em caixa na implantação do módulo..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              />
            </div>

            {/* Erro */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Botões do Rodapé */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar Saldo Inicial</span>
              </button>
            </div>

          </form>
        )}

        {/* Conteúdo da Aba: Histórico de Alterações */}
        {activeTab === 'history' && (
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {(!currentBalanceData?.history || currentBalanceData.history.length === 0) ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <History className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">Nenhuma alteração anterior registrada.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentBalanceData.history.map((hist, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-slate-900 text-sm">
                        R$ {hist.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(hist.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-amber-500" />
                        Alterado por: <strong className="text-slate-800">{hist.setBy}</strong>
                      </span>
                      <span>
                        Data vigência: {new Date(hist.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {hist.notes && (
                      <p className="text-slate-500 italic bg-white p-2 rounded-xl border border-slate-100">
                        "{hist.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
