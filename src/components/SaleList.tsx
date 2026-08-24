import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Plus,
  Eye,
  Trash2,
  FileText,
  ReceiptText,
  ShieldCheck,
  Calendar,
  DollarSign,
  User,
  CreditCard
} from 'lucide-react';
import { Sale, CompanyInfo } from '../types';

interface SaleListProps {
  sales: Sale[];
  companyInfo: CompanyInfo;
  onNewSale: () => void;
  onViewSale: (sale: Sale) => void;
  onDeleteSale: (id: string) => void;
  onOpenQuote?: (quoteId: string) => void;
  onOpenReceipt?: (receiptId: string) => void;
  onOpenReceivable?: (receivableId: string) => void;
  onOpenContract?: (saleId: string) => void;
}

export const SaleList: React.FC<SaleListProps> = ({
  sales,
  companyInfo,
  onNewSale,
  onViewSale,
  onDeleteSale,
  onOpenQuote,
  onOpenReceipt,
  onOpenReceivable,
  onOpenContract,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

  const filteredSales = (sales || []).filter(Boolean).filter((s) => {
    const term = (searchTerm || '').toLowerCase();
    return (
      (s.code || '').toLowerCase().includes(term) ||
      (s.clientName && s.clientName.toLowerCase().includes(term)) ||
      (s.quoteCode && s.quoteCode.toLowerCase().includes(term))
    );
  });

  const totalVendas = (sales || []).reduce((sum, s) => sum + (s?.total || 0), 0);
  const totalRecebidoAto = (sales || []).reduce((sum, s) => sum + (s?.totalPaid || 0), 0);
  const totalFiado = (sales || []).reduce((sum, s) => sum + (s?.totalFiado || 0), 0);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      if (dateStr.includes('T')) {
        return new Date(dateStr).toLocaleDateString('pt-BR');
      }
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho da Seção de Vendas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Vendas & PDV</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Histórico completo de vendas efetuadas, orçamentos convertidos, pagamentos e fiado
          </p>
        </div>

        <button
          onClick={onNewSale}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Abrir PDV / Nova Venda</span>
        </button>
      </div>

      {/* Cards de Métricas do Módulo de Vendas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950 text-white p-4 rounded-xl border border-slate-800 shadow-md">
          <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider block">
            Volume Total Vendido
          </span>
          <span className="text-2xl font-black text-white mt-1 block">
            {totalVendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">{sales.length} venda(s) registrada(s)</span>
        </div>

        <div className="bg-emerald-950/80 text-white p-4 rounded-xl border border-emerald-800 shadow-md">
          <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider block">
            Recebido no Ato
          </span>
          <span className="text-2xl font-black text-emerald-300 mt-1 block">
            {totalRecebidoAto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <span className="text-[10px] text-emerald-200/70 font-semibold">Pagamentos PIX / Dinheiro / Cartão</span>
        </div>

        <div className="bg-amber-950/80 text-white p-4 rounded-xl border border-amber-800 shadow-md">
          <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider block">
            Fiado / Contas a Receber
          </span>
          <span className="text-2xl font-black text-amber-300 mt-1 block">
            {totalFiado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <span className="text-[10px] text-amber-200/70 font-semibold">Lançados no Contas a Receber</span>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar venda por código, nome do cliente ou orçamento..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-sm"
        />
      </div>

      {/* Lista / Tabela de Vendas */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-sm font-semibold">Nenhuma venda encontrada.</p>
            <p className="text-xs text-slate-500">
              Aprove e converta um orçamento em venda ou abra o PDV para realizar uma nova venda direta.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Código Venda</th>
                  <th className="p-3.5">Cliente</th>
                  <th className="p-3.5">Data</th>
                  <th className="p-3.5 text-right">Total Venda</th>
                  <th className="p-3.5 text-right">Pago no Ato</th>
                  <th className="p-3.5 text-right">Fiado</th>
                  <th className="p-3.5 text-center">Documentos Vinculados</th>
                  <th className="p-3.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <span className="font-extrabold text-slate-900 block">{sale.code}</span>
                      {sale.quoteCode && (
                        <span className="text-[10px] text-amber-600 font-bold block">
                          Origem: {sale.quoteCode}
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <strong className="text-slate-900 block">{sale.clientName || 'Cliente'}</strong>
                      {sale.clientPhone && (
                        <span className="text-[10px] text-slate-500 block">{sale.clientPhone}</span>
                      )}
                    </td>

                    <td className="p-3.5 text-slate-600">
                      {formatDate(sale.date)}
                    </td>

                    <td className="p-3.5 text-right font-black text-slate-900 text-sm">
                      R$ {(sale.total || 0).toFixed(2)}
                    </td>

                    <td className="p-3.5 text-right font-bold text-emerald-600">
                      R$ {(sale.totalPaid || 0).toFixed(2)}
                    </td>

                    <td className="p-3.5 text-right font-bold text-amber-600">
                      {(sale.totalFiado || 0) > 0 ? `R$ ${(sale.totalFiado || 0).toFixed(2)}` : '—'}
                    </td>

                    {/* Vínculos com Orçamento, Recibo e Contas a Receber (#11) */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {sale.quoteId && onOpenQuote && (
                          <button
                            onClick={() => onOpenQuote(sale.quoteId!)}
                            className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300 px-2 py-0.5 rounded hover:bg-amber-100 transition-colors"
                            title="Ver Orçamento de Origem"
                          >
                            Orçamento
                          </button>
                        )}

                        {sale.receiptId && onOpenReceipt && (
                          <button
                            onClick={() => onOpenReceipt(sale.receiptId!)}
                            className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-300 px-2 py-0.5 rounded hover:bg-blue-100 transition-colors"
                            title="Ver Recibo Emitido"
                          >
                            Recibo
                          </button>
                        )}

                        {sale.receivableId && onOpenReceivable && (
                          <button
                            onClick={() => onOpenReceivable(sale.receivableId!)}
                            className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-300 px-2 py-0.5 rounded hover:bg-purple-100 transition-colors"
                            title="Ver Lançamento no Contas a Receber"
                          >
                            A Receber
                          </button>
                        )}

                        {onOpenContract && (
                          <button
                            onClick={() => onOpenContract(sale.id)}
                            className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-400 px-2 py-0.5 rounded hover:bg-amber-200 transition-colors"
                            title="Ver ou Gerar Contrato desta Venda"
                          >
                            Contrato
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onViewSale(sale)}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-400 p-1.5 rounded-lg transition-colors"
                          title="Visualizar / PDF da Venda"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setSaleToDelete(sale)}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition-colors"
                          title="Excluir Venda"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {saleToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Excluir Venda</h3>
                <p className="text-xs text-slate-500 font-semibold">{saleToDelete.code}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Tem certeza que deseja excluir o registro da venda <strong className="text-slate-900 font-bold">{saleToDelete.code}</strong> no valor de <strong className="text-slate-900 font-bold">R$ {(saleToDelete.total || 0).toFixed(2)}</strong>?
              {saleToDelete.receivableId && (
                <span className="block mt-1 text-amber-700 font-semibold bg-amber-50 p-2 rounded border border-amber-200">
                  ⚠️ O lançamento associado no Contas a Receber também será removido.
                </span>
              )}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSaleToDelete(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteSale(saleToDelete.id);
                  setSaleToDelete(null);
                }}
                className="py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
