import React, { useState } from 'react';
import { X, Package, Check, DollarSign } from 'lucide-react';
import { CatalogItem, ProductType } from '../types';
import { saveCatalogItem } from '../services/storage';

interface ProductFormModalProps {
  initialData?: Partial<CatalogItem> | null;
  onClose: () => void;
  onSave: (savedItem: CatalogItem) => void;
  title?: string;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  initialData,
  onClose,
  onSave,
  title = 'Cadastrar Novo Produto',
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<ProductType>(initialData?.type || 'dimensao');
  const [unit, setUnit] = useState(initialData?.unit || (type === 'dimensao' ? 'm²' : 'unidade'));
  const [defaultPrice, setDefaultPrice] = useState<number>(initialData?.defaultPrice ?? 150);
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<'ativo' | 'inativo'>(initialData?.status || 'ativo');
  const [error, setError] = useState<string | null>(null);

  const handleTypeChange = (newType: ProductType) => {
    setType(newType);
    if (newType === 'dimensao' && (unit === 'unidade' || !unit)) {
      setUnit('m²');
    } else if (newType === 'simples' && unit === 'm²') {
      setUnit('unidade');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O Nome do produto é obrigatório.');
      return;
    }

    const updatedCatalog = saveCatalogItem({
      id: initialData?.id,
      name: name.trim(),
      type,
      category: 'produto',
      unit: unit.trim() || (type === 'dimensao' ? 'm²' : 'unidade'),
      defaultPrice: defaultPrice >= 0 ? defaultPrice : 0,
      description: description.trim() || undefined,
      status,
    });

    // Encontrar o item salvo
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
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
              <p className="text-xs text-slate-500">
                {initialData?.id ? 'Atualize as informações do produto' : 'Cadastre um novo produto no catálogo base'}
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
          {/* Tipo de Cálculo de Preço */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Tipo do Produto <span className="text-amber-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleTypeChange('dimensao')}
                className={`py-2 rounded-lg font-bold transition-all text-center ${
                  type === 'dimensao'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Com Dimensões (m²)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('simples')}
                className={`py-2 rounded-lg font-bold transition-all text-center ${
                  type === 'simples'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Produto Simples (Unid)
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {type === 'dimensao'
                ? 'O valor será calculado dinamicamente com base na altura x largura (mm) informadas na venda.'
                : 'O valor será multiplicado diretamente pela quantidade de unidades solicitadas.'}
            </p>
          </div>

          {/* Nome do Produto */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Nome do Produto <span className="text-amber-600">*</span>
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
              placeholder={type === 'dimensao' ? 'Ex: Vidro 4mm Incolor' : 'Ex: Espelho Lapidado 60cm'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Unidade de Venda & Preço Padrão */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Unidade de Venda
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              >
                <option value="m²">m² (Metro Quadrado)</option>
                <option value="unidade">Unidade (un)</option>
                <option value="peça">Peça</option>
                <option value="barra">Barra</option>
                <option value="m">Metro Linear (m)</option>
                <option value="caixa">Caixa</option>
                <option value="kit">Kit</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Preço Padrão ({type === 'dimensao' ? 'R$/m²' : 'R$/un'})
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={defaultPrice}
                  onChange={(e) => setDefaultPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Descrição (opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Especificações do material, espessura, acabamento..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Status do Produto
            </label>
            <div className="flex items-center gap-4 bg-slate-50 p-2 border border-slate-200 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="radio"
                  name="productStatus"
                  value="ativo"
                  checked={status === 'ativo'}
                  onChange={() => setStatus('ativo')}
                  className="text-amber-500 focus:ring-amber-500"
                />
                <span className="text-emerald-700 font-bold">Ativo</span> (Visível no catálogo)
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="radio"
                  name="productStatus"
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
              <span>Salvar Produto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
