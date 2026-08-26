import React from 'react';
import { CompanyInfo } from '../types';
import { Sparkles, Shield } from 'lucide-react';

interface SmartVidrosLogoProps {
  companyInfo?: CompanyInfo;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light' | 'color';
  showSubtitle?: boolean;
  showIcon?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SmartVidrosLogo: React.FC<SmartVidrosLogoProps> = ({
  companyInfo,
  size = 'md',
  variant = 'dark',
  showSubtitle = false,
  showIcon = false,
  onClick,
  className = '',
}) => {
  const phone = companyInfo?.phone || '';
  const customName = companyInfo?.name;

  // Configuração de Tamanho do Texto Destacado
  const sizeMap = {
    sm: {
      titleMain: 'text-sm font-black',
      titleSub: 'text-xs font-extrabold',
      iconSize: 'w-4 h-4',
    },
    md: {
      titleMain: 'text-base sm:text-lg font-black',
      titleSub: 'text-sm sm:text-base font-extrabold',
      iconSize: 'w-5 h-5',
    },
    lg: {
      titleMain: 'text-xl sm:text-2xl font-black',
      titleSub: 'text-lg sm:text-xl font-extrabold',
      iconSize: 'w-6 h-6',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      onClick={onClick}
      translate="no"
      className={`group inline-flex items-center gap-2 select-none notranslate ${
        onClick ? 'cursor-pointer active:scale-95 transition-all duration-150' : ''
      } ${className}`}
      title={customName || 'Smart Vidros — Início'}
    >
      {showIcon && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 shrink-0">
          <Shield className="w-4 h-4 fill-slate-950 stroke-slate-950" />
        </div>
      )}

      <div className="leading-tight notranslate" translate="no">
        {customName && customName.toLowerCase() !== 'smart vidros' ? (
          <div className="flex items-baseline gap-1 notranslate" translate="no">
            <span
              translate="no"
              className={`tracking-tight drop-shadow-sm notranslate font-black ${
                variant === 'light' ? 'text-amber-600' : 'text-amber-400 group-hover:text-amber-300 transition-colors'
              } ${currentSize.titleMain}`}
            >
              {customName}
            </span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5 notranslate" translate="no">
            <span
              translate="no"
              className={`tracking-widest drop-shadow-sm notranslate ${currentSize.titleMain} ${
                variant === 'light' ? 'text-amber-600' : 'text-amber-400 group-hover:text-amber-300 transition-colors'
              }`}
            >
              SMART
            </span>
            <span
              translate="no"
              className={`tracking-wider notranslate ${currentSize.titleSub} ${
                variant === 'light' ? 'text-slate-900' : 'text-zinc-100 group-hover:text-white transition-colors'
              } uppercase`}
            >
              VIDROS
            </span>
          </div>
        )}

        {showSubtitle && (
          <p
            className={`text-[10px] tracking-wider uppercase font-semibold mt-0.5 ${
              variant === 'light' ? 'text-slate-500' : 'text-zinc-400'
            }`}
          >
            {phone || 'Vidraçaria & Esquadrias'}
          </p>
        )}
      </div>
    </div>
  );
};



