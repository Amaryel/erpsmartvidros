import React from 'react';
import { QuoteItem, TechnicalCategory } from '../types';

interface TechnicalProductPreviewProps {
  item?: Partial<QuoteItem>;
  widthMm?: number;
  heightMm?: number;
  name?: string;
  category?: TechnicalCategory;
  glassColor?: string;
  hardwareColor?: string;
  openingType?: string;
  leafCount?: string;
  compact?: boolean;
  showDimensions?: boolean;
  className?: string;
}

export function detectTechnicalCategory(name: string = '', explicitCategory?: TechnicalCategory): TechnicalCategory {
  if (explicitCategory && explicitCategory !== 'outro') return explicitCategory;
  const n = name.toLowerCase();

  if (n.includes('box') || n.includes('banheiro') || n.includes('chuveiro') || n.includes('elegance') || n.includes('blindex')) return 'box';
  if (n.includes('porta') || n.includes('pivotante') || n.includes('portao') || n.includes('passagem') || n.includes('versatik')) return 'porta';
  if (n.includes('janela') || n.includes('maxim') || n.includes('basculante') || n.includes('veneziana') || n.includes('guilhotina')) return 'janela';
  if (n.includes('espelho') || n.includes('bisote') || n.includes('prata') || n.includes('lapidado')) return 'espelho';
  if (n.includes('guarda') || n.includes('corrim') || n.includes('sacada') || n.includes('peitoril') || n.includes('cortina de vidro')) return 'guarda_corpo';
  if (n.includes('vidro') || n.includes('painel') || n.includes('fachada') || n.includes('divis') || n.includes('muro')) return 'vidro';

  return 'porta';
}

// Analisador inteligente de configuração de folhas e tipo de abertura
export function parseLeafConfiguration(leafCountStr: string = '', name: string = '', openingTypeStr: string = '') {
  const lc = (leafCountStr || '').toLowerCase();
  const nm = (name || '').toLowerCase();
  const ot = (openingTypeStr || '').toLowerCase();

  // 1. PRIORIDADE TOTAL: Se o usuário selecionou ou informou o número de folhas em leafCountStr
  // Avaliação em ordem decrescente (6 -> 4 -> 3 -> 2 -> 1) para evitar qualquer sobreposição de substrings
  if (lc.includes('6') || lc.includes('seis')) {
    return { count: 6, type: 'correr_6f', label: '6 Folhas (4F+2M)' };
  }
  if (lc.includes('4') || lc.includes('quatro')) {
    return { count: 4, type: 'correr_4f', label: '4 Folhas (2F+2M)' };
  }
  if (lc.includes('3') || lc.includes('tres') || lc.includes('três')) {
    return { count: 3, type: 'correr_3f', label: '3 Folhas (2F+1M)' };
  }
  if (lc.includes('2') || lc.includes('duas') || lc.includes('dois')) {
    return { count: 2, type: 'correr_2f', label: '2 Folhas (1F+1M)' };
  }
  if (lc.includes('1') || lc.includes('uma') || lc.includes('um') || lc.includes('fixo inteiro') || lc.includes('folha fixa')) {
    if (ot.includes('maxim') || nm.includes('maxim') || nm.includes('max-ar')) return { count: 1, type: 'maxim_ar', label: '1F Maxim-ar' };
    if (ot.includes('basculante') || nm.includes('basculante')) return { count: 1, type: 'basculante', label: '1F Basculante' };
    if (ot.includes('pivotante') || nm.includes('pivotante') || nm.includes('pivô') || nm.includes('pivo')) return { count: 1, type: 'pivotante', label: '1F Pivotante' };
    if (ot.includes('abrir') || ot.includes('giro') || nm.includes('porta de abrir')) return { count: 1, type: 'giro_1f', label: '1 Folha de Abrir' };
    return { count: 1, type: 'fixo_1f', label: '1 Folha' };
  }

  // 2. Se o campo de Folhas não foi preenchido, detectar a partir do Nome do produto e do Tipo de Abertura
  const combined = `${nm} ${ot}`;

  if (combined.includes('6 folha') || combined.includes('6f') || combined.includes('4f+2m')) {
    return { count: 6, type: 'correr_6f', label: '6 Folhas (4F+2M)' };
  }
  if (combined.includes('4 folha') || combined.includes('4f') || combined.includes('2f+2m') || combined.includes('canto') || combined.includes('box l')) {
    return { count: 4, type: 'correr_4f', label: '4 Folhas (2F+2M)' };
  }
  if (combined.includes('3 folha') || combined.includes('3f') || combined.includes('2f+1m') || combined.includes('versatik')) {
    return { count: 3, type: 'correr_3f', label: '3 Folhas (2F+1M)' };
  }
  if (combined.includes('2 folha') || combined.includes('2f') || combined.includes('1f+1m') || combined.includes('f1') || combined.includes('box f1') || combined.includes('slide')) {
    return { count: 2, type: 'correr_2f', label: '2 Folhas (1F+1M)' };
  }

  // 3. Tipos Especiais de Abertura quando 1 Folha
  if (ot.includes('maxim') || nm.includes('maxim') || nm.includes('max-ar') || nm.includes('maxin')) {
    return { count: 1, type: 'maxim_ar', label: '1F Maxim-ar' };
  }
  if (ot.includes('basculante') || nm.includes('basculante') || nm.includes('bascula')) {
    return { count: 1, type: 'basculante', label: '1F Basculante' };
  }
  if (ot.includes('pivotante') || nm.includes('pivotante') || nm.includes('pivô') || nm.includes('pivo')) {
    return { count: 1, type: 'pivotante', label: '1F Pivotante' };
  }
  if (ot.includes('abrir') || ot.includes('giro') || nm.includes('porta de abrir')) {
    return { count: 1, type: 'giro_1f', label: '1 Folha de Abrir' };
  }
  if (nm.includes('fixo') || nm.includes('painel fixo')) {
    return { count: 1, type: 'fixo_1f', label: '1 Folha Fixo' };
  }

  // Padrão de Vidraçaria: 2 Folhas (1F + 1M)
  return { count: 2, type: 'correr_2f', label: '2 Folhas (1F+1M)' };
}

