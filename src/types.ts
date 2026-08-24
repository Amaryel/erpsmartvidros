export type QuoteStatus = 'rascunho' | 'aprovado' | 'convertido' | 'cancelado';

export type ProductType = 'dimensao' | 'simples';

export type CatalogCategory = 'produto' | 'servico';

export interface Client {
  id: string;
  companyId?: string;
  userId?: string;
  name: string; // Nome ou Razão Social
  cpfCnpj?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type DiscountType = 'percent' | 'fixed';

export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'transferencia' | 'fiado';

export interface QuoteItem {
  id: string;
  type: ProductType;
  name: string;
  description?: string;
  // Para produto com dimensões (em milímetros)
  lengthMm?: number;
  widthMm?: number;
  areaM2?: number; // Calculado: (lengthMm/1000) * (widthMm/1000)
  pricePerM2?: number; // Valor por m²
  
  // Para produto simples
  unitPrice?: number; // Valor unitário
  
  // Comum
  quantity: number;
  totalPrice: number; // Calculado
}

export interface WorkLogEntry {
  id: string;
  date: string; // ISO string
  authorName?: string; // Nome do responsável/usuário que alterou
  action: string; // Ex: 'Alteração de Status', 'Mudança de Prazo', 'Anotação Interna', 'Criação do Ticket'
  previousStatus?: 'pendente' | 'em_producao' | 'pronto' | 'entregue';
  newStatus?: 'pendente' | 'em_producao' | 'pronto' | 'entregue';
  previousDeliveryDate?: string;
  newDeliveryDate?: string;
  notes?: string;
}

export interface Quote {
  id: string;
  companyId?: string;
  userId?: string;
  clientId?: string;
  code: string; // ex: ORC-2026-001
  clientName?: string;
  clientPhone?: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  status: QuoteStatus;
  items: QuoteItem[];
  discountType: DiscountType;
  discountValue: number; // Porcentagem (%) ou Valor absoluto em R$
  subtotal: number; // Total sem desconto
  discountAmount: number; // Valor do desconto em R$
  total: number; // Total final com desconto
  downPaymentType?: DownPaymentType;
  downPaymentValue?: number; // Porcentagem ou R$
  downPaymentAmount?: number; // Valor em R$ da entrada
  downPaymentMethod?: PaymentMethod;
  notes?: string;
  deliveryDate?: string; // YYYY-MM-DD - Data prevista de entrega/execução
  internalNotes?: string; // Anotações internas da obra/serviço (para a equipe)
  workStatus?: 'pendente' | 'em_producao' | 'pronto' | 'entregue'; // Status da obra/execução
  workLogs?: WorkLogEntry[]; // Histórico de alterações e eventos do ticket
  convertedAt?: string;
  convertedSaleId?: string;
  convertedSaleCode?: string;
  contractId?: string;
  contractCode?: string;
}

export interface CatalogItem {
  id: string;
  companyId?: string;
  type: ProductType; // 'dimensao' | 'simples'
  category: CatalogCategory; // 'produto' | 'servico'
  name: string;
  description?: string;
  unit?: string; // 'm²', 'unidade', 'peça', 'm', 'barra', 'caixa', 'serviço', etc.
  defaultPrice: number; // Preço padrão por m² ou por unidade
  status: 'ativo' | 'inativo';
  imageUrl?: string; // Imagem/Foto do produto (URL ou Base64 capturado do aparelho)
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyInfo {
  id?: string;
  companyId?: string;
  name: string;
  ownerName?: string;
  cnpj?: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  logoUrl?: string;
  pixKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type DownPaymentType = 'percent' | 'fixed';

export interface SalePayment {
  id: string;
  method: PaymentMethod;
  amount: number;
  notes?: string;
}

export interface InstallmentPaymentHistory {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
}

export interface Installment {
  id: string;
  receivableId?: string;
  number: number;
  dueDate: string; // YYYY-MM-DD
  amount: number;
  paidAmount: number;
  status: 'pendente' | 'parcial' | 'pago';
  paidAt?: string;
  history?: InstallmentPaymentHistory[];
}

export interface Receivable {
  id: string;
  companyId?: string;
  userId?: string;
  clientId?: string;
  code: string; // ex: CR-000001
  saleId: string;
  saleCode: string;
  quoteId?: string;
  quoteCode?: string;
  receiptId?: string;
  clientName: string;
  clientPhone?: string;
  saleDate: string; // YYYY-MM-DD
  totalAmount: number; // Valor total fiado
  paidAmount: number; // Valor já recebido no fiado
  remainingAmount: number; // Restante a receber
  status: 'pendente' | 'parcial' | 'pago';
  installments: Installment[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Sale {
  id: string;
  companyId?: string;
  userId?: string;
  clientId?: string;
  code: string; // ex: VEN-2026-001
  quoteId?: string;
  quoteCode?: string;
  clientName?: string;
  clientPhone?: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
  items: QuoteItem[];
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  total: number;
  payments: SalePayment[];
  totalPaid: number; // Pago no ato (não-fiado)
  totalFiado: number; // Valor colocado como fiado
  status: 'concluida' | 'cancelada';
  receivableId?: string;
  receiptId?: string;
  contractId?: string;
  contractCode?: string;
  notes?: string;
  deliveryDate?: string; // YYYY-MM-DD - Data prevista de entrega/execução
  internalNotes?: string; // Anotações internas da obra/serviço (para a equipe)
  workStatus?: 'pendente' | 'em_producao' | 'pronto' | 'entregue'; // Status da obra/execução
  workLogs?: WorkLogEntry[]; // Histórico de alterações e eventos do ticket da obra
  hasChangesFromQuote?: boolean;
}

export interface ManagerTask {
  id: string;
  companyId?: string;
  userId?: string;
  title: string;
  dueDate?: string; // YYYY-MM-DD
  priority: 'alta' | 'media' | 'baixa';
  completed: boolean;
  notes?: string;
  taskLogs?: WorkLogEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  companyId?: string;
  userId?: string;
  clientId?: string;
  code: string; // ex: Recibo Nº 000001
  clientName: string; // obrigatório
  clientPhone?: string;
  amount: number; // Valor recebido (R$)
  service: string; // Nome do serviço / descrição
  downPaymentType?: DownPaymentType;
  downPaymentValue?: number; // Porcentagem ou R$
  downPaymentAmount?: number; // Valor em R$ da entrada
  date: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
  notes?: string;
  quoteId?: string;
  quoteCode?: string;
  saleId?: string;
  saleCode?: string;
  receivableId?: string;
  // Detalhes estendidos para recibo de Venda PDV
  saleTotalAmount?: number;
  salePaidAmount?: number;
  saleFiadoAmount?: number;
  paymentMethodsSummary?: string; // ex: "PIX: R$ 100,00 | Dinheiro: R$ 50,00 | Fiado: R$ 150,00"
  installmentsSummary?: string; // ex: "3x de R$ 50,00"
}

// Estruturas de Usuários, Autenticação e Controle de Acesso
export type UserRole = 'superadmin' | 'admin' | 'operador';
export type UserStatus = 'pendente' | 'aprovado' | 'rejeitado';

export interface UserAccount {
  id: string;
  companyId: string;
  name: string;
  email: string;
  username?: string; // Nome de usuário para acesso sem e-mail após aprovação
  password?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface AppUser {
  id: string;
  email: string;
  username?: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  companyId: string;
}

export interface AuthSession {
  user: AppUser | null;
  isAuthenticated: boolean;
}

export type ContractStatus = 'ativo' | 'rascunho' | 'concluido' | 'cancelado';

export interface Contract {
  id: string;
  companyId?: string;
  userId?: string;
  code: string; // ex: Contrato Nº 000001
  saleId?: string;
  saleCode?: string;
  quoteId?: string;
  quoteCode?: string;
  clientId?: string;
  clientName: string;
  clientDocument?: string; // CPF ou CNPJ
  clientAddress?: string;
  clientCity?: string;
  clientState?: string;
  clientPhone?: string;
  clientEmail?: string;

  // Dados da Contratada
  contractorName: string; // SMART VIDROS
  contractorDocument: string; // CNPJ 51.840.669/0001-22
  contractorAddress: string; // Rua Povoado Novo Paquetá, Sussuapara – PI

  // Cláusulas e Textos do Contrato
  title: string;
  objectClauseText: string; // Cláusula 1 - Objeto dinâmico
  totalAmount: number; // Valor total da venda/contrato
  totalAmountInWords: string; // Valor total por extenso
  paymentClauseText: string; // Cláusula 3 - Formas de pagamento dinâmicas
  executionDeadlineText: string; // Cláusula 4 - Prazo de execução
  obligationsContractorText: string; // Cláusula 5 - Obrigações da Contratada
  obligationsClientText: string; // Cláusula 6 - Obrigações da Contratante
  rescissionText: string; // Cláusula 7 - Rescisão
  jurisdictionText: string; // Cláusula 8 - Foro
  defaultClauseText: string; // Cláusula 9 - Inadimplência
  cancellationClauseText: string; // Cláusula 10 - Rescisão e Não Ressarcimento

  cityDate: string; // Ex: "Picos – PI, 18 de agosto de 2026"
  date: string; // YYYY-MM-DD
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// ============================================================
// MÓDULO CAIXA & FLUXO FINANCEIRO
// ============================================================

export type CashTransactionType = 'entrada' | 'saida';

export type CashPaymentMethod =
  | 'dinheiro'
  | 'pix'
  | 'cartao_credito'
  | 'cartao_debito'
  | 'transferencia'
  | 'cheque'
  | 'outro';

export interface CashCategoryItem {
  id: string;
  name: string;
  type: 'entrada' | 'saida' | 'ambos';
  isDefault?: boolean;
}

export interface CashTransaction {
  id: string;
  companyId: string;
  userId: string;
  userName?: string;
  type: CashTransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  description: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  paymentMethod: CashPaymentMethod;
  notes?: string;
  
  // Relacionamentos e Rastreabilidade
  saleId?: string;
  saleCode?: string;
  receivableId?: string;
  receivableCode?: string;
  clientId?: string;
  clientName?: string;
  cashSessionId?: string; // Vínculo opcional com sessão de caixa diário

  // Auditoria e Integridade
  status: 'ativo' | 'cancelado';
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  editedAt?: string;
  editedBy?: string;
  editReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CashInitialBalanceHistory {
  date: string;
  amount: number;
  setBy: string;
  notes?: string;
  timestamp: string;
}

export interface CashInitialBalance {
  id: string;
  companyId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  setBy: string;
  createdAt: string;
  updatedAt: string;
  history?: CashInitialBalanceHistory[];
}

export interface CashSession {
  id: string;
  companyId: string;
  date: string; // YYYY-MM-DD
  openedAt: string; // ISO
  closedAt?: string; // ISO
  openedBy: string;
  openedByUserId?: string;
  closedBy?: string;
  closedByUserId?: string;
  initialBalance: number;
  expectedBalance?: number;
  countedBalance?: number;
  difference?: number;
  differenceType?: 'sobra' | 'falta' | 'exato';
  differenceNotes?: string;
  notes?: string;
  status: 'aberto' | 'fechado';
  totalEntries?: number;
  totalExits?: number;
  byPaymentMethod?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}



