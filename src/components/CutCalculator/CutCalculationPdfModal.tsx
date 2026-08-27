import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  Copy,
  Check,
  Ruler,
  Layers,
  FileText,
  User,
  Calendar,
  Building,
  CheckCircle2,
  Sparkles,
  Scissors
} from 'lucide-react';
import { CutCalculation, CompanyInfo } from '../../types';
import { downloadPdfElement } from '../../utils/pdfGenerator';
import { CUT_PRODUCT_TYPES } from '../../utils/cutCalculationEngine';

interface CutCalculationPdfModalProps {
  isOpen: boolean;
  calculation: CutCalculation | null;
  companyInfo: CompanyInfo;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

export const CutCalculationPdfModal: React.FC<CutCalculationPdfModalProps> = ({
  isOpen,
  calculation,
  companyInfo,
  onClose,
  onShowToast,
}) => {
  const documentRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !calculation) return null;

  const productTypeObj = CUT_PRODUCT_TYPES.find((pt) => pt.type === calculation.productType);
  const productTypeLabel = productTypeObj?.label || calculation.productType;

  // Gerar PDF
  const handleDownloadPdf = async () => {
    if (!documentRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const fileName = `Ficha_Corte_${calculation.code}_${(calculation.clientName || 'Cliente').replace(/\s+/g, '_')}.pdf`;
      const success = await downloadPdfElement(documentRef.current, fileName);
      if (success) {
        onShowToast?.('PDF da Ficha de Corte gerado com sucesso!');
      }
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      onShowToast?.('Erro ao gerar PDF da ficha de corte.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Imprimir diretamente
  const handlePrint = () => {
    window.print();
  };

  // Compartilhar WhatsApp / Copiar Texto
  const handleCopyWhatsApp = () => {
    const text = `📋 *SMART VIDROS — FICHA DE CORTE [${calculation.code}]*
━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${calculation.clientName || 'Consumidor'}
🏗️ *Obra/Local:* ${calculation.projectName || 'Padrão'}
📦 *Sistema:* ${productTypeLabel} (${calculation.ruleName})
📅 *Data:* ${new Date(calculation.createdAt).toLocaleDateString('pt-BR')}

📐 *MEDIDAS DO VÃO:*
• Largura: ${calculation.spanWidthMm} mm (${(calculation.spanWidthMm / 10).toFixed(1)} cm)
• Altura: ${calculation.spanHeightMm} mm (${(calculation.spanHeightMm / 10).toFixed(1)} cm)
• Vãos: ${calculation.spanQuantity} un.

✂️ *MEDIDAS FINAIS DE CORTE:*
• Largura da Peça: *${calculation.cutWidthMm} mm*
• Altura da Peça: *${calculation.cutHeightMm} mm*
• Total de Peças: *${calculation.totalPieces} folhas*
• Área Total: *${calculation.totalAreaM2.toFixed(3)} m²*

⚙️ *DESCONTOS E FOLGAS:*
• Desconto Largura: ${calculation.widthDiscount} mm | Folga Lat.: ${calculation.lateralGap} mm
• Desconto Altura: ${calculation.heightDiscount} mm | Folga Sup/Inf: ${calculation.topGap}/${calculation.bottomGap} mm

📝 *Fórmula Aplicada:*
${calculation.formulaUsed}
${calculation.notes ? `\n📌 *Observações:* ${calculation.notes}` : ''}
━━━━━━━━━━━━━━━━━━━━
*Smart Vidros — Soluções em Vidros e Esquadrias*
📞 ${companyInfo.phone || ''}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    onShowToast?.('Resumo técnico copiado para a área de transferência!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl my-auto print:border-none print:shadow-none print:bg-white print:w-full print:max-w-none">
        {/* Barra Superior de Ações (Oculta na Impressão) */}
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                Ficha Técnica de Corte <span className="text-amber-400 font-mono">[{calculation.code}]</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Visualização e exportação para produção e instalação
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyWhatsApp}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-zinc-700"
              title="Copiar texto formatado para WhatsApp"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-zinc-700"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Gerando PDF...' : 'Baixar PDF A4'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ÁREA DE VISUALIZAÇÃO DO DOCUMENTO A4 (Ficha Técnica) */}
        <div className="p-4 sm:p-8 bg-zinc-950/70 overflow-x-auto flex justify-center">
          <div
            ref={documentRef}
            id="cut-calculation-pdf-root"
            className="w-full max-w-[800px] bg-white text-zinc-900 p-8 sm:p-10 rounded-xl shadow-xl border border-zinc-200 print:border-none print:shadow-none print:p-0 print:w-full font-sans text-xs leading-relaxed"
            style={{ minHeight: '1050px' }}
          >
            {/* CABEÇALHO DA EMPRESA */}
            <div className="border-b-2 border-amber-500 pb-5 mb-6 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">
                  {companyInfo.name || 'SMART VIDROS'}
                </h1>
                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                  Soluções em Vidros Temperados & Esquadrias de Alumínio
                </p>
                <div className="mt-2 text-[10px] text-zinc-600 space-y-0.5">
                  {companyInfo.cnpj && <p><strong>CNPJ:</strong> {companyInfo.cnpj}</p>}
                  {companyInfo.phone && <p><strong>Telefone/WhatsApp:</strong> {companyInfo.phone}</p>}
                  {companyInfo.email && <p><strong>E-mail:</strong> {companyInfo.email}</p>}
                  {companyInfo.address && <p><strong>Endereço:</strong> {companyInfo.address} - {companyInfo.city}</p>}
                </div>
              </div>

              <div className="text-right bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <span className="inline-block px-2 py-0.5 bg-amber-500 text-white font-black text-[10px] uppercase rounded tracking-wider">
                  ORDEM DE CORTE
                </span>
                <p className="text-lg font-black text-zinc-900 font-mono mt-1">{calculation.code}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  <strong>Emissão:</strong> {new Date(calculation.createdAt).toLocaleDateString('pt-BR')} às {new Date(calculation.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                {calculation.userName && (
                  <p className="text-[9px] text-zinc-500">
                    <strong>Resp.:</strong> {calculation.userName}
                  </p>
                )}
              </div>
            </div>

            {/* DADOS DO CLIENTE & PROJETO */}
            <div className="grid grid-cols-2 gap-4 bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 mb-6">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block mb-1">
                  Dados do Cliente
                </span>
                <p className="text-sm font-bold text-zinc-900">{calculation.clientName || 'Cliente Balcão / Não informado'}</p>
                {calculation.clientPhone && (
                  <p className="text-[11px] text-zinc-600 mt-0.5">Telefone: {calculation.clientPhone}</p>
                )}
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block mb-1">
                  Obra / Local de Instalação
                </span>
                <p className="text-sm font-bold text-zinc-900">{calculation.projectName || 'Obra Padrão'}</p>
                <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                  Sistema: {productTypeLabel}
                </p>
              </div>
            </div>

            {/* REGRA SELECIONADA */}
            <div className="bg-amber-500/10 border-l-4 border-amber-500 p-3 rounded-r-lg mb-6 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-bold text-amber-900 tracking-wider">Regra de Cálculo Aplicada:</span>
                <p className="text-xs font-bold text-zinc-900">{calculation.ruleName}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-zinc-700 bg-white border border-amber-200 px-2 py-1 rounded">
                  {calculation.piecesPerSpan} folha(s) por vão
                </span>
              </div>
            </div>

            {/* QUADRO COMPARATIVO: VÃO vs MEDIDA DE CORTE */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Vão Original */}
              <div className="border border-zinc-300 rounded-lg p-4 bg-zinc-50/50">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2 mb-3">
                  <h3 className="font-bold text-zinc-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-zinc-500" /> Medidas do Vão (Obra)
                  </h3>
                  <span className="text-[10px] font-semibold bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded">
                    {calculation.spanQuantity} vão(s)
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-zinc-600 font-medium">Largura do Vão:</span>
                    <span className="font-mono text-base font-bold text-zinc-900">
                      {calculation.spanWidthMm} mm <span className="text-[10px] text-zinc-500">({(calculation.spanWidthMm / 10).toFixed(1)} cm)</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-zinc-600 font-medium">Altura do Vão:</span>
                    <span className="font-mono text-base font-bold text-zinc-900">
                      {calculation.spanHeightMm} mm <span className="text-[10px] text-zinc-500">({(calculation.spanHeightMm / 10).toFixed(1)} cm)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Medida de Corte de Fabricação */}
              <div className="border-2 border-amber-500 rounded-lg p-4 bg-amber-50/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500 text-zinc-950 font-black text-[9px] px-2 py-0.5 rounded-bl uppercase">
                  Medida Final
                </div>
                <div className="flex items-center justify-between border-b border-amber-200 pb-2 mb-3">
                  <h3 className="font-black text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-amber-600" /> Corte de Produção (Peça)
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-zinc-700 font-bold">Largura de Corte:</span>
                    <span className="font-mono text-lg font-black text-amber-700">
                      {calculation.cutWidthMm} mm
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-zinc-700 font-bold">Altura de Corte:</span>
                    <span className="font-mono text-lg font-black text-amber-700">
                      {calculation.cutHeightMm} mm
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TABELA DE QUANTITATIVOS E ÁREAS */}
            <div className="border border-zinc-200 rounded-lg overflow-hidden mb-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-700 font-bold text-[10px] uppercase border-b border-zinc-200">
                    <th className="py-2.5 px-3">Item / Peça</th>
                    <th className="py-2.5 px-3 text-center">Largura (mm)</th>
                    <th className="py-2.5 px-3 text-center">Altura (mm)</th>
                    <th className="py-2.5 px-3 text-center">Qtd Total</th>
                    <th className="py-2.5 px-3 text-right">Área Unitária</th>
                    <th className="py-2.5 px-3 text-right">Área Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-[11px]">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-zinc-900">
                      Folha de Vidro / Painel ({productTypeLabel})
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-zinc-800">
                      {calculation.cutWidthMm}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-zinc-800">
                      {calculation.cutHeightMm}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-700">
                      {calculation.totalPieces} un.
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-zinc-700">
                      {calculation.singlePieceAreaM2.toFixed(3)} m²
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900">
                      {calculation.totalAreaM2.toFixed(3)} m²
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-zinc-50 font-bold text-zinc-800 border-t-2 border-zinc-300">
                    <td colSpan={3} className="py-2.5 px-3 text-right uppercase text-[10px]">
                      Totais de Produção:
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-amber-800">
                      {calculation.totalPieces} peças
                    </td>
                    <td className="py-2.5 px-3 text-right text-[10px] text-zinc-500">
                      Total m²:
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-zinc-950 font-black text-xs">
                      {calculation.totalAreaM2.toFixed(3)} m²
                    </td>
                  </tr>
                  {calculation.totalPrice && calculation.totalPrice > 0 && (
                    <tr className="bg-amber-50 text-amber-950 font-bold border-t border-amber-200">
                      <td colSpan={5} className="py-2 px-3 text-right text-[10px] uppercase">
                        Valor Estimado ({calculation.pricePerM2?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m²):
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-amber-900 font-black text-sm">
                        {calculation.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>

            {/* DETALHAMENTO DAS FOLGAS E FÓRMULA PASSO A PASSO */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 mb-6 space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-500" /> Memória de Cálculo & Descontos Aplicados
              </h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] bg-white p-2.5 rounded border border-zinc-200">
                <div>
                  <span className="text-zinc-500 block">Desc. Largura:</span>
                  <strong className="text-zinc-800 font-mono">{calculation.widthDiscount} mm</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block">Folga Lateral (2x):</span>
                  <strong className="text-zinc-800 font-mono">{calculation.lateralGap * 2} mm ({calculation.lateralGap}mm/lado)</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block">Desc. Altura:</span>
                  <strong className="text-zinc-800 font-mono">{calculation.heightDiscount} mm</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block">Folga Sup./Inf.:</span>
                  <strong className="text-zinc-800 font-mono">{calculation.topGap + calculation.bottomGap} mm ({calculation.topGap}/{calculation.bottomGap}mm)</strong>
                </div>
              </div>

              <div className="text-[11px] text-zinc-700 bg-amber-50/50 p-2.5 rounded border border-amber-200/60">
                <strong className="text-amber-900 block mb-0.5">Passo a Passo da Fórmula:</strong>
                <p className="font-mono text-zinc-800">{calculation.formulaUsed}</p>
              </div>

              {calculation.notes && (
                <div className="text-[11px] text-zinc-700 bg-zinc-100 p-2.5 rounded border border-zinc-200">
                  <strong className="text-zinc-900 block mb-0.5">Observações Técnicas / Têmpera / Ferragens:</strong>
                  <p className="whitespace-pre-line">{calculation.notes}</p>
                </div>
              )}
            </div>

            {/* ASSINATURAS E RESPONSABILIDADES */}
            <div className="pt-8 border-t border-zinc-200 grid grid-cols-2 gap-8 text-center mt-auto">
              <div>
                <div className="border-t border-zinc-400 mx-auto w-48 mb-1"></div>
                <p className="font-bold text-[10px] text-zinc-800 uppercase">Medição & Conferência</p>
                <p className="text-[9px] text-zinc-500">Responsável pela Obra</p>
              </div>
              <div>
                <div className="border-t border-zinc-400 mx-auto w-48 mb-1"></div>
                <p className="font-bold text-[10px] text-zinc-800 uppercase">Produção & Corte</p>
                <p className="text-[9px] text-zinc-500">Smart Vidros — Setor de Têmpera / Fábrica</p>
              </div>
            </div>

            {/* RODAPÉ DO DOCUMENTO */}
            <div className="mt-8 text-center text-[8px] text-zinc-400 pt-3 border-t border-zinc-100">
              Documento gerado automaticamente pelo Sistema Smart Vidros ERP • Código: {calculation.code} • Data: {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
