import React from 'react';
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
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Scroll,
  DollarSign,
  X,
  Briefcase,
  Layers,
  Wallet,
  UserCheck,
  BarChart3,
  Bot,
  HelpCircle,
  Sparkles,
  Scissors,
  Download,
  BadgeDollarSign,
  Store,
} from 'lucide-react';
import { SmartVidrosLogo } from './SmartVidrosLogo';
import { AppUser, CompanyInfo, SystemModuleId } from '../types';
import { hasModuleAccess } from '../utils/permissions';

export type ActiveTab =
  | 'dashboard'
  | 'operations'
  | 'cut_calculator'
  | 'quotes'
  | 'new_quote'
  | 'sales'
  | 'cash'
  | 'contracts'
  | 'receivables'
  | 'receipts'
  | 'new_receipt'
  | 'payslips'
  | 'new_payslip'
  | 'clients'
  | 'products'
  | 'services'
  | 'catalog'
  | 'company'
  | 'superadmin'
  | 'reports';

interface MenuItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string | null;
  badgeColor?: string;
}

interface MenuGroup {
  groupTitle?: string;
  items: MenuItem[];
}

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  quotesCount: number;
  salesCount: number;
  contractsCount?: number;
  receivablesCount: number;
  receiptsCount: number;
  payslipsCount?: number;
  pendingUsersCount?: number;
  currentUser?: AppUser | null;
  companyInfo: CompanyInfo;
  onNewQuoteClick: () => void;
  onOpenPdvClick: () => void;
  onOpenPublicCatalog?: () => void;
  onOpenTour?: () => void;
  onOpenPwaInstall?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  quotesCount,
  salesCount,
  contractsCount = 0,
  receivablesCount,
  receiptsCount,
  payslipsCount = 0,
  pendingUsersCount = 0,
  currentUser,
  companyInfo,
  onNewQuoteClick,
  onOpenPdvClick,
  onOpenPublicCatalog,
  onOpenTour,
  onOpenPwaInstall,
}) => {
  const isSuper =
    currentUser?.role === 'superadmin';

  const canManageUsers =
    isSuper ||
    currentUser?.role === 'admin' ||
    currentUser?.permissions?.canManageUsers === true;

  const rawMenuGroups: MenuGroup[] = [
    {
      groupTitle: 'Visão Geral',
      items: [
        {
          id: 'dashboard',
          label: 'Início',
          icon: LayoutDashboard,
        },
        {
          id: 'operations',
          label: 'Obras & Operações',
          icon: Briefcase,
        },
      ],
    },
    {
      groupTitle: 'Comercial & Vendas',
      items: [
        {
          id: 'quotes',
          label: 'Orçamentos',
          icon: FileText,
          badge: quotesCount > 0 ? quotesCount : null,
          badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        },
        {
          id: 'sales',
          label: 'Vendas / PDV',
          icon: ShoppingBag,
          badge: salesCount > 0 ? salesCount : null,
          badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        },
        {
          id: 'contracts',
          label: 'Contratos',
          icon: Scroll,
          badge: contractsCount > 0 ? contractsCount : null,
          badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        },
        {
          id: 'clients',
          label: 'Clientes',
          icon: Users,
        },
      ],
    },
    {
      groupTitle: 'Financeiro & Gestão',
      items: [
        {
          id: 'reports',
          label: 'Relatórios de Vendas',
          icon: BarChart3,
        },
        {
          id: 'cash',
          label: 'Caixa Diário',
          icon: Wallet,
        },
        {
          id: 'receivables',
          label: 'Contas a Receber',
          icon: ShieldCheck,
          badge: receivablesCount > 0 ? receivablesCount : null,
          badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        },
        {
          id: 'receipts',
          label: 'Recibos',
          icon: ReceiptText,
          badge: receiptsCount > 0 ? receiptsCount : null,
          badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        },
        {
          id: 'payslips',
          label: 'Contracheques',
          icon: BadgeDollarSign,
          badge: payslipsCount > 0 ? payslipsCount : null,
          badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        },
      ],
    },
    {
      groupTitle: 'Catálogo & Serviços',
      items: [
        {
          id: 'products',
          label: 'Produtos & Vidros',
          icon: Package,
        },
        {
          id: 'services',
          label: 'Serviços & Mão de Obra',
          icon: Wrench,
        },
      ],
    },
    {
      groupTitle: 'Sistema & Equipe',
      items: [
        {
          id: 'company',
          label: 'Dados da Empresa',
          icon: Building2,
        },
        ...(canManageUsers
          ? [
              {
                id: 'superadmin' as ActiveTab,
                label: isSuper ? 'Painel Super Admin' : 'Gestão de Usuários',
                icon: isSuper ? ShieldCheck : UserCheck,
                badge: pendingUsersCount > 0 ? pendingUsersCount : null,
                badgeColor: 'bg-amber-500 text-slate-950 border-amber-400',
              },
            ]
          : []),
      ],
    },
  ];

  // Filtra itens de acordo com as permissões do usuário logado
  const menuGroups: MenuGroup[] = rawMenuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasModuleAccess(currentUser, item.id as SystemModuleId)),
    }))
    .filter((group) => group.items.length > 0);

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Overlay Escuro para Mobile e Tablet */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Container Principal do Menu Lateral (Sidebar) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-zinc-950 border-r border-zinc-800 text-white flex flex-col transition-all duration-300 print:hidden pt-safe pb-safe ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Topo do Menu: Logo Smart Vidros Centralizada */}
        <div className="h-20 px-4 flex items-center justify-center border-b border-zinc-800/80 shrink-0 relative">
          {!isCollapsed ? (
            <div className="w-full flex items-center justify-center">
              <SmartVidrosLogo
                companyInfo={companyInfo}
                size="md"
                variant="dark"
                showSubtitle={false}
                onClick={() => handleSelectTab('dashboard')}
                className="justify-center mx-auto"
              />
            </div>
          ) : (
            <div
              onClick={() => handleSelectTab('dashboard')}
              className="mx-auto cursor-pointer p-1 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors flex items-center justify-center"
              title="Smart Vidros — Início"
            >
              <SmartVidrosLogo companyInfo={companyInfo} size="sm" showSubtitle={false} className="justify-center" />
            </div>
          )}

          {/* Botão de Fechar no Mobile (posicionado de forma absoluta para não desalinhá-la) */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl lg:hidden transition-colors"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Botão de Ação Rápida: Abrir PDV / Novo Orçamento */}
        <div className="p-3 shrink-0 space-y-1.5">
          <button
            onClick={() => {
              onOpenPdvClick();
              setIsMobileOpen(false);
            }}
            className={`w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isCollapsed ? 'p-3' : 'px-4 h-10 text-sm'
            }`}
            title="Abrir Ponto de Venda (PDV)"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Abrir PDV</span>}
          </button>

          {!isCollapsed && (
            <button
              onClick={() => {
                onNewQuoteClick();
                setIsMobileOpen(false);
              }}
              className="w-full hover:bg-zinc-900 text-zinc-200 border border-zinc-700 hover:border-zinc-600 font-medium rounded-lg transition-colors px-3 h-10 text-sm flex items-center justify-center gap-1.5"
              title="Criar Novo Orçamento"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Novo orçamento</span>
            </button>
          )}
        </div>

        {/* Lista de Navegação por Grupos Organizados */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed && group.groupTitle && (
                <div className="px-3 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  {group.groupTitle}
                </div>
              )}

              {isCollapsed && groupIdx > 0 && (
                <div className="border-t border-zinc-800/80 my-2" />
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activeTab === item.id ||
                    (item.id === 'quotes' && activeTab === 'new_quote') ||
                    (item.id === 'receipts' && activeTab === 'new_receipt') ||
                    (item.id === 'payslips' && activeTab === 'new_payslip') ||
                    (item.id === 'products' && activeTab === 'catalog') ||
                    (item.id === 'services' && activeTab === 'catalog');

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                        isActive
                          ? 'bg-zinc-800 text-white'
                          : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`}
                      title={item.label}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                      
                      {!isCollapsed && (
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      )}

                      {!isCollapsed && item.badge !== null && item.badge !== undefined && (
                        <span
                          className={`text-[11px] px-1.5 py-0.5 rounded-md font-medium border tabular-nums ${
                            isActive
                              ? 'bg-zinc-700 text-zinc-100 border-zinc-600'
                              : item.badgeColor || 'bg-zinc-800 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Acesso Rápido ao Tour */}
        <div className="p-2.5 border-t border-zinc-800/80 shrink-0 space-y-1.5">
          {onOpenTour && (
            <button
              onClick={onOpenTour}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center p-2.5' : 'gap-2 px-3 py-1.5'
              } rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 text-sm font-medium transition-colors`}
              title="Iniciar Tour pelo Sistema"
            >
              <HelpCircle className="w-4 h-4 text-zinc-500 shrink-0" />
              {!isCollapsed && <span className="truncate">Ajuda e tour</span>}
            </button>
          )}

          {onOpenPwaInstall && (
            <button
              onClick={onOpenPwaInstall}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center p-2.5' : 'gap-2 px-3 py-1.5'
              } rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 text-sm font-medium transition-colors`}
              title="Instalar Aplicativo (PWA) no Celular/Tablet"
            >
              <Download className="w-4 h-4 text-zinc-500 shrink-0" />
              {!isCollapsed && <span className="truncate">Instalar aplicativo</span>}
            </button>
          )}

          {onOpenPublicCatalog && (
            <button
              onClick={onOpenPublicCatalog}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center p-2.5' : 'gap-2 px-3 py-1.5'
              } rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 text-sm font-medium transition-colors`}
              title="Abrir Vitrine Pública (Link do Cliente)"
            >
              <Store className="w-4 h-4 text-zinc-500 shrink-0" />
              {!isCollapsed && <span className="truncate">Vitrine do cliente</span>}
            </button>
          )}
        </div>

        {/* Rodapé da Sidebar: Recolher / Expandir no Tablet/Desktop */}
        <div className="p-3 border-t border-zinc-800/80 shrink-0 hidden lg:block">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 text-sm font-medium transition-colors"
            title={isCollapsed ? 'Expandir Menu Lateral' : 'Recolher Menu Lateral'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-amber-400" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 text-amber-400" />
                <span>Recolher menu</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
