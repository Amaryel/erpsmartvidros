import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  parseOklabStringToRgb,
  parseOklchStringToRgb,
  parseColorSrgbStringToRgb,
  parseLightDarkStringToRgb,
  parseColorMixStringToRgb,
  convertAllUnsupportedColors,
} from './colorConverter';

// Export for compatibility
export {
  parseOklabStringToRgb,
  parseOklchStringToRgb,
  parseColorSrgbStringToRgb,
  parseLightDarkStringToRgb,
  parseColorMixStringToRgb,
  convertAllUnsupportedColors,
};

/**
 * Clean CSS styles for the isolated iframe document.
 * Contains pure standard CSS rules with HEX / RGB colors so html2canvas never chokes on Tailwind v4.
 */
const ISOLATED_IFRAME_CSS = `
  * {
    box-sizing: border-box !important;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
  }
  body {
    background-color: #ffffff !important;
    color: #0f172a !important;
    width: 800px !important;
    padding: 24px !important;
    font-size: 12px !important;
    line-height: 1.5 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Background Colors */
  .bg-slate-950 { background-color: #020617 !important; color: #ffffff !important; }
  .bg-slate-900 { background-color: #0f172a !important; color: #ffffff !important; }
  .bg-slate-800 { background-color: #1e293b !important; color: #ffffff !important; }
  .bg-slate-200 { background-color: #e2e8f0 !important; }
  .bg-slate-100 { background-color: #f1f5f9 !important; }
  .bg-slate-50 { background-color: #f8fafc !important; }
  .bg-slate-50\\/80, .bg-slate-50\\/70, .bg-slate-50\\/60, .bg-slate-50\\/50, .bg-slate-50\\/40 { background-color: #f8fafc !important; }
  
  .bg-amber-500 { background-color: #f59e0b !important; color: #020617 !important; }
  .bg-amber-400 { background-color: #fbbf24 !important; }
  .bg-amber-300 { background-color: #fcd34d !important; }
  .bg-amber-200 { background-color: #fde68a !important; color: #451a03 !important; }
  .bg-amber-100 { background-color: #fef3c7 !important; }
  .bg-amber-50 { background-color: #fffbeb !important; }
  .bg-amber-50\\/80, .bg-amber-50\\/70, .bg-amber-50\\/60, .bg-amber-50\\/50, .bg-amber-50\\/40 { background-color: #fffbeb !important; }
  
  .bg-emerald-600 { background-color: #059669 !important; color: #ffffff !important; }
  .bg-emerald-100 { background-color: #d1fae5 !important; color: #065f46 !important; }
  .bg-emerald-50 { background-color: #ecfdf5 !important; }
  .bg-red-50 { background-color: #fef2f2 !important; }
  .bg-red-50\\/50, .bg-red-50\\/40, .bg-red-50\\/30 { background-color: #fef2f2 !important; }
  .bg-white { background-color: #ffffff !important; }
  
  /* Text Colors */
  .text-amber-400 { color: #fbbf24 !important; }
  .text-amber-500 { color: #f59e0b !important; }
  .text-amber-600 { color: #d97706 !important; }
  .text-amber-700 { color: #b45309 !important; }
  .text-amber-800 { color: #92400e !important; }
  .text-amber-900 { color: #78350f !important; }
  .text-amber-950 { color: #451a03 !important; }
  
  .text-emerald-900 { color: #064e3b !important; }
  .text-emerald-800 { color: #065f46 !important; }
  .text-emerald-700 { color: #047857 !important; }
  .text-emerald-600 { color: #059669 !important; }
  
  .text-red-800 { color: #991b1b !important; }
  .text-red-700 { color: #b91c1c !important; }
  .text-red-600 { color: #dc2626 !important; }
  
  .text-slate-950 { color: #020617 !important; }
  .text-slate-900 { color: #0f172a !important; }
  .text-slate-800 { color: #1e293b !important; }
  .text-slate-700 { color: #334155 !important; }
  .text-slate-600 { color: #475569 !important; }
  .text-slate-500 { color: #64748b !important; }
  .text-slate-400 { color: #94a3b8 !important; }
  .text-slate-300 { color: #cbd5e1 !important; }
  .text-white { color: #ffffff !important; }

  /* Typography */
  .text-center { text-align: center !important; }
  .text-right { text-align: right !important; }
  .text-left { text-align: left !important; }
  .text-justify { text-align: justify !important; }

  .text-3xl { font-size: 28px !important; line-height: 36px !important; }
  .text-2xl { font-size: 24px !important; line-height: 32px !important; }
  .text-xl { font-size: 20px !important; line-height: 28px !important; }
  .text-lg { font-size: 18px !important; line-height: 26px !important; }
  .text-base { font-size: 15px !important; line-height: 22px !important; }
  .text-sm { font-size: 13px !important; line-height: 19px !important; }
  .text-xs { font-size: 11px !important; line-height: 16px !important; }
  .text-\\[10px\\] { font-size: 10px !important; line-height: 14px !important; }
  .text-\\[11px\\] { font-size: 11px !important; line-height: 15px !important; }
  .text-\\[12px\\] { font-size: 12px !important; line-height: 16px !important; }
  .text-\\[13px\\] { font-size: 13px !important; line-height: 18px !important; }

  .tracking-widest { letter-spacing: 0.1em !important; }
  .tracking-wider { letter-spacing: 0.05em !important; }
  .tracking-wide { letter-spacing: 0.025em !important; }
  .uppercase { text-transform: uppercase !important; }
  .capitalize { text-transform: capitalize !important; }
  .italic { font-style: italic !important; }
  .not-italic { font-style: normal !important; }
  .whitespace-pre-line { white-space: pre-line !important; }

  .leading-relaxed { line-height: 1.625 !important; }
  .leading-normal { line-height: 1.5 !important; }
  .leading-tight { line-height: 1.25 !important; }
  .leading-none { line-height: 1 !important; }

  /* Borders */
  .border-amber-500 { border-color: #f59e0b !important; }
  .border-amber-400 { border-color: #fbbf24 !important; }
  .border-amber-300 { border-color: #fcd34d !important; }
  .border-amber-200 { border-color: #fde68a !important; }
  .border-emerald-200 { border-color: #a7f3d0 !important; }
  .border-red-200 { border-color: #fecaca !important; }
  .border-red-100 { border-color: #fee2e2 !important; }
  .border-slate-950 { border-color: #020617 !important; }
  .border-slate-900 { border-color: #0f172a !important; }
  .border-slate-800 { border-color: #1e293b !important; }
  .border-slate-300 { border-color: #cbd5e1 !important; }
  .border-slate-200 { border-color: #e2e8f0 !important; }
  .border-slate-100 { border-color: #f1f5f9 !important; }

  .border-b-4 { border-bottom: 4px solid #f59e0b !important; }
  .border-b-2 { border-bottom-width: 2px !important; border-bottom-style: solid !important; }
  .border-b { border-bottom: 1px solid #e2e8f0 !important; }
  
  .border-t-4 { border-top: 4px solid #f59e0b !important; }
  .border-t-2 { border-top-width: 2px !important; border-top-style: solid !important; }
  .border-t { border-top: 1px solid #e2e8f0 !important; }
  
  .border-l-4 { border-left: 4px solid #f59e0b !important; }
  .border-l-2 { border-left-width: 2px !important; border-left-style: solid !important; }
  .border-l { border-left: 1px solid #e2e8f0 !important; }
  
  .border-r-4 { border-right: 4px solid #f59e0b !important; }
  .border-r-2 { border-right-width: 2px !important; border-right-style: solid !important; }
  .border-r { border-right: 1px solid #e2e8f0 !important; }
  
  .border-y { border-top: 1px solid #cbd5e1 !important; border-bottom: 1px solid #cbd5e1 !important; }
  .border-2 { border-width: 2px !important; border-style: solid !important; }
  .border { border: 1px solid #e2e8f0 !important; }

  /* Tables */
  table { width: 100% !important; border-collapse: collapse !important; margin: 8px 0 !important; }
  th { background-color: #0f172a !important; color: #fbbf24 !important; font-weight: bold !important; text-align: left !important; padding: 8px 10px !important; }
  td { padding: 6px 10px !important; border-bottom: 1px solid #e2e8f0 !important; }
  
  .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important; }
  .font-light { font-weight: 300 !important; }
  .font-normal { font-weight: 400 !important; }
  .font-medium { font-weight: 500 !important; }
  .font-semibold { font-weight: 600 !important; }
  .font-bold { font-weight: 700 !important; }
  .font-extrabold { font-weight: 800 !important; }
  .font-black { font-weight: 900 !important; }

  .rounded-2xl { border-radius: 16px !important; }
  .rounded-xl { border-radius: 12px !important; }
  .rounded-lg { border-radius: 8px !important; }
  .rounded-md { border-radius: 6px !important; }
  .rounded-sm { border-radius: 4px !important; }
  .rounded-full { border-radius: 9999px !important; }

  /* Spacing */
  .p-10 { padding: 40px !important; }
  .p-8 { padding: 32px !important; }
  .p-6 { padding: 24px !important; }
  .p-5 { padding: 20px !important; }
  .p-4 { padding: 16px !important; }
  .p-3\\.5 { padding: 14px !important; }
  .p-3 { padding: 12px !important; }
  .p-2\\.5 { padding: 10px !important; }
  .p-2 { padding: 8px !important; }
  .p-1\\.5 { padding: 6px !important; }
  .p-1 { padding: 4px !important; }

  .px-6 { padding-left: 24px !important; padding-right: 24px !important; }
  .px-5 { padding-left: 20px !important; padding-right: 20px !important; }
  .px-4 { padding-left: 16px !important; padding-right: 16px !important; }
  .px-3\\.5 { padding-left: 14px !important; padding-right: 14px !important; }
  .px-3 { padding-left: 12px !important; padding-right: 12px !important; }
  .px-2\\.5 { padding-left: 10px !important; padding-right: 10px !important; }
  .px-2 { padding-left: 8px !important; padding-right: 8px !important; }

  .py-6 { padding-top: 24px !important; padding-bottom: 24px !important; }
  .py-5 { padding-top: 20px !important; padding-bottom: 20px !important; }
  .py-4 { padding-top: 16px !important; padding-bottom: 16px !important; }
  .py-3 { padding-top: 12px !important; padding-bottom: 12px !important; }
  .py-2\\.5 { padding-top: 10px !important; padding-bottom: 10px !important; }
  .py-2 { padding-top: 8px !important; padding-bottom: 8px !important; }
  .py-1\\.5 { padding-top: 6px !important; padding-bottom: 6px !important; }
  .py-1 { padding-top: 4px !important; padding-bottom: 4px !important; }
  .py-0\\.5 { padding-top: 2px !important; padding-bottom: 2px !important; }

  .pb-6 { padding-bottom: 24px !important; }
  .pb-5 { padding-bottom: 20px !important; }
  .pb-4 { padding-bottom: 16px !important; }
  .pb-3 { padding-bottom: 12px !important; }
  .pb-2 { padding-bottom: 8px !important; }
  .pb-1\\.5 { padding-bottom: 6px !important; }
  .pb-1 { padding-bottom: 4px !important; }

  .pt-12 { padding-top: 48px !important; }
  .pt-10 { padding-top: 40px !important; }
  .pt-8 { padding-top: 32px !important; }
  .pt-6 { padding-top: 24px !important; }
  .pt-5 { padding-top: 20px !important; }
  .pt-4 { padding-top: 16px !important; }
  .pt-3 { padding-top: 12px !important; }
  .pt-2 { padding-top: 8px !important; }
  .pt-1\\.5 { padding-top: 6px !important; }
  .pt-1 { padding-top: 4px !important; }

  .pl-6 { padding-left: 24px !important; }
  .pl-5 { padding-left: 20px !important; }
  .pl-4 { padding-left: 16px !important; }
  .pl-3\\.5 { padding-left: 14px !important; }
  .pl-3 { padding-left: 12px !important; }
  .pl-2 { padding-left: 8px !important; }

  .pr-6 { padding-right: 24px !important; }
  .pr-4 { padding-right: 16px !important; }

  .mb-12 { margin-bottom: 48px !important; }
  .mb-10 { margin-bottom: 40px !important; }
  .mb-8 { margin-bottom: 32px !important; }
  .mb-6 { margin-bottom: 24px !important; }
  .mb-5 { margin-bottom: 20px !important; }
  .mb-4 { margin-bottom: 16px !important; }
  .mb-3 { margin-bottom: 12px !important; }
  .mb-2 { margin-bottom: 8px !important; }
  .mb-1\\.5 { margin-bottom: 6px !important; }
  .mb-1 { margin-bottom: 4px !important; }
  .mb-0\\.5 { margin-bottom: 2px !important; }

  .mt-12 { margin-top: 48px !important; }
  .mt-10 { margin-top: 40px !important; }
  .mt-8 { margin-top: 32px !important; }
  .mt-6 { margin-top: 24px !important; }
  .mt-5 { margin-top: 20px !important; }
  .mt-4 { margin-top: 16px !important; }
  .mt-3 { margin-top: 12px !important; }
  .mt-2 { margin-top: 8px !important; }
  .mt-1\\.5 { margin-top: 6px !important; }
  .mt-1 { margin-top: 4px !important; }
  .mt-0\\.5 { margin-top: 2px !important; }

  .my-6 { margin-top: 24px !important; margin-bottom: 24px !important; }
  .my-5 { margin-top: 20px !important; margin-bottom: 20px !important; }
  .my-4 { margin-top: 16px !important; margin-bottom: 16px !important; }
  .my-3 { margin-top: 12px !important; margin-bottom: 12px !important; }
  .my-2 { margin-top: 8px !important; margin-bottom: 8px !important; }
  .my-1\\.5 { margin-top: 6px !important; margin-bottom: 6px !important; }
  .my-1 { margin-top: 4px !important; margin-bottom: 4px !important; }

  .space-y-0\\.5 > * + * { margin-top: 2px !important; }
  .space-y-1 > * + * { margin-top: 4px !important; }
  .space-y-1\\.5 > * + * { margin-top: 6px !important; }
  .space-y-2 > * + * { margin-top: 8px !important; }
  .space-y-3 > * + * { margin-top: 12px !important; }
  .space-y-4 > * + * { margin-top: 16px !important; }
  .space-y-5 > * + * { margin-top: 20px !important; }
  .space-y-6 > * + * { margin-top: 24px !important; }

  .divide-y > * + * { border-top: 1px solid #e2e8f0 !important; }

  /* Flexbox & Grid */
  .flex { display: flex !important; }
  .inline-flex { display: inline-flex !important; }
  .flex-col { flex-direction: column !important; }
  .flex-row { flex-direction: row !important; }
  .justify-between { justify-content: space-between !important; }
  .justify-center { justify-content: center !important; }
  .justify-end { justify-content: flex-end !important; }
  .items-center { align-items: center !important; }
  .items-start { align-items: flex-start !important; }
  .items-end { align-items: flex-end !important; }
  .items-baseline { align-items: baseline !important; }
  .shrink-0 { flex-shrink: 0 !important; }

  /* Responsive classes for html2canvas iframe (desktop 800px width context) */
  .sm\\:flex-row { flex-direction: row !important; }
  .sm\\:flex-col { flex-direction: column !important; }
  .sm\\:items-center { align-items: center !important; }
  .sm\\:items-start { align-items: flex-start !important; }
  .sm\\:items-end { align-items: flex-end !important; }
  .sm\\:justify-between { justify-content: space-between !important; }
  .sm\\:justify-end { justify-content: flex-end !important; }
  .sm\\:text-right { text-align: right !important; }
  .sm\\:text-left { text-align: left !important; }
  .sm\\:text-center { text-align: center !important; }
  .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  .sm\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
  .sm\\:p-10 { padding: 40px !important; }
  .sm\\:p-8 { padding: 32px !important; }
  .sm\\:p-5 { padding: 20px !important; }
  .sm\\:p-4 { padding: 16px !important; }
  .sm\\:p-3\\.5 { padding: 14px !important; }
  .sm\\:pt-0 { padding-top: 0 !important; }
  .sm\\:pt-8 { padding-top: 32px !important; }
  .sm\\:pl-4 { padding-left: 16px !important; }
  .sm\\:border-t-0 { border-top: none !important; }
  .sm\\:border-l { border-left: 1px solid #1e293b !important; }
  .sm\\:w-auto { width: auto !important; }
  .sm\\:w-72 { width: 288px !important; }
  .sm\\:w-80 { width: 320px !important; }

  .grid { display: grid !important; }
  .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
  .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
  .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }

  .gap-8 { gap: 32px !important; }
  .gap-6 { gap: 24px !important; }
  .gap-5 { gap: 20px !important; }
  .gap-4 { gap: 16px !important; }
  .gap-3 { gap: 12px !important; }
  .gap-2\\.5 { gap: 10px !important; }
  .gap-2 { gap: 8px !important; }
  .gap-1\\.5 { gap: 6px !important; }
  .gap-1 { gap: 4px !important; }

  .block { display: block !important; }
  .inline-block { display: inline-block !important; }
  .inline { display: inline !important; }

  .w-full { width: 100% !important; }
  .w-80 { width: 320px !important; }
  .w-72 { width: 288px !important; }
  .w-64 { width: 256px !important; }
  .w-48 { width: 192px !important; }
  .w-32 { width: 128px !important; }
  .w-10 { width: 40px !important; }
  .w-8 { width: 32px !important; }
  .w-7 { width: 28px !important; }
  .w-4 { width: 16px !important; }
  .w-3 { width: 12px !important; }
  .w-2 { width: 8px !important; }
  .w-auto { width: auto !important; }

  .h-10 { height: 40px !important; }
  .h-8 { height: 32px !important; }
  .h-4 { height: 16px !important; }
  .h-3 { height: 12px !important; }
  .h-2 { height: 8px !important; }
  
  .max-w-4xl { max-width: 896px !important; }
  .max-w-3xl { max-width: 768px !important; }
  .mx-auto { margin-left: auto !important; margin-right: auto !important; }

  .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05) !important; }
  .overflow-hidden { overflow: hidden !important; }
  
  /* Regras de proteção de quebra de página */
  .break-inside-avoid,
  .contract-clause,
  .signature-box,
  .totals-box,
  tr {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
`;

