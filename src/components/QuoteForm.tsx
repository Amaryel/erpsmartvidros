import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Eye,
  Calculator,
  Info,
  CheckCircle2,
  Copy,
  Scissors,
  Wrench,
  Layers,
  ChevronDown,
  ChevronUp,
  Settings2,
  Sparkles,
  Home,
  Sliders,
  DollarSign
} from 'lucide-react';
import {
  Quote,
  QuoteItem,
  ProductType,
  DiscountType,
  QuoteStatus,
  CatalogItem,
  DownPaymentType,
  PaymentMethod,
  Client,
  AppUser,
  CutCalculation,
  TechnicalCategory,
  CatalogCategory
} from '../types';
import { getCatalog, getClients, findClientByName } from '../services/storage';
import { validateUserDiscount, getUserPermissions } from '../utils/permissions';
import { UnregisteredClientPromptModal } from './UnregisteredClientPromptModal';
import { ClientFormModal } from './ClientFormModal';
import { ImportCutCalculationModal } from './CutCalculator/ImportCutCalculationModal';
import { ClientSelect } from './ClientSelect';
import { TechnicalProductPreview, detectTechnicalCategory } from './TechnicalProductPreview';

interface QuoteFormProps {
  initialQuote?: Quote | null;
  currentUser?: AppUser | null;
  onSave: (quoteData: Omit<Quote, 'id' | 'code' | 'createdAt' | 'updatedAt'> & { id?: string; code?: string }) => void;
  onCancel: () => void;
  onPreview: (tempQuote: Quote) => void;
}

const COMMON_ENVIRONMENTS = [
  'Sala',
  'Banheiro',
  'Suíte',
  'Cozinha',
  'Fachada',
  'Sacada / Varanda',
  'Área Gourmet',
  'Quarto / Dormitório',
  'Geral'
];

const GLASS_TYPES = ['Temperado', 'Laminado', 'Comum (Float)', 'Insulado / Duplo', 'Espelho', 'Serigrafado / Jateado'];
const GLASS_THICKNESSES = ['4mm', '6mm', '8mm', '10mm', '12mm', '15mm'];
const GLASS_COLORS = ['Incolor', 'Fumê', 'Verde', 'Bronze', 'Astral', 'Antirreflexo'];
const HARDWARE_COLORS = ['Preto', 'Branco', 'Fosco / Natural', 'Bronze', 'Cromado / Inox', 'Dourado / Ouro'];
const ALUMINUM_LINES = ['Suprema', 'Gold', 'Convencional', 'Elegance', 'Slide', 'Versatik', 'Stanley'];
const OPENING_TYPES = ['De Correr (Slide)', 'Pivotante', 'Fixo', 'Basculante', 'Maxim-ar', 'De Abrir / Giro', 'Camarão / Articulada'];
const LEAF_COUNTS = ['1 Folha', '2 Folhas (1F+1M)', '2 Folhas Móveis', '3 Folhas', '4 Folhas (2F+2M)', 'Painel Fixo'];
const FINISH_OPTIONS = ['Lapidado Reto', 'Bisotê 25mm', 'Bisotê 30mm', 'Canto Moeda', 'Jateado Total', 'Furos e Recortes'];

