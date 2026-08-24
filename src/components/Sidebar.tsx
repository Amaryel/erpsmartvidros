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
  X
} from 'lucide-react';
import { SmartVidrosLogo } from './SmartVidrosLogo';
import { AppUser, CompanyInfo } from '../types';

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
}) => {
  const isSuper = currentUser?.role === 'superadmin' || currentUser?.email.toLowerCase() === 'amaryelcc@gmail.com';

  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Início',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'operations' as ActiveTab,
      label: 'Obras & Operações',
      icon: Wrench,
      badge: null,
    },
    {
      id: 'quotes' as ActiveTab,
      label: 'Orçamentos',
      icon: FileText,
      badge: quotesCount,
    },
    {
      id: 'sales' as ActiveTab,
      label: 'Vendas / PDV',
      icon: ShoppingBag,
      badge: salesCount,
    },
    {
      id: 'cash' as ActiveTab,
      label: 'Caixa / Financeiro',
      icon: DollarSign,
      badge: null,
    },
    {
      id: 'contracts' as ActiveTab,
      label: 'Contratos',
      icon: Scroll,
      badge: contractsCount > 0 ? contractsCount : null,
    },
    {
      id: 'receipts' as ActiveTab,
      label: 'Recibos',
      icon: ReceiptText,
      badge: receiptsCount,
    },
    {
      id: 'clients' as ActiveTab,
      label: 'Clientes',
      icon: Users,
      badge: null,
    },
    {
      id: 'products' as ActiveTab,
      label: 'Produtos',
      icon: Package,
      badge: null,
    },
    {
      id: 'services' as ActiveTab,
      label: 'Serviços',
      icon: Wrench,
      badge: null,
    },
    {
      id: 'receivables' as ActiveTab,
      label: 'Contas a Receber',
      icon: ShieldCheck,
      badge: receivablesCount,
    },
    {
      id: 'company' as ActiveTab,
      label: 'Empresa',
      icon: Building2,
      badge: null,
    },
    ...(isSuper
      ? [
          {
            id: 'superadmin' as ActiveTab,
            label: 'Painel Super Admin',
            icon: ShieldCheck,
            badge: pendingUsersCount > 0 ? pendingUsersCount : null,
          },
        ]
      : []),
  ];

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
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Container Principal do Menu Lateral (Sidebar) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-zinc-950 border-r border-amber-500/30 text-white flex flex-col transition-all duration-300 print:hidden ${
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
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Botão para Abertura Rápida de PDV */}
        <div className="p-3 shrink-0">
          <button
            onClick={() => {
              onOpenPdvClick();
              setIsMobileOpen(false);
            }}
            className={`w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
              isCollapsed ? 'p-3' : 'px-4 py-3 text-xs'
            }`}
            title="Abrir Ponto de Venda (PDV)"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>+ Abrir PDV</span>}
          </button>
        </div>

        {/* Lista de Navegação */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          {menuItems.map((item) => {
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
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-zinc-800 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

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
