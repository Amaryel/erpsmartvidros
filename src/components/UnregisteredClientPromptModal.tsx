import React from 'react';
import { UserPlus, ArrowRight, X } from 'lucide-react';

interface UnregisteredClientPromptModalProps {
  clientName: string;
  onRegister: () => void;
  onContinueWithoutRegister: () => void;
  onClose: () => void;
}

export const UnregisteredClientPromptModal: React.FC<UnregisteredClientPromptModalProps> = ({
  clientName,
  onRegister,
  onContinueWithoutRegister,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Cliente Não Cadastrado</h3>
              <p className="text-[11px] text-slate-500">Aviso do Sistema de Cadastros</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-950 space-y-1.5 leading-relaxed">
          <p className="font-bold text-amber-900 text-sm">
            Este cliente ainda não está cadastrado. Deseja cadastrá-lo agora?
          </p>
          <p className="text-amber-800">
            Cliente informado: <strong className="text-slate-900 font-bold underline">{clientName}</strong>
          </p>
          <p className="text-[11px] text-amber-700">
            Cadastrar o cliente facilita a reutilização em futuros orçamentos, vendas, recibos e no controle do contas a receber.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onContinueWithoutRegister}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Continuar sem cadastrar
          </button>

          <button
            type="button"
            onClick={onRegister}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-extrabold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar cliente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
