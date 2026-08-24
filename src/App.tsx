import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { QuoteList } from './components/QuoteList';
import { QuoteForm } from './components/QuoteForm';
import { QuoteViewModal } from './components/QuoteViewModal';
import { SaleList } from './components/SaleList';
import { SaleViewModal } from './components/SaleViewModal';
import { PosModal } from './components/PosModal';
import { ReceivablesList } from './components/ReceivablesList';
import { CatalogManager } from './components/CatalogManager';
import { CompanySettings } from './components/CompanySettings';
import { ReceiptList } from './components/ReceiptList';
import { ReceiptForm } from './components/ReceiptForm';
import { ReceiptViewModal } from './components/ReceiptViewModal';
import { ClientList } from './components/ClientList';
import { ProductList } from './components/ProductList';
import { ServiceList } from './components/ServiceList';
import { OperationsModule } from './components/OperationsModule';
import { LoginPage } from './components/LoginPage';
import { UserProfileModal } from './components/UserProfileModal';
import { SupabaseSyncModal } from './components/SupabaseSyncModal';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { ContractList } from './components/ContractList';
import { ContractGeneratorModal } from './components/ContractGeneratorModal';
import { ContractViewModal } from './components/ContractViewModal';
import { CashModule } from './components/CashModule';
import {
  Quote,
  CompanyInfo,
  CatalogItem,
  QuoteStatus,
  Receipt,
  Sale,
  Receivable,
  AppUser,
  Contract,
} from './types';
import {
  getQuotes,
  saveQuote,
  deleteQuote,
  updateQuoteStatus,
  getCompanyInfo,
  saveCompanyInfo,
  getCatalog,
  saveCatalogItem,
  deleteCatalogItem,
  getReceipts,
  deleteReceipt,
  getSales,
  deleteSale,
  getReceivables,
  deleteReceivable,
  finalizeSale,
  getCurrentSessionUser,
  logoutUser,
  getUsers,
  SUPERADMIN_EMAIL,
  initSupabaseKeepAlive,
  getContracts,
  deleteContract,
  getContractBySaleId,
  getContractById,
} from './services/storage';

