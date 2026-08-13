import React, { useState } from 'react';
import { X, Printer, Share2, Layers, Copy, Check, Edit, FileText, Download, Loader2, ShoppingBag, ShieldCheck, Calendar } from 'lucide-react';
import { Receipt, CompanyInfo, Sale, Receivable, PaymentMethod } from '../types';
import { numberToWordsBRL, formatDateExtenso } from '../utils/numberToWords';
import { downloadPdfElement } from '../utils/pdfGenerator';
import { getSales, getReceivables, getQuotes } from '../services/storage';

interface ReceiptViewModalProps {
  receipt: Receipt;
  companyInfo: CompanyInfo;
  onClose: () => void;
  onEdit: (receipt: Receipt) => void;
  onOpenSale?: (saleId: string) => void;
  onOpenReceivable?: (receivableId: string) => void;
  onOpenQuote?: (quoteId: string) => void;
}

export const ReceiptViewModal: React.FC<ReceiptViewModalProps> = ({
  receipt,
  companyInfo,
  onClose,
  onEdit,
  onOpenSale,
  onOpenReceivable,
  onOpenQuote,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const ownerName = companyInfo.ownerName || 'James Clayton do Nascimento';
  const cnpj = companyInfo.cnpj || '51.840.669/0001-22';
  const city = companyInfo.city || 'Picos – PI';

  const clientNameUpper = receipt.clientName ? receipt.clientName.trim().toUpperCase() : 'CLIENTE';
  const amountFormatted = receipt.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const amountExtenso = numberToWordsBRL(receipt.amount);
  const serviceUpper = receipt.service ? receipt.service.trim().toUpperCase() : 'SERVIÇOS DE VIDRAÇARIA';
  const dateExtenso = formatDateExtenso(receipt.date);

  // Buscar Venda, Orçamento e Contas a Receber associados para detalhamento financeiro
  const allSales = getSales();
  const allReceivables = getReceivables();
  const allQuotes = getQuotes();

  const associatedSale: Sale | undefined = allSales.find(
    (s) => (receipt.saleId && s.id === receipt.saleId) || (receipt.saleCode && s.code === receipt.saleCode)
  );

  const associatedQuote = allQuotes.find(
    (q) =>
      (receipt.quoteId && q.id === receipt.quoteId) ||
      (receipt.quoteCode && q.code === receipt.quoteCode) ||
      (associatedSale && q.id === associatedSale.quoteId)
  );

  const associatedReceivable: Receivable | undefined = allReceivables.find(
    (r) =>
      (receipt.receivableId && r.id === receipt.receivableId) ||
      (associatedSale && r.saleId === associatedSale.id) ||
      (receipt.saleCode && r.saleCode === receipt.saleCode)
  );

  const serviceDeliveryDate = receipt.deliveryDate || associatedSale?.deliveryDate || associatedQuote?.deliveryDate;

  const methodLabels: Record<PaymentMethod, string> = {
    pix: 'PIX',
    dinheiro: 'Dinheiro',
    cartao_credito: 'Cartão de Crédito',
    cartao_debito: 'Cartão de Débito',
    transferencia: 'Transferência Bancária',
    fiado: 'Fiado / A Receber',
  };

  // Tratar entrada se houver
  let downPaymentStr: string | null = null;
  if (receipt.downPaymentAmount && receipt.downPaymentAmount > 0) {
    if (receipt.downPaymentType === 'percent' && receipt.downPaymentValue) {
      downPaymentStr = `com entrada de ${receipt.downPaymentValue}% do valor total`;
    } else {
      const dpFormatted = receipt.downPaymentAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const dpExtenso = numberToWordsBRL(receipt.downPaymentAmount);
      downPaymentStr = `com entrada de ${dpFormatted} (${dpExtenso})`;
    }
  }

  // Texto completo padronizado
  let fullDeclarationText = `Eu, ${ownerName}, inscrito no CNPJ sob o n° ${cnpj}, declaro, para os devidos fins, que recebi de ${clientNameUpper}, a importância de ${amountFormatted} (${amountExtenso}), referente a ${serviceUpper}`;

  if (downPaymentStr) {
    fullDeclarationText += `, ${downPaymentStr}`;
  }

  fullDeclarationText += `, realizados no dia ${dateExtenso}.`;

  // Baixar arquivo PDF A4 real
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    const clientClean = receipt.clientName ? receipt.clientName.replace(/[^a-zA-Z0-9]/g, '_') : 'Cliente';
    const filename = `Recibo_${receipt.code}_${clientClean}.pdf`;

    await downloadPdfElement('printable-receipt-area', filename);
    setIsGeneratingPdf(false);
  };

  // Impressão A4
  const handlePrint = () => {
    window.print();
  };

  // Copiar WhatsApp
  const handleCopyWhatsApp = () => {
    let msg = `*${companyInfo.name || 'SMART VIDROS'} - ${receipt.code}*\n`;
    msg += `-----------------------------------\n`;
    msg += `${fullDeclarationText}\n\n`;
    msg += `*Emissor:* ${ownerName}\n`;
    msg += `*CNPJ:* ${cnpj}\n`;
    msg += `*Contato:* ${companyInfo.phone || ''}`;

    navigator.clipboard.writeText(msg);
    setCopiedText('whatsapp');
    setTimeout(() => setCopiedText(null), 3000);
  };

  // Copiar Texto Puro
  const handleCopyText = () => {
    const text = `${receipt.code}\n\n${fullDeclarationText}\n\nAssinatura:\n_____________________________________\n${ownerName}\n${city}, ${dateExtenso}`;
    navigator.clipboard.writeText(text);
    setCopiedText('text');
    setTimeout(() => setCopiedText(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      
      {/* Container Principal */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-auto overflow-hidden text-slate-900 flex flex-col max-h-[92vh]">
        
        {/* Barra Superior do Modal (Oculta na Impressão) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-amber-500/30 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md">
              {receipt.code}
            </span>
            <span className="text-xs text-slate-300 font-medium hidden sm:inline">
              Recibo Oficial de Pagamento
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWhatsApp}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              title="Copiar WhatsApp"
            >
              {copiedText === 'whatsapp' ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">Copiar WhatsApp</span>
            </button>

            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              title="Copiar Texto"
            >
              {copiedText === 'text' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">Copiar Texto</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-md active:scale-95"
              title="Baixar arquivo PDF A4 diretamente no dispositivo"
            >
              {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin text-amber-950" /> : <Download className="w-4 h-4" />}
              <span>{isGeneratingPdf ? 'Gerando...' : 'Baixar PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95"
              title="Abrir diálogo de impressão do navegador"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Links para Documentos Relacionados */}
        {(receipt.saleId || receipt.receivableId || receipt.quoteId) && (
          <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center justify-between text-xs font-bold text-slate-700 print:hidden overflow-x-auto gap-2 shrink-0">
            <span className="uppercase text-[10px] text-slate-500 shrink-0">Documentos Relacionados:</span>
            <div className="flex items-center gap-2 shrink-0">
              {receipt.saleId && onOpenSale && (
                <button
                  onClick={() => onOpenSale(receipt.saleId!)}
                  className="flex items-center gap-1 text-slate-700 hover:text-amber-600 bg-white border border-slate-300 px-2.5 py-1 rounded-md transition-colors shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ver Venda {receipt.saleCode}</span>
                </button>
              )}

              {receipt.quoteId && onOpenQuote && (
                <button
                  onClick={() => onOpenQuote(receipt.quoteId!)}
                  className="flex items-center gap-1 text-slate-700 hover:text-amber-600 bg-white border border-slate-300 px-2.5 py-1 rounded-md transition-colors shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ver Orçamento {receipt.quoteCode}</span>
                </button>
              )}

              {receipt.receivableId && onOpenReceivable && (
                <button
                  onClick={() => onOpenReceivable(receipt.receivableId!)}
                  className="flex items-center gap-1 text-slate-700 hover:text-amber-600 bg-white border border-slate-300 px-2.5 py-1 rounded-md transition-colors shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ver Contas a Receber</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ÁREA DE IMPRESSÃO A4 */}
        <div className="p-5 sm:p-8 bg-white overflow-y-auto flex-1 text-slate-900 font-sans print:p-2" id="printable-receipt-area">
          
          {/* Cabeçalho Centralizado da Empresa Smart Vidros */}
          <div className="bg-slate-950 text-white rounded-xl p-4 sm:p-5 border-b-4 border-amber-500 text-center mb-4">
            <div className="flex flex-col items-center justify-center gap-1.5 mb-2">
              <div className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-slate-900 border border-amber-400/60 shadow-inner">
                <div className="absolute top-1 left-1.5 w-7 h-8 border-2 border-amber-500/40 rounded-sm transform -rotate-6"></div>
                <div className="absolute top-1.5 left-2 w-7 h-8 border-2 border-amber-400/70 rounded-sm transform -rotate-3"></div>
                <div className="relative z-10 w-7 h-8 border-2 border-amber-400 bg-amber-400/10 rounded-sm flex items-center justify-center">
                  <Layers className="w-4 h-4 text-amber-400" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="font-extrabold tracking-widest text-xl text-amber-400">SMART</span>
                  <span className="font-light tracking-widest text-lg text-white uppercase">VIDROS</span>
                </div>
                <p className="text-xs text-amber-200/90 font-semibold tracking-wide">
                  {ownerName}
                </p>
                <p className="text-[11px] text-slate-400">
                  CNPJ: {cnpj}
                </p>
              </div>
            </div>

            <div className="text-center text-xs text-slate-300 pt-2 border-t border-slate-800/80 w-full">
              <p className="mb-0.5">📍 {companyInfo.address || 'Rua Projetada – Sussuapara-PI'} • {city}</p>
              <p>📞 WhatsApp: {companyInfo.phone || '(89) 9 9991-0028'} • ✉️ {companyInfo.email || 'contato.smartvidros@gmail.com'}</p>
            </div>
          </div>

          {/* Destaque do Código, Entrega e Valor em Tabela Inquebrável */}
          <div className="bg-slate-900 text-white rounded-xl p-4 mb-4 border-l-4 border-amber-400">
            <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', margin: 0 }}>
              <tbody>
                <tr>
                  <td style={{ border: 'none', padding: '0 8px 0 0', verticalAlign: 'middle', width: '33%', textAlign: 'left' }}>
                    <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                      Identificação do Recibo
                    </span>
                    <span className="text-base font-black font-mono text-white block">
                      {receipt.code}
                    </span>
                  </td>

                  {serviceDeliveryDate ? (
                    <td style={{ border: 'none', padding: '0 8px', verticalAlign: 'middle', width: '34%', textAlign: 'center' }}>
                      <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                        Data Prevista de Entrega
                      </span>
                      <span className="text-xs font-bold text-slate-200 font-mono block">
                        {formatDateExtenso(serviceDeliveryDate)} ({serviceDeliveryDate.split('-').reverse().join('/')})
                      </span>
                    </td>
                  ) : (
                    <td style={{ border: 'none', width: '34%' }}></td>
                  )}

                  <td style={{ border: 'none', padding: '0 0 0 8px', verticalAlign: 'middle', width: '33%', textAlign: 'right' }}>
                    <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                      Valor Recebido
                    </span>
                    <span className="text-xl font-black font-mono text-emerald-400 block">
                      {amountFormatted}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Texto do Recibo Oficial */}
          <div className="bg-white border-2 border-slate-900 rounded-xl p-4 sm:p-5 shadow-xs mb-4">
            <div className="border-b-2 border-slate-900 pb-2 mb-3 text-center">
              <h2 className="text-lg font-black uppercase tracking-widest text-slate-900">
                RECIBO DE PAGAMENTO
              </h2>
            </div>

            <p className="text-sm text-slate-900 leading-relaxed text-justify font-normal mb-3">
              Eu, <strong className="font-bold text-slate-900">{ownerName}</strong>, inscrito no CNPJ sob o n° <strong className="font-bold text-slate-900">{cnpj}</strong>, declaro, para os devidos fins, que recebi de <strong className="font-extrabold text-slate-900 uppercase">{clientNameUpper}</strong>, a importância de <strong className="font-bold text-slate-900">{amountFormatted} ({amountExtenso})</strong>, referente a <strong className="font-bold text-slate-900 uppercase">{serviceUpper}</strong>
              {downPaymentStr ? (
                <span>, <strong className="font-bold text-slate-900">{downPaymentStr}</strong></span>
              ) : null}
              , realizados no dia <strong className="font-bold text-slate-900">{dateExtenso}</strong>.
            </p>

            {receipt.notes && (
              <div className="pt-2.5 border-t border-slate-200 text-xs text-slate-700 italic">
                <strong className="not-italic text-slate-900 font-bold">Observações do Recibo:</strong> {receipt.notes}
              </div>
            )}
          </div>

          {/* Resumo Financeiro da Venda, Formas de Pagamento & Parcelas */}
          {(receipt.saleTotalAmount !== undefined || receipt.paymentMethodsSummary || associatedSale || associatedReceivable) && (
            <div className="border border-slate-300 rounded-xl overflow-hidden text-xs mb-4">
              <div className="bg-slate-900 text-amber-400 font-bold uppercase text-[11px] tracking-wider px-4 py-2.5 flex items-center justify-between">
                <span>Situação Financeira da Venda</span>
                {associatedSale?.code && (
                  <span className="text-white font-mono text-xs">
                    Venda Nº {associatedSale.code}
                  </span>
                )}
              </div>

              {/* Tabela Unificada de Valores */}
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }} className="bg-slate-50 text-xs">
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td className="py-2.5 px-4 font-bold uppercase text-[10px] text-slate-800">Valor Total da Venda</td>
                    <td className="py-2.5 px-4 text-right font-mono font-black text-slate-900 text-sm">
                      R$ {(associatedSale?.total ?? receipt.saleTotalAmount ?? receipt.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td className="py-2.5 px-4 font-bold uppercase text-[10px] text-emerald-900">Valor Pago / Entrada</td>
                    <td className="py-2.5 px-4 text-right font-mono font-black text-emerald-800 text-sm">
                      R$ {(associatedSale?.totalPaid ?? receipt.salePaidAmount ?? receipt.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold uppercase text-[10px] text-slate-800">
                      {((associatedSale?.totalFiado ?? receipt.saleFiadoAmount ?? 0) > 0) ? 'Valor a Receber (Fiado)' : 'Status da Quitação'}
                    </td>
                    <td className={`py-2.5 px-4 text-right font-mono font-black text-sm ${((associatedSale?.totalFiado ?? receipt.saleFiadoAmount ?? 0) > 0) ? 'text-amber-800' : 'text-emerald-700'}`}>
                      {((associatedSale?.totalFiado ?? receipt.saleFiadoAmount ?? 0) > 0)
                        ? `R$ ${(associatedSale?.totalFiado ?? receipt.saleFiadoAmount ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : 'TOTALMENTE QUITADO'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Formas de Pagamento Utilizadas */}
              {associatedSale?.payments && associatedSale.payments.length > 0 && (
                <div className="border-t border-slate-300">
                  <div className="bg-slate-800 text-white font-bold uppercase text-[10px] px-4 py-1.5">
                    Formas de Pagamento Utilizadas
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }} className="bg-white text-xs">
                    <tbody>
                      {associatedSale.payments.map((p, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td className="py-2 px-4 font-semibold text-slate-800">{methodLabels[p.method] || p.method}</td>
                          <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">
                            R$ {p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Parcelas Registradas */}
              {associatedReceivable?.installments && associatedReceivable.installments.length > 0 && (
                <div className="border-t border-slate-300">
                  <div className="bg-slate-900 text-amber-400 font-bold uppercase text-[10px] px-4 py-1.5">
                    Parcelas Registradas
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }} className="bg-white text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-1.5 px-4">Parcela</th>
                        <th className="py-1.5 px-4">Valor (R$)</th>
                        <th className="py-1.5 px-4">Vencimento</th>
                        <th className="py-1.5 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="font-medium">
                      {associatedReceivable.installments.map((inst) => {
                        const [year, month, day] = inst.dueDate.split('-');
                        return (
                          <tr key={inst.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td className="py-1.5 px-4 font-bold text-slate-900">
                              Parcela {String(inst.number).padStart(2, '0')}
                            </td>
                            <td className="py-1.5 px-4 font-mono font-bold text-slate-900">
                              R$ {inst.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-1.5 px-4 font-mono text-slate-600">
                              {`${day}/${month}/${year}`}
                            </td>
                            <td className="py-1.5 px-4 text-right font-bold">
                              <span className={inst.status === 'pago' ? 'text-emerald-700' : inst.status === 'parcial' ? 'text-amber-700' : 'text-slate-600'}>
                                {inst.status === 'pago' ? 'PAGO' : inst.status === 'parcial' ? 'PARCIAL' : 'PENDENTE'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Linha de Assinatura e Data */}
          <div className="pt-6 text-center break-inside-avoid mt-6">
            <div className="w-64 border-b border-slate-900 mx-auto mb-2"></div>
            <p className="text-sm font-bold text-slate-900">{ownerName}</p>
            <p className="text-xs text-slate-500">Smart Vidros — CNPJ: {cnpj}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">{city}, {dateExtenso}</p>
          </div>
        </div>

        {/* Rodapé das Ações no Modal (Oculto na Impressão) */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3 print:hidden shrink-0">
          <button
            onClick={() => onEdit(receipt)}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            <Edit className="w-3.5 h-3.5 text-amber-600" />
            <span>Editar Recibo</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-300 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isGeneratingPdf ? 'Gerando PDF A4...' : 'Baixar PDF (A4)'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-amber-600" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
