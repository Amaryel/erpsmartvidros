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
  UserCheck,
  BarChart3,
  Bot,
  HelpCircle,
  Sparkles,
  Play,
  Share2,
  Scissors,
  Download
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
  onOpenSmartIA?: () => void;
  onOpenHelp?: () => void;
  onOpenTour?: () => void;
  onOpenPwaInstall?: () => void;
  onLogout: () => void;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string; icon: React.ElementType }> = {
  dashboard: { title: 'Painel Geral', subtitle: 'Visão em Tempo Real', icon: LayoutDashboard },
  operations: { title: 'Obras & Operações', subtitle: 'Acompanhamento de Serviços', icon: Briefcase },
  cut_calculator: { title: 'Medidas de Corte', subtitle: 'Calculadora de Vidros & Esquadrias', icon: Scissors },
  quotes: { title: 'Orçamentos', subtitle: 'Propostas Comerciais', icon: FileText },
  new_quote: { title: 'Novo Orçamento', subtitle: 'Cálculo de Vidros & Esquadrias', icon: PlusCircle },
  sales: { title: 'Vendas & PDV', subtitle: 'Pedidos e Balcão', icon: ShoppingBag },
  cash: { title: 'Caixa Diário', subtitle: 'Movimentações & Lançamento por Áudio', icon: Wallet },
  contracts: { title: 'Contratos Jurídicos', subtitle: 'Assinatura Digital & Termos', icon: Scroll },
  receivables: { title: 'Contas a Receber', subtitle: 'Gestão de Recebimentos', icon: ShieldCheck },
  receipts: { title: 'Recibos de Pagamento', subtitle: 'Comprovantes Oficiais A4', icon: ReceiptText },
  new_receipt: { title: 'Novo Recibo', subtitle: 'Emissão de Pagamento', icon: ReceiptText },
  clients: { title: 'Clientes', subtitle: 'Base de Contatos & Obras', icon: Users },
  products: { title: 'Produtos & Vidros', subtitle: 'Catálogo de Itens', icon: Package },
  services: { title: 'Serviços & Mão de Obra', subtitle: 'Tabela de Serviços', icon: Wrench },
  catalog: { title: 'Catálogo Geral', subtitle: 'Produtos e Serviços', icon: Package },
  company: { title: 'Dados da Empresa', subtitle: 'Configurações do Estabelecimento', icon: Building2 },
  superadmin: { title: 'Super Admin', subtitle: 'Gestão de Usuários & Licenças', icon: ShieldCheck },
  reports: { title: 'Relatórios de Vendas', subtitle: 'Desempenho & Estatísticas', icon: BarChart3 },
};

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
  onOpenSmartIA,
  onOpenHelp,
  onOpenTour,
  onOpenPwaInstall,
  onLogout,
}) => {
  const isSuper =
    currentUser?.role === 'superadmin' ||
    (currentUser?.email && currentUser.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase());

  const perms = getUserPermissions(currentUser);
  const hasAccess = (modId: SystemModuleId) => hasModuleAccess(currentUser, modId);

  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
  const helpDropdownRef = useRef<HTMLDivElement>(null);

  const currentTabMeta = TAB_TITLES[activeTab] || {
    title: 'Smart Vidros',
    subtitle: 'ERP de Gestão',
    icon: LayoutDashboard,
  };
  const TabIcon = currentTabMeta.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (helpDropdownRef.current && !helpDropdownRef.current.contains(event.target as Node)) {
        setIsHelpDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-zinc-950 text-white border-b border-amber-500/20 sticky top-0 z-30 shadow-xl print:hidden w-full select-none">
      <div className="w-full px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
          
          {/* LADO ESQUERDO: Botão Mobile + Identificador do Módulo / Página Atual */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* Botão Menu Lateral Mobile/Tablet */}
            <button
              onClick={onToggleSidebarMobile}
              className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors lg:hidden active:scale-95 shrink-0 border border-zinc-800"
              title="Abrir Menu Lateral"
            >
              <Menu className="w-5 h-5 text-amber-400" />
            </button>

            {/* Logo no Mobile */}
            <div className="lg:hidden shrink-0">
              <SmartVidrosLogo
                companyInfo={companyInfo}
                size="sm"
                variant="dark"
                showSubtitle={false}
                onClick={() => setActiveTab('dashboard')}
              />
            </div>

            {/* Breadcrumb / Título do Módulo Ativo no Desktop & Tablet */}
            <div className="hidden sm:flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <TabIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                    Smart Vidros
                  </span>
                  <span className="text-zinc-600 text-xs">/</span>
                  <h1 className="text-xs sm:text-sm font-extrabold text-white truncate">
                    {currentTabMeta.title}
                  </h1>
                </div>
                <p className="text-[10px] text-zinc-400 truncate hidden md:block">
                  {currentTabMeta.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* LADO DIREITO: Ações Rápidas, IA, Dúvidas, PDV e Perfil */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* 📱 BOTÃO INSTALAR APLICATIVO (PWA) */}
            {onOpenPwaInstall && (
              <button
                onClick={onOpenPwaInstall}
                className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-amber-300 hover:text-amber-200 border border-amber-500/30 font-bold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs transition-all shadow-sm active:scale-95 group"
                title="Instalar Aplicativo (PWA) no Celular/Tablet"
              >
                <Download className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="hidden lg:inline">Instalar App</span>
                <span className="lg:hidden">App</span>
              </button>
            )}

            {/* 🤖 BOTÃO DESTAQUE: SMART IA */}
            {onOpenSmartIA && (
              <button
                onClick={onOpenSmartIA}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 text-amber-300 border border-amber-500/40 font-black px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs transition-all shadow-sm active:scale-95 group"
                title="Abrir Assistente Smart IA (Grátis)"
              >
                <div className="w-4 h-4 rounded-md bg-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bot className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                </div>
                <span className="font-extrabold">Smart IA</span>
                <span className="hidden xl:inline text-[9px] px-1.5 py-0.2 bg-amber-500/30 text-amber-300 rounded font-black">
                  Grátis
                </span>
              </button>
            )}

            {/* ❓ MENU DE DÚVIDAS & TOUR */}
            <div className="relative" ref={helpDropdownRef}>
              <button
                onClick={() => setIsHelpDropdownOpen(!isHelpDropdownOpen)}
                className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-bold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs transition-all active:scale-95"
                title="Dúvidas do Sistema & Tour"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">Dúvidas</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isHelpDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isHelpDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-800 mb-1">
                    Ajuda & Suporte
                  </div>

                  {onOpenSmartIA && (
                    <button
                      onClick={() => {
                        setIsHelpDropdownOpen(false);
                        onOpenSmartIA();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-300 hover:bg-amber-500/10 transition-colors text-left"
                    >
                      <Bot className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="font-extrabold">Smart IA (Chat 24h)</p>
                        <p className="text-[10px] text-zinc-400">Tire dúvidas técnicas na hora</p>
                      </div>
                    </button>
                  )}

                  {onOpenTour && (
                    <button
                      onClick={() => {
                        setIsHelpDropdownOpen(false);
                        onOpenTour();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-zinc-200 hover:bg-zinc-800 transition-colors text-left"
                    >
                      <Play className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="font-extrabold">Tour pelo Sistema</p>
                        <p className="text-[10px] text-zinc-400">Aprenda o passo a passo</p>
                      </div>
                    </button>
                  )}

                  {onOpenHelp && (
                    <button
                      onClick={() => {
                        setIsHelpDropdownOpen(false);
                        onOpenHelp();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-zinc-200 hover:bg-zinc-800 transition-colors text-left"
                    >
                      <HelpCircle className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="font-extrabold">Perguntas Frequentes (FAQ)</p>
                        <p className="text-[10px] text-zinc-400">Guia de cálculos e funções</p>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Botão Novo Orçamento */}
            {hasAccess('quotes') && (
              <button
                onClick={onNewQuoteClick}
                className="hidden lg:flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/30 hover:border-amber-400 font-extrabold px-3 py-2 rounded-xl transition-all text-xs whitespace-nowrap active:scale-95"
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
                className="hidden sm:flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/30 font-bold px-2.5 py-1.5 sm:py-2 rounded-xl text-xs transition-all whitespace-nowrap active:scale-95"
                title="Sincronizar Banco Supabase"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xl:inline">Supabase</span>
              </button>
            )}

            {/* Botão PDV */}
            {hasAccess('sales') && (
              <button
                onClick={onOpenPdvClick}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl shadow-lg active:scale-95 transition-all text-xs whitespace-nowrap"
                title="Abrir Ponto de Venda"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>+ PDV</span>
              </button>
            )}

            {/* Perfil & Logout */}
            {currentUser ? (
              <div className="flex items-center gap-1 sm:gap-1.5 pl-1.5 sm:pl-2 border-l border-zinc-800 shrink-0">
                <button
                  onClick={onOpenProfileModal || onOpenAuthModal}
                  className="flex items-center gap-2 text-left bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 px-2 sm:px-2.5 py-1.5 rounded-xl transition-all group max-w-[140px] sm:max-w-[180px] shrink-0"
                  title="Configurar Meu Perfil"
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
                    </div>
                  </div>
                </button>

                <button
                  onClick={onLogout}
                  className="p-1.5 sm:p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-xl transition-colors flex items-center justify-center active:scale-95 shrink-0"
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