export const TechnicalProductPreview: React.FC<TechnicalProductPreviewProps> = ({
  item,
  widthMm: propWidth,
  heightMm: propHeight,
  name: propName,
  category: propCategory,
  glassColor: propGlassColor,
  hardwareColor: propHardwareColor,
  openingType: propOpeningType,
  leafCount: propLeafCount,
  compact = false,
  showDimensions = false,
  className = '',
}) => {
  const width = propWidth ?? item?.widthMm ?? 1500;
  const height = propHeight ?? item?.lengthMm ?? 2100;
  const name = propName ?? item?.name ?? 'Produto';
  const category = detectTechnicalCategory(name, propCategory ?? item?.technicalCategory);
  const glassColor = propGlassColor ?? item?.glassColor ?? 'Incolor';
  const hardwareColor = propHardwareColor ?? item?.hardwareColor ?? 'Preto';
  const openingType = propOpeningType ?? item?.openingType ?? 'De Correr';
  const leafCount = propLeafCount ?? item?.leafCount ?? '2 Folhas';

  const config = parseLeafConfiguration(leafCount, name, openingType);

  // Paleta de Vidros Realistas
  const getGlassStyle = () => {
    const gc = (glassColor || '').toLowerCase();
    if (gc.includes('fumê') || gc.includes('fume') || gc.includes('cinza') || gc.includes('grafite')) {
      return { fill: 'rgba(51, 65, 85, 0.48)', stroke: '#475569', label: 'Fumê' };
    }
    if (gc.includes('verde')) {
      return { fill: 'rgba(16, 185, 129, 0.35)', stroke: '#059669', label: 'Verde' };
    }
    if (gc.includes('bronze') || gc.includes('marrom') || gc.includes('champagne')) {
      return { fill: 'rgba(180, 83, 9, 0.38)', stroke: '#b45309', label: 'Bronze' };
    }
    if (gc.includes('astral') || gc.includes('azul') || gc.includes('reflecta') || gc.includes('refletivo')) {
      return { fill: 'rgba(2, 132, 199, 0.38)', stroke: '#0284c7', label: 'Azul/Refletivo' };
    }
    if (gc.includes('jateado') || gc.includes('leitoso') || gc.includes('acidato') || gc.includes('fosco') || gc.includes('pontilhado') || gc.includes('quadrato')) {
      return { fill: 'rgba(241, 245, 249, 0.75)', stroke: '#cbd5e1', label: 'Jateado' };
    }
    // Incolor límpido translúcido
    return { fill: 'rgba(224, 242, 254, 0.45)', stroke: '#38bdf8', label: 'Incolor' };
  };

  // Cores dos Perfis de Alumínio e Ferragens
  const getHardwareStyle = () => {
    const hc = (hardwareColor || '').toLowerCase();
    if (hc === '' || hc === 'vazio' || hc === 'nenhum') {
      return { stroke: '#475569', fill: '#334155', accent: '#94a3b8', isNone: true };
    }
    if (hc.includes('branco')) {
      return { stroke: '#f8fafc', fill: '#e2e8f0', accent: '#38bdf8', isNone: false };
    }
    if (hc.includes('fosco') || hc.includes('natural') || hc.includes('anodizado')) {
      return { stroke: '#cbd5e1', fill: '#94a3b8', accent: '#38bdf8', isNone: false };
    }
    if (hc.includes('bronze') || hc.includes('marrom')) {
      return { stroke: '#92400e', fill: '#78350f', accent: '#fbbf24', isNone: false };
    }
    if (hc.includes('ouro') || hc.includes('dourad') || hc.includes('gold')) {
      return { stroke: '#f59e0b', fill: '#d97706', accent: '#fef08a', isNone: false };
    }
    if (hc.includes('cromad') || hc.includes('inox') || hc.includes('prata')) {
      return { stroke: '#e2e8f0', fill: '#64748b', accent: '#38bdf8', isNone: false };
    }
    if (hc.includes('champagne')) {
      return { stroke: '#d4b996', fill: '#a88b64', accent: '#fef3c7', isNone: false };
    }
    // Preto Fosco padrão
    return { stroke: '#1e293b', fill: '#0f172a', accent: '#f59e0b', isNone: false };
  };

  const glassStyle = getGlassStyle();
  const hwStyle = getHardwareStyle();

  // Dimensões do viewBox
  const svgW = compact ? 220 : 280;
  const svgH = compact ? 160 : 200;

  // Área útil do desenho técnico
  const padLeft = showDimensions ? 38 : 16;
  const padRight = showDimensions ? 38 : 16;
  const padTop = showDimensions ? 32 : 14;
  const padBottom = 22;

  const drawAreaW = svgW - padLeft - padRight;
  const drawAreaH = svgH - padTop - padBottom;

  // Proporção restrita para clareza
  const rawRatio = width > 0 && height > 0 ? width / height : 1.2;
  const clampedRatio = Math.max(0.45, Math.min(2.3, rawRatio));

  let boxW = drawAreaW;
  let boxH = boxW / clampedRatio;

  if (boxH > drawAreaH) {
    boxH = drawAreaH;
    boxW = boxH * clampedRatio;
  }

  const boxX = padLeft + (drawAreaW - boxW) / 2;
  const boxY = padTop + (drawAreaH - boxH) / 2;

  const midX = boxX + boxW / 2;
  const midY = boxY + boxH / 2;

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center bg-slate-950 text-slate-100 rounded-xl border border-slate-800 p-1.5 sm:p-2 select-none notranslate overflow-hidden ${className}`}
      translate="no"
    >
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full h-auto max-h-48 drop-shadow-sm font-sans"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Marcador de seta */}
          <marker
            id={`cad-arrow-${category}`}
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
          >
            <path d="M 0 2 L 8 5 L 0 8 z" fill="#fbbf24" />
          </marker>

          <marker
            id={`cad-arrow-left-${category}`}
            viewBox="0 0 10 10"
            refX="2"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 5 L 8 2 L 8 8 z" fill="#fbbf24" />
          </marker>

          {/* Gradiente de reflexo e brilho do vidro */}
          <linearGradient id="glassGloss" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="65%" stopColor="#38bdf8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.22" />
          </linearGradient>

          {/* Sombra sutil de transpasse */}
          <linearGradient id="overlapShadow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* ================= COTAS DIMENSIONAIS SE ATIVADO ================= */}
        {showDimensions && (
          <g>
            <line x1={boxX} y1={boxY - 4} x2={boxX} y2={boxY - 18} stroke="#64748b" strokeWidth="0.75" strokeDasharray="2,2" />
            <line x1={boxX + boxW} y1={boxY - 4} x2={boxX + boxW} y2={boxY - 18} stroke="#64748b" strokeWidth="0.75" strokeDasharray="2,2" />
            <line
              x1={boxX}
              y1={boxY - 12}
              x2={boxX + boxW}
              y2={boxY - 12}
              stroke="#f59e0b"
              strokeWidth="1.2"
              markerStart={`url(#cad-arrow-left-${category})`}
              markerEnd={`url(#cad-arrow-${category})`}
            />
            <rect
              x={midX - 32}
              y={boxY - 22}
              width="64"
              height="14"
              rx="3"
              fill="#090d16"
              stroke="#334155"
              strokeWidth="0.5"
            />
            <text
              x={midX}
              y={boxY - 12}
              fill="#fbbf24"
              fontSize="9.5"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="monospace"
            >
              {width} mm
            </text>

            <line x1={boxX + boxW + 4} y1={boxY} x2={boxX + boxW + 18} y2={boxY} stroke="#64748b" strokeWidth="0.75" strokeDasharray="2,2" />
            <line x1={boxX + boxW + 4} y1={boxY + boxH} x2={boxX + boxW + 18} y2={boxY + boxH} stroke="#64748b" strokeWidth="0.75" strokeDasharray="2,2" />
            <line
              x1={boxX + boxW + 12}
              y1={boxY}
              x2={boxX + boxW + 12}
              y2={boxY + boxH}
              stroke="#f59e0b"
              strokeWidth="1.2"
              markerStart={`url(#cad-arrow-left-${category})`}
              markerEnd={`url(#cad-arrow-${category})`}
            />
            <g transform={`translate(${boxX + boxW + 12}, ${midY}) rotate(90)`}>
              <rect
                x="-30"
                y="-7"
                width="60"
                height="14"
                rx="3"
                fill="#090d16"
                stroke="#334155"
                strokeWidth="0.5"
              />
              <text
                x="0"
                y="0"
                fill="#fbbf24"
                fontSize="9.5"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="monospace"
              >
                {height} mm
              </text>
            </g>
          </g>
        )}

        {/* ================= DESENHOS TÉCNICOS ARQUITETÔNICOS POR CATEGORIA E FOLHAS ================= */}

        {/* ESPELHO */}
        {category === 'espelho' && (
          <g>
            <rect
              x={boxX}
              y={boxY}
              width={boxW}
              height={boxH}
              fill="rgba(241, 245, 249, 0.9)"
              stroke={hwStyle.stroke}
              strokeWidth="2"
              rx="2"
            />
            {/* Chanfro Bisotê Realista 25mm */}
            <polygon
              points={`${boxX},${boxY} ${boxX + boxW},${boxY} ${boxX + boxW - 8},${boxY + 8} ${boxX + 8},${boxY + 8}`}
              fill="rgba(255, 255, 255, 0.6)"
            />
            <polygon
              points={`${boxX + boxW},${boxY} ${boxX + boxW},${boxY + boxH} ${boxX + boxW - 8},${boxY + boxH - 8} ${boxX + boxW - 8},${boxY + 8}`}
              fill="rgba(203, 213, 225, 0.6)"
            />
            <polygon
              points={`${boxX},${boxY + boxH} ${boxX + boxW},${boxY + boxH} ${boxX + boxW - 8},${boxY + boxH - 8} ${boxX + 8},${boxY + boxH - 8}`}
              fill="rgba(148, 163, 184, 0.6)"
            />
            <polygon
              points={`${boxX},${boxY} ${boxX},${boxY + boxH} ${boxX + 8},${boxY + boxH - 8} ${boxX + 8},${boxY + 8}`}
              fill="rgba(226, 232, 240, 0.6)"
            />
            <rect
              x={boxX + 8}
              y={boxY + 8}
              width={boxW - 16}
              height={boxH - 16}
              fill="rgba(248, 250, 252, 0.95)"
              stroke="#cbd5e1"
              strokeWidth="0.5"
            />
            <line x1={boxX + 12} y1={boxY + 12} x2={boxX + boxW - 12} y2={boxY + boxH - 12} stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.8" />
            <line x1={boxX + 22} y1={boxY + 12} x2={boxX + boxW - 12} y2={boxY + boxH - 22} stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.5" />
            
            <text x={midX} y={midY} fill="#64748b" fontSize="7.5" fontWeight="bold" textAnchor="middle" letterSpacing="1">
              ESPELHO CRISTAL
            </text>
          </g>
        )}

        {/* GUARDA-CORPO / SACADA */}
        {category === 'guarda_corpo' && (
          <g>
            <rect
              x={boxX}
              y={boxY + 6}
              width={boxW}
              height={boxH - 16}
              fill={glassStyle.fill}
              stroke={glassStyle.stroke}
              strokeWidth="1.5"
              rx="3"
            />
            <rect x={boxX} y={boxY + 6} width={boxW} height={boxH - 16} fill="url(#glassGloss)" rx="3" />

            {/* Corrimão Tubular / Perfil Superior */}
            <rect x={boxX - 2} y={boxY} width={boxW + 4} height="6" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1.5" />

            {/* Torres / Spigots de Fixação Inox */}
            <rect x={boxX + boxW * 0.18 - 3} y={boxY + boxH - 12} width="6" height="12" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.5" rx="1" />
            <rect x={boxX + boxW * 0.82 - 3} y={boxY + boxH - 12} width="6" height="12" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.5" rx="1" />
            {boxW > 80 && (
              <rect x={midX - 3} y={boxY + boxH - 12} width="6" height="12" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.5" rx="1" />
            )}

            {/* Base de fixação no piso */}
            <line x1={boxX - 4} y1={boxY + boxH} x2={boxX + boxW + 4} y2={boxY + boxH} stroke="#475569" strokeWidth="2" strokeDasharray="4,2" />

            <text x={midX} y={midY} fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">
              VIDRO LAMINADO / TEMPERADO
            </text>
          </g>
        )}

        {/* 4 FOLHAS (2 FIXAS + 2 MÓVEIS - Abertura Central) */}
        {config.count === 4 && category !== 'espelho' && category !== 'guarda_corpo' && (
          <g>
            {/* Trilho Superior */}
            <rect x={boxX - 2} y={boxY - 4} width={boxW + 4} height="6" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />
            {/* Trilho Inferior */}
            <rect x={boxX - 2} y={boxY + boxH - 2} width={boxW + 4} height="5" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />

            {/* Perfis Laterais */}
            <rect x={boxX - 2} y={boxY} width="4" height={boxH} fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" />
            <rect x={boxX + boxW - 2} y={boxY} width="4" height={boxH} fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" />

            {(() => {
              const leafW = boxW / 4;
              const x1 = boxX;
              const x2 = boxX + leafW;
              const x3 = boxX + leafW * 2;
              const x4 = boxX + leafW * 3;

              return (
                <>
                  {/* Folha 1 (Esquerda - FIXA) */}
                  <rect x={x1 + 1} y={boxY + 2} width={leafW - 2} height={boxH - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.2" rx="1" />
                  <rect x={x1 + 1} y={boxY + 2} width={leafW - 2} height={boxH - 4} fill="url(#glassGloss)" rx="1" />

                  {/* Folha 2 (Centro-Esquerda - MÓVEL) */}
                  <rect x={x2 + 1} y={boxY + 2} width={leafW - 2} height={boxH - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.5" rx="1" />
                  <rect x={x2 + 1} y={boxY + 2} width={leafW - 2} height={boxH - 4} fill="url(#glassGloss)" rx="1" />

                  {/* Folha 3 (Centro-Direita - MÓVEL) */}
                  <rect x={x3 + 1} y={boxY + 2} width={leafW - 2} height={boxH - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.5" rx="1" />
                  <rect x={x3 + 1} y={boxY + 2} width={leafW - 2} height={boxH - 4} fill="url(#glassGloss)" rx="1" />

                  {/* Folha 4 (Direita - FIXA) */}
                  <rect x={x4 + 1} y={boxY + 2} width={leafW - 2} height={boxH - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.2" rx="1" />
                  <rect x={x4 + 1} y={boxY + 2} width={leafW - 2} height={boxH - 4} fill="url(#glassGloss)" rx="1" />

                  {/* Divisores Verticais */}
                  <line x1={x2} y1={boxY} x2={x2} y2={boxY + boxH} stroke={hwStyle.stroke} strokeWidth="2" />
                  <line x1={midX} y1={boxY} x2={midX} y2={boxY + boxH} stroke={hwStyle.stroke} strokeWidth="2.5" />
                  <line x1={x4} y1={boxY} x2={x4} y2={boxY + boxH} stroke={hwStyle.stroke} strokeWidth="2" />

                  {/* Roldanas */}
                  <circle cx={x2 + leafW * 0.4} cy={boxY - 1} r="2.2" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.5" />
                  <circle cx={x2 + leafW * 0.8} cy={boxY - 1} r="2.2" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.5" />
                  <circle cx={x3 + leafW * 0.2} cy={boxY - 1} r="2.2" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.5" />
                  <circle cx={x3 + leafW * 0.6} cy={boxY - 1} r="2.2" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.5" />

                  {/* Fecho Central */}
                  <rect x={midX - 2.5} y={midY - 12} width="5" height="24" rx="1.5" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.8" />
                  
                  {/* Setas para fora */}
                  <path
                    d={`M ${midX - 6} ${boxY + boxH * 0.8} L ${x2 + 4} ${boxY + boxH * 0.8}`}
                    stroke="#fbbf24"
                    strokeWidth="1.2"
                    markerEnd={`url(#cad-arrow-${category})`}
                  />
                  <path
                    d={`M ${midX + 6} ${boxY + boxH * 0.8} L ${x3 + leafW - 4} ${boxY + boxH * 0.8}`}
                    stroke="#fbbf24"
                    strokeWidth="1.2"
                    markerEnd={`url(#cad-arrow-${category})`}
                  />

                  {/* Badges F e M */}
                  <text x={x1 + leafW / 2} y={boxY + 12} fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">F</text>
                  <text x={x2 + leafW / 2} y={boxY + 12} fill="#38bdf8" fontSize="7" fontWeight="bold" textAnchor="middle">M</text>
                  <text x={x3 + leafW / 2} y={boxY + 12} fill="#38bdf8" fontSize="7" fontWeight="bold" textAnchor="middle">M</text>
                  <text x={x4 + leafW / 2} y={boxY + 12} fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">F</text>
                </>
              );
            })()}
          </g>
        )}

        {/* 3 FOLHAS (2F+1M ou Versatik 3 Folhas) */}
        {config.count === 3 && category !== 'espelho' && category !== 'guarda_corpo' && (
          <g>
            <rect x={boxX - 2} y={boxY - 4} width={boxW + 4} height="6" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />
            <rect x={boxX - 2} y={boxY + boxH - 2} width={boxW + 4} height="5" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />

            {(() => {
              const leafW = boxW / 3;
              return (
                <>
                  <rect x={boxX + 1} y={boxY + 2} width={leafW - 2} height={boxH - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.2" rx="1" />
                  <rect x={boxX + leafW + 1} y={boxY + 2} width={leafW - 2} height={boxH - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.5" rx="1" />
                  <rect x={boxX + leafW * 2 + 1} y={boxY + 2} width={leafW - 2} height={boxH - 4} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.2" rx="1" />
                  <rect x={boxX} y={boxY} width={boxW} height={boxH} fill="url(#glassGloss)" />

                  <line x1={boxX + leafW} y1={boxY} x2={boxX + leafW} y2={boxY + boxH} stroke={hwStyle.stroke} strokeWidth="2" />
                  <line x1={boxX + leafW * 2} y1={boxY} x2={boxX + leafW * 2} y2={boxY + boxH} stroke={hwStyle.stroke} strokeWidth="2" />

                  <rect x={boxX + leafW + 4} y={midY - 10} width="3" height="20" rx="1" fill={hwStyle.accent} />
                  <path
                    d={`M ${boxX + leafW * 1.5} ${boxY + boxH * 0.8} L ${boxX + leafW * 0.4} ${boxY + boxH * 0.8}`}
                    stroke="#fbbf24"
                    strokeWidth="1.2"
                    markerEnd={`url(#cad-arrow-${category})`}
                  />

                  <text x={boxX + leafW / 2} y={boxY + 12} fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">F</text>
                  <text x={boxX + leafW * 1.5} y={boxY + 12} fill="#38bdf8" fontSize="7" fontWeight="bold" textAnchor="middle">M</text>
                  <text x={boxX + leafW * 2.5} y={boxY + 12} fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">F</text>
                </>
              );
            })()}
          </g>
        )}

        {/* 6 FOLHAS (4F + 2M ou 6 Folhas de Correr) */}
        {config.count === 6 && category !== 'espelho' && category !== 'guarda_corpo' && (
          <g>
            {/* Trilho Superior */}
            <rect x={boxX - 2} y={boxY - 4} width={boxW + 4} height="6" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />
            {/* Trilho Inferior */}
            <rect x={boxX - 2} y={boxY + boxH - 2} width={boxW + 4} height="5" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />

            {/* Perfis Laterais */}
            <rect x={boxX - 2} y={boxY} width="4" height={boxH} fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" />
            <rect x={boxX + boxW - 2} y={boxY} width="4" height={boxH} fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" />

            {(() => {
              const leafW = boxW / 6;
              const leafTypes = ['F', 'F', 'M', 'M', 'F', 'F'];

              return (
                <>
                  {[0, 1, 2, 3, 4, 5].map((i) => {
                    const lx = boxX + i * leafW;
                    const isMobile = leafTypes[i] === 'M';

                    return (
                      <React.Fragment key={i}>
                        {/* Painel de Vidro da Folha */}
                        <rect
                          x={lx + 1}
                          y={boxY + 2}
                          width={leafW - 2}
                          height={boxH - 4}
                          fill={glassStyle.fill}
                          stroke={glassStyle.stroke}
                          strokeWidth={isMobile ? '1.5' : '1.2'}
                          rx="1"
                        />
                        <rect
                          x={lx + 1}
                          y={boxY + 2}
                          width={leafW - 2}
                          height={boxH - 4}
                          fill="url(#glassGloss)"
                          rx="1"
                        />

                        {/* Divisórias Verticais entre Folhas */}
                        {i > 0 && (
                          <line
                            x1={lx}
                            y1={boxY}
                            x2={lx}
                            y2={boxY + boxH}
                            stroke={hwStyle.stroke}
                            strokeWidth={i === 3 ? '2.5' : '1.8'}
                          />
                        )}

                        {/* Roldanas nas Folhas Móveis (3ª e 4ª Folhas) */}
                        {isMobile && (
                          <circle
                            cx={lx + leafW / 2}
                            cy={boxY - 1}
                            r="2"
                            fill={hwStyle.accent}
                            stroke="#0f172a"
                            strokeWidth="0.5"
                          />
                        )}

                        {/* Badge de Identificação da Folha (F ou M) */}
                        <text
                          x={lx + leafW / 2}
                          y={boxY + 12}
                          fill={isMobile ? '#38bdf8' : '#94a3b8'}
                          fontSize="6.5"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {leafTypes[i]}
                        </text>
                      </React.Fragment>
                    );
                  })}

                  {/* Fecho Central entre as Folhas Móveis Centrais */}
                  <rect
                    x={midX - 2}
                    y={midY - 10}
                    width="4"
                    height="20"
                    rx="1"
                    fill={hwStyle.accent}
                    stroke="#0f172a"
                    strokeWidth="0.6"
                  />

                  {/* Setas de Abertura Deslizante Bilaterais */}
                  <path
                    d={`M ${midX - 5} ${boxY + boxH * 0.82} L ${boxX + leafW * 1.5} ${boxY + boxH * 0.82}`}
                    stroke="#fbbf24"
                    strokeWidth="1.2"
                    markerEnd={`url(#cad-arrow-${category})`}
                  />
                  <path
                    d={`M ${midX + 5} ${boxY + boxH * 0.82} L ${boxX + leafW * 4.5} ${boxY + boxH * 0.82}`}
                    stroke="#fbbf24"
                    strokeWidth="1.2"
                    markerEnd={`url(#cad-arrow-${category})`}
                  />
                </>
              );
            })()}
          </g>
        )}

        {/* 1 FOLHA: MAXIM-AR / BASCULANTE */}
        {(config.type === 'maxim_ar' || config.type === 'basculante') && (
          <g>
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="2.5" rx="2" />
            <rect x={boxX + 4} y={boxY + 4} width={boxW - 8} height={boxH - 8} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.5" rx="1" />
            <rect x={boxX + 4} y={boxY + 4} width={boxW - 8} height={boxH - 8} fill="url(#glassGloss)" />

            <polyline
              points={`${boxX + 4},${boxY + 4} ${midX},${boxY + boxH - 6} ${boxX + boxW - 4},${boxY + 4}`}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.2"
              strokeDasharray="4,3"
            />

            <rect x={midX - 4} y={boxY + boxH - 10} width="8" height="4" rx="1" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.5" />
            
            <text x={midX} y={boxY + 14} fill="#fbbf24" fontSize="7" fontWeight="bold" textAnchor="middle">
              {config.type === 'maxim_ar' ? 'MAXIM-AR' : 'BASCULANTE'}
            </text>
          </g>
        )}

        {/* 1 FOLHA: PIVOTANTE OU GIRO */}
        {(config.type === 'pivotante' || config.type === 'giro_1f') && (
          <g>
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="2" rx="2" />
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill="url(#glassGloss)" />

            {config.type === 'pivotante' ? (
              <>
                <line x1={boxX + boxW * 0.18} y1={boxY} x2={boxX + boxW * 0.18} y2={boxY + boxH} stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />
                <circle cx={boxX + boxW * 0.18} cy={boxY + 3} r="3" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.8" />
                <circle cx={boxX + boxW * 0.18} cy={boxY + boxH - 3} r="3" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.8" />
                
                <rect x={boxX + boxW * 0.82} y={midY - 25} width="4" height="50" rx="2" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.8" />
                <circle cx={boxX + boxW * 0.82 + 2} cy={midY - 20} r="1.5" fill="#ffffff" />
                <circle cx={boxX + boxW * 0.82 + 2} cy={midY + 20} r="1.5" fill="#ffffff" />

                <path
                  d={`M ${boxX + boxW * 0.82} ${boxY + boxH - 8} A 20 20 0 0 1 ${boxX + boxW * 0.65} ${boxY + boxH - 4}`}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.2"
                  strokeDasharray="2,2"
                />
              </>
            ) : (
              <>
                <rect x={boxX} y={boxY + boxH * 0.2} width="4" height="10" fill={hwStyle.accent} />
                <rect x={boxX} y={boxY + boxH * 0.8} width="4" height="10" fill={hwStyle.accent} />
                <rect x={boxX + boxW - 8} y={midY - 4} width="6" height="8" rx="1" fill={hwStyle.accent} />
              </>
            )}

            <text x={midX} y={boxY + 14} fill="#38bdf8" fontSize="7" fontWeight="bold" textAnchor="middle">
              {config.type === 'pivotante' ? 'PORTA PIVOTANTE' : 'PORTA DE ABRIR'}
            </text>
          </g>
        )}

        {/* 1 FOLHA: FIXO INTEIRO */}
        {config.type === 'fixo_1f' && (
          <g>
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill={glassStyle.fill} stroke={glassStyle.stroke} strokeWidth="1.8" rx="1" />
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill="url(#glassGloss)" />
            
            <rect x={boxX} y={boxY} width={boxW} height="4" fill={hwStyle.fill} />
            <rect x={boxX} y={boxY + boxH - 4} width={boxW} height="4" fill={hwStyle.fill} />
            
            <text x={midX} y={midY} fill="#94a3b8" fontSize="7.5" fontWeight="bold" textAnchor="middle">
              PAINEL FIXO INTEIRO
            </text>
          </g>
        )}

        {/* ================= 2 FOLHAS PADRÃO (COM DIVISÃO CLARA NO MEIO) ================= */}
        {(config.count === 2 || (!config.type && config.count !== 1 && config.count !== 3 && config.count !== 4 && config.count !== 6)) &&
          category !== 'espelho' &&
          category !== 'guarda_corpo' && (
            <g>
              {/* Marco Externo / Trilho Superior */}
              {name.toLowerCase().includes('elegance') || name.toLowerCase().includes('roldana') ? (
                // Tubo Redondo Inox Elegance
                <>
                  <rect x={boxX - 3} y={boxY - 3} width={boxW + 6} height="5" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.8" rx="2" />
                  <circle cx={boxX + boxW * 0.18} cy={boxY - 1} r="4" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="1" />
                  <circle cx={boxX + boxW * 0.38} cy={boxY - 1} r="4" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="1" />
                  <circle cx={boxX + boxW * 0.18} cy={boxY - 1} r="1.5" fill="#0f172a" />
                  <circle cx={boxX + boxW * 0.38} cy={boxY - 1} r="1.5" fill="#0f172a" />
                </>
              ) : (
                // Trilho Tradicional Cabeçalho
                <>
                  <rect x={boxX - 2} y={boxY - 4} width={boxW + 4} height="6" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />
                  {/* Roldanas no Trilho da Folha Móvel */}
                  <circle cx={boxX + boxW * 0.18} cy={boxY - 1} r="2.2" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.5" />
                  <circle cx={boxX + boxW * 0.38} cy={boxY - 1} r="2.2" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.5" />
                </>
              )}

              {/* Trilho Inferior e Guia */}
              <rect x={boxX - 2} y={boxY + boxH - 2} width={boxW + 4} height="5" fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" rx="1" />

              {/* Perfis U laterais (batedor e fixação na parede) */}
              <rect x={boxX - 2} y={boxY} width="4" height={boxH} fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" />
              <rect x={boxX + boxW - 2} y={boxY} width="4" height={boxH} fill={hwStyle.fill} stroke={hwStyle.stroke} strokeWidth="1" />

              {/* FOLHA 1 (ESQUERDA - MÓVEL) */}
              <rect
                x={boxX + 1}
                y={boxY + 2}
                width={boxW / 2 - 2}
                height={boxH - 4}
                fill={glassStyle.fill}
                stroke={glassStyle.stroke}
                strokeWidth="1.5"
                rx="1"
              />
              <rect
                x={boxX + 1}
                y={boxY + 2}
                width={boxW / 2 - 2}
                height={boxH - 4}
                fill="url(#glassGloss)"
                rx="1"
              />
              {/* Brilho da Folha 1 */}
              <line x1={boxX + 6} y1={boxY + 6} x2={boxX + boxW * 0.38} y2={boxY + boxH * 0.75} stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.45" />

              {/* FOLHA 2 (DIREITA - FIXA) */}
              <rect
                x={midX + 2}
                y={boxY + 2}
                width={boxW / 2 - 3}
                height={boxH - 4}
                fill={glassStyle.fill}
                stroke={glassStyle.stroke}
                strokeWidth="1.5"
                rx="1"
              />
              <rect
                x={midX + 2}
                y={boxY + 2}
                width={boxW / 2 - 3}
                height={boxH - 4}
                fill="url(#glassGloss)"
                rx="1"
              />
              {/* Brilho da Folha 2 */}
              <line x1={midX + 8} y1={boxY + 6} x2={boxX + boxW - 8} y2={boxY + boxH * 0.75} stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.45" />

              {/* ================= DIVISÃO NO MEIO BEM NÍTIDA (PERFIL / MONTANTE CENTRAL) ================= */}
              {/* Perfil central de transpasse */}
              <rect
                x={midX - 2.5}
                y={boxY}
                width="5"
                height={boxH}
                fill={hwStyle.fill}
                stroke={hwStyle.stroke}
                strokeWidth="1.2"
                rx="0.5"
              />
              {/* Linha divisória vertical no centro exato */}
              <line
                x1={midX}
                y1={boxY}
                x2={midX}
                y2={boxY + boxH}
                stroke={hwStyle.accent}
                strokeWidth="1.5"
              />

              {/* Puxador na Folha Móvel (Esquerda) */}
              {category === 'box' ? (
                // Puxador Ponto / Concha do Box
                <circle cx={boxX + boxW * 0.38} cy={midY} r="3.5" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="1" />
              ) : (
                // Puxador Tubular Duplo / Fechadura
                <g>
                  <rect x={boxX + boxW * 0.38} y={midY - 14} width="3.5" height="28" rx="1.5" fill={hwStyle.accent} stroke="#0f172a" strokeWidth="0.8" />
                  <circle cx={boxX + boxW * 0.38 + 1.75} cy={midY - 10} r="1" fill="#ffffff" />
                  <circle cx={boxX + boxW * 0.38 + 1.75} cy={midY + 10} r="1" fill="#ffffff" />
                </g>
              )}

              {/* Seta indicativa de correr (Folha Móvel deslizando para a esquerda) */}
              <path
                d={`M ${boxX + boxW * 0.32} ${boxY + boxH * 0.82} L ${boxX + boxW * 0.12} ${boxY + boxH * 0.82}`}
                stroke="#fbbf24"
                strokeWidth="1.3"
                markerEnd={`url(#cad-arrow-${category})`}
              />

              {/* Identificação das 2 Folhas (MÓVEL e FIXO) */}
              <g>
                <rect x={boxX + boxW * 0.25 - 20} y={boxY + 6} width="40" height="12" rx="2" fill="#0369a1" fillOpacity="0.85" />
                <text x={boxX + boxW * 0.25} y={boxY + 13.5} fill="#ffffff" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                  MÓVEL (M)
                </text>
              </g>

              <g>
                <rect x={boxX + boxW * 0.75 - 18} y={boxY + 6} width="36" height="12" rx="2" fill="#334155" fillOpacity="0.85" />
                <text x={boxX + boxW * 0.75} y={boxY + 13.5} fill="#e2e8f0" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                  FIXO (F)
                </text>
              </g>
            </g>
          )}

        {/* ================= RODAPÉ: INFORMAÇÃO TÉCNICA E NOME ================= */}
        <text
          x={svgW / 2}
          y={svgH - 6}
          fill="#94a3b8"
          fontSize="7.5"
          fontWeight="bold"
          textAnchor="middle"
          className="uppercase tracking-wider"
        >
          {name.length > 34 ? name.substring(0, 34) + '...' : name}
          {!compact && ` • ${config.label}`}
        </text>
      </svg>
    </div>
  );
};
