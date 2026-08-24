import { CashCategoryItem, CashPaymentMethod, CashTransactionType } from '../types';
import { getCashCategories } from '../services/data/repositories/cashRepository';

export interface InterpretedCashMovement {
  type: CashTransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  description: string;
  date: string;
  paymentMethod: CashPaymentMethod;
  clientName?: string;
  notes?: string;
  confidence: number;
  rawText: string;
}

// Extrator de números e valores em reais em português
function parseAmountFromText(text: string): number {
  // 1. Tentar capturar valores explícitos como "R$ 150,00", "150 reais", "1.500,50", "2500"
  const regexExplicit = /(?:r\$\s*|reais\s*)?(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})|\d+(?:[.,]\d{1,2})?|\d+)(?:\s*reais|\s*real)?/i;
  
  // Buscar padrões de quantia como "150 reais", "R$ 800", "800,00"
  const matchMoney = text.match(/(?:r\$\s*)(\d{1,3}(?:\.\d{3})*,\d{2}|\d+(?:[.,]\d+)?)/i) ||
                     text.match(/(\d{1,3}(?:\.\d{3})*,\d{2}|\d+(?:[.,]\d+)?)\s*(?:reais|real|pila|conto)/i) ||
                     text.match(/(\d+(?:[.,]\d+)?)/i);

  if (matchMoney) {
    let cleanStr = matchMoney[1].trim();
    if (cleanStr.includes('.') && cleanStr.includes(',')) {
      cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
    } else if (cleanStr.includes(',')) {
      cleanStr = cleanStr.replace(',', '.');
    }
    const val = parseFloat(cleanStr);
    if (!isNaN(val) && val > 0) {
      return val;
    }
  }

  // 2. Tentar palavras numéricas em português comum
  const numberWords: Record<string, number> = {
    um: 1, dois: 2, tres: 3, três: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10,
    onze: 11, doze: 12, treze: 13, quatorze: 14, catorze: 14, quinze: 15, vinte: 20, trinta: 30,
    quarenta: 40, cinquenta: 50, sessenta: 60, setenta: 70, oitenta: 80, noventa: 90,
    cem: 100, cento: 100, duzentos: 200, trezentos: 300, quatrocentos: 400, quinhentos: 500,
    seiscentos: 600, setecentos: 700, oitocentos: 800, novecentos: 900, mil: 1000,
  };

  const lower = text.toLowerCase();
  for (const [word, num] of Object.entries(numberWords)) {
    if (new RegExp(`\\b${word}\\s+(?:reais|real)\\b`, 'i').test(lower)) {
      return num;
    }
  }

  return 0;
}

// Extrator de Forma de Pagamento
function parsePaymentMethodFromText(text: string): CashPaymentMethod {
  const lower = text.toLowerCase();
  if (lower.includes('pix')) return 'pix';
  if (lower.includes('dinheiro') || lower.includes('em espécie') || lower.includes('especie') || lower.includes('a vista') || lower.includes('à vista')) return 'dinheiro';
  if (lower.includes('cartão de crédito') || lower.includes('cartao de credito') || lower.includes('crédito') || lower.includes('credito')) return 'cartao_credito';
  if (lower.includes('cartão de débito') || lower.includes('cartao de debito') || lower.includes('débito') || lower.includes('debito')) return 'cartao_debito';
  if (lower.includes('transferência') || lower.includes('transferencia') || lower.includes('ted') || lower.includes('doc')) return 'transferencia';
  if (lower.includes('cheque')) return 'cheque';
  return 'dinheiro'; // Padrão mais comum
}

