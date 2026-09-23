import React from 'react';
import { Contract, CompanyInfo } from '../types';
import { Layers } from 'lucide-react';
import SMART_VIDROS_OFFICIAL_LOGO_BASE64 from '../assets/logoBase64';

interface ContractDocumentViewProps {
  contract: Contract;
  companyInfo?: CompanyInfo;
  id?: string;
}

export const ContractDocumentView: React.FC<ContractDocumentViewProps> = ({
  contract,
  companyInfo,
  id = 'printable-contract-area',
}) => {
  const contractorName = contract.contractorName || companyInfo?.name || 'SMART VIDROS';
  const contractorCnpj = contract.contractorDocument || companyInfo?.cnpj || '51.840.669/0001-22';
  const contractorAddress = contract.contractorAddress || companyInfo?.address || 'Rua Povoado Novo Paquetá, Sussuapara – PI';
  const contractorPhone = companyInfo?.phone || '(89) 9 9991-0028';
  const contractorEmail = companyInfo?.email || 'smartvidros@gmail.com';

  return (
    <div
      id={id}
      className="bg-white text-slate-900 font-sans p-8 sm:p-10 max-w-4xl mx-auto border border-slate-200 rounded-xl shadow-xs print:p-0 print:border-none print:shadow-none print:max-w-none notranslate"
      translate="no"
      style={{ minHeight: '297mm' }}
    >
      {/* CABEÇALHO DO DOCUMENTO A4 SMART VIDROS */}
      <div className="bg-slate-950 text-white rounded-xl p-4 sm:p-5 border-b-4 border-amber-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 notranslate" translate="no">
        
        {/* LOGO & IDENTIDADE VISUAL */}
        <div className="flex items-center gap-3.5 notranslate" translate="no">
          <img
            src={
              companyInfo?.logoUrl &&
              !companyInfo.logoUrl.includes('178') &&
              !companyInfo.logoUrl.includes('badge') &&
              !companyInfo.logoUrl.endsWith('.jpg') &&
              !companyInfo.logoUrl.includes('.svg')
                ? companyInfo.logoUrl
                : SMART_VIDROS_OFFICIAL_LOGO_BASE64
            }
            alt={contractorName}
            referrerPolicy="no-referrer"
            style={{
              height: '50px',
              maxHeight: '50px',
              width: 'auto',
              maxWidth: '140px',
              objectFit: 'contain',
              display: 'inline-block',
            }}
            className="h-12 w-auto max-w-[140px] object-contain shrink-0 drop-shadow-md"
          />

          <div className="notranslate leading-tight" translate="no">
            <p className="text-xs font-bold text-amber-300 tracking-wide">
              {contractorName}
            </p>
            <p className="text-[11px] text-slate-400 notranslate mt-0.5">
              CNPJ: {contractorCnpj}
            </p>
          </div>
        </div>

        {/* IDENTIFICAÇÃO DO CONTRATO E DADOS DO EMISSOR */}
        <div className="text-left sm:text-right text-xs text-slate-300 space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800 w-full sm:w-auto">
          <div className="flex items-center justify-start sm:justify-end gap-2 mb-1">
            <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              {contract.code || 'CONTRATO'}
            </span>
          </div>
          <p>📍 {contractorAddress}</p>
          <p>📞 WhatsApp: {contractorPhone} • ✉️ {contractorEmail}</p>
        </div>
      </div>

      {/* TÍTULO PRINCIPAL DO CONTRATO */}
      <div className="text-center my-5 notranslate" translate="no">
        <div className="border-y border-slate-300 py-2.5 bg-slate-50 px-4 rounded-sm">
          <h1 className="text-base sm:text-lg font-black tracking-wide text-slate-950 uppercase m-0">
            {contract.title || 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS SMART VIDROS'}
          </h1>
        </div>
        {(contract.saleCode || contract.quoteCode) && (
          <p className="text-[11px] text-slate-500 font-semibold mt-1.5 mb-0">
            {contract.saleCode && `Referência Venda: ${contract.saleCode}`}
            {contract.saleCode && contract.quoteCode && ' | '}
            {contract.quoteCode && `Referência Orçamento: ${contract.quoteCode}`}
          </p>
        )}
      </div>

      {/* QUADRO DAS PARTES CONTRATANTES */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 break-inside-avoid notranslate" translate="no">
        {/* CONTRATADA */}
        <div className="space-y-1">
          <h2 className="font-extrabold text-amber-800 uppercase tracking-wider text-[11px] border-b border-amber-300 pb-1 mb-1">
            CONTRATADA
          </h2>
          <p className="font-black text-slate-950 text-sm">{contractorName}</p>
          <p className="text-slate-700">
            <span className="font-bold">CNPJ:</span> {contractorCnpj}
          </p>
          <p className="text-slate-700">
            <span className="font-bold">Endereço:</span> {contractorAddress}
          </p>
        </div>

        {/* CONTRATANTE */}
        <div className="space-y-1">
          <h2 className="font-extrabold text-amber-800 uppercase tracking-wider text-[11px] border-b border-amber-300 pb-1 mb-1">
            CONTRATANTE
          </h2>
          <p className="font-black text-slate-950 text-sm">{contract.clientName || 'Cliente'}</p>
          <p className="text-slate-700">
            <span className="font-bold">CPF/CNPJ:</span> {contract.clientDocument || 'Não informado'}
          </p>
          <p className="text-slate-700">
            <span className="font-bold">Endereço:</span> {contract.clientAddress || 'Não informado'}
          </p>
          {contract.clientPhone && (
            <p className="text-slate-700">
              <span className="font-bold">Contato:</span> {contract.clientPhone}
            </p>
          )}
        </div>
      </div>

      {/* CLÁUSULAS CONTRATUAIS */}
      <div className="text-xs text-slate-800 leading-relaxed text-justify notranslate" translate="no">
        
        {/* CLÁUSULA 1 – OBJETO DO CONTRATO */}
        <div className="mb-5 contract-clause break-inside-avoid">
          <h3 className="font-black text-slate-950 text-xs uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <span className="w-2 h-2 bg-amber-500 rounded-full inline-block shrink-0"></span>
            <span>CLÁUSULA 1 – OBJETO DO CONTRATO</span>
          </h3>
          <div className="whitespace-pre-line pl-3.5 border-l-2 border-amber-400 text-slate-700">
            {contract.objectClauseText}
          </div>
        </div>

        {/* CLÁUSULA 2 – VALOR TOTAL */}
        <div className="mb-5 contract-clause break-inside-avoid">
          <h3 className="font-black text-slate-950 text-xs uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <span className="w-2 h-2 bg-amber-500 rounded-full inline-block shrink-0"></span>
            <span>CLÁUSULA 2 – VALOR TOTAL</span>
          </h3>
          <div className="pl-3.5 border-l-2 border-amber-400">
            <p className="text-slate-700 mb-2">
              O valor total do presente contrato é de:
            </p>
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg max-w-md">
              <div className="font-black text-base text-slate-950">
                R$ {(contract.totalAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-amber-900 font-bold italic mt-0.5">
                ({contract.totalAmountInWords || 'zero reais'})
              </div>
            </div>
          </div>
        </div>

        {/* CLÁUSULA 3 – FORMA DE PAGAMENTO */}
        <div className="mb-5 contract-clause break-inside-avoid">
          <h3 className="font-black text-slate-950 text-xs uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <span className="w-2 h-2 bg-amber-500 rounded-full inline-block shrink-0"></span>
            <span>CLÁUSULA 3 – FORMA DE PAGAMENTO</span>
          </h3>
          <div className="whitespace-pre-line pl-3.5 border-l-2 border-amber-400 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
            {contract.paymentClauseText}
          </div>
        </div>

        {/* CLÁUSULA 4 – PRAZO DE EXECUÇÃO */}
        <div className="mb-5 contract-clause break-inside-avoid">
          <h3 className="font-black text-slate-950 text-xs uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <span className="w-2 h-2 bg-amber-500 rounded-full inline-block shrink-0"></span>
            <span>CLÁUSULA 4 – PRAZO DE EXECUÇÃO</span>
          </h3>
          <div className="whitespace-pre-line pl-3.5 border-l-2 border-amber-400 text-slate-700">
            {contract.executionDeadlineText}
          </div>
        </div>

        {/* CLÁUSULA 5 – OBRIGAÇÕES DA CONTRATADA */}
        <div className="mb-5 contract-clause break-inside-avoid">
          <h3 className="font-black text-slate-950 text-xs uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <span className="w-2 h-2 bg-amber-500 rounded-full inline-block shrink-0"></span>
            <span>CLÁUSULA 5 – OBRIGAÇÕES DA CONTRATADA</span>
          </h3>
          <div className="whitespace-pre-line pl-3.5 border-l-2 border-amber-400 text-slate-700">
            {contract.obligationsContractorText}
          </div>
        </div>

        {/* CLÁUSULA 6 – OBRIGAÇÕES DA CONTRATANTE */}
        <div className="mb-5 contract-clause break-inside-avoid">
          <h3 className="font-black text-slate-950 text-xs uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <span className="w-2 h-2 bg-amber-500 rounded-full inline-block shrink-0"></span>
            <span>CLÁUSULA 6 – OBRIGAÇÕES DA CONTRATANTE</span>
          </h3>
          <div className="whitespace-pre-line pl-3.5 border-l-2 border-amber-400 text-slate-700">
            {contract.obligationsClientText}
          </div>
        </div>

        {/* CLÁUSULA 7 – RESCISÃO DA PARTE CONTRATANTE */}
        <div className="mb-5 contract-clause break-inside-avoid">
          <h3 className="font-black text-slate-950 text-xs uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <span className="w-2 h-2 bg-amber-500 rounded-full inline-block shrink-0"></span>
            <span>CLÁUSULA 7 – RESCISÃO DA PARTE CONTRATANTE</span>
          </h3>
          <div className="whitespace-pre-line pl-3.5 border-l-2 border-amber-400 text-slate-700">
            {contract.rescissionText}
          </div>
        </div>

        {/* CLÁUSULA 8 – FORO */}
        <div className="mb-5 contract-clause break-inside-avoid">
          <h3 className="font-black text-slate-950 text-xs uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <span className="w-2 h-2 bg-amber-500 rounded-full inline-block shrink-0"></span>
            <span>CLÁUSULA 8 – FORO</span>
          </h3>
          <div className="whitespace-pre-line pl-3.5 border-l-2 border-amber-400 text-slate-700">
            {contract.jurisdictionText}
          </div>
        </div>

        {/* CLÁUSULA 9 – INADIMPLÊNCIA */}
        <div className="mb-5 contract-clause break-inside-avoid">
          <h3 className="font-black text-slate-950 text-xs uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <span className="w-2 h-2 bg-amber-500 rounded-full inline-block shrink-0"></span>
            <span>CLÁUSULA 9 – INADIMPLÊNCIA</span>
          </h3>
          <div className="whitespace-pre-line pl-3.5 border-l-2 border-amber-400 text-slate-700 bg-red-50 p-3 rounded-lg border border-red-200">
            {contract.defaultClauseText}
          </div>
        </div>

        {/* CLÁUSULA 10 – RESCISÃO E NÃO RESSARCIMENTO */}
        <div className="mb-5 contract-clause break-inside-avoid">
          <h3 className="font-black text-slate-950 text-xs uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <span className="w-2 h-2 bg-amber-500 rounded-full inline-block shrink-0"></span>
            <span>CLÁUSULA 10 – RESCISÃO E NÃO RESSARCIMENTO</span>
          </h3>
          <div className="whitespace-pre-line pl-3.5 border-l-2 border-amber-400 text-slate-700">
            {contract.cancellationClauseText}
          </div>
        </div>

      </div>

      {/* FECHAMENTO E DATA */}
      <div className="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-800 break-inside-avoid notranslate" translate="no">
        <p className="italic text-center text-slate-700 mb-2">
          E por estarem de pleno acordo, firmam o presente contrato em duas vias de igual teor.
        </p>

        <p className="text-center font-bold text-slate-900 text-xs mb-0">
          {contract.cityDate || 'Picos – PI'}
        </p>
      </div>

      {/* BLOCO DE ASSINATURAS */}
      <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-center text-xs signature-box break-inside-avoid notranslate" translate="no">
        {/* ASSINATURA CONTRATANTE */}
        <div className="flex flex-col items-center justify-end">
          <div className="w-64 border-t-2 border-slate-900 mb-2"></div>
          <p className="font-bold text-slate-950 uppercase">{contract.clientName || 'CONTRATANTE'}</p>
          <p className="text-[11px] text-slate-500">CONTRATANTE</p>
          {contract.clientDocument && (
            <p className="text-[10px] text-slate-400">CPF/CNPJ: {contract.clientDocument}</p>
          )}
        </div>

        {/* ASSINATURA CONTRATADA */}
        <div className="flex flex-col items-center justify-end">
          <div className="w-64 border-t-2 border-slate-900 mb-2"></div>
          <p className="font-black text-slate-950 uppercase">{contractorName}</p>
          <p className="text-[11px] text-amber-800 font-bold">CONTRATADA</p>
          <p className="text-[10px] text-slate-400">CNPJ: {contractorCnpj}</p>
        </div>
      </div>

      {/* RODAPÉ DO DOCUMENTO */}
      <div className="mt-10 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 notranslate" translate="no">
        <span>Smart Vidros ERP — Sistema de Gestão e Contratos</span>
        <span>Documento Oficial A4</span>
      </div>

    </div>
  );
};
