import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, Package, Info, AlertTriangle, X } from 'lucide-react';
import { CatalogItem, ProductType } from '../types';

interface CatalogManagerProps {
  catalog: CatalogItem[];
  onSaveItem: (item: Omit<CatalogItem, 'id'> & { id?: string }) => void;
  onDeleteItem: (id: string) => void;
}

export const CatalogManager: React.FC<CatalogManagerProps> = ({
  catalog,
  onSaveItem,
  onDeleteItem,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ProductType>('dimensao');
  const [defaultPrice, setDefaultPrice] = useState<number>(150);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<CatalogItem | null>(null);

  const handleConfirmDelete = () => {
    if (deleteConfirmItem) {
      onDeleteItem(deleteConfirmItem.id);
      setDeleteConfirmItem(null);
    }
  };

  const handleStartEdit = (item: CatalogItem) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description || '');
    setType(item.type);
    setDefaultPrice(item.defaultPrice);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setType('dimensao');
    setDefaultPrice(150);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveItem({
      id: editingId || undefined,
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      defaultPrice,
    });

    handleCancelEdit();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Catálogo de Preços Base</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastre os produtos e preços padrão de referência para importar rapidamente nos novos orçamentos.
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Regra do Sistema:</strong> Os preços cadastrados aqui funcionam como sugestão rápida ao criar orçamentos. Alterar um valor no orçamento <u>não modifica</u> este catálogo, e alterar este catálogo <u>não altera</u> orçamentos já salvos.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulário de Adicionar / Editar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-fit space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-600" />
            <span>{editingId ? 'Editar Item do Catálogo' : 'Novo Item no Catálogo'}</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Tipo do Produto
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setType('dimensao')}
                  className={`py-1.5 rounded-lg font-bold transition-colors ${
                    type === 'dimensao' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Dimensão (m²)
                </button>
                <button
                  type="button"
                  onClick={() => setType('simples')}
                  className={`py-1.5 rounded-lg font-bold transition-colors ${
                    type === 'simples' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Simples (Unidade)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Nome do Produto <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Vidro 4mm Incolor"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Descrição (opcional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Vidro comum 4mm lapidado"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Preço Padrão ({type === 'dimensao' ? 'R$ por m²' : 'R$ por Unidade'})
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-1/2 py-2 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingId ? 'Salvar Alterações' : 'Adicionar ao Catálogo'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Itens do Catálogo */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Produtos Cadastrados ({catalog.length})
          </h2>

          <div className="space-y-3">
            {catalog.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{item.name}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {item.type === 'dimensao' ? 'Área m²' : 'Unidade'}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-500">{item.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Preço Padrão</p>
                    <p className="text-sm font-extrabold font-mono text-amber-600">
                      R$ {item.defaultPrice.toFixed(2)}{' '}
                      <span className="text-[10px] text-slate-400">{item.type === 'dimensao' ? '/m²' : '/un'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                      title="Editar Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmItem(item)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão de Catálogo */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>Excluir do Catálogo Base</span>
              </div>
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Tem certeza que deseja remover o item{' '}
              <strong className="text-slate-900 font-bold">"{deleteConfirmItem.name}"</strong> do catálogo?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-all active:scale-95"
              >
                Sim, Remover Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
