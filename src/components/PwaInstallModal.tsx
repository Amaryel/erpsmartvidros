import React from 'react';
import {
  Download,
  X,
  Smartphone,
  Tablet,
  Monitor,
  CheckCircle2,
  Share2,
  PlusSquare,
  Sparkles,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  onInstall: () => Promise<boolean>;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isInstalled,
  isIOS,
  onInstall,
}) => {
  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await onInstall();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Top Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-sky-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-full border border-slate-700/60 transition-all z-10"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Header com Ícone Personalizado da Aplicação */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10 overflow-hidden p-1.5">
                <img
                  src="/icons/icon.svg"
                  alt="Ícone ERP Smart Vidros"
                  className="w-full h-full object-contain rounded-xl drop-shadow-md"
                  onError={(e) => {
                    // Fallback se SVG não carregar
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-md uppercase">
                PWA
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Aplicativo Oficial</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Instalar ERP Smart Vidros
              </h2>
              <p className="text-xs text-slate-400">
                Instale no seu Celular, Tablet ou Computador para abrir em tela cheia como um aplicativo nativo.
              </p>
            </div>
          </div>

          {/* Se já estiver instalado */}
          {isInstalled ? (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-center gap-3.5">
              <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-emerald-300 text-sm">Aplicativo já Instalado!</h4>
                <p className="text-xs text-emerald-200/80">
                  Você já está utilizando a versão PWA instalada em seu dispositivo com desempenho otimizado.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Benefícios do PWA */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 flex flex-col gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Tela Cheia (App)</h4>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Abre sem barras do navegador, exatamente como um app da App Store / Play Store.
                  </p>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 flex flex-col gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Acesso Rápido</h4>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Ícone personalizado na tela inicial do seu celular e tablet para abrir com 1 toque.
                  </p>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 flex flex-col gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Offline & Ágil</h4>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Carregamento instantâneo e dados sincronizados em tempo real na nuvem.
                  </p>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 flex flex-col gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Zero Espaço</h4>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Super leve, não consome memória do aparelho e sempre atualizado.
                  </p>
                </div>
              </div>

              {/* Instruções para iOS (iPhone / iPad) */}
              {isIOS ? (
                <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Tablet className="w-4 h-4" />
                    <span>Como instalar no iPhone ou iPad (Safari):</span>
                  </div>

                  <ol className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                        1
                      </div>
                      <div className="leading-snug">
                        Toque no botão <strong className="text-white inline-flex items-center gap-1 bg-slate-700 px-1.5 py-0.5 rounded"><Share2 className="w-3 h-3 text-sky-400" /> Compartilhar</strong> na barra do Safari (no rodapé ou topo).
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                        2
                      </div>
                      <div className="leading-snug">
                        Role as opções para baixo e toque em <strong className="text-amber-300 inline-flex items-center gap-1 bg-slate-700 px-1.5 py-0.5 rounded"><PlusSquare className="w-3 h-3 text-amber-400" /> Adicionar à Tela de Início</strong>.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                        3
                      </div>
                      <div className="leading-snug">
                        Toque em <strong className="text-white">"Adicionar"</strong> no canto superior direito. Pronto! O ícone dourado do Smart Vidros aparecerá na sua tela.
                      </div>
                    </li>
                  </ol>
                </div>
              ) : (
                <>
                  {/* Botão de Instalação Automática 1-Clique para Android / Chrome / Edge */}
                  {isInstallable ? (
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2.5"
                    >
                      <Download className="w-5 h-5 stroke-[2.5]" />
                      <span>Instalar Agora no Aparelho</span>
                    </button>
                  ) : (
                    <div className="p-4 bg-slate-800/80 border border-slate-700/60 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                        <Smartphone className="w-4 h-4 text-amber-400" />
                        <span>Instalação Manual no Android / Navegador:</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Toque no menu do navegador (os <strong>3 pontinhos ⋮</strong> no canto superior direito) e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Footer Informativo */}
          <div className="pt-2 text-center text-[11px] text-slate-500">
            ERP Smart Vidros • Compatível com Android, iOS (iPhone/iPad), Windows e Mac
          </div>
        </div>
      </div>
    </div>
  );
};
