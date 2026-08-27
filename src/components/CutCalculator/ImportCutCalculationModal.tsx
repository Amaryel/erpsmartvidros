import React, { useState } from 'react';
import { X, Search, Scissors, Check, Plus, Ruler, Layers } from 'lucide-react';
import { CutCalculation, QuoteItem } from '../../types';
import { getCutCalculations } from '../../services/storage';

interface ImportCutCalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCalculation: (calc: CutCalculation) => void;
}

export const ImportCutCalculationModal: React.FC<ImportCutCalculationModalProps> = ({
  isOpen,
  onClose,
  onSelectCalculation,
}) => {
  const [search, setSearch] = useState('');
  const calculations = getCutCalculations();

  if (!isOpen) return null;

  const filtered = calculations.filter((c) => {
    return (
      !search ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.clientName && c.clientName.toLowerCase().includes(search.toLowerCase())) ||
      (c.projectName && c.projectName.toLowerCase().includes(search.toLowerCase())) ||
      c.ruleName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">
                Importar Medida de Corte para o Orçamento
              </h2>
              <p className="text-xs text-zinc-400">
                Selecione um cálculo salvo para inserir as medidas, área e especificações técnicas
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

        {/* Busca */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código (ex: CORTE-0001), cliente ou obra..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Lista */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 space-y-2">
              <Scissors className="w-8 h-8 mx-auto text-zinc-600" />
              <p className="text-sm font-medium text-zinc-400">Nenhum cálculo de corte encontrado</p>
              <p className="text-xs text-zinc-500">Crie cálculos na aba "Medidas de Corte" para poder importá-los aqui.</p>
            </div>
          ) : (
            filtered.map((calc) => (
              <div
                key={calc.id}
                onClick={() => {
                  onSelectCalculation(calc);
                  onClose();
                }}
                className="p-4 bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 rounded-xl cursor-pointer transition-all hover:shadow-lg flex items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono font-bold text-xs">
                      {calc.code}
                    </span>
                    <span className="text-xs font-bold text-zinc-200">
                      {calc.clientName || 'Cliente Balcão'}
                    </span>
                    {calc.projectName && (
                      <span className="text-xs text-amber-400 font-medium">({calc.projectName})</span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400">
                    Sistema: <strong className="text-zinc-300">{calc.ruleName}</strong>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 font-mono pt-1">
                    <span>Vão: {calc.spanWidthMm}x{calc.spanHeightMm}mm</span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">Corte: {calc.cutWidthMm}x{calc.cutHeightMm}mm ({calc.totalPieces} pcs)</span>
                    <span>•</span>
                    <span>Área: {calc.totalAreaM2.toFixed(3)} m²</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3.5 py-2 bg-amber-500/10 group-hover:bg-amber-500 group-hover:text-zinc-950 text-amber-400 font-bold text-xs rounded-xl border border-amber-500/30 transition-all flex items-center gap-1 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" /> Selecionar
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
