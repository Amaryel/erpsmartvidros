import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { rasterizeSvgElementToPng } from '../components/TechnicalProductPreview';
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

  /* Images and SVGs */
  img {
    max-width: 100% !important;
    height: auto;
    object-fit: contain !important;
    display: inline-block !important;
  }
  
  /* Proteção estrita para ilustrações e desenhos técnicos no PDF */
  .technical-preview-wrapper,
  [data-technical-wrapper] {
    width: 90px !important;
    min-width: 90px !important;
    max-width: 90px !important;
    height: 65px !important;
    min-height: 65px !important;
    max-height: 65px !important;
    display: block !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
  }
  .technical-product-preview,
  [data-technical-preview="true"] {
    width: 90px !important;
    min-width: 90px !important;
    max-width: 90px !important;
    height: 65px !important;
    min-height: 65px !important;
    max-height: 65px !important;
    background-color: #090f1d !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 8px !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .technical-preview-wrapper img,
  [data-technical-wrapper] img,
  .technical-preview-img,
  img[data-technical-image] {
    width: 90px !important;
    min-width: 90px !important;
    max-width: 90px !important;
    height: 65px !important;
    min-height: 65px !important;
    max-height: 65px !important;
    object-fit: contain !important;
    display: block !important;
    background-color: #090f1d !important;
    border-radius: 6px !important;
    box-sizing: border-box !important;
  }
  img.h-15, .h-15 { height: 60px !important; max-height: 60px !important; }
  img.h-14, .h-14 { height: 56px !important; max-height: 56px !important; }
  img.h-13, .h-13 { height: 52px !important; max-height: 52px !important; }
  img.h-12, .h-12 { height: 48px !important; max-height: 48px !important; }
  img.h-11, .h-11 { height: 44px !important; max-height: 44px !important; }
  img.h-10, .h-10 { height: 40px !important; max-height: 40px !important; }
  img.h-9, .h-9 { height: 36px !important; max-height: 36px !important; }
  img.h-8, .h-8 { height: 32px !important; max-height: 32px !important; }
  img.h-6, .h-6 { height: 24px !important; max-height: 24px !important; }
  img.h-5, .h-5 { height: 20px !important; max-height: 20px !important; }
  img.h-4, .h-4 { height: 16px !important; max-height: 16px !important; }

  .max-w-\\[140px\\] { max-width: 140px !important; }
  .max-w-\\[150px\\] { max-width: 150px !important; }
  .max-w-\\[180px\\] { max-width: 180px !important; }
  .max-w-\\[220px\\] { max-width: 220px !important; }
  .max-w-\\[240px\\] { max-width: 240px !important; }
  .w-auto { width: auto !important; }
  .shrink-0 { flex-shrink: 0 !important; }

  .object-contain { object-fit: contain !important; }
  .object-cover { object-fit: cover !important; }

  .max-h-48 { max-height: 192px !important; }
  .max-h-32 { max-height: 128px !important; }
  .max-h-24 { max-height: 96px !important; }
  .max-h-20 { max-height: 80px !important; }
  .max-h-16 { max-height: 64px !important; }
  .max-h-14 { max-height: 56px !important; }
  .max-h-12 { max-height: 48px !important; }
  .max-h-10 { max-height: 40px !important; }
  
  svg {
    display: inline-block !important;
    vertical-align: middle !important;
    overflow: visible !important;
  }

  /* Tables */
  table {
    width: 100% !important;
    border-collapse: collapse !important;
    table-layout: fixed !important;
    margin: 8px 0 !important;
  }
  th {
    background-color: #0f172a !important;
    color: #fbbf24 !important;
    font-weight: bold !important;
    text-align: left !important;
    padding: 8px 10px !important;
    box-sizing: border-box !important;
  }
  td {
    padding: 6px 10px !important;
    border-bottom: 1px solid #e2e8f0 !important;
    box-sizing: border-box !important;
  }
  .table-fixed { table-layout: fixed !important; }
  .border-collapse { border-collapse: collapse !important; }
  
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
  .gap-3\\.5 { gap: 14px !important; }
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
  
  /* Regras de visibilidade seletiva em PDF */
  .pdf-hidden, .hide-in-pdf, .no-pdf, .print\\:hidden { display: none !important; }
  .pdf-only, .show-in-pdf { display: block !important; }
  .pdf-only-inline, .show-in-pdf-inline { display: inline !important; }
  .pdf-only-cell, .show-in-pdf-cell { display: table-cell !important; }

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
  // O canvas corresponde ao iframeDoc.body (não ao #pdf-root, que tem padding) e o html2canvas
  // usa escala uniforme. Medir a partir do #pdf-root com canvas.height/altura deslocava os
  // pontos de corte e podia partir uma linha da tabela ao meio entre páginas.
  const rootRect = iframeDoc.body.getBoundingClientRect();
  const scaleFactor = canvas.width / (rootRect.width || 800);

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

  // Trava rígida para imagens no PDF não estourarem dimensões
  if (el.tagName.toLowerCase() === 'img') {
    const imgEl = el as HTMLImageElement;
    imgEl.style.maxWidth = '100%';
    imgEl.style.objectFit = 'contain';
    const classStr = el.className || '';
    if (imgEl.getAttribute('data-technical-image') === 'true' || classStr.includes('technical-preview-img')) {
      imgEl.style.width = '90px';
      imgEl.style.height = '65px';
      imgEl.style.minHeight = '65px';
      imgEl.style.maxHeight = '65px';
      imgEl.style.display = 'block';
      imgEl.style.backgroundColor = '#090f1d';
      imgEl.style.borderRadius = '6px';
    } else if (classStr.includes('h-14')) {
      imgEl.style.height = '56px';
      imgEl.style.maxHeight = '56px';
    } else if (classStr.includes('h-12')) {
      imgEl.style.height = '48px';
      imgEl.style.maxHeight = '48px';
    } else if (classStr.includes('h-10')) {
      imgEl.style.height = '40px';
      imgEl.style.maxHeight = '40px';
    } else if (classStr.includes('h-8')) {
      imgEl.style.height = '32px';
      imgEl.style.maxHeight = '32px';
    }
  }

  // Trava rígida para tabelas manterem alinhamento exato de colunas
  if (el.tagName.toLowerCase() === 'table') {
    el.style.tableLayout = 'fixed';
    el.style.width = '100%';
    el.style.borderCollapse = 'collapse';
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
 * Pré-rasteriza todos os desenhos técnicos diretamente no DOM da página ativa antes da clonagem para o PDF.
 * Garante que cada item tenha sua imagem PNG Base64 pronta, idêntica ao que o usuário vê na tela.
 */
async function preRasterizeAllTechnicalDrawings(targetElement: HTMLElement): Promise<void> {
  const previewDivs = Array.from(
    targetElement.querySelectorAll<HTMLElement>('[data-technical-preview="true"], .technical-product-preview')
  );

  await Promise.all(
    previewDivs.map(async (div) => {
      try {
        const existingSrc = div.getAttribute('data-png-src');
        if (existingSrc && existingSrc.startsWith('data:image/png;base64,') && existingSrc.length > 300) {
          return;
        }

        const hiddenImg = div.querySelector<HTMLImageElement>('img[data-raster-png]');
        if (hiddenImg && hiddenImg.src && hiddenImg.src.startsWith('data:image/png;base64,') && hiddenImg.src.length > 300) {
          div.setAttribute('data-png-src', hiddenImg.src);
          return;
        }

        const svg = div.querySelector('svg');
        if (svg) {
          const viewBox = svg.getAttribute('viewBox');
          let vbW = 220;
          let vbH = 160;
          if (viewBox) {
            const parts = viewBox.split(/\s+|,/).map(Number);
            if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
              vbW = parts[2];
              vbH = parts[3];
            }
          }
          const pngUrl = await rasterizeSvgElementToPng(svg, vbW, vbH);
          if (pngUrl && pngUrl.startsWith('data:image/png;base64,') && pngUrl.length > 300) {
            div.setAttribute('data-png-src', pngUrl);
            let imgEl = div.querySelector<HTMLImageElement>('img[data-raster-png]');
            if (!imgEl) {
              imgEl = document.createElement('img');
              imgEl.setAttribute('data-raster-png', 'true');
              imgEl.style.display = 'none';
              div.appendChild(imgEl);
            }
            imgEl.src = pngUrl;
          }
        }
      } catch (err) {
        console.warn('Erro ao pré-rasterizar desenho técnico:', err);
      }
    })
  );
}

/**
 * Converte elementos técnicos em imagens PNG reais perfeitamente dimensionadas
 * para que o html2canvas renderize com 100% de nitidez, fidelidade de cores e sem colapso.
 * NUNCA utiliza data:image/svg+xml porque o html2canvas não suporta esse formato em vários navegadores.
 */
async function convertSvgElementsToImages(container: HTMLElement, doc: Document): Promise<void> {
  // 1. Previews técnicos que já possuem data-png-src pré-renderizado pelo TechnicalProductPreview
  const previewDivs = Array.from(container.querySelectorAll<HTMLElement>('[data-technical-preview="true"], .technical-product-preview'));
  for (const div of previewDivs) {
    let pngSrc = div.getAttribute('data-png-src');
    if (!pngSrc || !pngSrc.startsWith('data:image/png;base64,') || pngSrc.length < 300) {
      const hiddenImg = div.querySelector<HTMLImageElement>('img[data-raster-png]');
      if (hiddenImg && hiddenImg.src && hiddenImg.src.startsWith('data:image/png;base64,') && hiddenImg.src.length > 300) {
        pngSrc = hiddenImg.src;
      }
    }

    if (!pngSrc || !pngSrc.startsWith('data:image/png;base64,') || pngSrc.length < 300) {
      const svg = div.querySelector('svg');
      if (svg) {
        const viewBox = svg.getAttribute('viewBox');
        let vbW = 220;
        let vbH = 160;
        if (viewBox) {
          const parts = viewBox.split(/\s+|,/).map(Number);
          if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
            vbW = parts[2];
            vbH = parts[3];
          }
        }
        pngSrc = await rasterizeSvgElementToPng(svg, vbW, vbH);
      }
    }

    if (pngSrc && pngSrc.startsWith('data:image/png;base64,') && pngSrc.length > 300) {
      const img = doc.createElement('img');
      img.src = pngSrc;
      img.setAttribute('data-technical-image', 'true');
      img.style.width = '90px';
      img.style.minWidth = '90px';
      img.style.maxWidth = '90px';
      img.style.height = '65px';
      img.style.minHeight = '65px';
      img.style.maxHeight = '65px';
      img.style.display = 'block';
      img.style.objectFit = 'contain';
      img.style.borderRadius = '8px';
      img.style.backgroundColor = '#090f1d';
      img.className = 'technical-preview-img';

      div.innerHTML = '';
      div.style.backgroundColor = '#090f1d';
      div.style.width = '90px';
      div.style.minWidth = '90px';
      div.style.maxWidth = '90px';
      div.style.height = '65px';
      div.style.minHeight = '65px';
      div.style.maxHeight = '65px';
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.style.justifyContent = 'center';
      div.style.padding = '0';
      div.style.margin = '0';
      div.style.overflow = 'hidden';
      div.style.borderRadius = '8px';
      div.appendChild(img);
    }
  }

  // 2. Para qualquer <svg> remanescente no container, rasterizar para PNG real em alta definição
  const svgs = Array.from(container.querySelectorAll('svg'));
  for (const svg of svgs) {
    try {
      const viewBox = svg.getAttribute('viewBox');
      let vbW = 220;
      let vbH = 160;
      if (viewBox) {
        const parts = viewBox.split(/\s+|,/).map(Number);
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
          vbW = parts[2];
          vbH = parts[3];
        }
      }
      // Ícones de interface (lucide etc.) NÃO são desenhos técnicos: mantêm o tamanho renderizado
      // e não recebem o estilo de miniatura (90x65 com fundo escuro).
      const isTechnical = Boolean(svg.closest('[data-technical-preview="true"], .technical-product-preview'));
      const svgRect = svg.getBoundingClientRect();
      const renderW = Math.round(svgRect.width) || Number(svg.getAttribute('width')) || 16;
      const renderH = Math.round(svgRect.height) || Number(svg.getAttribute('height')) || 16;

      // Ícones usam stroke/fill="currentColor"; ao rasterizar isoladamente essa cor se perde (vira preto).
      // Resolve a cor herdada antes da conversão para manter a cor original do ícone no PDF.
      if (!isTechnical) {
        const iconColor = (doc.defaultView || window).getComputedStyle(svg).color || '#f59e0b';
        [svg, ...Array.from(svg.querySelectorAll('*'))].forEach((node) => {
          ['stroke', 'fill'].forEach((attr) => {
            if (node.getAttribute(attr) === 'currentColor') node.setAttribute(attr, iconColor);
          });
        });
      }

      const pngUrl = await rasterizeSvgElementToPng(svg, vbW, vbH);
      if (pngUrl && pngUrl.startsWith('data:image/png;base64,')) {
        const img = doc.createElement('img');
        img.src = pngUrl;
        const parent = svg.parentElement;

        if (isTechnical) {
          const targetH = Math.round(90 * (vbH / vbW)) || 65;
          img.setAttribute('data-technical-image', 'true');
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.maxWidth = '90px';
          img.style.maxHeight = `${targetH}px`;
          img.style.display = 'block';
          img.style.objectFit = 'contain';
          img.style.borderRadius = '8px';
          img.style.backgroundColor = '#090f1d';
          img.className = 'technical-preview-img';
          if (parent) {
            parent.style.backgroundColor = '#090f1d';
            parent.style.display = 'flex';
            parent.style.alignItems = 'center';
            parent.style.justifyContent = 'center';
            parent.replaceChild(img, svg);
          }
        } else {
          img.style.width = `${renderW}px`;
          img.style.height = `${renderH}px`;
          img.style.display = 'inline-block';
          img.style.verticalAlign = 'middle';
          img.style.objectFit = 'contain';
          if (parent) {
            parent.replaceChild(img, svg);
          }
        }
      }
    } catch (err) {
      console.warn('Erro ao converter SVG residual para o PDF:', err);
    }
  }
}

