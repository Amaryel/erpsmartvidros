import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  ShoppingBag,
  Scroll,
  Wallet,
  Bot,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SmartVidrosLogo } from './SmartVidrosLogo';
import { CompanyInfo } from '../types';

interface SystemTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyInfo: CompanyInfo;
  onNavigateToTab?: (tab: any) => void;
  onOpenSmartIA?: () => void;
}

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao ERP Smart Vidros',
    badge: 'Visão Geral & Nuvem',
    icon: Sparkles,
    color: 'from-amber-500 to-amber-300 text-amber-400 bg-amber-500/10 border-amber-500/30',
    description:
      'Seu sistema completo para gestão de vidraçaria, esquadrias, orçamentos rápidos, contratos com assinatura na tela e controle financeiro total.',
    highlights: [
      '⚡ Sincronização em tempo real na nuvem via Supabase em todos os dispositivos',
      '📱 100% responsivo para celular, tablet, notebook e computadores',
      '🔒 Segurança multicontas com controle rigoroso de permissões e descontos',
      '🤖 Assistente Smart IA gratuito 24h para cálculos e dúvidas do dia a dia',
    ],
    targetTab: 'dashboard',
  },
  {
    id: 'dashboard',
    title: 'Painel de Controle & Dashboard',
    badge: 'Gestão em Tempo Real',
    icon: LayoutDashboard,
    color: 'from-blue-500 to-cyan-400 text-blue-400 bg-blue-500/10 border-blue-500/30',
    description:
      'Acompanhe a saúde financeira da sua vidraçaria em uma única tela: faturamento mensal, orçamentos pendentes, vendas concluídas e fluxo de recebimentos.',
    highlights: [
      '📊 Gráficos de vendas e faturamento consolidado por período',
      '🎯 Lista de orçamentos pendentes para acompanhamento e fechamento com clientes',
      '💰 Resumo de contas a receber e alertas de vencimento',
      '🚀 Acessos rápidos para novo orçamento, PDV e abertura de caixa',
    ],
    targetTab: 'dashboard',
  },
  {
    id: 'quotes_pdv',
    title: 'Orçamentos Inteligentes & PDV',
    badge: 'Cálculo Automático de Vidros',
    icon: ShoppingBag,
    color: 'from-emerald-500 to-teal-400 text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description:
      'Crie orçamentos em segundos com cálculo automático de metros quadrados (m²), vidros temperados, laminados, kits de ferragens, mão de obra e descontos.',
    highlights: [
      '📐 Cálculo exato de m² (L x A) com aplicação automática da tabela de preços',
      '🛍️ Ponto de Venda (PDV) para fechamento rápido de balcão e emissão imediata',
      '📄 Exportação para PDF A4 profissional e compartilhamento direto via WhatsApp',
      '🛒 Vitrine Pública Online para seus clientes visualizarem seu catálogo sem login',
    ],
    targetTab: 'quotes',
  },
  {
    id: 'contracts_receipts',
    title: 'Contratos Jurídicos & Recibos A4',
    badge: 'Assinatura Digital na Tela',
    icon: Scroll,
    color: 'from-indigo-500 to-purple-400 text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    description:
      'Proteja sua empresa com contratos jurídicos completos com normas ABNT, prazos de entrega, garantia e assinatura digital direta na tela do celular ou computador.',
    highlights: [
      '✍️ Assinatura digital na tela pelo cliente e vidraceiro responsável',
      '📄 Geração automática de Recibos de Pagamento com numeração sequencial',
      '🖨️ Layout oficial A4 para impressão ou envio de PDF com alta definição',
      '🛡️ Cláusulas contratuais customizáveis com dados da sua empresa',
    ],
    targetTab: 'contracts',
  },
  {
    id: 'finance_cash',
    title: 'Caixa Diário & Contas a Receber',
    badge: 'Lançamento por Áudio',
    icon: Wallet,
    color: 'from-rose-500 to-amber-400 text-rose-400 bg-rose-500/10 border-rose-500/30',
    description:
      'Controle total das entradas, saídas, sangrias, suprimentos e parcelamentos a receber com a inovadora tecnologia de lançamento por voz.',
    highlights: [
      '🎙️ Lançamento de despesas e receitas por comando de voz/áudio',
      '💼 Controle de sessões de caixa com conferência cega e fechamento detalhado',
      '🗓️ Contas a receber parceladas com baixa parcial e comprovante',
      '📈 Relatórios analíticos de vendas por vendedor e por forma de pagamento',
    ],
    targetTab: 'cash',
  },
  {
    id: 'smart_ia',
    title: 'Smart IA: Assistente Virtual Gratuito',
    badge: 'Inteligência Artificial 24h',
    icon: Bot,
    color: 'from-amber-500 to-yellow-400 text-amber-400 bg-amber-500/10 border-amber-500/30',
    description:
      'Sua vidraçaria agora conta com um assistente inteligente integrado para tirar dúvidas técnicas, calcular folgas de temperados e orientar sua equipe.',
    highlights: [
      '💬 Tire dúvidas sobre fórmulas de cálculo de vidro temperado e laminado',
      '🛠️ Orientações sobre normas técnicas ABNT (NBR 14207 para Box, NBR 7199)',
      '💡 Ajuda passo a passo sobre qualquer função ou relatório do ERP',
      '⚡ Acesso instantâneo a qualquer hora pelo botão "Smart IA" no topo do sistema',
    ],
    targetTab: 'dashboard',
  },
];