export default function App() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [companyInfo, setCompanyInfoState] = useState<CompanyInfo>({
    name: 'Smart Vidros',
    ownerName: 'James Clayton do Nascimento',
    cnpj: '51.840.669/0001-22',
    phone: '(89) 9 9991-0028',
    email: 'contato.smartvidros@gmail.com',
    address: 'Rua Projetada – Sussuapara-PI',
    city: 'Picos – PI',
  });

  // Autenticação e Sessão de Usuário
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSupabaseSyncModalOpen, setIsSupabaseSyncModalOpen] = useState(false);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);

  // Aba Início/Dashboard como Padrão
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Estado da Sidebar Lateral
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  // Preenchimento Automático para formulários vindos de Clientes
  const [clientPreFill, setClientPreFill] = useState<{ name: string; phone?: string } | null>(null);

  // Estados para modais de orçamento
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [viewingQuote, setViewingQuote] = useState<Quote | null>(null);

  // Estados para Vendas & PDV
  const [isPosOpen, setIsPosOpen] = useState(false);
  const [posInitialQuote, setPosInitialQuote] = useState<Quote | null>(null);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);

  // Estados para Contratos
  const [generatorSale, setGeneratorSale] = useState<Sale | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);

  // Estados para Recibos
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);

  // Toast Notificação
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Carregar dados iniciais do localStorage & Iniciar Keep-Alive Supabase
  useEffect(() => {
    initSupabaseKeepAlive();
    refreshData();
  }, []);

  const refreshData = () => {
    setQuotes(getQuotes());
    setSales(getSales());
    setContracts(getContracts());
    setReceivables(getReceivables());
    setReceipts(getReceipts());
    setCatalog(getCatalog());
    setCompanyInfoState(getCompanyInfo());
    
    // Atualizar Usuário Logado & Cadastros Pendentes
    const user = getCurrentSessionUser();
    setCurrentUser(user);
    const allUsers = getUsers();
    setPendingUsersCount(allUsers.filter((u) => u.status === 'pendente').length);
  };

  const handleSuccessLogin = (user: AppUser) => {
    setCurrentUser(user);
    showToast(`Bem-vindo, ${user.name}!`);
    refreshData();
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setIsProfileModalOpen(false);
    setActiveTab('dashboard');
    showToast('Você saiu do sistema com segurança.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --- MÓDULO DE ORÇAMENTOS ---
  const handleSaveQuote = (
    quoteData: Omit<Quote, 'id' | 'code' | 'createdAt' | 'updatedAt'> & { id?: string; code?: string }
  ) => {
    const saved = saveQuote(quoteData);
    refreshData();
    setActiveTab('quotes');
    setEditingQuote(null);
    setClientPreFill(null);
    showToast(`Orçamento ${saved.code} salvo com sucesso!`);
  };

  const handleDeleteQuote = (id: string) => {
    deleteQuote(id);
    refreshData();
    showToast('Orçamento excluído com sucesso.');
  };

  const handleStatusChange = (id: string, status: QuoteStatus) => {
    updateQuoteStatus(id, status);
    refreshData();
    showToast(`Status do orçamento atualizado para "${status}".`);
  };

  const handleApproveQuote = (quoteId: string) => {
    updateQuoteStatus(quoteId, 'aprovado');
    refreshData();
    if (viewingQuote && viewingQuote.id === quoteId) {
      setViewingQuote({ ...viewingQuote, status: 'aprovado' });
    }
    showToast(`Orçamento aprovado com sucesso!`);
  };

  // Abrir PDV para converter orçamento em venda
  const handleOpenPdvFromQuote = (quoteId: string) => {
    const q = quotes.find((item) => item.id === quoteId);
    if (!q) return;

    if (q.status === 'pendente' || q.status === 'rascunho') {
      updateQuoteStatus(quoteId, 'aprovado');
    }

    setPosInitialQuote(q);
    setIsPosOpen(true);
    setViewingQuote(null);
  };

  // Abrir PDV Venda Direta
  const handleOpenPdvDirect = () => {
    setPosInitialQuote(null);
    setIsPosOpen(true);
  };

  // --- MÓDULO DE VENDAS & PDV ---
  const handleFinalizeSaleFromPdv = (
    saleObject: Sale,
    installmentsConfig: { count: number; dueDates: string[]; amounts: number[] },
    emitReceipt: boolean,
    generateContract?: boolean
  ) => {
    const result = finalizeSale(saleObject, installmentsConfig, emitReceipt);
    refreshData();
    setIsPosOpen(false);
    setPosInitialQuote(null);

    if (emitReceipt && result.receipt) {
      setViewingReceipt(result.receipt);
      setActiveTab('receipts');
      if (generateContract) {
        setGeneratorSale(result.sale);
      }
      showToast(`Venda ${result.sale.code} finalizada! Recibo ${result.receipt.code} emitido.`);
    } else if (generateContract) {
      setGeneratorSale(result.sale);
      showToast(`Venda ${result.sale.code} concluída! Abrindo Gerador de Contrato...`);
    } else {
      setActiveTab('sales');
      showToast(`Venda ${result.sale.code} finalizada com sucesso!`);
    }
  };

  const handleDeleteSale = (saleId: string) => {
    deleteSale(saleId);
    refreshData();
    showToast('Registro de venda removido.');
  };

  // --- MÓDULO DE CONTRATOS ---
  const handleContractSaveSuccess = (savedContract: Contract) => {
    refreshData();
    setGeneratorSale(null);
    setEditingContract(null);
    setIsNewContractOpen(false);
    setViewingContract(savedContract);
    setActiveTab('contracts');
    showToast(`Contrato ${savedContract.code} salvo com sucesso!`);
  };

  const handleDeleteContract = (contractId: string) => {
    deleteContract(contractId);
    refreshData();
    showToast('Contrato excluído com sucesso.');
  };

  const handleOpenContractFromSaleId = (saleId: string) => {
    const existingContract = getContractBySaleId(saleId);
    if (existingContract) {
      setViewingContract(existingContract);
    } else {
      const sale = sales.find((s) => s.id === saleId);
      if (sale) {
        setGeneratorSale(sale);
      } else {
        showToast('Venda não encontrada para gerar contrato.');
      }
    }
  };

  const handleOpenContractFromId = (contractId: string) => {
    const c = getContractById(contractId);
    if (c) {
      setViewingContract(c);
    } else {
      showToast('Contrato não encontrado.');
    }
  };

  // --- MÓDULO DE CONTAS A RECEBER ---
  const handleDeleteReceivable = (receivableId: string) => {
    deleteReceivable(receivableId);
    refreshData();
    showToast('Lançamento no contas a receber excluído.');
  };

  // --- MÓDULO DE RECIBOS ---
  const handleReceiptSaveSuccess = (savedReceipt: Receipt, shouldOpenView: boolean = false) => {
    refreshData();
    setEditingReceipt(null);
    setClientPreFill(null);
    if (shouldOpenView) {
      setViewingReceipt(savedReceipt);
      setActiveTab('receipts');
    } else {
      setActiveTab('receipts');
      showToast(`Recibo ${savedReceipt.code} salvo com sucesso!`);
    }
  };

  const handleDeleteReceipt = (id: string) => {
    deleteReceipt(id);
    refreshData();
    showToast('Recibo excluído com sucesso.');
  };

  // --- CATÁLOGO BASE ---
  const handleSaveCatalogItem = (item: Omit<CatalogItem, 'id'> & { id?: string }) => {
    saveCatalogItem(item);
    refreshData();
    showToast('Catálogo atualizado!');
  };

  const handleDeleteCatalogItem = (id: string) => {
    deleteCatalogItem(id);
    refreshData();
    showToast('Item removido do catálogo.');
  };

  // --- DADOS DA EMPRESA ---
  const handleSaveCompany = (info: CompanyInfo) => {
    saveCompanyInfo(info);
    refreshData();
    showToast('Dados da empresa salvos com sucesso!');
  };

  // --- INTERCONEXÃO / NAVEGAÇÃO RÁPIDA ENTRE MÓDULOS ---
  const handleOpenQuoteFromId = (quoteId: string) => {
    const q = quotes.find((item) => item.id === quoteId);
    if (q) {
      setViewingQuote(q);
    } else {
      showToast('Orçamento de origem não foi encontrado.');
    }
  };

  const handleOpenSaleFromId = (saleId: string) => {
    const s = sales.find((item) => item.id === saleId);
    if (s) {
      setViewingSale(s);
    } else {
      showToast('Venda correspondente não foi encontrada.');
    }
  };

  const handleOpenReceiptFromId = (receiptId: string) => {
    const r = receipts.find((item) => item.id === receiptId);
    if (r) {
      setViewingReceipt(r);
    } else {
      showToast('Recibo correspondente não foi encontrado.');
    }
  };

  const handleOpenReceivableFromId = (receivableId: string) => {
    setActiveTab('receivables');
  };

  // Ações a partir do Módulo de Clientes
  const handleNewQuoteForClient = (clientName: string, clientPhone?: string) => {
    setEditingQuote(null);
    setClientPreFill({ name: clientName, phone: clientPhone });
    setActiveTab('new_quote');
  };

  const handleNewReceiptForClient = (clientName: string, clientPhone?: string) => {
    setEditingReceipt(null);
    setClientPreFill({ name: clientName, phone: clientPhone });
    setActiveTab('new_receipt');
  };

  // Bloqueio de Segurança / Rota de Login: se o usuário não estiver autenticado, exibir exclusivamente a LoginPage
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans selection:bg-amber-500 selection:text-slate-950">
        <LoginPage onSuccessLogin={handleSuccessLogin} />
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-[9999] bg-slate-900 text-amber-400 px-4 py-3 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 border border-amber-500/50 animate-fade-in">
            <span>✨</span>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col">
      
      {/* Menu Lateral Responsivo (Sidebar) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isSidebarMobileOpen}
        setIsMobileOpen={setIsSidebarMobileOpen}
        quotesCount={quotes.length}
        salesCount={sales.length}
        contractsCount={contracts.length}
        receivablesCount={receivables.length}
        receiptsCount={receipts.length}
        pendingUsersCount={pendingUsersCount}
        currentUser={currentUser}
        companyInfo={companyInfo}
        onNewQuoteClick={() => {
          setEditingQuote(null);
          setActiveTab('new_quote');
        }}
        onOpenPdvClick={handleOpenPdvDirect}
      />

      {/* Conteúdo Principal com Recuo Adaptativo para a Sidebar */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        
        {/* Toast Notificação Flutuante */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-amber-400 px-4 py-3 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 border border-amber-500/50 print:hidden animate-bounce">
            <span>✨</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Navegação Principal */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          quotesCount={quotes.length}
          salesCount={sales.length}
          contractsCount={contracts.length}
          receivablesCount={receivables.length}
          receiptsCount={receipts.length}
          currentUser={currentUser}
          companyInfo={companyInfo}
          onNewQuoteClick={() => {
            setEditingQuote(null);
            setActiveTab('new_quote');
          }}
          onNewReceiptClick={() => {
            setEditingReceipt(null);
            setActiveTab('new_receipt');
          }}
          onOpenPdvClick={handleOpenPdvDirect}
          onToggleSidebarMobile={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenSupabaseSyncModal={() => setIsSupabaseSyncModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Área de Conteúdo do Sistema */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
          
          {/* ABA 1: DASHBOARD / INÍCIO */}
          {activeTab === 'dashboard' && (
            <Dashboard
              quotes={quotes}
              sales={sales}
              receivables={receivables}
              receipts={receipts}
              companyInfo={companyInfo}
              onNavigate={(tab) => setActiveTab(tab)}
              onNewQuote={() => {
                setEditingQuote(null);
                setActiveTab('new_quote');
              }}
              onOpenPdv={handleOpenPdvDirect}
              onNewReceipt={() => {
                setEditingReceipt(null);
                setActiveTab('new_receipt');
              }}
              onViewQuote={(q) => setViewingQuote(q)}
              onViewSale={(s) => setViewingSale(s)}
              onViewReceipt={(r) => setViewingReceipt(r)}
            />
          )}

          {/* ABA DE ACOMPANHAMENTO OPERACIONAL (OBRAS & TAREFAS) */}
          {activeTab === 'operations' && (
            <OperationsModule
              onOpenReceivablesTab={() => setActiveTab('receivables')}
              onRefresh={refreshData}
            />
          )}

          {/* ABA 2: ORÇAMENTOS */}
          {activeTab === 'quotes' && (
            <QuoteList
              quotes={quotes}
              onNewQuote={() => {
                setEditingQuote(null);
                setActiveTab('new_quote');
              }}
              onView={(quote) => setViewingQuote(quote)}
              onEdit={(quote) => {
                setEditingQuote(quote);
                setActiveTab('new_quote');
              }}
              onDelete={handleDeleteQuote}
              onConvertToSale={handleOpenPdvFromQuote}
              onStatusChange={handleStatusChange}
            />
          )}

          {/* ABA 3: NOVO/EDITAR ORÇAMENTO */}
          {activeTab === 'new_quote' && (
            <QuoteForm
              initialQuote={
                editingQuote ??
                (clientPreFill
                  ? ({ clientName: clientPreFill.name, clientPhone: clientPreFill.phone || '' } as any)
                  : null)
              }
              onSave={handleSaveQuote}
              onCancel={() => {
                setEditingQuote(null);
                setClientPreFill(null);
                setActiveTab('quotes');
              }}
              onPreview={(tempQuote) => setViewingQuote(tempQuote)}
            />
          )}

          {/* ABA 4: VENDAS & PDV */}
          {activeTab === 'sales' && (
            <SaleList
              sales={sales}
              companyInfo={companyInfo}
              onNewSale={handleOpenPdvDirect}
              onViewSale={(sale) => setViewingSale(sale)}
              onDeleteSale={handleDeleteSale}
              onOpenQuote={handleOpenQuoteFromId}
              onOpenReceipt={handleOpenReceiptFromId}
              onOpenReceivable={handleOpenReceivableFromId}
              onOpenContract={handleOpenContractFromSaleId}
            />
          )}

          {/* ABA MÓDULO: CAIXA & CONTROLE FINANCEIRO */}
          {activeTab === 'cash' && (
            <CashModule currentUser={currentUser} />
          )}

          {/* ABA NOVO MÓDULO: CONTRATOS */}
          {activeTab === 'contracts' && (
            <ContractList
              contracts={contracts}
              sales={sales}
              companyInfo={companyInfo}
              onNewContract={() => setIsNewContractOpen(true)}
              onEditContract={(contract) => setEditingContract(contract)}
              onViewContract={(c) => setViewingContract(c)}
              onDeleteContract={handleDeleteContract}
              onGenerateFromSale={(sale) => setGeneratorSale(sale)}
              onOpenSale={handleOpenSaleFromId}
              onOpenQuote={handleOpenQuoteFromId}
            />
          )}

          {/* ABA 5: CONTAS A RECEBER */}
          {activeTab === 'receivables' && (
            <ReceivablesList
              receivables={receivables}
              companyInfo={companyInfo}
              onRefresh={refreshData}
              onDeleteReceivable={handleDeleteReceivable}
              onOpenSale={handleOpenSaleFromId}
              onOpenQuote={handleOpenQuoteFromId}
              onOpenReceipt={handleOpenReceiptFromId}
              onShowToast={showToast}
            />
          )}

          {/* ABA 6: RECIBOS */}
          {activeTab === 'receipts' && (
            <ReceiptList
              receipts={receipts}
              companyInfo={companyInfo}
              onNewReceipt={() => {
                setEditingReceipt(null);
                setActiveTab('new_receipt');
              }}
              onEditReceipt={(receipt) => {
                setEditingReceipt(receipt);
                setActiveTab('new_receipt');
              }}
              onViewReceipt={(receipt) => setViewingReceipt(receipt)}
              onDeleteReceipt={handleDeleteReceipt}
            />
          )}

          {/* ABA 7: NOVO/EDITAR RECIBO */}
          {activeTab === 'new_receipt' && (
            <ReceiptForm
              initialData={
                editingReceipt ??
                (clientPreFill
                  ? ({ clientName: clientPreFill.name, clientPhone: clientPreFill.phone || '' } as any)
                  : null)
              }
              onSaveSuccess={handleReceiptSaveSuccess}
              onCancel={() => {
                setEditingReceipt(null);
                setClientPreFill(null);
                setActiveTab('receipts');
              }}
            />
          )}

          {/* ABA 8: DIRETÓRIO DE CLIENTES */}
          {activeTab === 'clients' && (
            <ClientList
              quotes={quotes}
              sales={sales}
              receivables={receivables}
              onNewQuoteForClient={handleNewQuoteForClient}
              onNewReceiptForClient={handleNewReceiptForClient}
            />
          )}

          {/* ABA 9: PRODUTOS */}
          {activeTab === 'products' && (
            <ProductList catalog={catalog} onRefresh={refreshData} />
          )}

          {/* ABA 10: SERVIÇOS */}
          {activeTab === 'services' && (
            <ServiceList catalog={catalog} onRefresh={refreshData} />
          )}

          {/* ABA 11: CATÁLOGO GERAL */}
          {activeTab === 'catalog' && (
            <CatalogManager
              catalog={catalog}
              onSaveItem={handleSaveCatalogItem}
              onDeleteItem={handleDeleteCatalogItem}
            />
          )}

          {/* ABA 10: CONFIGURAÇÕES DA EMPRESA */}
          {activeTab === 'company' && (
            <CompanySettings
              companyInfo={companyInfo}
              onSave={handleSaveCompany}
              onOpenSupabaseSyncModal={() => setIsSupabaseSyncModalOpen(true)}
            />
          )}

          {/* ABA 11: PAINEL SUPER ADMIN */}
          {activeTab === 'superadmin' && (
            <SuperAdminPanel
              currentUser={currentUser!}
              onShowToast={showToast}
              onRefreshUsers={refreshData}
            />
          )}
        </main>

        {/* MODAL DE PERFIL DE USUÁRIO E ALTERAÇÃO DE SENHA */}
        <UserProfileModal
          currentUser={currentUser}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onUpdateUser={(updatedUser) => {
            setCurrentUser(updatedUser);
            refreshData();
          }}
          onShowToast={showToast}
        />

        {/* MODAL DE SINCRONIZAÇÃO COM SUPABASE */}
        <SupabaseSyncModal
          isOpen={isSupabaseSyncModalOpen}
          onClose={() => setIsSupabaseSyncModalOpen(false)}
          onDataSynced={refreshData}
          onShowToast={showToast}
        />

        {/* MODAL DE VENDAS / PDV (PONTO DE VENDA) */}
        {isPosOpen && (
          <PosModal
            initialQuote={posInitialQuote}
            companyInfo={companyInfo}
            onClose={() => {
              setIsPosOpen(false);
              setPosInitialQuote(null);
            }}
            onFinalizeSale={handleFinalizeSaleFromPdv}
          />
        )}

        {/* MODAL GERADOR DE CONTRATOS A PARTIR DE VENDA */}
        {generatorSale && (
          <ContractGeneratorModal
            initialSale={generatorSale}
            sale={generatorSale}
            companyInfo={companyInfo}
            onClose={() => setGeneratorSale(null)}
            onSaveSuccess={handleContractSaveSuccess}
          />
        )}

        {/* MODAL EDITAR CONTRATO EXISTENTE */}
        {editingContract && (
          <ContractGeneratorModal
            initialContract={editingContract}
            contract={editingContract}
            companyInfo={companyInfo}
            onClose={() => setEditingContract(null)}
            onSaveSuccess={handleContractSaveSuccess}
          />
        )}

        {/* MODAL NOVO CONTRATO AVULSO */}
        {isNewContractOpen && (
          <ContractGeneratorModal
            companyInfo={companyInfo}
            onClose={() => setIsNewContractOpen(false)}
            onSaveSuccess={handleContractSaveSuccess}
          />
        )}

        {/* MODAL DE VISUALIZAÇÃO & IMPRESSÃO/PDF DO CONTRATO */}
        {viewingContract && (
          <ContractViewModal
            contract={viewingContract}
            companyInfo={companyInfo}
            onClose={() => setViewingContract(null)}
            onEdit={(c) => {
              setViewingContract(null);
              setEditingContract(c);
            }}
            onDelete={(id) => {
              handleDeleteContract(id);
              setViewingContract(null);
            }}
            onOpenSale={handleOpenSaleFromId}
            onOpenQuote={handleOpenQuoteFromId}
          />
        )}

        {/* MODAL DE VISUALIZAÇÃO DA VENDA */}
        {viewingSale && (
          <SaleViewModal
            sale={viewingSale}
            companyInfo={companyInfo}
            onClose={() => setViewingSale(null)}
            onOpenQuote={handleOpenQuoteFromId}
            onOpenReceipt={handleOpenReceiptFromId}
            onOpenReceivable={handleOpenReceivableFromId}
            onOpenContract={handleOpenContractFromSaleId}
          />
        )}

        {/* MODAL DE VISUALIZAÇÃO & PDF DO ORÇAMENTO */}
        {viewingQuote && (
          <QuoteViewModal
            quote={viewingQuote}
            companyInfo={companyInfo}
            onClose={() => setViewingQuote(null)}
            onEdit={(q) => {
              setViewingQuote(null);
              setEditingQuote(q);
              setActiveTab('new_quote');
            }}
            onApproveQuote={handleApproveQuote}
            onConvertToSale={handleOpenPdvFromQuote}
          />
        )}

        {/* MODAL DE VISUALIZAÇÃO & PDF DO RECIBO */}
        {viewingReceipt && (
          <ReceiptViewModal
            receipt={viewingReceipt}
            companyInfo={companyInfo}
            onClose={() => setViewingReceipt(null)}
            onEdit={(r) => {
              setViewingReceipt(null);
              setEditingReceipt(r);
              setActiveTab('new_receipt');
            }}
            onOpenSale={handleOpenSaleFromId}
            onOpenReceivable={handleOpenReceivableFromId}
            onOpenQuote={handleOpenQuoteFromId}
          />
        )}

        {/* Rodapé do Sistema */}
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 print:hidden mt-auto">
          <p>Smart Vidros — Módulo ERP de Orçamentos, Vendas, PDV, Contratos, Contas a Receber e Recibos © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}
