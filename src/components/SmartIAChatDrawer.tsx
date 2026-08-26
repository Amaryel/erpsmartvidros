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
  Mic,
  MicOff,
  Globe,
  MessageSquare,
  Plus,
  CheckCheck,
  Search,
  ThumbsUp,
  History,
  ChevronRight,
  MessageCircle,
  MoreVertical,
  Edit2
} from 'lucide-react';
import { AppUser, CompanyInfo } from '../types';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface Message {
  id: string;
  sender: 'user' | 'ia';
  text: string;
  timestamp: string;
  source?: 'gemini-api' | 'local-knowledge' | 'local-fallback';
}

interface SmartIAChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AppUser | null;
  companyInfo: CompanyInfo;
  onNavigateToTab?: (tab: any) => void;
}

const STORAGE_KEY = 'smart_vidros_ia_chat_sessions_v1';

export const SmartIAChatDrawer: React.FC<SmartIAChatDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  companyInfo,
  onNavigateToTab,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showHistoryList, setShowHistoryList] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Inicializar ou carregar sessão ativa
  useEffect(() => {
    if (sessions.length === 0) {
      const initialSession: ChatSession = {
        id: `sess-${Date.now()}`,
        title: 'Nova Conversa',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: 'welcome',
            sender: 'ia',
            text: `Olá, **${currentUser ? currentUser.name.split(' ')[0] : 'Parceiro(a)'}**! 👋 Sou o **Smart IA**, seu assistente conversacional inteligente.\n\nVocê pode me perguntar **QUALQUER COISA** como no ChatGPT:\n* 🌐 **Dúvidas gerais, pesquisas, redação de mensagens e e-mails para clientes**\n* 📐 **Fórmulas de m², normas técnicas ABNT (NBR 14207/7199), folgas e engenharia de vidros**\n* 💼 **Estratégias de vendas, finanças e suporte ao ERP Smart Vidros**\n\nComo posso te ajudar agora?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: 'gemini-api',
          },
        ],
      };
      setSessions([initialSession]);
      setCurrentSessionId(initialSession.id);
    } else if (!currentSessionId || !sessions.find((s) => s.id === currentSessionId)) {
      setCurrentSessionId(sessions[0].id);
    }
  }, []);

  // Salvar no localStorage sempre que as sessões mudarem
  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      } catch (e) {
        console.error(e);
      }
    }
  }, [sessions]);

  const activeSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

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
  }, [isOpen, currentSessionId, messages.length]);

  // Auto-ajustar altura do textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  if (!isOpen) return null;

  const handleCreateNewSession = () => {
    const newSession: ChatSession = {
      id: `sess-${Date.now()}`,
      title: 'Nova Conversa',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `welcome-${Date.now()}`,
          sender: 'ia',
          text: `Conversa iniciada! 🚀 Pode perguntar qualquer coisa: pesquisas, cálculos, redação de textos, normas ou dúvidas do sistema.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'gemini-api',
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setShowHistoryList(false);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleDeleteSession = (sessionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const remaining = sessions.filter((s) => s.id !== sessionId);
    if (remaining.length === 0) {
      // Se apagou todas, cria uma limpa
      const freshSession: ChatSession = {
        id: `sess-${Date.now()}`,
        title: 'Nova Conversa',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: `welcome-${Date.now()}`,
            sender: 'ia',
            text: `Histórico limpo! Em que posso te ajudar hoje? ✨`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: 'gemini-api',
          },
        ],
      };
      setSessions([freshSession]);
      setCurrentSessionId(freshSession.id);
    } else {
      setSessions(remaining);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(remaining[0].id);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading || !activeSession) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Atualizar título da conversa se for a primeira pergunta
    const shouldUpdateTitle =
      activeSession.title === 'Nova Conversa' &&
      activeSession.messages.filter((m) => m.sender === 'user').length === 0;

    const newTitle = shouldUpdateTitle
      ? text.length > 28
        ? text.substring(0, 28) + '...'
        : text
      : activeSession.title;

    const updatedMessagesWithUser = [...activeSession.messages, userMsg];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              title: newTitle,
              updatedAt: new Date().toISOString(),
              messages: updatedMessagesWithUser,
            }
          : s
      )
    );

    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    try {
      const historyPayload = updatedMessagesWithUser.slice(-10).map((m) => ({
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

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                updatedAt: new Date().toISOString(),
                messages: [...s.messages, iaMsg],
              }
            : s
        )
      );
    } catch (err) {
      console.warn('[Smart IA Client] Fallback acionado:', err);
      const fallbackReply = generateUniversalFallback(text);
      const iaMsg: Message = {
        id: `ia-${Date.now()}`,
        sender: 'ia',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'local-fallback',
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                updatedAt: new Date().toISOString(),
                messages: [...s.messages, iaMsg],
              }
            : s
        )
      );
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
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
    <>
      {/* Backdrop transparente ou escurecido leve quando aberto no modo gaveta lateral */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isFullScreen
            ? 'bg-slate-950/80 backdrop-blur-sm'
            : 'bg-black/30 lg:bg-transparent pointer-events-auto lg:pointer-events-none'
        }`}
        onClick={() => {
          if (!isFullScreen && window.innerWidth < 1024) {
            onClose();
          }
        }}
      />

      {/* PAINEL LATERAL (DRAWER) FIXADO NO LADO DIREITO */}
      <aside
        className={`fixed z-50 transition-all duration-300 flex flex-col bg-zinc-950 border-amber-500/30 shadow-2xl overflow-hidden ${
          isFullScreen
            ? 'inset-3 sm:inset-6 md:inset-10 rounded-3xl border shadow-2xl'
            : 'bottom-0 right-0 top-0 sm:top-auto sm:bottom-4 sm:right-4 w-full sm:w-[420px] md:w-[460px] h-full sm:h-[650px] max-h-screen sm:rounded-3xl border-t sm:border shadow-2xl'
        }`}
        style={{
          boxShadow: isFullScreen
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            : '0 10px 40px -10px rgba(245, 158, 11, 0.25), 0 0 30px rgba(0,0,0,0.8)',
        }}
      >
        {/* ================= CABEÇALHO SUPERIOR (ESTILO JIVOCHAT / CHAT WIDGET) ================= */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar Inteligente com Badge Online */}
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 p-0.5 shadow-md shadow-amber-500/20">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
            </div>

            {/* Informações do Atendente Virtual */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-white truncate flex items-center gap-1.5">
                  <span>Smart IA</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full font-black">
                    ChatGPT
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-semibold">Atendimento Online</span>
                <span className="text-zinc-600">•</span>
                <span className="truncate">{activeSession?.title || 'Conversa'}</span>
              </p>
            </div>
          </div>

          {/* Botões de Ação do Topo (Histórico, Nova Conversa, Fullscreen, Fechar) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Botão de Histórico de Conversas */}
            <button
              onClick={() => setShowHistoryList(!showHistoryList)}
              className={`p-2 rounded-xl transition-all text-xs font-bold flex items-center gap-1 ${
                showHistoryList
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
              title="Histórico de Conversas Gravadas"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Botão Nova Conversa */}
            <button
              onClick={handleCreateNewSession}
              className="p-2 text-zinc-400 hover:text-amber-300 hover:bg-zinc-900 rounded-xl transition-colors"
              title="Iniciar Nova Conversa"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Botão Tela Cheia */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors hidden sm:flex"
              title={isFullScreen ? 'Reduzir para Widget Lateral' : 'Expandir para Tela Cheia'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Botão Fechar */}
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors"
              title="Fechar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= PAINEL DESLIZANTE DE HISTÓRICO DE CONVERSAS ================= */}
        {showHistoryList && (
          <div className="bg-zinc-900 border-b border-zinc-800 p-3 max-h-56 overflow-y-auto custom-scrollbar animate-fade-in shrink-0">
            <div className="flex items-center justify-between text-xs font-extrabold text-amber-400 mb-2 px-1">
              <span className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                <span>Conversas Gravadas ({sessions.length})</span>
              </span>
              <button
                onClick={handleCreateNewSession}
                className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/30 transition-colors"
              >
                + Nova Conversa
              </button>
            </div>

            <div className="space-y-1">
              {sessions.map((sess) => {
                const isSelected = sess.id === activeSession?.id;
                return (
                  <div
                    key={sess.id}
                    onClick={() => {
                      setCurrentSessionId(sess.id);
                      setShowHistoryList(false);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'bg-zinc-950/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span className="truncate">{sess.title}</span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteSession(sess.id, e)}
                      className="p-1 hover:text-red-400 text-zinc-500 hover:bg-zinc-800 rounded-lg transition-colors ml-2"
                      title="Excluir esta conversa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= CORPO DAS MENSAGENS (ESTILO WIDGET CHAT) ================= */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 custom-scrollbar bg-zinc-950/95">
          
          {/* Subtítulo Desenvolvido por Smart Vidros */}
          <div className="text-center">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
              Chat Inteligente integrado por Smart Vidros
            </span>
          </div>

          {/* LISTA DE MENSAGENS */}
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2 sm:gap-2.5 items-end ${
                  isUser ? 'justify-end' : 'justify-start'
                } animate-fade-in`}
              >
                {/* Avatar da IA */}
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 mb-0.5">
                    <Bot className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                )}

                {/* Balão da Mensagem */}
                <div
                  className={`max-w-[88%] sm:max-w-[85%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-md relative group ${
                    isUser
                      ? 'bg-gradient-to-br from-amber-500 to-amber-400 text-slate-950 font-medium rounded-br-none shadow-amber-500/10'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-bl-none'
                  }`}
                >
                  {/* Nome do Remetente */}
                  <div className="flex items-center justify-between gap-2 mb-1 pb-1 border-b border-black/10 dark:border-white/5">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider ${
                        isUser ? 'text-slate-950/80' : 'text-amber-400'
                      }`}
                    >
                      {isUser ? (currentUser?.name || 'Você') : 'Smart IA'}
                    </span>
                    <span
                      className={`text-[9px] font-mono ${
                        isUser ? 'text-slate-950/70' : 'text-zinc-500'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Conteúdo Renderizado */}
                  <div className="space-y-1.5 break-words">
                    {renderFormattedChat(msg.text, isUser)}
                  </div>

                  {/* Rodapé do Balão da IA */}
                  {!isUser && (
                    <div className="mt-2 pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="text-[9px] text-zinc-500">IA Generativa</span>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                        title="Copiar resposta"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Status no Balão do Usuário */}
                  {isUser && (
                    <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-slate-950/70 font-semibold">
                      <CheckCheck className="w-3 h-3 text-slate-950" />
                    </div>
                  )}
                </div>

                {/* Avatar do Usuário */}
                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mb-0.5 font-bold text-xs text-amber-400">
                    {currentUser ? currentUser.name[0].toUpperCase() : 'EU'}
                  </div>
                )}
              </div>
            );
          })}

          {/* Indicador de Digitação */}
          {isLoading && (
            <div className="flex gap-2 items-end justify-start animate-fade-in">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-none px-3.5 py-2.5 text-xs text-zinc-300 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[11px] text-zinc-400">Smart IA respondendo...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ================= ATALHOS RÁPIDOS NO RODAPÉ ================= */}
        <div className="px-3 py-1.5 bg-zinc-900/80 border-t border-zinc-800 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
          {[
            { label: 'Cálculo de m²', prompt: 'Como calcular o metro quadrado (m²) de um vidro temperado com folgas?' },
            { label: 'Msg de WhatsApp', prompt: 'Crie uma mensagem educada de WhatsApp para cobrar aprovação de orçamento.' },
            { label: 'Norma Box NBR 14207', prompt: 'Quais as regras da norma ABNT NBR 14207 para Box de banheiro?' },
            { label: 'Pesquisa Livre', prompt: 'Explique sobre: ' },
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputMessage(chip.prompt);
                textareaRef.current?.focus();
              }}
              className="px-2 py-0.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 hover:text-amber-300 font-medium whitespace-nowrap transition-all shrink-0"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* ================= CAMPO DE ENTRADA (ESTILO JIVOCHAT) ================= */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            {/* Gravar Áudio / Voz */}
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-2.5 rounded-xl border transition-all active:scale-95 shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border-zinc-800'
              }`}
              title={isListening ? 'Ouvindo... Clique para parar' : 'Falar por áudio'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Input de Mensagem */}
            <div className="relative flex-1 bg-zinc-900 border border-zinc-800 focus-within:border-amber-500 rounded-xl transition-colors overflow-hidden">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                className="w-full bg-transparent text-white text-xs sm:text-sm px-3.5 py-2.5 max-h-28 focus:outline-none resize-none custom-scrollbar placeholder-zinc-500"
                disabled={isLoading}
              />
            </div>

            {/* Botão Enviar */}
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black p-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center shrink-0"
              title="Enviar (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Rodapé do Widget */}
          <div className="mt-1.5 flex items-center justify-between text-[9px] text-zinc-500 px-1">
            <span>✨ ChatGPT & ERP Smart Vidros</span>
            <span>Enter para enviar</span>
          </div>
        </div>
      </aside>
    </>
  );
};

// Formatação rica para bate-papo
function renderFormattedChat(content: string, isUser: boolean) {
  if (!content) return null;
  const lines = content.split('\n');

  return lines.map((line, lineIdx) => {
    if (!line.trim()) return <div key={lineIdx} className="h-1.5" />;

    if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
      const cleanHeader = line.replace(/^#+\s*/, '');
      return (
        <h4
          key={lineIdx}
          className={`font-black text-xs sm:text-sm mt-1 mb-0.5 ${
            isUser ? 'text-slate-950' : 'text-amber-300'
          }`}
        >
          {cleanHeader}
        </h4>
      );
    }

    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const bulletText = line.trim().substring(2);
      return (
        <div key={lineIdx} className="flex items-start gap-1.5 pl-1 py-0.5">
          <span className={`font-black ${isUser ? 'text-slate-950' : 'text-amber-400'}`}>•</span>
          <span className="flex-1">{formatInlineElements(bulletText, isUser)}</span>
        </div>
      );
    }

    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return (
        <div key={lineIdx} className="flex items-start gap-1.5 pl-1 py-0.5">
          <span
            className={`font-black font-mono text-[10px] px-1 rounded ${
              isUser ? 'bg-black/10 text-slate-950' : 'bg-amber-500/20 text-amber-300'
            }`}
          >
            {numMatch[1]}.
          </span>
          <span className="flex-1">{formatInlineElements(numMatch[2], isUser)}</span>
        </div>
      );
    }

    return (
      <p key={lineIdx} className="leading-relaxed">
        {formatInlineElements(line, isUser)}
      </p>
    );
  });
}

function formatInlineElements(text: string, isUser: boolean) {
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
          className={`font-mono text-xs px-1 rounded ${
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

function generateUniversalFallback(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('mensagem') || q.includes('whatsapp') || q.includes('cliente')) {
    return `💬 **Mensagem para WhatsApp:**\n\n"Olá! Aqui é da vidraçaria. Seu orçamento para os vidros/esquadrias já está pronto com condições especiais. Posso te enviar os detalhes ou agendamos a data para a instalação?" 📋✨`;
  }

  if (q.includes('m2') || q.includes('metro') || q.includes('calcul')) {
    return `📐 **Cálculo de m² de Vidro:**\n\n* **Fórmula:** Largura (m) × Altura (m) = m²\n* **Exemplo:** 1,40m × 1,90m = **2,66 m²**.\n* No ERP Smart Vidros, você só digita as medidas no Novo Orçamento que o cálculo é automático!`;
  }

  return `🤖 **Smart IA:** Recebi sua pergunta: *"${query}"*. Como inteligência artificial integrada, posso te auxiliar com pesquisas gerais, fórmulas de engenharia, redação de contratos e dúvidas do sistema. Como deseja prosseguir?`;
}
