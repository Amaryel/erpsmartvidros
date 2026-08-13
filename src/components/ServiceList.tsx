import React, { useState } from 'react';
import { Wrench, Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { CatalogItem } from '../types';
import { ServiceFormModal } from './ServiceFormModal';
import { saveCatalogItem, deleteCatalogItem } from '../services/storage';

interface ServiceListProps {
  catalog: CatalogItem[];
  onRefresh: () => void;
}

export const ServiceList: React.FC<ServiceListProps> = ({ catalog, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ativo' | 'inativo'>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<CatalogItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<CatalogItem | null>(null);

  // Filtrar apenas itens de categoria 'servico'
  const services = catalog.filter((c) => c.category === 'servico');

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || (s.status || 'ativo') === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleSaveSuccess = () => {
    onRefresh();
    setIsFormOpen(false);
    setEditingService(null);
  };

  const handleToggleStatus = (service: CatalogItem) => {
    const newStatus = (service.status || 'ativo') === 'ativo' ? 'inativo' : 'ativo';
    saveCatalogItem({ ...service, status: newStatus });
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
            <Wrench className="w-6 h-6 text-amber-500" />
            <span>Cadastro de Serviços</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre os serviços de mão de obra e instalações oferecidos pela Smart Vidros.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar serviço..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 focus:outline-none font-medium"
            />
          </div>

          <button
            onClick={() => {
              setEditingService(null);
              setIsFormOpen(true);
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Serviço</span>
          </button>
        </div>
      </div>

      {/* Regra do Sistema */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Ajuste Livre nos Orçamentos:</strong> O preço cadastrado no serviço é apenas o valor padrão de referência. O usuário poderá alterar o valor individualmente dentro de qualquer orçamento ou venda sem alterar o cadastro original.
        </div>
      </div>

      {/* Filtros de Status */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 text-xs">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterStatus === 'all' ? 'bg-slate-900 text-white shadow-sm font-extrabold' : 'text-slate-600'
            }`}
          >
            Todos os Serviços
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

      {/* Grid de Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 italic text-xs">
            Nenhum serviço cadastrado com os filtros selecionados.
          </div>
        ) : (
          filteredServices.map((service) => {
            const isAtivo = (service.status || 'ativo') === 'ativo';

            return (
              <div
                key={service.id}
                className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all ${
                  isAtivo ? 'border-slate-200 hover:border-amber-400' : 'border-slate-200 opacity-60 bg-slate-50/50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{service.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                          Mão de Obra / Serviço
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
                          setEditingService(service);
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Editar Serviço"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmItem(service)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir Serviço"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {service.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">{service.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Preço Padrão Sugerido</span>
                    <span className="font-extrabold font-mono text-amber-600 text-sm">
                      R$ {service.defaultPrice.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(service)}
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

      {/* Modal de Formulário de Serviço */}
      {isFormOpen && (
        <ServiceFormModal
          initialData={editingService}
          onClose={() => {
            setIsFormOpen(false);
            setEditingService(null);
          }}
          onSave={handleSaveSuccess}
          title={editingService ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}
        />
      )}

      {/* Modal de Exclusão */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>Excluir Serviço</span>
              </div>
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Tem certeza que deseja remover o serviço{' '}
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
                Sim, Excluir Serviço
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