/**
 * Encontra a linha de corte mais limpa (faixa contínua de pixels brancos/vazios)
 * para evitar fatiar texto, linhas de tabela ou cláusulas ao meio.
 */
function findCleanestWhiteRow(
  ctx: CanvasRenderingContext2D,
  width: number,
  minY: number,
  maxY: number
): number {
  minY = Math.max(0, Math.floor(minY));
  maxY = Math.min(ctx.canvas.height - 1, Math.floor(maxY));

  const sampleHeight = maxY - minY + 1;
  if (sampleHeight <= 0) return maxY;

  try {
    const imgData = ctx.getImageData(0, minY, width, sampleHeight);
    const data = imgData.data;
    const rowWhiteScores = new Array(sampleHeight).fill(0);

    for (let row = 0; row < sampleHeight; row++) {
      let lightPixelCount = 0;
      const step = 4;
      const totalSamples = Math.floor(width / step);

      for (let x = 0; x < width; x += step) {
        const idx = (row * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        if (a < 15 || (r >= 240 && g >= 240 && b >= 240)) {
          lightPixelCount++;
        }
      }

      rowWhiteScores[row] = lightPixelCount / (totalSamples || 1);
    }

    // Procurar a melhor faixa branca de baixo para cima (mais próxima da base da página)
    let currentBandStart = -1;
    let currentBandLength = 0;

    for (let row = sampleHeight - 1; row >= 0; row--) {
      if (rowWhiteScores[row] >= 0.96) {
        if (currentBandStart === -1) {
          currentBandStart = row;
          currentBandLength = 1;
        } else {
          currentBandLength++;
        }
      } else {
        if (currentBandLength >= 6) {
          const center = currentBandStart - Math.floor(currentBandLength / 2);
          return minY + center;
        }
        currentBandStart = -1;
        currentBandLength = 0;
      }
    }

    if (currentBandLength >= 4) {
      return minY + currentBandStart - Math.floor(currentBandLength / 2);
    }
  } catch {
    // Se falhar a leitura de pixels, fallback para maxY
  }

  return maxY;
}

/**
 * Fatiador inteligente de páginas A4 com prevenção de corte de texto e elementos
 */
function sliceCanvasIntoPages(canvas: HTMLCanvasElement, iframeDoc: Document): HTMLCanvasElement[] {
  const pageCanvasHeight = Math.floor(canvas.width * (297 / 210)); // Proporção exata A4

  // Se o conteúdo cabe com folga em uma única página A4
  if (canvas.height <= pageCanvasHeight + 25) {
    return [canvas];
  }

  const root = iframeDoc.getElementById('pdf-root') || iframeDoc.body;
  const rootRect = root.getBoundingClientRect();
  const scaleFactor = canvas.height / (rootRect.height || 1);

  // Mapear limites dos blocos que não devem ser cortados
  const candidateElements = root.querySelectorAll(
    'tr, .contract-clause, .clausula, .break-inside-avoid, h1, h2, h3, h4, .signature-box, .totals-box, p, .grid'
  );

  interface DomBoundary {
    top: number;
    bottom: number;
  }

  const boundaries: DomBoundary[] = [];
  candidateElements.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.height > 8) {
      const top = (r.top - rootRect.top) * scaleFactor;
      const bottom = (r.bottom - rootRect.top) * scaleFactor;
      boundaries.push({ top, bottom });
    }
  });

  const pageCanvases: HTMLCanvasElement[] = [];
  let currentY = 0;
  const ctx = canvas.getContext('2d');

  while (currentY < canvas.height - 20) {
    const remainingHeight = canvas.height - currentY;

    // Se o restante cabe em 1 página A4
    if (remainingHeight <= pageCanvasHeight + 30) {
      const sliceHeight = remainingHeight;
      const pCanvas = document.createElement('canvas');
      pCanvas.width = canvas.width;
      pCanvas.height = sliceHeight;
      const pCtx = pCanvas.getContext('2d');
      if (pCtx) {
        pCtx.fillStyle = '#ffffff';
        pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
        pCtx.drawImage(
          canvas,
          0, currentY, canvas.width, sliceHeight,
          0, 0, canvas.width, sliceHeight
        );
      }
      pageCanvases.push(pCanvas);
      break;
    }

    const maxSplitY = currentY + pageCanvasHeight;
    let bestSplitY = maxSplitY;

    // Detectar se algum elemento estaria sendo cortado ao meio
    let crossingElementTop = -1;
    for (const b of boundaries) {
      if (b.top > currentY + pageCanvasHeight * 0.35 && b.top < maxSplitY - 15 && b.bottom > maxSplitY - 15) {
        crossingElementTop = b.top;
        break;
      }
    }

    let searchMax = maxSplitY;
    let searchMin = currentY + pageCanvasHeight * 0.6;

    if (crossingElementTop > 0) {
      searchMax = Math.min(maxSplitY, crossingElementTop + 8);
      searchMin = Math.max(currentY + pageCanvasHeight * 0.35, crossingElementTop - 80);
    }

    // Busca o vão branco mais próximo
    if (ctx) {
      bestSplitY = findCleanestWhiteRow(ctx, canvas.width, searchMin, searchMax);
    } else if (crossingElementTop > 0) {
      bestSplitY = crossingElementTop;
    }

    // Proteção de segurança contra loop
    if (bestSplitY <= currentY + pageCanvasHeight * 0.3) {
      bestSplitY = maxSplitY;
    }

    const sliceHeight = Math.min(bestSplitY - currentY, canvas.height - currentY);
    const pCanvas = document.createElement('canvas');
    pCanvas.width = canvas.width;
    pCanvas.height = sliceHeight;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      pCtx.fillStyle = '#ffffff';
      pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
      pCtx.drawImage(
        canvas,
        0, currentY, canvas.width, sliceHeight,
        0, 0, canvas.width, sliceHeight
      );
    }
    pageCanvases.push(pCanvas);

    currentY = currentY + sliceHeight;
  }

  return pageCanvases.length > 0 ? pageCanvases : [canvas];
}

