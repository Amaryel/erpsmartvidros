import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Save,
  Download,
  Printer,
  Share2,
  Check,
  Loader2,
  Edit3,
  Eye,
  RefreshCw,
  AlertCircle,
  Building2,
  User,
  Calendar,
  DollarSign,
  Layers,
  Sparkles
} from 'lucide-react';
import { Contract, Sale, Quote, CompanyInfo, Client } from '../types';
import {
  generateContractFromSale,
  generateContractFromQuote,
  saveContract,
  getNextContractCode,
  buildObjectClauseText,
  buildPaymentClauseText,
  buildExecutionDeadlineText,
  CONTRACT_CLAUSE_TEMPLATES,
} from '../services/storage';
import { valorPorExtenso, formatCurrencyWithWords } from '../utils/numberToWords';
import { downloadPdfElement } from '../utils/pdfGenerator';
import { ContractDocumentView } from './ContractDocumentView';

interface ContractGeneratorModalProps {
  initialContract?: Contract | null;
  contract?: Contract | null;
  initialSale?: Sale | null;
  sale?: Sale | null;
  initialQuote?: Quote | null;
  quote?: Quote | null;
  companyInfo: CompanyInfo;
  onClose: () => void;
  onSaveSuccess: (contract: Contract, shouldOpenView?: boolean) => void;
}

function buildDefaultContract(companyInfo: CompanyInfo): Contract {
  const now = new Date().toISOString();
  const dateStr = now.split('T')[0];
  const dObj = new Date();
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const cityDate = `Picos – PI, ${dObj.getDate()} de ${meses[dObj.getMonth()]} de ${dObj.getFullYear()}`;

  return {
    id: '',
    code: getNextContractCode(),
    clientName: '',
    clientDocument: '',
    clientAddress: '',
    clientCity: 'Picos',
    clientState: 'PI',
    clientPhone: '',
    clientEmail: '',
    contractorName: companyInfo.name || 'SMART VIDROS',
    contractorDocument: companyInfo.cnpj || '51.840.669/0001-22',
    contractorAddress: companyInfo.address || 'Rua Povoado Novo Paquetá, Sussuapara – PI',
    title: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS SMART VIDROS',
    objectClauseText: 'O presente contrato tem como objeto a prestação de serviços de fornecimento e instalação de vidros temperados e esquadrias conforme especificações acordadas entre as partes.',
    totalAmount: 0,
    totalAmountInWords: 'zero reais',
    paymentClauseText: 'O pagamento será realizado conforme condições acordadas entre as partes.',
    executionDeadlineText: 'A CONTRATADA compromete-se a executar os serviços dentro do prazo acordado entre as partes, podendo haver prorrogação em caso de força maior, atraso de fornecedores, condições climáticas ou situações alheias à responsabilidade da CONTRATADA.',
    obligationsContractorText: CONTRACT_CLAUSE_TEMPLATES.obligationsContractor,
    obligationsClientText: CONTRACT_CLAUSE_TEMPLATES.obligationsClient,
    rescissionText: CONTRACT_CLAUSE_TEMPLATES.rescission,
    jurisdictionText: CONTRACT_CLAUSE_TEMPLATES.jurisdiction,
    defaultClauseText: CONTRACT_CLAUSE_TEMPLATES.defaultClause,
    cancellationClauseText: CONTRACT_CLAUSE_TEMPLATES.cancellationClause,
    cityDate,
    date: dateStr,
    status: 'ativo',
    createdAt: now,
    updatedAt: now,
  };
}

