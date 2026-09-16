import React, { useState } from 'react';
import { CompanyInfo } from '../types';
import SMART_VIDROS_OFFICIAL_LOGO_BASE64 from '../assets/logoBase64';

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
  const rawLogo = companyInfo?.logoUrl;
  const logoSrc =
    rawLogo &&
    !rawLogo.includes('178') &&
    !rawLogo.includes('badge') &&
    !rawLogo.endsWith('.jpg') &&
    !rawLogo.includes('.svg')
      ? rawLogo
      : SMART_VIDROS_OFFICIAL_LOGO_BASE64;
  const phone = companyInfo?.phone || '';
  const customName = companyInfo?.name || 'Smart Vidros';

  // Configurações de dimensão da logo horizontal proporcional
  const sizeStyles = {
    sm: { height: '32px', maxWidth: '140px', class: 'h-8 w-auto' },
    md: { height: '40px', maxWidth: '180px', class: 'h-10 w-auto' },
    lg: { height: '52px', maxWidth: '220px', class: 'h-13 w-auto' },
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
            height: sizeStyles[size].height,
            maxHeight: sizeStyles[size].height,
            width: 'auto',
            maxWidth: sizeStyles[size].maxWidth,
            objectFit: 'contain',
            display: 'inline-block',
          }}
          className={`${sizeStyles[size].class} object-contain transition-transform group-hover:scale-105 shrink-0`}
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
      {showSubtitle && phone && (
        <div className="hidden sm:flex flex-col notranslate" translate="no">
          <span className={`text-[10px] tracking-wider uppercase font-medium ${variant === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>
            {phone}
          </span>
        </div>
      )}
    </div>
  );
};




