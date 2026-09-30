import React, { useState } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  Calendar,
  User,
  CreditCard,
  DollarSign,
  FileText,
  BadgeDollarSign,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Payslip, PayslipItem, PaymentTypePayslip, PaymentMethod } from '../types';

interface PayslipFormProps {
  payslip?: Payslip | null;
  onSave: (payslipData: Omit<Payslip, 'id' | 'code' | 'createdAt' | 'updatedAt'> & { id?: string; code?: string }, openViewModal?: boolean) => void;
  onCancel: () => void;
}

const COMMON_ROLES = [
  'Vidraceiro & Instalador',
  'Cortador de Vidros',
  'Instalador de Esquadrias',
  'Ajudante de Instalação',
  'Vendedor Externo',
  'Gerente de Produção',
  'Auxiliar Geral',
];

const COMMON_MONTHS = [
  'Janeiro / 2026',
  'Fevereiro / 2026',
  'Março / 2026',
  'Abril / 2026',
  'Maio / 2026',
  'Junho / 2026',
  'Julho / 2026',
  'Agosto / 2026',
  'Setembro / 2026',
  'Outubro / 2026',
  'Novembro / 2026',
  'Dezembro / 2026',
];

export const PayslipForm: React.FC<PayslipFormProps> = ({
  payslip,
  onSave,
  onCancel,
}) => {
  const isEditing = Boolean(payslip?.id);

  // Estados dos campos
  const [employeeName, setEmployeeName] = useState(payslip?.employeeName || '');
  const [employeeRole, setEmployeeRole] = useState(payslip?.employeeRole || 'Vidraceiro & Instalador');
  const [employeeCpf, setEmployeeCpf] = useState(payslip?.employeeCpf || '');
  const [employeePix, setEmployeePix] = useState(payslip?.employeePix || '');
  
  // Mês de referência atual padrão
  const currentMonthIdx = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const defaultMonthName = `${['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][currentMonthIdx]} / ${currentYear}`;
  const [referenceMonth, setReferenceMonth] = useState(payslip?.referenceMonth || defaultMonthName);

  const [paymentType, setPaymentType] = useState<PaymentTypePayslip>(payslip?.paymentType || 'salario');
  const [paymentDate, setPaymentDate] = useState(
    payslip?.paymentDate || new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(payslip?.paymentMethod || 'pix');
  const [baseSalary, setBaseSalary] = useState<number | string>(payslip?.baseSalary ?? 2000);

  // Proventos / Adicionais
  const [earnings, setEarnings] = useState<PayslipItem[]>(
    payslip?.earnings && payslip.earnings.length > 0
      ? payslip.earnings
      : []
  );

  // Descontos
  const [deductions, setDeductions] = useState<PayslipItem[]>(
    payslip?.deductions && payslip.deductions.length > 0
      ? payslip.deductions
      : []
  );

  const [notes, setNotes] = useState(payslip?.notes || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handlers para Proventos
  const handleAddEarning = () => {
    setEarnings([
      ...earnings,
      {
        id: `earn-${Date.now()}`,
        description: 'Horas Extras / Bonificação',
        amount: 0,
      },
    ]);
  };

  const handleUpdateEarning = (index: number, field: 'description' | 'amount', value: any) => {
    const next = [...earnings];
    next[index] = {
      ...next[index],
      [field]: field === 'amount' ? (value === '' ? '' : Number(value)) : value,
    };
    setEarnings(next);
  };

  const handleRemoveEarning = (index: number) => {
    setEarnings(earnings.filter((_, i) => i !== index));
  };

  // Handlers para Descontos
  const handleAddDeduction = () => {
    setDeductions([
      ...deductions,
      {
        id: `ded-${Date.now()}`,
        description: 'Vale / Adiantamento Quinzenal',
        amount: 0,
      },
    ]);
  };

  const handleUpdateDeduction = (index: number, field: 'description' | 'amount', value: any) => {
    const next = [...deductions];
    next[index] = {
      ...next[index],
      [field]: field === 'amount' ? (value === '' ? '' : Number(value)) : value,
    };
    setDeductions(next);
  };

  const handleRemoveDeduction = (index: number) => {
    setDeductions(deductions.filter((_, i) => i !== index));
  };

  // Cálculos em tempo real
  const baseSalaryNum = Number(baseSalary) || 0;
  const earningsSum = earnings.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const totalEarnings = baseSalaryNum + earningsSum;
  const totalDeductions = deductions.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const netAmount = Math.max(0, totalEarnings - totalDeductions);

  const handleSubmit = (e: React.FormEvent, openView: boolean = true) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!employeeName.trim()) {
      setErrorMsg('Por favor, preencha o nome do colaborador/funcionário.');
      return;
    }

    if (!employeeRole.trim()) {
      setErrorMsg('Por favor, informe a função ou cargo do colaborador.');
      return;
    }

    if (baseSalaryNum < 0) {
      setErrorMsg('O salário base não pode ser negativo.');
      return;
    }

    const payload = {
      id: payslip?.id,
      code: payslip?.code,
      employeeName: employeeName.trim(),
      employeeRole: employeeRole.trim(),
      employeeCpf: employeeCpf.trim() || undefined,
      employeePix: employeePix.trim() || undefined,
      referenceMonth: referenceMonth.trim(),
      paymentType,
      paymentDate,
      paymentMethod,
      baseSalary: baseSalaryNum,
      earnings: earnings.map((e) => ({
        ...e,
        amount: Number(e.amount) || 0,
      })),
      deductions: deductions.map((d) => ({
        ...d,
        amount: Number(d.amount) || 0,
      })),
      totalEarnings,
      totalDeductions,
      netAmount,
      notes: notes.trim() || undefined,
    };

    onSave(payload, openView);
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-6 pb-16 animate-fade-in max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
            <BadgeDollarSign className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-tight">
              {isEditing ? `Editar Contracheque ${payslip?.code}` : 'Emitir Novo Contracheque'}
            </h2>
            <p className="text-xs text-slate-500">
              Preencha os valores de remuneração, diárias, proventos e descontos para emissão do holerite oficial.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          title="Cancelar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
          <X className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SEÇÃO 1: DADOS DO COLABORADOR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            1. Dados do Funcionário / Prestador
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Nome Completo do Funcionário *</span>
            </label>
            <input
              type="text"
              required
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Ex: Carlos Eduardo da Silva"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Cargo / Função */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-700">
              Função / Cargo *
            </label>
            <input
              type="text"
              required
              value={employeeRole}
              onChange={(e) => setEmployeeRole(e.target.value)}
              placeholder="Ex: Vidraceiro & Instalador"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            {/* Sugestões Rápidas */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-bold self-center mr-1">Sugestões:</span>
              {COMMON_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setEmployeeRole(role)}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all ${
                    employeeRole === role
                      ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* CPF */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              CPF ou Documento (Opcional)
            </label>
            <input
              type="text"
              value={employeeCpf}
              onChange={(e) => setEmployeeCpf(e.target.value)}
              placeholder="000.000.000-00"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
            />
          </div>

          {/* Chave PIX */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Chave PIX / Conta Bancária (Opcional)
            </label>
            <input
              type="text"
              value={employeePix}
              onChange={(e) => setEmployeePix(e.target.value)}
              placeholder="Ex: Telefone, E-mail ou Chave Aleatória"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: PERÍODO E TIPO DE PAGAMENTO */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calendar className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            2. Período & Detalhes do Pagamento
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mês de Referência */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Mês de Referência *
            </label>
            <input
              type="text"
              required
              value={referenceMonth}
              onChange={(e) => setReferenceMonth(e.target.value)}
              placeholder="Ex: Setembro / 2026"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Tipo de Pagamento */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Tipo de Pagamento *
            </label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as PaymentTypePayslip)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
            >
              <option value="salario">Salário Mensal</option>
              <option value="adiantamento">Vale / Adiantamento</option>
              <option value="diaria">Diária de Instalação</option>
              <option value="comissao">Comissão de Vendas</option>
              <option value="servico">Serviços Prestados / Obra</option>
              <option value="decimo_terceiro">13º Salário</option>
              <option value="ferias">Férias</option>
              <option value="outro">Outro Pagamento</option>
            </select>
          </div>

          {/* Data do Pagamento */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Data do Pagamento *
            </label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-1.5 md:col-span-3">
            <label className="text-xs font-bold text-slate-700">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'pix', label: 'PIX Instantâneo' },
                { id: 'dinheiro', label: 'Dinheiro em Espécie' },
                { id: 'transferencia', label: 'Transferência Bancária' },
                { id: 'cartao_debito', label: 'Cartão / Outro' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    paymentMethod === m.id
                      ? 'bg-amber-500/15 text-amber-900 border-amber-500 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO 3: VALORES, PROVENTOS E DESCONTOS */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <DollarSign className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            3. Discriminação de Verbas & Valores (R$)
          </h3>
        </div>

        {/* Salário Base / Diária Principal */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="text-xs font-black text-slate-900">
              Salário Base / Valor Principal do Pagamento (R$)
            </label>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Valor fixo contratual ou somatório de diárias antes de adicionais e descontos.
            </p>
          </div>
          <div className="relative w-full sm:w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-right"
            />
          </div>
        </div>

        {/* PROVENTOS ADICIONAIS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>+ Proventos Adicionais (Horas Extras, Comissões, Bônus)</span>
            </span>
            <button
              type="button"
              onClick={handleAddEarning}
              className="text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-xl transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Provento</span>
            </button>
          </div>

          {earnings.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic bg-slate-50/50 p-3 rounded-xl border border-dashed border-slate-200 text-center">
              Nenhum adicional informado (clique em "+ Adicionar Provento" se houver horas extras, comissão ou ajuda de custo).
            </p>
          ) : (
            <div className="space-y-2">
              {earnings.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdateEarning(idx, 'description', e.target.value)}
                    placeholder="Descrição do adicional (ex: Horas Extras de Sábado)"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                  <div className="relative w-36">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.amount}
                      onChange={(e) => handleUpdateEarning(idx, 'amount', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 text-right focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEarning(idx)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DESCONTOS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>- Descontos & Vales (Adiantamentos Quinzenais, Faltas)</span>
            </span>
            <button
              type="button"
              onClick={handleAddDeduction}
              className="text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1 rounded-xl transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Desconto</span>
            </button>
          </div>

          {deductions.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic bg-slate-50/50 p-3 rounded-xl border border-dashed border-slate-200 text-center">
              Nenhum desconto informado (clique em "+ Adicionar Desconto" se o funcionário pegou vale ou teve faltas).
            </p>
          ) : (
            <div className="space-y-2">
              {deductions.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdateDeduction(idx, 'description', e.target.value)}
                    placeholder="Descrição do desconto (ex: Vale Quinzenal dia 15)"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                  <div className="relative w-36">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-500">- R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.amount}
                      onChange={(e) => handleUpdateDeduction(idx, 'amount', e.target.value)}
                      className="w-full pl-11 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-600 text-right focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDeduction(idx)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RESUMO FINANCEIRO EM TEMPO REAL */}
        <div className="bg-gradient-to-br from-slate-950 to-zinc-900 text-white rounded-3xl p-6 border border-amber-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Resumo Final do Contracheque
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800">
              <span className="text-[11px] text-slate-400 font-bold block">Total de Vencimentos</span>
              <span className="text-base font-black text-white mt-1 block">
                {totalEarnings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>

            <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800">
              <span className="text-[11px] text-rose-400 font-bold block">Total de Descontos</span>
              <span className="text-base font-black text-rose-400 mt-1 block">
                - {totalDeductions.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>

            <div className="bg-gradient-to-r from-amber-500/20 to-emerald-500/20 p-3 rounded-2xl border border-amber-500/40">
              <span className="text-[11px] text-amber-300 font-black block uppercase">Valor Líquido a Pagar</span>
              <span className="text-xl font-black text-emerald-400 mt-1 block">
                {netAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Observações / Descrição dos Serviços
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Pagamento referente a instalações de vidros e esquadrias de Setembro/2026. Quitação integral."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      {/* BOTÕES DE AÇÃO */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={(e) => handleSubmit(e, false)}
          className="w-full sm:w-auto px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Apenas Salvar</span>
        </button>

        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Salvar & Abrir Contracheque</span>
        </button>
      </div>
    </form>
  );
};
