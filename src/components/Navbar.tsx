import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
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
  Download,
  BadgeDollarSign,
} from 'lucide-react';
import { AppUser, CompanyInfo, SystemModuleId } from '../types';
import { SmartVidrosLogo } from './SmartVidrosLogo';
import { ActiveTab } from './Sidebar';
import { hasModuleAccess, getUserPermissions } from '../utils/permissions';

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
  onNewReceiptClick?: () => void;
  onOpenPdvClick: () => void;
  onToggleSidebarMobile: () => void;
  /** Celular/tablet: mostra a seta de voltar no lugar do botão de menu. */
  onBack?: () => void;
  onOpenAuthModal: () => void;
  onOpenProfileModal?: () => void;
  onOpenSupabaseSyncModal?: () => void;
  onOpenPublicCatalog?: () => void;
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
  payslips: { title: 'Contracheques', subtitle: 'Folha de Pagamento & Holerites', icon: BadgeDollarSign },
  new_payslip: { title: 'Novo Contracheque', subtitle: 'Emissão de Pagamento a Funcionário', icon: BadgeDollarSign },
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
  onBack,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenSupabaseSyncModal,
  onOpenPublicCatalog,
  onOpenHelp,
  onOpenTour,
  onOpenPwaInstall,
  onLogout,
}) => {
  const isSuper =
    currentUser?.role === 'superadmin';

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

  const roleLabel =
    currentUser?.role === 'superadmin'
      ? 'Super admin'
      : currentUser?.role === 'admin'
      ? 'Administrador'
      : currentUser?.role === 'vendedor'
      ? 'Vendedor'
      : 'Colaborador';

  const iconButton =
    'inline-flex items-center justify-center h-9 w-9 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500';

  return (
    <header className="bg-zinc-950 text-white border-b border-zinc-800 sticky top-0 z-30 print:hidden w-full select-none pt-safe">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 lg:h-16 gap-2">
          {/* Esquerda: menu (mobile/tablet) + título da página */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className={`${iconButton} lg:hidden -ml-1`}
                title="Voltar"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onToggleSidebarMobile}
                className={`${iconButton} lg:hidden -ml-1`}
                title="Abrir menu"
                aria-label="Abrir menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="lg:hidden shrink-0 flex items-center h-10">
              <SmartVidrosLogo
                companyInfo={companyInfo}
                size="md"
                variant="dark"
                showSubtitle={false}
                onClick={() => setActiveTab('dashboard')}
              />
            </div>

            <div className="hidden lg:flex items-center gap-2.5 min-w-0">
              <TabIcon className="w-4 h-4 text-zinc-500 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-white truncate">{currentTabMeta.title}</h1>
                <p className="text-xs text-zinc-400 truncate">{currentTabMeta.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Direita: ações */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {onOpenPwaInstall && (
              <button
                type="button"
                onClick={onOpenPwaInstall}
                className={`${iconButton} hidden md:inline-flex`}
                title="Instalar o aplicativo neste aparelho"
                aria-label="Instalar o aplicativo"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            <div className="relative hidden md:block" ref={helpDropdownRef}>
              <button
                type="button"
                onClick={() => setIsHelpDropdownOpen(!isHelpDropdownOpen)}
                className={iconButton}
                title="Ajuda"
                aria-label="Ajuda"
                aria-expanded={isHelpDropdownOpen}
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {isHelpDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white text-slate-900 border border-slate-200 rounded-xl p-1.5 shadow-lg z-50">
                  {onOpenTour && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsHelpDropdownOpen(false);
                        onOpenTour();
                      }}
                      className="w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-slate-50 transition-colors"
                    >
                      <Play className="w-4 h-4 mt-0.5 text-slate-500" />
                      <span>
                        <span className="block text-sm font-medium">Tour pelo sistema</span>
                        <span className="block text-xs text-slate-500">Passo a passo dos módulos</span>
                      </span>
                    </button>
                  )}
                  {onOpenHelp && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsHelpDropdownOpen(false);
                        onOpenHelp();
                      }}
                      className="w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-slate-50 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 mt-0.5 text-slate-500" />
                      <span>
                        <span className="block text-sm font-medium">Central de ajuda</span>
                        <span className="block text-xs text-slate-500">Perguntas frequentes e suporte</span>
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {isSuper && onOpenSupabaseSyncModal && (
              <button
                type="button"
                onClick={onOpenSupabaseSyncModal}
                className={`${iconButton} hidden sm:inline-flex`}
                title="Banco de dados e sincronização"
                aria-label="Banco de dados e sincronização"
              >
                <Database className="w-4 h-4" />
              </button>
            )}

            {hasAccess('sales') && (
              <button
                type="button"
                onClick={onOpenPdvClick}
                className="hidden lg:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition-colors whitespace-nowrap"
                title="Abrir ponto de venda"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>PDV</span>
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-1 pl-1.5 sm:pl-2 ml-0.5 border-l border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={onOpenProfileModal || onOpenAuthModal}
                  className="flex items-center gap-2 text-left rounded-lg p-1 sm:pr-2.5 hover:bg-zinc-800 transition-colors max-w-[180px]"
                  title="Meu perfil"
                  aria-label="Meu perfil"
                >
                  <span className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-100 flex items-center justify-center text-xs font-semibold shrink-0">
                    {(currentUser.name || currentUser.username || '?').trim()[0]?.toUpperCase()}
                  </span>
                  <span className="hidden sm:block min-w-0">
                    <span className="block text-xs font-medium text-white leading-tight truncate">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <span className="block text-[11px] text-zinc-400 leading-tight truncate">{roleLabel}</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className={`${iconButton} hover:text-red-300`}
                  title="Sair"
                  aria-label="Sair do sistema"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-zinc-700 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
