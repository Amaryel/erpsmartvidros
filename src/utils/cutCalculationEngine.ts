import { CutProductType, CutRule, CutCalculation } from '../types';

export interface ProductTypeConfig {
  type: CutProductType;
  label: string;
  shortLabel: string;
  description: string;
  defaultPiecesPerSpan: number;
}

export const CUT_PRODUCT_TYPES: ProductTypeConfig[] = [
  {
    type: 'vidro_temperado',
    label: 'Vidro Temperado',
    shortLabel: 'Vidro',
    description: 'Painéis fixos, divisórias, fechamentos de vão e guarda-corpos',
    defaultPiecesPerSpan: 1,
  },
  {
    type: 'box_banheiro',
    label: 'Box de Banheiro',
    shortLabel: 'Box',
    description: 'Box frontal F1 (1 fixo + 1 porta), box de canto F2, de abrir e articulado',
    defaultPiecesPerSpan: 2,
  },
  {
    type: 'janela',
    label: 'Janela',
    shortLabel: 'Janela',
    description: 'Janelas 2 ou 4 folhas (Linha Suprema, Gold, Linha 25, Basculante, Maxim-ar)',
    defaultPiecesPerSpan: 2,
  },
  {
    type: 'porta',
    label: 'Porta',
    shortLabel: 'Porta',
    description: 'Portas de correr 2/4 folhas, pivotantes e de abrir (Linha Suprema, Gold, Pivotante 8/10mm)',
    defaultPiecesPerSpan: 1,
  },
  {
    type: 'esquadria',
    label: 'Esquadria de Alumínio',
    shortLabel: 'Esquadria',
    description: 'Perfis de alumínio com vidro embutido, venezianas e integradas',
    defaultPiecesPerSpan: 1,
  },
  {
    type: 'espelho',
    label: 'Espelho',
    shortLabel: 'Espelho',
    description: 'Espelhos bisotê, lapidados e painéis decorativos de parede',
    defaultPiecesPerSpan: 1,
  },
  {
    type: 'outro',
    label: 'Outro Sistema / Personalizado',
    shortLabel: 'Personalizado',
    description: 'Regras livres e projetos especiais sob medida',
    defaultPiecesPerSpan: 1,
  },
];

/**
 * Regras padrão pré-configuradas para vidraçaria e esquadrias.
 * Todas as regras são editáveis e configuráveis pelo administrador.
 */
