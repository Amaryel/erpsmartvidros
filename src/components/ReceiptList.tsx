import React, { useState } from 'react';
import { Plus, Search, FileText, Trash2, Edit, Printer, Share2, Calendar, DollarSign, User, AlertTriangle, X } from 'lucide-react';
import { Receipt, CompanyInfo } from '../types';

interface ReceiptListProps {
  receipts: Receipt[];
  companyInfo: CompanyInfo;
  onNewReceipt: () => void;
  onEditReceipt: (receipt: Receipt) => void;
  onViewReceipt: (receipt: Receipt) => void;
  onDeleteReceipt: (id: string) => void;
}

export const ReceiptList: React.FC<ReceiptListProps> = ({
  receipts,
  companyInfo,
  onNewReceipt,
  onEditReceipt,
  onViewReceipt,
  onDeleteReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [deleteConfirmReceipt, setDeleteConfirmReceipt] = useState<Receipt | null>(null);

  const handleConfirmDelete = () => {
    if (deleteConfirmReceipt) {
      onDeleteReceipt(deleteConfirmReceipt.id);
      setDeleteConfirmReceipt(null);
    }
  };

  // Formatar valores para BRL
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Filtrar recibos
  const filteredReceipts = receipts.filter((r) => {
    const term = (searchTerm || '').toLowerCase();
    const matchesTerm =
      (r.clientName || '').toLowerCase().includes(term) ||
      (r.code || '').toLowerCase().includes(term) ||
      (r.service || '').toLowerCase().includes(term) ||
      (r.notes && r.notes.toLowerCase().includes(term));

    const matchesDate = selectedDate ? r.date === selectedDate : true;

    return matchesTerm && matchesDate;
  });

  // Resumo de Totais
  const totalAmount = filteredReceipts.reduce((sum, r) => sum + r.amount, 0);
  const totalCount = filteredReceipts.length;

  // Compartilhar via WhatsApp rápido
  const handleQuickWhatsApp = (r: Receipt) => {
    let text = `*${companyInfo.name || 'SMART VIDROS'} - RECIBO DE PAGAMENTO*\n`;
    text += `*${r.code}*\n`;
    text += `*Data:* ${r.date}\n`;
    text += `*Cliente:* ${r.clientName}\n`;
    text += `*Serviço:* ${r.service}\n`;
    text += `*Valor:* ${formatCurrency(r.amount)}\n`;
    if (r.downPaymentAmount && r.downPaymentAmount > 0) {
      text += `*Entrada:* ${formatCurrency(r.downPaymentAmount)}\n`;
    }
    text += `\nEmissor: ${companyInfo.ownerName || companyInfo.name} (CNPJ: ${companyInfo.cnpj || ''})`;

    const encoded = encodeURIComponent(text);
    const phoneClean = r.clientPhone ? r.clientPhone.replace(/\D/g, '') : '';
    const whatsappUrl = phoneClean
      ? `https://wa.me/55${phoneClean}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-600" /> Recibos Emitidos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie, visualize em PDF A4 e compartilhe os recibos de pagamento do seu negócio.
          </p>
        </div>

        <button
          onClick={onNewReceipt}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Criar Novo Recibo</span>
        </button>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por cliente, nº do recibo, serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Cards de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Recibos</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor Total Emitido</p>
            <p className="text-2xl font-black text-amber-600 font-mono mt-0.5">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Lista de Recibos */}
      {filteredReceipts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Nenhum recibo encontrado</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Não foram encontrados recibos com os filtros selecionados.
          </p>
          <button
            onClick={onNewReceipt}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Recibo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReceipts.map((receipt) => (
            <div
              key={receipt.id}
              className="bg-white border border-slate-200 hover:border-amber-400/80 rounded-2xl p-5 shadow-sm hover:shadow-md flex flex-col justify-between transition-all"
            >
              <div>
                {/* Linha Topo: Código e Data */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    {receipt.code}
                  </span>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {receipt.date}
                  </span>
                </div>

                {/* Cliente */}
                <div className="mb-3">
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                    {receipt.clientName}
                  </h3>
                  {receipt.clientPhone && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tel: {receipt.clientPhone}
                    </p>
                  )}
                </div>

                {/* Serviço */}
                <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">
                    Serviço Prestado
                  </p>
                  <p className="text-xs font-bold text-slate-800 line-clamp-2">
                    {receipt.service}
                  </p>
                </div>

                {/* Valor e Entrada */}
                <div className="mb-4 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-semibold">Valor Total:</span>
                    <span className="text-lg font-black text-amber-600 font-mono">
                      {formatCurrency(receipt.amount)}
                    </span>
                  </div>

                  {receipt.downPaymentAmount && receipt.downPaymentAmount > 0 && (
                    <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold">
                      <span>Entrada / Sinal:</span>
                      <span className="font-mono font-bold">
                        {formatCurrency(receipt.downPaymentAmount)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onViewReceipt(receipt)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-xl transition-colors shadow-sm"
                  title="Ver e Gerar PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Ver PDF</span>
                </button>

                <button
                  onClick={() => handleQuickWhatsApp(receipt)}
                  className="p-2 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
                  title="Enviar no WhatsApp"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onEditReceipt(receipt)}
                  className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  title="Editar Recibo"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeleteConfirmReceipt(receipt)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Excluir Recibo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Recibo */}
      {deleteConfirmReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>Confirmar Exclusão de Recibo</span>
              </div>
              <button
                onClick={() => setDeleteConfirmReceipt(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Tem certeza que deseja excluir o recibo{' '}
              <strong className="text-slate-900 font-mono font-black">{deleteConfirmReceipt.code}</strong>
              {deleteConfirmReceipt.clientName ? ` do cliente "${deleteConfirmReceipt.clientName}"` : ''}?
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 font-medium">
              ⚠️ Esta ação não poderá ser desfeita e o recibo será permanentemente excluído do sistema.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmReceipt(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-all active:scale-95"
              >
                Sim, Excluir Recibo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
