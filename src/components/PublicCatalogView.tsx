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
  Clock
} from 'lucide-react';
import { CatalogItem, CompanyInfo } from '../types';
import { SmartVidrosLogo } from './SmartVidrosLogo';

interface PublicCatalogViewProps {
  catalog: CatalogItem[];
  companyInfo: CompanyInfo;
  onOpenLogin?: () => void;
}

interface QuoteCartItem {
  item: CatalogItem;
  quantity: number;
  notes?: string;
  approxWidth?: string;
  approxHeight?: string;
}

export const PublicCatalogView: React.FC<PublicCatalogViewProps> = ({
  catalog,
  companyInfo,
  onOpenLogin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [zoomImageItem, setZoomImageItem] = useState<CatalogItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<QuoteCartItem[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientGeneralNotes, setClientGeneralNotes] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Filtrar apenas itens ativos
  const activeItems = useMemo(() => {
    return (catalog || []).filter((item) => item.status !== 'inativo');
  }, [catalog]);

  // Lista de categorias dinâmicas
  const categories = [
    { id: 'todos', label: '🌟 Todos os Modelos', icon: '🌟' },
    { id: 'box', label: '🚿 Boxes de Banheiro', icon: '🚿', keywords: ['box', 'banheiro', 'f1', 'm1', 'canto'] },
    { id: 'espelho', label: '🪞 Espelhos & Decoração', icon: '🪞', keywords: ['espelho', 'bisotado', 'lapidado', 'circular', 'led'] },
    { id: 'porta_janela', label: '🚪 Portas & Janelas', icon: '🚪', keywords: ['porta', 'janela', 'pivotante', 'correr', '4 folhas', 'basculante'] },
    { id: 'guarda_corpo', label: '🏢 Fachadas & Sacadas', icon: '🏢', keywords: ['guarda', 'sacada', 'varanda', 'fachada', 'pele de vidro', 'laminado'] },
    { id: 'esquadria', label: '🛠️ Esquadrias & Alumínio', icon: '🛠️', keywords: ['aluminio', 'alumínio', 'perfil', 'kit', 'esquadria', 'ferragem'] },
    { id: 'servico', label: '⚙️ Serviços & Manutenção', icon: '⚙️', keywords: ['servico', 'serviço', 'manutencao', 'manutenção', 'instalacao', 'instalação', 'frete'] },
  ];

  // Itens filtrados
  const filteredItems = useMemo(() => {
    return activeItems.filter((item) => {
      const textToSearch = `${item.name} ${item.description || ''}`.toLowerCase();
      const matchesSearch = textToSearch.includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'todos') return true;

      const catDef = categories.find((c) => c.id === selectedCategory);
      if (!catDef || !catDef.keywords) return true;

      return catDef.keywords.some((k) => textToSearch.includes(k.toLowerCase()));
    });
  }, [activeItems, searchTerm, selectedCategory]);

  // Limpar telefone para WhatsApp (apenas números)
  const whatsappCleanNumber = useMemo(() => {
    const raw = companyInfo.phone || '89999910028';
    const clean = raw.replace(/\D/g, '');
    return clean.startsWith('55') ? clean : `55${clean}`;
  }, [companyInfo.phone]);

  // Adicionar item ao carrinho de cotação
  const handleAddToCart = (item: CatalogItem) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.item.id === item.id);
      if (exists) {
        return prev.map((c) => (c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  const handleUpdateCartQty = (itemId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }
    setCart((prev) => prev.map((c) => (c.item.id === itemId ? { ...c, quantity: qty } : c)));
  };

  const handleUpdateCartNotes = (itemId: string, notes: string) => {
    setCart((prev) => prev.map((c) => (c.item.id === itemId ? { ...c, notes } : c)));
  };

  // Gerar link direto para WhatsApp com 1 item específico
  const getSingleItemWhatsAppUrl = (item: CatalogItem) => {
    const unitText = item.unit ? ` (${item.unit})` : '';
    const text = encodeURIComponent(
      `Olá, ${companyInfo.name}! 👋\n\n` +
      `Estava visualizando o catálogo digital de vocês e gostaria de solicitar um orçamento para o seguinte produto:\n\n` +
      `📌 *${item.name}*${unitText}\n` +
      (item.description ? `📝 Detalhes: ${item.description}\n` : '') +
      `💰 Preço de referência no catálogo: R$ ${item.defaultPrice.toFixed(2).replace('.', ',')}\n\n` +
      `Poderiam me passar mais informações de medidas e prazos de instalação? Obrigado!`
    );
    return `https://wa.me/${whatsappCleanNumber}?text=${text}`;
  };

  // Gerar link do WhatsApp com todo o carrinho
  const getCartWhatsAppUrl = () => {
    if (cart.length === 0) return '#';

    let message = `Olá, *${companyInfo.name}*! 👋\n\n` +
      `Montei uma lista de produtos no catálogo online e gostaria de solicitar um *orçamento detalhado*:\n\n`;

    if (clientName.trim()) {
      message += `👤 *Cliente:* ${clientName.trim()}\n`;
    }
    if (clientCity.trim()) {
      message += `📍 *Cidade / Região:* ${clientCity.trim()}\n`;
    }

    message += `\n📋 *ITENS ESCOLHIDOS:*\n`;
    cart.forEach((c, index) => {
      const item = c.item;
      const unit = item.unit ? ` ${item.unit}` : '';
      message += `\n${index + 1}️⃣ *${item.name}* (Qtd: ${c.quantity}${unit})`;
      if (c.notes && c.notes.trim()) {
        message += `\n   ↳ Medidas/Observações: ${c.notes.trim()}`;
      }
    });

    if (clientGeneralNotes.trim()) {
      message += `\n\n📝 *Observações Gerais do Projeto:*\n${clientGeneralNotes.trim()}`;
    }

    message += `\n\nPodem me informar o valor total estimado e disponibilidade de medição/instalação? Muito obrigado!`;

    return `https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleCopyPublicLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?catalogo=publico`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const currentPublicLink = `${window.location.origin}${window.location.pathname}?catalogo=publico`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col relative">
      
      {/* BARRA SUPERIOR DE CONTATO & ACESSO RESTRITO */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          {/* Logo & Marca */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <SmartVidrosLogo className="w-9 h-9" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                  {companyInfo.name || 'Smart Vidros'}
                </span>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-500/30">
                  Catálogo Oficial
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Vidros Temperados, Esquadrias, Boxes & Espelhos
              </p>
            </div>
          </div>

          {/* Ações da Barra: WhatsApp Direto, Compartilhar, Login */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Botão Compartilhar */}
            <button
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl text-xs font-bold transition-all"
              title="Compartilhar Link do Catálogo"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>

            {/* Botão WhatsApp da Empresa */}
            <a
              href={`https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(`Olá, ${companyInfo.name}! Acessei o catálogo online e gostaria de falar com um atendente.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 sm:px-4 py-2 rounded-xl text-xs shadow-lg shadow-emerald-950/50 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="sm:hidden">Conversar</span>
            </a>

            {/* Botão de Acesso Restrito (Login) */}
            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold border border-transparent hover:border-zinc-800 transition-all"
                title="Acesso da Equipe e Gestão"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Área Restrita</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION DE APRESENTAÇÃO */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-10 sm:py-16">
        {/* Glow de fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-56 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Vitrine Digital & Solicitação de Orçamento Direto</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Excelência em Vidros & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">Esquadrias Sob Medida</span>
            </h1>

            {/* Descrição */}
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
              Conheça nossa linha completa de boxes temperados, espelhos decorativos, portas pivotantes, janelas 4 folhas, fachadas panorâmicas e serviços de instalação profissional.
            </p>

            {/* Cartões Rápidos de Benefícios */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 text-left">
              <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Vidro Temperado</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">Alta segurança e têmpera certificada ABNT</p>
              </div>

              <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>Sob Medida</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">Medição e projeto personalizado no seu imóvel</p>
              </div>

              <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Entrega Rápida</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">Compromisso com prazos e acabamento impecável</p>
              </div>

              <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{companyInfo.city || 'Picos – PI'}</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">Atendimento em toda a região e cidades vizinhas</p>
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

      {/* ÁREA DE PRODUTOS, FILTROS E BUSCA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        
        {/* Barra de Busca e Categorias */}
        <div className="space-y-4">
          
          {/* Campo de Busca */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome (ex: Box, Espelho, Janela, Porta)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-xs text-zinc-400 font-medium self-end sm:self-center">
              Mostrando <strong className="text-amber-400 font-bold">{filteredItems.length}</strong> {filteredItems.length === 1 ? 'modelo disponível' : 'modelos disponíveis'}
            </div>
          </div>

          {/* Chips de Categorias */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* GRID DE ITENS DO CATÁLOGO */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-3">
            <Package className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Nenhum item encontrado</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Não encontramos produtos para a busca "{searchTerm}". Tente pesquisar por outro termo ou escolha outra categoria.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('todos');
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
            >
              Ver Todos os Produtos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((item) => {
              const isInCart = cart.some((c) => c.item.id === item.id);
              const isService = item.category === 'servico' || item.type === 'simples';

              return (
                <div
                  key={item.id}
                  className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col group hover:shadow-xl hover:shadow-amber-500/5"
                >
                  {/* Foto do Produto com Botão de Zoom */}
                  <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden group/img">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                        <Package className="w-12 h-12" />
                      </div>
                    )}

                    {/* Botão de Ampliar Imagem */}
                    {item.imageUrl && (
                      <button
                        onClick={() => setZoomImageItem(item)}
                        className="absolute top-3 right-3 p-2 bg-slate-950/80 hover:bg-amber-500 text-zinc-300 hover:text-slate-950 backdrop-blur-sm rounded-xl text-xs transition-all shadow-md"
                        title="Ampliar Foto"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    {/* Badge de Categoria / Tipo */}
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                      <span className="bg-slate-950/90 text-amber-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border border-amber-500/30 backdrop-blur-sm">
                        {item.type === 'dimensao' ? 'Sob Medida (m²)' : item.unit || 'Unidade'}
                      </span>
                      {item.category === 'servico' && (
                        <span className="bg-blue-950/90 text-blue-300 text-[10px] font-bold px-2 py-1 rounded-lg border border-blue-500/30">
                          Serviço
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Informações do Item */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-amber-400 transition-colors line-clamp-2">
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

                      <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md">
                        {item.type === 'dimensao' ? 'Consulte Medidas' : 'Pronta Entrega'}
                      </span>
                    </div>

                    {/* Botões de Ação */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      
                      {/* Adicionar à Lista de Cotação */}
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isInCart
                            ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60'
                        }`}
                        title="Adicionar à Lista de Orçamento"
                      >
                        {isInCart ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{isInCart ? 'Adicionado' : '+ Cotação'}</span>
                      </button>

                      {/* WhatsApp Direto do Item */}
                      <a
                        href={getSingleItemWhatsAppUrl(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-md shadow-emerald-950/50"
                        title="Pedir Orçamento deste item no WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        <span>Orçar Já</span>
                      </a>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* BOTÃO FLUTUANTE DA LISTA DE COTAÇÃO / CARRINHO */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-bounce">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-3 rounded-2xl shadow-2xl shadow-amber-500/30 active:scale-95 transition-all text-xs sm:text-sm border-2 border-slate-950"
          >
            <div className="w-6 h-6 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center font-black text-xs">
              {cart.reduce((acc, curr) => acc + curr.quantity, 0)}
            </div>
            <span>Ver Minha Lista de Orçamento</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MODAL / DRAWER: MINHA LISTA DE COTAÇÃO */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col space-y-4 text-left">
            
            {/* Cabeçalho do Carrinho */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  📋
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Minha Lista de Orçamento</h3>
                  <p className="text-[11px] text-zinc-400">
                    {cart.length} {cart.length === 1 ? 'modelo selecionado' : 'modelos selecionados'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de Itens */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
              {cart.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 space-y-2">
                  <Package className="w-8 h-8 mx-auto" />
                  <p className="text-xs">Sua lista está vazia. Adicione itens do catálogo!</p>
                </div>
              ) : (
                cart.map((c) => (
                  <div
                    key={c.item.id}
                    className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{c.item.name}</h4>
                        <span className="text-[10px] text-amber-400">
                          Ref: R$ {c.item.defaultPrice.toFixed(2).replace('.', ',')} {c.item.unit ? `(${c.item.unit})` : ''}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(c.item.id)}
                        className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                        title="Remover Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quantidade e Campo de Medidas */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                        <button
                          onClick={() => handleUpdateCartQty(c.item.id, c.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white">{c.quantity}</span>
                        <button
                          onClick={() => handleUpdateCartQty(c.item.id, c.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Ex: Medidas aprox. 1.20 x 1.90m ou cor"
                        value={c.notes || ''}
                        onChange={(e) => handleUpdateCartNotes(c.item.id, e.target.value)}
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] text-white placeholder-zinc-600 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Dados do Cliente para Envio */}
            {cart.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-zinc-800">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 mb-1">Seu Nome</label>
                    <input
                      type="text"
                      placeholder="Ex: Maria Silva"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 mb-1">Cidade / Bairro</label>
                    <input
                      type="text"
                      placeholder="Ex: Picos - PI / Centro"
                      value={clientCity}
                      onChange={(e) => setClientCity(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-1">Observações adicionais (opcional)</label>
                  <textarea
                    rows={2}
                    placeholder="Alguma dúvida sobre acabamento, cor do alumínio ou prazo desejado?"
                    value={clientGeneralNotes}
                    onChange={(e) => setClientGeneralNotes(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                {/* Botão de Enviar no WhatsApp */}
                <a
                  href={getCartWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm transition-all shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Enviar Cotação Completa no WhatsApp</span>
                </a>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL: ZOOM DA FOTO DO PRODUTO */}
      {zoomImageItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl flex flex-col space-y-3">
            
            <div className="p-4 flex items-center justify-between border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-white text-base">{zoomImageItem.name}</h3>
                <span className="text-xs text-amber-400">
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

            <div className="relative aspect-video bg-zinc-950 flex items-center justify-center">
              <img
                src={zoomImageItem.imageUrl}
                alt={zoomImageItem.name}
                className="w-full h-full object-contain"
              />
            </div>

            {zoomImageItem.description && (
              <div className="p-4 bg-zinc-950/80 text-xs text-zinc-300 leading-relaxed border-t border-zinc-800">
                {zoomImageItem.description}
              </div>
            )}

            <div className="p-4 pt-0 flex gap-2">
              <button
                onClick={() => {
                  handleAddToCart(zoomImageItem);
                  setZoomImageItem(null);
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar à Lista</span>
              </button>

              <a
                href={getSingleItemWhatsAppUrl(zoomImageItem)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Pedir no WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: COMPARTILHAR CATÁLOGO PÚBLICO */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-base">Compartilhar Catálogo</h3>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Envie este link direto para seus clientes visualizarem modelos de vidros, boxes, espelhos e esquadrias sem precisar de login.
            </p>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-zinc-400">Link Direto do Catálogo</label>
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
                `Olá! Conheça nosso Catálogo Digital da *${companyInfo.name}*!\n\n` +
                `Veja nossos modelos de boxes de vidro, espelhos decorativos, portas, janelas e esquadrias de alumínio sob medida no link abaixo:\n` +
                `🔗 ${currentPublicLink}\n\n` +
                `Faça sua cotação direto pelo site ou fale conosco pelo WhatsApp!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Enviar Catálogo via WhatsApp</span>
            </a>

          </div>
        </div>
      )}

      {/* RODAPÉ DO CATÁLOGO PÚBLICO */}
      <footer className="border-t border-zinc-800/80 bg-slate-950 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
              <SmartVidrosLogo className="w-8 h-8" />
              <div>
                <h4 className="font-extrabold text-white text-sm">{companyInfo.name || 'Smart Vidros'}</h4>
                <p className="text-xs text-zinc-500">Vidraçaria & Esquadrias de Alumínio</p>
              </div>
            </div>

            <div className="text-xs text-zinc-400 space-y-1">
              <p>{companyInfo.address ? `${companyInfo.address} – ` : ''}{companyInfo.city || 'Picos – PI'}</p>
              <p>Atendimento Comercial: <strong>{companyInfo.phone}</strong> | {companyInfo.email}</p>
            </div>

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
