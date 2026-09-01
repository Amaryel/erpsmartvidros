export type QuoteStatus = 'rascunho' | 'aprovado' | 'convertido' | 'cancelado';

export type ProductType = 'dimensao' | 'simples';

export type CatalogCategory = 'produto' | 'servico';

export type GlassType = 'temperado' | 'laminado' | 'comum' | 'insulado' | 'serigrafado' | 'outro';

export type TechnicalCategory = 'porta' | 'janela' | 'box' | 'espelho' | 'vidro' | 'guarda_corpo' | 'outro';

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

export type CutProductType =
  | 'vidro_temperado'
  | 'box_banheiro'
  | 'janela'
  | 'porta'
  | 'esquadria'
  | 'espelho'
  | 'outro';

export interface CutItemDetails {
  cutCalculationId?: string;
  ruleId?: string;
  ruleName?: string;
  productType?: CutProductType;
  spanWidthMm: number; // Largura do vão (mm)
  spanHeightMm: number; // Altura do vão (mm)
  spanQuantity?: number;
  cutWidthMm: number; // Largura final de corte (mm)
  cutHeightMm: number; // Altura final de corte (mm)
  piecesCount: number; // Quantidade de peças de corte
  lateralGap?: number; // Folga lateral (mm)
  topGap?: number; // Folga superior (mm)
  bottomGap?: number; // Folga inferior (mm)
  widthDiscount?: number; // Desconto total largura (mm)
  heightDiscount?: number; // Desconto total altura (mm)
  formulaUsed?: string; // Descrição da fórmula aplicada
  notes?: string; // Informações técnicas de corte
}

export interface QuoteItem {
  id: string;
  type: ProductType;
  category?: CatalogCategory; // 'produto' | 'servico'
  name: string;
  description?: string;
  
  // Organização por Ambiente / Obra (ex: Sala, Banheiro, Fachada, Cozinha)
  environment?: string;

  // Categoria Técnica p/ Ilustração Vetorial 2D Automática
  technicalCategory?: TechnicalCategory;

  // Características Técnicas Detalhadas do Item (exibidas no orçamento e PDF)
  glassType?: string; // Temperado, Laminado, Comum, Insulado...
  thickness?: string; // 6mm, 8mm, 10mm, 12mm...
  glassColor?: string; // Incolor, Fumê, Verde, Bronze, Astral...
  hardwareColor?: string; // Preto, Branco, Fosco, Bronze, Cromado, Ouro...
  aluminumColor?: string; // Preto, Branco, Fosco/Natural, Bronze, Champagne...
  line?: string; // Suprema, Gold, Convencional, Elegance, Slide...
  openingType?: string; // De Correr, Pivotante, Fixo, Basculante, Maxim-ar, Abrir...
  leafCount?: string; // 1 Folha, 2 Folhas (1F+1M), 4 Folhas (2F+2M)...
  finish?: string; // Lapidado Reto, Bisotê 25mm, Jateado, Canto Moeda...
  itemNotes?: string; // Observação específica do item

  // Para produto com dimensões (em milímetros)
  lengthMm?: number; // Altura / Altura do Vão (mm)
  widthMm?: number; // Largura / Largura do Vão (mm)
  areaM2?: number; // Calculado: (lengthMm/1000) * (widthMm/1000)
  pricePerM2?: number; // Valor por m²
  
  // Para produto simples ou serviço
  unitPrice?: number; // Valor unitário
  
  // Comum
  quantity: number;
  totalPrice: number; // Calculado

  // Informações Técnicas de Corte (opcional)
  cutDetails?: CutItemDetails;
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
export type UserRole = 'superadmin' | 'admin' | 'vendedor' | 'funcionario' | 'operador';
export type UserStatus = 'pendente' | 'aprovado' | 'rejeitado';

export type SystemModuleId =
  | 'dashboard'
  | 'operations'
  | 'cut_calculator'
  | 'quotes'
  | 'sales'
  | 'cash'
  | 'contracts'
  | 'receivables'
  | 'receipts'
  | 'reports'
  | 'clients'
  | 'products'
  | 'services'
  | 'company'
  | 'users';

export interface UserPermissions {
  // Módulos que o usuário pode acessar
  allowedModules: SystemModuleId[];
  
