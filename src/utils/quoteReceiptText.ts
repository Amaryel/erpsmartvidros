import { Quote, CompanyInfo } from '../types';
import { numberToWordsBRL, formatDateExtenso } from './numberToWords';

export interface QuoteReceiptTextResult {
  fullText: string;
  clientNameBold: string;
  valueFormatted: string;
  valueExtenso: string;
  servicesUpper: string;
  downPaymentText: string | null;
  dateExtenso: string;
  dateRaw: string;
  ownerName: string;
  cnpj: string;
  city: string;
}

export function generateQuoteReceiptText(quote: Quote, companyInfo: CompanyInfo): QuoteReceiptTextResult {
  const ownerName = companyInfo.ownerName || 'James Clayton do Nascimento';
  const cnpj = companyInfo.cnpj || '51.840.669/0001-22';
  const city = companyInfo.city || 'Picos - PI';

  const clientNameBold = quote.clientName ? quote.clientName.trim().toUpperCase() : 'CLIENTE';

  const totalVal = quote.total || 0;
  const valueFormatted = totalVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const valueExtenso = numberToWordsBRL(totalVal);

  // Formatar serviço a partir dos produtos/serviços cadastrados no orçamento
  let servicesUpper = 'VIDROS E SERVIÇOS DE VIDRAÇARIA';
  if (quote.items && quote.items.length > 0) {
    const itemNames = quote.items
      .map((i) => i.name.trim().toUpperCase())
      .filter(Boolean);
    if (itemNames.length > 0) {
      servicesUpper = itemNames.join(', ');
    }
  }

  // Verificar se há entrada
  let downPaymentText: string | null = null;
  if (quote.downPaymentAmount && quote.downPaymentAmount > 0) {
    if (quote.downPaymentType === 'percent' && quote.downPaymentValue) {
      downPaymentText = `com entrada de ${quote.downPaymentValue}% do valor total`;
    } else {
      const dpFormatted = quote.downPaymentAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const dpExtenso = numberToWordsBRL(quote.downPaymentAmount);
      downPaymentText = `com entrada de ${dpFormatted} (${dpExtenso})`;
    }
  }

  // Data do documento
  const dateRaw = quote.date || new Date().toISOString().split('T')[0];
  const dateExtenso = formatDateExtenso(dateRaw);

  // Construir o texto do recibo
  // Padrão:
  // "Eu, James Clayton do Nascimento, inscrito no CNPJ sob o n° 51.840.669/0001-22, declaro, para os devidos fins, que recebi de NOME DO CLIENTE, a importância de R$ 6.900,00 (seis mil e novecentos reais), referente a VIDROS TEMPERADOS, com entrada de 25% do valor total, realizados no dia DATA DO RECIBO."
  let fullText = `Eu, ${ownerName}, inscrito no CNPJ sob o n° ${cnpj}, declaro, para os devidos fins, que recebi de ${clientNameBold}, a importância de ${valueFormatted} (${valueExtenso}), referente a ${servicesUpper}`;

  if (downPaymentText) {
    fullText += `, ${downPaymentText}`;
  }

  fullText += `, realizados no dia ${dateExtenso}.`;

  return {
    fullText,
    clientNameBold,
    valueFormatted,
    valueExtenso,
    servicesUpper,
    downPaymentText,
    dateExtenso,
    dateRaw,
    ownerName,
    cnpj,
    city,
  };
}