export const DEFAULT_CUT_RULES: CutRule[] = [
  {
    id: 'rule-box-f1',
    name: 'Box Frontal F1 (1 Fixo + 1 Móvel)',
    productType: 'box_banheiro',
    description: 'Box de correr padrão 2 folhas (1 painel fixo + 1 porta móvel)',
    widthDiscount: 0, // Transpasse/desconto distribuído
    heightDiscount: 35, // Desconto para trilho superior e guia inferior
    lateralGap: 5, // Folga nas laterais com as paredes
    topGap: 0,
    bottomGap: 0,
    piecesPerSpan: 2,
    customFormulaDescription: 'Largura de cada folha: ((Vão + 50mm de transpasse) / 2) - 10mm folgas | Altura: Vão - 35mm',
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-box-f2-canto',
    name: 'Box de Canto F2 (2 Fixos + 2 Móveis)',
    productType: 'box_banheiro',
    description: 'Box em L de canto 4 folhas com fechamento central',
    widthDiscount: 20, // Desconto total nos cantos
    heightDiscount: 35,
    lateralGap: 5,
    topGap: 0,
    bottomGap: 0,
    piecesPerSpan: 4,
    customFormulaDescription: 'Largura de cada folha: (Vão / 2) - 15mm | Altura: Vão - 35mm',
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-janela-suprema-2f',
    name: 'Janela 2 Folhas (Linha Suprema)',
    productType: 'janela',
    description: 'Janela de correr 2 folhas de alumínio Linha Suprema',
    widthDiscount: 60, // Desconto de perfis laterais e encontro
    heightDiscount: 70, // Desconto do marco superior e inferior
    lateralGap: 0,
    topGap: 0,
    bottomGap: 0,
    piecesPerSpan: 2,
    customFormulaDescription: 'Largura vidro: (Vão - 60mm) / 2 | Altura vidro: Vão - 70mm',
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-janela-suprema-4f',
    name: 'Janela 4 Folhas (Linha Suprema / 2F + 2M)',
    productType: 'janela',
    description: 'Janela 4 folhas (2 fixos laterais + 2 portas centrais)',
    widthDiscount: 110,
    heightDiscount: 70,
    lateralGap: 0,
    topGap: 0,
    bottomGap: 0,
    piecesPerSpan: 4,
    customFormulaDescription: 'Largura vidro: (Vão - 110mm) / 4 | Altura vidro: Vão - 70mm',
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-porta-pivotante-10mm',
    name: 'Porta Pivotante (Vidro Temperado 10mm)',
    productType: 'porta',
    description: 'Porta de giro pivotante com ferragens 1101/1103 ou mola hidráulica',
    widthDiscount: 12, // Folga lateral para giro e fechadura
    heightDiscount: 18, // Folga superior para pivot e inferior para piso
    lateralGap: 6,
    topGap: 6,
    bottomGap: 12,
    piecesPerSpan: 1,
    customFormulaDescription: 'Largura: Vão - 12mm | Altura: Vão - 18mm (6mm sup + 12mm inf para mola/piso)',
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-porta-correr-2f',
    name: 'Porta de Correr 2 Folhas (Linha Suprema)',
    productType: 'porta',
    description: 'Porta de correr com 2 folhas de alumínio e vidro',
    widthDiscount: 80,
    heightDiscount: 85,
    lateralGap: 0,
    topGap: 0,
    bottomGap: 0,
    piecesPerSpan: 2,
    customFormulaDescription: 'Largura vidro: (Vão - 80mm) / 2 | Altura vidro: Vão - 85mm',
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-vidro-temperado-fixo',
    name: 'Vidro Fixo / Divisória / Bandeira',
    productType: 'vidro_temperado',
    description: 'Painel de vidro temperado fixado com perfis U ou botões prolongadores',
    widthDiscount: 6,
    heightDiscount: 6,
    lateralGap: 3,
    topGap: 3,
    bottomGap: 3,
    piecesPerSpan: 1,
    customFormulaDescription: 'Largura: Vão - 6mm | Altura: Vão - 6mm (folgas de dilatação e calços)',
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-espelho-lapidado',
    name: 'Espelho Lapidado / Bisotê com Folga',
    productType: 'espelho',
    description: 'Espelho colado na parede com folga de segurança contra desalinhamento',
    widthDiscount: 10,
    heightDiscount: 10,
    lateralGap: 5,
    topGap: 5,
    bottomGap: 5,
    piecesPerSpan: 1,
    customFormulaDescription: 'Largura: Vão - 10mm (5mm cada lado) | Altura: Vão - 10mm',
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export interface CalculationInput {
  spanWidthMm: number; // Largura do vão (mm)
  spanHeightMm: number; // Altura do vão (mm)
  spanQuantity?: number; // Quantidade de vãos
  rule: CutRule;
  pricePerM2?: number; // Opcional
}

export interface CalculationResult {
  isValid: boolean;
  errorMessage?: string;
  
  // Vão
  spanWidthMm: number;
  spanHeightMm: number;
  spanQuantity: number;
  
  // Medida de Corte por Peça
  cutWidthMm: number;
  cutHeightMm: number;
  piecesPerSpan: number;
  totalPieces: number;
  
  // Folgas e Descontos
  totalWidthDiscount: number;
  totalHeightDiscount: number;
  lateralGap: number;
  topGap: number;
  bottomGap: number;
  
  // Áreas
  singlePieceAreaM2: number;
  totalAreaM2: number;
  
  // Comercial
  pricePerM2?: number;
  totalPrice?: number;
  
  // Explicação da Fórmula
  formulaDescription: string;
  stepByStepWidth: string;
  stepByStepHeight: string;
}

/**
 * Engine Central de Cálculo de Medidas de Corte
 * Recebe as dimensões brutas do vão e aplica estritamente a regra selecionada.
 */
export function calculateCutDimensions(input: CalculationInput): CalculationResult {
  const { spanWidthMm, spanHeightMm, spanQuantity = 1, rule, pricePerM2 } = input;

  const validQty = Math.max(1, spanQuantity || 1);
  const piecesPerSpan = Math.max(1, rule.piecesPerSpan || 1);
  const totalPieces = validQty * piecesPerSpan;

  // Validações básicas de entrada
  if (!spanWidthMm || spanWidthMm <= 0 || !spanHeightMm || spanHeightMm <= 0) {
    return {
      isValid: false,
      errorMessage: 'Informe medidas de vão válidas (maiores que zero) para calcular o corte.',
      spanWidthMm: spanWidthMm || 0,
      spanHeightMm: spanHeightMm || 0,
      spanQuantity: validQty,
      cutWidthMm: 0,
      cutHeightMm: 0,
      piecesPerSpan,
      totalPieces,
      totalWidthDiscount: 0,
      totalHeightDiscount: 0,
      lateralGap: 0,
      topGap: 0,
      bottomGap: 0,
      singlePieceAreaM2: 0,
      totalAreaM2: 0,
      formulaDescription: 'Aguardando medidas válidas do vão...',
      stepByStepWidth: '',
      stepByStepHeight: '',
    };
  }

  // Descontos totais aplicados
  const lateralGapsTotal = (rule.lateralGap || 0) * 2;
  const totalWidthDiscount = (rule.widthDiscount || 0) + lateralGapsTotal;
  const totalHeightDiscount = (rule.heightDiscount || 0) + (rule.topGap || 0) + (rule.bottomGap || 0);

  // Cálculo da Largura de Corte por folha
  // Fórmula: (Largura do Vão - Desconto de Largura - 2x Folga Lateral) / Peças por Vão
  const remainingWidth = spanWidthMm - totalWidthDiscount;
  const cutWidthMm = Math.round((remainingWidth / piecesPerSpan) * 10) / 10;

  // Cálculo da Altura de Corte
  // Fórmula: Altura do Vão - Desconto de Altura - Folga Superior - Folga Inferior
  const cutHeightMm = Math.round((spanHeightMm - totalHeightDiscount) * 10) / 10;

  // Validação de resultado final positivo
  if (cutWidthMm <= 0 || cutHeightMm <= 0) {
    return {
      isValid: false,
      errorMessage: `Verifique as medidas do vão e a regra "${rule.name}". Os descontos aplicados (${totalWidthDiscount}mm na largura / ${totalHeightDiscount}mm na altura) resultaram em medida de corte inválida (menor ou igual a zero).`,
      spanWidthMm,
      spanHeightMm,
      spanQuantity: validQty,
      cutWidthMm: Math.max(0, cutWidthMm),
      cutHeightMm: Math.max(0, cutHeightMm),
      piecesPerSpan,
      totalPieces,
      totalWidthDiscount,
      totalHeightDiscount,
      lateralGap: rule.lateralGap || 0,
      topGap: rule.topGap || 0,
      bottomGap: rule.bottomGap || 0,
      singlePieceAreaM2: 0,
      totalAreaM2: 0,
      formulaDescription: 'Erro no cálculo das medidas.',
      stepByStepWidth: '',
      stepByStepHeight: '',
    };
  }

  // Cálculo das Áreas em m²
  const singlePieceAreaM2 = Math.round(((cutWidthMm / 1000) * (cutHeightMm / 1000)) * 1000) / 1000;
  const totalAreaM2 = Math.round((singlePieceAreaM2 * totalPieces) * 1000) / 1000;

  // Cálculos comerciais opcionais
  const validPricePerM2 = pricePerM2 && pricePerM2 > 0 ? pricePerM2 : undefined;
  const totalPrice = validPricePerM2 ? Math.round(totalAreaM2 * validPricePerM2 * 100) / 100 : undefined;

  // Explicação passo a passo da fórmula
  let stepByStepWidth = '';
  if (piecesPerSpan > 1) {
    stepByStepWidth = `Largura: (${spanWidthMm}mm - ${totalWidthDiscount}mm desconto) ÷ ${piecesPerSpan} peças = ${cutWidthMm.toFixed(1).replace('.0', '')}mm por peça`;
  } else {
    stepByStepWidth = `Largura: ${spanWidthMm}mm - ${totalWidthDiscount}mm desconto = ${cutWidthMm.toFixed(1).replace('.0', '')}mm`;
  }

  const stepByStepHeight = `Altura: ${spanHeightMm}mm - ${totalHeightDiscount}mm desconto = ${cutHeightMm.toFixed(1).replace('.0', '')}mm`;

  const formulaDescription = `${stepByStepWidth} | ${stepByStepHeight}`;

  return {
    isValid: true,
    spanWidthMm,
    spanHeightMm,
    spanQuantity: validQty,
    cutWidthMm,
    cutHeightMm,
    piecesPerSpan,
    totalPieces,
    totalWidthDiscount,
    totalHeightDiscount,
    lateralGap: rule.lateralGap || 0,
    topGap: rule.topGap || 0,
    bottomGap: rule.bottomGap || 0,
    singlePieceAreaM2,
    totalAreaM2,
    pricePerM2: validPricePerM2,
    totalPrice,
    formulaDescription,
    stepByStepWidth,
    stepByStepHeight,
  };
}
