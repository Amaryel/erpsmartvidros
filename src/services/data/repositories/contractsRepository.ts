import { Contract, Sale, Quote, Client, CompanyInfo, Receivable } from '../../../types';
import { storageAdapter } from '../storageAdapter';
import { generateUUID } from '../uuid';
import { getCurrentCompanyId, getCurrentUserId } from '../auth';
import { autoSyncEntityChange } from '../supabaseSync';
import { valorPorExtenso } from '../../../utils/numberToWords';
import { getClients, findClientByName } from './clientsRepository';
import { getReceivables } from './accountsReceivableRepository';

const CONTRACTS_KEY = 'smart_vidros_contracts';
const CONTRACTS_COUNTER_KEY = 'smart_vidros_contracts_counter';

const DEFAULT_COMPANY_CNPJ = '51.840.669/0001-22';
const DEFAULT_COMPANY_ADDRESS = 'Rua Povoado Novo Paquetá, Sussuapara – PI';
const DEFAULT_CITY_STATE = 'Picos – PI';

export function getNextContractCode(): string {
  const currentCounter = storageAdapter.getItem<string>(CONTRACTS_COUNTER_KEY, null);
  let counter = currentCounter ? parseInt(currentCounter, 10) : 1;
  const code = `Contrato Nº ${String(counter).padStart(6, '0')}`;
  storageAdapter.setItem(CONTRACTS_COUNTER_KEY, String(counter + 1));
  return code;
}

export function getContracts(): Contract[] {
  const data = storageAdapter.getItem<Contract[]>(CONTRACTS_KEY, null);
  if (!data) {
    storageAdapter.setItem(CONTRACTS_KEY, []);
    return [];
  }
  return data;
}

export function getContractById(id: string): Contract | undefined {
  return getContracts().find((c) => c.id === id);
}

export function getContractBySaleId(saleId: string): Contract | undefined {
  return getContracts().find((c) => c.saleId === saleId);
}

export function getContractByQuoteId(quoteId: string): Contract | undefined {
  return getContracts().find((c) => c.quoteId === quoteId);
}

function formatDateBR(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const [y, m, d] = cleanDate.split('-');
    if (y && m && d) {
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
    return dateStr;
  } catch {
    return dateStr || '';
  }
}

function getCityDateText(dateStr?: string): string {
  const dateObj = dateStr ? new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`) : new Date();
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const dia = dateObj.getDate();
  const mes = meses[dateObj.getMonth()];
  const ano = dateObj.getFullYear();
  return `Picos – PI, ${dia} de ${mes} de ${ano}`;
}

const PAYMENT_LABELS: Record<string, string> = {
  pix: 'PIX',
  dinheiro: 'Dinheiro',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  transferencia: 'Transferência Bancária',
  fiado: 'Parcelado / Fiado',
};

/**
 * Constrói dinamicamente a Cláusula 1 (Objeto do Contrato) baseada nos itens da venda/orçamento
 */
export function buildObjectClauseText(items: Sale['items'] | Quote['items']): string {
  let text = 'O presente contrato tem como objeto a prestação de serviços de fornecimento e instalação de vidros, conforme produtos e serviços constantes na venda/orçamento e especificações acordadas entre as partes.\n\n';
  
  if (items && items.length > 0) {
    text += 'Especificação dos Itens / Serviços:\n';
    items.forEach((item, index) => {
      let dimInfo = '';
      if (item.type === 'dimensao' && item.lengthMm && item.widthMm) {
        dimInfo = ` (${item.lengthMm}mm x ${item.widthMm}mm - ${(item.areaM2 || 0).toFixed(2)}m²)`;
      }
      const itemPrice = item.totalPrice || 0;
      text += `${index + 1}. ${item.name}${dimInfo} — Qtd: ${item.quantity} ${item.quantity > 1 ? 'unidades' : 'unidade'} | Valor: R$ ${itemPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
      if (item.description) {
        text += `   Descrição: ${item.description}\n`;
      }
    });
  } else {
    text += 'Fornecimento e instalação de esquadrias e vidros temperados conforme projeto acordado.';
  }

  return text.trim();
}

/**
 * Constrói dinamicamente a Cláusula 3 (Forma de Pagamento) baseada nos pagamentos e parcelas da venda
 */
