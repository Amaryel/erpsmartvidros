import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  DollarSign,
  Calendar,
  User,
  CheckCircle2,
  X,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Scale,
  FileText
} from 'lucide-react';
import { CashSession, AppUser } from '../types';
import {
  getCurrentOpenCashSession,
  openCashSession,
  closeCashSession,
  calculateCashSummary,
  getCashTransactions,
} from '../services/data/repositories/cashRepository';

interface CashSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'open' | 'close';
  onSuccess: (session: CashSession) => void;
  currentUser?: AppUser | null;
}

export const CashSessionModal: React.FC<CashSessionModalProps> = ({
  isOpen,
  onClose,
  mode,
  onSuccess,
  currentUser,
}) => {
  const [initialBalance, setInitialBalance] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  
  // Dados para Fechamento
  const [activeSession, setActiveSession] = useState<CashSession | null>(null);
  const [expectedBalance, setExpectedBalance] = useState<number>(0);
  const [countedBalance, setCountedBalance] = useState<string>('');
  const [differenceNotes, setDifferenceNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      const openSess = getCurrentOpenCashSession();
      setActiveSession(openSess);

      if (mode === 'open') {
        const summary = calculateCashSummary();
        setInitialBalance(summary.currentBalance.toString());
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
      } else {
        // Modo Fechamento: calcular saldo esperado da sessão
        if (openSess) {
          const now = new Date().toISOString();
          const txs = getCashTransactions().filter(
            (t) =>
              t.status === 'ativo' &&
              (t.cashSessionId === openSess.id ||
                (new Date(t.createdAt).getTime() >= new Date(openSess.openedAt).getTime() &&
                  new Date(t.createdAt).getTime() <= new Date(now).getTime()))
          );
          const entries = txs.filter((t) => t.type === 'entrada').reduce((sum, t) => sum + t.amount, 0);
          const exits = txs.filter((t) => t.type === 'saida').reduce((sum, t) => sum + t.amount, 0);
          const exp = openSess.initialBalance + entries - exits;
          setExpectedBalance(exp);
          setCountedBalance(exp.toFixed(2));
          setDifferenceNotes('');
        }
      }
    }
  }, [isOpen, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const userName = currentUser?.name || 'Administrador';

    if (mode === 'open') {
      const initAmount = parseFloat(initialBalance.replace(',', '.'));
      if (isNaN(initAmount) || initAmount < 0) {
        setError('Informe um saldo inicial de abertura válido.');
        return;
      }

      const session = openCashSession(initAmount, date, notes.trim() || undefined, userName);
      onSuccess(session);
      onClose();
    } else {
      if (!activeSession) {
        setError('Nenhuma sessão de caixa aberta encontrada para fechar.');
        return;
      }

      const counted = parseFloat(countedBalance.replace(',', '.'));
      if (isNaN(counted) || counted < 0) {
        setError('Informe o valor físico contado no caixa.');
        return;
      }

      const diff = Math.round((counted - expectedBalance) * 100) / 100;
      if (Math.abs(diff) > 0.01 && !differenceNotes.trim()) {
        setError('Há uma diferença entre o saldo esperado e o contado. Por favor, preencha a justificativa da diferença.');
        return;
      }

      const closed = closeCashSession(activeSession.id, counted, differenceNotes.trim() || undefined, userName);
      if (closed) {
        onSuccess(closed);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  const currentCounted = parseFloat(countedBalance.replace(',', '.')) || 0;
  const currentDiff = Math.round((currentCounted - expectedBalance) * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
        
        {/* Topo do Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl shadow-md font-bold ${
                mode === 'open'
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-indigo-600 text-white shadow-indigo-600/30'
              }`}
            >
              {mode === 'open' ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {mode === 'open' ? 'Abertura de Caixa' : 'Fechamento de Caixa'}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'open'
                  ? 'Inicie a contagem e movimentações do turno/dia'
                  : 'Conferência física e encerramento do turno'}
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

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'open' ? (
            /* Formulário de ABERTURA */
            <>
              {/* Responsável */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2 text-xs text-slate-700">
                <User className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  Responsável pela abertura: <strong>{currentUser?.name || 'Administrador'}</strong>
                </span>
              </div>

              {/* Saldo de Abertura */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Saldo de Abertura (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                    R$
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-black text-lg focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Sugestão baseada no saldo atual do sistema.
                </p>
              </div>

              {/* Data */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Data de Abertura *
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

              {/* Observação */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Observações (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Turno da manhã, troco em moedas conferido..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>
            </>
          ) : (
            /* Formulário de FECHAMENTO */
            <>
              {/* Informações da Sessão Atual */}
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-1.5 text-xs text-indigo-950">
                <div className="flex items-center justify-between font-bold">
                  <span>Caixa Aberto em:</span>
                  <span>{activeSession ? new Date(activeSession.openedAt).toLocaleString('pt-BR') : '-'}</span>
                </div>
                <div className="flex items-center justify-between text-indigo-800">
                  <span>Aberto por:</span>
                  <span className="font-semibold">{activeSession?.openedBy || 'Administrador'}</span>
                </div>
              </div>

              {/* Comparativo de Saldos: Esperado vs Contado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Saldo Esperado (Sistema)
                  </span>
                  <div className="text-lg font-black font-mono text-slate-900">
                    R$ {expectedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Inicial + Entradas - Saídas
                  </span>
                </div>

                <div className="p-4 bg-white border-2 border-indigo-300 rounded-2xl space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-indigo-950 tracking-wider block">
                    Saldo Contado (Real) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-indigo-400">
                      R$
                    </span>
                    <input
                      type="text"
                      required
                      value={countedBalance}
                      onChange={(e) => setCountedBalance(e.target.value)}
                      className="w-full pl-8 pr-2 py-1 bg-indigo-50/50 border border-indigo-200 rounded-lg text-indigo-950 font-mono font-black text-base focus:bg-white focus:outline-hidden"
                    />
                  </div>
                  <span className="text-[10px] text-indigo-600">
                    Valor apurado fisicamente
                  </span>
                </div>
              </div>

              {/* Status da Diferença (Sobra / Falta / Exato) */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                  Math.abs(currentDiff) < 0.01
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : currentDiff > 0
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  <span>
                    {Math.abs(currentDiff) < 0.01
                      ? 'Saldo Exato (Sem divergências)'
                      : currentDiff > 0
                      ? 'Sobra de Caixa Identificada'
                      : 'Falta de Caixa Identificada'}
                  </span>
                </div>

                <div className="font-mono font-black text-sm">
                  {currentDiff > 0 ? '+' : ''} R${' '}
                  {currentDiff.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Justificativa da Diferença (Obrigatória se houver diferença) */}
              {Math.abs(currentDiff) >= 0.01 && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Justificativa da Diferença *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Explique o motivo da sobra ou falta no caixa..."
                    value={differenceNotes}
                    onChange={(e) => setDifferenceNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>
              )}
            </>
          )}

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
              className={`px-6 py-2.5 text-white font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2 ${
                mode === 'open'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{mode === 'open' ? 'Confirmar Abertura' : 'Encerrar e Fechar Caixa'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
