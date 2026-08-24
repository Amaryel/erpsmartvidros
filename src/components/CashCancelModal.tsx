import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CashTransaction, AppUser } from '../types';
import { cancelCashTransaction } from '../services/data/repositories/cashRepository';

interface CashCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: CashTransaction | null;
  onSuccess: (transaction: CashTransaction) => void;
  currentUser?: AppUser | null;
}

export const CashCancelModal: React.FC<CashCancelModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onSuccess,
  currentUser,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Por favor, informe o motivo do cancelamento para registro de auditoria.');
      return;
    }

    const cancelled = cancelCashTransaction(
      transaction.id,
      reason.trim(),
      currentUser?.name || 'Administrador'
    );

    if (cancelled) {
      onSuccess(cancelled);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
        
        {/* Topo */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Cancelar Lançamento
              </h2>
              <p className="text-xs text-slate-500">
                Esta ação reverterá o impacto desta movimentação no saldo
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

        {/* Resumo da Movimentação */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-600">Descrição:</span>
            <span className="font-black text-slate-900">{transaction.description}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-600">Valor:</span>
            <span
              className={`font-black font-mono ${
                transaction.type === 'entrada' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {transaction.type === 'entrada' ? '+' : '-'} R${' '}
              {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-600">Data:</span>
            <span className="text-slate-800">
              {new Date(transaction.date + 'T12:00:00').toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Formulário de Motivo */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Motivo do Cancelamento (Obrigatório) *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Descreva detalhadamente o motivo do cancelamento..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Voltar
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Cancelamento</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
