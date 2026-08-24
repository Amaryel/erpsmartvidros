import React, { useState } from 'react';
import {
  X,
  Printer,
  Share2,
  Download,
  Loader2,
  Edit3,
  Trash2,
  FileText,
  ShoppingBag,
  Check,
  Building2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Contract, CompanyInfo } from '../types';
import { downloadPdfElement } from '../utils/pdfGenerator';
import { ContractDocumentView } from './ContractDocumentView';

interface ContractViewModalProps {
  contract: Contract;
  companyInfo: CompanyInfo;
  onClose: () => void;
  onEdit: (contract: Contract) => void;
  onDelete?: (contractId: string) => void;
  onOpenSale?: (saleId: string) => void;
  onOpenQuote?: (quoteId: string) => void;
}

export const ContractViewModal: React.FC<ContractViewModalProps> = ({
  contract,
  companyInfo,
  onClose,
  onEdit,
  onDelete,
  onOpenSale,
  onOpenQuote,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadPdfElement(
        'view-contract-printable-area',
        `Contrato-${contract.code.replace(/\s+/g, '-')}-${contract.clientName || 'Cliente'}.pdf`
      );
    } catch (err) {
      console.error('Erro ao gerar PDF do contrato:', err);
      alert('Ocorreu um erro ao gerar o PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const summary = `*SMART VIDROS — CONTRATO DE PRESTAÇÃO DE SERVIÇOS*\n*Documento:* ${contract.code}\n*Cliente:* ${contract.clientName}\n*Valor Total:* R$ ${(contract.totalAmount || 0).toFixed(2)} (${contract.totalAmountInWords})\n*Local/Data:* ${contract.cityDate}\n\n_Documento oficial Smart Vidros._`;

    if (navigator.share) {
      navigator.share({ title: `Contrato ${contract.code}`, text: summary }).catch(() => {});
    } else {
      navigator.clipboard.writeText(summary);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-auto overflow-hidden border border-slate-200 flex flex-col max-h-[96vh]">
        
        {/* BARRA SUPERIOR DE AÇÕES */}
        <div className="bg-slate-950 text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-amber-500/30 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-black text-amber-400 text-sm">{contract.code}</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold hidden sm:inline">
              {contract.clientName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(contract)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border border-amber-500/30"
              title="Editar Cláusulas do Contrato"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              title="Imprimir Contrato"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedText ? 'Copiado!' : 'Compartilhar'}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Baixar PDF</span>
            </button>

            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors ml-1"
                title="Excluir Contrato"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVEGAÇÃO ENTRE DOCUMENTOS RELACIONADOS */}
        {(contract.saleId || contract.quoteId) && (
          <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs font-bold text-slate-700 print:hidden overflow-x-auto gap-2 shrink-0">
            <span className="uppercase text-[10px] text-slate-500 shrink-0">Documentos Relacionados:</span>
            
            <div className="flex items-center gap-2 shrink-0">
              {contract.saleId && onOpenSale && (
                <button
                  onClick={() => onOpenSale(contract.saleId!)}
                  className="flex items-center gap-1 text-slate-700 hover:text-amber-600 bg-white border border-slate-300 px-2.5 py-1 rounded-md transition-colors shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ver Venda {contract.saleCode}</span>
                </button>
              )}

              {contract.quoteId && onOpenQuote && (
                <button
                  onClick={() => onOpenQuote(contract.quoteId!)}
                  className="flex items-center gap-1 text-slate-700 hover:text-amber-600 bg-white border border-slate-300 px-2.5 py-1 rounded-md transition-colors shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ver Orçamento {contract.quoteCode}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ÁREA DE VISUALIZAÇÃO DO CONTRATO */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100">
          <ContractDocumentView
            contract={contract}
            companyInfo={companyInfo}
            id="view-contract-printable-area"
          />
        </div>

      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-red-200 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Excluir Contrato?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Deseja realmente remover o <strong>{contract.code}</strong> do cliente <strong>{contract.clientName}</strong>? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (onDelete) onDelete(contract.id);
                  setShowDeleteConfirm(false);
                  onClose();
                }}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-2 rounded-xl text-xs shadow-md"
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
