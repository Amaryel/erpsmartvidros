import React, { useState } from 'react';
import { X, Wrench, Check, DollarSign } from 'lucide-react';
import { CatalogItem } from '../types';
import { saveCatalogItem } from '../services/storage';

interface ServiceFormModalProps {
  initialData?: Partial<CatalogItem> | null;
  onClose: () => void;
  onSave: (savedService: CatalogItem) => void;
  title?: string;
}

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  initialData,
  onClose,
  onSave,
  title = 'Cadastrar Novo Serviço',
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [defaultPrice, setDefaultPrice] = useState<number>(initialData?.defaultPrice ?? 150);
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<'ativo' | 'inativo'>(initialData?.status || 'ativo');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O Nome do serviço é obrigatório.');
      return;
    }

    const updatedCatalog = saveCatalogItem({
      id: initialData?.id,
      name: name.trim(),
      type: 'simples',
      category: 'servico',
      unit: 'serviço',
      defaultPrice: defaultPrice >= 0 ? defaultPrice : 0,
      description: description.trim() || undefined,
      status,
    });

    const saved = updatedCatalog.find((c) => c.name.trim().toLowerCase() === name.trim().toLowerCase()) || updatedCatalog[0];
    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-lg w-full border border-slate-200 my-8 space-y-4 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
              <p className="text-xs text-slate-500">
                {initialData?.id ? 'Atualize as informações do serviço' : 'Cadastre um novo serviço de vidraçaria ou manutenção'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Nome do Serviço */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Nome do Serviço <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ex: Instalação de Box de Banheiro, Troca de Roldanas"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Preço Padrão */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Preço Padrão Sugerido (R$)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(parseFloat(e.target.value) || 0)}
                placeholder="150,00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Este valor é apenas uma referência. Você poderá alterá-lo livremente dentro de cada orçamento ou venda sem modificar o cadastro.
            </p>
          </div>

          {/* Descrição */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Descrição Detalhada (opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o escopo da mão de obra, ferramentas, inclusões..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Status do Serviço
            </label>
            <div className="flex items-center gap-4 bg-slate-50 p-2 border border-slate-200 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="radio"
                  name="serviceStatus"
                  value="ativo"
                  checked={status === 'ativo'}
                  onChange={() => setStatus('ativo')}
                  className="text-amber-500 focus:ring-amber-500"
                />
                <span className="text-emerald-700 font-bold">Ativo</span> (Disponível no sistema)
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="radio"
                  name="serviceStatus"
                  value="inativo"
                  checked={status === 'inativo'}
                  onChange={() => setStatus('inativo')}
                  className="text-amber-500 focus:ring-amber-500"
                />
                <span className="text-slate-500">Inativo</span>
              </label>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-extrabold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Serviço</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
