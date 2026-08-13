import React, { useState } from 'react';
import { PlusCircle, Search, FileText, Eye, Edit, Trash2, CheckCircle, ArrowRightLeft, DollarSign, Calendar, User, Phone, AlertTriangle, X } from 'lucide-react';
import { Quote, QuoteStatus } from '../types';

interface QuoteListProps {
  quotes: Quote[];
  onNewQuote: () => void;
  onView: (quote: Quote) => void;
  onEdit: (quote: Quote) => void;
  onDelete: (id: string) => void;
  onConvertToSale: (id: string) => void;
  onStatusChange: (id: string, newStatus: QuoteStatus) => void;
}

export const QuoteList: React.FC<QuoteListProps> = ({
  quotes,
  onNewQuote,
  onView,
  onEdit,
  onDelete,
  onConvertToSale,
  onStatusChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [deleteConfirmQuote, setDeleteConfirmQuote] = useState<Quote | null>(null);

  // Filtragem
  const filteredQuotes = quotes.filter((q) => {
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (q.code || '').toLowerCase().includes(term) ||
      (q.clientName && q.clientName.toLowerCase().includes(term)) ||
      (q.clientPhone && q.clientPhone.includes(searchTerm));

    const matchesStatus = statusFilter === 'todos' || q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case 'rascunho':
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-300 text-xs px-2.5 py-1 rounded-full font-bold">
            Rascunho
          </span>
        );
      case 'aprovado':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-bold">
            Aprovado
          </span>
        );
      case 'convertido':
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-1 rounded-full font-bold">
            Convertido em Venda
          </span>
        );
      case 'cancelado':
        return (
          <span className="bg-red-50 text-red-700 border border-red-200 text-xs px-2.5 py-1 rounded-full font-bold">
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmQuote) {
      onDelete(deleteConfirmQuote.id);
      setDeleteConfirmQuote(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Cabeçalho de Ações e Título */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestão de Orçamentos</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Crie, edite, converta em venda e gere os PDFs oficiais de orçamentos e recibos.
          </p>
        </div>

        <button
          onClick={onNewQuote}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 text-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Novo Orçamento</span>
        </button>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, código ou telefone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-slate-900 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Status:</span>
          {['todos', 'rascunho', 'aprovado', 'convertido', 'cancelado'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors shrink-0 ${
                statusFilter === st
                  ? 'bg-slate-900 text-amber-400 shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'todos' ? 'Todos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Lista / Grid de Orçamentos */}
      {filteredQuotes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Nenhum orçamento encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'todos'
              ? 'Tente alterar os filtros de busca para encontrar o registro desejado.'
              : 'Clique no botão "Novo Orçamento" para cadastrar o primeiro pedido no sistema.'}
          </p>
          <button
            onClick={onNewQuote}
            className="mt-4 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Criar Primeiro Orçamento</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-white border border-slate-200 hover:border-amber-400/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Topo do Card */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      {quote.code}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(quote.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <div>{getStatusBadge(quote.status)}</div>
                </div>

                {/* Cliente */}
                <div className="space-y-1 mb-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold text-sm">
                    <User className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="truncate">{quote.clientName || 'Cliente não identificado'}</span>
                  </div>

                  {quote.clientPhone && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{quote.clientPhone}</span>
                    </div>
                  )}
                </div>

                {/* Resumo de Itens */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-4 space-y-1 text-xs">
                  <div className="font-semibold text-slate-600 mb-1 flex items-center justify-between">
                    <span>{quote.items.length} produto(s) adicionado(s)</span>
                  </div>
                  {quote.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="text-slate-700 truncate flex justify-between">
                      <span className="truncate">• {item.name}</span>
                      <span className="font-mono font-bold shrink-0 ml-2">
                        R$ {item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {quote.items.length > 2 && (
                    <div className="text-[11px] text-slate-400 italic">
                      + {quote.items.length - 2} outro(s) item(ns)...
                    </div>
                  )}
                </div>
              </div>

              {/* Rodapé do Card com Valores e Ações */}
              <div>
                <div className="pt-2 border-t border-slate-100 mb-3 space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-slate-500">Valor Total do Orçamento:</span>
                    <span className="text-base font-black text-slate-900 font-mono">
                      R$ {quote.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {quote.downPaymentAmount && quote.downPaymentAmount > 0 ? (
                    <div className="flex items-center justify-between text-[11px] font-bold bg-amber-50/90 p-2 rounded-xl border border-amber-200/80">
                      <span className="text-slate-600">
                        Entrada: <strong className="text-emerald-700 font-black">R$ {quote.downPaymentAmount.toFixed(2)}</strong>
                      </span>
                      <span className="text-slate-600">
                        Restante: <strong className="text-amber-700 font-black">R$ {Math.max(0, quote.total - quote.downPaymentAmount).toFixed(2)}</strong>
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Botões de Ação */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onView(quote)}
                    className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold py-2 px-3 rounded-xl transition-colors shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver / PDF</span>
                  </button>

                  <button
                    onClick={() => onEdit(quote)}
                    className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3 rounded-xl transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  {quote.status !== 'convertido' && (
                    <button
                      onClick={() => onConvertToSale(quote.id)}
                      className="col-span-2 flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold py-2 px-3 rounded-xl transition-colors"
                      title="Converter este orçamento em Venda"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Converter em Venda</span>
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteConfirmQuote(quote)}
                    className="col-span-2 flex items-center justify-center gap-1.5 text-red-600 hover:bg-red-50 text-xs font-bold py-1.5 px-3 rounded-xl border border-transparent hover:border-red-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Orçamento</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Orçamento */}
      {deleteConfirmQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>Confirmar Exclusão</span>
              </div>
              <button
                onClick={() => setDeleteConfirmQuote(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Tem certeza que deseja excluir o orçamento{' '}
              <strong className="text-slate-900 font-mono font-black">{deleteConfirmQuote.code}</strong>
              {deleteConfirmQuote.clientName ? ` do cliente "${deleteConfirmQuote.clientName}"` : ''}?
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 font-medium">
              ⚠️ Esta ação não poderá ser desfeita e o registro será permanentemente removido.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmQuote(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-all active:scale-95"
              >
                Sim, Excluir Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
