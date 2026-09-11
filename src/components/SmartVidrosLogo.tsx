import React, { useState } from 'react';
import { CompanyInfo } from '../types';
import officialLogoImg from '../assets/images/smart_vidros_badge_icon_1789127056541.jpg';

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
  onClick,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const logoSrc = companyInfo?.logoUrl || officialLogoImg || '/logo.png';
  const phone = companyInfo?.phone || '';
  const customName = companyInfo?.name || 'Smart Vidros';

  // Configurações de dimensão da imagem do Emblema / Ícone (1:1 aspect ratio)
  const sizeStyles = {
    sm: { size: '36px', class: 'h-9 w-9' },
    md: { size: '44px', class: 'h-11 w-11' },
    lg: { size: '54px', class: 'h-14 w-14' },
  };

  return (
    <div
      onClick={onClick}
      translate="no"
      className={`group inline-flex items-center gap-2.5 select-none notranslate ${
        onClick ? 'cursor-pointer active:scale-95 transition-all duration-150' : ''
      } ${className}`}
      title={customName ? `${customName} — Início` : 'Smart Vidros — Início'}
    >
      {!imgError ? (
        <img
          src={logoSrc}
          alt={customName}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          style={{
            height: sizeStyles[size].size,
            maxHeight: sizeStyles[size].size,
            width: sizeStyles[size].size,
            maxWidth: sizeStyles[size].size,
            objectFit: 'contain',
            display: 'inline-block',
          }}
          className={`${sizeStyles[size].class} object-contain rounded-xl drop-shadow-md border border-amber-500/30 transition-transform group-hover:scale-105 shrink-0`}
        />
      ) : (
        <div className="leading-tight notranslate" translate="no">
          <div className="flex items-baseline gap-1.5 notranslate" translate="no">
            <span
              translate="no"
              className={`tracking-widest drop-shadow-sm notranslate font-black text-amber-500`}
            >
              SMART
            </span>
            <span
              translate="no"
              className={`tracking-wider notranslate font-bold ${
                variant === 'light' ? 'text-slate-900' : 'text-zinc-100'
              } uppercase`}
            >
              VIDROS
            </span>
          </div>
        </div>
      )}

      {/* Identificação textual complementar quando desejado */}
      <div className="hidden sm:flex flex-col notranslate" translate="no">
        <div className="flex items-baseline gap-1">
          <span className="font-black tracking-wider text-amber-500 text-sm drop-shadow-xs">SMART</span>
          <span className={`font-bold tracking-wide text-xs uppercase ${variant === 'light' ? 'text-slate-900' : 'text-white'}`}>VIDROS</span>
        </div>
        {showSubtitle && phone && (
          <span className={`text-[10px] tracking-wider uppercase font-medium ${variant === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>
            {phone}
          </span>
        )}
      </div>
    </div>
  );
};