export const QuoteForm: React.FC<QuoteFormProps> = ({
  initialQuote,
  currentUser,
  onSave,
  onCancel,
  onPreview,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [clientName, setClientName] = useState(initialQuote?.clientName || '');
  const [clientPhone, setClientPhone] = useState(initialQuote?.clientPhone || '');
  const [date, setDate] = useState(initialQuote?.date || todayStr);
  const [status, setStatus] = useState<QuoteStatus>(initialQuote?.status || 'rascunho');
  const [discountType, setDiscountType] = useState<DiscountType>(initialQuote?.discountType || 'percent');
  const [discountValue, setDiscountValue] = useState<number | ''>(
    initialQuote?.discountValue !== undefined && initialQuote.discountValue !== 0
      ? initialQuote.discountValue
      : ''
  );

  // Entrada / Sinal no Orçamento
  const [hasDownPayment, setHasDownPayment] = useState<boolean>(
    Boolean(initialQuote?.downPaymentAmount && initialQuote.downPaymentAmount > 0)
  );
  const [downPaymentType, setDownPaymentType] = useState<DownPaymentType>(
    initialQuote?.downPaymentType || 'percent'
  );
  const [downPaymentValue, setDownPaymentValue] = useState<number | ''>(
    initialQuote?.downPaymentValue ?? ''
  );
  const [downPaymentMethod, setDownPaymentMethod] = useState<PaymentMethod>(
    initialQuote?.downPaymentMethod || 'pix'
  );

  const [notes, setNotes] = useState(initialQuote?.notes || '');
  const [deliveryDate, setDeliveryDate] = useState(initialQuote?.deliveryDate || '');
  const [internalNotes, setInternalNotes] = useState(initialQuote?.internalNotes || '');

  // Estado de itens expandidos para edição de características
  const [expandedItemIds, setExpandedItemIds] = useState<Record<string, boolean>>({});

  // Lista de Itens do Orçamento
  const [items, setItems] = useState<QuoteItem[]>(
    initialQuote?.items && initialQuote.items.length > 0
      ? initialQuote.items.map((it) => ({
          ...it,
          environment: it.environment || 'Geral',
          glassType: it.glassType || (it.type === 'dimensao' ? 'Temperado' : undefined),
          thickness: it.thickness || (it.type === 'dimensao' ? '8mm' : undefined),
          glassColor: it.glassColor || (it.type === 'dimensao' ? 'Incolor' : undefined),
          hardwareColor: it.hardwareColor || 'Preto',
          line: it.line || 'Suprema',
          openingType: it.openingType || 'De Correr (Slide)',
          leafCount: it.leafCount || '2 Folhas (1F+1M)',
          technicalCategory: it.technicalCategory || detectTechnicalCategory(it.name),
        }))
      : [
          {
            id: 'item-' + Date.now(),
            type: 'dimensao',
            category: 'produto',
            name: '',
            description: '',
            environment: 'Sala',
            technicalCategory: 'porta',
            glassType: 'Temperado',
            thickness: '8mm',
            glassColor: 'Incolor',
            hardwareColor: 'Preto',
            aluminumColor: 'Preto',
            line: 'Suprema',
            openingType: 'De Correr (Slide)',
            leafCount: '2 Folhas (1F+1M)',
            lengthMm: 2100, // Altura padrão
            widthMm: 1500, // Largura padrão
            areaM2: 3.15,
            quantity: 1,
            pricePerM2: 180,
            totalPrice: 567,
          },
        ]
  );

  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [registeredClients, setRegisteredClients] = useState<Client[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Modais de Cadastro Rápido & Importação
  const [showUnregisteredPrompt, setShowUnregisteredPrompt] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showImportCutModal, setShowImportCutModal] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setCatalog(getCatalog());
    setRegisteredClients(getClients());
  };

  const toggleExpandItem = (id: string) => {
    setExpandedItemIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleImportCutCalculation = (calc: CutCalculation) => {
    if (calc.clientName && !clientName) {
      setClientName(calc.clientName);
    }
    if (calc.clientPhone && !clientPhone) {
      setClientPhone(calc.clientPhone);
    }

    const pricePerM2 = calc.pricePerM2 && calc.pricePerM2 > 0 ? calc.pricePerM2 : 180;
    const singleArea = (calc.cutWidthMm / 1000) * (calc.cutHeightMm / 1000);
    const totalItemPrice = singleArea * calc.totalPieces * pricePerM2;

    const newItem: QuoteItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type: 'dimensao',
      category: 'produto',
      name: `${calc.ruleName} [${calc.code}]`,
      description: calc.projectName ? `Projeto: ${calc.projectName}` : (calc.notes || ''),
      environment: calc.projectName || 'Geral',
      technicalCategory: detectTechnicalCategory(calc.ruleName),
      glassType: 'Temperado',
      thickness: '8mm',
      glassColor: 'Incolor',
      hardwareColor: 'Preto',
      line: 'Suprema',
      openingType: 'De Correr (Slide)',
      leafCount: calc.totalPieces > 1 ? `${calc.totalPieces} Folhas` : '1 Folha',
      lengthMm: calc.cutHeightMm,
      widthMm: calc.cutWidthMm,
      areaM2: Math.round(singleArea * 1000) / 1000,
      quantity: calc.totalPieces,
      pricePerM2: pricePerM2,
      totalPrice: Math.round(totalItemPrice * 100) / 100,
      cutDetails: {
        cutCalculationId: calc.id,
        ruleId: calc.ruleId,
        ruleName: calc.ruleName,
        productType: calc.productType,
        spanWidthMm: calc.spanWidthMm,
        spanHeightMm: calc.spanHeightMm,
        spanQuantity: calc.spanQuantity,
        cutWidthMm: calc.cutWidthMm,
        cutHeightMm: calc.cutHeightMm,
        piecesCount: calc.totalPieces,
        lateralGap: calc.lateralGap,
        topGap: calc.topGap,
        bottomGap: calc.bottomGap,
        widthDiscount: calc.widthDiscount,
        heightDiscount: calc.heightDiscount,
        formulaUsed: calc.formulaUsed,
        notes: calc.notes,
      },
    };

    if (items.length === 1 && !items[0].name.trim()) {
      setItems([newItem]);
    } else {
      setItems((prev) => [...prev, newItem]);
    }
  };

  // Recalcular totais do item individual
  const calculateItemTotal = (item: Partial<QuoteItem>): { areaM2?: number; totalPrice: number } => {
    // Quantidade para cálculo: se estiver em branco ou inválida, usa 1 para prever o total sem travar a digitação
    const rawQty = Number(item.quantity);
    const qty = !isNaN(rawQty) && rawQty > 0 ? rawQty : (item.quantity === '' ? 1 : 1);

    if (item.type === 'dimensao') {
      const rawLength = Number(item.lengthMm);
      const lengthMm = !isNaN(rawLength) && rawLength > 0 ? rawLength : 0;

      const rawWidth = Number(item.widthMm);
      const widthMm = !isNaN(rawWidth) && rawWidth > 0 ? rawWidth : 0;

      const rawPrice = Number(item.pricePerM2);
      const pricePerM2 = !isNaN(rawPrice) && rawPrice >= 0 ? rawPrice : 0;

      const area = (lengthMm / 1000) * (widthMm / 1000);
      const areaM2 = Math.round(area * 1000) / 1000;
      const totalPrice = areaM2 * qty * pricePerM2;

      return { areaM2, totalPrice: Math.round(totalPrice * 100) / 100 };
    } else {
      const rawUnit = Number(item.unitPrice);
      const unitPrice = !isNaN(rawUnit) && rawUnit >= 0 ? rawUnit : 0;
      const totalPrice = qty * unitPrice;
      return { totalPrice: Math.round(totalPrice * 100) / 100 };
    }
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    setItems((prevItems) => {
      const updated = [...prevItems];
      const current = updated[index];
      const item = { ...current, [field]: value };

      // Se mudar o nome, detectar categoria técnica se não tiver sido fixada
      if (field === 'name') {
        item.technicalCategory = detectTechnicalCategory(value, item.technicalCategory);
      }

      const { areaM2, totalPrice } = calculateItemTotal(item);
      item.totalPrice = totalPrice;
      if (item.type === 'dimensao') {
        item.areaM2 = areaM2;
      }

      updated[index] = item;
      return updated;
    });
  };

  const handleTypeChange = (index: number, newType: ProductType) => {
    setItems((prevItems) => {
      const updated = [...prevItems];
      const current = updated[index];
      const item: QuoteItem = {
        ...current,
        type: newType,
        lengthMm: newType === 'dimensao' ? current.lengthMm || 2100 : undefined,
        widthMm: newType === 'dimensao' ? current.widthMm || 1500 : undefined,
        pricePerM2: newType === 'dimensao' ? current.pricePerM2 || 180 : undefined,
        unitPrice: newType === 'simples' ? current.unitPrice || 120 : undefined,
      };

      const { areaM2, totalPrice } = calculateItemTotal(item);
      item.totalPrice = totalPrice;
      if (newType === 'dimensao') item.areaM2 = areaM2;

      updated[index] = item;
      return updated;
    });
  };

  const handleSelectFromCatalog = (index: number, catalogId: string) => {
    const selected = catalog.find((c) => c.id === catalogId);
    if (!selected) return;

    setItems((prevItems) => {
      const updated = [...prevItems];
      const current = updated[index];
      const item: QuoteItem = {
        ...current,
        type: selected.type,
        category: selected.category,
        name: selected.name,
        description: selected.description || current.description || '',
        pricePerM2: selected.type === 'dimensao' ? selected.defaultPrice : undefined,
        unitPrice: selected.type === 'simples' ? selected.defaultPrice : undefined,
        technicalCategory: detectTechnicalCategory(selected.name),
      };

      const { areaM2, totalPrice } = calculateItemTotal(item);
      item.totalPrice = totalPrice;
      if (item.type === 'dimensao') item.areaM2 = areaM2;

      updated[index] = item;
      return updated;
    });
  };

  // Adicionar Produto com Dimensão
  const handleAddDimensionProduct = (envName?: string) => {
    const newItem: QuoteItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type: 'dimensao',
      category: 'produto',
      name: '',
      description: '',
      environment: envName || 'Sala',
      technicalCategory: 'porta',
      glassType: 'Temperado',
      thickness: '8mm',
      glassColor: 'Incolor',
      hardwareColor: 'Preto',
      aluminumColor: 'Preto',
      line: 'Suprema',
      openingType: 'De Correr (Slide)',
      leafCount: '2 Folhas (1F+1M)',
      lengthMm: 2100,
      widthMm: 1500,
      areaM2: 3.15,
      quantity: 1,
      pricePerM2: 180,
      totalPrice: 567,
    };
    setItems((prev) => [...prev, newItem]);
    setExpandedItemIds((prev) => ({ ...prev, [newItem.id]: true }));
  };

  // Adicionar Produto Simples (Unidade)
  const handleAddSimpleProduct = (envName?: string) => {
    const newItem: QuoteItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type: 'simples',
      category: 'produto',
      name: '',
      description: '',
      environment: envName || 'Geral',
      quantity: 1,
      unitPrice: 150,
      totalPrice: 150,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Adicionar Serviço
  const handleAddService = (envName?: string) => {
    const newItem: QuoteItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type: 'simples',
      category: 'servico',
      name: 'Instalação / Mão de Obra Especializada',
      description: 'Execução de serviço no local da obra',
      environment: envName || 'Geral',
      quantity: 1,
      unitPrice: 200,
      totalPrice: 200,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Duplicar Item
  const handleDuplicateItem = (index: number) => {
    const target = items[index];
    const duplicated: QuoteItem = {
      ...target,
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: `${target.name} (Cópia)`,
    };
    setItems((prev) => [...prev.slice(0, index + 1), duplicated, ...prev.slice(index + 1)]);
  };

  // Remover Item
  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('O orçamento deve ter pelo menos 1 item.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Cálculos do Resumo Geral
  const subtotal = items.reduce((acc, item) => acc + (item.totalPrice || 0), 0);

  const numDiscountValue = typeof discountValue === 'number' ? discountValue : (discountValue ? parseFloat(String(discountValue)) : 0);
  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = (subtotal * Math.min(100, Math.max(0, numDiscountValue))) / 100;
  } else {
    discountAmount = Math.min(subtotal, Math.max(0, numDiscountValue));
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Cálculo da entrada
  const numDownPaymentValue = typeof downPaymentValue === 'number' ? downPaymentValue : (downPaymentValue ? parseFloat(String(downPaymentValue)) : 0);
  let downPaymentAmount = 0;
  if (hasDownPayment && numDownPaymentValue > 0) {
    if (downPaymentType === 'percent') {
      downPaymentAmount = (finalTotal * Math.min(100, numDownPaymentValue)) / 100;
    } else {
      downPaymentAmount = Math.min(finalTotal, numDownPaymentValue);
    }
  }

  const sanitizeItems = (): QuoteItem[] => {
    return items.map((item) => {
      const qty = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
      if (item.type === 'dimensao') {
        const lengthMm = Number(item.lengthMm) || 0;
        const widthMm = Number(item.widthMm) || 0;
        const pricePerM2 = Number(item.pricePerM2) || 0;
        const area = (lengthMm / 1000) * (widthMm / 1000);
        const areaM2 = Math.round(area * 1000) / 1000;
        const totalPrice = Math.round(areaM2 * qty * pricePerM2 * 100) / 100;
        return {
          ...item,
          quantity: qty,
          lengthMm,
          widthMm,
          areaM2,
          pricePerM2,
          unitPrice: undefined,
          totalPrice,
        };
      } else {
        const unitPrice = Number(item.unitPrice) || 0;
        const totalPrice = Math.round(qty * unitPrice * 100) / 100;
        return {
          ...item,
          quantity: qty,
          unitPrice,
          lengthMm: undefined,
          widthMm: undefined,
          pricePerM2: undefined,
          totalPrice,
        };
      }
    });
  };

  const validateForm = (): boolean => {
    setValidationError(null);

    if (items.length === 0) {
      setValidationError('Adicione pelo menos um produto ou serviço ao orçamento.');
      return false;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.name || item.name.trim() === '') {
        setValidationError(`Por favor, informe o Nome do Item no item #${i + 1}.`);
        return false;
      }
      const qty = Number(item.quantity);
      if (!qty || qty <= 0) {
        setValidationError(`A Quantidade do item "${item.name}" deve ser maior que zero.`);
        return false;
      }

      if (item.type === 'dimensao') {
        const len = Number(item.lengthMm);
        if (!len || len <= 0) {
          setValidationError(`A Altura em mm do produto "${item.name}" deve ser maior que zero.`);
          return false;
        }
        const wid = Number(item.widthMm);
        if (!wid || wid <= 0) {
          setValidationError(`A Largura em mm do produto "${item.name}" deve ser maior que zero.`);
          return false;
        }
        const price = Number(item.pricePerM2);
        if (price === undefined || isNaN(price) || price < 0) {
          setValidationError(`O Valor por m² do produto "${item.name}" deve ser preenchido.`);
          return false;
        }
      } else {
        const unitP = Number(item.unitPrice);
        if (unitP === undefined || isNaN(unitP) || unitP < 0) {
          setValidationError(`O Valor Unitário do item "${item.name}" deve ser preenchido.`);
          return false;
        }
      }
    }

    // Validação de Desconto
    if (discountAmount > 0) {
      const discCheck = validateUserDiscount(currentUser, subtotal, discountAmount);
      if (!discCheck.valid) {
        setValidationError(
          discCheck.errorMessage ||
            `O desconto informado ultrapassa o limite permitido de ${discCheck.maxAllowedPercent}%.`
        );
        return false;
      }
    }

    return true;
  };

  const executeSaveQuote = () => {
    const cleanItems = sanitizeItems();
    onSave({
      id: initialQuote?.id,
      code: initialQuote?.code,
      clientName: clientName.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      date,
      status,
      items: cleanItems,
      discountType,
      discountValue: numDiscountValue,
      subtotal,
      discountAmount,
      total: finalTotal,
      downPaymentType: hasDownPayment ? downPaymentType : undefined,
      downPaymentValue: hasDownPayment && numDownPaymentValue > 0 ? numDownPaymentValue : undefined,
      downPaymentAmount: hasDownPayment ? downPaymentAmount : undefined,
      downPaymentMethod: hasDownPayment ? downPaymentMethod : undefined,
      notes: notes.trim() || undefined,
      deliveryDate: deliveryDate || undefined,
      internalNotes: internalNotes.trim() || undefined,
      workStatus: initialQuote?.workStatus || 'pendente',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Verificar se o cliente foi digitado e se já existe no cadastro
    const trimmedName = clientName.trim();
    if (trimmedName) {
      const existingClient = findClientByName(trimmedName);
      if (!existingClient) {
        // Exibir modal perguntando se deseja cadastrar
        setShowUnregisteredPrompt(true);
        return;
      }
    }

    executeSaveQuote();
  };

  const handleRegisterClientFromPrompt = () => {
    setShowUnregisteredPrompt(false);
    setShowClientModal(true);
  };

  const handleContinueWithoutRegisterFromPrompt = () => {
    setShowUnregisteredPrompt(false);
    executeSaveQuote();
  };

  const handleSavedClient = (savedClient: Client) => {
    setClientName(savedClient.name);
    setClientPhone(savedClient.phone || savedClient.whatsapp || clientPhone);
    setShowClientModal(false);
    refreshData();
    executeSaveQuote();
  };

  const handlePreviewClick = () => {
    if (!validateForm()) return;

    const cleanItems = sanitizeItems();
    const tempQuote: Quote = {
      id: initialQuote?.id || 'temp-preview',
      code: initialQuote?.code || 'ORC-RASCUNHO',
      clientName: clientName.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      date,
      createdAt: initialQuote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status,
      items: cleanItems,
      discountType,
      discountValue: numDiscountValue,
      subtotal,
      discountAmount,
      total: finalTotal,
      downPaymentType: hasDownPayment ? downPaymentType : undefined,
      downPaymentValue: hasDownPayment && numDownPaymentValue > 0 ? numDownPaymentValue : undefined,
      downPaymentAmount: hasDownPayment ? downPaymentAmount : undefined,
      downPaymentMethod: hasDownPayment ? downPaymentMethod : undefined,
      notes: notes.trim() || undefined,
      deliveryDate: deliveryDate || undefined,
      internalNotes: internalNotes.trim() || undefined,
    };

    onPreview(tempQuote);
  };

  // Obter lista única de ambientes dos itens atuais
  const currentEnvironments = Array.from(new Set(items.map((i) => i.environment || 'Geral')));

  return (
    <div className="max-w-6xl mx-auto pb-16 px-4 sm:px-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 shadow-sm transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Módulo de Orçamentos Comerciais & Técnicos</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {initialQuote ? `Editar Orçamento ${initialQuote.code}` : 'Novo Orçamento Smart Vidros'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePreviewClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition-all"
          >
            <Eye className="w-4 h-4 text-amber-600" />
            <span>Pré-visualizar PDF</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Orçamento</span>
          </button>
        </div>
      </div>

      {/* Alerta de Validação */}
      {validationError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-3 shadow-sm">
          <Info className="w-5 h-5 text-red-500 shrink-0" />
          <div>{validationError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SEÇÃO 1: Dados do Cliente, Data e Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>1. Informações do Orçamento & Cliente</span>
            <span className="text-xs font-normal text-slate-400">Cliente opcional / cadastro rápido</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <ClientSelect
                clients={registeredClients}
                selectedName={clientName}
                selectedPhone={clientPhone}
                onSelectClient={(c) => {
                  setClientName(c.name);
                  if (c.phone || c.whatsapp) setClientPhone(c.phone || c.whatsapp || '');
                }}
                onClear={() => {
                  setClientName('');
                  setClientPhone('');
                }}
                onOpenNewClientModal={() => setShowClientModal(true)}
                placeholder="Buscar cliente ou digitar nome avulso..."
                label="Cliente (Opcional)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                WhatsApp / Telefone
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(89) 99991-0028"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Data do Orçamento <span className="text-amber-600">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Data Prevista de Entrega</span>
                <span className="text-[10px] text-amber-700 font-bold lowercase">(opcional)</span>
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full bg-amber-50/60 border border-amber-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors font-medium"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Status do Orçamento
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white capitalize transition-colors font-medium"
              >
                <option value="rascunho">Rascunho</option>
                <option value="aprovado">Aprovado</option>
                <option value="convertido">Convertido em Venda</option>
                <option value="cancelado">Cancelado / Recusado</option>
              </select>
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: Itens do Orçamento com Organização por Ambiente */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>2. Itens do Orçamento (Produtos, Dimensões e Serviços)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Organize por ambientes (Sala, Banheiro, Fachada...) com ilustração técnica vetorial e características personalizadas.
              </p>
            </div>

            {/* Ações de Adição */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowImportCutModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-950 border border-amber-500/40 text-xs font-bold rounded-xl transition-colors"
                title="Importar medidas de corte calculadas"
              >
                <Scissors className="w-3.5 h-3.5 text-amber-600" />
                <span>+ Medida de Corte</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddService()}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-xl transition-colors"
              >
                <Wrench className="w-3.5 h-3.5 text-slate-600" />
                <span>+ Serviço</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddSimpleProduct()}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-slate-600" />
                <span>+ Produto Simples</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddDimensionProduct()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Vidro / Dimensões (m²)</span>
              </button>
            </div>
          </div>

          {/* Atalhos Rápidos de Ambientes */}
          <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 flex-wrap text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Home className="w-3.5 h-3.5 text-amber-600" />
              <span>Adicionar no Ambiente:</span>
            </span>
            {COMMON_ENVIRONMENTS.slice(0, 6).map((env) => (
              <button
                key={env}
                type="button"
                onClick={() => handleAddDimensionProduct(env)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 hover:border-amber-400 border border-slate-200 text-slate-700 hover:text-amber-950 font-semibold transition-all shadow-2xs text-[11px]"
              >
                + {env}
              </button>
            ))}
          </div>

          {/* Lista de Itens */}
          <div className="space-y-5">
            {items.map((item, index) => {
              const isExpanded = expandedItemIds[item.id] ?? (item.type === 'dimensao');

              return (
                <div
                  key={item.id}
                  className={`bg-slate-50 border rounded-2xl p-4 sm:p-5 relative transition-all ${
                    item.category === 'servico'
                      ? 'border-blue-200 bg-blue-50/20'
                      : 'border-slate-300/80 shadow-xs'
                  }`}
                >
                  {/* Top Bar do Item: Numeração, Tipo, Ambiente e Ações */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200/80 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black bg-slate-950 text-amber-400 px-2.5 py-1 rounded-lg">
                        #{index + 1}
                      </span>

                      {/* Seletor de Tipo: Dimensão vs Simples */}
                      <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
                        <button
                          type="button"
                          onClick={() => handleTypeChange(index, 'dimensao')}
                          className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                            item.type === 'dimensao'
                              ? 'bg-amber-500 text-slate-950'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Com Dimensões (m²)
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTypeChange(index, 'simples')}
                          className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                            item.type === 'simples'
                              ? 'bg-amber-500 text-slate-950'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Simples / Serviço (un)
                        </button>
                      </div>

                      {/* Catálogo Import */}
                      {catalog.length > 0 && (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleSelectFromCatalog(index, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="bg-white border border-slate-200 text-xs text-slate-700 rounded-lg px-2.5 py-1 focus:outline-none"
                        >
                          <option value="">Importar do Catálogo...</option>
                          {catalog.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name} ({cat.type === 'dimensao' ? `R$ ${cat.defaultPrice}/m²` : `R$ ${cat.defaultPrice} un`})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Botões de Ação do Item: Duplicar, Expandir/Recolher, Excluir */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDuplicateItem(index)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                        title="Duplicar Item"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {item.type === 'dimensao' && (
                        <button
                          type="button"
                          onClick={() => toggleExpandItem(item.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                          title="Características Técnicas"
                        >
                          <Sliders className="w-3.5 h-3.5 text-amber-600" />
                          <span className="hidden sm:inline">Características</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 bg-white rounded-lg border border-slate-200 transition-colors"
                        title="Remover Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Vínculo com Cálculo de Corte (se houver) */}
                  {item.cutDetails && (
                    <div className="mb-3 p-2.5 bg-amber-100/70 border border-amber-300 rounded-xl flex items-center justify-between gap-2 text-xs text-amber-950">
                      <div className="flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>
                          <strong>Medida de Corte:</strong> {item.cutDetails.cutWidthMm} × {item.cutDetails.cutHeightMm} mm
                          <span className="text-amber-800 ml-1.5 font-medium">
                            (Vão da obra: {item.cutDetails.spanWidthMm} × {item.cutDetails.spanHeightMm} mm | Folgas vinculadas)
                          </span>
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-300 text-amber-950 font-bold text-[10px]">
                        {item.cutDetails.ruleName}
                      </span>
                    </div>
                  )}

                  {/* Campos Principais do Item */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3">
                    {/* Ambiente / Obra */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Home className="w-3 h-3 text-amber-600" />
                        <span>Ambiente / Obra</span>
                      </label>
                      <input
                        type="text"
                        value={item.environment || ''}
                        onChange={(e) => handleItemChange(index, 'environment', e.target.value)}
                        placeholder="Ex: Sala, Banheiro..."
                        list={`env-list-${index}`}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500 shadow-2xs"
                      />
                      <datalist id={`env-list-${index}`}>
                        {COMMON_ENVIRONMENTS.map((env) => (
                          <option key={env} value={env} />
                        ))}
                      </datalist>
                    </div>

                    {/* Nome do Produto */}
                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Nome do Produto / Serviço <span className="text-amber-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        placeholder={
                          item.type === 'dimensao'
                            ? 'Ex: Porta de Correr 2 Folhas Vidro 8mm'
                            : 'Ex: Espelho Lapidado ou Instalação'
                        }
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm font-semibold focus:outline-none focus:border-amber-500 shadow-2xs"
                      />
                    </div>

                    {/* Descrição / Detalhes */}
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Detalhes / Observação do Item
                      </label>
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Ex: Puxador tubular 60cm, vão acabado"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-amber-500 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* PRODUTO COM DIMENSÕES vs PRODUTO SIMPLES */}
                  {item.type === 'dimensao' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      
                      {/* LADO ESQUERDO: Dimensões e Valores */}
                      <div className="lg:col-span-8 space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Largura (mm) <span className="text-amber-600">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              inputMode="decimal"
                              value={item.widthMm !== undefined && item.widthMm !== null ? item.widthMm : ''}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleItemChange(index, 'widthMm', val === '' ? '' : parseFloat(val));
                              }}
                              placeholder="1500"
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 text-sm font-mono font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Altura (mm) <span className="text-amber-600">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              inputMode="decimal"
                              value={item.lengthMm !== undefined && item.lengthMm !== null ? item.lengthMm : ''}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleItemChange(index, 'lengthMm', val === '' ? '' : parseFloat(val));
                              }}
                              placeholder="2100"
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 text-sm font-mono font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-amber-800 mb-1">Área Calculada</label>
                            <div className="w-full bg-amber-50 border border-amber-300 rounded-lg px-2.5 py-1.5 text-amber-950 font-mono font-black text-sm text-center flex items-center justify-center">
                              {item.areaM2 !== undefined ? item.areaM2.toFixed(3) : '0.000'} m²
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Quantidade</label>
                            <div className="flex items-stretch rounded-lg border border-slate-300 overflow-hidden bg-slate-50 focus-within:border-amber-500 focus-within:bg-white">
                              <button
                                type="button"
                                onClick={() => {
                                  const currentVal = Number(item.quantity) || 1;
                                  handleItemChange(index, 'quantity', Math.max(1, currentVal - 1));
                                }}
                                className="px-2.5 bg-slate-100 hover:bg-amber-100 active:bg-amber-200 text-slate-700 font-black text-sm border-r border-slate-300 select-none transition-colors"
                                title="Diminuir"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                min="1"
                                inputMode="numeric"
                                value={item.quantity !== undefined && item.quantity !== null ? item.quantity : ''}
                                onFocus={(e) => e.target.select()}
                                onBlur={() => {
                                  if (!item.quantity || Number(item.quantity) < 1) {
                                    handleItemChange(index, 'quantity', 1);
                                  }
                                }}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleItemChange(index, 'quantity', val === '' ? '' : (parseInt(val, 10) || ''));
                                }}
                                className="w-full bg-transparent px-1 py-1.5 text-slate-900 text-sm font-mono font-bold text-center focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const currentVal = Number(item.quantity) || 1;
                                  handleItemChange(index, 'quantity', currentVal + 1);
                                }}
                                className="px-2.5 bg-slate-100 hover:bg-amber-100 active:bg-amber-200 text-slate-700 font-black text-sm border-l border-slate-300 select-none transition-colors"
                                title="Aumentar"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Valor m² (R$)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              inputMode="decimal"
                              value={item.pricePerM2 !== undefined && item.pricePerM2 !== null ? item.pricePerM2 : ''}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleItemChange(index, 'pricePerM2', val === '' ? '' : parseFloat(val));
                              }}
                              placeholder="180.00"
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 text-sm font-mono font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                            />
                          </div>
                        </div>

                        {/* CARACTERÍSTICAS TÉCNICAS EXPANDÍVEIS */}
                        {isExpanded && (
                          <div className="pt-3 border-t border-slate-200 mt-2 space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-1">
                              <span className="flex items-center gap-1.5">
                                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                                <span>Características Técnicas Específicas:</span>
                              </span>
                              <span className="text-[11px] font-normal text-slate-500">Exibidas no Orçamento & PDF</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                              {/* Tipo de Vidro */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Tipo de Vidro</label>
                                <select
                                  value={item.glassType || 'Temperado'}
                                  onChange={(e) => handleItemChange(index, 'glassType', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                                >
                                  {GLASS_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Espessura */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Espessura</label>
                                <select
                                  value={item.thickness || '8mm'}
                                  onChange={(e) => handleItemChange(index, 'thickness', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-amber-500 font-mono"
                                >
                                  {GLASS_THICKNESSES.map((th) => (
                                    <option key={th} value={th}>{th}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Cor do Vidro */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Cor do Vidro</label>
                                <select
                                  value={item.glassColor || 'Incolor'}
                                  onChange={(e) => handleItemChange(index, 'glassColor', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                                >
                                  {GLASS_COLORS.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Cor da Ferragem / Alumínio */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Cor Ferragem / Alumínio</label>
                                <select
                                  value={item.hardwareColor || 'Preto'}
                                  onChange={(e) => {
                                    handleItemChange(index, 'hardwareColor', e.target.value);
                                    handleItemChange(index, 'aluminumColor', e.target.value);
                                  }}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                                >
                                  {HARDWARE_COLORS.map((hc) => (
                                    <option key={hc} value={hc}>{hc}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Linha de Alumínio */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Linha de Perfil</label>
                                <select
                                  value={item.line || 'Suprema'}
                                  onChange={(e) => handleItemChange(index, 'line', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                                >
                                  {ALUMINUM_LINES.map((l) => (
                                    <option key={l} value={l}>{l}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Tipo de Abertura */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Tipo de Abertura</label>
                                <select
                                  value={item.openingType || 'De Correr (Slide)'}
                                  onChange={(e) => handleItemChange(index, 'openingType', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                                >
                                  {OPENING_TYPES.map((ot) => (
                                    <option key={ot} value={ot}>{ot}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Número de Folhas */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Número de Folhas</label>
                                <select
                                  value={item.leafCount || '2 Folhas (1F+1M)'}
                                  onChange={(e) => handleItemChange(index, 'leafCount', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                                >
                                  {LEAF_COUNTS.map((lf) => (
                                    <option key={lf} value={lf}>{lf}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Acabamento / Lapidação */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Acabamento</label>
                                <select
                                  value={item.finish || 'Lapidado Reto'}
                                  onChange={(e) => handleItemChange(index, 'finish', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                                >
                                  {FINISH_OPTIONS.map((f) => (
                                    <option key={f} value={f}>{f}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* LADO DIREITO: Ilustração Técnica Vetorial 2D Automática */}
                      <div className="lg:col-span-4 flex flex-col items-center justify-center p-2 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">
                          Ilustração Técnica 2D
                        </div>
                        <TechnicalProductPreview
                          item={item}
                          widthMm={item.widthMm}
                          heightMm={item.lengthMm}
                          name={item.name || 'Produto'}
                          compact={true}
                          className="w-full"
                        />
                      </div>

                    </div>
                  ) : (
                    /* PRODUTO SIMPLES OU SERVIÇO */
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Quantidade</label>
                        <div className="flex items-stretch rounded-lg border border-slate-300 overflow-hidden bg-slate-50 focus-within:border-amber-500 focus-within:bg-white">
                          <button
                            type="button"
                            onClick={() => {
                              const currentVal = Number(item.quantity) || 1;
                              handleItemChange(index, 'quantity', Math.max(1, currentVal - 1));
                            }}
                            className="px-3 bg-slate-100 hover:bg-amber-100 active:bg-amber-200 text-slate-700 font-black text-sm border-r border-slate-300 select-none transition-colors"
                            title="Diminuir"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            inputMode="numeric"
                            value={item.quantity !== undefined && item.quantity !== null ? item.quantity : ''}
                            onFocus={(e) => e.target.select()}
                            onBlur={() => {
                              if (!item.quantity || Number(item.quantity) < 1) {
                                handleItemChange(index, 'quantity', 1);
                              }
                            }}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleItemChange(index, 'quantity', val === '' ? '' : (parseInt(val, 10) || ''));
                            }}
                            className="w-full bg-transparent px-2 py-1.5 text-slate-900 text-sm font-mono font-bold text-center focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const currentVal = Number(item.quantity) || 1;
                              handleItemChange(index, 'quantity', currentVal + 1);
                            }}
                            className="px-3 bg-slate-100 hover:bg-amber-100 active:bg-amber-200 text-slate-700 font-black text-sm border-l border-slate-300 select-none transition-colors"
                            title="Aumentar"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Valor Unitário (R$)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          value={item.unitPrice !== undefined && item.unitPrice !== null ? item.unitPrice : ''}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleItemChange(index, 'unitPrice', val === '' ? '' : parseFloat(val));
                          }}
                          placeholder="100.00"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 text-sm font-mono font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                        />
                      </div>

                      <div className="flex flex-col justify-end">
                        <div className="text-xs text-slate-500 font-medium">Subtotal Item:</div>
                        <div className="text-sm text-slate-900 font-black font-mono">
                          {Number(item.quantity) || 1} × R$ {(Number(item.unitPrice) || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resumo do Total do Item */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/80 text-right">
                    <div className="text-xs text-slate-500 font-medium">
                      Ambiente: <strong className="text-slate-800">{item.environment || 'Geral'}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600 font-bold">Total do Item:</span>
                      <span className="text-base font-black text-slate-950 font-mono">
                        R$ {(item.totalPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botão Inferior de Adicionar */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleAddDimensionProduct()}
              className="py-3 px-4 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 rounded-xl text-amber-950 text-xs font-black flex items-center justify-center gap-2 transition-all shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Adicionar Produto com Dimensões (m²)</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddSimpleProduct()}
              className="py-3 px-4 border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Adicionar Produto Simples</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddService()}
              className="py-3 px-4 border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 hover:bg-blue-50 rounded-xl text-blue-900 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Wrench className="w-4 h-4 text-blue-600" />
              <span>+ Adicionar Serviço / Mão de Obra</span>
            </button>
          </div>
        </div>

        {/* SEÇÃO 3: Entrada / Sinal + Observações + Resumo Financeiro */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Bloco de Entrada / Sinal Opcional */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>Entrada / Sinal (Opcional)</span>
                </h3>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDownPayment}
                    onChange={(e) => setHasDownPayment(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  <span className="ml-2 text-xs font-semibold text-slate-700">
                    {hasDownPayment ? 'Ativado' : 'Sem entrada'}
                  </span>
                </label>
              </div>

              {hasDownPayment && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                        Tipo de Entrada
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDownPaymentType('percent')}
                          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition-colors ${
                            downPaymentType === 'percent'
                              ? 'bg-amber-500 border-amber-500 text-slate-950'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Porcentagem (%)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDownPaymentType('fixed')}
                          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition-colors ${
                            downPaymentType === 'fixed'
                              ? 'bg-amber-500 border-amber-500 text-slate-950'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Valor Fixo (R$)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                        {downPaymentType === 'percent' ? 'Porcentagem (%)' : 'Valor Fixo (R$)'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        placeholder={downPaymentType === 'percent' ? 'Ex: 30' : 'Ex: 1500,00'}
                        value={downPaymentValue !== undefined && downPaymentValue !== null ? downPaymentValue : ''}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setDownPaymentValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                      Forma de Pagamento da Entrada
                    </label>
                    <select
                      value={downPaymentMethod}
                      onChange={(e) => setDownPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-500"
                    >
                      <option value="pix">PIX</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartao_credito">Cartão de Crédito</option>
                      <option value="cartao_debito">Cartão de Débito</option>
                      <option value="transferencia">Transferência Bancária</option>
                    </select>
                  </div>

                  {downPaymentAmount > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs font-semibold text-amber-900">
                      <span>Valor da Entrada Calculado:</span>
                      <span className="font-mono font-black text-sm text-emerald-800">
                        {downPaymentAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Observações Comerciais vs Anotações Internas da Obra */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Observações Comerciais
                  </h2>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Visível no PDF do Cliente
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Condições de pagamento, prazos de entrega, validade da proposta de 15 dias..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="bg-amber-50/60 border border-amber-300 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Anotações Internas da Equipe
                  </h2>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                    Oculto no PDF do Cliente
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Ex: Medidas do vão bruto, local de difícil acesso, cor do silicone, particularidades da equipe..."
                  className="w-full bg-white border border-amber-300 rounded-xl p-3 text-slate-900 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Resumo Financeiro Geral */}
          <div className="bg-white border-2 border-amber-500/50 rounded-2xl p-5 shadow-md flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-600" />
                <span>3. Resumo Financeiro</span>
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal dos Itens:</span>
                  <span className="font-mono font-bold text-slate-900">
                    R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span>Desconto Comercial:</span>
                      {(() => {
                        const perms = getUserPermissions(currentUser);
                        if (currentUser?.role === 'superadmin' || currentUser?.role === 'admin') {
                          return (
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                              Admin (100%)
                            </span>
                          );
                        }
                        return (
                          <span className="text-[10px] text-amber-800 font-extrabold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            Limite: {perms.maxDiscountPercent}%
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setDiscountType('percent')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          discountType === 'percent' ? 'bg-amber-500 text-slate-950' : 'text-slate-600'
                        }`}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType('fixed')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          discountType === 'fixed' ? 'bg-amber-500 text-slate-950' : 'text-slate-600'
                        }`}
                      >
                        R$
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step={discountType === 'percent' ? '1' : '0.01'}
                      inputMode="decimal"
                      value={discountValue !== undefined && discountValue !== null ? discountValue : ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setDiscountValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder={discountType === 'percent' ? '0%' : 'R$ 0,00'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 text-sm font-mono font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">Valor do Desconto:</span>
                      <span className="text-right font-bold text-emerald-600">
                        - R$ {discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t-2 border-slate-900 flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm">TOTAL FINAL:</span>
                  <span className="text-base font-black text-slate-950 font-mono">
                    R$ {finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {hasDownPayment && downPaymentAmount > 0 && (
                  <div className="space-y-2 pt-3 border-t border-dashed border-amber-300 bg-amber-50/80 p-3 rounded-xl border mt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                      <span>(-) Entrada / Sinal ({downPaymentMethod.toUpperCase()}):</span>
                      <span className="font-mono text-emerald-700 font-bold">
                        - R$ {downPaymentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-black text-slate-900 pt-1.5 border-t border-amber-200">
                      <span>(=) Saldo Restante a Pagar:</span>
                      <span className="font-mono text-amber-700 text-base font-black">
                        R$ {Math.max(0, finalTotal - downPaymentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Orçamento</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Modal: Cliente não cadastrado - Pergunta se deseja cadastrar agora */}
      {showUnregisteredPrompt && (
        <UnregisteredClientPromptModal
          clientName={clientName}
          onRegister={handleRegisterClientFromPrompt}
          onContinueWithoutRegister={handleContinueWithoutRegisterFromPrompt}
          onClose={() => setShowUnregisteredPrompt(false)}
        />
      )}

      {/* Modal: Cadastrar Cliente */}
      {showClientModal && (
        <ClientFormModal
          initialData={{ name: clientName, phone: clientPhone }}
          onClose={() => setShowClientModal(false)}
          onSave={handleSavedClient}
          title="Cadastrar Cliente p/ Orçamento"
        />
      )}

      {/* Modal: Importar Medida de Corte */}
      <ImportCutCalculationModal
        isOpen={showImportCutModal}
        onClose={() => setShowImportCutModal(false)}
        onSelectCalculation={handleImportCutCalculation}
      />
    </div>
  );
};
