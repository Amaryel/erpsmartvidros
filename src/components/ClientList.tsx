import React, { useState, useEffect } from 'react';
import { Users, Phone, Search, Plus, Eye, Edit2, Trash2, FileText, ReceiptText, Building2, MapPin, AlertTriangle, X } from 'lucide-react';
import { Client, Quote, Sale, Receivable } from '../types';
import { getClients, saveClient, deleteClient } from '../services/storage';
import { ClientFormModal } from './ClientFormModal';
import { ClientViewModal } from './ClientViewModal';

interface ClientListProps {
  quotes: Quote[];
  sales: Sale[];
  receivables: Receivable[];
  onNewQuoteForClient: (clientName: string, clientPhone?: string) => void;
  onNewReceiptForClient: (clientName: string, clientPhone?: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  quotes,
  sales,
  receivables,
  onNewQuoteForClient,
  onNewReceiptForClient,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [deleteConfirmClient, setDeleteConfirmClient] = useState<Client | null>(null);

  useEffect(() => {
    refreshClients();
  }, []);

  const refreshClients = () => {
    setClients(getClients());
  };

  const handleSaveClientSuccess = (savedClient: Client) => {
    refreshClients();
    setIsFormModalOpen(false);
    setEditingClient(null);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmClient) {
      deleteClient(deleteConfirmClient.id);
      refreshClients();
      setDeleteConfirmClient(null);
    }
  };

  // Filtrar clientes
  const filteredClients = clients.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.cpfCnpj && c.cpfCnpj.includes(term)) ||
      (c.phone && c.phone.includes(term)) ||
      (c.city && c.city.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 pb-20">
      
      {/* Topo / Barra de Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            <span>Cadastro de Clientes</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gerencie os dados dos clientes para reutilização rápida em orçamentos, vendas e recibos.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, CPF/CNPJ, fone..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 focus:outline-none font-medium"
            />
          </div>

          <button
            onClick={() => {
              setEditingClient(null);
              setIsFormModalOpen(true);
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Grid de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 italic text-xs">
            Nenhum cliente encontrado. Clique em "+ Novo Cliente" para cadastrar.
          </div>
        ) : (
          filteredClients.map((client) => {
            const clientTarget = client.name.trim().toLowerCase();
            const clientSales = sales.filter((s) => s.clientName?.trim().toLowerCase() === clientTarget);
            const totalSales = clientSales.reduce((acc, s) => acc + s.total, 0);

            const clientReceivables = receivables.filter((r) => r.clientName?.trim().toLowerCase() === clientTarget && r.status !== 'pago');
            const totalFiado = clientReceivables.reduce((acc, r) => acc + r.remainingAmount, 0);

            return (
              <div
                key={client.id}
                className="bg-white border border-slate-200 hover:border-amber-400/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 line-clamp-1">{client.name}</h3>
                      {client.cpfCnpj && (
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          {client.cpfCnpj}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setViewingClient(client)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Visualizar Detalhes"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingClient(client);
                          setIsFormModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Editar Cadastro"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmClient(client)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir Cliente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 pt-1">
                    {client.phone && (
                      <p className="flex items-center gap-1.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-amber-600" />
                        <span>{client.phone}</span>
                      </p>
                    )}
                    {client.city && (
                      <p className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{client.city}{client.state ? ` - ${client.state}` : ''}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Métricas do Cliente */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Vendas</span>
                    <span className="font-black text-slate-900 font-mono">
                      R$ {totalSales.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Saldo Fiado</span>
                    <span className={`font-black font-mono ${totalFiado > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      R$ {totalFiado.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Ações de Negócio Rápido */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onNewQuoteForClient(client.name, client.phone || client.whatsapp)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs py-2 px-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>+ Orçamento</span>
                  </button>

                  <button
                    onClick={() => onNewReceiptForClient(client.name, client.phone || client.whatsapp)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <ReceiptText className="w-3.5 h-3.5" />
                    <span>Recibo</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Formulário de Cliente */}
      {isFormModalOpen && (
        <ClientFormModal
          initialData={editingClient}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingClient(null);
          }}
          onSave={handleSaveClientSuccess}
          title={editingClient ? 'Editar Cadastro de Cliente' : 'Cadastrar Novo Cliente'}
        />
      )}

      {/* Modal de Visualização Detalhada do Cliente */}
      {viewingClient && (
        <ClientViewModal
          client={viewingClient}
          quotes={quotes}
          sales={sales}
          receivables={receivables}
          onClose={() => setViewingClient(null)}
          onEdit={(c) => {
            setViewingClient(null);
            setEditingClient(c);
            setIsFormModalOpen(true);
          }}
          onNewQuoteForClient={onNewQuoteForClient}
          onNewReceiptForClient={onNewReceiptForClient}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirmClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>Excluir Cadastro do Cliente</span>
              </div>
              <button
                onClick={() => setDeleteConfirmClient(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Tem certeza que deseja excluir o cliente{' '}
              <strong className="text-slate-900 font-bold">"{deleteConfirmClient.name}"</strong> do cadastro?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmClient(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-all active:scale-95"
              >
                Sim, Excluir Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
