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
  UserCheck
} from 'lucide-react';
import { SmartVidrosLogo } from './SmartVidrosLogo';
import { AppUser, CompanyInfo, SystemModuleId } from '../types';
import { hasModuleAccess, SUPERADMIN_EMAIL } from '../utils/permissions';

export type ActiveTab =
  | 'dashboard'
  | 'operations'
  | 'quotes'
  | 'new_quote'
  | 'sales'
  | 'cash'
  | 'contracts'
  | 'receivables'
  | 'receipts'
  | 'new_receipt'
  | 'clients'
  | 'products'
  | 'services'
  | 'catalog'
  | 'company'
  | 'superadmin';

interface MenuItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: number | null;
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
  pendingUsersCount?: number;
  currentUser?: AppUser | null;
  companyInfo: CompanyInfo;
  onNewQuoteClick: () => void;
  onOpenPdvClick: () => void;
  onOpenPublicCatalog?: () => void;
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
  pendingUsersCount = 0,
  currentUser,
  companyInfo,
  onNewQuoteClick,
  onOpenPdvClick,
  onOpenPublicCatalog,
}) => {
  const isSuper =
    currentUser?.role === 'superadmin' ||
    (currentUser?.email && currentUser.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase());

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
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        },
        {
          id: 'sales',
          label: 'Vendas / PDV',
          icon: ShoppingBag,
          badge: salesCount > 0 ? salesCount : null,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        },
        {
          id: 'contracts',
          label: 'Contratos',
          icon: Scroll,
          badge: contractsCount > 0 ? contractsCount : null,
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        },
        {
          id: 'clients',
          label: 'Clientes',
          icon: Users,
        },
      ],
    },
    {
      groupTitle: 'Financeiro',
      items: [
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
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        },
        {
          id: 'receipts',
          label: 'Recibos',
          icon: ReceiptText,
          badge: receiptsCount > 0 ? receiptsCount : null,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
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
                badgeColor: 'bg-amber-500 text-slate-950 font-black animate-pulse',
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
        className={`fixed top-0 bottom-0 left-0 z-50 bg-zinc-950 border-r border-amber-500/30 text-white flex flex-col transition-all duration-300 print:hidden shadow-2xl ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Topo do Menu: Logo Smart Vidros */}
        <div className="h-20 px-4 flex items-center justify-between border-b border-zinc-800/80 shrink-0">
          {!isCollapsed ? (
            <SmartVidrosLogo
              companyInfo={companyInfo}
              size="md"
              variant="dark"
              showSubtitle={false}
              onClick={() => handleSelectTab('dashboard')}
            />
          ) : (
            <div
              onClick={() => handleSelectTab('dashboard')}
              className="mx-auto cursor-pointer p-1 bg-zinc-900 border border-amber-400/50 rounded-xl hover:border-amber-400 transition-colors"
              title="Smart Vidros — Início"
            >
              <SmartVidrosLogo companyInfo={companyInfo} size="sm" showSubtitle={false} />
            </div>
          )}

          {/* Botão de Fechar no Mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl lg:hidden transition-colors"
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
            className={`w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
              isCollapsed ? 'p-3' : 'px-4 py-2.5 text-xs'
            }`}
            title="Abrir Ponto de Venda (PDV)"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>+ Abrir PDV</span>}
          </button>

          {!isCollapsed && (
            <button
              onClick={() => {
                onNewQuoteClick();
                setIsMobileOpen(false);
              }}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/30 hover:border-amber-400 font-extrabold rounded-xl transition-all px-3 py-2 text-xs flex items-center justify-center gap-1.5"
              title="Criar Novo Orçamento"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Novo Orçamento</span>
            </button>
          )}
        </div>

        {/* Lista de Navegação por Grupos Organizados */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed && group.groupTitle && (
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-500">
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
                    (item.id === 'products' && activeTab === 'catalog') ||
                    (item.id === 'services' && activeTab === 'catalog');

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                          : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`}
                      title={item.label}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                      
                      {!isCollapsed && (
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      )}

                      {!isCollapsed && item.badge !== null && item.badge !== undefined && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-black border ${
                            isActive
                              ? 'bg-slate-950/20 text-slate-950 border-slate-950/20'
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

        {/* Acesso Rápido à Vitrine Pública */}
        {onOpenPublicCatalog && (
          <div className="p-3 border-t border-zinc-800/80 shrink-0">
            <button
              onClick={onOpenPublicCatalog}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center p-2.5' : 'gap-2 px-3 py-2.5'
              } rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm`}
              title="Abrir Vitrine Pública (Link do Cliente)"
            >
              <span className="text-amber-400 text-sm">✨</span>
              {!isCollapsed && <span className="truncate">Vitrine do Cliente</span>}
            </button>
          </div>
        )}

        {/* Rodapé da Sidebar: Recolher / Expandir no Tablet/Desktop */}
        <div className="p-3 border-t border-zinc-800/80 shrink-0 hidden lg:block">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 text-xs font-semibold transition-colors"
            title={isCollapsed ? 'Expandir Menu Lateral' : 'Recolher Menu Lateral'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-amber-400" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 text-amber-400" />
                <span>Recolher Menu</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
