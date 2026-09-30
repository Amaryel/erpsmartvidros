import React, { useState } from 'react';
import {
  X,
  Printer,
  Share2,
  Download,
  Edit,
  Loader2,
  BadgeDollarSign,
  Calendar,
  User,
  Building2,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { Payslip, CompanyInfo, PaymentMethod } from '../types';
import { numberToWordsBRL, formatDateExtenso } from '../utils/numberToWords';
import { downloadPdfElement } from '../utils/pdfGenerator';
import SMART_VIDROS_OFFICIAL_LOGO_BASE64 from '../assets/logoBase64';

interface PayslipViewModalProps {
  payslip: Payslip;
  companyInfo: CompanyInfo;
  onClose: () => void;
  onEdit: (payslip: Payslip) => void;
}

export const PayslipViewModal: React.FC<PayslipViewModalProps> = ({
  payslip,
  companyInfo,
  onClose,
  onEdit,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const ownerName = companyInfo.ownerName || 'James Clayton do Nascimento';
  const companyName = companyInfo.name || 'Smart Vidros';
  const cnpj = companyInfo.cnpj || '51.840.669/0001-22';
  const city = companyInfo.city || 'Picos – PI';
  const address = companyInfo.address || 'Rua Projetada – Sussuapara-PI';
  const phone = companyInfo.phone || '(89) 99991-0028';

  const employeeNameUpper = payslip.employeeName ? payslip.employeeName.trim().toUpperCase() : 'FUNCIONÁRIO';
  const netAmountFormatted = payslip.netAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const netAmountExtenso = numberToWordsBRL(payslip.netAmount);
  const dateExtenso = formatDateExtenso(payslip.paymentDate);

  const methodLabels: Record<PaymentMethod, string> = {
    pix: 'PIX Instantâneo',
    dinheiro: 'Dinheiro em Espécie',
    cartao_credito: 'Cartão de Crédito',
    cartao_debito: 'Cartão de Débito',
    transferencia: 'Transferência Bancária',
    fiado: 'Outro',
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    const empClean = payslip.employeeName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Contracheque_${payslip.code}_${empClean}.pdf`;
    try {
      await downloadPdfElement('printable-payslip-area', filename);
    } catch (err) {
      console.error('Erro ao gerar PDF do contracheque:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const msg = `*SMART VIDROS - RECIBO DE PAGAMENTO / CONTRACHEQUE*\n\n` +
      `👤 *Colaborador:* ${payslip.employeeName}\n` +
      `💼 *Função:* ${payslip.employeeRole}\n` +
      `📄 *Contracheque:* ${payslip.code}\n` +
      `📅 *Mês de Referência:* ${payslip.referenceMonth}\n` +
      `🗓️ *Data do Pagamento:* ${new Date(payslip.paymentDate + 'T12:00:00').toLocaleDateString('pt-BR')}\n` +
      `💵 *Salário Base / Diárias:* ${payslip.baseSalary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n` +
      `➕ *Total de Proventos:* ${payslip.totalEarnings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n` +
      `➖ *Total de Descontos:* ${payslip.totalDeductions.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n` +
      `💰 *VALOR LÍQUIDO PAGO:* *${netAmountFormatted}*\n` +
      `📝 *Valor por Extenso:* ${netAmountExtenso}\n` +
      `💳 *Forma:* ${methodLabels[payslip.paymentMethod] || payslip.paymentMethod.toUpperCase()}\n\n` +
      `_Comprovante oficial emitido pelo sistema Smart Vidros._`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleCopyText = () => {
    const text = `SMART VIDROS - CONTRACHEQUE ${payslip.code}
Colaborador: ${payslip.employeeName} (${payslip.employeeRole})
Mês: ${payslip.referenceMonth}
Valor Líquido: ${netAmountFormatted} (${netAmountExtenso})
Forma: ${methodLabels[payslip.paymentMethod] || payslip.paymentMethod}`;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:h-auto print:border-none print:shadow-none print:rounded-none">
        
        {/* BARRA DE AÇÕES SUPERIOR (OCULTA NA IMPRESSÃO) */}
        <div className="bg-slate-900 text-white p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <BadgeDollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 font-mono">{payslip.code}</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-semibold border border-slate-700">
                  {payslip.referenceMonth}
                </span>
              </div>
              <h2 className="text-sm font-black text-white leading-tight">
                Contracheque / Recibo de Salário
              </h2>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs transition-all shadow-sm active:scale-95"
              title="Compartilhar no WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Baixar PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
              title="Baixar Arquivo PDF"
            >
              {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{isGeneratingPdf ? 'Gerando...' : 'Baixar PDF'}</span>
            </button>

            {/* Imprimir */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-2 rounded-xl text-xs transition-all shadow-sm active:scale-95"
              title="Imprimir"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            {/* Editar */}
            <button
              onClick={() => onEdit(payslip)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold px-3 py-2 rounded-xl text-xs transition-all active:scale-95"
              title="Editar"
            >
              <Edit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editar</span>
            </button>

            {/* Fechar */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors ml-1"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CORPO DO DOCUMENTO (FORMATADO PARA IMPRESSÃO A4) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 print:bg-white print:p-0 print:overflow-visible">
          <div
            id="printable-payslip-area"
            className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-300 shadow-md max-w-3xl mx-auto text-slate-900 font-sans print:shadow-none print:border-none print:rounded-none print:p-2 print:max-w-none notranslate"
            translate="no"
          >
            {/* Cabeçalho Visual Identidade Smart Vidros (Padrão Recibo & Orçamento) */}
            <div className="bg-slate-950 text-white rounded-xl p-4 sm:p-5 border-b-4 border-amber-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 notranslate" translate="no">
              
              <div className="flex items-center gap-3.5 notranslate" translate="no">
                {/* Logotipo Oficial */}
                <img
                  src={
                    companyInfo.logoUrl &&
                    !companyInfo.logoUrl.includes('178') &&
                    !companyInfo.logoUrl.includes('badge') &&
                    !companyInfo.logoUrl.endsWith('.jpg') &&
                    !companyInfo.logoUrl.includes('.svg')
                      ? companyInfo.logoUrl
                      : SMART_VIDROS_OFFICIAL_LOGO_BASE64
                  }
                  alt={companyInfo.name || 'Smart Vidros'}
                  referrerPolicy="no-referrer"
                  style={{
                    height: '50px',
                    maxHeight: '50px',
                    width: 'auto',
                    maxWidth: '140px',
                    objectFit: 'contain',
                    display: 'inline-block',
                  }}
                  className="h-12 w-auto max-w-[140px] object-contain shrink-0 drop-shadow-md"
                />

                <div className="notranslate" translate="no">
                  <p className="text-xs text-amber-300 font-bold tracking-wide notranslate" translate="no">
                    {ownerName}
                  </p>
                  <p className="text-[11px] text-slate-400 notranslate" translate="no">
                    CNPJ: {cnpj}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-300 space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800 w-full sm:w-auto">
                <div className="font-bold text-amber-400 uppercase text-xs tracking-wider mb-0.5">
                  CONTRACHEQUE / RECIBO DE PAGAMENTO
                </div>
                <p>📍 {address} • {city}</p>
                <p>📞 WhatsApp: {phone} • ✉️ {companyInfo.email || 'contato.smartvidros@gmail.com'}</p>
              </div>
            </div>

            {/* Destaque do Código, Mês de Referência e Valor Líquido em Tabela Inquebrável */}
            <div className="bg-slate-900 text-white rounded-xl p-4 mb-4 border-l-4 border-amber-400">
              <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', margin: 0 }}>
                <tbody>
                  <tr>
                    <td style={{ border: 'none', padding: '0 8px 0 0', verticalAlign: 'middle', width: '33%', textAlign: 'left' }}>
                      <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                        Identificação
                      </span>
                      <span className="text-base font-black font-mono text-white block">
                        {payslip.code}
                      </span>
                    </td>

                    <td style={{ border: 'none', padding: '0 8px', verticalAlign: 'middle', width: '34%', textAlign: 'center' }}>
                      <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                        Mês de Referência
                      </span>
                      <span className="text-sm font-bold text-slate-200 block">
                        {payslip.referenceMonth}
                      </span>
                    </td>

                    <td style={{ border: 'none', padding: '0 0 0 8px', verticalAlign: 'middle', width: '33%', textAlign: 'right' }}>
                      <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                        Valor Líquido
                      </span>
                      <span className="text-base sm:text-lg font-black font-mono text-amber-300 block">
                        {netAmountFormatted}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* TÍTULO CENTRAL */}
            <div className="text-center bg-slate-100 py-2 px-4 rounded-xl border border-slate-200 mb-4">
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
                RECIBO DE PAGAMENTO DE SALÁRIO / PRESTAÇÃO DE SERVIÇOS
              </h2>
            </div>

            {/* DADOS DO FUNCIONÁRIO / PRESTADOR */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">Colaborador / Funcionário:</span>
                  <span className="font-black text-slate-950 text-sm">{employeeNameUpper}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">Função / Cargo:</span>
                  <span className="font-bold text-slate-900">{payslip.employeeRole}</span>
                </div>
                {payslip.employeeCpf && (
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">CPF / Documento:</span>
                    <span className="font-mono font-bold text-slate-800">{payslip.employeeCpf}</span>
                  </div>
                )}
                {payslip.employeePix && (
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">Chave PIX / Conta:</span>
                    <span className="font-mono text-slate-800">{payslip.employeePix}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">Data de Pagamento:</span>
                  <span className="font-bold text-slate-800">{dateExtenso}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">Forma de Quitação:</span>
                  <span className="font-bold text-emerald-700">{methodLabels[payslip.paymentMethod] || payslip.paymentMethod.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* TABELA CONTÁBIL DE PROVENTOS E DESCONTOS */}
            <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                    <th className="py-2.5 px-4">Cód / Discriminação das Verbas</th>
                    <th className="py-2.5 px-4 text-right">Vencimentos (R$)</th>
                    <th className="py-2.5 px-4 text-right">Descontos (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* Salário Base */}
                  <tr className="bg-white hover:bg-slate-50/50">
                    <td className="py-2.5 px-4">
                      <span className="font-bold text-slate-900">001 - Salário Base / Remuneração Contratual</span>
                      <span className="block text-[10px] text-slate-500 font-normal">
                        Competência integral de {payslip.referenceMonth}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                      {payslip.baseSalary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400">-</td>
                  </tr>

                  {/* Proventos Adicionais */}
                  {payslip.earnings.map((earn, i) => (
                    <tr key={earn.id} className="bg-white hover:bg-slate-50/50">
                      <td className="py-2.5 px-4">
                        <span className="font-bold text-slate-900">
                          {String(10 + i + 1).padStart(3, '0')} - {earn.description}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                        {earn.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-400">-</td>
                    </tr>
                  ))}

                  {/* Descontos */}
                  {payslip.deductions.map((ded, i) => (
                    <tr key={ded.id} className="bg-white hover:bg-slate-50/50">
                      <td className="py-2.5 px-4">
                        <span className="font-bold text-rose-800">
                          {String(50 + i + 1).padStart(3, '0')} - {ded.description}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-400">-</td>
                      <td className="py-2.5 px-4 text-right font-bold text-rose-600">
                        {ded.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* TOTAIS */}
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-xs">
                    <td className="py-3 px-4 uppercase text-slate-800">Totalizadores:</td>
                    <td className="py-3 px-4 text-right text-slate-950 font-black">
                      {payslip.totalEarnings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-3 px-4 text-right text-rose-700 font-black">
                      {payslip.totalDeductions > 0
                        ? payslip.totalDeductions.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : 'R$ 0,00'}
                    </td>
                  </tr>

                  {/* VALOR LÍQUIDO DESTACADO */}
                  <tr className="bg-slate-950 text-white font-black text-sm">
                    <td className="py-3.5 px-4 uppercase tracking-wider text-amber-400">
                      VALOR LÍQUIDO PAGO:
                    </td>
                    <td colSpan={2} className="py-3.5 px-4 text-right text-emerald-400 text-base font-mono">
                      {netAmountFormatted}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* VALOR POR EXTENSO */}
            <div className="bg-amber-50/80 border border-amber-300/80 p-3.5 rounded-2xl text-xs text-amber-950">
              <span className="font-bold block text-[10px] uppercase text-amber-800">Valor Líquido por Extenso:</span>
              <span className="font-black text-sm uppercase tracking-wide">{netAmountExtenso}</span>
            </div>

            {/* OBSERVAÇÕES SE HOUVER */}
            {payslip.notes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block text-[10px] uppercase mb-0.5">Observações:</span>
                <p className="italic">{payslip.notes}</p>
              </div>
            )}

            {/* DECLARAÇÃO FORMAL DE RECEBIMENTO */}
            <div className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 text-justify">
              <p>
                Declaro para os devidos fins de direito ter recebido da empresa <strong>{companyName.toUpperCase()}</strong> ({cnpj}) a importância líquida discriminada neste recibo de pagamento no valor de <strong>{netAmountFormatted}</strong> ({netAmountExtenso}), dando plena, rasa, geral e irrevogável quitação de todas as verbas remuneratórias referentes à competência de <strong>{payslip.referenceMonth}</strong>.
              </p>
            </div>

            {/* DATA E ASSINATURAS */}
            <div className="pt-6 space-y-8">
              <div className="text-right text-xs font-bold text-slate-600">
                {city}, {dateExtenso}.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                {/* Assinatura Empregador */}
                <div className="text-center">
                  <div className="border-t border-slate-800 pt-2 w-full max-w-[260px] mx-auto">
                    <p className="text-xs font-black text-slate-950 uppercase">{companyName}</p>
                    <p className="text-[10px] text-slate-500">{ownerName} • Empregador</p>
                    <p className="text-[9px] text-slate-400">CNPJ: {cnpj}</p>
                  </div>
                </div>

                {/* Assinatura Empregado */}
                <div className="text-center">
                  <div className="border-t border-slate-800 pt-2 w-full max-w-[260px] mx-auto">
                    <p className="text-xs font-black text-slate-950 uppercase">{employeeNameUpper}</p>
                    <p className="text-[10px] text-slate-500">{payslip.employeeRole}</p>
                    {payslip.employeeCpf && <p className="text-[9px] text-slate-400">CPF: {payslip.employeeCpf}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* RODAPÉ DO DOCUMENTO */}
            <div className="border-t border-slate-200 pt-3 text-center text-[9px] text-slate-400 font-mono">
              Documento gerado eletronicamente pelo Sistema Oficial Smart Vidros • {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