// Extrator de Tipo (Entrada vs Saída)
function parseTypeFromText(text: string): CashTransactionType {
  const lower = text.toLowerCase();
  
  // Palavras de saída/despesa
  const expenseKeywords = [
    'gastei', 'gasto', 'gastar', 'paguei', 'pagamento', 'pagar', 'comprei', 'compra', 'comprar',
    'saída', 'saida', 'despesa', 'custo', 'abasteci', 'abastecimento', 'combustível', 'gasolina',
    'almoço', 'lanche', 'refeição', 'aluguel', 'energia', 'luz', 'água', 'telefone', 'internet',
    'salário', 'diária', 'frete', 'manutenção', 'peça', 'ferramenta', 'material'
  ];

  // Palavras de entrada/recebimento
  const incomeKeywords = [
    'recebi', 'recebimento', 'receber', 'recebido', 'entrou', 'entrada', 'vendi', 'venda',
    'faturamento', 'ganhei', 'ganho', 'cliente pagou', 'pagou o fiado', 'acerto', 'sinal'
  ];

  let expenseScore = 0;
  let incomeScore = 0;

  expenseKeywords.forEach((kw) => {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(lower)) expenseScore += 1.5;
  });

  incomeKeywords.forEach((kw) => {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(lower)) incomeScore += 1.5;
  });

  if (incomeScore > expenseScore) return 'entrada';
  if (expenseScore > incomeScore) return 'saida';

  // Se empatar ou for ambíguo: se contém 'recebi' ou 'venda', é entrada; se contém 'gastei' ou 'comprei', é saída
  return lower.includes('receb') || lower.includes('venda') ? 'entrada' : 'saida';
}

