/**
 * Utilitário para conversão de valores monetários numéricos em texto por extenso (Português do Brasil).
 * Exemplo: 57000.00 -> "cinquenta e sete mil reais"
 *          1250.50 -> "um mil, duzentos e cinquenta reais e cinquenta centavos"
 */

const UNIDADES = [
  '',
  'um',
  'dois',
  'três',
  'quatro',
  'cinco',
  'seis',
  'sete',
  'oito',
  'nove',
  'dez',
  'onze',
  'doze',
  'treze',
  'quatorze',
  'quinze',
  'dezesseis',
  'dezessete',
  'dezoito',
  'dezenove',
];

const DEZENAS = [
  '',
  '',
  'vinte',
  'trinta',
  'quarenta',
  'cinquenta',
  'sessenta',
  'setenta',
  'oitenta',
  'noventa',
];

const CENTENAS = [
  '',
  'cento',
  'duzentos',
  'trezentos',
  'quatrocentos',
  'quinhentos',
  'seiscentos',
  'setecentos',
  'oitocentos',
  'novecentos',
];

function converterGrupoAte999(num: number): string {
  if (num === 0) return '';
  if (num === 100) return 'cem';

  const partes: string[] = [];

  const c = Math.floor(num / 100);
  const d = Math.floor((num % 100) / 10);
  const u = num % 10;
  const restoDezena = num % 100;

  if (c > 0) {
    partes.push(CENTENAS[c]);
  }

  if (restoDezena > 0) {
    if (restoDezena < 20) {
      partes.push(UNIDADES[restoDezena]);
    } else {
      partes.push(DEZENAS[d]);
      if (u > 0) {
        partes.push(UNIDADES[u]);
      }
    }
  }

  return partes.join(' e ');
}

/**
 * Converte um número inteiro (de 0 até 999.999.999) para extenso
 */
export function converterNumeroInteiroPorExtenso(num: number): string {
  if (num === 0) return 'zero';

  const bilhoes = Math.floor(num / 1_000_000_000);
  const milhoes = Math.floor((num % 1_000_000_000) / 1_000_000);
  const milhares = Math.floor((num % 1_000_000) / 1_000);
  const unidades = num % 1_000;

  const partes: string[] = [];

  if (bilhoes > 0) {
    const textoBilhoes = converterGrupoAte999(bilhoes);
    partes.push(`${textoBilhoes} ${bilhoes === 1 ? 'bilhão' : 'bilhões'}`);
  }

  if (milhoes > 0) {
    const textoMilhoes = converterGrupoAte999(milhoes);
    partes.push(`${textoMilhoes} ${milhoes === 1 ? 'milhão' : 'milhões'}`);
  }

  if (milhares > 0) {
    if (milhares === 1) {
      partes.push('um mil');
    } else {
      const textoMilhares = converterGrupoAte999(milhares);
      partes.push(`${textoMilhares} mil`);
    }
  }

  if (unidades > 0) {
    const textoUnidades = converterGrupoAte999(unidades);
    partes.push(textoUnidades);
  }

  // Montagem da conjunção "e"
  if (partes.length === 1) {
    return partes[0];
  }

  // Regra padrão de junção em português
  return partes.join(' ');
}

/**
 * Converte um valor em reais (com centavos) para texto por extenso.
 * Ex: 57000 -> "cinquenta e sete mil reais"
 *     1.00 -> "um real"
 *     0.50 -> "cinquenta centavos"
 *     150.25 -> "cento e cinquenta reais e vinte e cinco centavos"
 */
export function valorPorExtenso(valor: number): string {
  if (isNaN(valor) || valor === null || valor === undefined) {
    return 'zero reais';
  }

  const valorAbsoluto = Math.abs(valor);
  const reais = Math.floor(valorAbsoluto);
  const centavos = Math.round((valorAbsoluto - reais) * 100);

  const partesReais: string[] = [];

  if (reais > 0) {
    const textoReais = converterNumeroInteiroPorExtenso(reais);
    const moeda = reais === 1 ? 'real' : 'reais';
    partesReais.push(`${textoReais} ${moeda}`);
  }

  if (centavos > 0) {
    const textoCentavos = converterNumeroInteiroPorExtenso(centavos);
    const moedaCentavos = centavos === 1 ? 'centavo' : 'centavos';
    partesReais.push(`${textoCentavos} ${moedaCentavos}`);
  }

  if (partesReais.length === 0) {
    return 'zero reais';
  }

  return partesReais.join(' e ');
}

/**
 * Formata um valor numérico em moeda brasileira e inclui o extenso entre parênteses.
 * Ex: 57000 -> "R$ 57.000,00 (cinquenta e sete mil reais)"
 */
export function formatCurrencyWithWords(valor: number): string {
  const formattedNumber = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0);

  const extenso = valorPorExtenso(valor || 0);
  return `${formattedNumber} (${extenso})`;
}

// Alias para compatibilidade com módulos existentes de Recibos
export const numberToWordsBRL = valorPorExtenso;

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/**
 * Formata uma data por extenso no padrão brasileiro.
 * Ex: "2026-08-18" -> "18 de agosto de 2026"
 */
export function formatDateExtenso(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const [ano, mes, dia] = cleanDate.split('-').map(Number);
    if (!ano || !mes || !dia) return dateStr;
    const nomeMes = MESES[mes - 1] || '';
    return `${dia} de ${nomeMes} de ${ano}`;
  } catch {
    return dateStr;
  }
}
