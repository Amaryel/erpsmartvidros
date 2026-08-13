import React, { useState, useEffect } from 'react';
import { X, Search, FileText, Calendar, User, DollarSign, ArrowRight, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { Quote, QuoteStatus } from '../types';
import { getQuotes } from '../services/storage';

interface ImportQuoteModalProps {
  onClose: () => void;
  onSelectQuote: (quote: Quote) => void;
}

export const ImportQuoteModal: React.FC<ImportQuoteModalProps> = ({ onClose, onSelectQuote }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = () => {
    const list = getQuotes();
    setQuotes(list);
  };

  const filteredQuotes = quotes.filter((q) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesTerm =
      !term ||
      q.code.toLowerCase().includes(term) ||
      (q.clientName && q.clientName.toLowerCase().includes(term)) ||
      (q.clientPhone && q.clientPhone.toLowerCase().includes(term)) ||
      q.items.some((i) => i.name.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;

    return matchesTerm && matchesStatus;
  });

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case 'aprovado':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Aprovado</span>
          </span>
        );
      case 'convertido':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Vendido / Convertido</span>
          </span>
        );
      case 'rascunho':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pendente / Rascunho</span>
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full border border-red-300">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Cancelado</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-amber-500/30 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabeçalho do Modal */}
        <div className="bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-900 text-white p-5 border-b border-amber-500/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Importar Orçamento para o PDV</span>
              </h2>
              <p className="text-xs text-amber-200/80">
                Selecione um orçamento para carregar automaticamente o cliente, itens e valores na venda.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors border border-zinc-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filtros e Busca */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código (ex: ORC-2026-001), nome do cliente, telefone ou produto..."
                className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ×
                </button>
              )}
            </div>

            <button
              onClick={loadQuotes}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Atualizar</span>
            </button>
          </div>

          {/* Filtro de Status */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium scrollbar-none">
            <span className="text-slate-500 font-semibold mr-1 shrink-0">Status:</span>
            {[
              { id: 'all', label: 'Todos os Orçamentos' },
              { id: 'aprovado', label: 'Aprovados' },
              { id: 'rascunho', label: 'Pendentes / Rascunhos' },
              { id: 'convertido', label: 'Já Vendidos' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg transition-all shrink-0 font-bold ${
                  statusFilter === st.id
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Orçamentos */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-100">
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-300">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">Nenhum orçamento encontrado</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Tente alterar a palavra de busca ou limpar os filtros para visualizar orçamentos salvos.
              </p>
            </div>
          ) : (
            filteredQuotes.map((quote) => {
              const itemsSummary = quote.items.map((i) => `${i.quantity}x ${i.name}`).join(' • ');
              const hasDownPayment = Boolean(quote.downPaymentAmount && quote.downPaymentAmount > 0);

              return (
                <div
                  key={quote.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-amber-400 p-4 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="space-y-2 flex-1">
                    {/* Topline com Código, Data e Status */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 text-xs">
                        {quote.code}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {quote.date ? new Date(quote.date + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                      </span>
                      {getStatusBadge(quote.status)}
                    </div>

                    {/* Cliente */}
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <User className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{quote.clientName || 'Cliente Não Informado'}</span>
                      {quote.clientPhone && (
                        <span className="text-xs font-normal text-slate-500">({quote.clientPhone})</span>
                      )}
                    </div>

                    {/* Resumo de Itens */}
                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-2">
                      <strong className="text-slate-700">{quote.items.length} {quote.items.length === 1 ? 'item' : 'itens'}: </strong>
                      {itemsSummary || 'Sem descrição'}
                    </div>

                    {/* Sinal de Entrada se houver */}
                    {hasDownPayment && (
                      <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 inline-block">
                        ✓ Entrada cadastrada no orçamento: R$ {quote.downPaymentAmount?.toFixed(2)} ({quote.downPaymentMethod?.toUpperCase() || 'PIX'})
                      </div>
                    )}
                  </div>

                  {/* Lado Direito: Valores & Botão de Ação */}
                  <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 gap-3 shrink-0">
                    <div className="text-left md:text-right">
                      {quote.discountAmount > 0 && (
                        <p className="text-[11px] text-slate-400 line-through">
                          Subtotal: R$ {quote.subtotal.toFixed(2)}
                        </p>
                      )}
                      <p className="text-xs font-semibold text-slate-500">Valor Total do Orçamento</p>
                      <p className="text-xl font-black text-amber-600 tracking-tight">
                        R$ {quote.total.toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => onSelectQuote(quote)}
                      className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                    >
                      <span>Importar no PDV</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <span>
            Exibindo <strong>{filteredQuotes.length}</strong> de <strong>{quotes.length}</strong> orçamentos
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