export const SystemTourModal: React.FC<SystemTourModalProps> = ({
  isOpen,
  onClose,
  companyInfo,
  onNavigateToTab,
  onOpenSmartIA,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const StepIcon = currentStep.icon;

  const handleFinish = () => {
    if (dontShowAgain) {
      localStorage.setItem('smart_vidros_tour_completed', 'true');
    }
    onClose();
  };

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      if (onNavigateToTab && TOUR_STEPS[nextIdx].targetTab) {
        onNavigateToTab(TOUR_STEPS[nextIdx].targetTab);
      }
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      if (onNavigateToTab && TOUR_STEPS[prevIdx].targetTab) {
        onNavigateToTab(TOUR_STEPS[prevIdx].targetTab);
      }
    }
  };

  const handleOpenIAFromTour = () => {
    handleFinish();
    if (onOpenSmartIA) {
      setTimeout(() => onOpenSmartIA(), 150);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-950 border border-amber-500/40 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all">
        
        {/* Topo do Modal: Barra de Progresso e Fechar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <SmartVidrosLogo companyInfo={companyInfo} size="sm" variant="dark" showSubtitle={false} />
            <div className="hidden sm:block h-5 w-[1px] bg-zinc-800" />
            <span className="hidden sm:inline text-xs font-bold text-zinc-400">
              Tour Interativo de Recursos
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
              Passo {currentStepIndex + 1} de {TOUR_STEPS.length}
            </span>
            <button
              onClick={handleFinish}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors"
              title="Pular tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Progresso Visual */}
        <div className="w-full bg-zinc-900 h-1.5 shrink-0">
          <div
            className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Conteúdo do Passo Atual */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          
          {/* Cabeçalho do Passo */}
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-0.5 bg-gradient-to-tr shrink-0 shadow-lg ${currentStep.color}`}>
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <StepIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1 bg-zinc-900 text-amber-400 border border-zinc-800">
                <span>{currentStep.badge}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                {currentStep.title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Destaques do Módulo */}
          <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Principais Vantagens & Funcionalidades:</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {currentStep.highlights.map((highlight, hIdx) => (
                <div
                  key={hIdx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-200 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/60"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Botão de Destaque Especial para o Smart IA no Último Passo */}
          {isLastStep && onOpenSmartIA && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-white">Experimente Agora</p>
                  <p className="text-[11px] text-zinc-400">Abra o chat do Smart IA e faça sua primeira pergunta!</p>
                </div>
              </div>
              <button
                onClick={handleOpenIAFromTour}
                className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all whitespace-nowrap active:scale-95"
              >
                Abrir Smart IA ✨
              </button>
            </div>
          )}

          {/* Seletor de Passos (Bolinhas) */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {TOUR_STEPS.map((step, sIdx) => (
              <button
                key={step.id}
                onClick={() => {
                  setCurrentStepIndex(sIdx);
                  if (onNavigateToTab && step.targetTab) {
                    onNavigateToTab(step.targetTab);
                  }
                }}
                className={`transition-all rounded-full ${
                  sIdx === currentStepIndex
                    ? 'w-8 h-2 bg-amber-500'
                    : 'w-2 h-2 bg-zinc-800 hover:bg-zinc-700'
                }`}
                title={`Ir para ${step.title}`}
              />
            ))}
          </div>
        </div>

        {/* Rodapé de Ações do Tour */}
        <div className="p-4 sm:p-5 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none hover:text-zinc-200 transition-colors">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-amber-500"
            />
            <span>Não mostrar novamente neste dispositivo</span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all w-full sm:w-auto justify-center"
            >
              <span>{isLastStep ? 'Concluir Tour' : 'Próximo'}</span>
              {isLastStep ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
