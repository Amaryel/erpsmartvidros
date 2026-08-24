/**
 * Fachada de Armazenamento - Smart Vidros
 * Redireciona todas as chamadas para os repositórios centralizados da Camada de Dados (`src/services/data`).
 * Mantido para retrocompatibilidade com componentes existentes.
 */

export {
  // Clientes
  getClients,
  getClientById,
  findClientByName,
  saveClient,
  deleteClient,
  INITIAL_CLIENTS,

  // Empresa
  getCompanyInfo,
  saveCompanyInfo,
  DEFAULT_COMPANY_INFO,

  // Catálogo, Produtos & Serviços
  getCatalog,
  getProducts,
  getProductById,
  saveCatalogItem,
  deleteCatalogItem,
  DEFAULT_CATALOG,
  getServices,
  getServiceById,
  saveService,
  updateService,
  deleteService,
  getServicesList,
  addServiceToList,
  DEFAULT_SERVICES,

  // Orçamentos / Budgets
  getQuotes,
  getBudgets,
  getBudgetById,
  getQuoteById,
  saveQuote,
  createBudget,
  updateBudget,
  deleteQuote,
  deleteBudget,
  updateQuoteStatus,
  getNextQuoteCode,
  INITIAL_QUOTES,

  // Vendas & PDV
  getSales,
  getSaleById,
  createSale,
  updateSale,
  createSaleFromQuote,
  createSaleFromBudget,
  finalizeSale,
  deleteSale,
  getNextSaleCode,
  updateWorkDetails,
  addWorkLogEntry,

  // Pagamentos
  getPaymentsBySale,
  createPayment,

  // Recibos
  getReceipts,
  getReceiptById,
  saveReceipt,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  getNextReceiptCode,
  INITIAL_RECEIPTS,

  // Contas a Receber & Parcelamento
  getReceivables,
  getAccountsReceivable,
  getAccountReceivableById,
  saveReceivable,
  saveAccountReceivable,
  updateAccountReceivable,
  deleteReceivable,
  deleteAccountReceivable,
  updateInstallmentDueDate,
  payReceivableInstallment,
  getNextReceivableCode,

  // Tarefas do Gestor
  getManagerTasks,
  saveManagerTask,
  toggleManagerTask,
  deleteManagerTask,

  // Autenticação & Gestão de Usuários
  getUsers,
  getUserById,
  findUserByEmailOrUsername,
  registerUser,
  approveUser,
  rejectUser,
  updateUser,
  deleteUser,
  loginUser,
  logoutUser,
  getCurrentSessionUser,
  setSessionUser,
  isSuperAdmin,
  SUPERADMIN_EMAIL,

  // Sincronização Supabase
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  pushAllToSupabase,
  pullAllFromSupabase,
  syncAllWithSupabase,
  getLastSyncTime,
  initSupabaseKeepAlive,

  // Contratos
  getContracts,
  getContractById,
  getContractBySaleId,
  getContractByQuoteId,
  getNextContractCode,
  saveContract,
  deleteContract,
  generateContractFromSale,
  generateContractFromQuote,
  buildObjectClauseText,
  buildPaymentClauseText,
  buildExecutionDeadlineText,
  CONTRACT_CLAUSE_TEMPLATES,

  // Caixa & Controle Financeiro
  getCashTransactions,
  getCashTransactionById,
  createCashTransaction,
  updateCashTransaction,
  cancelCashTransaction,
  getCashInitialBalance,
  setCashInitialBalance,
  getCashCategories,
  saveCashCategory,
  deleteCashCategory,
  getCashSessions,
  getCurrentOpenCashSession,
  openCashSession,
  closeCashSession,
  calculateCashSummary,
  recordSaleCashPayments,
  recordReceivableCashPayment,
  DEFAULT_CASH_CATEGORIES,
} from './data';