export function buildPaymentClauseText(
  sale: Sale,
  receivable?: Receivable | null
): string {
  const total = sale.total || 0;
  const totalExtenso = valorPorExtenso(total);

  let text = `O pagamento será realizado conforme as condições registradas na venda, totalizando o montante de R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${totalExtenso}), distribuído na seguinte forma:\n\n`;

  const paymentLines: string[] = [];

  // Pagamentos à vista / entradas
  if (sale.payments && sale.payments.length > 0) {
    sale.payments.forEach((p) => {
      if (p.amount > 0) {
        const label = PAYMENT_LABELS[p.method] || p.method.toUpperCase();
        const pExtenso = valorPorExtenso(p.amount);
        const pNotes = p.notes ? ` (${p.notes})` : '';
        paymentLines.push(`• ${label}: R$ ${p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${pExtenso})${pNotes}`);
      }
    });
  }

  // Parcelamento / Fiado
  if (sale.totalFiado > 0) {
    if (receivable && receivable.installments && receivable.installments.length > 0) {
      receivable.installments.forEach((inst) => {
        const instExtenso = valorPorExtenso(inst.amount);
        const dueFormatted = formatDateBR(inst.dueDate);
        paymentLines.push(`• Parcela ${String(inst.number).padStart(2, '0')}: R$ ${inst.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${instExtenso}) — vencimento em ${dueFormatted}`);
      });
    } else {
      const fiadoExtenso = valorPorExtenso(sale.totalFiado);
      paymentLines.push(`• Saldo a Prazo (Contas a Receber): R$ ${sale.totalFiado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${fiadoExtenso})`);
    }
  }

  if (paymentLines.length > 0) {
    text += paymentLines.join('\n');
  } else {
    text += `• Pagamento integral no valor de R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${totalExtenso}).`;
  }

  return text;
}

/**
 * Constrói dinamicamente a Cláusula 4 (Prazo de Execução)
 */
export function buildExecutionDeadlineText(deliveryDate?: string, internalNotes?: string): string {
  let text = 'A CONTRATADA compromete-se a executar os serviços dentro do prazo acordado entre as partes, podendo haver prorrogação em caso de força maior, atraso de fornecedores, condições climáticas ou situações alheias à responsabilidade da CONTRATADA.';
  
  if (deliveryDate) {
    text += `\n\nData prevista de entrega/execução: ${formatDateBR(deliveryDate)}.`;
  }
  
  if (internalNotes) {
    text += `\nObservações técnicas de execução: ${internalNotes}`;
  }

  return text;
}

/**
 * Cláusulas padrão Smart Vidros
 */
export const CONTRACT_CLAUSE_TEMPLATES = {
  obligationsContractor: `A CONTRATADA compromete-se a:
- Fornecer os materiais necessários para execução do serviço;
- Realizar a instalação conforme acordado;
- Entregar os serviços em condições adequadas de uso e acabamento.`,

  obligationsClient: `A CONTRATANTE compromete-se a:
- Efetuar os pagamentos nas datas acordadas;
- Garantir acesso ao local da instalação;
- Disponibilizar condições adequadas para execução dos serviços.`,

  rescission: `O descumprimento de qualquer cláusula deste contrato poderá ensejar sua rescisão, ficando a parte inadimplente responsável pelas perdas e danos eventualmente causados.`,

  jurisdiction: `Fica eleito o foro da comarca de Picos – PI para dirimir quaisquer dúvidas oriundas deste contrato.`,

  defaultClause: `Em caso de inadimplência de qualquer valor acordado neste contrato, a CONTRATADA, SMART VIDROS, terá o direito de realizar a remoção integral dos materiais e estruturas instaladas, independentemente de notificação judicial prévia, permanecendo a CONTRATANTE responsável pelos custos adicionais decorrentes da retirada, transporte e eventuais danos causados pela falta de pagamento.`,

  cancellationClause: `Em caso de cancelamento, desistência ou rescisão do presente contrato por iniciativa da CONTRATANTE, os valores já pagos à CONTRATADA não serão ressarcidos, considerando despesas operacionais, aquisição de materiais, deslocamentos, planejamento técnico e serviços já executados até a data da rescisão.`,
};

