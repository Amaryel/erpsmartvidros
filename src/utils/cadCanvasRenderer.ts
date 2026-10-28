import { TechnicalModelDefinition } from '../components/TechnicalProductPreview';
import { TechnicalCategory } from '../types';

export interface CadRenderOptions {
  model: TechnicalModelDefinition;
  category: TechnicalCategory;
  name: string;
  width: number;
  height: number;
  glassColor?: string;
  hardwareColor?: string;
  compact?: boolean;
  showDimensions?: boolean;
}

export function getGlassPalette(glassColor = '') {
  const gc = (glassColor || '').toLowerCase();
  if (gc.includes('fumê') || gc.includes('fume') || gc.includes('cinza') || gc.includes('grafite')) {
    return { fill: 'rgba(51, 65, 85, 0.72)', stroke: '#94a3b8', label: 'Fumê' };
  }
  if (gc.includes('verde')) {
    return { fill: 'rgba(6, 95, 70, 0.72)', stroke: '#34d399', label: 'Verde' };
  }
  if (gc.includes('bronze') || gc.includes('marrom') || gc.includes('champagne')) {
    return { fill: 'rgba(120, 53, 15, 0.72)', stroke: '#fbbf24', label: 'Bronze' };
  }
  if (gc.includes('astral') || gc.includes('azul') || gc.includes('reflecta') || gc.includes('refletivo')) {
    return { fill: 'rgba(3, 105, 161, 0.72)', stroke: '#38bdf8', label: 'Azul' };
  }
  if (gc.includes('jateado') || gc.includes('leitoso') || gc.includes('acidato') || gc.includes('fosco')) {
    return { fill: 'rgba(226, 232, 240, 0.88)', stroke: '#ffffff', label: 'Jateado' };
  }
  // Incolor límpido azulado
  return { fill: 'rgba(2, 132, 199, 0.45)', stroke: '#38bdf8', label: 'Incolor' };
}

export function getHardwarePalette(hardwareColor = '') {
  const hc = (hardwareColor || '').toLowerCase();
  if (hc === '' || hc === 'vazio' || hc === 'nenhum') {
    return { stroke: '#94a3b8', fill: '#334155', accent: '#38bdf8' };
  }
  if (hc.includes('branco')) {
    return { stroke: '#ffffff', fill: '#f8fafc', accent: '#38bdf8' };
  }
  if (hc.includes('fosco') || hc.includes('natural') || hc.includes('anodizado')) {
    return { stroke: '#f8fafc', fill: '#94a3b8', accent: '#38bdf8' };
  }
  if (hc.includes('bronze') || hc.includes('marrom')) {
    return { stroke: '#fbbf24', fill: '#78350f', accent: '#fde047' };
  }
  if (hc.includes('ouro') || hc.includes('dourad') || hc.includes('gold')) {
    return { stroke: '#fde047', fill: '#d97706', accent: '#fef08a' };
  }
  if (hc.includes('cromad') || hc.includes('inox') || hc.includes('prata')) {
    return { stroke: '#ffffff', fill: '#64748b', accent: '#38bdf8' };
  }
  if (hc.includes('champagne')) {
    return { stroke: '#fde68a', fill: '#a88b64', accent: '#fef3c7' };
  }
  // Preto Fosco padrão
  return { stroke: '#94a3b8', fill: '#1e293b', accent: '#fbbf24' };
}

/**
 * Desenha um retângulo com cantos arredondados no canvas com compatibilidade universal
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }
}

/**
 * Renderiza o desenho técnico CAD diretamente para uma string PNG Base64 de alta resolução (2x).
 * 100% puro Canvas 2D sem carregar Image(), sem SVG e sem qualquer restrição de Tainted Canvas.
 */
