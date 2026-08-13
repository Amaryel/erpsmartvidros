import React from 'react';
import { CompanyInfo } from '../types';

interface SmartVidrosLogoProps {
  companyInfo?: CompanyInfo;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light' | 'color';
  showSubtitle?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SmartVidrosLogo: React.FC<SmartVidrosLogoProps> = ({
  companyInfo,
  size = 'md',
  variant = 'dark',
  showSubtitle = false,
  onClick,
  className = '',
}) => {
  const phone = companyInfo?.phone || '';

  // Configuração de Tamanho do Texto Destacado
  const sizeMap = {
    sm: {
      titleMain: 'text-base font-black',
      titleSub: 'text-sm font-extrabold',
    },
    md: {
      titleMain: 'text-lg sm:text-xl font-black',
      titleSub: 'text-base sm:text-lg font-extrabold',
    },
    lg: {
      titleMain: 'text-2xl sm:text-3xl font-black',
      titleSub: 'text-xl sm:text-2xl font-extrabold',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`group flex items-center select-none ${
        onClick ? 'cursor-pointer active:scale-95 transition-all duration-150' : ''
      } ${className}`}
      title="Início — Smart Vidros"
    >
      <div className="leading-none">
        <div className="flex items-baseline gap-1.5">
          <span
            className={`tracking-widest drop-shadow-sm ${currentSize.titleMain} ${
              variant === 'light' ? 'text-amber-600' : 'text-amber-400 group-hover:text-amber-300 transition-colors'
            }`}
          >
            SMART
          </span>
          <span
            className={`tracking-wider ${currentSize.titleSub} ${
              variant === 'light' ? 'text-slate-900' : 'text-zinc-100 group-hover:text-white transition-colors'
            } uppercase`}
          >
            VIDROS
          </span>
        </div>
        {showSubtitle && phone && (
          <p
            className={`text-[10px] tracking-wider uppercase font-semibold mt-0.5 ${
              variant === 'light' ? 'text-slate-500' : 'text-zinc-400'
            }`}
          >
            {phone}
          </p>
        )}
      </div>
    </div>
  );
};


