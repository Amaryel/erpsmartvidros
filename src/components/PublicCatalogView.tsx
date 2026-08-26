import React, { useState, useMemo } from 'react';
import {
  Search,
  MessageCircle,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Copy,
  ExternalLink,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  X,
  Eye,
  SlidersHorizontal,
  ArrowUp,
  LogIn,
  Package,
  Layers,
  Send,
  Check,
  Building2,
  Calendar,
  Clock,
  ShoppingBag,
  ArrowRight,
  HelpCircle,
  Info,
  Ruler,
  Palette
} from 'lucide-react';
import { CatalogItem, CompanyInfo } from '../types';

interface PublicCatalogViewProps {
  catalog: CatalogItem[];
  companyInfo: CompanyInfo;
  onOpenLogin?: () => void;
}

export interface QuoteCartItem {
  item: CatalogItem;
  quantity: number;
  width?: string;
  height?: string;
  notes?: string;
  glassColor?: string;
  aluminumColor?: string;
}

export const PublicCatalogView: React.FC<PublicCatalogViewProps> = ({
  catalog,
  companyInfo,
  onOpenLogin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'todos' | 'dimensao' | 'simples' | 'servico'>('todos');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');
  
  const [zoomImageItem, setZoomImageItem] = useState<CatalogItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<QuoteCartItem[]>([]);
  
  // Dados do cliente para envio do WhatsApp
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientUrgency, setClientUrgency] = useState('urgente');
  const [clientGeneralNotes, setClientGeneralNotes] = useState('');
  
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Filtrar apenas itens ativos
  const activeItems = useMemo(() => {
    return (catalog || []).filter((item) => item.status !== 'inativo');
  }, [catalog]);

  // Lista de categorias dinâmicas com contadores
  const categoryDefinitions = [
    { id: 'todos', label: 'Todos os Modelos', icon: '🌟', keywords: [] },
    { id: 'box', label: 'Boxes de Banheiro', icon: '🚿', keywords: ['box', 'banheiro', 'f1', 'm1', 'canto'] },
    { id: 'espelho', label: 'Espelhos & Decoração', icon: '🪞', keywords: ['espelho', 'bisotado', 'lapidado', 'circular', 'led', 'decorativo'] },
    { id: 'porta_janela', label: 'Portas & Janelas', icon: '🚪', keywords: ['porta', 'janela', 'pivotante', 'correr', '4 folhas', 'basculante', 'vidro'] },
    { id: 'guarda_corpo', label: 'Fachadas & Sacadas', icon: '🏢', keywords: ['guarda', 'sacada', 'varanda', 'fachada', 'pele de vidro', 'laminado', 'corpo'] },
    { id: 'esquadria', label: 'Esquadrias & Alumínio', icon: '🛠️', keywords: ['aluminio', 'alumínio', 'perfil', 'kit', 'esquadria', 'ferragem', 'trilho'] },
    { id: 'servico', label: 'Serviços & Instalação', icon: '⚙️', keywords: ['servico', 'serviço', 'manutencao', 'manutenção', 'instalacao', 'instalação', 'frete', 'troca'] },
  ];

  // Calcular contagem de cada categoria
  const categoriesWithCounts = useMemo(() => {
    return categoryDefinitions.map((cat) => {
      if (cat.id === 'todos') {
        return { ...cat, count: activeItems.length };
      }
      const count = activeItems.filter((item) => {
        const textToSearch = `${item.name} ${item.description || ''}`.toLowerCase();
        return cat.keywords.some((k) => textToSearch.includes(k.toLowerCase()));
      }).length;
      return { ...cat, count };
    });
  }, [activeItems]);

  // Itens filtrados e ordenados
  const filteredItems = useMemo(() => {
    let result = activeItems.filter((item) => {
      const textToSearch = `${item.name} ${item.description || ''}`.toLowerCase();
      const matchesSearch = textToSearch.includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Filtro por tipo
      if (selectedTypeFilter === 'dimensao' && item.type !== 'dimensao') return false;
      if (selectedTypeFilter === 'simples' && (item.type !== 'simples' || item.category === 'servico')) return false;
      if (selectedTypeFilter === 'servico' && item.category !== 'servico') return false;

      // Filtro por categoria
      if (selectedCategory === 'todos') return true;

      const catDef = categoryDefinitions.find((c) => c.id === selectedCategory);
      if (!catDef || catDef.keywords.length === 0) return true;

      return catDef.keywords.some((k) => textToSearch.includes(k.toLowerCase()));
    });

    // Ordenação
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.defaultPrice - b.defaultPrice);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.defaultPrice - a.defaultPrice);
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [activeItems, searchTerm, selectedCategory, selectedTypeFilter, sortBy]);

  // Limpar telefone para WhatsApp (apenas números com DDI 55)
  const whatsappCleanNumber = useMemo(() => {
    const raw = companyInfo.phone || '89999910028';
    const clean = raw.replace(/\D/g, '');
    return clean.startsWith('55') ? clean : `55${clean}`;
  }, [companyInfo.phone]);

  // Total de itens no carrinho
  const totalCartCount = useMemo(() => {
    return cart.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [cart]);

  // Subtotal estimado do carrinho
  const estimatedSubtotal = useMemo(() => {
    return cart.reduce((acc, curr) => {
      return acc + (curr.item.defaultPrice * curr.quantity);
    }, 0);
  }, [cart]);

  // Adicionar item ao carrinho
  const handleAddToCart = (item: CatalogItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCart((prev) => {
      const exists = prev.find((c) => c.item.id === item.id);
      if (exists) {
        return prev.map((c) => (c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [
        ...prev,
        {
          item,
          quantity: 1,
          glassColor: 'Incolor',
          aluminumColor: 'Natural / Fosco',
        },
      ];
    });
  };

  // Remover item do carrinho
  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  // Atualizar quantidade de um item
  const handleUpdateCartQty = (itemId: string, qty: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (qty <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }
    setCart((prev) => prev.map((c) => (c.item.id === itemId ? { ...c, quantity: qty } : c)));
  };

  // Atualizar campos customizados de um item no carrinho
  const handleUpdateCartItemData = (
    itemId: string,
    field: keyof Omit<QuoteCartItem, 'item'>,
    value: string | number
  ) => {
    setCart((prev) =>
      prev.map((c) => (c.item.id === itemId ? { ...c, [field]: value } : c))
    );
  };

  // Limpar todo o carrinho
  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Deseja limpar todos os itens da sua lista de orçamento?')) {
      setCart([]);
    }
  };

  // Gerar link direto para WhatsApp com 1 item específico
  const getSingleItemWhatsAppUrl = (item: CatalogItem) => {
    const unitText = item.unit ? ` (${item.unit})` : '';
    const companyTitle = companyInfo.name || 'Smart Vidros';
    const text = encodeURIComponent(
      `Olá, *${companyTitle}*! 👋\n\n` +
      `Estava visualizando o catálogo digital de vocês e gostaria de solicitar um orçamento para o seguinte produto:\n\n` +
      `📌 *${item.name}*${unitText}\n` +
      (item.description ? `📝 Detalhes: ${item.description}\n` : '') +
      `💰 Preço de referência: R$ ${item.defaultPrice.toFixed(2).replace('.', ',')}\n\n` +
      `Poderiam me passar mais informações de medidas e prazos de instalação? Obrigado!`
    );
    return `https://wa.me/${whatsappCleanNumber}?text=${text}`;
  };

  // Gerar texto formatado da cotação completa para WhatsApp
  const generateFormattedQuoteMessage = () => {
    const companyTitle = companyInfo.name || 'Smart Vidros';
    let message = `🏢 *SOLICITAÇÃO DE ORÇAMENTO — ${companyTitle.toUpperCase()}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (clientName.trim()) {
      message += `👤 *Cliente:* ${clientName.trim()}\n`;
    }
    if (clientPhone.trim()) {
      message += `📱 *Telefone/Whats:* ${clientPhone.trim()}\n`;
    }
    if (clientCity.trim()) {
      message += `📍 *Local da Obra/Imóvel:* ${clientCity.trim()}\n`;
    }

    const urgencyLabels: Record<string, string> = {
      urgente: '⚡ O mais breve possível / Urgente',
      semana: '📅 Próximos 7 a 15 dias',
      pesquisa: '🔍 Apenas cotação inicial e valores',
    };
    if (clientUrgency && urgencyLabels[clientUrgency]) {
      message += `⏱️ *Previsão de Instalação:* ${urgencyLabels[clientUrgency]}\n`;
    }

    message += `\n📦 *PRODUTOS SELECIONADOS (${cart.length} ${cart.length === 1 ? 'modelo' : 'modelos'}):*\n`;

    cart.forEach((c, index) => {
      const item = c.item;
      const unit = item.unit ? ` ${item.unit}` : '';
      message += `\n${index + 1}️⃣ *${item.name}*\n`;
      message += `   • Quantidade: *${c.quantity}${unit}*\n`;
      message += `   • Ref. Valor: R$ ${(item.defaultPrice * c.quantity).toFixed(2).replace('.', ',')}\n`;

      if (c.width || c.height) {
        message += `   • Medidas Aprox.: ${c.width ? `Largura ${c.width}` : ''} ${c.height ? `x Altura ${c.height}` : ''}\n`;
      }
      if (c.glassColor) {
        message += `   • Cor do Vidro: ${c.glassColor}\n`;
      }
      if (c.aluminumColor) {
        message += `   • Cor do Alumínio/Perfil: ${c.aluminumColor}\n`;
      }
      if (c.notes && c.notes.trim()) {
        message += `   • Obs.: ${c.notes.trim()}\n`;
      }
    });

    message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *Valor Total Estimado de Referência:* R$ ${estimatedSubtotal.toFixed(2).replace('.', ',')}\n`;
    message += `*(Obs: Valores finais e medidas serão confirmados após visita/medição técnica)*\n`;

    if (clientGeneralNotes.trim()) {
      message += `\n📝 *Observações Gerais do Projeto:*\n${clientGeneralNotes.trim()}\n`;
    }

    message += `\nOlá, equipe da *${companyTitle}*! Gostaria de verificar a cotação destes itens com prazos de entrega e agendamento de medição no local. Obrigado!`;

    return message;
  };

  // Gerar link do WhatsApp com todo o carrinho
  const getCartWhatsAppUrl = () => {
    if (cart.length === 0) return '#';
    const message = generateFormattedQuoteMessage();
    return `https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(message)}`;
  };

  // Copiar mensagem para área de transferência
  const handleCopyQuoteMessage = () => {
    const msg = generateFormattedQuoteMessage();
    navigator.clipboard.writeText(msg);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 3000);
  };

  // Copiar link público
  const handleCopyPublicLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?catalogo=publico`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const currentPublicLink = `${window.location.origin}${window.location.pathname}?catalogo=publico`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col relative">
      
      {/* 1. BARRA SUPERIOR DE NAVEGAÇÃO & CONTATO */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-zinc-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          
          {/* Logo & Marca (Sem sobreposição de textos) */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="Smart Vidros — Voltar ao Topo"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  {companyInfo.name || 'Smart Vidros'}
                </span>
                <span className="hidden sm:inline-flex bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-500/30">
                  Vitrine Oficial
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden xs:block">
                Vidraçaria, Boxes, Espelhos & Esquadrias
              </p>
            </div>
          </div>

          {/* Ações Rápidas do Topo */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Botão de Compartilhar Catálogo */}
            <button
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl text-xs font-bold transition-all active:scale-95"
              title="Compartilhar Link da Vitrine"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Compartilhar</span>
            </button>

            {/* Botão da Lista de Orçamento / Carrinho no Header */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                cart.length > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 animate-pulse'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
              }`}
              title="Ver Itens Selecionados para Cotação"
            >
              <ShoppingBag className={`w-4 h-4 ${cart.length > 0 ? 'stroke-[2.5]' : 'text-amber-400'}`} />
              <span className="hidden sm:inline">Minha Lista</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                cart.length > 0 ? 'bg-slate-950 text-amber-400' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {totalCartCount}
              </span>
            </button>

            {/* Botão WhatsApp Direto */}
            <a
              href={`https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(`Olá, ${companyInfo.name || 'Smart Vidros'}! Acessei o catálogo online e gostaria de falar com um atendente.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-3 sm:px-4 py-2 rounded-xl text-xs shadow-md shadow-emerald-950/60 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Botão de Acesso Restrito (Login) */}
            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold border border-transparent hover:border-zinc-800 transition-all"
                title="Acesso da Equipe e Gestão"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Painel</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* 2. HERO BANNER PRINCIPAL */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-8 sm:py-14">
        {/* Glow dourado de fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-64 bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>Vitrine Digital • Selecione os modelos e orce tudo junto no WhatsApp</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Excelência em Vidros & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">Esquadrias de Alumínio</span>
            </h1>

            {/* Descrição */}
            <p className="text-xs sm:text-base text-zinc-300 leading-relaxed max-w-2xl mx-auto">
              Navegue pelos nossos modelos de boxes de banheiro, espelhos lapidados e bisotados, portas pivotantes, janelas 4 folhas, fachadas panorâmicas e serviços especializados.
            </p>

            {/* Cartões Rápidos de Benefícios */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-3 text-left">
              
              <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Temperado ABNT</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">Vidros de alta segurança e durabilidade certificada</p>
              </div>

              <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Ruler className="w-4 h-4 shrink-0" />
                  <span>Projetos Sob Medida</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">Medição técnica no local para ajuste milimétrico</p>
              </div>

              <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Entrega Pontual</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">Compromisso rigoroso com os prazos de instalação</p>
              </div>

              <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{companyInfo.city || 'Picos – PI'}</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">Atendimento em toda a cidade e região circunvizinha</p>
              </div>

            </div>

            {/* Informações da Empresa Rápidas */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-zinc-400">
              {companyInfo.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{companyInfo.phone}</span>
                </div>
              )}
              {companyInfo.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{companyInfo.address}</span>
                </div>
              )}
              {companyInfo.cnpj && (
                <div className="flex items-center gap-1.5 text-zinc-500 font-mono">
                  <span>CNPJ: {companyInfo.cnpj}</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 3. ÁREA DE PRODUTOS, FILTROS E BUSCA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        
        {/* Barra de Busca, Filtros de Tipo e Ordenação */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
          
          {/* Linha Superior: Busca e Ordenação */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            
            {/* Campo de Busca */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome ou modelo (ex: Box, Espelho, Janela, Porta)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  title="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filtros Rápidos de Tipo e Ordenação */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              
              {/* Filtro por Tipo */}
              <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-2xl p-1 shrink-0">
                <button
                  onClick={() => setSelectedTypeFilter('todos')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedTypeFilter === 'todos'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setSelectedTypeFilter('dimensao')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedTypeFilter === 'dimensao'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Sob Medida (m²)
                </button>
                <button
                  onClick={() => setSelectedTypeFilter('simples')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedTypeFilter === 'simples'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Pronta Entrega
                </button>
              </div>

              {/* Seletor de Ordenação */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-2xl px-3 py-2 text-xs font-bold outline-none focus:border-amber-500 shrink-0"
              >
                <option value="default">Destaques</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="name">Nome (A-Z)</option>
              </select>

            </div>

          </div>

          {/* Chips de Categorias com Contadores */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-800">
            {categoriesWithCounts.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                      : 'bg-zinc-950 text-zinc-300 hover:text-white hover:bg-zinc-800/80 border border-zinc-800'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isSelected ? 'bg-slate-950 text-amber-400' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Barra de Status de Resultados */}
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-zinc-800/60">
            <span>
              Exibindo <strong className="text-amber-400 font-black">{filteredItems.length}</strong> {filteredItems.length === 1 ? 'modelo disponível' : 'modelos disponíveis'}
            </span>

            {cart.length > 0 && (
              <span className="text-amber-400 font-bold">
                ✓ {cart.length} {cart.length === 1 ? 'item na sua lista de cotação' : 'itens na sua lista de cotação'}
              </span>
            )}
          </div>

        </div>

        {/* 4. GRID DE ITENS DO CATÁLOGO */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-3">
            <Package className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Nenhum produto encontrado</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Não encontramos resultados para a combinação de filtros selecionada. Tente limpar os termos de busca ou mudar a categoria.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('todos');
                setSelectedTypeFilter('todos');
              }}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              Ver Todos os Modelos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((item) => {
              const cartEntry = cart.find((c) => c.item.id === item.id);
              const isInCart = !!cartEntry;
              const isService = item.category === 'servico' || item.type === 'simples';

              return (
                <div
                  key={item.id}
                  className={`bg-zinc-900/90 border rounded-3xl overflow-hidden transition-all duration-300 flex flex-col group hover:shadow-2xl hover:shadow-amber-500/10 ${
                    isInCart
                      ? 'border-amber-500/80 ring-1 ring-amber-500/40 bg-zinc-900'
                      : 'border-zinc-800 hover:border-amber-500/40'
                  }`}
                >
                  {/* Foto do Produto com Botão de Zoom */}
                  <div 
                    className="relative aspect-[4/3] bg-zinc-950 overflow-hidden cursor-pointer group/img"
                    onClick={() => setZoomImageItem(item)}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-600 gap-2">
                        <Package className="w-10 h-10" />
                        <span className="text-[11px] text-zinc-500">Foto sob consulta</span>
                      </div>
                    )}

                    {/* Botão de Ampliar Imagem */}
                    {item.imageUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomImageItem(item);
                        }}
                        className="absolute top-3 right-3 p-2 bg-slate-950/80 hover:bg-amber-500 text-zinc-300 hover:text-slate-950 backdrop-blur-sm rounded-xl text-xs transition-all shadow-md"
                        title="Ampliar Foto e Detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    {/* Badge de Selecionado no Topo */}
                    {isInCart && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Selecionado ({cartEntry?.quantity})</span>
                      </div>
                    )}

                    {/* Badge de Categoria / Tipo */}
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                      <span className="bg-slate-950/90 text-amber-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-xl border border-amber-500/30 backdrop-blur-sm">
                        {item.type === 'dimensao' ? 'Sob Medida (m²)' : item.unit || 'Unidade'}
                      </span>
                      {item.category === 'servico' && (
                        <span className="bg-blue-950/90 text-blue-300 text-[10px] font-bold px-2 py-1 rounded-xl border border-blue-500/30">
                          Serviço
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Informações do Item */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    
                    <div className="space-y-1.5">
                      <h3 
                        onClick={() => setZoomImageItem(item)}
                        className="font-bold text-white text-sm sm:text-base group-hover:text-amber-400 transition-colors line-clamp-2 cursor-pointer"
                      >
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Preço de Referência */}
                    <div className="pt-2 border-t border-zinc-800/80 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
                          {item.type === 'dimensao' ? 'Valor de referência / m²' : 'Preço sugerido'}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs text-amber-400 font-bold">R$</span>
                          <span className="text-lg font-black text-white">
                            {item.defaultPrice.toFixed(2).replace('.', ',')}
                          </span>
                          {item.unit && (
                            <span className="text-[11px] text-zinc-400 font-normal">
                              / {item.unit}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] text-zinc-400 bg-zinc-800/90 px-2 py-1 rounded-lg border border-zinc-700/50">
                        {item.type === 'dimensao' ? 'Consulte Medidas' : 'Pronta Entrega'}
                      </span>
                    </div>

                    {/* AÇÕES DE MULTI-SELEÇÃO & COTAÇÃO */}
                    <div className="space-y-2 pt-1">
                      
                      {/* Se o item já está no carrinho: Controles de Quantidade inline */}
                      {isInCart ? (
                        <div className="flex items-center justify-between bg-zinc-950 border border-amber-500/40 rounded-2xl p-1.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => handleUpdateCartQty(item.id, (cartEntry?.quantity || 1) - 1, e)}
                              className="w-7 h-7 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                              title="Diminuir"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-black text-amber-400">
                              {cartEntry?.quantity}
                            </span>
                            <button
                              onClick={(e) => handleUpdateCartQty(item.id, (cartEntry?.quantity || 1) + 1, e)}
                              className="w-7 h-7 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                              title="Aumentar"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => setIsCartOpen(true)}
                            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 px-2 py-1 flex items-center gap-1"
                          >
                            <span>Ver Lista</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        /* Botão Adicionar à Lista de Cotação */
                        <button
                          onClick={(e) => handleAddToCart(item, e)}
                          className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 active:scale-95"
                          title="Adicionar à Lista para Enviar Vários no WhatsApp"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>Adicionar à Cotação</span>
                        </button>
                      )}

                      {/* Botão Secundário: WhatsApp Avulso deste produto */}
                      <a
                        href={getSingleItemWhatsAppUrl(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 border border-zinc-700/60"
                        title="Enviar apenas este produto no WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                        <span>Orçar Apenas Este</span>
                      </a>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* 5. BARRA FLUTUANTE DE ITENS SELECIONADOS (STICKY BOTTOM BAR) */}
      {cart.length > 0 && (
        <div className="sticky bottom-4 z-40 max-w-4xl mx-auto w-full px-4 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-950/95 border-2 border-amber-500/80 rounded-3xl p-3 sm:p-4 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            
            {/* Info dos Itens */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-amber-500/30">
                {totalCartCount}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-white text-xs sm:text-sm">
                    {cart.length} {cart.length === 1 ? 'modelo selecionado' : 'modelos selecionados'}
                  </h4>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 font-black px-2 py-0.5 rounded-full">
                    Multi-Cotação
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Subtotal ref.: <strong className="text-white">R$ {estimatedSubtotal.toFixed(2).replace('.', ',')}</strong>
                </p>
              </div>

              {/* Botão de Limpar no Mobile */}
              <button
                onClick={handleClearCart}
                className="text-zinc-500 hover:text-red-400 sm:hidden p-2"
                title="Limpar lista"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Ações da Barra */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleClearCart}
                className="hidden sm:flex items-center gap-1 text-xs text-zinc-400 hover:text-red-400 px-2 py-2 transition-colors"
                title="Limpar todos os itens selecionados"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="flex-1 sm:flex-initial py-3 px-5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black rounded-2xl text-xs sm:text-sm transition-all shadow-xl shadow-emerald-950/80 flex items-center justify-center gap-2 active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Enviar Tudo no WhatsApp ({totalCartCount})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. MODAL / DRAWER COMPLETO: MINHA LISTA DE COTAÇÃO MULTI-PRODUTO */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-left">
            
            {/* Topo do Modal */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base sm:text-lg">
                    Lista de Orçamento • WhatsApp
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {cart.length} {cart.length === 1 ? 'produto selecionado' : 'produtos selecionados para envio em lote'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-colors text-xs font-semibold hidden sm:flex items-center gap-1"
                    title="Limpar lista"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar</span>
                  </button>
                )}

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl transition-all"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conteúdo Rolável: Itens e Formulário */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 scrollbar-thin scrollbar-thumb-zinc-800">
              
              {/* Lista de Itens no Carrinho */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                  <span>1. Itens e Medidas Personalizadas</span>
                  <span>{cart.length} modelos</span>
                </div>

                {cart.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-950/60 border border-zinc-800 rounded-2xl space-y-3">
                    <Package className="w-10 h-10 text-zinc-600 mx-auto" />
                    <p className="text-xs text-zinc-400">Sua lista de orçamento está vazia.</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
                    >
                      Explorar Produtos do Catálogo
                    </button>
                  </div>
                ) : (
                  cart.map((c, index) => (
                    <div
                      key={c.item.id}
                      className="p-3.5 bg-zinc-950 border border-zinc-800/90 rounded-2xl space-y-3"
                    >
                      {/* Linha Principal do Item */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {c.item.imageUrl ? (
                            <img
                              src={c.item.imageUrl}
                              alt={c.item.name}
                              className="w-12 h-12 rounded-xl object-cover border border-zinc-800 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                              <Package className="w-6 h-6" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                              {c.item.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-amber-400">
                              <span>Ref: R$ {c.item.defaultPrice.toFixed(2).replace('.', ',')} {c.item.unit ? `(${c.item.unit})` : ''}</span>
                              <span className="text-zinc-600">•</span>
                              <span className="font-bold text-white">Subtotal: R$ {(c.item.defaultPrice * c.quantity).toFixed(2).replace('.', ',')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Botão de Excluir Item */}
                        <button
                          onClick={() => handleRemoveFromCart(c.item.id)}
                          className="text-zinc-500 hover:text-red-400 p-1.5 transition-colors"
                          title="Remover produto da lista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Controles de Quantidade e Especificações */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-zinc-900">
                        
                        {/* Quantidade */}
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 mb-1">Quantidade</label>
                          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 justify-between">
                            <button
                              onClick={() => handleUpdateCartQty(c.item.id, c.quantity - 1)}
                              className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center font-bold text-xs"
                            >
                              -
                            </button>
                            <span className="text-xs font-black text-white px-2">{c.quantity}</span>
                            <button
                              onClick={() => handleUpdateCartQty(c.item.id, c.quantity + 1)}
                              className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Medidas Aprox. */}
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 mb-1">Medidas Aprox. (L x A)</label>
                          <input
                            type="text"
                            placeholder="Ex: 1.20 x 1.90m"
                            value={c.width || ''}
                            onChange={(e) => handleUpdateCartItemData(c.item.id, 'width', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Cor / Acabamento */}
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 mb-1">Cor do Vidro / Perfil</label>
                          <input
                            type="text"
                            placeholder="Ex: Incolor / Alumínio Preto"
                            value={c.glassColor || ''}
                            onChange={(e) => handleUpdateCartItemData(c.item.id, 'glassColor', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-amber-500"
                          />
                        </div>

                      </div>

                      {/* Observações específicas do item */}
                      <div>
                        <input
                          type="text"
                          placeholder="Observação deste item (ex: puxador especial, vidro temperado 8mm, bisotado)..."
                          value={c.notes || ''}
                          onChange={(e) => handleUpdateCartItemData(c.item.id, 'notes', e.target.value)}
                          className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-3 py-1.5 text-[11px] text-white placeholder-zinc-600 outline-none focus:border-amber-500"
                        />
                      </div>

                    </div>
                  ))
                )}
              </div>

              {/* Formulário de Identificação do Cliente */}
              {cart.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-zinc-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>2. Seus Dados de Contato & Local da Obra</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 mb-1">Seu Nome Completo</label>
                      <input
                        type="text"
                        placeholder="Ex: Maria Silva"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 mb-1">Seu Telefone / WhatsApp</label>
                      <input
                        type="text"
                        placeholder="Ex: (89) 99999-0000"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 mb-1">Cidade / Bairro da Instalação</label>
                      <input
                        type="text"
                        placeholder="Ex: Picos - PI / Bairro Canto da Várzea"
                        value={clientCity}
                        onChange={(e) => setClientCity(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 mb-1">Previsão / Urgência da Instalação</label>
                      <select
                        value={clientUrgency}
                        onChange={(e) => setClientUrgency(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                      >
                        <option value="urgente">⚡ O mais breve possível / Urgente</option>
                        <option value="semana">📅 Próximos 7 a 15 dias</option>
                        <option value="pesquisa">🔍 Apenas cotação inicial e valores</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">Observações Gerais ou Dúvidas</label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Gostaria de agendar medição no local ou saber condições de pagamento em até 10x..."
                      value={clientGeneralNotes}
                      onChange={(e) => setClientGeneralNotes(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  {/* Card Informativo de Transparência */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      Ao clicar em <strong>Enviar no WhatsApp</strong>, uma mensagem completa com todos os {cart.length} itens escolhidos será gerada e enviada diretamente para a equipe da <strong>{companyInfo.name || 'Smart Vidros'}</strong> para cálculo e medição técnica.
                    </p>
                  </div>

                </div>
              )}

            </div>

            {/* Rodapé Fixo do Modal com Totais e Botão do WhatsApp */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950/90 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-400 font-semibold block">Total Estimado de Referência:</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-400">
                      R$ {estimatedSubtotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <button
                    onClick={handleCopyQuoteMessage}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-zinc-700/60"
                  >
                    {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMessage ? 'Mensagem Copiada!' : 'Copiar Texto'}</span>
                  </button>
                </div>

                <a
                  href={getCartWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-sm transition-all shadow-xl shadow-emerald-950/80 flex items-center justify-center gap-2 active:scale-95"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Enviar Cotação Completa no WhatsApp ({totalCartCount} {totalCartCount === 1 ? 'item' : 'itens'})</span>
                </a>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 7. MODAL: ZOOM DA FOTO E DETALHES DO PRODUTO */}
      {zoomImageItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl flex flex-col space-y-3">
            
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/60">
              <div>
                <h3 className="font-extrabold text-white text-base sm:text-lg">{zoomImageItem.name}</h3>
                <span className="text-xs text-amber-400 font-bold">
                  Ref: R$ {zoomImageItem.defaultPrice.toFixed(2).replace('.', ',')} {zoomImageItem.unit ? `(${zoomImageItem.unit})` : ''}
                </span>
              </div>
              <button
                onClick={() => setZoomImageItem(null)}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden">
              {zoomImageItem.imageUrl ? (
                <img
                  src={zoomImageItem.imageUrl}
                  alt={zoomImageItem.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-600">
                  <Package className="w-12 h-12" />
                  <span className="text-xs">Foto sob consulta</span>
                </div>
              )}
            </div>

            {zoomImageItem.description && (
              <div className="p-4 bg-zinc-950/80 text-xs text-zinc-300 leading-relaxed border-t border-zinc-800">
                <strong className="text-white block mb-1">Descrição e Especificações:</strong>
                {zoomImageItem.description}
              </div>
            )}

            <div className="p-4 pt-0 flex gap-2">
              <button
                onClick={() => {
                  handleAddToCart(zoomImageItem);
                  setZoomImageItem(null);
                  setIsCartOpen(true);
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar à Minha Lista de Cotação</span>
              </button>

              <a
                href={getSingleItemWhatsAppUrl(zoomImageItem)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/50"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Pedir no WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* 8. MODAL: COMPARTILHAR VITRINE */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-4 text-left">
            
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-base">Compartilhar Vitrine</h3>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Envie este link direto para clientes visualizarem modelos de vidros, boxes, espelhos e esquadrias com preços de referência sem precisar de senha ou login.
            </p>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-zinc-400">Link Direto da Vitrine</label>
              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl p-2">
                <input
                  type="text"
                  readOnly
                  value={currentPublicLink}
                  className="bg-transparent text-xs text-amber-400 font-mono flex-1 outline-none truncate"
                />
                <button
                  onClick={handleCopyPublicLink}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Enviar pelo WhatsApp */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Olá! Conheça a Vitrine Digital da *${companyInfo.name || 'Smart Vidros'}*!\n\n` +
                `Veja nossos modelos de boxes de vidro, espelhos decorativos, portas, janelas e esquadrias de alumínio sob medida no link abaixo:\n` +
                `🔗 ${currentPublicLink}\n\n` +
                `Faça sua cotação direto pelo site e envie tudo de uma só vez pelo WhatsApp!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Enviar Vitrine via WhatsApp</span>
            </a>

          </div>
        </div>
      )}

      {/* 9. RODAPÉ DA VITRINE DIGITAL (Sem sobreposição de textos) */}
      <footer className="border-t border-zinc-800/80 bg-slate-950 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            
            {/* Logo do Rodapé */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-white text-sm">{companyInfo.name || 'Smart Vidros'}</h4>
                <p className="text-xs text-zinc-500">Vidraçaria, Boxes, Espelhos & Esquadrias de Alumínio</p>
              </div>
            </div>

            {/* Informações Comerciais */}
            <div className="text-xs text-zinc-400 space-y-1">
              <p>{companyInfo.address ? `${companyInfo.address} – ` : ''}{companyInfo.city || 'Picos – PI'}</p>
              <p>Atendimento Comercial: <strong>{companyInfo.phone}</strong> {companyInfo.email ? `| ${companyInfo.email}` : ''}</p>
            </div>

            {/* Acesso Restrito da Equipe */}
            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="text-xs text-zinc-500 hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Painel da Equipe</span>
              </button>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-900 text-center text-[11px] text-zinc-600">
            © {new Date().getFullYear()} {companyInfo.name || 'Smart Vidros'}. Todos os direitos reservados.
          </div>
        </div>
      </footer>

    </div>
  );
};
