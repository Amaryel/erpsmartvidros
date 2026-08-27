import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Sparkles, HelpCircle, Layers, Ruler } from 'lucide-react';
import { CutRule, CutProductType } from '../../types';
import { CUT_PRODUCT_TYPES } from '../../utils/cutCalculationEngine';

interface CutRuleFormModalProps {
  isOpen: boolean;
  rule?: CutRule | null;
  onClose: () => void;
  onSave: (rule: CutRule) => void;
}

export const CutRuleFormModal: React.FC<CutRuleFormModalProps> = ({
  isOpen,
  rule,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [productType, setProductType] = useState<CutProductType>('box_banheiro');
  const [description, setDescription] = useState('');
  const [widthDiscount, setWidthDiscount] = useState<number | string>(0);
  const [heightDiscount, setHeightDiscount] = useState<number | string>(0);
  const [lateralGap, setLateralGap] = useState<number | string>(0);
  const [topGap, setTopGap] = useState<number | string>(0);
  const [bottomGap, setBottomGap] = useState<number | string>(0);
  const [piecesPerSpan, setPiecesPerSpan] = useState<number | string>(1);
  const [customFormulaDescription, setCustomFormulaDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rule) {
      setName(rule.name || '');
      setProductType(rule.productType || 'box_banheiro');
      setDescription(rule.description || '');
      setWidthDiscount(rule.widthDiscount ?? 0);
      setHeightDiscount(rule.heightDiscount ?? 0);
      setLateralGap(rule.lateralGap ?? 0);
      setTopGap(rule.topGap ?? 0);
      setBottomGap(rule.bottomGap ?? 0);
      setPiecesPerSpan(rule.piecesPerSpan ?? 1);
      setCustomFormulaDescription(rule.customFormulaDescription || '');
      setIsActive(rule.isActive !== false);
    } else {
      setName('');
      setProductType('box_banheiro');
      setDescription('');
      setWidthDiscount(0);
      setHeightDiscount(35);
      setLateralGap(5);
      setTopGap(0);
      setBottomGap(0);
      setPiecesPerSpan(2);
      setCustomFormulaDescription('');
      setIsActive(true);
    }
    setError(null);
  }, [rule, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Informe o nome da regra de corte.');
      return;
    }

    const numWidthDiscount = Math.max(0, Number(widthDiscount) || 0);
    const numHeightDiscount = Math.max(0, Number(heightDiscount) || 0);
    const numLateralGap = Math.max(0, Number(lateralGap) || 0);
    const numTopGap = Math.max(0, Number(topGap) || 0);
    const numBottomGap = Math.max(0, Number(bottomGap) || 0);
    const numPieces = Math.max(1, Math.round(Number(piecesPerSpan) || 1));

    const saved: CutRule = {
      id: rule?.id || '',
      name: name.trim(),
      productType,
      description: description.trim() || undefined,
      widthDiscount: numWidthDiscount,
      heightDiscount: numHeightDiscount,
      lateralGap: numLateralGap,
      topGap: numTopGap,
      bottomGap: numBottomGap,
      piecesPerSpan: numPieces,
      customFormulaDescription: customFormulaDescription.trim() || undefined,
      isActive,
      isDefault: rule?.isDefault || false,
      createdAt: rule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(saved);
  };

  const totalWidthDisc = (Number(widthDiscount) || 0) + ((Number(lateralGap) || 0) * 2);
  const totalHeightDisc = (Number(heightDiscount) || 0) + (Number(topGap) || 0) + (Number(bottomGap) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">
                {rule ? 'Editar Regra de Corte' : 'Nova Regra de Corte'}
              </h2>
              <p className="text-xs text-zinc-400">
                Defina os descontos, folgas e divisões de peças para este tipo de sistema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome da Regra */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Nome da Regra / Sistema <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Box Frontal F1 (1 Fixo + 1 Móvel 8mm)"
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            {/* Tipo de Produto */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Tipo de Produto / Sistema
              </label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value as CutProductType)}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              >
                {CUT_PRODUCT_TYPES.map((pt) => (
                  <option key={pt.type} value={pt.type}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Divisão de Folhas por Vão */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Peças / Folhas por Vão
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={piecesPerSpan}
                  onChange={(e) => setPiecesPerSpan(e.target.value)}
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
                <span className="text-xs text-zinc-400 whitespace-nowrap">folha(s)</span>
              </div>
            </div>
          </div>

          {/* Seção de Descontos e Folgas (mm) */}
          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" /> Descontos e Folgas de Instalação (em Milímetros - mm)
              </h3>
              <span className="text-xs text-zinc-500">1 cm = 10 mm</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                  Desc. Largura (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={widthDiscount}
                  onChange={(e) => setWidthDiscount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm text-center font-mono focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                  Folga Lateral (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={lateralGap}
                  onChange={(e) => setLateralGap(e.target.value)}
                  placeholder="0"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm text-center font-mono focus:border-amber-500"
                />
                <span className="text-[10px] text-zinc-500 block text-center mt-0.5">(2x lados)</span>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                  Desc. Altura (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={heightDiscount}
                  onChange={(e) => setHeightDiscount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm text-center font-mono focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                  Folga Sup. (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={topGap}
                  onChange={(e) => setTopGap(e.target.value)}
                  placeholder="0"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm text-center font-mono focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                  Folga Inf. (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={bottomGap}
                  onChange={(e) => setBottomGap(e.target.value)}
                  placeholder="0"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm text-center font-mono focus:border-amber-500"
                />
              </div>
            </div>

            {/* Resumo do Desconto Total */}
            <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2">
              <div>
                Desconto Total na Largura: <strong className="text-amber-400 font-mono">{totalWidthDisc} mm</strong>
              </div>
              <div>
                Desconto Total na Altura: <strong className="text-amber-400 font-mono">{totalHeightDisc} mm</strong>
              </div>
            </div>
          </div>

          {/* Descrição / Notas da Regra */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Descrição Técnica / Especificação
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Utilizado para vidro temperado 8mm incolor com ferragens padrão ou trilho al-100."
                rows={3}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-2 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Fórmula Explicativa (Opcional)
              </label>
              <textarea
                value={customFormulaDescription}
                onChange={(e) => setCustomFormulaDescription(e.target.value)}
                placeholder="Ex: Largura = (Vão - 10) / 2 | Altura = Vão - 35mm"
                rows={3}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-2 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Status Ativo */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-zinc-800 border-zinc-700"
            />
            <label htmlFor="isActiveCheck" className="text-sm font-medium text-zinc-200 cursor-pointer">
              Regra ativa e disponível na calculadora
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-colors"
            >
              <Save className="w-4 h-4" />
              Salvar Regra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
