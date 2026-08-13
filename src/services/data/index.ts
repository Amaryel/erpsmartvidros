/**
 * CAMADA DE DADOS E REPOSITÓRIOS - SMART VIDROS
 * 
 * Esta camada centraliza todos os acessos aos dados da aplicação, separando
 * a Interface do Usuário (UI) da mecânica de armazenamento e banco de dados.
 * 
 * Atualmente os repositórios utilizam o `storageAdapter` (LocalStorage local).
 * Para a futura integração com o Supabase, basta substituir o adaptador de armazenamento
 * ou estender os repositórios para consultar o cliente Supabase sem alterar os componentes.
 */

export * from './uuid';
export * from './auth';
export * from './storageAdapter';

// Repositórios por Entidade
export * from './repositories/clientsRepository';
export * from './repositories/productsRepository';
export * from './repositories/servicesRepository';
export * from './repositories/budgetsRepository';
export * from './repositories/salesRepository';
export * from './repositories/paymentsRepository';
export * from './repositories/receiptsRepository';
export * from './repositories/accountsReceivableRepository';
export * from './repositories/companyRepository';
export * from './repositories/managerTasksRepository';
export * from './repositories/usersRepository';
