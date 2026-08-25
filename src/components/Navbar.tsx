import React from 'react';
import {
  FileText,
  PlusCircle,
  Package,
  Building2,
  ReceiptText,
  ShoppingBag,
  ShieldCheck,
  Menu,
  LayoutDashboard,
  LogOut,
  Lock,
  Database,
  Scroll,
  Briefcase,
  Wallet
} from 'lucide-react';
import { AppUser, CompanyInfo } from '../types';
import { SmartVidrosLogo } from './SmartVidrosLogo';
import { ActiveTab } from './Sidebar';

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
  onNewReceiptClick,
  onOpenPdvClick,
  onToggleSidebarMobile,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenSupabaseSyncModal,
  onLogout,
}) => {
  const isSuper = currentUser?.role === 'superadmin' || currentUser?.email.toLowerCase() === 'amaryelcc@gmail.com';

  return (
    <header className="bg-zinc-950 text-white border-b border-amber-500/30 sticky top-0 z-30 shadow-xl print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Lado Esquerdo: Botão Menu Mobile/Tablet + Logo Smart Vidros */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebarMobile}
              className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors lg:hidden"
              title="Abrir Menu Lateral"
            >
              <Menu className="w-6 h-6 text-amber-400" />
            </button>

            {/* Logo/Nome Smart Vidros que Redireciona para o Dashboard */}
            <SmartVidrosLogo
              companyInfo={companyInfo}
              size="md"
              variant="dark"
              showSubtitle={false}
              onClick={() => setActiveTab('dashboard')}
            />
          </div>

          {/* Navegação Rápida Desktop */}
          <nav className="hidden xl:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-zinc-950 font-extrabold shadow-md'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Início</span>
            </button>

            <button
              onClick={() => setActiveTab('operations')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'operations'
                  ? 'bg-amber-500 text-zinc-950 font-extrabold shadow-md'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Obras</span>
            </button>

            <button
              onClick={() => setActiveTab('quotes')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'quotes' || activeTab === 'new_quote'
                  ? 'bg-amber-500 text-zinc-950 font-extrabold shadow-md'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Orçamentos</span>
              {quotesCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'quotes' || activeTab === 'new_quote'
                      ? 'bg-zinc-950/20 text-zinc-950'
                      : 'bg-zinc-800 text-amber-400'
                  }`}
                >
                  {quotesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('sales')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'sales'
                  ? 'bg-amber-500 text-zinc-950 font-extrabold shadow-md'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Vendas & PDV</span>
              {salesCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'sales' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-amber-400'
                  }`}
                >
                  {salesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('cash')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'cash'
                  ? 'bg-amber-500 text-zinc-950 font-extrabold shadow-md'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Caixa</span>
            </button>

            <button
              onClick={() => setActiveTab('contracts')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'contracts'
                  ? 'bg-amber-500 text-zinc-950 font-extrabold shadow-md'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Scroll className="w-3.5 h-3.5" />
              <span>Contratos</span>
              {contractsCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'contracts' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-indigo-400'
                  }`}
                >
                  {contractsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('receivables')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'receivables'
                  ? 'bg-amber-500 text-zinc-950 font-extrabold shadow-md'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>A Receber</span>
              {receivablesCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'receivables' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-rose-400'
                  }`}
                >
                  {receivablesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('receipts')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'receipts' || activeTab === 'new_receipt'
                  ? 'bg-amber-500 text-zinc-950 font-extrabold shadow-md'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <ReceiptText className="w-3.5 h-3.5" />
              <span>Recibos</span>
              {receiptsCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'receipts' || activeTab === 'new_receipt'
                      ? 'bg-zinc-950/20 text-zinc-950'
                      : 'bg-zinc-800 text-emerald-400'
                  }`}
                >
                  {receiptsCount}
                </span>
              )}
            </button>

            {isSuper && (
              <button
                onClick={() => setActiveTab('superadmin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'superadmin'
                    ? 'bg-amber-500 text-zinc-950 font-extrabold shadow-md'
                    : 'text-amber-400 hover:bg-zinc-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Super Admin</span>
              </button>
            )}
          </nav>

          {/* Lado Direito: Botões de Ação + Usuário Logado */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNewQuoteClick}
              className="hidden md:flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/30 hover:border-amber-400 font-extrabold px-3 py-2 rounded-xl transition-all text-xs"
              title="Novo Orçamento Rápido"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Orçamento</span>
            </button>

            {onOpenSupabaseSyncModal && (
              <button
                onClick={onOpenSupabaseSyncModal}
                className="flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/30 font-bold px-3 py-2 rounded-xl text-xs transition-all"
                title="Sincronizar Banco Supabase"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline">Supabase</span>
              </button>
            )}

            <button
              onClick={onOpenPdvClick}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-3.5 py-2 rounded-xl shadow-lg active:scale-95 transition-all text-xs"
              title="Abrir Ponto de Venda"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>+ PDV</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                <button
                  onClick={onOpenProfileModal || onOpenAuthModal}
                  className="flex items-center gap-2 text-left bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 px-3 py-1.5 rounded-xl transition-all group"
                  title="Configurar Meu Perfil & Alterar Senha"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                    {currentUser.username ? currentUser.username[0].toUpperCase() : currentUser.name[0]}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[11px] font-bold text-white leading-tight flex items-center gap-1">
                      {currentUser.name.split(' ')[0]}
                      <span className="text-[10px] text-amber-400">⚙️</span>
                    </p>
                    <p className="text-[9px] text-amber-400 font-mono">
                      @{currentUser.username || 'user'}
                    </p>
                  </div>
                </button>

                <button
                  onClick={onLogout}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-xl transition-colors flex items-center gap-1"
                  title="Sair do Sistema"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-amber-500/30 font-bold px-3 py-2 rounded-xl text-xs transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Entrar / Cadastrar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