/**
 * Ajustes aplicados por cima do CSS real da aplicação dentro do documento isolado do PDF.
 * Garante largura A4 fixa (800px), fundo branco e remove elementos marcados como "só tela".
 */
const PDF_DOCUMENT_OVERRIDES = `
  html, body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; width: 800px !important; }
  #pdf-root { width: 800px !important; padding: 24px !important; box-sizing: border-box !important; background: #ffffff !important; overflow: visible !important; max-height: none !important; height: auto !important; }
  .print\\:hidden, [data-pdf-hide] { display: none !important; }
  *, *::before, *::after { animation: none !important; transition: none !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
`;

const UNSUPPORTED_COLOR_PATTERN = /oklch|oklab|color-mix|color\(|lab\(|lch\(|light-dark/;
const COLOR_PROPERTIES = [
  'color', 'background-color', 'border-top-color', 'border-right-color', 'border-bottom-color',
  'border-left-color', 'outline-color', 'text-decoration-color', 'fill', 'stroke', 'box-shadow',
  'background-image', 'caret-color', 'column-rule-color',
];

/**
 * CAUSA do texto "deslocado para baixo" no PDF (selos cortados, textos encostando em bordas):
 * o html2canvas mede a linha de base das fontes no documento PRINCIPAL usando uma imagem 1x1
 * (gif em base64). O reset do Tailwind aplica `img { display: block }` a essa imagem, a medição
 * sai errada e TODO texto é desenhado ~4px abaixo. Esta regra restaura a medição correta e só
 * atinge a imagem de medição do html2canvas.
 */
const HTML2CANVAS_METRICS_FIX = 'img[src^="data:image/gif;base64,R0lGOD"] { display: inline !important; vertical-align: baseline !important; }';

function ensureHtml2CanvasMetricsFix(): void {
  if (typeof document === 'undefined' || document.querySelector('style[data-pdf-metrics-fix]')) return;
  const style = document.createElement('style');
  style.setAttribute('data-pdf-metrics-fix', 'true');
  style.textContent = HTML2CANVAS_METRICS_FIX;
  document.head.appendChild(style);
}

/**
 * Lê as folhas de estilo reais da aplicação (Tailwind compilado) para que o PDF tenha
 * exatamente o mesmo layout do preview. Cores modernas (oklch/oklab) são convertidas para RGB,
 * pois o html2canvas não as interpreta. Retorna '' se nada puder ser lido (usa o CSS de fallback).
 */
async function collectAppStylesheets(): Promise<{ css: string; externalLinks: string[] }> {
  const chunks: string[] = [];
  const externalLinks: string[] = [];
  const nodes = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
  for (const node of nodes) {
    try {
      if (node.tagName === 'STYLE') {
        chunks.push(node.textContent || '');
        continue;
      }
      const href = (node as HTMLLinkElement).href;
      if (!href) continue;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) {
        externalLinks.push(url.href); // ex.: Google Fonts
        continue;
      }
      const res = await fetch(url.href);
      if (res.ok) chunks.push(await res.text());
    } catch (err) {
      console.warn('[PDF] Não foi possível ler uma folha de estilo da aplicação:', err);
    }
  }
  const css = chunks.join('\n');
  return { css: css.trim() ? convertAllUnsupportedColors(css) : '', externalLinks };
}

/**
 * Converte para RGB (inline) qualquer cor computada que ainda use funções não suportadas
 * pelo html2canvas (ex.: color-mix gerado pelas opacidades do Tailwind v4).
 */
function inlineUnsupportedComputedColors(doc: Document): void {
  const view = doc.defaultView;
  if (!view) return;
  doc.querySelectorAll<HTMLElement>('#pdf-root, #pdf-root *').forEach((el) => {
    const cs = view.getComputedStyle(el);
    for (const prop of COLOR_PROPERTIES) {
      const value = cs.getPropertyValue(prop);
      if (value && UNSUPPORTED_COLOR_PATTERN.test(value)) {
        el.style.setProperty(prop, convertAllUnsupportedColors(value), 'important');
      }
    }
  });
}

/**
 * OBRIGA a geração do arquivo PDF com corte inteligente de páginas e download direto.
 * 100% à prova de falhas e sem textos cortados ao meio!
 */
export const downloadPdfElement = async (elementOrId: string | HTMLElement, filename: string): Promise<boolean> => {
  ensureHtml2CanvasMetricsFix();
  const targetElement = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  if (!targetElement) {
    console.error(`Elemento para gerar PDF não foi encontrado:`, elementOrId);
    return false;
  }

  // 1. Pré-rasterizar todos os desenhos técnicos diretamente no elemento ativo
  await preRasterizeAllTechnicalDrawings(targetElement);

  // 1. Criar um iframe isolado do Tailwind v4 principal
    // Usa o CSS real da aplicação (mesmo layout do preview); se indisponível, cai no CSS isolado
    const appStyles = await collectAppStylesheets();

  const iframe = document.createElement('iframe');
  iframe.setAttribute('style', 'position: fixed; left: 0; top: 0; width: 800px; height: 1120px; border: none; opacity: 1; visibility: visible; pointer-events: none; z-index: -99999;');
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
          ${appStyles.css
      ? `${appStyles.externalLinks.map((href) => `<link rel="stylesheet" href="${href}">`).join('')}<style>${appStyles.css}</style><style>${PDF_DOCUMENT_OVERRIDES}</style>`
      : `<style>${ISOLATED_IFRAME_CSS}</style>`}
        </head>
        <body class="notranslate" translate="no">
          <div id="pdf-root" class="notranslate" translate="no">
            ${targetElement.innerHTML}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    // 2.1 Rasterizar todos os SVGs técnicos para imagens perfeitas
    const rootEl = iframeDoc.getElementById('pdf-root');
    if (rootEl) {
      await convertSvgElementsToImages(rootEl, iframeDoc);
      sanitizeElementStyles(rootEl);
    }

    // 2.2 Com o CSS real da aplicação, normaliza cores modernas restantes para o html2canvas
    if (appStyles.css) {
      inlineUnsupportedComputedColors(iframeDoc);
    }

    // Pausa para montagem e estabilização do layout + garantia de decodificação completa das imagens PNG
    const images = Array.from(iframeDoc.querySelectorAll('img'));
    await Promise.all([
      new Promise((resolve) => setTimeout(resolve, 250)),
      ...images.map(async (img) => {
        if (img.decode) {
          try {
            await img.decode();
            return;
          } catch (_) {}
        }
        if (img.complete && img.naturalHeight !== 0) return;
        return new Promise((resolve) => {
          img.onload = () => resolve(null);
          img.onerror = () => resolve(null);
          setTimeout(resolve, 800); // timeout de segurança
        });
      }),
    ]);


    // 3. Renderizar Canvas do documento inteiro
    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 800,
    });

    // 3.1 PÓS-PROCESSAMENTO CRÍTICO: Estampar diretamente os desenhos técnicos sobre o Canvas principal
    // Garante 100% que nenhum desenho fique preto/vazio, independentemente de restrições de sandbox ou navegador.
    const pageCtx = canvas.getContext('2d');
    if (pageCtx) {
      // html2canvas captura iframeDoc.body e devolve o contexto com transform scale(N) ainda ativo.
      // Sem zerar, cada desenho era estampado em coordenadas multiplicadas (fora do lugar / fora do canvas).
      pageCtx.setTransform(1, 0, 0, 1, 0, 0);
      const root = iframeDoc.getElementById('pdf-root') || iframeDoc.body;
      // Coordenadas relativas ao elemento efetivamente capturado (body), e não ao #pdf-root (que possui padding).
      const rootRect = iframeDoc.body.getBoundingClientRect();
      const scaleX = canvas.width / (rootRect.width || 800);
      // html2canvas aplica a MESMA escala nos dois eixos. Usar canvas.height / altura do body
      // gerava um fator vertical diferente (o canvas é um pouco mais alto que o body) e deslocava
      // cada desenho para baixo, acumulando a cada item.
      const scaleY = scaleX;

      const previewDivs = Array.from(
        root.querySelectorAll<HTMLElement>(
          '[data-technical-preview="true"], .technical-product-preview'
        )
      );

      const livePreviewDivs = Array.from(
        targetElement.querySelectorAll<HTMLElement>(
          '[data-technical-preview="true"], .technical-product-preview'
        )
      );

      for (let i = 0; i < previewDivs.length; i++) {
        const div = previewDivs[i];
        let pngSrc = div.getAttribute('data-png-src');
        if (!pngSrc || !pngSrc.startsWith('data:image/png;base64,')) {
          const liveDiv = livePreviewDivs[i];
          if (liveDiv) {
            pngSrc = liveDiv.getAttribute('data-png-src');
          }
        }
        if (!pngSrc || !pngSrc.startsWith('data:image/png;base64,')) {
          const imgChild = div.querySelector<HTMLImageElement>('img');
          if (imgChild && imgChild.src && imgChild.src.startsWith('data:image/png;base64,')) {
            pngSrc = imgChild.src;
          }
        }

        if (pngSrc && pngSrc.startsWith('data:image/png;base64,')) {
          const r = div.getBoundingClientRect();
          const dx = (r.left - rootRect.left) * scaleX;
          const dy = (r.top - rootRect.top) * scaleY;
          const dw = r.width * scaleX;
          const dh = r.height * scaleY;

          await new Promise<void>((resolve) => {
            const stampImg = new Image();
            stampImg.onload = () => {
              pageCtx.save();
              pageCtx.drawImage(stampImg, dx, dy, dw, dh);
              pageCtx.restore();
              resolve();
            };
            stampImg.onerror = () => resolve();
            stampImg.src = pngSrc;
          });
        }
      }
    }

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

          // Conversão de SVGs no fallback
          const svgs = Array.from(clonedDoc.querySelectorAll('svg'));
          svgs.forEach((svg) => {
            try {
              const existingImg = svg.parentElement?.querySelector('img[data-technical-image]');
              if (existingImg) {
                svg.remove();
                return;
              }
              if (!svg.getAttribute('xmlns')) svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
              const svgString = new XMLSerializer().serializeToString(svg);
              const svgBase64 = 'data:image/svg+xml;charset=utf-8;base64,' + btoa(unescape(encodeURIComponent(svgString)));
              const img = clonedDoc.createElement('img');
              img.src = svgBase64;
              img.width = 90;
              img.height = 65;
              img.style.width = '90px';
              img.style.height = '65px';
              img.style.minHeight = '65px';
              img.style.display = 'block';
              img.style.backgroundColor = '#090f1d';
              img.style.borderRadius = '6px';
              if (svg.parentNode) svg.parentNode.replaceChild(img, svg);
            } catch {
              // ignore
            }
          });
        },
      });

      const fallbackCtx = fallbackCanvas.getContext('2d');
      if (fallbackCtx) {
        const targetRect = targetElement.getBoundingClientRect();
        const fScaleX = fallbackCanvas.width / (targetRect.width || 800);
        const fScaleY = fallbackCanvas.height / (targetRect.height || 1);

        const liveDivs = Array.from(
          targetElement.querySelectorAll<HTMLElement>(
            '[data-technical-preview="true"], .technical-product-preview'
          )
        );

        for (const div of liveDivs) {
          let pngSrc = div.getAttribute('data-png-src');
          if (!pngSrc || !pngSrc.startsWith('data:image/png;base64,')) {
            const imgChild = div.querySelector<HTMLImageElement>('img');
            if (imgChild && imgChild.src && imgChild.src.startsWith('data:image/png;base64,')) {
              pngSrc = imgChild.src;
            }
          }

          if (pngSrc && pngSrc.startsWith('data:image/png;base64,')) {
            const r = div.getBoundingClientRect();
            const dx = (r.left - targetRect.left) * fScaleX;
            const dy = (r.top - targetRect.top) * fScaleY;
            const dw = r.width * fScaleX;
            const dh = r.height * fScaleY;

            await new Promise<void>((resolve) => {
              const stampImg = new Image();
              stampImg.onload = () => {
                fallbackCtx.save();
                fallbackCtx.drawImage(stampImg, dx, dy, dw, dh);
                fallbackCtx.restore();
                resolve();
              };
              stampImg.onerror = () => resolve();
              stampImg.src = pngSrc;
            });
          }
        }
      }

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
