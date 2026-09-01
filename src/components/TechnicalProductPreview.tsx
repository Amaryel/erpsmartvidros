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
  className?: string;
}

export function detectTechnicalCategory(name: string = '', explicitCategory?: TechnicalCategory): TechnicalCategory {
  if (explicitCategory && explicitCategory !== 'outro') return explicitCategory;
  const n = name.toLowerCase();

  if (n.includes('box') || n.includes('banheiro') || n.includes('chuveiro')) return 'box';
  if (n.includes('porta') || n.includes('pivotante') || n.includes('portao') || n.includes('passagem')) return 'porta';
  if (n.includes('janela') || n.includes('maxim') || n.includes('basculante') || n.includes('veneziana')) return 'janela';
  if (n.includes('espelho') || n.includes('bisote') || n.includes('prata')) return 'espelho';
  if (n.includes('guarda') || n.includes('corrim') || n.includes('sacada') || n.includes('peitoril')) return 'guarda_corpo';
  if (n.includes('vidro') || n.includes('painel') || n.includes('fachada') || n.includes('divis')) return 'vidro';

  return 'porta';
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

  // Cores de vidro simuladas
  const getGlassFill = () => {
    const gc = glassColor.toLowerCase();
    if (gc.includes('fumê') || gc.includes('fume') || gc.includes('cinza')) return 'rgba(71, 85, 105, 0.45)';
    if (gc.includes('verde')) return 'rgba(16, 185, 129, 0.35)';
    if (gc.includes('bronze')) return 'rgba(180, 83, 9, 0.35)';
    if (gc.includes('astral') || gc.includes('azul')) return 'rgba(14, 165, 233, 0.35)';
    return 'rgba(224, 242, 254, 0.55)'; // Incolor límpido
  };

  const getHardwareStroke = () => {
    const hc = hardwareColor.toLowerCase();
    if (hc.includes('branco')) return '#e2e8f0';
    if (hc.includes('fosco') || hc.includes('natural') || hc.includes('alum')) return '#94a3b8';
    if (hc.includes('bronze')) return '#78350f';
    if (hc.includes('ouro') || hc.includes('dourado') || hc.includes('champagne')) return '#d97706';
    if (hc.includes('cromado') || hc.includes('inox')) return '#64748b';
    return '#1e293b'; // Preto padrão
  };

  const glassFill = getGlassFill();
  const hardwareStroke = getHardwareStroke();

  // Dimensões do viewBox e margens para cotas
  const svgW = compact ? 220 : 280;
  const svgH = compact ? 160 : 200;

  // Área útil do desenho técnico
  const padLeft = 38;
  const padRight = 38;
  const padTop = 32;
  const padBottom = 22;

  const drawAreaW = svgW - padLeft - padRight;
  const drawAreaH = svgH - padTop - padBottom;

  // Aspect ratio proporcional limitado para não distorcer exageradamente
  const rawRatio = width > 0 && height > 0 ? width / height : 1;
  const clampedRatio = Math.max(0.45, Math.min(2.2, rawRatio));

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
      className={`relative inline-flex flex-col items-center justify-center bg-slate-900/90 text-slate-100 rounded-xl border border-slate-800 p-2 select-none notranslate ${className}`}
      translate="no"
    >
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full h-auto max-h-48 drop-shadow-sm font-sans"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Marcador de seta para cotas */}
          <marker
            id={`arrow-start-${category}`}
            viewBox="0 0 10 10"
            refX="2"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 5 L 8 1.5 L 8 8.5 z" fill="#f59e0b" />
          </marker>
          <marker
            id={`arrow-end-${category}`}
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
          </marker>

          {/* Gradiente de reflexo de vidro */}
          <linearGradient id="glassReflect" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* ================= LINHAS DE COTA (SUPERIOR - LARGURA) ================= */}
        {/* Linhas de extensão verticais */}
        <line x1={boxX} y1={boxY - 4} x2={boxX} y2={boxY - 18} stroke="#64748b" strokeWidth="0.75" strokeDasharray="2,2" />
        <line x1={boxX + boxW} y1={boxY - 4} x2={boxX + boxW} y2={boxY - 18} stroke="#64748b" strokeWidth="0.75" strokeDasharray="2,2" />
        {/* Linha dimensional horizontal com setas */}
        <line
          x1={boxX}
          y1={boxY - 12}
          x2={boxX + boxW}
          y2={boxY - 12}
          stroke="#f59e0b"
          strokeWidth="1.2"
          markerStart={`url(#arrow-start-${category})`}
          markerEnd={`url(#arrow-end-${category})`}
        />
        {/* Texto da Largura */}
        <rect
          x={midX - 32}
          y={boxY - 22}
          width="64"
          height="14"
          rx="3"
          fill="#0f172a"
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

        {/* ================= LINHAS DE COTA (LATERAL DIREITA - ALTURA) ================= */}
        {/* Linhas de extensão horizontais */}
        <line x1={boxX + boxW + 4} y1={boxY} x2={boxX + boxW + 18} y2={boxY} stroke="#64748b" strokeWidth="0.75" strokeDasharray="2,2" />
        <line x1={boxX + boxW + 4} y1={boxY + boxH} x2={boxX + boxW + 18} y2={boxY + boxH} stroke="#64748b" strokeWidth="0.75" strokeDasharray="2,2" />
        {/* Linha dimensional vertical com setas */}
        <line
          x1={boxX + boxW + 12}
          y1={boxY}
          x2={boxX + boxW + 12}
          y2={boxY + boxH}
          stroke="#f59e0b"
          strokeWidth="1.2"
          markerStart={`url(#arrow-start-${category})`}
          markerEnd={`url(#arrow-end-${category})`}
        />
        {/* Texto da Altura */}
        <g transform={`translate(${boxX + boxW + 12}, ${midY}) rotate(90)`}>
          <rect
            x="-30"
            y="-7"
            width="60"
            height="14"
            rx="3"
            fill="#0f172a"
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

        {/* ================= DESENHO VETORIAL DO PRODUTO ================= */}
        
        {/* CASO 1: PORTA (Correr ou Pivotante) */}
        {category === 'porta' && (
          <g>
            {/* Marco/Perfil Externo */}
            <rect
              x={boxX}
              y={boxY}
              width={boxW}
              height={boxH}
              fill={glassFill}
              stroke={hardwareStroke}
              strokeWidth="2.5"
              rx="2"
            />
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill="url(#glassReflect)" />

            {/* Trilho superior / Cabeçalho */}
            <rect x={boxX - 2} y={boxY - 3} width={boxW + 4} height="5" fill={hardwareStroke} rx="1" />
            
            {/* Divisão de 2 Folhas (1 Fixa + 1 Móvel) ou 4 Folhas */}
            <line x1={midX} y1={boxY} x2={midX} y2={boxY + boxH} stroke={hardwareStroke} strokeWidth="2" strokeDasharray="4,2" />

            {/* Puxador Tubular no Painel Móvel */}
            <rect
              x={boxX + boxW * 0.42}
              y={midY - 14}
              width="3"
              height="28"
              rx="1.5"
              fill="#fbbf24"
              stroke="#b45309"
              strokeWidth="0.5"
            />
            <circle cx={boxX + boxW * 0.42 + 1.5} cy={midY - 10} r="1.5" fill="#f8fafc" />
            <circle cx={boxX + boxW * 0.42 + 1.5} cy={midY + 10} r="1.5" fill="#f8fafc" />

            {/* Seta de Abertura Deslizante */}
            <path
              d={`M ${boxX + boxW * 0.32} ${boxY + boxH * 0.85} L ${boxX + boxW * 0.15} ${boxY + boxH * 0.85}`}
              stroke="#fbbf24"
              strokeWidth="1.5"
              markerEnd={`url(#arrow-end-${category})`}
            />
            {/* Indicador de Fixo e Móvel */}
            <text x={boxX + boxW * 0.25} y={boxY + 14} fill="#94a3b8" fontSize="7.5" fontWeight="bold" textAnchor="middle">
              MÓVEL
            </text>
            <text x={boxX + boxW * 0.75} y={boxY + 14} fill="#94a3b8" fontSize="7.5" fontWeight="bold" textAnchor="middle">
              FIXO
            </text>
          </g>
        )}

        {/* CASO 2: JANELA (2F ou 4F) */}
        {category === 'janela' && (
          <g>
            {/* Marco de Alumínio */}
            <rect
              x={boxX}
              y={boxY}
              width={boxW}
              height={boxH}
              fill={glassFill}
              stroke={hardwareStroke}
              strokeWidth="3"
              rx="2"
            />
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill="url(#glassReflect)" />

            {/* Divisão Central das Folhas */}
            <line x1={midX} y1={boxY} x2={midX} y2={boxY + boxH} stroke={hardwareStroke} strokeWidth="2.5" />

            {/* Sub-quadros internos */}
            <rect
              x={boxX + 3}
              y={boxY + 3}
              width={boxW / 2 - 4}
              height={boxH - 6}
              fill="none"
              stroke={hardwareStroke}
              strokeWidth="1.2"
            />
            <rect
              x={midX + 1}
              y={boxY + 3}
              width={boxW / 2 - 4}
              height={boxH - 6}
              fill="none"
              stroke={hardwareStroke}
              strokeWidth="1.2"
            />

            {/* Fecho Concha Central */}
            <rect x={midX - 2.5} y={midY - 6} width="5" height="12" rx="1" fill="#fbbf24" />

            {/* Setas de Correr Direita / Esquerda */}
            <path
              d={`M ${boxX + 10} ${boxY + boxH * 0.75} L ${boxX + boxW * 0.35} ${boxY + boxH * 0.75}`}
              stroke="#fbbf24"
              strokeWidth="1.2"
              markerEnd={`url(#arrow-end-${category})`}
            />
            <path
              d={`M ${boxX + boxW - 10} ${boxY + boxH * 0.75} L ${boxX + boxW * 0.65} ${boxY + boxH * 0.75}`}
              stroke="#fbbf24"
              strokeWidth="1.2"
              markerEnd={`url(#arrow-end-${category})`}
            />
          </g>
        )}

        {/* CASO 3: BOX DE BANHEIRO (Frontal / Canto Fixo + Porta) */}
        {category === 'box' && (
          <g>
            {/* Vidro do Box */}
            <rect
              x={boxX}
              y={boxY}
              width={boxW}
              height={boxH}
              fill={glassFill}
              stroke={hardwareStroke}
              strokeWidth="2"
              rx="1"
            />
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill="url(#glassReflect)" />

            {/* Tubo Superior / Trilho Redondo ou Tradicional */}
            <rect x={boxX - 2} y={boxY - 4} width={boxW + 4} height="6" fill={hardwareStroke} rx="1" />
            
            {/* Roldanas Aparentes / Sistema Deslizante */}
            <circle cx={boxX + boxW * 0.28} cy={boxY - 1} r="3" fill="#fbbf24" stroke="#92400e" strokeWidth="0.8" />
            <circle cx={boxX + boxW * 0.45} cy={boxY - 1} r="3" fill="#fbbf24" stroke="#92400e" strokeWidth="0.8" />

            {/* Divisão Central (Transpasse de 5cm / 50mm) */}
            <line x1={midX} y1={boxY} x2={midX} y2={boxY + boxH} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,3" />

            {/* Puxador do Box (Puxador Ponto / Concha) */}
            <circle cx={boxX + boxW * 0.38} cy={midY} r="3.5" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />

            {/* Batedor e Guia de Piso */}
            <rect x={midX - 3} y={boxY + boxH - 4} width="6" height="4" fill={hardwareStroke} />

            {/* Identificação Técnica */}
            <text x={boxX + boxW * 0.25} y={boxY + 13} fill="#38bdf8" fontSize="7" fontWeight="bold" textAnchor="middle">
              PORTA
            </text>
            <text x={boxX + boxW * 0.75} y={boxY + 13} fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">
              FIXO
            </text>
          </g>
        )}

        {/* CASO 4: ESPELHO (Lapidado ou Bisotê) */}
        {category === 'espelho' && (
          <g>
            {/* Espelho com fundo prateado elegante */}
            <rect
              x={boxX}
              y={boxY}
              width={boxW}
              height={boxH}
              fill="rgba(241, 245, 249, 0.85)"
              stroke="#94a3b8"
              strokeWidth="1.5"
              rx="2"
            />
            {/* Linha interna de Bisotê 25mm */}
            <rect
              x={boxX + 6}
              y={boxY + 6}
              width={boxW - 12}
              height={boxH - 12}
              fill="rgba(226, 232, 240, 0.5)"
              stroke="#cbd5e1"
              strokeWidth="0.75"
              strokeDasharray="2,1"
            />
            {/* Brilho diagonal do espelho */}
            <line x1={boxX + 8} y1={boxY + 8} x2={boxX + boxW - 8} y2={boxY + boxH - 8} stroke="#ffffff" strokeWidth="2" strokeOpacity="0.7" />
            <line x1={boxX + 16} y1={boxY + 8} x2={boxX + boxW - 8} y2={boxY + boxH - 16} stroke="#ffffff" strokeWidth="1" strokeOpacity="0.4" />

            <text x={midX} y={midY} fill="#475569" fontSize="8" fontWeight="bold" textAnchor="middle">
              ESPELHO PRATA
            </text>
          </g>
        )}

        {/* CASO 5: GUARDA-CORPO / SACADA */}
        {category === 'guarda_corpo' && (
          <g>
            {/* Painel de Vidro */}
            <rect
              x={boxX}
              y={boxY + 4}
              width={boxW}
              height={boxH - 14}
              fill={glassFill}
              stroke="#38bdf8"
              strokeWidth="1.5"
              rx="1"
            />
            <rect x={boxX} y={boxY + 4} width={boxW} height={boxH - 14} fill="url(#glassReflect)" />

            {/* Corrimão / Tubo superior em Inox */}
            <rect x={boxX - 2} y={boxY} width={boxW + 4} height="4" fill={hardwareStroke} rx="1" />

            {/* Torres / Spigots de Fixação no Piso */}
            <rect x={boxX + boxW * 0.2 - 2} y={boxY + boxH - 10} width="4" height="10" fill="#fbbf24" />
            <rect x={boxX + boxW * 0.8 - 2} y={boxY + boxH - 10} width="4" height="10" fill="#fbbf24" />
            {boxW > 80 && (
              <rect x={midX - 2} y={boxY + boxH - 10} width="4" height="10" fill="#fbbf24" />
            )}

            <text x={midX} y={midY} fill="#94a3b8" fontSize="7.5" fontWeight="bold" textAnchor="middle">
              GUARDA-CORPO
            </text>
          </g>
        )}

        {/* CASO 6: VIDRO FIXO / PAINEL / OUTROS */}
        {category === 'vidro' && (
          <g>
            <rect
              x={boxX}
              y={boxY}
              width={boxW}
              height={boxH}
              fill={glassFill}
              stroke={hardwareStroke}
              strokeWidth="1.5"
              rx="1"
            />
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill="url(#glassReflect)" />
            
            {/* Botões / Fendas de fixação */}
            <circle cx={boxX + 5} cy={boxY + 5} r="2.5" fill="#fbbf24" />
            <circle cx={boxX + boxW - 5} cy={boxY + 5} r="2.5" fill="#fbbf24" />
            <circle cx={boxX + 5} cy={boxY + boxH - 5} r="2.5" fill="#fbbf24" />
            <circle cx={boxX + boxW - 5} cy={boxY + boxH - 5} r="2.5" fill="#fbbf24" />

            <text x={midX} y={midY} fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle">
              PAINEL FIXO
            </text>
          </g>
        )}

        {/* Tag do Nome do Produto no Rodapé do SVG */}
        <text
          x={svgW / 2}
          y={svgH - 6}
          fill="#94a3b8"
          fontSize="8"
          fontWeight="bold"
          textAnchor="middle"
          className="uppercase tracking-wider"
        >
          {name.length > 30 ? name.substring(0, 30) + '...' : name}
        </text>
      </svg>
    </div>
  );
};
