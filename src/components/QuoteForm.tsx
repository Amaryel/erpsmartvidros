import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowLeft, Eye, Calculator, Info, CheckCircle2, UserPlus, PackagePlus, Wrench } from 'lucide-react';
import { Quote, QuoteItem, ProductType, DiscountType, QuoteStatus, CatalogItem, DownPaymentType, PaymentMethod, Client } from '../types';
import { getCatalog, getClients, findClientByName } from '../services/storage';
import { UnregisteredClientPromptModal } from './UnregisteredClientPromptModal';
import { ClientFormModal } from './ClientFormModal';
import { ProductFormModal } from './ProductFormModal';
import { ServiceFormModal } from './ServiceFormModal';
import { ClientSelect } from './ClientSelect';

interface QuoteFormProps {
  initialQuote?: Quote | null;
  onSave: (quoteData: Omit<Quote, 'id' | 'code' | 'createdAt' | 'updatedAt'> & { id?: string; code?: string }) => void;
  onCancel: () => void;
  onPreview: (tempQuote: Quote) => void;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({
  initialQuote,
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
  const [discountValue, setDiscountValue] = useState<number>(initialQuote?.discountValue || 0);

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

  // Lista de Itens do Orçamento
  const [items, setItems] = useState<QuoteItem[]>(
    initialQuote?.items || [
      {
        id: 'item-' + Date.now(),
        type: 'dimensao',
        name: '',
        description: '',
        lengthMm: 1000,
        widthMm: 1000,
        areaM2: 1.0,
        quantity: 1,
        pricePerM2: 150,
        totalPrice: 150,
      },
    ]
  );

  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [registeredClients, setRegisteredClients] = useState<Client[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Modais de Cadastro Rápido
  const [showUnregisteredPrompt, setShowUnregisteredPrompt] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [targetItemIndexForQuickAdd, setTargetItemIndexForQuickAdd] = useState<number | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setCatalog(getCatalog());
    setRegisteredClients(getClients());
  };

  const handleSelectClient = (client: Client) => {
    setClientName(client.name);
    setClientPhone(client.phone || client.whatsapp || '');
  };

  // Recalcular totais do item individual
  const calculateItemTotal = (item: Partial<QuoteItem>): { areaM2?: number; totalPrice: number } => {
    const qty = Math.max(1, item.quantity || 1);

    if (item.type === 'dimensao') {
      const lengthMm = Math.max(0, item.lengthMm || 0);
      const widthMm = Math.max(0, item.widthMm || 0);
      const pricePerM2 = Math.max(0, item.pricePerM2 || 0);

      const area = (lengthMm / 1000) * (widthMm / 1000);
      const areaM2 = Math.round(area * 1000) / 1000;
      const totalPrice = areaM2 * qty * pricePerM2;

      return { areaM2, totalPrice };
    } else {
      const unitPrice = Math.max(0, item.unitPrice || 0);
      const totalPrice = qty * unitPrice;
      return { totalPrice };
    }
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    setItems((prevItems) => {
      const updated = [...prevItems];
      const item = { ...updated[index], [field]: value };

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
        lengthMm: newType === 'dimensao' ? current.lengthMm || 1000 : undefined,
        widthMm: newType === 'dimensao' ? current.widthMm || 1000 : undefined,
        pricePerM2: newType === 'dimensao' ? current.pricePerM2 || 150 : undefined,
        unitPrice: newType === 'simples' ? current.unitPrice || 100 : undefined,
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
      const item: QuoteItem = {
        ...updated[index],
        type: selected.type,
        name: selected.name,
        description: selected.description || '',
        pricePerM2: selected.type === 'dimensao' ? selected.defaultPrice : undefined,
        unitPrice: selected.type === 'simples' ? selected.defaultPrice : undefined,
      };

      const { areaM2, totalPrice } = calculateItemTotal(item);
      item.totalPrice = totalPrice;
      if (item.type === 'dimensao') item.areaM2 = areaM2;

      updated[index] = item;
      return updated;
    });
  };

  const handleAddItem = () => {
    const newItem: QuoteItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type: 'dimensao',
      name: '',
      description: '',
      lengthMm: 1000,
      widthMm: 1000,
      areaM2: 1.0,
      quantity: 1,
      pricePerM2: 150,
      totalPrice: 150,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('O orçamento deve ter pelo menos 1 produto.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Cálculos do Resumo Geral
  const subtotal = items.reduce((acc, item) => acc + (item.totalPrice || 0), 0);

  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = (subtotal * Math.min(100, Math.max(0, discountValue))) / 100;
  } else {
    discountAmount = Math.min(subtotal, Math.max(0, discountValue));
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Cálculo da entrada
  let downPaymentAmount = 0;
  if (hasDownPayment && typeof downPaymentValue === 'number' && downPaymentValue > 0) {
    if (downPaymentType === 'percent') {
      downPaymentAmount = (finalTotal * Math.min(100, downPaymentValue)) / 100;
    } else {
      downPaymentAmount = Math.min(finalTotal, downPaymentValue);
    }
  }

  const validateForm = (): boolean => {
    setValidationError(null);

    if (items.length === 0) {
      setValidationError('Adicione pelo menos um produto ao orçamento.');
      return false;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.name || item.name.trim() === '') {
        setValidationError(`Por favor, informe o Nome do Produto no Item ${i + 1}.`);
        return false;
      }
      if (!item.quantity || item.quantity <= 0) {
        setValidationError(`A Quantidade do produto "${item.name}" deve ser maior que zero.`);
        return false;
      }

      if (item.type === 'dimensao') {
        if (!item.lengthMm || item.lengthMm <= 0) {
          setValidationError(`O Comprimento em mm do produto "${item.name}" deve ser maior que zero.`);
          return false;
        }
        if (!item.widthMm || item.widthMm <= 0) {
          setValidationError(`A Largura em mm do produto "${item.name}" deve ser maior que zero.`);
          return false;
        }
        if (item.pricePerM2 === undefined || item.pricePerM2 < 0) {
          setValidationError(`O Valor por m² do produto "${item.name}" deve ser preenchido.`);
          return false;
        }
      } else {
        if (item.unitPrice === undefined || item.unitPrice < 0) {
          setValidationError(`O Valor Unitário do produto "${item.name}" deve ser preenchido.`);
          return false;
        }
      }
    }

    return true;
  };

  const executeSaveQuote = () => {
    onSave({
      id: initialQuote?.id,
      code: initialQuote?.code,
      clientName: clientName.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      date,
      status,
      items,
      discountType,
      discountValue,
      subtotal,
      discountAmount,
      total: finalTotal,
      downPaymentType: hasDownPayment ? downPaymentType : undefined,
      downPaymentValue: hasDownPayment && typeof downPaymentValue === 'number' ? downPaymentValue : undefined,
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

    // Verificar se o cliente foi informado e se já está cadastrado
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

    const tempQuote: Quote = {
      id: initialQuote?.id || 'temp-preview',
      code: initialQuote?.code || 'ORC-RASCUNHO',
      clientName: clientName.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      date,
      createdAt: initialQuote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status,
      items,
      discountType,
      discountValue,
      subtotal,
      discountAmount,
      total: finalTotal,
      downPaymentType: hasDownPayment ? downPaymentType : undefined,
      downPaymentValue: hasDownPayment && typeof downPaymentValue === 'number' ? downPaymentValue : undefined,
      downPaymentAmount: hasDownPayment ? downPaymentAmount : undefined,
      downPaymentMethod: hasDownPayment ? downPaymentMethod : undefined,
      notes: notes.trim() || undefined,
    };

    onPreview(tempQuote);
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 px-4 sm:px-6">
      
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {initialQuote ? `Editar Orçamento ${initialQuote.code}` : 'Novo Orçamento'}
            </h1>
            <p className="text-xs text-slate-500">
              {initialQuote ? 'Atualize as informações do orçamento existente' : 'Preencha os dados e adicione os produtos/serviços'}
            </p>
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
        
        {/* SEÇÃO 1: Dados do Cliente e Data */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>1. Informações do Cliente e Data</span>
            <span className="text-xs font-normal text-slate-400">Campos identificadores</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <ClientSelect
                clients={registeredClients}
                selectedName={clientName}
                selectedPhone={clientPhone}
                onSelectClient={(c) => {
                  setClientName(c.name);
                  if (c.phone) setClientPhone(c.phone);
                }}
                onClear={() => {
                  setClientName('');
                  setClientPhone('');
                }}
                onOpenNewClientModal={() => setShowClientModal(true)}
                placeholder="Buscar ou selecionar cliente..."
                label="Cliente do Orçamento"
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
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white capitalize transition-colors"
              >
                <option value="rascunho">Rascunho</option>
                <option value="aprovado">Aprovado</option>
                <option value="convertido">Convertido em Venda</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: Produtos do Orçamento */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">2. Produtos e Serviços</h2>
              <p className="text-xs text-slate-500">Adicione itens com cálculo de área (m²) ou unidades simples.</p>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Adicionar Produto</span>
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 sm:p-5 relative transition-all"
              >
                <div className="flex items-center justify-between mb-3 gap-2 pb-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold bg-slate-900 text-amber-400 px-2.5 py-1 rounded-md">
                      Item #{index + 1}
                    </span>

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
                        Dimensão (m²)
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
                        Simples (Unidade)
                      </button>
                    </div>

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

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                      Nome do Produto <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      placeholder={item.type === 'dimensao' ? 'Ex: Vidro 8mm Incolor Temperado' : 'Ex: Espelho Lapidado 60cm'}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                      Detalhes / Descrição
                    </label>
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Ex: Lapidado / Bisotê"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {item.type === 'dimensao' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Comprimento (mm)</label>
                      <input
                        type="number"
                        min="1"
                        value={item.lengthMm || ''}
                        onChange={(e) => handleItemChange(index, 'lengthMm', parseFloat(e.target.value) || 0)}
                        placeholder="1200"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Largura (mm)</label>
                      <input
                        type="number"
                        min="1"
                        value={item.widthMm || ''}
                        onChange={(e) => handleItemChange(index, 'widthMm', parseFloat(e.target.value) || 0)}
                        placeholder="800"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-amber-700 mb-1">Área (m²)</label>
                      <div className="w-full bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 text-amber-900 font-mono font-bold text-sm">
                        {item.areaM2 !== undefined ? item.areaM2.toFixed(3) : '0.000'} m²
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Qtd. Peças</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10) || 1)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Valor por m² (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.pricePerM2 !== undefined ? item.pricePerM2 : ''}
                        onChange={(e) => handleItemChange(index, 'pricePerM2', parseFloat(e.target.value) || 0)}
                        placeholder="150.00"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Quantidade</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10) || 1)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Valor Unitário (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice !== undefined ? item.unitPrice : ''}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="100.00"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex flex-col justify-end">
                      <div className="text-xs text-slate-500 font-medium">Subtotal Item:</div>
                      <div className="text-sm text-slate-800 font-bold font-mono">
                        {item.quantity} x R$ {(item.unitPrice || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 mt-3 text-right">
                  <span className="text-xs text-slate-500 font-semibold">Total do Item:</span>
                  <span className="text-sm font-black text-slate-900 font-mono">
                    R$ {(item.totalPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="w-full mt-4 py-3 border-2 border-dashed border-slate-200 hover:border-amber-500 rounded-xl text-slate-600 hover:text-amber-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Mais Um Produto</span>
          </button>
        </div>

        {/* SEÇÃO 3: Entrada / Sinal + Observações + Resumo */}
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
                        placeholder={downPaymentType === 'percent' ? 'Ex: 25' : 'Ex: 1500,00'}
                        value={downPaymentValue}
                        onChange={(e) => setDownPaymentValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500 font-mono"
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
                      <span className="font-mono font-bold text-sm">
                        {downPaymentAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Observações e Anotações Internas da Obra */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Observações para o Cliente (Visível no Orçamento)</h2>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Condições de pagamento, prazos de entrega, validade da proposta..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="bg-amber-50/60 border border-amber-300 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs font-bold text-amber-950 uppercase tracking-wider">Anotações da Obra / Serviço (Internas da Vidraçaria)</h2>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">Somente Equipe</span>
                </div>
                <textarea
                  rows={3}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Ex: Medidas especiais, cor do alumínio, endereço da instalação, particularidades da obra..."
                  className="w-full bg-white border border-amber-300 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="bg-white border-2 border-amber-500/50 rounded-2xl p-5 shadow-md flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-600" />
                <span>3. Resumo Financeiro</span>
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-slate-900">
                    R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Desconto:</span>
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
                      value={discountValue || ''}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      placeholder={discountType === 'percent' ? '0%' : 'R$ 0,00'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  {discountAmount > 0 && (
                    <div className="text-right text-xs font-semibold text-emerald-600 font-mono">
                      - R$ {discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t-2 border-slate-900 flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm">Valor Total do Orçamento:</span>
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
    </div>
  );
};
