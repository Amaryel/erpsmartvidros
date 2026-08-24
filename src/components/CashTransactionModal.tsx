import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Tag,
  FileText,
  User,
  X,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';
import {
  CashTransaction,
  CashTransactionType,
  CashPaymentMethod,
  CashCategoryItem,
  AppUser
} from '../types';
import {
  getCashCategories,
  createCashTransaction,
  updateCashTransaction,
  saveCashCategory
} from '../services/data/repositories/cashRepository';

interface CashTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transaction: CashTransaction) => void;
  editingTransaction?: CashTransaction | null;
  defaultType?: CashTransactionType;
  prefilledData?: Partial<CashTransaction> | null;
  currentUser?: AppUser | null;
}

export const CashTransactionModal: React.FC<CashTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingTransaction,
  defaultType = 'saida',
  prefilledData,
  currentUser,
}) => {
  const [type, setType] = useState<CashTransactionType>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<CashPaymentMethod>('dinheiro');
  const [clientName, setClientName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [editReason, setEditReason] = useState<string>('');

  const [categories, setCategories] = useState<CashCategoryItem[]>([]);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cats = getCashCategories();
      setCategories(cats);
      setError(null);
      setIsCreatingCategory(false);
      setNewCategoryName('');

      if (editingTransaction) {
        setType(editingTransaction.type);
        setAmount(editingTransaction.amount.toString());
        setCategoryId(editingTransaction.categoryId);
        setDescription(editingTransaction.description);
        setDate(editingTransaction.date);
        setPaymentMethod(editingTransaction.paymentMethod);
        setClientName(editingTransaction.clientName || '');
        setNotes(editingTransaction.notes || '');
        setEditReason('');
      } else if (prefilledData) {
        setType(prefilledData.type || defaultType);
        setAmount(prefilledData.amount ? prefilledData.amount.toString() : '');
        setCategoryId(prefilledData.categoryId || '');
        setDescription(prefilledData.description || '');
        setDate(prefilledData.date || new Date().toISOString().split('T')[0]);
        setPaymentMethod(prefilledData.paymentMethod || 'dinheiro');
        setClientName(prefilledData.clientName || '');
        setNotes(prefilledData.notes || '');
        setEditReason('');
      } else {
        setType(defaultType);
        setAmount('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('dinheiro');
        setClientName('');
        setNotes('');
        setEditReason('');
        
        // Categoria padrão
        const matchingCats = cats.filter((c) => c.type === defaultType || c.type === 'ambos');
        if (matchingCats.length > 0) {
          setCategoryId(matchingCats[0].id);
        }
      }
    }
  }, [isOpen, editingTransaction, prefilledData, defaultType]);

  // Atualizar categoria padrão quando muda o tipo
  const handleTypeChange = (newType: CashTransactionType) => {
    setType(newType);
    const matchingCats = categories.filter((c) => c.type === newType || c.type === 'ambos');
    if (matchingCats.length > 0) {
      // Se a categoria atual não pertence ao novo tipo, muda para a primeira compatível
      const currentCat = categories.find((c) => c.id === categoryId);
      if (!currentCat || (currentCat.type !== 'ambos' && currentCat.type !== newType)) {
        setCategoryId(matchingCats[0].id);
      }
    }
  };

  const handleCreateNewCategory = () => {
    if (!newCategoryName.trim()) return;

    const created = saveCashCategory({
      id: '',
      name: newCategoryName.trim(),
      type: type,
    });

    const updatedCats = getCashCategories();
    setCategories(updatedCats);
    setCategoryId(created.id);
    setNewCategoryName('');
    setIsCreatingCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Por favor, informe um valor válido maior que zero.');
      return;
    }

    if (!description.trim()) {
      setError('Por favor, informe uma descrição para o lançamento.');
      return;
    }

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const categoryName = selectedCategory ? selectedCategory.name : (type === 'saida' ? 'Outras Despesas' : 'Venda');

    if (editingTransaction) {
      if (!editReason.trim()) {
        setError('Por favor, informe o motivo da alteração desta movimentação para registro de auditoria.');
        return;
      }

      const updated = updateCashTransaction(
        editingTransaction.id,
        {
          type,
          amount: numericAmount,
          categoryId: categoryId || 'cat-custom',
          categoryName,
          description: description.trim(),
          date,
          paymentMethod,
          clientName: clientName.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        editReason.trim(),
        currentUser?.name || 'Administrador'
      );

      if (updated) {
        onSuccess(updated);
        onClose();
      }
    } else {
      const created = createCashTransaction({
        type,
        amount: numericAmount,
        categoryId: categoryId || (type === 'saida' ? 'cat-desp-15' : 'cat-ent-1'),
        categoryName,
        description: description.trim(),
        date,
        paymentMethod,
        clientName: clientName.trim() || undefined,
        notes: notes.trim() || undefined,
        companyId: currentUser?.companyId || 'comp-smart-vidros-001',
        userId: currentUser?.id || 'usr-superadmin-001',
        userName: currentUser?.name || 'Administrador',
      });

      onSuccess(created);
      onClose();
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter(
    (c) => c.type === 'ambos' || c.type === type
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
        
        {/* Topo do Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl shadow-md font-bold ${
                type === 'entrada'
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-rose-600 text-white shadow-rose-600/30'
              }`}
            >
              {type === 'entrada' ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {editingTransaction ? 'Editar Movimentação' : type === 'entrada' ? 'Nova Entrada no Caixa' : 'Nova Despesa / Saída'}
              </h2>
              <p className="text-xs text-slate-500">
                {editingTransaction
                  ? 'Toda alteração ficará registrada no histórico de auditoria'
                  : 'Lançamento financeiro direto no saldo do caixa'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Seletor de Tipo: Entrada vs Saída */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => handleTypeChange('entrada')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs transition-all ${
                type === 'entrada'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>+ ENTRADA</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('saida')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs transition-all ${
                type === 'saida'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>- SAÍDA / DESPESA</span>
            </button>
          </div>

          {/* Valor (R$) & Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Valor (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                  R$
                </span>
                <input
                  type="text"
                  required
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-black text-base focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Data do Lançamento *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-xs focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Categoria */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>Categoria *</span>
              </label>

              {!isCreatingCategory ? (
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(true)}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Nova Categoria</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(false)}
                  className="text-[11px] font-bold text-slate-500 hover:underline"
                >
                  Cancelar
                </button>
              )}
            </div>

            {isCreatingCategory ? (
              <div className="flex gap-2 p-2 bg-amber-50 rounded-xl border border-amber-200">
                <input
                  type="text"
                  placeholder="Nome da nova categoria..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 bg-white border border-amber-300 rounded-lg focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleCreateNewCategory}
                  className="px-3 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-lg shadow-sm"
                >
                  Adicionar
                </button>
              </div>
            ) : (
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-xs focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Descrição da Movimentação *
            </label>
            <input
              type="text"
              required
              placeholder={type === 'saida' ? 'Ex: Gasolina do carro da entrega' : 'Ex: Recebimento referente ao serviço'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
            />
          </div>

          {/* Forma de Pagamento & Cliente/Contato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Forma de Pagamento *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as CashPaymentMethod)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-xs focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">PIX</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="transferencia">Transferência Bancária</option>
                <option value="cheque">Cheque</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Cliente / Fornecedor (Opcional)
              </label>
              <input
                type="text"
                placeholder="Nome do cliente ou fornecedor"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              />
            </div>
          </div>

          {/* Observações Opcionais */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Observações Adicionais (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Detalhes ou anotações internas sobre este lançamento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
            />
          </div>

          {/* Justificativa de Edição (Obrigatório caso esteja editando) */}
          {editingTransaction && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl space-y-1.5">
              <label className="text-xs font-black text-amber-950 block">
                Motivo da Alteração (Obrigatório para Auditoria) *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Correção de valor informado incorretamente..."
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-slate-900 text-xs font-medium focus:outline-hidden"
              />
            </div>
          )}

          {/* Mensagem de Erro */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Botões do Rodapé */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={`px-6 py-2.5 font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2 text-white ${
                type === 'entrada'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingTransaction ? 'Salvar Alterações' : 'Confirmar Lançamento'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
