import React, { useState } from 'react';
import {
  X,
  Printer,
  Share2,
  Layers,
  FileText,
  ReceiptText,
  ShieldCheck,
  Download,
  Loader2,
  Calendar,
  User,
  Phone,
  Check
} from 'lucide-react';
import { Sale, CompanyInfo } from '../types';
import { downloadPdfElement } from '../utils/pdfGenerator';

interface SaleViewModalProps {
  sale: Sale;
  companyInfo: CompanyInfo;
  onClose: () => void;
  onOpenQuote?: (quoteId: string) => void;
  onOpenReceipt?: (receiptId: string) => void;
  onOpenReceivable?: (receivableId: string) => void;
}

export const SaleViewModal: React.FC<SaleViewModalProps> = ({
  sale,
  companyInfo,
  onClose,
  onOpenQuote,
  onOpenReceipt,
  onOpenReceivable,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadPdfElement('printable-sale-area', `Venda-${sale.code}-${sale.clientName || 'Cliente'}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF da venda:', error);
      alert('Ocorreu um erro ao gerar o arquivo PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

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

  const handleShare = () => {
    const summary = `*SMART VIDROS - COMPROVANTE DE VENDA*\n*Venda N°:* ${sale.code}\n*Cliente:* ${
      sale.clientName || 'Cliente'
    }\n*Data:* ${formatDate(sale.date)}\n*Total:* R$ ${(sale.total || 0).toFixed(
      2
    )}\n*Pago:* R$ ${(sale.totalPaid || 0).toFixed(2)}\n*Fiado:* R$ ${(sale.totalFiado || 0).toFixed(2)}`;

    if (navigator.share) {
      navigator.share({ title: `Venda ${sale.code}`, text: summary }).catch(() => {});
    } else {
      navigator.clipboard.writeText(summary);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
    }
  };

  const paymentLabels: Record<string, string> = {
    pix: 'PIX',
    dinheiro: 'Dinheiro',
    cartao_credito: 'Cartão de Crédito',
    cartao_debito: 'Cartão de Débito',
    transferencia: 'Transferência',
    fiado: 'Fiado / Contas a Receber',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-4 overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        
        {/* Barra Superior de Ações */}
        <div className="bg-slate-950 text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-amber-500/30 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-black text-amber-400 text-sm">{sale.code}</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
              {sale.hasChangesFromQuote ? 'Venda Editada no PDV' : 'Venda Direta'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              title="Imprimir Venda"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedText ? 'Copiado!' : 'Compartilhar'}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-md active:scale-95"
            >
              {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Baixar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVEGAÇÃO ENTRE DOCUMENTOS RELACIONADOS (#11) */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs font-bold text-slate-700 print:hidden overflow-x-auto gap-2">
          <span className="uppercase text-[10px] text-slate-500 shrink-0">Documentos Relacionados:</span>
          
          <div className="flex items-center gap-2 shrink-0">
            {sale.quoteId && onOpenQuote && (
              <button
                onClick={() => onOpenQuote(sale.quoteId!)}
                className="flex items-center gap-1 text-slate-700 hover:text-amber-600 bg-white border border-slate-300 px-2.5 py-1 rounded-md transition-colors shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>Ver Orçamento {sale.quoteCode}</span>
              </button>
            )}

            {sale.receiptId && onOpenReceipt && (
              <button
                onClick={() => onOpenReceipt(sale.receiptId!)}
                className="flex items-center gap-1 text-slate-700 hover:text-amber-600 bg-white border border-slate-300 px-2.5 py-1 rounded-md transition-colors shadow-sm"
              >
                <ReceiptText className="w-3.5 h-3.5 text-amber-500" />
                <span>Ver Recibo Emitido</span>
              </button>
            )}

            {sale.receivableId && onOpenReceivable && (
              <button
                onClick={() => onOpenReceivable(sale.receivableId!)}
                className="flex items-center gap-1 text-slate-700 hover:text-amber-600 bg-white border border-slate-300 px-2.5 py-1 rounded-md transition-colors shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Ver Contas a Receber</span>
              </button>
            )}
          </div>
        </div>

        {/* ÁREA DE IMPRESSÃO DA VENDA */}
        <div className="p-6 sm:p-10 bg-white overflow-y-auto flex-1 space-y-8 text-slate-900 font-sans" id="printable-sale-area">
          
          {/* Cabeçalho da Empresa Smart Vidros */}
          <div className="bg-slate-950 text-white rounded-xl p-6 border-b-4 border-amber-500 flex flex-col items-center justify-center text-center gap-3">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="relative w-12 h-12 flex items-center justify-center rounded-lg bg-slate-900 border border-amber-400/60 shadow-inner">
                <div className="absolute top-1 left-1.5 w-8 h-9 border-2 border-amber-500/40 rounded-sm transform -rotate-6"></div>
                <div className="absolute top-1.5 left-2.5 w-8 h-9 border-2 border-amber-400/70 rounded-sm transform -rotate-3"></div>
                <div className="relative z-10 w-8 h-9 border-2 border-amber-400 bg-amber-400/10 rounded-sm flex items-center justify-center">
                  <Layers className="w-5 h-5 text-amber-400" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="font-extrabold tracking-widest text-2xl text-amber-400">SMART</span>
                  <span className="font-light tracking-widest text-xl text-white uppercase">VIDROS</span>
                </div>
                <p className="text-[10px] text-slate-400 tracking-widest uppercase font-semibold">
                  CNPJ: {companyInfo.cnpj || '51.840.669/0001-22'}
                </p>
              </div>
            </div>

            <div className="text-center text-xs text-slate-300 space-y-0.5 pt-2 border-t border-slate-800/80 w-full">
              <p>📍 {companyInfo.address || 'Rua Projetada – Sussuapara-PI'} • {companyInfo.city || 'Picos – PI'}</p>
              <p>📞 WhatsApp: {companyInfo.phone || '(89) 9 9991-0028'} • ✉️ {companyInfo.email || 'contato.smartvidros@gmail.com'}</p>
            </div>
          </div>

          {/* Título do Documento e Dados do Cliente */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
            <div>
              <span className="text-xs font-black text-amber-600 uppercase tracking-widest block">
                Comprovante de Venda Oficial
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{sale.code}</h1>
              {sale.quoteCode && (
                <p className="text-xs text-slate-500 font-bold">
                  Gerado a partir do Orçamento: <strong className="text-slate-900">{sale.quoteCode}</strong>
                </p>
              )}
            </div>

            <div className="text-left sm:text-right text-xs space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200 w-full sm:w-auto">
              <p className="text-slate-700">
                <strong>Cliente:</strong> {sale.clientName || 'Cliente'}
              </p>
              {sale.clientPhone && (
                <p className="text-slate-700">
                  <strong>WhatsApp:</strong> {sale.clientPhone}
                </p>
              )}
              <p className="text-slate-500">
                <strong>Data da Venda:</strong> {formatDate(sale.date)}
              </p>
            </div>
          </div>

          {/* Tabela de Produtos / Serviços da Venda */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              Produtos e Serviços Adquiridos
            </h3>

            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 text-center">Medidas / Qtd</th>
                    <th className="p-2.5 text-right">Preço Un / m²</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {(sale.items || []).map((item, index) => (
                    <tr key={index}>
                      <td className="p-2.5">
                        <strong className="text-slate-900 font-bold block">{item.name}</strong>
                        {item.description && (
                          <span className="text-[10px] text-slate-500 block">{item.description}</span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        {item.type === 'dimensao' ? (
                          <span>
                            {item.lengthMm} x {item.widthMm} mm ({(item.areaM2 || 0).toFixed(3)} m²) x {item.quantity}
                          </span>
                        ) : (
                          <span>{item.quantity} un.</span>
                        )}
                      </td>
                      <td className="p-2.5 text-right">
                        R$ {((item.type === 'dimensao' ? item.pricePerM2 : item.unitPrice) || 0).toFixed(2)}
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        R$ {(item.totalPrice || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detalhamento dos Pagamentos e Totais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Formas de Pagamento Utilizadas */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Formas de Pagamento Utilizadas
              </h4>

              <div className="space-y-1.5 pt-1">
                {(sale.payments || []).map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-slate-200">
                    <span className="font-bold text-slate-800">
                      {paymentLabels[p.method] || p.method}
                      {p.notes ? ` (${p.notes})` : ''}
                    </span>
                    <span className="font-black text-slate-900">
                      R$ {(p.amount || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo Financeiro */}
            <div className="border-2 border-slate-900 rounded-xl p-4 bg-slate-950 text-white space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Subtotal dos Itens:</span>
                <span>R$ {(sale.subtotal || 0).toFixed(2)}</span>
              </div>

              {(sale.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>Desconto Aplicado:</span>
                  <span>- R$ {(sale.discountAmount || 0).toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-slate-800 pt-2 flex justify-between text-base font-black text-amber-400">
                <span>Total da Venda:</span>
                <span>R$ {(sale.total || 0).toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t border-slate-800/60 space-y-1 text-xs">
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Total Pago no Ato:</span>
                  <span>R$ {(sale.totalPaid || 0).toFixed(2)}</span>
                </div>

                {(sale.totalFiado || 0) > 0 && (
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>Fiado / A Receber:</span>
                    <span>R$ {(sale.totalFiado || 0).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Linha de Assinatura */}
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
            <div>
              <div className="w-48 mx-auto border-b border-slate-900 mb-1"></div>
              <p className="text-xs font-bold text-slate-900">{companyInfo.ownerName || 'James Clayton do Nascimento'}</p>
              <p className="text-[10px] text-slate-500">Smart Vidros</p>
            </div>

            <div>
              <div className="w-48 mx-auto border-b border-slate-900 mb-1"></div>
              <p className="text-xs font-bold text-slate-900">{sale.clientName || 'Cliente'}</p>
              <p className="text-[10px] text-slate-500">Assinatura do Cliente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
