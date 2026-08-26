import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Bot,
  Sparkles,
  Play,
  ChevronDown,
  MessageCircle,
  Calculator,
  FileText,
  DollarSign,
  Users,
  ShieldCheck,
  Phone,
  ExternalLink,
  Search,
  BookOpen
} from 'lucide-react';
import { CompanyInfo } from '../types';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyInfo: CompanyInfo;
  onStartTour: () => void;
  onOpenSmartIA: () => void;
}

interface FaqItem {
  question: string;
  answer: string;
  category: 'calculos' | 'contratos' | 'financeiro' | 'sistema';
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: 'calculos',
    question: 'Como o sistema calcula o metro quadrado (m²) e o valor final?',
    answer:
      'Ao adicionar um item de vidro no orçamento, informe a largura e a altura (em cm ou metros). O sistema multiplica Largura × Altura para obter a área (m²). Em seguida, multiplica pela tabela de preço do m² e soma automaticamente as ferragens (kit box, perfis, puxadores), acabamentos (lapidação, bisotê) e mão de obra de instalação.',
  },
  {
    category: 'contratos',
    question: 'Como emitir um Contrato com Assinatura Digital do cliente na tela?',
    answer:
      'Após criar ou finalizar um orçamento/venda, clique no botão "Gerar Contrato". O sistema preencherá as cláusulas jurídicas com dados do cliente e da obra. Na tela do contrato, você ou seu cliente podem assinar diretamente usando a ponta do dedo no celular/tablet ou o mouse. Depois, clique em "Imprimir / Salvar PDF" para gerar a folha A4 com as assinaturas.',
  },
  {
    category: 'financeiro',
    question: 'Como funciona o Lançamento por Áudio no Caixa Diário?',
    answer:
      'No módulo Financeiro > Caixa Diário, clique no botão com ícone de microfone. Fale uma frase natural como: "Recebi 400 reais em dinheiro do cliente Carlos" ou "Paguei 80 reais de frete em PIX". O sistema reconhece sua voz, transcreve e cadastra a movimentação automaticamente!',
  },
  {
    category: 'financeiro',
    question: 'Como realizar o Fechamento de Caixa ao final do expediente?',
    answer:
      'No menu Financeiro > Caixa Diário, clique em "Encerrar / Fechar Sessão de Caixa". O sistema apresentará o resumo consolidado de todas as entradas em Dinheiro, PIX, Cartão e saídas, permitindo conferência e impressão do comprovante de fechamento.',
  },
  {
    category: 'sistema',
    question: 'Como sincronizar os dados entre vários computadores e celulares?',
    answer:
      'O ERP Smart Vidros possui sincronização nativa na nuvem com o banco de dados Supabase. Qualquer orçamento, cliente ou venda lançado em um dispositivo é transmitido instantaneamente para todos os outros aparelhos conectados.',
  },
  {
    category: 'sistema',
    question: 'Como funciona a Vitrine Pública de Catálogo para clientes?',
    answer:
      'Você pode compartilhar o link da Vitrine do Cliente via WhatsApp. O cliente poderá navegar pelos modelos de box, espelhos, portas e janelas com fotos e descrições, sem ter acesso à área administrativa da vidraçaria.',
  },
  {
    category: 'sistema',
    question: 'Como cadastrar e aprovar novos vendedores no sistema?',
    answer:
      'Novos vendedores podem se cadastrar na tela de login. O Administrador ou Super Admin receberá a solicitação no painel "Gestão de Usuários", onde poderá definir o papel, limite de desconto em porcentagem e aprovar o acesso.',
  },
];

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  isOpen,
  onClose,
  companyInfo,
  onStartTour,
  onOpenSmartIA,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'calculos' | 'contratos' | 'financeiro' | 'sistema'>('todos');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  if (!isOpen) return null;

  const filteredFaqs = FAQ_ITEMS.filter((faq) => {
    const matchesCat = selectedCategory === 'todos' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenWhatsApp = () => {
    const phoneClean = (companyInfo.whatsapp || companyInfo.phone || '89999910028').replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Olá! Estou usando o ERP Smart Vidros e gostaria de tirar uma dúvida sobre o sistema.`
    );
    window.open(`https://wa.me/55${phoneClean}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-950 border border-amber-500/30 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Topo da Central de Ajuda */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight flex items-center gap-2">
                <span>Central de Ajuda & Dúvidas</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Smart Vidros
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Tire dúvidas com a Smart IA, faça um tour guiado ou consulte o guia rápido
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          
          {/* CARDS PRINCIPAIS: SMART IA & TOUR DO SISTEMA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Card Smart IA */}
            <div className="bg-gradient-to-br from-amber-500/15 via-zinc-900 to-zinc-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                    IA Gratuita 24h
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white">Smart IA Assistente</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Converse com a inteligência artificial para calcular folgas, tirar dúvidas de fórmulas, normas e funções do sistema.
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenSmartIA();
                }}
                className="mt-4 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Perguntar ao Smart IA</span>
              </button>
            </div>

            {/* Card Tour Interativo */}
            <div className="bg-gradient-to-br from-indigo-500/15 via-zinc-900 to-zinc-900 border border-indigo-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold">
                    <Play className="w-5 h-5 ml-0.5" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                    Passo a Passo
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white">Tour do Sistema</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Faça um tour interativo guiado conhecendo todos os módulos: Orçamentos, PDV, Contratos, Caixa e Sincronização.
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onStartTour();
                }}
                className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Iniciar Tour Guiado</span>
              </button>
            </div>
          </div>

          {/* PERGUNTAS FREQUENTES (FAQ) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-sm font-extrabold text-white">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Perguntas Frequentes & Guia Rápido</span>
              </div>

              {/* Barra de Busca rápida */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar dúvida..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-white text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Filtros de Categoria */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'calculos', label: 'Cálculos & m²' },
                { id: 'contratos', label: 'Contratos & Recibos' },
                { id: 'financeiro', label: 'Caixa & Lançamentos' },
                { id: 'sistema', label: 'Sistema & Usuários' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Lista Acordeão de FAQ */}
            <div className="space-y-2 pt-1">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => {
                  const isExpanded = expandedFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-zinc-800/80 rounded-2xl bg-zinc-900/60 overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                        className="w-full text-left p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-white hover:text-amber-400 transition-colors"
                      >
                        <span className="leading-snug">{faq.question}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-amber-400' : ''
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="p-3.5 sm:p-4 pt-0 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/50 bg-zinc-950/40">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-zinc-500">
                  Nenhuma dúvida encontrada para "{searchQuery}". Experimente perguntar ao **Smart IA** acima!
                </div>
              )}
            </div>
          </div>

          {/* SUPORTE WHATSAPP DIRETO */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-white">Precisa de Suporte Humano?</p>
                <p className="text-[11px] text-emerald-300/80">
                  Fale diretamente com nossa equipe técnica pelo WhatsApp.
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenWhatsApp}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Chamar no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
