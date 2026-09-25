import React, { useState } from 'react';
import {
  AlertTriangle,
  Trash2,
  X,
  CheckSquare,
  Square,
  RefreshCw,
  Package,
  Users,
  FileText,
  ReceiptText,
  ShoppingBag,
  RotateCcw,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import {
  clearAllProducts,
  clearAllClients,
  clearAllQuotes,
  clearAllReceipts,
  clearAllSales,
  clearAllReceivables,
  clearAllContracts,
  restoreDefaultCatalog,
  resetSystemDatabase,
} from '../services/storage';

interface ResetDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ResetDatabaseModal: React.FC<ResetDatabaseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [resetProducts, setResetProducts] = useState(true);
  const [resetClients, setResetClients] = useState(true);
  const [resetQuotes, setResetQuotes] = useState(true);
  const [resetReceipts, setResetReceipts] = useState(true);
  const [resetSales, setResetSales] = useState(true);

  const [confirmText, setConfirmText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionDone, setActionDone] = useState(false);

  if (!isOpen) return null;

  const allSelected = resetProducts && resetClients && resetQuotes && resetReceipts && resetSales;
  const anySelected = resetProducts || resetClients || resetQuotes || resetReceipts || resetSales;

  const toggleSelectAll = () => {
    const nextState = !allSelected;
    setResetProducts(nextState);
    setResetClients(nextState);
    setResetQuotes(nextState);
    setResetReceipts(nextState);
    setResetSales(nextState);
  };

  const handleExecuteReset = () => {
    if (!anySelected) return;
    if (confirmText.trim().toUpperCase() !== 'ZERAR') return;

    setIsProcessing(true);

    try {
      resetSystemDatabase({
        products: resetProducts,
        clients: resetClients,
        quotes: resetQuotes,
        receipts: resetReceipts,
        sales: resetSales,
      });

      setActionDone(true);
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess('Dados selecionados foram zerados com sucesso!');
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const handleRestoreDefaultProducts = () => {
    if (window.confirm('Deseja restaurar o Catálogo Padrão de Vidros e Serviços da Smart Vidros?')) {
      restoreDefaultCatalog();
      onSuccess('Catálogo padrão de vidros restaurado com sucesso!');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-red-200 max-w-lg w-full my-auto overflow-hidden animate-in fade-in zoom-in duration-200 text-slate-900">
        
        {/* Header de Perigo */}
        <div className="bg-red-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Zerar Dados do Sistema</h2>
              <p className="text-xs text-red-100 font-medium">
                Limpeza de base de dados para início do zero
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-red-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Alerta */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Atenção:</strong> Esta ação apagará permanentemente os registros selecionados no seu banco de dados local. Selecione abaixo exatamente o que deseja zerar:
            </div>
          </div>

          {/* Seletores de Entidades para Limpar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Selecione os módulos para zerar:
              </span>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 underline"
              >
                {allSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {/* Produtos */}
              <label className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                resetProducts ? 'bg-red-50/60 border-red-200 text-red-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <div className="flex items-center gap-3">
                  <Package className={`w-4 h-4 ${resetProducts ? 'text-red-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs block font-bold">Produtos & Catálogo de Vidros</span>
                    <span className="text-[10px] text-slate-500 font-normal">Zera todos os produtos cadastrados no catálogo</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={resetProducts}
                  onChange={(e) => setResetProducts(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
              </label>

              {/* Clientes */}
              <label className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                resetClients ? 'bg-red-50/60 border-red-200 text-red-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 ${resetClients ? 'text-red-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs block font-bold">Cadastro de Clientes</span>
                    <span className="text-[10px] text-slate-500 font-normal">Zera todos os clientes e contatos cadastrados</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={resetClients}
                  onChange={(e) => setResetClients(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
              </label>

              {/* Orçamentos */}
              <label className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                resetQuotes ? 'bg-red-50/60 border-red-200 text-red-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <div className="flex items-center gap-3">
                  <FileText className={`w-4 h-4 ${resetQuotes ? 'text-red-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs block font-bold">Orçamentos Comerciais</span>
                    <span className="text-[10px] text-slate-500 font-normal">Zera todos os orçamentos e reinicia a numeração (ORC-2026-001)</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={resetQuotes}
                  onChange={(e) => setResetQuotes(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
              </label>

              {/* Recibos */}
              <label className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                resetReceipts ? 'bg-red-50/60 border-red-200 text-red-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <div className="flex items-center gap-3">
                  <ReceiptText className={`w-4 h-4 ${resetReceipts ? 'text-red-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs block font-bold">Recibos Oficiais</span>
                    <span className="text-[10px] text-slate-500 font-normal">Zera todos os recibos emitidos e reinicia a numeração (Nº 000001)</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={resetReceipts}
                  onChange={(e) => setResetReceipts(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
              </label>

              {/* Vendas & PDV */}
              <label className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                resetSales ? 'bg-red-50/60 border-red-200 text-red-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <div className="flex items-center gap-3">
                  <ShoppingBag className={`w-4 h-4 ${resetSales ? 'text-red-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs block font-bold">Vendas, PDV, Fiado & Contratos</span>
                    <span className="text-[10px] text-slate-500 font-normal">Zera histórico de vendas, parcelamentos a receber e contratos</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={resetSales}
                  onChange={(e) => setResetSales(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
              </label>
            </div>
          </div>

          {/* Campo de Confirmação Segura */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Para confirmar a limpeza, digite a palavra <span className="text-red-600 font-mono font-black text-sm select-all">ZERAR</span> abaixo:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Digite ZERAR para autorizar"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-black tracking-widest text-center text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all uppercase"
            />
          </div>

          {/* Botão de Restaurar Catálogo Padrão */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleRestoreDefaultProducts}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Restaurar Catálogo Padrão de Vidros</span>
            </button>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={!anySelected || confirmText.trim().toUpperCase() !== 'ZERAR' || isProcessing}
              onClick={handleExecuteReset}
              className="px-5 py-2.5 text-xs font-black text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-95 flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Zerando Dados...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Zerar Dados Selecionados</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