// Extrator de Categoria
function parseCategoryFromText(
  text: string,
  type: CashTransactionType,
  categories: CashCategoryItem[]
): { id: string; name: string } {
  const lower = text.toLowerCase();

  // Mapeamentos específicos por palavras-chave
  const categoryKeywords: Record<string, string[]> = {
    'Combustível / Abastecimento': ['combustível', 'combustivel', 'gasolina', 'etanol', 'diesel', 'posto', 'abasteci', 'abastecer', 'abastecimento', 'alcool', 'álcool', 'litros'],
    'Alimentação / Almoço / Lanches': ['almoço', 'almoco', 'lanche', 'comida', 'jantar', 'café', 'cafe', 'marmita', 'padaria', 'restaurante', 'alimentação', 'alimentacao', 'marmitex', 'refeição', 'lanches', 'salgado', 'refrigerante', 'suco', 'qualdra'],
    'Compras de Vidros & Espelhos': ['vidro', 'vidros', 'espelho', 'espelhos', 'temperado', 'laminado', 'float', 'chapa de vidro', 'cristal', 'bisote', 'bisotado', 'lapidado', 'fumê', 'fume', 'verde', 'bronze', 'incolor'],
    'Compras de Alumínio & Perfis': ['alumínio', 'aluminio', 'perfil', 'perfis', 'barra de aluminio', 'tubo', 'cantoneira', 'u', 'trilho superior', 'trilho inferior', 'esquadria', 'alpex', 'linha 25', 'linha suprema'],
    'Compras de Ferragens & Kits de Box': ['ferragem', 'ferragens', 'kit box', 'kit de box', 'dobradiça', 'dobradica', 'fechadura', 'puxador', 'roldana', 'roldanas', 'fecho', 'batedor', 'suporte fenda', 'torre inox', 'botão francês', 'fenda', 'tranca'],
    'Compras de Silicone, PU & Fixação': ['silicone', 'pu', 'pu40', 'selante', 'parafuso', 'parafusos', 'bucha', 'buchas', 'fita dupla face', 'fita', 'fixação', 'fixacao', 'chumbador', 'cola'],
    'Compras Gerais / Supermercado / Limpeza': ['mercado', 'supermercado', 'compras', 'limpeza', 'sabão', 'detergente', 'pano', 'álcool 70', 'papel toalha', 'copo descartável', 'café moído', 'açúcar'],
    'Fornecedor / Faturas de Materiais': ['fornecedor', 'fatura', 'boleto fornecedor', 'distribuidora', 'distribuidor', 'representante', 'pedido fábrica'],
    'Ferramentas, Máquinas & Insumos': ['ferramenta', 'ferramentas', 'trena', 'furadeira', 'parafusadeira', 'disco', 'broca', 'alicate', 'ventosa', 'ventosas', 'esquadro', 'nível laser', 'serra', 'lixadeira'],
    'EPIs & Segurança no Trabalho': ['epi', 'epis', 'óculos de proteção', 'luva anticorte', 'luva', 'capacete', 'bota com biqueira', 'bota', 'cinto de segurança'],
    'Diárias de Ajudantes / Montadores': ['ajudante', 'diária', 'diaria', 'montador', 'montadores', 'servente', 'terceirizado', 'chapa', 'auxiliar de montagem'],
    'Frete, Carretos & Transportes': ['frete', 'entrega', 'carreto', 'transportadora', 'uber', 'táxi', 'taxi', 'ônibus', 'passagem'],
    'Manutenção de Veículos / Oficina / Pneus': ['mecânico', 'mecanico', 'oficina', 'troca de óleo', 'óleo do carro', 'pneu', 'pneus', 'borracharia', 'revisão carro', 'strada', 'caminhonete', 'moto'],
    'Manutenção de Ferramentas & Oficina': ['manutenção', 'manutencao', 'conserto', 'reparo de ferramenta', 'conserto furadeira'],
    'Aluguel do Ponto / Galpão': ['aluguel', 'locação', 'ponto comercial', 'galpão', 'imobiliária'],
    'Energia Elétrica': ['energia', 'luz', 'enel', 'equatorial', 'conta de luz', 'energia eletrica', 'eletricidade'],
    'Água & Esgoto': ['água', 'agua', 'saneamento', 'conta de água', 'cagece', 'copasa', 'sabesp', 'saae'],
    'Telefone, Internet & Software': ['telefone', 'internet', 'celular', 'wifi', 'wi-fi', 'plano', 'vivo', 'claro', 'tim', 'software', 'sistema'],
    'Contabilidade & Honorários': ['contabilidade', 'contador', 'honorários contábeis', 'honorarios'],
    'Impostos, Tributos & DAS Simples': ['imposto', 'das', 'simples nacional', 'tributo', 'taxa prefeitura', 'nota fiscal', 'icms'],
    'Tarifas Bancárias & Taxas de Maquininha': ['taxa de maquininha', 'taxa do cartão', 'tarifa bancária', 'tarifa', 'anuidade', 'juros banco'],
    'Salários & Adiantamentos da Equipe': ['salário', 'salario', 'pagamento de funcionário', 'adiantamento', 'folha', 'vale'],
    'Pró-Labore / Retirada dos Sócios': ['pró-labore', 'pro-labore', 'retirada', 'retirada de sócio', 'lucro'],
    'Marketing, Propaganda & Panfletos': ['marketing', 'propaganda', 'panfleto', 'panfletos', 'anúncio', 'anuncio', 'instagram', 'facebook', 'cartão de visita'],
    'Pedágio & Estacionamento': ['pedágio', 'pedagio', 'estacionamento', 'rotativo', 'zona azul'],
    'Venda de Box & Esquadrias': ['box', 'box de banheiro', 'box frontal', 'box de canto', 'esquadria', 'janela 4 folhas', 'porta de correr', 'porta pivotante'],
    'Venda de Vidros & Espelhos': ['espelho', 'espelho lapidado', 'espelho bisotado', 'vidro temperado', 'tampo de mesa', 'prateleira de vidro', 'chapa'],
    'Venda / PDV Balcão': ['venda', 'vendi', 'balcão', 'loja', 'faturamento'],
    'Serviço de Instalação & Montagem': ['instalação', 'instalacao', 'montagem', 'mão de obra', 'colocação', 'serviço'],
    'Serviço de Manutenção & Reparos': ['manutenção de box', 'troca de roldana', 'reparo de vidro', 'vedação de silicone', 'conserto de porta'],
    'Recebimento de Fiado (Contas a Receber)': ['fiado', 'acerto de fiado', 'pagou o fiado', 'cobrança fiado', 'recebi fiado'],
    'Recebimento de Parcela': ['parcela', 'segunda parcela', 'terceira parcela', 'última parcela', 'carnê', 'duplicata'],
    'Entrada / Sinal de Orçamento': ['sinal', 'entrada', '50% de entrada', 'adiantamento de cliente', 'sinal do orçamento'],
  };

  // 1. Procurar nas categorias disponíveis
  for (const cat of categories) {
    if (cat.type !== 'ambos' && cat.type !== type) continue;

    const keywords = categoryKeywords[cat.name] || [cat.name.toLowerCase()];
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return { id: cat.id, name: cat.name };
      }
    }
  }

  // 2. Se for saída padrão
  if (type === 'saida') {
    const defaultOut = categories.find((c) => c.name === 'Outras Despesas' || c.name === 'Outros') ||
                       categories.find((c) => c.type === 'saida');
    return defaultOut
      ? { id: defaultOut.id, name: defaultOut.name }
      : { id: 'cat-desp-15', name: 'Outras Despesas' };
  }

  // 3. Se for entrada padrão
  const defaultIn = categories.find((c) => c.name === 'Venda') ||
                    categories.find((c) => c.type === 'entrada');
  return defaultIn
    ? { id: defaultIn.id, name: defaultIn.name }
    : { id: 'cat-ent-1', name: 'Venda' };
}

