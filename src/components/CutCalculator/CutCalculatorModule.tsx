import React, { useState, useEffect, useMemo } from 'react';
import {
  Scissors,
  Ruler,
  Layers,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  User,
  Building,
  DollarSign,
  Maximize2,
  Check,
  ChevronRight,
  Sliders,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import {
  CutProductType,
  CutRule,
  CutCalculation,
  CompanyInfo,
  AppUser,
  Client,
  Quote
} from '../../types';
import {
  CUT_PRODUCT_TYPES,
  calculateCutDimensions,
  CalculationResult
} from '../../utils/cutCalculationEngine';
import {
  getCutRules,
  saveCutRule,
  deleteCutRule,
  duplicateCutRule,
  resetDefaultCutRules,
  getCutCalculations,
  saveCutCalculation,
  deleteCutCalculation,
  duplicateCutCalculation,
  getClients
} from '../../services/storage';
import { CutRuleFormModal } from './CutRuleFormModal';
import { CutCalculationPdfModal } from './CutCalculationPdfModal';

interface CutCalculatorModuleProps {
  currentUser?: AppUser | null;
  companyInfo: CompanyInfo;
  onSendToQuote?: (calculation: CutCalculation) => void;
  onShowToast?: (msg: string) => void;
}

export const CutCalculatorModule: React.FC<CutCalculatorModuleProps> = ({
  currentUser,
  companyInfo,
  onSendToQuote,
  onShowToast,
}) => {
  // Tabs: 'calculator' | 'history' | 'rules'
  const [activeSubTab, setActiveSubTab] = useState<'calculator' | 'history' | 'rules'>('calculator');

  // Estados das Regras e Cálculos
  const [rules, setRules] = useState<CutRule[]>([]);
  const [calculations, setCalculations] = useState<CutCalculation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Estados da Calculadora Ativa
  const [selectedProductType, setSelectedProductType] = useState<CutProductType>('box_banheiro');
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [spanWidthMm, setSpanWidthMm] = useState<number | string>('');
  const [spanHeightMm, setSpanHeightMm] = useState<number | string>('');
  const [spanQuantity, setSpanQuantity] = useState<number | string>(1);
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [pricePerM2, setPricePerM2] = useState<number | string>('');
  const [notes, setNotes] = useState<string>('');

  // Modais
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CutRule | null>(null);
  const [viewingPdfCalc, setViewingPdfCalc] = useState<CutCalculation | null>(null);
  const [savedLastCalculation, setSavedLastCalculation] = useState<CutCalculation | null>(null);

  // Filtros de Histórico e Regras
  const [historySearch, setHistorySearch] = useState('');
  const [historyProductFilter, setHistoryProductFilter] = useState<string>('all');
  const [rulesProductFilter, setRulesProductFilter] = useState<string>('all');

  // Carregar dados iniciais
  const refreshAll = () => {
    const loadedRules = getCutRules();
    setRules(loadedRules);
    setCalculations(getCutCalculations());
    setClients(getClients());

    // Se nenhuma regra estiver selecionada ou a regra atual não pertencer ao tipo de produto, selecionar a primeira
    if (loadedRules.length > 0 && !selectedRuleId) {
      const match = loadedRules.find((r) => r.productType === selectedProductType && r.isActive) || loadedRules[0];
      if (match) setSelectedRuleId(match.id);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Quando trocar o tipo de produto, selecionar a primeira regra ativa daquele tipo
  const handleSelectProductType = (type: CutProductType) => {
    setSelectedProductType(type);
    const match = rules.find((r) => r.productType === type && r.isActive);
    if (match) {
      setSelectedRuleId(match.id);
    }
  };

  // Regra atual selecionada
  const activeRule = useMemo(() => {
    return rules.find((r) => r.id === selectedRuleId) || rules.find((r) => r.productType === selectedProductType) || rules[0];
  }, [rules, selectedRuleId, selectedProductType]);

  // Executar motor central de cálculo
  const calculationResult: CalculationResult = useMemo(() => {
    if (!activeRule) {
      return {
        isValid: false,
        errorMessage: 'Nenhuma regra de cálculo selecionada.',
        spanWidthMm: Number(spanWidthMm) || 0,
        spanHeightMm: Number(spanHeightMm) || 0,
        spanQuantity: Number(spanQuantity) || 1,
        cutWidthMm: 0,
        cutHeightMm: 0,
        piecesPerSpan: 1,
        totalPieces: 1,
        totalWidthDiscount: 0,
        totalHeightDiscount: 0,
        lateralGap: 0,
        topGap: 0,
        bottomGap: 0,
        singlePieceAreaM2: 0,
        totalAreaM2: 0,
        formulaDescription: '',
        stepByStepWidth: '',
        stepByStepHeight: '',
      };
    }

    return calculateCutDimensions({
      spanWidthMm: Number(spanWidthMm) || 0,
      spanHeightMm: Number(spanHeightMm) || 0,
      spanQuantity: Math.max(1, Number(spanQuantity) || 1),
      rule: activeRule,
      pricePerM2: pricePerM2 ? Number(pricePerM2) : undefined,
    });
  }, [spanWidthMm, spanHeightMm, spanQuantity, activeRule, pricePerM2]);

  // Salvar Cálculo na Memória
  const handleSaveCalculation = () => {
    if (!calculationResult.isValid || !activeRule) {
      onShowToast?.(calculationResult.errorMessage || 'Preencha medidas válidas antes de salvar.');
      return;
    }

    const newCalc: CutCalculation = {
      id: '',
      code: '',
      companyId: companyInfo.cnpj,
      userId: currentUser?.id,
      userName: currentUser?.name,
      clientId: undefined,
      clientName: clientName.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      projectName: projectName.trim() || undefined,
      productType: selectedProductType,
      ruleId: activeRule.id,
      ruleName: activeRule.name,
      spanWidthMm: calculationResult.spanWidthMm,
      spanHeightMm: calculationResult.spanHeightMm,
      spanQuantity: calculationResult.spanQuantity,
      widthDiscount: activeRule.widthDiscount,
      heightDiscount: activeRule.heightDiscount,
      lateralGap: activeRule.lateralGap,
      topGap: activeRule.topGap,
      bottomGap: activeRule.bottomGap,
      piecesPerSpan: calculationResult.piecesPerSpan,
      cutWidthMm: calculationResult.cutWidthMm,
      cutHeightMm: calculationResult.cutHeightMm,
      totalPieces: calculationResult.totalPieces,
      singlePieceAreaM2: calculationResult.singlePieceAreaM2,
      totalAreaM2: calculationResult.totalAreaM2,
      pricePerM2: calculationResult.pricePerM2,
      totalPrice: calculationResult.totalPrice,
      formulaUsed: calculationResult.formulaDescription,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = saveCutCalculation(newCalc);
    setSavedLastCalculation(saved);
    refreshAll();
    onShowToast?.(`Cálculo [${saved.code}] salvo com sucesso na memória!`);
  };

  // Gerar e Visualizar PDF
  const handleOpenPdf = () => {
    if (!calculationResult.isValid || !activeRule) {
      onShowToast?.('Preencha as medidas do vão para gerar a ficha técnica.');
      return;
    }

    const tempCalc: CutCalculation = savedLastCalculation || {
      id: 'temp-' + Date.now(),
      code: 'PREVIA',
      companyId: companyInfo.cnpj,
      userId: currentUser?.id,
      userName: currentUser?.name,
      clientName: clientName.trim() || 'Cliente Balcão',
      clientPhone: clientPhone.trim() || '',
      projectName: projectName.trim() || 'Obra Padrão',
      productType: selectedProductType,
      ruleId: activeRule.id,
      ruleName: activeRule.name,
      spanWidthMm: calculationResult.spanWidthMm,
      spanHeightMm: calculationResult.spanHeightMm,
      spanQuantity: calculationResult.spanQuantity,
      widthDiscount: activeRule.widthDiscount,
      heightDiscount: activeRule.heightDiscount,
      lateralGap: activeRule.lateralGap,
      topGap: activeRule.topGap,
      bottomGap: activeRule.bottomGap,
      piecesPerSpan: calculationResult.piecesPerSpan,
      cutWidthMm: calculationResult.cutWidthMm,
      cutHeightMm: calculationResult.cutHeightMm,
      totalPieces: calculationResult.totalPieces,
      singlePieceAreaM2: calculationResult.singlePieceAreaM2,
      totalAreaM2: calculationResult.totalAreaM2,
      pricePerM2: calculationResult.pricePerM2,
      totalPrice: calculationResult.totalPrice,
      formulaUsed: calculationResult.formulaDescription,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setViewingPdfCalc(tempCalc);
  };

  // Limpar Campos
  const handleClear = () => {
    setSpanWidthMm('');
    setSpanHeightMm('');
    setSpanQuantity(1);
    setClientName('');
    setClientPhone('');
    setProjectName('');
    setPricePerM2('');
    setNotes('');
    setSavedLastCalculation(null);
    onShowToast?.('Calculadora limpa.');
  };

  // Carregar Cálculo do Histórico na Calculadora
  const handleLoadCalculation = (calc: CutCalculation) => {
    setSelectedProductType(calc.productType);
    setSelectedRuleId(calc.ruleId || '');
    setSpanWidthMm(calc.spanWidthMm);
    setSpanHeightMm(calc.spanHeightMm);
    setSpanQuantity(calc.spanQuantity);
    setClientName(calc.clientName || '');
    setClientPhone(calc.clientPhone || '');
    setProjectName(calc.projectName || '');
    setPricePerM2(calc.pricePerM2 || '');
    setNotes(calc.notes || '');
    setSavedLastCalculation(calc);
    setActiveSubTab('calculator');
    onShowToast?.(`Cálculo [${calc.code}] carregado na calculadora!`);
  };

  // Excluir Cálculo do Histórico
  const handleDeleteCalculation = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cálculo salvo?')) {
      deleteCutCalculation(id);
      refreshAll();
      onShowToast?.('Cálculo excluído com sucesso.');
    }
  };

  // Duplicar Cálculo
  const handleDuplicateCalculation = (id: string) => {
    const duplicated = duplicateCutCalculation(id);
    if (duplicated) {
      refreshAll();
      onShowToast?.(`Cálculo duplicado como [${duplicated.code}]!`);
    }
  };

  // Salvar Regra de Corte
  const handleSaveRule = (rule: CutRule) => {
    const saved = saveCutRule(rule);
    setIsRuleModalOpen(false);
    setEditingRule(null);
    refreshAll();
    setSelectedRuleId(saved.id);
    onShowToast?.(`Regra "${saved.name}" salva com sucesso!`);
  };

  // Excluir Regra
  const handleDeleteRule = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta regra de cálculo?')) {
      deleteCutRule(id);
      refreshAll();
      onShowToast?.('Regra excluída.');
    }
  };

  // Duplicar Regra
  const handleDuplicateRule = (id: string) => {
    const dup = duplicateCutRule(id);
    if (dup) {
      refreshAll();
      onShowToast?.(`Regra duplicada: "${dup.name}"`);
    }
  };

  // Restaurar Regras Padrão
  const handleResetDefaultRules = () => {
    if (
      window.confirm(
        'Deseja restaurar as regras padrão de vidraçaria? Suas regras personalizadas atuais serão resetadas para os padrões originais.'
      )
    ) {
      resetDefaultCutRules();
      refreshAll();
      onShowToast?.('Regras padrão restauradas com sucesso!');
    }
  };

  // Enviar para Orçamento
  const handleSendCalculationToQuote = (calc: CutCalculation) => {
    if (onSendToQuote) {
      onSendToQuote(calc);
    } else {
      onShowToast?.('Função de envio para orçamento ativada.');
    }
  };

  // Filtragem do Histórico
  const filteredCalculations = useMemo(() => {
    return calculations.filter((c) => {
      const matchesSearch =
        !historySearch ||
        c.code.toLowerCase().includes(historySearch.toLowerCase()) ||
        (c.clientName && c.clientName.toLowerCase().includes(historySearch.toLowerCase())) ||
        (c.projectName && c.projectName.toLowerCase().includes(historySearch.toLowerCase())) ||
        c.ruleName.toLowerCase().includes(historySearch.toLowerCase());

      const matchesProduct =
        historyProductFilter === 'all' || c.productType === historyProductFilter;

      return matchesSearch && matchesProduct;
    });
  }, [calculations, historySearch, historyProductFilter]);

  // Filtragem das Regras
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      if (rulesProductFilter === 'all') return true;
      return r.productType === rulesProductFilter;
    });
  }, [rules, rulesProductFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* CABEÇALHO DO MÓDULO */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-inner">
              <Scissors className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-zinc-100 tracking-tight">
                  Cálculo de Medidas de Corte
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs">
                  Vidros & Esquadrias
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1">
                Motor técnico de cálculo com folgas, descontos, memória de cálculo e fichas técnicas
              </p>
            </div>
          </div>

          {/* Abas de Navegação */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 self-start md:self-auto">
            <button
              onClick={() => setActiveSubTab('calculator')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'calculator'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <Ruler className="w-4 h-4" />
              Calculadora
            </button>

            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'history'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Histórico ({calculations.length})
            </button>

            <button
              onClick={() => setActiveSubTab('rules')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'rules'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Regras ({rules.length})
            </button>
          </div>
        </div>
      </div>

      {/* ABA 1: CALCULADORA DE CORTE */}
      {activeSubTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* PAINEL ESQUERDO: SELEÇÃO E FORMULÁRIO DE MEDIDAS (7 Colunas) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. SELEÇÃO DO TIPO DE PRODUTO */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-3">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                1. Selecione o Tipo de Produto / Sistema:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CUT_PRODUCT_TYPES.map((pt) => {
                  const isSelected = selectedProductType === pt.type;
                  return (
                    <button
                      key={pt.type}
                      type="button"
                      onClick={() => handleSelectProductType(pt.type)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <span className="font-bold text-xs block leading-tight">{pt.shortLabel}</span>
                      <span className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{pt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. REGRA DE CÁLCULO ATIVA */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" /> 2. Regra de Folgas e Descontos:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setEditingRule(null);
                    setIsRuleModalOpen(true);
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Nova Regra
                </button>
              </div>

              {/* Seletor de Regras */}
              <div className="space-y-2">
                <select
                  value={selectedRuleId}
                  onChange={(e) => setSelectedRuleId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 font-medium focus:outline-none focus:border-amber-500 transition-colors"
                >
                  {rules
                    .filter((r) => r.isActive && (r.productType === selectedProductType || selectedProductType === 'outro'))
                    .map((rule) => (
                      <option key={rule.id} value={rule.id}>
                        {rule.name} ({rule.piecesPerSpan} folha{rule.piecesPerSpan > 1 ? 's' : ''})
                      </option>
                    ))}
                  {rules.filter((r) => r.isActive && r.productType === selectedProductType).length === 0 && (
                    <option value="">Nenhuma regra cadastrada para este produto (crie uma)</option>
                  )}
                </select>

                {activeRule && (
                  <div className="p-3.5 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-xs space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-zinc-300">
                      <span>
                        Desconto Largura: <strong className="text-amber-400 font-mono">{activeRule.widthDiscount}mm</strong> (+{activeRule.lateralGap * 2}mm lat)
                      </span>
                      <span>
                        Desconto Altura: <strong className="text-amber-400 font-mono">{activeRule.heightDiscount}mm</strong> (+{activeRule.topGap + activeRule.bottomGap}mm folgas)
                      </span>
                      <span className="text-zinc-400">
                        Divisão: <strong className="text-zinc-200">{activeRule.piecesPerSpan} folha(s)</strong>
                      </span>
                    </div>
                    {activeRule.description && (
                      <p className="text-[11px] text-zinc-500 italic">{activeRule.description}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 3. ENTRADA DAS MEDIDAS DO VÃO DA OBRA */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                3. Medidas do Vão da Obra (em Milímetros - mm):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Largura */}
                <div>
                  <label className="block text-xs text-zinc-400 font-semibold mb-1.5">
                    Largura do Vão (mm) <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={spanWidthMm}
                      onChange={(e) => setSpanWidthMm(e.target.value)}
                      placeholder="Ex: 1200"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-lg font-mono font-bold text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                      required
                    />
                    <span className="absolute right-3.5 top-3.5 text-xs text-zinc-500 font-mono font-bold">
                      mm
                    </span>
                  </div>
                  {spanWidthMm && Number(spanWidthMm) > 0 && (
                    <span className="text-[11px] text-zinc-500 mt-1 block">
                      = {(Number(spanWidthMm) / 10).toFixed(1)} cm ({(Number(spanWidthMm) / 1000).toFixed(2)} m)
                    </span>
                  )}
                </div>

                {/* Altura */}
                <div>
                  <label className="block text-xs text-zinc-400 font-semibold mb-1.5">
                    Altura do Vão (mm) <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={spanHeightMm}
                      onChange={(e) => setSpanHeightMm(e.target.value)}
                      placeholder="Ex: 2100"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-lg font-mono font-bold text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                      required
                    />
                    <span className="absolute right-3.5 top-3.5 text-xs text-zinc-500 font-mono font-bold">
                      mm
                    </span>
                  </div>
                  {spanHeightMm && Number(spanHeightMm) > 0 && (
                    <span className="text-[11px] text-zinc-500 mt-1 block">
                      = {(Number(spanHeightMm) / 10).toFixed(1)} cm ({(Number(spanHeightMm) / 1000).toFixed(2)} m)
                    </span>
                  )}
                </div>

                {/* Quantidade de Vãos */}
                <div>
                  <label className="block text-xs text-zinc-400 font-semibold mb-1.5">
                    Quantidade de Vãos
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={spanQuantity}
                      onChange={(e) => setSpanQuantity(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-lg font-mono font-bold text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors text-center"
                    />
                    <span className="absolute right-3.5 top-3.5 text-xs text-zinc-500 font-mono font-bold">
                      un
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block text-center">
                    Total: {calculationResult.totalPieces} peça(s)
                  </span>
                </div>
              </div>
            </div>

            {/* 4. DADOS DO CLIENTE & DETALHES (OPCIONAIS) */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                4. Identificação da Obra & Valores (Opcional):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 font-medium mb-1">
                    Nome do Cliente
                  </label>
                  <input
                    type="text"
                    list="clients-list"
                    value={clientName}
                    onChange={(e) => {
                      setClientName(e.target.value);
                      const found = clients.find((c) => c.name.toLowerCase() === e.target.value.toLowerCase());
                      if (found?.phone) setClientPhone(found.phone);
                    }}
                    placeholder="Ex: João da Silva"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <datalist id="clients-list">
                    {clients.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 font-medium mb-1">
                    Nome da Obra / Cômodo
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Ex: Suíte Master - Box Frontal"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 font-medium mb-1">
                    Preço por m² (R$) para simulação
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={pricePerM2}
                      onChange={(e) => setPricePerM2(e.target.value)}
                      placeholder="Ex: 380.00"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-zinc-500">R$/m²</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 font-medium mb-1">
                    Telefone de Contato
                  </label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ex: (89) 9 9999-9999"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 font-medium mb-1">
                  Observações Técnicas / Vidro / Têmpera
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Vidro Temperado 8mm Incolor, furação para puxador tubular 30cm, puxador cromado..."
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* PAINEL DIREITO: RESULTADO VISUAL, DIAGRAMA E AÇÕES (5 Colunas) */}
          <div className="lg:col-span-5 space-y-6">
            {/* QUADRO DO RESULTADO DO CÁLCULO */}
            <div className="bg-zinc-900/90 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500 text-zinc-950 font-black">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-zinc-100">Resultado do Corte</h3>
                    <p className="text-[11px] text-zinc-400">{activeRule?.name || 'Sistema Selecionado'}</p>
                  </div>
                </div>
                {savedLastCalculation && (
                  <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {savedLastCalculation.code}
                  </span>
                )}
              </div>

              {/* Mensagem de Erro ou Validação */}
              {!calculationResult.isValid ? (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{calculationResult.errorMessage}</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Comparativo Vão vs Medida de Corte */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Vão Original */}
                    <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                        Vão Original ({calculationResult.spanQuantity} un)
                      </span>
                      <p className="text-base font-bold font-mono text-zinc-200">
                        {calculationResult.spanWidthMm} × {calculationResult.spanHeightMm}
                      </p>
                      <span className="text-[10px] text-zinc-500">milímetros (mm)</span>
                    </div>

                    {/* Medida Final de Corte */}
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                        Medida de Corte (Peça)
                      </span>
                      <p className="text-xl font-black font-mono text-amber-400">
                        {calculationResult.cutWidthMm} × {calculationResult.cutHeightMm}
                      </p>
                      <span className="text-[10px] text-amber-300/80 font-medium">
                        {calculationResult.totalPieces} peça(s) no total
                      </span>
                    </div>
                  </div>

                  {/* Detalhes de Área e Peças */}
                  <div className="p-4 bg-zinc-950/90 border border-zinc-800 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center text-zinc-300">
                      <span>Área Unitária por Peça:</span>
                      <strong className="font-mono text-zinc-100">{calculationResult.singlePieceAreaM2.toFixed(3)} m²</strong>
                    </div>
                    <div className="flex justify-between items-center text-zinc-300">
                      <span>Área Total do Lote:</span>
                      <strong className="font-mono text-amber-400 text-sm">{calculationResult.totalAreaM2.toFixed(3)} m²</strong>
                    </div>
                    {calculationResult.totalPrice && (
                      <div className="flex justify-between items-center text-zinc-300 pt-2 border-t border-zinc-800">
                        <span>Valor Total Estimado:</span>
                        <strong className="font-mono text-emerald-400 text-base font-bold">
                          {calculationResult.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* Resumo da Fórmula Passo a Passo */}
                  <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Fórmula Aplicada:</span>
                    <p className="font-mono text-[11px] text-zinc-300 leading-relaxed">
                      {calculationResult.stepByStepWidth}
                    </p>
                    <p className="font-mono text-[11px] text-zinc-300 leading-relaxed">
                      {calculationResult.stepByStepHeight}
                    </p>
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleSaveCalculation}
                  disabled={!calculationResult.isValid}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Salvar Cálculo no Histórico
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleOpenPdf}
                    disabled={!calculationResult.isValid}
                    className="py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-sky-400" />
                    Ficha Técnica / PDF
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!calculationResult.isValid || !activeRule) return;
                      const tempCalc: CutCalculation = savedLastCalculation || {
                        id: 'temp-' + Date.now(),
                        code: 'ORCAMENTO',
                        companyId: companyInfo.cnpj,
                        userId: currentUser?.id,
                        userName: currentUser?.name,
                        clientName: clientName.trim() || undefined,
                        clientPhone: clientPhone.trim() || undefined,
                        projectName: projectName.trim() || undefined,
                        productType: selectedProductType,
                        ruleId: activeRule.id,
                        ruleName: activeRule.name,
                        spanWidthMm: calculationResult.spanWidthMm,
                        spanHeightMm: calculationResult.spanHeightMm,
                        spanQuantity: calculationResult.spanQuantity,
                        widthDiscount: activeRule.widthDiscount,
                        heightDiscount: activeRule.heightDiscount,
                        lateralGap: activeRule.lateralGap,
                        topGap: activeRule.topGap,
                        bottomGap: activeRule.bottomGap,
                        piecesPerSpan: calculationResult.piecesPerSpan,
                        cutWidthMm: calculationResult.cutWidthMm,
                        cutHeightMm: calculationResult.cutHeightMm,
                        totalPieces: calculationResult.totalPieces,
                        singlePieceAreaM2: calculationResult.singlePieceAreaM2,
                        totalAreaM2: calculationResult.totalAreaM2,
                        pricePerM2: calculationResult.pricePerM2,
                        totalPrice: calculationResult.totalPrice,
                        formulaUsed: calculationResult.formulaDescription,
                        notes: notes.trim() || undefined,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      };
                      handleSendCalculationToQuote(tempCalc);
                    }}
                    disabled={!calculationResult.isValid}
                    className="py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 disabled:opacity-40 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-amber-500/40 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Gerar Orçamento
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full py-2 text-zinc-400 hover:text-zinc-200 text-xs font-semibold hover:bg-zinc-800/60 rounded-xl transition-colors"
                >
                  Limpar Campos
                </button>
              </div>
            </div>

            {/* DIAGRAMA VISUAL ESQUEMÁTICO */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Visualização do Vão vs Peças
              </span>

              <div className="h-44 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center p-4 relative overflow-hidden">
                {calculationResult.isValid ? (
                  <div className="w-full h-full border-2 border-dashed border-zinc-600 rounded flex flex-col justify-between p-2 relative bg-zinc-900/40">
                    <span className="text-[10px] font-mono text-zinc-400 text-center block">
                      Largura Vão: {calculationResult.spanWidthMm}mm
                    </span>

                    {/* Peças divididas */}
                    <div className="flex-1 my-1 flex gap-1.5 items-stretch">
                      {Array.from({ length: Math.min(6, calculationResult.piecesPerSpan) }).map((_, idx) => (
                        <div
                          key={idx}
                          className="flex-1 bg-amber-500/20 border border-amber-500/60 rounded flex flex-col items-center justify-center text-center p-1"
                        >
                          <span className="text-[10px] font-mono font-bold text-amber-300 block">
                            {calculationResult.cutWidthMm}mm
                          </span>
                          <span className="text-[8px] text-zinc-400 block">
                            Folha {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>

                    <span className="text-[10px] font-mono text-zinc-400 text-center block">
                      Altura Corte: {calculationResult.cutHeightMm}mm (Vão: {calculationResult.spanHeightMm}mm)
                    </span>
                  </div>
                ) : (
                  <div className="text-center text-xs text-zinc-500 space-y-1">
                    <Ruler className="w-6 h-6 mx-auto text-zinc-600 mb-1" />
                    <p>Informe as medidas do vão para ver o esquema visual.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: HISTÓRICO DE CÁLCULOS (MEMÓRIA) */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Buscar por código, cliente ou obra..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={historyProductFilter}
                onChange={(e) => setHistoryProductFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Todos os Produtos</option>
                {CUT_PRODUCT_TYPES.map((pt) => (
                  <option key={pt.type} value={pt.type}>
                    {pt.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setActiveSubTab('calculator')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Novo Cálculo
              </button>
            </div>
          </div>

          {/* Listagem de Cálculos Salvos */}
          {filteredCalculations.length === 0 ? (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500 space-y-3">
              <Scissors className="w-10 h-10 mx-auto text-zinc-600" />
              <h3 className="text-base font-bold text-zinc-300">Nenhum cálculo registrado</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Use a calculadora para informar as dimensões do vão e salve o resultado para consultar, imprimir ou gerar orçamentos.
              </p>
              <button
                onClick={() => setActiveSubTab('calculator')}
                className="px-5 py-2.5 bg-amber-500 text-zinc-950 font-bold text-xs rounded-xl inline-flex items-center gap-2 shadow-lg shadow-amber-500/20 mt-2"
              >
                <Ruler className="w-4 h-4" /> Ir para a Calculadora
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCalculations.map((calc) => (
                <div
                  key={calc.id}
                  className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 shadow-lg space-y-4 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs">
                          {calc.code}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-100 mt-1.5">
                          {calc.clientName || 'Cliente Balcão'}
                        </h4>
                        {calc.projectName && (
                          <p className="text-xs text-amber-400 font-medium">{calc.projectName}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(calc.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between text-zinc-400">
                        <span>Sistema:</span>
                        <strong className="text-zinc-200">{calc.ruleName}</strong>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Vão ({calc.spanQuantity} un):</span>
                        <span className="font-mono text-zinc-300">{calc.spanWidthMm} × {calc.spanHeightMm} mm</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Corte ({calc.totalPieces} pcs):</span>
                        <span className="font-mono font-bold text-amber-400">{calc.cutWidthMm} × {calc.cutHeightMm} mm</span>
                      </div>
                      <div className="flex justify-between text-zinc-400 pt-1 border-t border-zinc-800/80">
                        <span>Área Total:</span>
                        <strong className="font-mono text-zinc-100">{calc.totalAreaM2.toFixed(3)} m²</strong>
                      </div>
                    </div>

                    {calc.notes && (
                      <p className="text-[11px] text-zinc-400 italic line-clamp-2">{calc.notes}</p>
                    )}
                  </div>

                  {/* Ações do Card */}
                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewingPdfCalc(calc)}
                        className="p-2 text-zinc-400 hover:text-sky-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Ver Ficha Técnica / PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleLoadCalculation(calc)}
                        className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Carregar na Calculadora"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateCalculation(calc.id)}
                        className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Duplicar Cálculo"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCalculation(calc.id)}
                        className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleSendCalculationToQuote(calc)}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30 flex items-center gap-1 transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" /> Orçamento
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 3: REGRAS DE CÁLCULO (ADMINISTRAÇÃO) */}
      {activeSubTab === 'rules' && (
        <div className="space-y-4">
          {/* Header de Regras */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-zinc-100">Regras de Folgas e Descontos</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configure as fórmulas e descontos aplicados automaticamente na calculadora
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleResetDefaultRules}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl border border-zinc-700 flex items-center gap-1.5 transition-colors"
                title="Restaurar regras padrão de vidraçaria"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restaurar Padrões
              </button>

              <button
                onClick={() => {
                  setEditingRule(null);
                  setIsRuleModalOpen(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-colors"
              >
                <Plus className="w-4 h-4" /> Nova Regra
              </button>
            </div>
          </div>

          {/* Listagem das Regras */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRules.map((r) => {
              const ptObj = CUT_PRODUCT_TYPES.find((p) => p.type === r.productType);
              const totalWidth = (r.widthDiscount || 0) + ((r.lateralGap || 0) * 2);
              const totalHeight = (r.heightDiscount || 0) + (r.topGap || 0) + (r.bottomGap || 0);

              return (
                <div
                  key={r.id}
                  className={`bg-zinc-900/90 border rounded-2xl p-5 shadow-lg space-y-4 transition-all ${
                    r.isActive ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-800/40 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase">
                          {ptObj?.shortLabel || r.productType}
                        </span>
                        {!r.isActive && (
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold">
                            Inativa
                          </span>
                        )}
                        {r.isDefault && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">
                            Padrão
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-zinc-100 mt-2">{r.name}</h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingRule(r);
                          setIsRuleModalOpen(true);
                        }}
                        className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Editar Regra"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateRule(r.id)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Duplicar Regra"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(r.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {r.description && (
                    <p className="text-xs text-zinc-400">{r.description}</p>
                  )}

                  {/* Tabela de Folgas e Descontos */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs bg-zinc-950/80 p-3 rounded-xl border border-zinc-800">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Desc. Largura</span>
                      <strong className="font-mono text-amber-400">{totalWidth} mm</strong>
                      <span className="text-[9px] text-zinc-600 block">({r.widthDiscount} + {r.lateralGap * 2}lat)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Desc. Altura</span>
                      <strong className="font-mono text-amber-400">{totalHeight} mm</strong>
                      <span className="text-[9px] text-zinc-600 block">({r.heightDiscount} + {r.topGap + r.bottomGap}folgas)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Divisão</span>
                      <strong className="text-zinc-200">{r.piecesPerSpan} folha(s)</strong>
                    </div>
                  </div>

                  {r.customFormulaDescription && (
                    <div className="text-[11px] text-zinc-400 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800/60 font-mono">
                      {r.customFormulaDescription}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO / CRIAÇÃO DE REGRA */}
      <CutRuleFormModal
        isOpen={isRuleModalOpen}
        rule={editingRule}
        onClose={() => {
          setIsRuleModalOpen(false);
          setEditingRule(null);
        }}
        onSave={handleSaveRule}
      />

      {/* MODAL DE VISUALIZAÇÃO E DOWNLOAD DE PDF */}
      <CutCalculationPdfModal
        isOpen={!!viewingPdfCalc}
        calculation={viewingPdfCalc}
        companyInfo={companyInfo}
        onClose={() => setViewingPdfCalc(null)}
        onShowToast={onShowToast}
      />
    </div>
  );
};
