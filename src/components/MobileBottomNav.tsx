import React from 'react';
import { Menu, ShoppingBag, type LucideIcon } from 'lucide-react';

export interface MobileNavItem {
  /** Id da aba (o mesmo usado em setActiveTab). */
  id: string;
  label: string;
  icon: LucideIcon;
}

interface MobileBottomNavProps {
  activeTab: string;
  /** Atalhos em ordem de prioridade (usa 3 com PDV, 4 sem). Os que o usuário não pode acessar já devem vir filtrados. */
  items: MobileNavItem[];
  onNavigate: (tabId: string) => void;
  /** Se informado, mostra o botão central de PDV. */
  onOpenPdv?: () => void;
  onOpenMenu: () => void;
  isMenuOpen?: boolean;
}

/**
 * Barra de navegação inferior para celular e tablet (some no desktop, a partir de lg).
 * Ações principais ao alcance do polegar: atalhos, PDV no centro e o menu completo.
 */
const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  items,
  onNavigate,
  onOpenPdv,
  onOpenMenu,
  isMenuOpen = false,
}) => {
  // Com PDV: 2 atalhos | PDV | 1 atalho + Menu (PDV fica no centro). Sem PDV: até 4 atalhos + Menu.
  const shortcuts = items.slice(0, onOpenPdv ? 3 : 4);
  const left = onOpenPdv ? shortcuts.slice(0, 2) : shortcuts;
  const right = onOpenPdv ? shortcuts.slice(2) : [];

  const itemClass = (active: boolean) =>
    `flex flex-1 min-w-0 flex-col items-center justify-center gap-0.5 h-14 rounded-xl text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-amber-500 ${
      active ? 'text-zinc-950' : 'text-zinc-500 active:bg-zinc-100'
    }`;

  const renderItem = (item: MobileNavItem) => {
    const active = activeTab === item.id;
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onNavigate(item.id)}
        className={itemClass(active)}
        aria-current={active ? 'page' : undefined}
      >
        <span
          className={`flex items-center justify-center h-7 w-12 rounded-full transition-colors ${
            active ? 'bg-amber-100 text-amber-700' : ''
          }`}
        >
          <Icon className="w-5 h-5" aria-hidden="true" />
        </span>
        <span className="truncate max-w-full px-1">{item.label}</span>
      </button>
    );
  };

  return (
    <nav
      className="lg:hidden fixed inset-x-0 bottom-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 print:hidden select-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegação principal"
    >
      <div className="mx-auto max-w-3xl flex items-stretch gap-1 px-2 pt-1 pb-1">
        {left.map(renderItem)}

        {onOpenPdv && (
          <div className="flex flex-1 min-w-0 items-center justify-center">
            <button
              type="button"
              onClick={onOpenPdv}
              className="flex flex-col items-center justify-center gap-0.5 h-14 w-full max-w-[84px] rounded-2xl bg-amber-500 active:bg-amber-400 text-slate-950 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
              aria-label="Abrir ponto de venda"
            >
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              <span>PDV</span>
            </button>
          </div>
        )}

        {right.map(renderItem)}

        <button
          type="button"
          onClick={onOpenMenu}
          className={itemClass(isMenuOpen)}
          aria-label="Abrir menu completo"
          aria-expanded={isMenuOpen}
        >
          <span
            className={`flex items-center justify-center h-7 w-12 rounded-full transition-colors ${
              isMenuOpen ? 'bg-amber-100 text-amber-700' : ''
            }`}
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </span>
          <span>Menu</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