export const ContractGeneratorModal: React.FC<ContractGeneratorModalProps> = ({
  initialContract,
  contract,
  initialSale,
  sale,
  initialQuote,
  quote,
  companyInfo,
  onClose,
  onSaveSuccess,
}) => {
  const effectiveContract = initialContract || contract;
  const effectiveSale = initialSale || sale;
  const effectiveQuote = initialQuote || quote;

  const createInitialState = (): Contract => {
    if (effectiveContract) {
      return { ...effectiveContract };
    }
    if (effectiveSale) {
      return generateContractFromSale(effectiveSale, null, companyInfo);
    }
    if (effectiveQuote) {
      return generateContractFromQuote(effectiveQuote, null, companyInfo);
    }
    return buildDefaultContract(companyInfo);
  };

  // Inicialização do estado do contrato
  const [contractData, setContractData] = useState<Contract>(createInitialState);

  // Sincronização caso as propriedades mudem
  useEffect(() => {
    if (effectiveContract) {
      setContractData({ ...effectiveContract });
    } else if (effectiveSale) {
      setContractData(generateContractFromSale(effectiveSale, null, companyInfo));
    } else if (effectiveQuote) {
      setContractData(generateContractFromQuote(effectiveQuote, null, companyInfo));
    }
  }, [effectiveContract?.id, effectiveSale?.id, effectiveQuote?.id]);

  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFieldChange = (field: keyof Contract, value: any) => {
    setContractData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'totalAmount') {
        const numVal = Number(value) || 0;
        updated.totalAmount = numVal;
        updated.totalAmountInWords = valorPorExtenso(numVal);
      }
      return updated;
    });
  };

  const handleRegenerateObjectClause = () => {
    if (effectiveSale) {
      const text = buildObjectClauseText(effectiveSale.items);
      handleFieldChange('objectClauseText', text);
      showToast('Cláusula 1 atualizada com os itens da venda!');
    } else if (effectiveQuote) {
      const text = buildObjectClauseText(effectiveQuote.items);
      handleFieldChange('objectClauseText', text);
      showToast('Cláusula 1 atualizada com os itens do orçamento!');
    }
  };

  const handleRegeneratePaymentClause = () => {
    if (effectiveSale) {
      const text = buildPaymentClauseText(effectiveSale);
      handleFieldChange('paymentClauseText', text);
      showToast('Cláusula 3 atualizada com os pagamentos da venda!');
    }
  };

  const handleSave = (shouldOpenView: boolean = true) => {
    if (!contractData.clientName.trim()) {
      alert('Por favor, informe o nome do cliente / contratante.');
      return;
    }

    const saved = saveContract({
      ...contractData,
      totalAmountInWords: contractData.totalAmountInWords || valorPorExtenso(contractData.totalAmount || 0),
    });

    onSaveSuccess(saved, shouldOpenView);
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      // Garante que o contrato esteja salvo
      const saved = saveContract(contractData);
      await downloadPdfElement(
        'generator-contract-preview-area',
        `Contrato-${saved.code.replace(/\s+/g, '-')}-${saved.clientName || 'Cliente'}.pdf`
      );
      showToast('PDF gerado e baixado com sucesso!');
    } catch (err) {
      console.error('Erro ao gerar PDF do contrato:', err);
      alert('Ocorreu um erro ao gerar o PDF do contrato.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*SMART VIDROS — CONTRATO DE PRESTAÇÃO DE SERVIÇOS*\n\n*${contractData.code}*\n*Cliente:* ${contractData.clientName}\n*Valor Total:* R$ ${(contractData.totalAmount || 0).toFixed(2)} (${contractData.totalAmountInWords})\n\n*Objeto:* ${contractData.objectClauseText.slice(0, 150)}...\n\n_Documento emitido por Smart Vidros em ${contractData.cityDate}._`;
    
    if (navigator.share) {
      navigator.share({ title: `Contrato ${contractData.code}`, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
      showToast('Resumo do contrato copiado para a área de transferência!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto overflow-hidden text-slate-900 flex flex-col max-h-[96vh]">
        
        {/* TOPO DO MODAL */}
        <div className="bg-slate-950 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-amber-500/30 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center font-black">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-amber-400">
                  {contractData.code}
                </h2>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded">
                  Gerador de Contrato
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {contractData.clientName || 'Contrato de Prestação de Serviços'}
              </p>
            </div>
          </div>

          {/* Abas e Ações */}
          <div className="flex items-center gap-2">
            {/* Toggle Editar / Prévia */}
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visualizar / PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'edit'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Cláusulas</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition-colors border border-slate-700"
              title="Copiar texto para WhatsApp"
            >
              {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedText ? 'Copiado!' : 'Compartilhar'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">Baixar PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="hidden md:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition-colors border border-slate-700"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST DE MENSAGEM */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-inner animate-in slide-in-from-top-2">
            <span>✨ {toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-emerald-200 hover:text-white text-sm font-bold">×</button>
          </div>
        )}

        {/* CORPO DO MODAL */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100">
          
          {activeTab === 'preview' ? (
            /* ABA 1: PRÉVIA A4 FORMATO SMART VIDROS */
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl flex items-center justify-between text-xs text-amber-900 font-semibold print:hidden">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    O contrato foi gerado dinamicamente com os dados da venda. Você pode revisar e editar qualquer cláusula na aba <strong>"Editar Cláusulas"</strong> antes de salvar ou emitir o PDF.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg shrink-0 ml-3 shadow-xs"
                >
                  Editar Cláusulas
                </button>
              </div>

              <ContractDocumentView
                contract={contractData}
                companyInfo={companyInfo}
                id="generator-contract-preview-area"
              />
            </div>
          ) : (
            /* ABA 2: FORMULÁRIO DE EDIÇÃO DAS CLÁUSULAS */
            <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-600" />
                  <span>Edição Personalizada do Contrato</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Altere livremente os dados do contratante, prazos, formas de pagamento e redação das cláusulas. Alterações aqui não modificam a venda original.
                </p>
              </div>

              {/* GRUPO 1: DADOS DO CONTRATANTE (CLIENTE) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-black uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>Dados do Contratante (Cliente)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Nome / Razão Social *</label>
                    <input
                      type="text"
                      value={contractData.clientName}
                      onChange={(e) => handleFieldChange('clientName', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      placeholder="Nome do cliente"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">CPF / CNPJ</label>
                    <input
                      type="text"
                      value={contractData.clientDocument || ''}
                      onChange={(e) => handleFieldChange('clientDocument', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Endereço Completo</label>
                    <input
                      type="text"
                      value={contractData.clientAddress || ''}
                      onChange={(e) => handleFieldChange('clientAddress', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      placeholder="Rua, Número, Bairro, Cidade - UF"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      value={contractData.clientPhone || ''}
                      onChange={(e) => handleFieldChange('clientPhone', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      placeholder="(89) 99999-9999"
                    />
                  </div>
                </div>
              </div>

              {/* GRUPO 2: VALOR TOTAL E VALOR POR EXTENSO (CLÁUSULA 2) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    <span>Cláusula 2 — Valor Total do Contrato</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Valor em R$ *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={contractData.totalAmount}
                      onChange={(e) => handleFieldChange('totalAmount', Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-black text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Valor por Extenso (Gerado Automaticamente)</label>
                    <input
                      type="text"
                      value={contractData.totalAmountInWords || ''}
                      onChange={(e) => handleFieldChange('totalAmountInWords', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-amber-950 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* GRUPO 3: CLÁUSULA 1 – OBJETO */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase">
                    Cláusula 1 – Objeto do Contrato
                  </label>
                  {(initialSale || initialQuote) && (
                    <button
                      type="button"
                      onClick={handleRegenerateObjectClause}
                      className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Regenerar a partir dos Itens</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={contractData.objectClauseText}
                  onChange={(e) => handleFieldChange('objectClauseText', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* GRUPO 4: CLÁUSULA 3 – FORMAS DE PAGAMENTO */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase">
                    Cláusula 3 – Forma de Pagamento
                  </label>
                  {initialSale && (
                    <button
                      type="button"
                      onClick={handleRegeneratePaymentClause}
                      className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Regenerar a partir da Venda</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={contractData.paymentClauseText}
                  onChange={(e) => handleFieldChange('paymentClauseText', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* GRUPO 5: CLÁUSULA 4 – PRAZO DE EXECUÇÃO */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 uppercase">
                  Cláusula 4 – Prazo de Execução
                </label>
                <textarea
                  rows={3}
                  value={contractData.executionDeadlineText}
                  onChange={(e) => handleFieldChange('executionDeadlineText', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* GRUPO 6: CLÁUSULAS 5 A 10 (ACORDEÕES/CAMPOS EDITÁVEIS) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900 uppercase">
                    Cláusula 5 – Obrigações da Contratada
                  </label>
                  <textarea
                    rows={4}
                    value={contractData.obligationsContractorText}
                    onChange={(e) => handleFieldChange('obligationsContractorText', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900 uppercase">
                    Cláusula 6 – Obrigações da Contratante
                  </label>
                  <textarea
                    rows={4}
                    value={contractData.obligationsClientText}
                    onChange={(e) => handleFieldChange('obligationsClientText', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900 uppercase">
                    Cláusula 7 – Rescisão Contratual
                  </label>
                  <textarea
                    rows={3}
                    value={contractData.rescissionText}
                    onChange={(e) => handleFieldChange('rescissionText', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900 uppercase">
                    Cláusula 8 – Foro de Eleição
                  </label>
                  <textarea
                    rows={3}
                    value={contractData.jurisdictionText}
                    onChange={(e) => handleFieldChange('jurisdictionText', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900 uppercase text-red-700">
                    Cláusula 9 – Inadimplência & Retirada de Materiais
                  </label>
                  <textarea
                    rows={4}
                    value={contractData.defaultClauseText}
                    onChange={(e) => handleFieldChange('defaultClauseText', e.target.value)}
                    className="w-full bg-slate-50 border border-red-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900 uppercase text-red-700">
                    Cláusula 10 – Rescisão e Não Ressarcimento
                  </label>
                  <textarea
                    rows={4}
                    value={contractData.cancellationClauseText}
                    onChange={(e) => handleFieldChange('cancellationClauseText', e.target.value)}
                    className="w-full bg-slate-50 border border-red-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* GRUPO 7: DATA E LOCAL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Data do Contrato</label>
                  <input
                    type="date"
                    value={contractData.date || ''}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      handleFieldChange('date', newDate);
                      const dObj = new Date(newDate ? `${newDate}T12:00:00` : new Date());
                      const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
                      handleFieldChange('cityDate', `Picos – PI, ${dObj.getDate()} de ${meses[dObj.getMonth()]} de ${dObj.getFullYear()}`);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Local e Data por Extenso (Assinaturas)</label>
                  <input
                    type="text"
                    value={contractData.cityDate || ''}
                    onChange={(e) => handleFieldChange('cityDate', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

            </div>
          )}

        </div>

        {/* RODAPÉ DO MODAL */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-t border-amber-500/30 flex items-center justify-between shrink-0 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl transition-colors border border-amber-500/30 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Rascunho</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar e Emitir Contrato</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