export function generateCadPng(options: CadRenderOptions): string {
  if (typeof document === 'undefined') return '';

  const {
    model,
    category,
    name,
    width,
    height,
    glassColor,
    hardwareColor,
    compact = true,
    showDimensions = false,
  } = options;

  const svgW = compact ? 220 : 280;
  const svgH = compact ? 160 : 200;

  const canvas = document.createElement('canvas');
  // 2x Retina Resolution para nitidez cirúrgica no PDF e na tela
  canvas.width = svgW * 2;
  canvas.height = svgH * 2;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(2, 2);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const padLeft = showDimensions ? 38 : 16;
  const padRight = showDimensions ? 38 : 16;
  const padTop = showDimensions ? 32 : 14;
  const padBottom = 22;

  const drawAreaW = svgW - padLeft - padRight;
  const drawAreaH = svgH - padTop - padBottom;

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

  const glassStyle = getGlassPalette(glassColor);
  const hwStyle = getHardwarePalette(hardwareColor);

  // 1. Fundo Blueprint com Borda
  ctx.fillStyle = '#090f1d';
  drawRoundedRect(ctx, 0, 0, svgW, svgH, 8);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 2. Grade Técnica Arquitetônica
  ctx.save();
  ctx.strokeStyle = '#16223d';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([3, 3]);
  [0.25, 0.5, 0.75].forEach((f) => {
    ctx.beginPath();
    ctx.moveTo(0, svgH * f);
    ctx.lineTo(svgW, svgH * f);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(svgW * f, 0);
    ctx.lineTo(svgW * f, svgH);
    ctx.stroke();
  });
  ctx.restore();

  // 3. Cotas se solicitado
  if (showDimensions) {
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.2;
    // Cota Superior
    ctx.beginPath();
    ctx.moveTo(boxX, boxY - 12);
    ctx.lineTo(boxX + boxW, boxY - 12);
    ctx.stroke();

    ctx.fillStyle = '#090d16';
    ctx.fillRect(midX - 25, boxY - 18, 50, 12);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(midX - 25, boxY - 18, 50, 12);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${width} mm`, midX, boxY - 12);
    ctx.restore();
  }

  // Helper para desenhar folha de vidro
  const drawGlassLeaf = (x: number, y: number, w: number, h: number, strokeWidth = 1.5) => {
    ctx.fillStyle = glassStyle.fill;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = glassStyle.stroke;
    ctx.lineWidth = strokeWidth;
    ctx.strokeRect(x, y, w, h);
  };

  // Helper para desenhar perfil de alumínio
  const drawProfile = (x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = hwStyle.fill;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = hwStyle.stroke;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  };

  const modelId = model.id;

  // ================= RENDERIZADORES DE MODELOS =================

  // MODELO A: Guarda-Corpo com Torres / Spigots / Sacada na Torre
  if (modelId === 'guarda_corpo_torres' || name.toLowerCase().includes('torre') || name.toLowerCase().includes('sacada na torre')) {
    drawGlassLeaf(boxX + 2, boxY + 4, boxW - 4, boxH - 16, 2);

    // Corrimão fino ou perfil superior
    drawProfile(boxX - 2, boxY + 2, boxW + 4, 3);

    // Duas Torres (Spigots) em Inox/Alumínio na base
    const tW = 6;
    const tH = 15;
    const t1X = boxX + boxW * 0.28 - tW / 2;
    const t2X = boxX + boxW * 0.72 - tW / 2;
    const tY = boxY + boxH - 13;

    [t1X, t2X].forEach((tx) => {
      ctx.fillStyle = hwStyle.accent;
      ctx.fillRect(tx, tY, tW, tH);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(tx, tY, tW, tH);

      // Flange da base
      ctx.fillRect(tx - 3, tY + tH - 3, tW + 6, 3);
      ctx.strokeRect(tx - 3, tY + tH - 3, tW + 6, 3);
    });

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SACADA / GUARDA-CORPO NA TORRE', midX, boxY + 12);
  }
  // MODELO B: Box Fixo / Walk-In / Janela Fixa / Painel Fixo
  else if (modelId === 'box_fixo_walkin' || modelId === 'janela_fixa' || modelId === 'painel_fixo' || (name.toLowerCase().includes('box fixo') && !name.toLowerCase().includes('2f'))) {
    // Perfil U na lateral esquerda
    drawProfile(boxX, boxY, 5, boxH);
    // Vidro
    drawGlassLeaf(boxX + 5, boxY + 4, boxW - 10, boxH - 6, 2);
    // Braço estabilizador no topo
    ctx.fillStyle = hwStyle.accent;
    ctx.fillRect(boxX + 5, boxY + 2, boxW - 6, 3.5);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(boxX + 5, boxY + 2, boxW - 6, 3.5);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BOX FIXO / PAINEL RETO', midX, boxY + 16);
  }
  // MODELO C: Box Elegance (Roldanas Aparentes)
  else if (modelId === 'box_elegance') {
    // Tubo redondo inox no topo
    ctx.fillStyle = hwStyle.accent;
    ctx.fillRect(boxX - 3, boxY - 3, boxW + 6, 5);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(boxX - 3, boxY - 3, boxW + 6, 5);

    // Roldanas aparentes
    [boxX + boxW * 0.16, boxX + boxW * 0.36].forEach((rx) => {
      ctx.fillStyle = hwStyle.accent;
      ctx.beginPath();
      ctx.arc(rx, boxY - 1, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(rx, boxY - 1, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2 Folhas
    drawGlassLeaf(boxX + 1, boxY + 3, boxW / 2 - 2, boxH - 5, 1.5);
    drawGlassLeaf(midX + 2, boxY + 3, boxW / 2 - 3, boxH - 5, 1.5);

    // Puxador Elegance
    ctx.fillStyle = hwStyle.accent;
    ctx.fillRect(boxX + boxW * 0.36, midY - 16, 3, 32);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BOX ELEGANCE (ROLDANA APARENTE)', midX, boxY + 14);
  }
  // MODELO D: 4 Folhas (2F + 2M Central)
  else if (modelId === 'box_frontal_4f' || modelId === 'porta_correr_4f' || modelId === 'janela_correr_4f') {
    drawProfile(boxX - 2, boxY - 4, boxW + 4, 6);
    drawProfile(boxX - 2, boxY + boxH - 2, boxW + 4, 5);

    const leafW = boxW / 4;
    for (let i = 0; i < 4; i++) {
      const lx = boxX + i * leafW;
      const isM = i === 1 || i === 2;
      drawGlassLeaf(lx + 1, boxY + 2, leafW - 2, boxH - 4, isM ? 1.5 : 1.2);

      // Badge Fixo / Móvel
      ctx.fillStyle = isM ? '#0284c7' : '#334155';
      ctx.fillRect(lx + leafW / 2 - 9, boxY + 5, 18, 10);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 5.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isM ? 'MÓVEL' : 'FIXO', lx + leafW / 2, boxY + 10);
    }
    // Fecho central
    ctx.fillStyle = hwStyle.accent;
    ctx.fillRect(midX - 2.5, midY - 14, 5, 28);
  }
  // MODELO E: 3 Folhas (Versatik / 2F+1M)
  else if (modelId === 'box_frontal_3f' || modelId === 'porta_correr_3f') {
    drawProfile(boxX - 2, boxY - 4, boxW + 4, 6);
    drawProfile(boxX - 2, boxY + boxH - 2, boxW + 4, 5);

    const leafW = boxW / 3;
    for (let i = 0; i < 3; i++) {
      const lx = boxX + i * leafW;
      drawGlassLeaf(lx + 1, boxY + 2, leafW - 2, boxH - 4, 1.4);
    }
  }
  // MODELO F: Box / Porta de Abrir / Giro
  else if (modelId === 'box_abrir' || modelId === 'porta_abrir' || modelId === 'janela_maxim_ar') {
    drawProfile(boxX - 2, boxY - 2, boxW + 4, 4);
    drawProfile(boxX - 2, boxY, 4, boxH);
    drawProfile(boxX + boxW - 2, boxY, 4, boxH);
    drawGlassLeaf(boxX + 4, boxY + 3, boxW - 8, boxH - 6, 1.8);

    // Dobradiças
    ctx.fillStyle = hwStyle.accent;
    ctx.fillRect(boxX - 3, boxY + boxH * 0.2, 5, 12);
    ctx.fillRect(boxX - 3, boxY + boxH * 0.75, 5, 12);

    // Puxador
    ctx.fillRect(boxX + boxW - 8, midY - 10, 3, 20);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GIRO / DE ABRIR', midX, boxY + 14);
  }
  // MODELO G: Padrão Universal - 2 Folhas (1F + 1M - Móvel + Fixo)
  // Atende box_frontal_2f, porta_correr_2f, janela_correr_2f e todos os modelos padrão
  else {
    drawProfile(boxX - 2, boxY - 4, boxW + 4, 6);
    drawProfile(boxX - 2, boxY + boxH - 2, boxW + 4, 5);
    drawProfile(boxX - 2, boxY, 4, boxH);
    drawProfile(boxX + boxW - 2, boxY, 4, boxH);

    // Folha 1 (Móvel - Esquerda)
    drawGlassLeaf(boxX + 1, boxY + 2, boxW / 2 - 2, boxH - 4, 1.5);

    // Folha 2 (Fixa - Direita)
    drawGlassLeaf(midX + 2, boxY + 2, boxW / 2 - 3, boxH - 4, 1.5);

    // Montante central
    drawProfile(midX - 2.5, boxY, 5, boxH);
    ctx.strokeStyle = hwStyle.accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(midX, boxY);
    ctx.lineTo(midX, boxY + boxH);
    ctx.stroke();

    // Puxador
    ctx.fillStyle = hwStyle.accent;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(boxX + boxW * 0.38, midY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Seta amarela indicando deslizamento da folha móvel
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(boxX + boxW * 0.32, boxY + boxH * 0.82);
    ctx.lineTo(boxX + boxW * 0.12, boxY + boxH * 0.82);
    ctx.stroke();

    // Badges de Identificação
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(boxX + boxW * 0.25 - 18, boxY + 6, 36, 12);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 6px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MÓVEL (M)', boxX + boxW * 0.25, boxY + 12);

    ctx.fillStyle = '#334155';
    ctx.fillRect(boxX + boxW * 0.75 - 16, boxY + 6, 32, 12);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('FIXO (F)', boxX + boxW * 0.75, boxY + 12);
  }

  // 4. Rodapé: Nome do Produto e Modelo
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 7.5px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const cleanName = name.length > 28 ? name.substring(0, 28) + '...' : name;
  ctx.fillText(cleanName.toUpperCase(), svgW / 2, svgH - 7);

  // Exportar PNG limpo, direto e 100% livre de falhas de segurança
  try {
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Erro ao exportar canvas CAD:', err);
    return '';
  }
}