  // Limites comerciais e descontos
  maxDiscountPercent: number; // Porcentagem máxima permitida (ex: 5, 10, 15, 100)
  canGiveDiscount?: boolean; // Se tem permissão para aplicar desconto
  
  // Permissões operacionais
  canSettleReceivables?: boolean; // Se pode dar baixa em contas a receber / fiado
  canCancelSales?: boolean; // Se pode cancelar vendas e orçamentos
  canManageUsers?: boolean; // Se pode cadastrar e configurar outros usuários (admin / superadmin)
  canAccessSensitiveSettings?: boolean; // Se pode alterar chaves sensíveis como Supabase (somente superadmin)
}

export interface UserAccount {
  id: string;
  companyId: string;
  name: string;
  email: string;
  username?: string; // Nome de usuário para acesso sem e-mail após aprovação
  password?: string;
  role: UserRole;
  status: UserStatus;
  permissions?: UserPermissions;
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
  permissions?: UserPermissions;
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

// ============================================================
// MÓDULO CÁLCULO DE MEDIDAS DE CORTE (ESQUADRIAS E VIDROS)
// ============================================================

export interface CutRule {
  id: string;
  companyId?: string;
  name: string; // Ex: "Box Frontal F1 (1 Fixo + 1 Correr)", "Janela 2 Folhas Linha Suprema"
  productType: CutProductType;
  description?: string;
  
  // Descontos e folgas em milímetros (mm)
  widthDiscount: number; // Desconto na largura total (mm)
  heightDiscount: number; // Desconto na altura total (mm)
  lateralGap: number; // Folga lateral (mm)
  topGap: number; // Folga superior (mm)
  bottomGap: number; // Folga inferior (mm)
  
  // Divisão de folhas / peças
  piecesPerSpan: number; // Quantidade de peças geradas por vão (ex: 2 para 2 folhas)
  customFormulaDescription?: string; // Descrição legível da fórmula utilizada
  
  isActive: boolean;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CutCalculation {
  id: string;
  companyId?: string;
  userId?: string;
  userName?: string;
  code: string; // Ex: CORTE-0001
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
  projectName?: string; // Nome da Obra / Local (ex: "Edifício Roma - Apto 302")
  
  productType: CutProductType;
  ruleId?: string;
  ruleName: string;
  
  // Medidas do Vão Original (mm)
  spanWidthMm: number; // Largura do vão (mm)
  spanHeightMm: number; // Altura do vão (mm)
  spanQuantity: number; // Quantidade de vãos
  
  // Folgas e descontos aplicados (mm)
  widthDiscount: number;
  heightDiscount: number;
  lateralGap: number;
  topGap: number;
  bottomGap: number;
  piecesPerSpan: number;
  
  // Medidas de Corte de Fabricação por Peça (mm)
  cutWidthMm: number; // Largura final de corte (mm)
  cutHeightMm: number; // Altura final de corte (mm)
  totalPieces: number; // Quantidade total de peças (spanQuantity * piecesPerSpan)
  
  // Áreas calculadas
  singlePieceAreaM2: number; // Área de 1 peça de corte (m²)
  totalAreaM2: number; // Área total do lote (m²)
  
  // Integração com preço / orçamento
  pricePerM2?: number;
  totalPrice?: number;
  
  formulaUsed: string; // Ex: "Largura: (1200 - 10) / 2 = 595mm | Altura: 2100 - 35 = 2065mm"
  notes?: string; // Anotações técnicas / tipo do vidro / cor / têmpera
  
  // Rastreabilidade
  quoteId?: string;
  quoteCode?: string;
  saleId?: string;
  saleCode?: string;
  
  createdAt: string;
  updatedAt: string;
}



