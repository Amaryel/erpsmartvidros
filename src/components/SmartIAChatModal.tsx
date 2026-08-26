import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Calculator,
  FileText,
  DollarSign,
  Maximize2,
  Minimize2,
  Trash2,
  Lightbulb,
  Mic,
  MicOff,
  Globe,
  MessageSquare,
  Plus,
  CheckCheck,
  HelpCircle,
  TrendingUp,
  Cpu,
  Code2,
  Search,
  MessageCircle,
  ThumbsUp,
  RotateCcw
} from 'lucide-react';
import { AppUser, CompanyInfo } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ia';
  text: string;
  timestamp: string;
  source?: 'gemini-api' | 'local-knowledge' | 'local-fallback';
}

interface SmartIAChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AppUser | null;
  companyInfo: CompanyInfo;
  onNavigateToTab?: (tab: any) => void;
  onShowToast?: (msg: string) => void;
}

const CHAT_PROMPT_CATEGORIES = [
  {
    category: '🌐 Qualquer Assunto (ChatGPT)',
    prompts: [
      { label: 'Escrever Mensagem WhatsApp para Cliente', text: 'Crie uma mensagem profissional e persuasiva de WhatsApp para enviar ao cliente cobrando a aprovação de um orçamento de vidros sem ser invasivo.' },
      { label: 'Dicas para Aumentar Vendas', text: 'Quais são as melhores estratégias de vendas e pós-venda para uma vidraçaria crescer e fidelizar clientes?' },
      { label: 'Pesquisa / Dúvida Geral', text: 'Explique de forma simples como funciona o marketing digital local no Google Meu Negócio e Instagram.' },
      { label: 'Cálculo Financeiro / Margem de Lucro', text: 'Como calcular a margem de lucro ideal e markup em serviços de instalação de vidros e esquadrias?' },
    ],
  },
  {
    category: '📐 Vidraçaria & Fórmulas Técnicas',
    prompts: [
      { label: 'Cálculo de m² com Folgas', text: 'Como calcular o metro quadrado (m²) e as folgas de corte para um Box Frontal F1 de 1,40m x 1,90m em vidro temperado 8mm?' },
      { label: 'Norma ABNT NBR 14207 (Box)', text: 'Quais são as principais exigências de segurança da norma ABNT NBR 14207 para instalação de box de banheiro?' },
      { label: 'Diferença Vidro Temperado vs Laminado', text: 'Qual a diferença técnica e onde é obrigatório usar vidro laminado vs vidro temperado segundo a NBR 7199?' },
    ],
  },
  {
    category: '⚙️ ERP Smart Vidros',
    prompts: [
      { label: 'Como Fechar o Caixa Diário', text: 'Como funciona o fechamento de caixa, conferência de pagamentos e lançamento por áudio no ERP Smart Vidros?' },
      { label: 'Contrato com Assinatura na Tela', text: 'Como gero um contrato com assinatura digital na tela e exporto em PDF no sistema?' },
    ],
  },
];

