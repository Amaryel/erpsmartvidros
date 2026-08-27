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
import { PublicCatalogView } from './components/PublicCatalogView';
import { ReportsModule } from './components/ReportsModule';
import { CutCalculatorModule } from './components/CutCalculator/CutCalculatorModule';
import { SystemTourModal } from './components/SystemTourModal';
import { SmartIAChatDrawer } from './components/SmartIAChatDrawer';
import { HelpSupportModal } from './components/HelpSupportModal';
import { Bot, HelpCircle, Sparkles } from 'lucide-react';
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
  UserAccount,
  CutCalculation,
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
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
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

  // Estados para Tour, Smart IA e Central de Dúvidas
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isSmartIAOpen, setIsSmartIAOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Modo Catálogo Público / Vitrine Virtual para Clientes
  const [isPublicCatalogView, setIsPublicCatalogView] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const search = window.location.search || '';
    const hash = window.location.hash || '';
    return (
      search.includes('catalogo=publico') ||
      search.includes('catalogo=1') ||
      search.includes('public=catalog') ||
      search.includes('vitrine=1') ||
      hash === '#catalogo' ||
      hash === '#vitrine'
    );
  });

  // Listener para histórico e parâmetros de URL
  useEffect(() => {
    const checkPublicCatalogUrl = () => {
      const search = window.location.search || '';
      const hash = window.location.hash || '';
      if (
        search.includes('catalogo=publico') ||
        search.includes('catalogo=1') ||
        search.includes('public=catalog') ||
        search.includes('vitrine=1') ||
        hash === '#catalogo' ||
        hash === '#vitrine'
      ) {
        setIsPublicCatalogView(true);
      }
    };

    window.addEventListener('popstate', checkPublicCatalogUrl);
    window.addEventListener('hashchange', checkPublicCatalogUrl);
    return () => {
      window.removeEventListener('popstate', checkPublicCatalogUrl);
      window.removeEventListener('hashchange', checkPublicCatalogUrl);
    };
  }, []);

  // Carregar dados iniciais do localStorage & Iniciar Keep-Alive Supabase
  useEffect(() => {
    initSupabaseKeepAlive();
    refreshData();

    // Tour automático no primeiro acesso neste dispositivo/navegador
    const hasSeenTour = localStorage.getItem('smart_vidros_tour_completed');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
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
    setUsersList(allUsers);
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

  // Enviar cálculo de corte para novo orçamento
  const handleSendCutCalculationToQuote = (calc: CutCalculation) => {
    const pricePerM2 = calc.pricePerM2 && calc.pricePerM2 > 0 ? calc.pricePerM2 : 180;
    const singleArea = (calc.cutWidthMm / 1000) * (calc.cutHeightMm / 1000);
    const totalItemPrice = singleArea * calc.totalPieces * pricePerM2;

    const newQuote: Quote = {
      id: '',
      code: '',
      clientName: calc.clientName || '',
      clientPhone: calc.clientPhone || '',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'rascunho',
      items: [
        {
          id: 'item-' + Date.now(),
          type: 'dimensao',
          name: `${calc.ruleName} [${calc.code}]`,
          description: calc.projectName ? `Projeto: ${calc.projectName}` : (calc.notes || ''),
          lengthMm: calc.cutHeightMm,
          widthMm: calc.cutWidthMm,
          areaM2: Math.round(singleArea * 1000) / 1000,
          quantity: calc.totalPieces,
          pricePerM2: pricePerM2,
          totalPrice: Math.round(totalItemPrice * 100) / 100,
          cutDetails: {
            cutCalculationId: calc.id,
            ruleId: calc.ruleId,
            ruleName: calc.ruleName,
            productType: calc.productType,
            spanWidthMm: calc.spanWidthMm,
            spanHeightMm: calc.spanHeightMm,
            spanQuantity: calc.spanQuantity,
            cutWidthMm: calc.cutWidthMm,
            cutHeightMm: calc.cutHeightMm,
            piecesCount: calc.totalPieces,
            lateralGap: calc.lateralGap,
            topGap: calc.topGap,
            bottomGap: calc.bottomGap,
            widthDiscount: calc.widthDiscount,
            heightDiscount: calc.heightDiscount,
            formulaUsed: calc.formulaUsed,
            notes: calc.notes,
          },
        },
      ],
      discountType: 'percent',
      discountValue: 0,
      subtotal: Math.round(totalItemPrice * 100) / 100,
      discountAmount: 0,
      total: Math.round(totalItemPrice * 100) / 100,
      notes: calc.notes || (calc.projectName ? `Projeto: ${calc.projectName}` : ''),
      workStatus: 'pendente',
    };

    setEditingQuote(newQuote);
    setActiveTab('new_quote');
    showToast(`Cálculo [${calc.code}] transferido para o novo orçamento!`);
  };

  // Se estiver no Modo Catálogo Público (para clientes e visitantes)
  if (isPublicCatalogView) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans selection:bg-amber-500 selection:text-slate-950">
        {/* Se o usuário for da equipe e estiver logado, exibir banner discreto no topo para retornar ao painel */}
        {currentUser && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <span>👁️</span>
              <span>Você está visualizando a Vitrine Pública como seu cliente a enxerga.</span>
            </div>
            <button
              onClick={() => setIsPublicCatalogView(false)}
              className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-amber-400 rounded-lg text-xs font-extrabold transition-all"
            >
              ← Voltar ao Sistema ({currentUser.name})
            </button>
          </div>
        )}

        <PublicCatalogView
          catalog={catalog}
          companyInfo={companyInfo}
          onOpenLogin={() => {
            if (currentUser) {
              setIsPublicCatalogView(false);
            } else {
              // Limpar da url e abrir login
              window.history.pushState({}, '', window.location.pathname);
              setIsPublicCatalogView(false);
            }
          }}
        />

        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-[9999] bg-slate-900 text-amber-400 px-4 py-3 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 border border-amber-500/50 animate-fade-in">
            <span>✨</span>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // Bloqueio de Segurança / Rota de Login: se o usuário não estiver autenticado, exibir a LoginPage com opção de ver o catálogo público
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans selection:bg-amber-500 selection:text-slate-950">
        <LoginPage
          onSuccessLogin={handleSuccessLogin}
          onOpenPublicCatalog={() => setIsPublicCatalogView(true)}
        />
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
        onOpenPublicCatalog={() => setIsPublicCatalogView(true)}
        onOpenSmartIA={() => setIsSmartIAOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
      />

      {/* Conteúdo Principal com Recuo Adaptativo para a Sidebar */}
      <div className={`flex-1 flex flex-col min-w-0 w-full transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        
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
          onOpenPublicCatalog={() => setIsPublicCatalogView(true)}
          onOpenSmartIA={() => setIsSmartIAOpen(true)}
          onOpenHelp={() => setIsHelpModalOpen(true)}
          onOpenTour={() => setIsTourOpen(true)}
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
              users={usersList}
              currentUser={currentUser}
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

          {/* ABA MÓDULO: RELATÓRIOS DE VENDAS & GESTÃO */}
          {activeTab === 'reports' && (
            <ReportsModule
              sales={sales}
              quotes={quotes}
              companyInfo={companyInfo}
              users={usersList}
              currentUser={currentUser}
              onViewSale={(s) => setViewingSale(s)}
              onViewQuote={(q) => setViewingQuote(q)}
            />
          )}

          {/* ABA DE ACOMPANHAMENTO OPERACIONAL (OBRAS & TAREFAS) */}
          {activeTab === 'operations' && (
            <OperationsModule
              onOpenReceivablesTab={() => setActiveTab('receivables')}
              onRefresh={refreshData}
            />
          )}

          {/* ABA MÓDULO: CÁLCULO DE MEDIDAS DE CORTE */}
          {activeTab === 'cut_calculator' && (
            <CutCalculatorModule
              currentUser={currentUser}
              companyInfo={companyInfo}
              onSendToQuote={handleSendCutCalculationToQuote}
              onShowToast={showToast}
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
              currentUser={currentUser}
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
              currentUser={currentUser}
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
              companyInfo={companyInfo}
              onSaveItem={handleSaveCatalogItem}
              onDeleteItem={handleDeleteCatalogItem}
              onOpenPublicCatalog={() => setIsPublicCatalogView(true)}
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
            currentUser={currentUser}
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

        {/* MODAL DO TOUR GUIADO PELO SISTEMA */}
        <SystemTourModal
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
          companyInfo={companyInfo}
          onNavigateToTab={(tab) => setActiveTab(tab)}
          onOpenSmartIA={() => setIsSmartIAOpen(true)}
        />

        {/* GAVETA LATERAL / WIDGET DO CHAT SMART IA */}
        <SmartIAChatDrawer
          isOpen={isSmartIAOpen}
          onClose={() => setIsSmartIAOpen(false)}
          currentUser={currentUser}
          companyInfo={companyInfo}
          onNavigateToTab={(tab) => setActiveTab(tab)}
          onShowToast={showToast}
        />

        {/* MODAL DA CENTRAL DE AJUDA & DÚVIDAS */}
        <HelpSupportModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
          companyInfo={companyInfo}
          onStartTour={() => setIsTourOpen(true)}
          onOpenSmartIA={() => setIsSmartIAOpen(true)}
        />

        {/* BOTÃO FLUTUANTE DE DÚVIDAS & SMART IA (Canto Inferior Direito) */}
        <div className="fixed bottom-4 left-4 sm:left-auto sm:right-5 z-40 flex items-center gap-2 print:hidden">
          <button
            onClick={() => setIsSmartIAOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black px-3.5 py-2.5 rounded-2xl shadow-xl shadow-amber-500/25 border border-amber-300 transition-all hover:scale-105 active:scale-95 text-xs group"
            title="Dúvidas? Pergunte ao Smart IA (Grátis)"
          >
            <div className="relative">
              <Bot className="w-4 h-4 text-slate-950 group-hover:animate-spin" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-600 rounded-full animate-ping" />
            </div>
            <span className="hidden sm:inline">Dúvidas? Smart IA</span>
            <span className="sm:hidden">Smart IA</span>
          </button>
        </div>

        {/* Rodapé do Sistema */}
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 print:hidden mt-auto">
          <p>Smart Vidros — Módulo ERP de Orçamentos, Vendas, PDV, Contratos, Contas a Receber e Recibos © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}
