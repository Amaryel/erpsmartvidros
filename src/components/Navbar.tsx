import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  ShieldCheck,
  ReceiptText,
  Users,
  Package,
  Wrench,
  Building2,
  Menu,
  LogOut,
  Lock,
  Database,
  Scroll,
  Briefcase,
  Wallet,
  ChevronDown,
  PlusCircle,
  UserCheck
} from 'lucide-react';
import { AppUser, CompanyInfo, SystemModuleId } from '../types';
import { SmartVidrosLogo } from './SmartVidrosLogo';
import { ActiveTab } from './Sidebar';
import { hasModuleAccess, getUserPermissions, SUPERADMIN_EMAIL } from '../utils/permissions';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  quotesCount: number;
  salesCount: number;
  contractsCount?: number;
  receivablesCount: number;
  receiptsCount: number;
  currentUser?: AppUser | null;
  companyInfo: CompanyInfo;
  onNewQuoteClick: () => void;
  onNewReceiptClick: () => void;
  onOpenPdvClick: () => void;
  onToggleSidebarMobile: () => void;
  onOpenAuthModal: () => void;
  onOpenProfileModal?: () => void;
  onOpenSupabaseSyncModal?: () => void;
  onOpenPublicCatalog?: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  quotesCount,
  salesCount,
  contractsCount = 0,
  receivablesCount,
  receiptsCount,
  currentUser,
  companyInfo,
  onNewQuoteClick,
  onOpenPdvClick,
  onToggleSidebarMobile,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenSupabaseSyncModal,
  onOpenPublicCatalog,
  onLogout,
}) => {
  const isSuper =
    currentUser?.role === 'superadmin' ||
    (currentUser?.email && currentUser.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase());

  const canManageUsers =
    isSuper ||
    currentUser?.role === 'admin' ||
    currentUser?.permissions?.canManageUsers === true;

  const perms = getUserPermissions(currentUser);
  const hasAccess = (modId: SystemModuleId) => hasModuleAccess(currentUser, modId);

  const [openDropdown, setOpenDropdown] = useState<'comercial' | 'financeiro' | 'catalogo' | 'sistema' | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isComercialActive = ['quotes', 'new_quote', 'sales', 'contracts', 'clients'].includes(activeTab);
  const isFinanceiroActive = ['cash', 'receivables', 'receipts', 'new_receipt'].includes(activeTab);
  const isCatalogoActive = ['products', 'services', 'catalog'].includes(activeTab);
  const isSistemaActive = ['company', 'superadmin'].includes(activeTab);

  const comercialTotalBadges = quotesCount + salesCount + contractsCount;
  const financeiroTotalBadges = receivablesCount + receiptsCount;

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setOpenDropdown(null);
  };

  return (
    <header className="bg-zinc-950 text-white border-b border-amber-500/30 sticky top-0 z-30 shadow-xl print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-2 sm:gap-4">
          
          {/* Lado Esquerdo: Botão Menu Mobile/Tablet + Logo Smart Vidros */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onToggleSidebarMobile}
              className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors lg:hidden active:scale-95"
              title="Abrir Menu Lateral"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </button>

            {/* Logo/Nome Smart Vidros */}
            <SmartVidrosLogo
              companyInfo={companyInfo}
              size="md"
              variant="dark"
              showSubtitle={false}
              onClick={() => setActiveTab('dashboard')}
            />
          </div>

          {/* Navegação Central Organizada por Módulos (Estilo Sidebar) */}
          <nav ref={navRef} className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            
            {/* Início */}
            <button
              onClick={() => handleSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Início</span>
            </button>

            {/* Obras & Operações */}
            <button
              onClick={() => handleSelectTab('operations')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'operations'
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Obras</span>
            </button>

            {/* Dropdown: Comercial & Vendas */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'comercial' ? null : 'comercial')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isComercialActive
                    ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Comercial</span>
                {comercialTotalBadges > 0 && !isComercialActive && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {comercialTotalBadges}
                  </span>
                )}
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openDropdown === 'comercial' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'comercial' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-zinc-900 border border-amber-500/30 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-500 border-b border-zinc-800 mb-1">
                    Comercial & Vendas
                  </div>
                  
                  <button
                    onClick={() => handleSelectTab('quotes')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'quotes' || activeTab === 'new_quote'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>Orçamentos</span>
                    </div>
                    {quotesCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {quotesCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleSelectTab('sales')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'sales'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-amber-400" />
                      <span>Vendas / PDV</span>
                    </div>
                    {salesCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {salesCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleSelectTab('contracts')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'contracts'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Scroll className="w-4 h-4 text-indigo-400" />
                      <span>Contratos</span>
                    </div>
                    {contractsCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {contractsCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleSelectTab('clients')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'clients'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>Clientes</span>
                  </button>
                </div>
              )}
            </div>

            {/* Dropdown: Financeiro */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'financeiro' ? null : 'financeiro')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isFinanceiroActive
                    ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Financeiro</span>
                {financeiroTotalBadges > 0 && !isFinanceiroActive && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {financeiroTotalBadges}
                  </span>
                )}
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openDropdown === 'financeiro' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'financeiro' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-zinc-900 border border-amber-500/30 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-500 border-b border-zinc-800 mb-1">
                    Financeiro & Caixa
                  </div>

                  <button
                    onClick={() => handleSelectTab('cash')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'cash'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>Caixa Diário</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('receivables')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'receivables'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-rose-400" />
                      <span>Contas a Receber</span>
                    </div>
                    {receivablesCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {receivablesCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleSelectTab('receipts')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'receipts' || activeTab === 'new_receipt'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ReceiptText className="w-4 h-4 text-emerald-400" />
                      <span>Recibos</span>
                    </div>
                    {receiptsCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {receiptsCount}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Dropdown: Catálogo & Serviços */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'catalogo' ? null : 'catalogo')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isCatalogoActive
                    ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Catálogo</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openDropdown === 'catalogo' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'catalogo' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-zinc-900 border border-amber-500/30 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-500 border-b border-zinc-800 mb-1">
                    Catálogo & Serviços
                  </div>

                  <button
                    onClick={() => handleSelectTab('products')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'products' || activeTab === 'catalog'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <Package className="w-4 h-4 text-amber-400" />
                    <span>Produtos & Vidros</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('services')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'services'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <Wrench className="w-4 h-4 text-slate-400" />
                    <span>Serviços & Mão de Obra</span>
                  </button>

                  {onOpenPublicCatalog && (
                    <div className="pt-1 mt-1 border-t border-zinc-800">
                      <button
                        onClick={() => {
                          setOpenDropdown(null);
                          onOpenPublicCatalog();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      >
                        <span className="text-amber-400">✨</span>
                        <span>Vitrine Pública (Cliente)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Painel Super Admin / Gestão de Usuários / Empresa */}
            {canManageUsers ? (
              <button
                onClick={() => handleSelectTab('superadmin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'superadmin'
                    ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                    : 'text-amber-400 hover:text-amber-300 hover:bg-zinc-900'
                }`}
              >
                {isSuper ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                <span>{isSuper ? 'Super Admin' : 'Gestão Usuários'}</span>
              </button>
            ) : hasAccess('company') ? (
              <button
                onClick={() => handleSelectTab('company')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'company'
                    ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Empresa</span>
              </button>
            ) : null}
          </nav>

          {/* Lado Direito: Ações Rápidas + Sincronização + Perfil */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Botão Novo Orçamento */}
            {hasAccess('quotes') && (
              <button
                onClick={onNewQuoteClick}
                className="hidden sm:flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/30 hover:border-amber-400 font-extrabold px-3 py-2 rounded-xl transition-all text-xs whitespace-nowrap active:scale-95"
                title="Criar Novo Orçamento"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Orçamento</span>
              </button>
            )}

            {/* Botão Supabase (Exclusivo SuperAdmin) */}
            {isSuper && onOpenSupabaseSyncModal && (
              <button
                onClick={onOpenSupabaseSyncModal}
                className="flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/30 font-bold px-2.5 sm:px-3 py-2 rounded-xl text-xs transition-all whitespace-nowrap active:scale-95"
                title="Sincronizar Banco Supabase (Super Admin)"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Supabase</span>
              </button>
            )}

            {/* Botão PDV */}
            {hasAccess('sales') && (
              <button
                onClick={onOpenPdvClick}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 sm:px-3.5 py-2 rounded-xl shadow-lg active:scale-95 transition-all text-xs whitespace-nowrap"
                title="Abrir Ponto de Venda"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>+ PDV</span>
              </button>
            )}

            {/* Perfil & Logout */}
            {currentUser ? (
              <div className="flex items-center gap-1 sm:gap-1.5 pl-1.5 sm:pl-2 border-l border-zinc-800">
                <button
                  onClick={onOpenProfileModal || onOpenAuthModal}
                  className="flex items-center gap-2 text-left bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 px-2 sm:px-2.5 py-1.5 rounded-xl transition-all group max-w-[150px] sm:max-w-[200px]"
                  title="Configurar Meu Perfil & Alterar Senha"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xs group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors shrink-0">
                    {currentUser.username ? currentUser.username[0].toUpperCase() : currentUser.name[0]}
                  </div>
                  <div className="hidden sm:block min-w-0">
                    <p className="text-[11px] font-bold text-white leading-tight truncate flex items-center gap-1">
                      <span>{currentUser.name.split(' ')[0]}</span>
                      {isSuper ? (
                        <span className="text-[9px] text-amber-400">👑</span>
                      ) : currentUser.role === 'admin' ? (
                        <span className="text-[9px] text-indigo-400">👔</span>
                      ) : (
                        <span className="text-[9px] text-emerald-400">💼</span>
                      )}
                    </p>
                    <div className="flex items-center gap-1 text-[9px] text-amber-400/90 font-mono truncate">
                      <span>@{currentUser.username || 'user'}</span>
                      {currentUser.role === 'vendedor' && perms.maxDiscountPercent > 0 && (
                        <span className="text-zinc-400 font-sans">({perms.maxDiscountPercent}%)</span>
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={onLogout}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-xl transition-colors flex items-center justify-center active:scale-95"
                  title="Sair do Sistema"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-amber-500/30 font-bold px-3 py-2 rounded-xl text-xs transition-all whitespace-nowrap"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};