// Extrator de Nome do Cliente
function parseClientNameFromText(text: string): string | undefined {
  // Padrões como: "do João", "da Maria", "cliente Carlos", "ao João", "para o José", "referente ao Carlos"
  const match = text.match(/(?:do|da|de|ao|à|para o|para a|cliente|referente ao|referente à)\s+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)?)/i);
  if (match && match[1]) {
    const name = match[1].trim();
    // Excluir palavras comuns falsas
    const banned = ['serviço', 'servico', 'combustível', 'combustivel', 'posto', 'material', 'fiado', 'pix', 'hoje', 'ontem'];
    if (!banned.includes(name.toLowerCase())) {
      return name;
    }
  }
  return undefined;
}

// Extrator de Data
function parseDateFromText(text: string): string {
  const today = new Date();
  const lower = text.toLowerCase();

  if (lower.includes('ontem')) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  if (lower.includes('anteontem')) {
    const anteontem = new Date(today);
    anteontem.setDate(anteontem.getDate() - 2);
    return anteontem.toISOString().split('T')[0];
  }

  // Procurar datas como DD/MM ou DD/MM/AAAA
  const matchDate = text.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (matchDate) {
    const day = matchDate[1].padStart(2, '0');
    const month = matchDate[2].padStart(2, '0');
    const year = matchDate[3] ? (matchDate[3].length === 2 ? `20${matchDate[3]}` : matchDate[3]) : String(today.getFullYear());
    return `${year}-${month}-${day}`;
  }

  return today.toISOString().split('T')[0];
}

// Gerador de Descrição Inteligente
function generateCleanDescription(
  text: string,
  type: CashTransactionType,
  categoryName: string,
  clientName?: string
): string {
  const clean = text
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .trim();

  if (clean.length > 0) {
    // Primeira letra maiúscula
    const formatted = clean.charAt(0).toUpperCase() + clean.slice(1);
    if (formatted.length <= 60) return formatted;
  }

  if (type === 'saida') {
    return `Gasto com ${categoryName.toLowerCase()}`;
  } else {
    return clientName ? `Recebimento — ${clientName}` : `Recebimento (${categoryName})`;
  }
}

/**
 * Função Principal de Interpretação de Áudio / Texto em Linguagem Natural
 */
export function interpretCashAudioText(rawText: string): InterpretedCashMovement {
  const text = rawText.trim();
  const categories = getCashCategories();

  const type = parseTypeFromText(text);
  const amount = parseAmountFromText(text);
  const paymentMethod = parsePaymentMethodFromText(text);
  const category = parseCategoryFromText(text, type, categories);
  const clientName = parseClientNameFromText(text);
  const date = parseDateFromText(text);
  const description = generateCleanDescription(text, type, category.name, clientName);

  let confidence = 0.5;
  if (amount > 0) confidence += 0.3;
  if (category.name !== 'Outras Despesas' && category.name !== 'Venda') confidence += 0.1;
  if (clientName) confidence += 0.1;

  return {
    type,
    amount,
    categoryId: category.id,
    categoryName: category.name,
    description,
    date,
    paymentMethod,
    clientName,
    confidence: Math.min(1.0, confidence),
    rawText: text,
  };
}
