/**
 * Converte valores numéricos para texto por extenso em Português do Brasil (BRL)
 * Exemplo: 6900.00 -> "seis mil e novecentos reais"
 * Exemplo: 6900.50 -> "seis mil e novecentos reais e cinquenta centavos"
 */

export function numberToWords(num: number): string {
  if (isNaN(num) || num < 0) return '';
  if (num === 0) return 'zero';

  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const teens = [
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
  const tens = [
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
  const hundreds = [
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

  function convertGroup(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'cem';

    let result = '';
    const h = Math.floor(n / 100);
    const remainder = n % 100;
    const t = Math.floor(remainder / 10);
    const u = remainder % 10;

    if (h > 0) {
      result += hundreds[h];
    }

    if (remainder > 0) {
      if (result.length > 0) result += ' e ';
      if (remainder < 10) {
        result += units[remainder];
      } else if (remainder >= 10 && remainder < 20) {
        result += teens[remainder - 10];
      } else {
        result += tens[t];
        if (u > 0) {
          result += ' e ' + units[u];
        }
      }
    }

    return result;
  }

  const intPart = Math.floor(num);
  if (intPart === 0) return 'zero';

  let words = '';
  const millions = Math.floor(intPart / 1000000);
  const thousands = Math.floor((intPart % 1000000) / 1000);
  const rest = intPart % 1000;

  if (millions > 0) {
    if (millions === 1) {
      words += 'um milhão';
    } else {
      words += convertGroup(millions) + ' milhões';
    }
  }

  if (thousands > 0) {
    if (words.length > 0) words += ' ';
    if (thousands === 1) {
      words += 'um mil';
    } else {
      words += convertGroup(thousands) + ' mil';
    }
  }

  if (rest > 0) {
    if (words.length > 0) {
      words += ' e ';
    }
    words += convertGroup(rest);
  }

  return words.trim();
}

export function numberToWordsBRL(amount: number): string {
  if (isNaN(amount) || amount <= 0) return 'zero reais';

  const integerPart = Math.floor(amount);
  const centsPart = Math.round((amount - integerPart) * 100);

  let result = '';

  if (integerPart > 0) {
    const intWords = numberToWords(integerPart);
    const currencyUnit = integerPart === 1 ? 'real' : 'reais';
    result = `${intWords} ${currencyUnit}`;
  }

  if (centsPart > 0) {
    const centsWords = numberToWords(centsPart);
    const centsUnit = centsPart === 1 ? 'centavo' : 'centavos';
    if (integerPart > 0) {
      result += ` e ${centsWords} ${centsUnit}`;
    } else {
      result = `${centsWords} ${centsUnit}`;
    }
  }

  return result;
}

/**
 * Converte data YYYY-MM-DD para "11 de Agosto de 2026"
 */
export function formatDateExtenso(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const monthNames = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    if (month >= 0 && month < 12) {
      return `${day} de ${monthNames[month]} de ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}
