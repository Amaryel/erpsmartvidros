import React, { useState } from 'react';
import { Plus, X, Check, Edit2, Sliders, ChevronDown } from 'lucide-react';

interface TechnicalFieldSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  presets: string[];
  placeholder?: string;
  emptyLabel?: string;
  compact?: boolean;
  className?: string;
}

export const TechnicalFieldSelect: React.FC<TechnicalFieldSelectProps> = ({
  label,
  value,
  onChange,
  presets,
  placeholder = 'Selecione ou digite...',
  emptyLabel = '🚫 Vazio (Sem complemento)',
  compact = false,
  className = '',
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState(value || '');

  // Verifica se o valor atual é vazio
  const isEmpty = !value || value.trim() === '' || value.toLowerCase() === 'vazio' || value.toLowerCase() === 'nenhum';

  // Verifica se o valor atual é um dos presets existentes
  const isExistingPreset = presets.some(
    (p) => p.toLowerCase().trim() === (value || '').toLowerCase().trim()
  );

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === '__CUSTOM__') {
      setIsCustomMode(true);
      setCustomInput(value || '');
    } else if (selected === '__EMPTY__') {
      setIsCustomMode(false);
      onChange('');
    } else {
      setIsCustomMode(false);
      onChange(selected);
    }
  };

  const handleSaveCustom = () => {
    const trimmed = customInput.trim();
    onChange(trimmed);
    setIsCustomMode(false);
  };

  const handleClear = () => {
    onChange('');
    setCustomInput('');
    setIsCustomMode(false);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-tight truncate">
          {label}
        </label>
        {!isCustomMode && (
          <div className="flex items-center gap-1">
            {!isEmpty && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] text-slate-400 hover:text-rose-600 font-semibold transition-colors flex items-center gap-0.5"
                title="Deixar vazio / sem complemento"
              >
                <X className="w-2.5 h-2.5" />
                <span>Vazio</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(true);
                setCustomInput(value || '');
              }}
              className="text-[10px] text-amber-600 hover:text-amber-700 font-bold transition-colors flex items-center gap-0.5 ml-1"
              title="Digitar valor personalizado"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>Novo</span>
            </button>
          </div>
        )}
      </div>

      {isCustomMode ? (
        <div className="flex items-center gap-1">
          <input
            type="text"
            autoFocus
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveCustom();
              } else if (e.key === 'Escape') {
                setIsCustomMode(false);
              }
            }}
            placeholder={placeholder}
            className="w-full bg-amber-50/70 border border-amber-400 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="button"
            onClick={handleSaveCustom}
            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
            title="Salvar este tipo"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsCustomMode(false)}
            className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs transition-colors shrink-0"
            title="Voltar para opções"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <select
            value={isEmpty ? '__EMPTY__' : isExistingPreset ? value : '__CUSTOM_ACTIVE__'}
            onChange={handleSelectChange}
            className={`w-full appearance-none border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-amber-500 pr-7 transition-colors ${
              isEmpty
                ? 'bg-slate-100/80 border-dashed border-slate-300 text-slate-400 italic'
                : !isExistingPreset
                ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="__EMPTY__" className="text-slate-400 italic font-normal">
              {emptyLabel}
            </option>
            
            <optgroup label="Opções Padrão">
              {presets.map((preset) => (
                <option key={preset} value={preset} className="text-slate-900 font-semibold">
                  {preset}
                </option>
              ))}
            </optgroup>

            {!isEmpty && !isExistingPreset && (
              <optgroup label="Personalizado Salvo neste Produto">
                <option value="__CUSTOM_ACTIVE__" className="font-bold text-amber-800">
                  ⭐ {value} (Personalizado)
                </option>
              </optgroup>
            )}

            <optgroup label="Novo Cadastro">
              <option value="__CUSTOM__" className="font-bold text-amber-700 bg-amber-50">
                ✨ + Cadastrar novo tipo / Digitar outro...
              </option>
            </optgroup>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      )}
    </div>
  );
};
