import React, { useState } from 'react';
import {
  BadgeDollarSign,
  PlusCircle,
  Search,
  Eye,
  Edit,
  Trash2,
  Share2,
  Calendar,
  User,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Building2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Payslip, PaymentTypePayslip, PaymentMethod } from '../types';

interface PayslipListProps {
  payslips: Payslip[];
  onNewPayslip: () => void;
  onViewPayslip: (payslip: Payslip) => void;
  onEditPayslip: (payslip: Payslip) => void;
  onDeletePayslip: (id: string) => void;
  onOpenSettings?: () => void;
}

export const PayslipList: React.FC<PayslipListProps> = ({
  payslips,
  onNewPayslip,
  onViewPayslip,
  onEditPayslip,
  onDeletePayslip,
  onOpenSettings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [monthFilter, setMonthFilter] = useState<string>('todos');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Extrair meses únicos disponíveis para filtro
  const uniqueMonths = Array.from(
    new Set(payslips.map((p) => p.referenceMonth).filter(Boolean))
  );

  // Filtragem
  const filteredPayslips = payslips.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.code.toLowerCase().includes(term) ||
      p.employeeName.toLowerCase().includes(term) ||
      p.employeeRole.toLowerCase().includes(term) ||
      (p.employeeCpf && p.employeeCpf.includes(searchTerm));

    const matchesType = typeFilter === 'todos' || p.paymentType === typeFilter;
    const matchesMonth = monthFilter === 'todos' || p.referenceMonth === monthFilter;

    return matchesSearch && matchesType && matchesMonth;
  });

  // Métricas
  const totalPaid = filteredPayslips.reduce((acc, p) => acc + (p.netAmount || 0), 0);
  const totalEarnings = filteredPayslips.reduce((acc, p) => acc + (p.totalEarnings || 0), 0);
  const totalDeductions = filteredPayslips.reduce((acc, p) => acc + (p.totalDeductions || 0), 0);

  const getPaymentTypeLabel = (type: PaymentTypePayslip): { label: string; bg: string } => {
    switch (type) {
      case 'salario':
        return { label: 'Salário Mensal', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'adiantamento':
        return { label: 'Vale / Adiantamento', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'comissao':
        return { label: 'Comissão de Vendas', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'diaria':
        return { label: 'Diária de Instalação', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'servico':
        return { label: 'Serviço / Produção', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'decimo_terceiro':
        return { label: '13º Salário', bg: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'ferias':
        return { label: 'Férias', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      default:
        return { label: 'Outro Pagamento', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const getMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'pix':
        return <span className="text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full">PIX</span>;
      case 'dinheiro':
        return <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Dinheiro</span>;
      case 'transferencia':
        return <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">Transferência</span>;
      default:
        return <span className="text-[10px] font-bold bg-slate-500/10 text-slate-300 border border-slate-500/20 px-2 py-0.5 rounded-full">{method.toUpperCase()}</span>;
    }
  };

  const handleShareWhatsApp = (p: Payslip) => {
    const netFormatted = p.netAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const msg = `*SMART VIDROS - COMPROVANTE DE PAGAMENTO / CONTRACHEQUE*\n\n` +
      `👤 *Colaborador:* ${p.employeeName}\n` +
      `💼 *Cargo:* ${p.employeeRole}\n` +
      `📄 *Contracheque:* ${p.code}\n` +
      `📅 *Mês de Referência:* ${p.referenceMonth}\n` +
      `🗓️ *Data do Pagamento:* ${new Date(p.paymentDate + 'T12:00:00').toLocaleDateString('pt-BR')}\n` +
      `💵 *Salário Base/Bruto:* ${(p.totalEarnings || p.baseSalary).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n` +
      `🔻 *Total Descontos:* ${(p.totalDeductions || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n` +
      `💰 *VALOR LÍQUIDO PAGO:* *${netFormatted}*\n` +
      `💳 *Forma de Pagamento:* ${p.paymentMethod.toUpperCase()}\n\n` +
      `_Comprovante emitido e registrado no sistema da Smart Vidros._`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Gestão de Pessoal & Folha
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Contracheques & Pagamentos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Emita, controle e imprima os holerites, salários, diárias e vales dos funcionários da Smart Vidros.
          </p>
        </div>

        <button
          onClick={onNewPayslip}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 text-xs shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Emitir Novo Contracheque</span>
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Líquido Pago */}
        <div className="bg-gradient-to-br from-slate-950 to-zinc-900 text-white rounded-3xl p-5 border border-amber-500/20 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Líquido Pago</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
            {totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className="text-[11px] text-amber-400 font-semibold mt-1">
            {filteredPayslips.length} {filteredPayslips.length === 1 ? 'pagamento emitido' : 'pagamentos emitidos'}
          </div>
        </div>

        {/* Card 2: Total Bruto / Proventos */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Bruto (Proventos)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {totalEarnings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Salários base, diárias e horas extras
          </div>
        </div>

        {/* Card 3: Total Descontos */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Descontos / Vales</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 mt-2">
            {totalDeductions.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Adiantamentos, vales e deduções
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        {/* Campo de Pesquisa */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por funcionário, cargo, CPF ou código..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filtro por Tipo */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full md:w-48 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
        >
          <option value="todos">Todos os Tipos</option>
          <option value="salario">Salário Mensal</option>
          <option value="adiantamento">Vale / Adiantamento</option>
          <option value="diaria">Diária de Instalação</option>
          <option value="comissao">Comissão</option>
          <option value="servico">Serviço / Produção</option>
          <option value="decimo_terceiro">13º Salário</option>
          <option value="ferias">Férias</option>
        </select>

        {/* Filtro por Mês */}
        {uniqueMonths.length > 0 && (
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full md:w-44 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="todos">Todos os Meses</option>
            {uniqueMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Lista de Contracheques */}
      {filteredPayslips.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-4">
            <BadgeDollarSign className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-900">
            Nenhum contracheque encontrado
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            {searchTerm || typeFilter !== 'todos' || monthFilter !== 'todos'
              ? 'Tente ajustar os termos de pesquisa ou filtros.'
              : 'Cadastre o primeiro holerite de pagamento para o funcionário ou instalador.'}
          </p>
          <button
            onClick={onNewPayslip}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-2xl shadow-md text-xs transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Emitir Primeiro Contracheque</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3.5 px-4">Código & Mês</th>
                  <th className="py-3.5 px-4">Funcionário & Cargo</th>
                  <th className="py-3.5 px-4">Tipo & Pagamento</th>
                  <th className="py-3.5 px-4 text-right">Bruto</th>
                  <th className="py-3.5 px-4 text-right">Descontos</th>
                  <th className="py-3.5 px-4 text-right">Líquido Pago</th>
                  <th className="py-3.5 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPayslips.map((p) => {
                  const typeBadge = getPaymentTypeLabel(p.paymentType);
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-amber-50/40 transition-colors group"
                    >
                      {/* Código & Mês */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900">{p.code}</div>
                        <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-amber-600" />
                          <span>{p.referenceMonth}</span>
                        </div>
                      </td>

                      {/* Funcionário & Cargo */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{p.employeeName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium ml-5">
                          {p.employeeRole} {p.employeeCpf && `• CPF: ${p.employeeCpf}`}
                        </div>
                      </td>

                      {/* Tipo & Pagamento */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeBadge.bg}`}
                          >
                            {typeBadge.label}
                          </span>
                          {getMethodBadge(p.paymentMethod)}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          Pago em: {new Date(p.paymentDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </div>
                      </td>

                      {/* Bruto */}
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        {(p.totalEarnings || p.baseSalary).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </td>

                      {/* Descontos */}
                      <td className="py-3.5 px-4 text-right font-medium text-rose-600">
                        {p.totalDeductions > 0
                          ? `- ${p.totalDeductions.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}`
                          : 'R$ 0,00'}
                      </td>

                      {/* Líquido Pago */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-block font-black text-slate-950 bg-emerald-100/80 border border-emerald-300/80 px-2.5 py-1 rounded-xl shadow-xs">
                          {p.netAmount.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Visualizar / Imprimir */}
                          <button
                            onClick={() => onViewPayslip(p)}
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Visualizar e Imprimir Contracheque"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* WhatsApp */}
                          <button
                            onClick={() => handleShareWhatsApp(p)}
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Enviar Comprovante via WhatsApp"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          {/* Editar */}
                          <button
                            onClick={() => onEditPayslip(p)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar Dados"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Excluir */}
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Excluir Contracheque"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">
                Excluir este contracheque?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Esta ação apagará permanentemente o registro de pagamento selecionado.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeletePayslip(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-rose-600/20"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