/**
 * Gera um contrato pronto a partir de uma Venda
 */
export function generateContractFromSale(
  sale: Sale,
  customClient?: Client | null,
  companyInfo?: CompanyInfo | null
): Contract {
  const allClients = getClients();
  const client =
    customClient ||
    (sale.clientId ? allClients.find((c) => c.id === sale.clientId) : null) ||
    (sale.clientName ? findClientByName(sale.clientName) : null) ||
    (sale.clientName
      ? allClients.find((c) =>
          c.name.trim().toLowerCase().includes(sale.clientName.trim().toLowerCase()) ||
          sale.clientName.trim().toLowerCase().includes(c.name.trim().toLowerCase())
        )
      : null);

  const receivable =
    (sale.receivableId ? getReceivables().find((r) => r.id === sale.receivableId) : null) ||
    getReceivables().find((r) => r.saleId === sale.id);

  // Se houver orçamento vinculado, checar se há mais dados
  let quoteDetails: Quote | undefined;
  if (sale.quoteId) {
    try {
      const { getQuoteById } = require('./quotesRepository');
      quoteDetails = getQuoteById(sale.quoteId);
    } catch {
      // Ignorar se houver ciclo
    }
  }

  const clientAddress = [
    client?.address,
    client?.city ? `${client.city}${client.state ? ` - ${client.state}` : ''}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  const total = sale.total || 0;
  const totalInWords = valorPorExtenso(total);

  const now = new Date().toISOString();
  const dateStr = sale.date || now.split('T')[0];

  return {
    id: generateUUID(),
    companyId: getCurrentCompanyId(),
    userId: getCurrentUserId(),
    code: getNextContractCode(),
    saleId: sale.id,
    saleCode: sale.code,
    quoteId: sale.quoteId || quoteDetails?.id,
    quoteCode: sale.quoteCode || quoteDetails?.code,
    clientId: client?.id || sale.clientId,
    clientName: client?.name || sale.clientName || quoteDetails?.clientName || 'Cliente',
    clientDocument: client?.cpfCnpj || '',
    clientAddress: clientAddress || '',
    clientCity: client?.city || 'Picos',
    clientState: client?.state || 'PI',
    clientPhone: client?.phone || client?.whatsapp || sale.clientPhone || quoteDetails?.clientPhone || '',
    clientEmail: client?.email || '',

    contractorName: companyInfo?.name || 'SMART VIDROS',
    contractorDocument: companyInfo?.cnpj || DEFAULT_COMPANY_CNPJ,
    contractorAddress: companyInfo?.address || DEFAULT_COMPANY_ADDRESS,

    title: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS SMART VIDROS',
    objectClauseText: buildObjectClauseText(sale.items && sale.items.length > 0 ? sale.items : (quoteDetails?.items || [])),
    totalAmount: total,
    totalAmountInWords: totalInWords,
    paymentClauseText: buildPaymentClauseText(sale, receivable),
    executionDeadlineText: buildExecutionDeadlineText(sale.deliveryDate, sale.internalNotes),
    obligationsContractorText: CONTRACT_CLAUSE_TEMPLATES.obligationsContractor,
    obligationsClientText: CONTRACT_CLAUSE_TEMPLATES.obligationsClient,
    rescissionText: CONTRACT_CLAUSE_TEMPLATES.rescission,
    jurisdictionText: CONTRACT_CLAUSE_TEMPLATES.jurisdiction,
    defaultClauseText: CONTRACT_CLAUSE_TEMPLATES.defaultClause,
    cancellationClauseText: CONTRACT_CLAUSE_TEMPLATES.cancellationClause,

    cityDate: getCityDateText(dateStr),
    date: dateStr,
    status: 'ativo',
    createdAt: now,
    updatedAt: now,
    notes: sale.notes || '',
  };
}

/**
 * Gera um contrato pronto a partir de um Orçamento
 */
export function generateContractFromQuote(
  quote: Quote,
  customClient?: Client | null,
  companyInfo?: CompanyInfo | null
): Contract {
  const client = customClient || (quote.clientId ? getClients().find((c) => c.id === quote.clientId) : null) || (quote.clientName ? findClientByName(quote.clientName) : null);
  const clientAddress = [client?.address, client?.city ? `${client.city}${client.state ? ` - ${client.state}` : ''}` : ''].filter(Boolean).join(', ');

  const total = quote.total || 0;
  const totalInWords = valorPorExtenso(total);

  const now = new Date().toISOString();
  const dateStr = quote.date || now.split('T')[0];

  let paymentText = `O pagamento será realizado conforme condições acordadas do orçamento ${quote.code}, no valor total de R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${totalInWords}).`;
  if (quote.downPaymentAmount && quote.downPaymentAmount > 0) {
    const downExtenso = valorPorExtenso(quote.downPaymentAmount);
    const restExtenso = valorPorExtenso(total - quote.downPaymentAmount);
    paymentText += `\n• Entrada: R$ ${quote.downPaymentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${downExtenso})\n• Saldo restante: R$ ${(total - quote.downPaymentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${restExtenso})`;
  }

  return {
    id: generateUUID(),
    companyId: getCurrentCompanyId(),
    userId: getCurrentUserId(),
    code: getNextContractCode(),
    saleId: quote.convertedSaleId,
    saleCode: quote.convertedSaleCode,
    quoteId: quote.id,
    quoteCode: quote.code,
    clientId: client?.id || quote.clientId,
    clientName: client?.name || quote.clientName || 'Cliente',
    clientDocument: client?.cpfCnpj || '',
    clientAddress: clientAddress || '',
    clientCity: client?.city || '',
    clientState: client?.state || '',
    clientPhone: client?.phone || client?.whatsapp || quote.clientPhone || '',
    clientEmail: client?.email || '',

    contractorName: companyInfo?.name || 'SMART VIDROS',
    contractorDocument: companyInfo?.cnpj || DEFAULT_COMPANY_CNPJ,
    contractorAddress: companyInfo?.address || DEFAULT_COMPANY_ADDRESS,

    title: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS SMART VIDROS',
    objectClauseText: buildObjectClauseText(quote.items || []),
    totalAmount: total,
    totalAmountInWords: totalInWords,
    paymentClauseText: paymentText,
    executionDeadlineText: buildExecutionDeadlineText(quote.deliveryDate, quote.internalNotes),
    obligationsContractorText: CONTRACT_CLAUSE_TEMPLATES.obligationsContractor,
    obligationsClientText: CONTRACT_CLAUSE_TEMPLATES.obligationsClient,
    rescissionText: CONTRACT_CLAUSE_TEMPLATES.rescission,
    jurisdictionText: CONTRACT_CLAUSE_TEMPLATES.jurisdiction,
    defaultClauseText: CONTRACT_CLAUSE_TEMPLATES.defaultClause,
    cancellationClauseText: CONTRACT_CLAUSE_TEMPLATES.cancellationClause,

    cityDate: getCityDateText(dateStr),
    date: dateStr,
    status: 'ativo',
    createdAt: now,
    updatedAt: now,
    notes: quote.notes || '',
  };
}

/**
 * Salva ou atualiza um contrato
 */
export function saveContract(contract: Contract): Contract {
  const contracts = getContracts();
  const now = new Date().toISOString();

  const preparedContract: Contract = {
    ...contract,
    id: contract.id || generateUUID(),
    code: contract.code || getNextContractCode(),
    companyId: contract.companyId || getCurrentCompanyId(),
    userId: contract.userId || getCurrentUserId(),
    updatedAt: now,
    createdAt: contract.createdAt || now,
    totalAmountInWords: contract.totalAmountInWords || valorPorExtenso(contract.totalAmount || 0),
  };

  const existingIndex = contracts.findIndex((c) => c.id === preparedContract.id);
  if (existingIndex >= 0) {
    contracts[existingIndex] = preparedContract;
  } else {
    contracts.unshift(preparedContract);
  }

  storageAdapter.setItem(CONTRACTS_KEY, contracts);
  autoSyncEntityChange('contracts', 'upsert', preparedContract);
  return preparedContract;
}

/**
 * Remove um contrato
 */
export function deleteContract(id: string): void {
  const contracts = getContracts().filter((c) => c.id !== id);
  storageAdapter.setItem(CONTRACTS_KEY, contracts);
  autoSyncEntityChange('contracts', 'delete', id);
}