export const SmartIAChatModal: React.FC<SmartIAChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  companyInfo,
  onNavigateToTab,
  onShowToast,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ia',
      text: `Olá, **${currentUser ? currentUser.name.split(' ')[0] : 'Parceiro(a)'}**! 👋 Sou o **Smart IA**, seu assistente conversacional inteligente.\n\nVocê pode me perguntar **QUALQUER COISA** como no ChatGPT:\n* 🌐 **Dúvidas gerais, pesquisas, redação de mensagens e e-mails para clientes**\n* 📐 **Fórmulas de m², normas técnicas ABNT (NBR 14207/7199), folgas e engenharia de vidros**\n* 💼 **Estratégias de vendas, finanças e suporte ao ERP Smart Vidros**\n\nComo posso te ajudar agora?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'gemini-api',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToBottom();
        textareaRef.current?.focus();
      }, 150);
    }
  }, [isOpen, messages]);

  // Auto-ajustar altura do textarea conforme digitação
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    try {
      // Chamar endpoint server-side /api/smart-ia com histórico
      const historyPayload = messages.slice(-10).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/smart-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`Erro na API (${res.status})`);
      }

      const data = await res.json();
      const iaMsg: Message = {
        id: `ia-${Date.now()}`,
        sender: 'ia',
        text: data.reply || 'Processado com sucesso.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
      };

      setMessages((prev) => [...prev, iaMsg]);
    } catch (err) {
      console.warn('[Smart IA Client] Fallback local acionado:', err);
      const fallbackReply = generateUniversalFallback(text);
      const iaMsg: Message = {
        id: `ia-${Date.now()}`,
        sender: 'ia',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'local-fallback',
      };
      setMessages((prev) => [...prev, iaMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      onShowToast?.('Resposta copiada para a área de transferência!');
      setTimeout(() => setCopiedId(null), 2500);
    } catch (e) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(id);
      onShowToast?.('Resposta copiada com sucesso!');
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleToggleLike = (id: string) => {
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ia',
        text: `Conversa iniciada! 🚀 Pode perguntar qualquer coisa: pesquisas, cálculos, redação de textos, normas ou dúvidas do sistema.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Reconhecimento de Voz nativo no Navegador (Web Speech API)
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz direto. Digite sua mensagem pelo teclado.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div
        className={`bg-zinc-950 border border-amber-500/30 flex flex-col shadow-2xl transition-all duration-300 w-full rounded-t-3xl sm:rounded-3xl overflow-hidden ${
          isExpanded
            ? 'h-[96vh] sm:h-[94vh] sm:max-w-5xl'
            : 'h-[88vh] sm:h-[720px] sm:max-w-3xl'
        }`}
      >
        {/* ================= CABEÇALHO ESTILO BATE-PAPO / CHATGPT ================= */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-b border-zinc-800/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white truncate flex items-center gap-1.5">
                  <span>Smart IA Bate-Papo</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-gradient-to-r from-amber-500/20 to-amber-400/20 text-amber-300 border border-amber-500/30">
                    Estilo ChatGPT
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-medium">Online</span>
                <span className="text-zinc-600">•</span>
                <span className="truncate">Pesquisa qualquer assunto ou gestão da vidraçaria</span>
              </p>
            </div>
          </div>

          {/* Botões do Topo */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white rounded-xl transition-all text-xs font-bold active:scale-95"
              title="Iniciar nova conversa"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Nova Conversa</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors hidden sm:flex"
              title={isExpanded ? 'Reduzir tamanho' : 'Expandir tela cheia'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors"
              title="Fechar bate-papo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= CORPO DO BATE-PAPO (MENSAGENS) ================= */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 custom-scrollbar bg-zinc-950/95 relative">
          
          {/* BANNER / SUGESTÕES DE TÓPICOS QUANDO HÁ POUCAS MENSAGENS */}
          {messages.length <= 2 && (
            <div className="mb-4 bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/80 rounded-2xl p-4 space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Sugestões de Perguntas & Pesquisas Rápidas:</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Clique para testar</span>
              </div>

              <div className="space-y-3">
                {CHAT_PROMPT_CATEGORIES.map((cat, cIdx) => (
                  <div key={cIdx} className="space-y-1.5">
                    <p className="text-[10px] uppercase font-black tracking-wider text-zinc-400">
                      {cat.category}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {cat.prompts.map((p, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSendMessage(p.text)}
                          className="text-left p-2.5 rounded-xl bg-zinc-900/80 hover:bg-amber-500/10 border border-zinc-800 hover:border-amber-500/30 text-xs text-zinc-300 hover:text-amber-200 transition-all flex items-start gap-2 group active:scale-[0.99]"
                        >
                          <span className="text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">
                            ›
                          </span>
                          <span className="truncate leading-snug">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LISTA DE BALÕES DE MENSAGEM */}
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 items-end ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                {/* Avatar da IA */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/30 to-amber-400/20 border border-amber-500/40 flex items-center justify-center shrink-0 mb-1 shadow-sm">
                    <Bot className="w-4 h-4 text-amber-400" />
                  </div>
                )}

                {/* Balão de Mensagem */}
                <div
                  className={`max-w-[90%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-lg relative group ${
                    isUser
                      ? 'bg-gradient-to-br from-amber-500 to-amber-400 text-slate-950 font-medium rounded-br-sm shadow-amber-500/10'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-bl-sm'
                  }`}
                >
                  {/* Identificador de Remetente */}
                  <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-black/10 dark:border-white/5">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        isUser ? 'text-slate-950/80' : 'text-amber-400'
                      }`}
                    >
                      {isUser ? (currentUser?.name || 'Você') : 'Smart IA'}
                    </span>

                    <span
                      className={`text-[10px] font-mono ${
                        isUser ? 'text-slate-950/70' : 'text-zinc-500'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Conteúdo Renderizado da Mensagem */}
                  <div className="space-y-2 break-words">
                    {renderFormattedChat(msg.text, isUser)}
                  </div>

                  {/* Ações na Resposta da IA (Copiar, Feedback, Regenerar) */}
                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500/60" />
                        <span>IA Generativa</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleLike(msg.id)}
                          className={`p-1 hover:text-amber-400 rounded transition-colors ${
                            likedMap[msg.id] ? 'text-amber-400' : 'text-zinc-400'
                          }`}
                          title="Gostei da resposta"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                            copiedId === msg.id
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700/60 shadow-sm'
                          }`}
                          title="Copiar texto completo da resposta"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-amber-400" />
                              <span>Copiar Texto</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Status de Envio do Usuário (Checkmark estilo WhatsApp) */}
                  {isUser && (
                    <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-950/70 font-semibold">
                      <span>Entregue</span>
                      <CheckCheck className="w-3.5 h-3.5 text-slate-950" />
                    </div>
                  )}
                </div>

                {/* Avatar do Usuário */}
                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mb-1 font-black text-xs text-amber-400 shadow-sm">
                    {currentUser ? currentUser.name[0].toUpperCase() : 'EU'}
                  </div>
                )}
              </div>
            );
          })}

          {/* Indicador de Digitação do ChatGPT */}
          {isLoading && (
            <div className="flex gap-2.5 sm:gap-3 items-end justify-start animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 mb-1">
                <Bot className="w-4 h-4 text-amber-400 animate-spin" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3 text-xs text-zinc-300 flex items-center gap-3 shadow-md">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[11px] text-zinc-400 font-medium">
                  Smart IA pensando e pesquisando...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ================= BARRA DE ATALHOS RÁPIDOS ACIMA DO INPUT ================= */}
        <div className="px-3 sm:px-4 py-1.5 bg-zinc-900/70 border-t border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 whitespace-nowrap pl-1">
            Atalhos:
          </span>

          {[
            { icon: Search, label: 'Pesquisa Livre', prompt: 'Pesquise sobre: ' },
            { icon: Calculator, label: 'Cálculo de m²', prompt: 'Como calcular m² de vidro temperado?' },
            { icon: MessageSquare, label: 'Msg p/ Cliente', prompt: 'Escreva uma mensagem para fechar venda no WhatsApp: ' },
            { icon: DollarSign, label: 'Preços & Lucro', prompt: 'Como calcular o preço de venda de um vidro com 40% de margem?' },
            { icon: Globe, label: 'Ideias de Marketing', prompt: 'Dê 5 ideias práticas para atrair mais clientes para vidraçaria' },
          ].map((chip, idx) => {
            const Icon = chip.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputMessage(chip.prompt);
                  textareaRef.current?.focus();
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-[11px] text-zinc-300 hover:text-amber-300 font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
              >
                <Icon className="w-3 h-3 text-amber-400" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= CAMPO DE ENTRADA ESTILO BATE-PAPO / TEXTAREA ================= */}
        <div className="p-3 sm:p-4 bg-zinc-950 border-t border-zinc-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            {/* Botão de Microfone / Gravar Áudio */}
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-3 rounded-2xl border transition-all active:scale-95 shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border-zinc-800'
              }`}
              title={isListening ? 'Ouvindo... Clique para parar' : 'Falar por voz / microfone'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Caixa de Texto Auto-expansível */}
            <div className="relative flex-1 bg-zinc-900 border border-zinc-800 focus-within:border-amber-500 rounded-2xl transition-colors overflow-hidden">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte qualquer coisa (ChatGPT, cálculos, textos, normas)..."
                className="w-full bg-transparent text-white text-xs sm:text-sm px-4 py-3 max-h-32 focus:outline-none resize-none custom-scrollbar placeholder-zinc-500"
                disabled={isLoading}
              />
            </div>

            {/* Botão Enviar Mensagem */}
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black p-3 rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center shrink-0"
              title="Enviar mensagem (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Rodapé Informativo */}
          <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500 px-1">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-amber-500" />
              <span>Smart IA Conversacional • Pesquisa Livre & Vidraçarias</span>
            </span>
            <span className="hidden sm:inline">
              Pressione <strong>Enter</strong> para enviar, <strong>Shift+Enter</strong> para quebra de linha
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================= RENDERIZADOR AVANÇADO DE TEXTO E MARKDOWN DO CHAT =================
function renderFormattedChat(content: string, isUser: boolean) {
  if (!content) return null;

  const lines = content.split('\n');

  return lines.map((line, lineIdx) => {
    // Linha vazia vira espaçamento
    if (!line.trim()) {
      return <div key={lineIdx} className="h-2" />;
    }

    // Títulos Markdown ### ou ##
    if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
      const cleanHeader = line.replace(/^#+\s*/, '');
      return (
        <h4
          key={lineIdx}
          className={`font-black text-sm sm:text-base mt-2 mb-1 ${
            isUser ? 'text-slate-950' : 'text-amber-300'
          }`}
        >
          {cleanHeader}
        </h4>
      );
    }

    // Blocos com Marcadores (Bullets)
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const bulletText = line.trim().substring(2);
      return (
        <div key={lineIdx} className="flex items-start gap-2 pl-1.5 py-0.5">
          <span className={`font-black ${isUser ? 'text-slate-950' : 'text-amber-400'}`}>•</span>
          <span className="flex-1">{formatInlineElements(bulletText, isUser)}</span>
        </div>
      );
    }

    // Blocos Numerados 1. 2. 3.
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return (
        <div key={lineIdx} className="flex items-start gap-2 pl-1.5 py-0.5">
          <span
            className={`font-black font-mono text-[11px] px-1.5 py-0.2 rounded ${
              isUser ? 'bg-black/10 text-slate-950' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {numMatch[1]}.
          </span>
          <span className="flex-1">{formatInlineElements(numMatch[2], isUser)}</span>
        </div>
      );
    }

    // Bloco de Código ou Fórmulas destacadas
    if (line.trim().startsWith('```') || line.trim().endsWith('```')) {
      const cleanCode = line.replace(/```/g, '');
      return (
        <div
          key={lineIdx}
          className={`p-2.5 rounded-xl font-mono text-xs my-1 ${
            isUser
              ? 'bg-black/15 text-slate-950 font-bold'
              : 'bg-zinc-950 border border-zinc-800 text-amber-200'
          }`}
        >
          {cleanCode}
        </div>
      );
    }

    // Parágrafo Normal
    return (
      <p key={lineIdx} className="leading-relaxed">
        {formatInlineElements(line, isUser)}
      </p>
    );
  });
}

// Formatação inline de **negrito**, *itálico*, `código` e links
function formatInlineElements(text: string, isUser: boolean) {
  // Substituir blocos de **negrito**
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, pIdx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong
          key={pIdx}
          className={`font-extrabold ${isUser ? 'text-slate-950' : 'text-amber-300'}`}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={pIdx}
          className={`font-mono text-xs px-1.5 py-0.5 rounded font-bold ${
            isUser ? 'bg-black/15 text-slate-950' : 'bg-zinc-950 text-amber-400 border border-zinc-800'
          }`}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}

// Respostas inteligentes para contingência offline com qualquer assunto
function generateUniversalFallback(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('mensagem') || q.includes('whatsapp') || q.includes('cliente') || q.includes('texto')) {
    return `💬 **Modelo de Mensagem Profissional para WhatsApp:**\n\n"Olá, tudo bem? Aqui é da vidraçaria! Passando para te avisar que o seu orçamento para a instalação dos vidros/esquadrias já está pronto e com condições especiais de pagamento. Posso te enviar os detalhes ou agendamos a data para iniciar a sua obra?" 📋✨\n\n💡 *Você pode personalizar o nome do cliente e a forma de pagamento antes de enviar!*`;
  }

  if (q.includes('m2') || q.includes('metro') || q.includes('calcul') || q.includes('área')) {
    return `📐 **Cálculo de Área e Preço de Vidros:**\n\n* **Fórmula:** Largura (em metros) × Altura (em metros) = Área (m²)\n* **Exemplo:** Vidro de 120cm × 210cm = 1,20 × 2,10 = **2,52 m²**.\n* **Valor:** 2,52 m² × Preço do m² + Ferragens e Mão de Obra.\n\nNo ERP Smart Vidros, você só precisa digitar a largura e a altura que o sistema calcula automaticamente!`;
  }

  if (q.includes('contrato') || q.includes('termo') || q.includes('assinar') || q.includes('pdf')) {
    return `📄 **Contratos & Recibos com Assinatura Digital:**\n\n1. Abra o Orçamento ou Venda.\n2. Clique em **"Gerar Contrato"**.\n3. O cliente assina diretamente na tela do celular/tablet ou computador!\n4. Clique em **"Imprimir / Salvar PDF"** para gerar a folha A4 com termos jurídicos ABNT.`;
  }

  return `🤖 **Resposta Smart IA:**\n\nRecebi sua pergunta: *" ${query} "*.\n\nComo inteligência artificial integrada, posso te orientar em estratégias de vendas, redação de contratos, cálculos de engenharia de vidros temperados/laminados, marketing e muito mais! Como deseja que eu elabore essa resposta?`;
}
