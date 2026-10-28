import { useCallback, useEffect, useRef } from 'react';

/**
 * Botão "voltar" do celular/tablet (gesto do Android, botão do navegador e o
 * botão de voltar da barra superior) integrado à navegação interna do app.
 *
 * Como funciona (padrão "guarda" no histórico):
 * - O app mantém UMA entrada extra no histórico ({ svGuard: true }).
 * - Cada "voltar" consome essa entrada; o app então fecha a janela aberta
 *   mais acima ou volta para a tela anterior, e recoloca a guarda.
 * - No início, sem nada aberto, o "voltar" não é interceptado: o próximo
 *   "voltar" sai do app normalmente.
 *
 * Assim não há corrida entre history.go() e pushState, e fechar uma janela
 * pelo "X" não deixa entradas "mortas" no histórico.
 */

export interface BackOverlay {
  /** Se a janela/painel está aberto. */
  open: boolean;
  /** Fecha a janela/painel. */
  close: () => void;
}

interface UseBackNavigationOptions<T extends string> {
  activeTab: T;
  setActiveTab: (tab: T) => void;
  /** Tela inicial (onde o "voltar" deixa de ser interceptado). */
  homeTab: T;
  /** Janelas que o "voltar" fecha, da MAIS ALTA (fecha primeiro) para a mais baixa. */
  overlays: BackOverlay[];
  /** Desligar fora da área logada (login, vitrine pública). */
  enabled?: boolean;
}

const MAX_STACK = 30;

const isGuardEntry = () =>
  typeof window !== 'undefined' && !!(window.history.state as { svGuard?: boolean } | null)?.svGuard;

export function useBackNavigation<T extends string>({
  activeTab,
  setActiveTab,
  homeTab,
  overlays,
  enabled = true,
}: UseBackNavigationOptions<T>) {
  const overlaysRef = useRef(overlays);
  const activeTabRef = useRef(activeTab);
  const setActiveTabRef = useRef(setActiveTab);
  overlaysRef.current = overlays;
  activeTabRef.current = activeTab;
  setActiveTabRef.current = setActiveTab;

  const tabStackRef = useRef<T[]>([]);
  const previousTabRef = useRef(activeTab);
  const navigatingBackRef = useRef(false);

  const hasOpenOverlay = overlays.some((o) => o.open);
  const canGoBack = hasOpenOverlay || activeTab !== homeTab;

  const armGuard = useCallback(() => {
    if (!isGuardEntry()) {
      window.history.pushState({ svGuard: true }, '');
    }
  }, []);

  // Pilha interna de telas visitadas
  useEffect(() => {
    const previous = previousTabRef.current;
    previousTabRef.current = activeTab;
    if (previous === activeTab) return;

    if (navigatingBackRef.current) {
      navigatingBackRef.current = false;
      return;
    }

    if (activeTab === homeTab) {
      // Voltar ao início zera o caminho (o próximo "voltar" sai do app)
      tabStackRef.current = [];
      return;
    }

    const stack = tabStackRef.current.filter((t) => t !== activeTab);
    stack.push(previous);
    tabStackRef.current = stack.slice(-MAX_STACK);
  }, [activeTab, homeTab]);

  // Recoloca a guarda sempre que houver algo para "voltar".
  // Quando não há mais nada (início, sem janelas), retira a guarda que sobrou
  // para o próximo "voltar" não ser um toque perdido.
  const ignoreNextPopRef = useRef(false);
  const hadSomethingRef = useRef(false);
  useEffect(() => {
    if (!enabled) return;
    if (canGoBack) {
      armGuard();
    } else if (hadSomethingRef.current && isGuardEntry()) {
      ignoreNextPopRef.current = true;
      window.history.back();
    }
    hadSomethingRef.current = canGoBack;
  }, [enabled, canGoBack, activeTab, armGuard]);

  // Trata o "voltar" do aparelho/navegador
  useEffect(() => {
    if (!enabled) return;

    const handlePopState = () => {
      const current = activeTabRef.current;

      // Retirada da guarda feita pelo próprio app (não foi o usuário)
      if (ignoreNextPopRef.current) {
        ignoreNextPopRef.current = false;
        if (current !== homeTab || overlaysRef.current.some((o) => o.open)) armGuard();
        return;
      }

      // 1) Fecha a janela aberta mais acima
      const openOverlays = overlaysRef.current.filter((o) => o.open);
      if (openOverlays.length) {
        openOverlays[0].close();
        // Ainda há o que "voltar"? Então recoloca a guarda.
        if (openOverlays.length > 1 || current !== homeTab) armGuard();
        return;
      }

      // 2) Volta para a tela anterior
      if (current !== homeTab) {
        const stack = tabStackRef.current;
        let target = stack.pop() ?? homeTab;
        while (target === current && stack.length) target = stack.pop() ?? homeTab;
        if (target === current) target = homeTab;
        navigatingBackRef.current = true;
        setActiveTabRef.current(target);
        if (target !== homeTab) armGuard();
        return;
      }

      // 3) Na tela inicial sem nada aberto: deixa o próximo "voltar" sair do app
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [enabled, homeTab, armGuard]);

  /** Para botões "voltar" na tela: mesmo comportamento do gesto do aparelho. */
  const goBack = useCallback(() => {
    if (enabled && isGuardEntry()) {
      window.history.back();
      return;
    }
    const openOverlay = overlaysRef.current.find((o) => o.open);
    if (openOverlay) {
      openOverlay.close();
      return;
    }
    const target = tabStackRef.current.pop() ?? homeTab;
    navigatingBackRef.current = true;
    setActiveTabRef.current(target === activeTabRef.current ? homeTab : target);
  }, [enabled, homeTab]);

  return { goBack, canGoBack };
}
