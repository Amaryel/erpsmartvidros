import React, { useState, useEffect } from 'react';
import { Save, FileText, ArrowLeft, Plus, CheckCircle2, DollarSign, User, Calendar, MessageSquare, Briefcase } from 'lucide-react';
import { Receipt, DownPaymentType, Client } from '../types';
import { getServicesList, saveReceipt, getClients } from '../services/storage';

interface ReceiptFormProps {
  initialData?: Receipt | null;
  onSaveSuccess: (savedReceipt: Receipt, shouldOpenView?: boolean) => void;
  onCancel: () => void;
}

export const ReceiptForm: React.FC<ReceiptFormProps> = ({
  initialData,
  onSaveSuccess,
  onCancel,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [amount, setAmount] = useState<number | ''>('');

  // Serviço
  const [services, setServices] = useState<string[]>([]);
  const [registeredClients, setRegisteredClients] = useState<Client[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [customService, setCustomService] = useState('');
  const [isCustomService, setIsCustomService] = useState(false);

  // Entrada
  const [hasDownPayment, setHasDownPayment] = useState(false);
  const [downPaymentType, setDownPaymentType] = useState<DownPaymentType>('percent');
  const [downPaymentValue, setDownPaymentValue] = useState<number | ''>('');

  // Data e Observações
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Erros de Validação
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Carregar lista de serviços e clientes
  useEffect(() => {
    const list = getServicesList();
    setServices(list);
    setRegisteredClients(getClients());
    if (list.length > 0 && !selectedService) {
      setSelectedService(list[0]);
    }
  }, []);

  // Se houver dados iniciais (Edição)
  useEffect(() => {
    if (initialData) {
      setClientName(initialData.clientName || '');
      setClientPhone(initialData.clientPhone || '');
      setAmount(initialData.amount || '');
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setNotes(initialData.notes || '');

      // Tratar serviço
      if (initialData.service) {
        const list = getServicesList();
        if (list.includes(initialData.service)) {
          setSelectedService(initialData.service);
          setIsCustomService(false);
        } else {
          setIsCustomService(true);
          setCustomService(initialData.service);
        }
      }

      // Tratar entrada
      if (initialData.downPaymentAmount && initialData.downPaymentAmount > 0) {
        setHasDownPayment(true);
        setDownPaymentType(initialData.downPaymentType || 'percent');
        setDownPaymentValue(initialData.downPaymentValue ?? '');
      }
    }
  }, [initialData]);

  // Cálculo do valor da entrada em R$
  const calculateDownPaymentAmount = (): number => {
    if (!hasDownPayment || !amount || !downPaymentValue || typeof amount !== 'number' || typeof downPaymentValue !== 'number') {
      return 0;
    }
    if (downPaymentType === 'percent') {
      return (amount * downPaymentValue) / 100;
    }
    return Math.min(amount, downPaymentValue);
  };

  const downPaymentCalculated = calculateDownPaymentAmount();

  // Validar Campos
  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!clientName.trim()) {
      newErrors.clientName = 'Nome do cliente é obrigatório.';
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      newErrors.amount = 'Informe um valor numérico válido maior que zero.';
    }

    if (isCustomService && !customService.trim()) {
      newErrors.service = 'Informe a descrição do serviço personalizado.';
    }

    if (hasDownPayment) {
      if (!downPaymentValue || typeof downPaymentValue !== 'number' || downPaymentValue <= 0) {
        newErrors.downPayment = 'Informe a porcentagem ou valor da entrada.';
      } else if (downPaymentType === 'percent' && downPaymentValue > 100) {
        newErrors.downPayment = 'Porcentagem de entrada não pode ser maior que 100%.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submeter formulário
  const handleSubmit = (shouldOpenView: boolean = false) => {
    if (!validate()) return;

    const finalService = isCustomService ? customService.trim() : selectedService;

    const receiptToSave = {
      id: initialData?.id,
      code: initialData?.code,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || undefined,
      amount: Number(amount),
      service: finalService,
      downPaymentType: hasDownPayment ? downPaymentType : undefined,
      downPaymentValue: hasDownPayment && typeof downPaymentValue === 'number' ? downPaymentValue : undefined,
      downPaymentAmount: hasDownPayment ? downPaymentCalculated : undefined,
      date,
      notes: notes.trim() || undefined,
    };

    const saved = saveReceipt(receiptToSave);
    onSaveSuccess(saved, shouldOpenView);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 px-4 sm:px-6">
      
      {/* Cabeçalho da Tela */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 sm:p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2.5 text-slate-700 hover:bg-slate-100 bg-slate-50 border border-slate-200 rounded-xl transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {initialData ? `Editar Recibo (${initialData.code})` : 'Novo Recibo'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Gere recibos de pagamento com valor, serviços e entradas personalizadas.
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          Smart Vidros
        </span>
      </div>

      {/* Formulário Principal */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
        
        {/* Bloco 1: Cliente */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <User className="w-4 h-4 text-amber-600" /> 1. Dados do Cliente
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Nome do Cliente <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                list="receipt-clients-datalist"
                placeholder="Ex: João da Silva"
                value={clientName}
                onChange={(e) => {
                  const val = e.target.value;
                  setClientName(val);
                  const matched = registeredClients.find(
                    (c) => c.name.toLowerCase() === val.trim().toLowerCase()
                  );
                  if (matched) {
                    setClientPhone(matched.phone || matched.whatsapp || '');
                  }
                }}
                className={`w-full bg-slate-50 border ${
                  errors.clientName ? 'border-red-500' : 'border-slate-200'
                } rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors`}
              />
              <datalist id="receipt-clients-datalist">
                {registeredClients.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.phone ? `${c.phone}` : ''}
                  </option>
                ))}
              </datalist>
              {errors.clientName && (
                <p className="text-xs text-red-600 mt-1 font-medium">{errors.clientName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Telefone / WhatsApp (Opcional)
              </label>
              <input
                type="text"
                placeholder="(89) 9 9999-9999"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Valor Recebido e Data */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <DollarSign className="w-4 h-4 text-amber-600" /> 2. Valor Recebido e Data
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Valor do Recibo (R$) <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-amber-600 font-bold text-sm">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className={`w-full bg-slate-50 border ${
                    errors.amount ? 'border-red-500' : 'border-slate-200'
                  } rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 font-mono font-bold text-base focus:outline-none focus:border-amber-500 focus:bg-white transition-colors`}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-red-600 mt-1 font-medium">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Data do Recibo <span className="text-amber-600">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Bloco 3: Serviço Relacionado */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Briefcase className="w-4 h-4 text-amber-600" /> 3. Serviço
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="serviceType"
                  checked={!isCustomService}
                  onChange={() => setIsCustomService(false)}
                  className="accent-amber-500"
                />
                <span>Selecionar da lista padrão</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="serviceType"
                  checked={isCustomService}
                  onChange={() => setIsCustomService(true)}
                  className="accent-amber-500"
                />
                <span className="text-amber-800 font-bold">+ Outro serviço personalizado</span>
              </label>
            </div>

            {!isCustomService ? (
              <div>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                >
                  {services.map((srv, idx) => (
                    <option key={idx} value={srv}>
                      {srv}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Digite o serviço (ex: Troca de vidro fumê da sacada)"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  className={`w-full bg-slate-50 border ${
                    errors.service ? 'border-red-500' : 'border-slate-200'
                  } rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors`}
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  💡 Este novo serviço será automaticamente salvo na lista para facilidade nos próximos recibos.
                </p>
                {errors.service && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{errors.service}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bloco 4: Entrada / Sinal (Opcional) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600" /> 4. Entrada / Sinal (Opcional)
            </h2>

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
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
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
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    {downPaymentType === 'percent' ? 'Porcentagem de Entrada (%)' : 'Valor da Entrada (R$)'}
                  </label>
                  <div className="relative">
                    {downPaymentType === 'fixed' && (
                      <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs">R$</span>
                    )}
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={downPaymentType === 'percent' ? 'Ex: 30' : 'Ex: 500,00'}
                      value={downPaymentValue}
                      onChange={(e) =>
                        setDownPaymentValue(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className={`w-full bg-white border ${
                        errors.downPayment ? 'border-red-500' : 'border-slate-200'
                      } rounded-xl ${
                        downPaymentType === 'fixed' ? 'pl-9' : 'px-3.5'
                      } py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 font-mono`}
                    />
                    {downPaymentType === 'percent' && (
                      <span className="absolute right-3.5 top-2.5 text-slate-500 text-xs font-bold">%</span>
                    )}
                  </div>
                  {errors.downPayment && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{errors.downPayment}</p>
                  )}
                </div>
              </div>

              {/* Resumo Calculado da Entrada */}
              {amount && typeof amount === 'number' && amount > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-amber-900 font-medium">Entrada Calculada em Dinheiro:</span>
                  <span className="font-mono font-bold text-amber-900 text-sm">
                    {downPaymentCalculated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bloco 5: Observações */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-600" /> Observações do Recibo (Opcional)
          </label>
          <textarea
            rows={3}
            placeholder="Ex: Pagamento referente à primeira parcela. Restante na entrega do serviço."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
          ></textarea>
        </div>

        {/* Botoes de Acao */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-5 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-semibold rounded-xl transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Apenas Salvar</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-black rounded-xl shadow-md transition-all active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>Gerar Recibo / PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
};
