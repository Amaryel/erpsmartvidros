import React, { useState } from 'react';
import { Package, Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { CatalogItem } from '../types';
import { ProductFormModal } from './ProductFormModal';
import { saveCatalogItem, deleteCatalogItem } from '../services/storage';

interface ProductListProps {
  catalog: CatalogItem[];
  onRefresh: () => void;
}

export const ProductList: React.FC<ProductListProps> = ({ catalog, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'dimensao' | 'simples'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ativo' | 'inativo'>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<CatalogItem | null>(null);

  // Filtrar apenas itens de categoria 'produto'
  const products = catalog.filter((c) => c.category === 'produto' || c.category === undefined);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || p.type === filterType;
    const matchesStatus = filterStatus === 'all' || (p.status || 'ativo') === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleSaveSuccess = () => {
    onRefresh();
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleToggleStatus = (product: CatalogItem) => {
    const newStatus = (product.status || 'ativo') === 'ativo' ? 'inativo' : 'ativo';
    saveCatalogItem({ ...product, status: newStatus });
    onRefresh();
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmItem) {
      deleteCatalogItem(deleteConfirmItem.id);
      onRefresh();
      setDeleteConfirmItem(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-500" />
            <span>Cadastro de Produtos</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre os produtos simples e com dimensões calculados por m² para uso nos orçamentos e PDV.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar produto..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 focus:outline-none font-medium"
            />
          </div>

          <button
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Regra do Sistema */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Preço Padrão de Referência:</strong> Os preços cadastrados funcionam como sugestão ao selecionar o produto em orçamentos ou vendas. O valor pode ser alterado livremente para cada item individual na venda sem alterar este cadastro.
        </div>
      </div>

      {/* Filtros de Tipo e Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterType === 'all' ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold' : 'text-slate-600'
            }`}
          >
            Todos os Tipos
          </button>
          <button
            onClick={() => setFilterType('dimensao')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterType === 'dimensao' ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold' : 'text-slate-600'
            }`}
          >
            Com Dimensões (m²)
          </button>
          <button
            onClick={() => setFilterType('simples')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterType === 'simples' ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold' : 'text-slate-600'
            }`}
          >
            Produtos Simples
          </button>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterStatus === 'all' ? 'bg-slate-900 text-white shadow-sm font-extrabold' : 'text-slate-600'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterStatus('ativo')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterStatus === 'ativo' ? 'bg-emerald-600 text-white shadow-sm font-extrabold' : 'text-slate-600'
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setFilterStatus('inativo')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterStatus === 'inativo' ? 'bg-slate-400 text-white shadow-sm font-extrabold' : 'text-slate-600'
            }`}
          >
            Inativos
          </button>
        </div>
      </div>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 italic text-xs">
            Nenhum produto cadastrado com os filtros selecionados.
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isAtivo = (product.status || 'ativo') === 'ativo';

            return (
              <div
                key={product.id}
                className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all ${
                  isAtivo ? 'border-slate-200 hover:border-amber-400' : 'border-slate-200 opacity-60 bg-slate-50/50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-slate-900">{product.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                          {product.type === 'dimensao' ? 'm² (Dimensões)' : 'Unidade Simples'}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                            isAtivo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isAtivo ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{isAtivo ? 'Ativo' : 'Inativo'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Editar Produto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmItem(product)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir Produto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {product.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">{product.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Preço Padrão</span>
                    <span className="font-extrabold font-mono text-amber-600 text-sm">
                      R$ {product.defaultPrice.toFixed(2)}{' '}
                      <span className="text-[10px] text-slate-400 font-sans">/{product.unit || (product.type === 'dimensao' ? 'm²' : 'un')}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(product)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isAtivo
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isAtivo ? 'Inativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Formulário de Produto */}
      {isFormOpen && (
        <ProductFormModal
          initialData={editingProduct}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveSuccess}
          title={editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
        />
      )}

      {/* Modal de Exclusão */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>Excluir Produto</span>
              </div>
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Tem certeza que deseja remover o produto{' '}
              <strong className="text-slate-900 font-bold">"{deleteConfirmItem.name}"</strong> do cadastro?
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
                Sim, Excluir Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
