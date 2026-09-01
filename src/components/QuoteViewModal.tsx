import React, { useState } from 'react';
import { X, Printer, Share2, Layers, Check, Edit, ArrowRightLeft, Download, Loader2, Calendar, Home, Sliders } from 'lucide-react';
import { Quote, CompanyInfo, QuoteItem } from '../types';
import { downloadPdfElement } from '../utils/pdfGenerator';
import { TechnicalProductPreview } from './TechnicalProductPreview';

interface QuoteViewModalProps {
  quote: Quote;
  companyInfo: CompanyInfo;
  onClose: () => void;
  onEdit: (quote: Quote) => void;
  onApproveQuote?: (quoteId: string) => void;
  onConvertToSale: (quoteId: string) => void;
}

export const QuoteViewModal: React.FC<QuoteViewModalProps> = ({
  quote,
  companyInfo,
  onClose,
  onEdit,
  onApproveQuote,
  onConvertToSale,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Baixar arquivo PDF A4 real
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    const clientClean = quote.clientName ? quote.clientName.replace(/[^a-zA-Z0-9]/g, '_') : 'Cliente';
    const filename = `Orcamento_${quote.code}_${clientClean}.pdf`;

    await downloadPdfElement('printable-quote-area', filename);
    setIsGeneratingPdf(false);
  };

  // Impressão limpa A4 em janela/PDF
  const handlePrint = () => {
    window.print();
  };

  // Agrupar itens por Ambiente
  const environmentGroups: Record<string, QuoteItem[]> = {};
  (quote.items || []).forEach((item) => {
    const env = (item.environment || 'Geral').toUpperCase();
    if (!environmentGroups[env]) {
      environmentGroups[env] = [];
    }
    environmentGroups[env].push(item);
  });

  // Copiar resumo formatado para o WhatsApp
  const handleCopyWhatsApp = () => {
    let msg = `*${companyInfo.name || 'SMART VIDROS'} - ORÇAMENTO ${quote.code}*\n`;
    msg += `-----------------------------------\n`;
    msg += `*Cliente:* ${quote.clientName || 'Não informado'}\n`;
    msg += `*Data:* ${new Date(quote.date + 'T00:00:00').toLocaleDateString('pt-BR')}\n`;
    if (quote.deliveryDate) {
      msg += `*Previsão de Entrega:* ${new Date(quote.deliveryDate + 'T00:00:00').toLocaleDateString('pt-BR')}\n`;
    }
    msg += `\n*ITENS DO ORÇAMENTO POR AMBIENTE:*\n`;

    Object.entries(environmentGroups).forEach(([envName, envItems]) => {
      msg += `\n📍 *AMBIENTE: ${envName}*\n`;
      envItems.forEach((item, idx) => {
        msg += `  ${idx + 1}. *${item.name}*\n`;
        if (item.type === 'dimensao') {
          msg += `     Área: ${item.areaM2}m² | Qtd: ${item.quantity} ${item.quantity > 1 ? 'peças' : 'peça'}\n`;
          if (item.glassType || item.glassColor) {
            msg += `     Vidro: ${item.glassType || 'Temperado'} ${item.thickness || '8mm'} ${item.glassColor || 'Incolor'}\n`;
          }
          msg += `     Valor m²: R$ ${(item.pricePerM2 || 0).toFixed(2)} -> *Total: R$ ${item.totalPrice.toFixed(2)}*\n`;
        } else {
          msg += `     Qtd: ${item.quantity} un x R$ ${(item.unitPrice || 0).toFixed(2)} -> *Total: R$ ${item.totalPrice.toFixed(2)}*\n`;
        }
      });
    });

    msg += `\n-----------------------------------\n`;
    msg += `*Subtotal:* R$ ${quote.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    if (quote.discountAmount > 0) {
      msg += `*Desconto:* - R$ ${quote.discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    }
    msg += `*VALOR TOTAL:* R$ ${quote.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;

    if (quote.downPaymentAmount && quote.downPaymentAmount > 0) {
      msg += `*Entrada / Sinal:* R$ ${quote.downPaymentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    }

    if (quote.notes) {
      msg += `\n*Observações:* ${quote.notes}\n`;
    }

    msg += `\n-----------------------------------\n`;
    msg += `Contato: ${companyInfo.phone} | ${companyInfo.email}`;

    navigator.clipboard.writeText(msg);
    setCopiedText('whatsapp');
    setTimeout(() => setCopiedText(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      
      {/* Container Principal do Documento */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-auto overflow-hidden text-slate-900 flex flex-col max-h-[94vh]">
        
        {/* Barra Superior do Modal (Oculta na Impressão) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-amber-500/30 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md">
              {quote.code}
            </span>
            <span className="text-xs text-slate-300 font-medium hidden sm:inline">
              Visualização de Orçamento A4 Comercial & Técnico
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWhatsApp}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              title="Copiar texto formatado para enviar no WhatsApp"
            >
              {copiedText === 'whatsapp' ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">Copiar WhatsApp</span>
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

        {/* ÁREA IMPRESSA (A4 FORMAT) */}
        <div className="p-5 sm:p-8 bg-white overflow-y-auto flex-1 text-slate-900 font-sans print:p-2 notranslate" translate="no" id="printable-quote-area">
          
          {/* Cabeçalho Visual Identidade Smart Vidros */}
          <div className="bg-slate-950 text-white rounded-xl p-4 sm:p-5 border-b-4 border-amber-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 notranslate" translate="no">
            
            <div className="flex items-center gap-3 notranslate" translate="no">
              {/* Logo Vidros */}
              <div className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-slate-900 border border-amber-400/60 shadow-inner">
                <div className="absolute top-1 left-1.5 w-7 h-8 border-2 border-amber-500/40 rounded-sm transform -rotate-6"></div>
                <div className="absolute top-1.5 left-2 w-7 h-8 border-2 border-amber-400/70 rounded-sm transform -rotate-3"></div>
                <div className="relative z-10 w-7 h-8 border-2 border-amber-400 bg-amber-400/10 rounded-sm flex items-center justify-center">
                  <Layers className="w-4 h-4 text-amber-400" />
                </div>
              </div>

              <div className="notranslate" translate="no">
                <div className="flex items-baseline gap-1.5 notranslate" translate="no">
                  <span className="font-extrabold tracking-widest text-xl text-amber-400 notranslate" translate="no">SMART</span>
                  <span className="font-light tracking-widest text-lg text-white uppercase notranslate" translate="no">VIDROS</span>
                </div>
                <p className="text-xs text-amber-200/90 font-semibold tracking-wide notranslate" translate="no">
                  {companyInfo.ownerName || 'James Clayton do Nascimento'}
                </p>
                <p className="text-[11px] text-slate-400 notranslate" translate="no">
                  CNPJ: {companyInfo.cnpj || '51.840.669/0001-22'}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-300 space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800 w-full sm:w-auto">
              <div className="font-bold text-amber-400 uppercase text-xs tracking-wider mb-0.5">
                PROPOSTA / ORÇAMENTO COMERCIAL
              </div>
              <p>📍 {companyInfo.address || 'Rua Projetada – Sussuapara-PI'} • {companyInfo.city || 'Picos – PI'}</p>
              <p>📞 WhatsApp: {companyInfo.phone || '(89) 9 9991-0028'}</p>
              <p>✉️ {companyInfo.email || 'contato.smartvidros@gmail.com'}</p>
            </div>
          </div>

          {/* Dados do Orçamento e Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-3.5 text-xs mb-4">
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] block mb-0.5">Dados do Cliente:</span>
              <p className="text-sm font-black text-slate-900">{quote.clientName || 'Cliente não informado'}</p>
              {quote.clientPhone && <p className="text-slate-600 font-medium">Tel / WhatsApp: {quote.clientPhone}</p>}
            </div>

            <div className="sm:text-right">
              <span className="text-slate-400 uppercase font-bold text-[10px] block mb-0.5">Documento:</span>
              <p className="text-sm font-black text-amber-600 font-mono">{quote.code}</p>
              <p className="text-slate-600 font-medium">Data: {new Date(quote.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
              {quote.deliveryDate && (
                <p className="text-amber-800 font-bold flex items-center sm:justify-end gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-amber-600" />
                  <span>Entrega Prevista: {new Date(quote.deliveryDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                </p>
              )}
              <p className="text-slate-500 capitalize">Status: <span className="font-bold text-slate-800">{quote.status}</span></p>
            </div>
          </div>

          {/* ITENS DO ORÇAMENTO ORGANIZADOS POR AMBIENTE */}
          <div className="space-y-4 mb-4">
            {Object.entries(environmentGroups).map(([envName, envItems]) => (
              <div key={envName} className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                {/* Header do Ambiente */}
                <div className="bg-slate-900 text-amber-400 px-3.5 py-2 font-black text-xs uppercase tracking-wider flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-amber-400" />
                    <span>AMBIENTE: {envName}</span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-semibold lowercase">
                    {envItems.length} {envItems.length > 1 ? 'itens' : 'item'}
                  </span>
                </div>

                {/* Tabela do Ambiente */}
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[9.5px] border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 w-8">#</th>
                      <th className="py-2 px-3">Item / Especificações Técnicas</th>
                      <th className="py-2 px-3 text-center pdf-hidden">Medidas (mm)</th>
                      <th className="py-2 px-3 text-center">Área (m²) / Qtd</th>
                      <th className="py-2 px-3 text-right">Valor Unit / m²</th>
                      <th className="py-2 px-3 text-right">Total (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {envItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 break-inside-avoid">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-400 align-top text-xs">
                          {idx + 1}
                        </td>

                        <td className="py-2.5 px-3 align-top">
                          <div className="flex items-start gap-3">
                            {/* Ilustração Técnica Vetorial 2D (se for produto com dimensões) */}
                            {item.type === 'dimensao' && (
                              <div className="w-24 shrink-0 hidden sm:block">
                                <TechnicalProductPreview
                                  item={item}
                                  widthMm={item.widthMm}
                                  heightMm={item.lengthMm}
                                  name={item.name}
                                  compact={true}
                                  className="w-full"
                                />
                              </div>
                            )}

                            <div className="space-y-1">
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">{item.name}</div>
                              
                              {/* Características Técnicas Estruturadas */}
                              {item.type === 'dimensao' && (
                                <div className="flex flex-wrap gap-1 text-[10.5px]">
                                  {item.glassType && (
                                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                                      Vidro {item.glassType} {item.thickness || '8mm'} {item.glassColor || 'Incolor'}
                                    </span>
                                  )}
                                  {item.hardwareColor && (
                                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                                      Ferragens: {item.hardwareColor}
                                    </span>
                                  )}
                                  {item.line && (
                                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                                      Linha: {item.line}
                                    </span>
                                  )}
                                  {item.openingType && (
                                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                                      {item.openingType}
                                    </span>
                                  )}
                                  {item.finish && (
                                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                                      {item.finish}
                                    </span>
                                  )}
                                </div>
                              )}

                              {item.description && (
                                <div className="text-[11px] text-slate-500 italic">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Coluna Medidas mm (Oculta no PDF do Cliente conforme regra solicitada) */}
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700 pdf-hidden align-top">
                          {item.type === 'dimensao' ? (
                            <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px] whitespace-nowrap">
                              {item.widthMm} x {item.lengthMm} mm
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>

                        {/* Área m² ou Quantidade */}
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-800 align-top">
                          {item.type === 'dimensao' ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="font-black text-slate-900 text-xs">{item.areaM2} m²</span>
                              <span className="text-[10px] text-slate-500">
                                ({item.quantity} {item.quantity > 1 ? 'peças' : 'peça'})
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-slate-900 text-xs">{item.quantity} un</span>
                          )}
                        </td>

                        {/* Valor Unitário ou m² */}
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700 align-top text-xs">
                          R$ {item.type === 'dimensao' ? (item.pricePerM2 || 0).toFixed(2) : (item.unitPrice || 0).toFixed(2)}
                        </td>

                        {/* Total do Item */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 align-top text-xs">
                          R$ {item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Totais do Orçamento */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4 break-inside-avoid totals-box">
            <div className="text-xs text-slate-500 max-w-md">
              {quote.notes && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-amber-900">
                  <span className="font-bold block text-[11px] uppercase mb-0.5">Observações Comerciais:</span>
                  <p className="whitespace-pre-line text-[11.5px]">{quote.notes}</p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 w-full sm:w-80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal dos Produtos:</span>
                <span className="font-mono font-bold text-slate-900">
                  R$ {quote.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {quote.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Desconto ({quote.discountType === 'percent' ? `${quote.discountValue}%` : 'R$'}):</span>
                  <span className="font-mono">
                    - R$ {quote.discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-900 font-black text-xs pt-2 border-t border-slate-300">
                <span>VALOR TOTAL DO ORÇAMENTO:</span>
                <span className="font-mono text-slate-950 font-black text-sm">
                  R$ {quote.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {quote.downPaymentAmount && quote.downPaymentAmount > 0 ? (
                <div className="space-y-1.5 pt-2 border-t border-dashed border-amber-300 bg-amber-50 p-2.5 rounded-lg mt-1">
                  <div className="flex justify-between text-amber-900 font-bold text-[11px]">
                    <span>(-) Entrada / Sinal {quote.downPaymentMethod ? `(${quote.downPaymentMethod.toUpperCase()})` : ''}:</span>
                    <span className="font-mono text-emerald-700">
                      - R$ {quote.downPaymentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-900 font-black text-xs pt-1 border-t border-amber-200">
                    <span>(=) SALDO RESTANTE A PAGAR:</span>
                    <span className="font-mono text-amber-700 text-sm font-black">
                      R$ {Math.max(0, quote.total - quote.downPaymentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* TERMOS E APROVAÇÃO DO ORÇAMENTO */}
          <div className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50/50 space-y-3 break-inside-avoid">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Validade do Orçamento: <strong className="text-amber-600">15 dias</strong>
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {companyInfo.city || 'Picos – PI'}, {new Date(quote.date + 'T00:00:00').toLocaleDateString('pt-BR')}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              Este documento é uma proposta comercial referente aos produtos e serviços discriminados acima. Após a aprovação do cliente, as medidas finais serão confirmadas para início da execução/produção.
            </p>

            {/* Linhas de Assinatura */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
              <div>
                <div className="w-48 mx-auto border-b border-slate-900 mb-1"></div>
                <p className="text-xs font-bold text-slate-900">{companyInfo.ownerName || 'James Clayton do Nascimento'}</p>
                <p className="text-[10px] text-slate-500">Smart Vidros</p>
              </div>

              <div>
                <div className="w-48 mx-auto border-b border-slate-900 mb-1"></div>
                <p className="text-xs font-bold text-slate-900">{quote.clientName || 'Cliente'}</p>
                <p className="text-[10px] text-slate-500">Aprovação do Cliente</p>
              </div>
            </div>
          </div>

        </div>

        {/* Rodapé das Ações no Modal (Oculto na Impressão) */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onEdit(quote)}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Edit className="w-3.5 h-3.5 text-amber-600" />
              <span>Editar</span>
            </button>

            {quote.status === 'rascunho' && onApproveQuote && (
              <button
                onClick={() => onApproveQuote(quote.id)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Aprovar Orçamento</span>
              </button>
            )}

            {quote.status !== 'convertido' && (
              <button
                onClick={() => onConvertToSale(quote.id)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Converter em Venda</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
            >
              {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin text-amber-950" /> : <Download className="w-4 h-4" />}
              <span>{isGeneratingPdf ? 'Gerando PDF...' : 'Baixar PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