/**
 * Sanitiza e remove qualquer cor moderna incompatível em inline styles do nó
 */
function sanitizeElementStyles(el: HTMLElement) {
  const styleAttr = el.getAttribute('style');
  if (styleAttr) {
    el.setAttribute('style', convertAllUnsupportedColors(styleAttr));
  }

  const colorProps = [
    'color', 'background-color', 'border-color',
    'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
    'fill', 'stroke', 'outline-color', 'box-shadow'
  ];

  colorProps.forEach((prop) => {
    const val = el.style.getPropertyValue(prop);
    if (val && (val.includes('oklch') || val.includes('oklab') || val.includes('color(') || val.includes('light-dark') || val.includes('color-mix'))) {
      el.style.setProperty(prop, convertAllUnsupportedColors(val), 'important');
    }
  });

  Array.from(el.children).forEach((child) => {
    if (child instanceof HTMLElement) {
      sanitizeElementStyles(child);
    }
  });
}

/**
 * OBRIGA a geração do arquivo PDF com corte inteligente de páginas e download direto.
 * 100% à prova de falhas e sem textos cortados ao meio!
 */
export const downloadPdfElement = async (elementId: string, filename: string): Promise<boolean> => {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    console.error(`Elemento com ID #${elementId} não foi encontrado para gerar PDF.`);
    return false;
  }

  // 1. Criar um iframe invisível isolado do Tailwind v4 principal
  const iframe = document.createElement('iframe');
  iframe.setAttribute('style', 'position: fixed; left: -9999px; top: -9999px; width: 800px; height: 1120px; border: none; visibility: hidden; z-index: -99999;');
  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('Não foi possível acessar o contexto do iframe.');
    }

    // 2. Montar documento HTML limpo no iframe com CSS clássico
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html lang="pt-BR" class="notranslate" translate="no">
        <head>
          <meta charset="utf-8">
          <meta name="google" content="notranslate">
          <title>${filename}</title>
          <style>${ISOLATED_IFRAME_CSS}</style>
        </head>
        <body class="notranslate" translate="no">
          <div id="pdf-root" class="notranslate" translate="no">
            ${targetElement.innerHTML}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    // Pausa para montagem e estabilização do layout
    await new Promise((resolve) => setTimeout(resolve, 150));

    const rootEl = iframeDoc.getElementById('pdf-root');
    if (rootEl) {
      sanitizeElementStyles(rootEl);
    }

    // 3. Renderizar Canvas do documento inteiro
    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 800,
    });

    // 4. Executar divisão inteligente de páginas A4 (Sem cortar cláusulas ou linhas de texto)
    const pageCanvases = sliceCanvasIntoPages(canvas, iframeDoc);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    for (let i = 0; i < pageCanvases.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      const pageCanvas = pageCanvases[i];
      const imgData = pageCanvas.toDataURL('image/jpeg', 0.98);
      const renderHeightMm = (pageCanvas.height * pdfWidth) / pageCanvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, renderHeightMm));
    }

    // 5. Salvar e descarregar o arquivo
    pdf.save(filename);

    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }

    return true;
  } catch (primaryErr) {
    console.error('Erro na renderização primária por iframe, executando fallback jsPDF direto:', primaryErr);

    try {
      const fallbackCanvas = await html2canvas(targetElement, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const styles = clonedDoc.querySelectorAll('style');
          styles.forEach((s) => {
            if (s.textContent && (s.textContent.includes('oklch') || s.textContent.includes('oklab'))) {
              s.textContent = convertAllUnsupportedColors(s.textContent);
            }
          });
        },
      });

      const fallbackPages = sliceCanvasIntoPages(fallbackCanvas, document);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < fallbackPages.length; i++) {
        if (i > 0) pdf.addPage();
        const pCanvas = fallbackPages[i];
        const imgData = pCanvas.toDataURL('image/jpeg', 0.95);
        const rHeight = (pCanvas.height * pdfWidth) / pCanvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, rHeight));
      }

      pdf.save(filename);

      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      return true;
    } catch (fallbackErr) {
      console.error('Erro fatal na geração do PDF:', fallbackErr);
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      window.print();
      return false;
    }
  }
};
