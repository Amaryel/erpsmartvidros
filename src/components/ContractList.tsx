import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Plus,
  Filter,
  Eye,
  Edit3,
  Download,
  Trash2,
  Calendar,
  DollarSign,
  User,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  Layers
} from 'lucide-react';
import { Contract, CompanyInfo } from '../types';
import { downloadPdfElement } from '../utils/pdfGenerator';

interface ContractListProps {
  contracts: Contract[];
  companyInfo: CompanyInfo;
  onNewContract: () => void;
  onViewContract: (contract: Contract) => void;
  onEditContract: (contract: Contract) => void;
  onDeleteContract: (contractId: string) => void;
  onOpenSale?: (saleId: string) => void;
  onOpenQuote?: (quoteId: string) => void;
}

export const ContractList: React.FC<ContractListProps> = ({
  contracts,
  companyInfo,
  onNewContract,
  onViewContract,
  onEditContract,
  onDeleteContract,
  onOpenSale,
  onOpenQuote,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'rascunho' | 'concluido' | 'cancelado'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtragem
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        c.code.toLowerCase().includes(term) ||
        c.clientName.toLowerCase().includes(term) ||
        (c.clientDocument && c.clientDocument.toLowerCase().includes(term)) ||
        (c.saleCode && c.saleCode.toLowerCase().includes(term)) ||
        (c.quoteCode && c.quoteCode.toLowerCase().includes(term));

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [contracts, searchTerm, statusFilter]);

  // Estatísticas Rápidas
  const stats = useMemo(() => {
    const totalCount = contracts.length;
    const totalValue = contracts.reduce((acc, c) => acc + (c.totalAmount || 0), 0);
    const activeCount = contracts.filter((c) => c.status === 'ativo').length;
    return { totalCount, totalValue, activeCount };
  }, [contracts]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      if (dateStr.includes('T')) {
        const [y, m, d] = dateStr.split('T')[0].split('-');
        return `${d}/${m}/${y}`;
      }
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    } catch {
      return dateStr;
    }
  };

  const statusBadges: Record<string, { label: string; bg: string; text: string }> = {
    ativo: { label: 'Ativo', bg: 'bg-emerald-50 border-emerald-300', text: 'text-emerald-800' },
    rascunho: { label: 'Rascunho', bg: 'bg-amber-50 border-amber-300', text: 'text-amber-800' },
    concluido: { label: 'Concluído', bg: 'bg-blue-50 border-blue-300', text: 'text-blue-800' },
    cancelado: { label: 'Cancelado', bg: 'bg-red-50 border-red-300', text: 'text-red-800' },
  };

  return (
    <div className="space-y-6">
      
      {/* CABEÇALHO DA ABA & BOTÃO DE NOVO CONTRATO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-950 flex items-center gap-2.5">
            <span className="p-2 bg-amber-500 text-slate-950 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
            <span>Contratos de Prestação de Serviços</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Gerencie, edite e emita contratos com valores dinâmicos, parcelamento e cláusulas padrão da Smart Vidros.
          </p>
        </div>

        <button
          onClick={onNewContract}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0 cursor-pointer uppercase tracking-wider"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Novo Contrato</span>
        </button>
      </div>

      {/* CARDS DE ESTATÍSTICAS RÁPIDAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de Contratos</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalCount}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{stats.activeCount} ativos</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valor em Contratos</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">
              R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Montante contratado</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modelo Padrão</p>
            <h3 className="text-base font-black text-slate-900 mt-1">Smart Vidros A4</h3>
            <p className="text-[11px] text-amber-700 font-semibold mt-0.5">10 Cláusulas + Inadimplência</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* BARRA DE PESQUISA E FILTROS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código, cliente, venda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {(['all', 'ativo', 'rascunho', 'concluido', 'cancelado'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                statusFilter === st
                  ? 'bg-slate-950 text-amber-400 font-black'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st === 'all' ? 'Todos' : statusBadges[st]?.label || st}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA / TABELA DE CONTRATOS */}
      {filteredContracts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Nenhum contrato encontrado</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {searchTerm || statusFilter !== 'all'
                ? 'Nenhum contrato corresponde aos filtros aplicados.'
                : 'Você pode gerar contratos automaticamente ao finalizar uma venda no PDV ou criar um novo agora mesmo.'}
            </p>
          </div>
          <button
            onClick={onNewContract}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md cursor-pointer transition-all"
          >
            + Criar Primeiro Contrato
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredContracts.map((contract) => {
            const badge = statusBadges[contract.status] || statusBadges.ativo;

            return (
              <div
                key={contract.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Lado Esquerdo: Identificação & Cliente */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-slate-900 text-amber-400 font-black text-xs px-2.5 py-1 rounded-md">
                      {contract.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(contract.date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-950">{contract.clientName}</h3>
                    {contract.clientDocument && (
                      <span className="text-[11px] text-slate-500 font-medium">({contract.clientDocument})</span>
                    )}
                  </div>

                  {/* Venda e Orçamento Relacionados */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    {contract.saleCode && (
                      <div className="flex items-center gap-1 text-slate-700">
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                        <span>Venda: <strong>{contract.saleCode}</strong></span>
                        {contract.saleId && onOpenSale && (
                          <button
                            type="button"
                            onClick={() => onOpenSale(contract.saleId!)}
                            className="text-[10px] text-amber-700 hover:underline font-bold ml-1"
                          >
                            (abrir)
                          </button>
                        )}
                      </div>
                    )}

                    {contract.quoteCode && (
                      <div className="flex items-center gap-1 text-slate-700">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Orçamento: <strong>{contract.quoteCode}</strong></span>
                        {contract.quoteId && onOpenQuote && (
                          <button
                            type="button"
                            onClick={() => onOpenQuote(contract.quoteId!)}
                            className="text-[10px] text-blue-700 hover:underline font-bold ml-1"
                          >
                            (abrir)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Centro / Valor Total */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left sm:text-right shrink-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Valor Total</p>
                  <p className="text-base font-black text-emerald-700">
                    R$ {(contract.totalAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-slate-500 italic max-w-xs truncate">
                    ({contract.totalAmountInWords || 'zero reais'})
                  </p>
                </div>

                {/* Lado Direito: Ações Rápidas */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <button
                    type="button"
                    onClick={() => onViewContract(contract)}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visualizar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onEditContract(contract)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                    title="Editar Contrato"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingId(contract.id)}
                    className="p-2 bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
                    title="Excluir Contrato"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      {deletingId && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-red-200 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Excluir Contrato?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Deseja realmente remover este contrato? Os dados da venda e orçamento não serão afetados.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteContract(deletingId);
                  setDeletingId(null);
                }}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-2 rounded-xl text-xs shadow-md"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
