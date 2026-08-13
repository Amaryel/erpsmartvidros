import React from 'react';
import { X, User, Phone, Mail, MapPin, FileText, ShoppingBag, ShieldCheck, Plus, ReceiptText, ExternalLink } from 'lucide-react';
import { Client, Quote, Sale, Receivable } from '../types';

interface ClientViewModalProps {
  client: Client;
  quotes: Quote[];
  sales: Sale[];
  receivables: Receivable[];
  onClose: () => void;
  onEdit: (client: Client) => void;
  onNewQuoteForClient: (clientName: string, clientPhone?: string) => void;
  onNewReceiptForClient: (clientName: string, clientPhone?: string) => void;
}

export const ClientViewModal: React.FC<ClientViewModalProps> = ({
  client,
  quotes,
  sales,
  receivables,
  onClose,
  onEdit,
  onNewQuoteForClient,
  onNewReceiptForClient,
}) => {
  // Filtrar dados do cliente por nome ou telefone
  const clientTarget = client.name.trim().toLowerCase();
  
  const clientQuotes = quotes.filter(
    (q) => q.clientName?.trim().toLowerCase() === clientTarget
  );
  
  const clientSales = sales.filter(
    (s) => s.clientName?.trim().toLowerCase() === clientTarget
  );
  
  const clientReceivables = receivables.filter(
    (r) => r.clientName?.trim().toLowerCase() === clientTarget
  );

  const totalSalesAmount = clientSales.reduce((acc, s) => acc + s.total, 0);
  const totalFiadoBalance = clientReceivables
    .filter((r) => r.status !== 'pago')
    .reduce((acc, r) => acc + r.remainingAmount, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-2xl w-full border border-slate-200 my-8 space-y-6 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">{client.name}</h2>
                {client.cpfCnpj && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {client.cpfCnpj}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Cliente desde {new Date(client.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(client);
              }}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Editar Cadastro
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informações Principais de Contato & Endereço */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold text-slate-500">Telefone:</span>
              <strong className="text-slate-900 font-bold">{client.phone || 'Não informado'}</strong>
            </div>

            {client.whatsapp && (
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-500">WhatsApp:</span>
                <strong className="text-emerald-700 font-bold">{client.whatsapp}</strong>
                <a
                  href={`https://wa.me/55${client.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5 ml-auto"
                >
                  <span>Abrir Chat</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold text-slate-500">E-mail:</span>
              <strong className="text-slate-900">{client.email || 'Não informado'}</strong>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-500">Endereço: </span>
                <strong className="text-slate-900">
                  {client.address ? `${client.address}, ` : ''}
                  {client.city || 'Picos'}{client.state ? ` - ${client.state}` : ''}
                </strong>
              </div>
            </div>

            {client.notes && (
              <div className="flex items-start gap-2 text-slate-700">
                <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-500">Observações: </span>
                  <span className="text-slate-800 italic">{client.notes}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resumo Financeiro do Cliente */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-100 rounded-xl p-3 text-center border border-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-500">Orçamentos</p>
            <p className="text-lg font-black text-slate-900">{clientQuotes.length}</p>
          </div>

          <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-200">
            <p className="text-[10px] uppercase font-bold text-emerald-700">Total em Vendas</p>
            <p className="text-lg font-black font-mono text-emerald-800">
              R$ {totalSalesAmount.toFixed(2)}
            </p>
          </div>

          <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-200">
            <p className="text-[10px] uppercase font-bold text-amber-800">Saldo Pendente (Fiado)</p>
            <p className="text-lg font-black font-mono text-amber-900">
              R$ {totalFiadoBalance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Botões de Ação Rápida para este Cliente */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              onNewQuoteForClient(client.name, client.phone || client.whatsapp);
            }}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Orçamento p/ Cliente</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onNewReceiptForClient(client.name, client.phone || client.whatsapp);
            }}
            className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
          >
            <ReceiptText className="w-4 h-4" />
            <span>Emitir Recibo p/ Cliente</span>
          </button>
        </div>

        {/* Histórico Recente de Atividades */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Histórico Recente de Vendas & Orçamentos
          </h3>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {clientSales.length === 0 && clientQuotes.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                Nenhum orçamento ou venda registrado ainda para este cliente.
              </p>
            ) : (
              <>
                {clientSales.map((sale) => (
                  <div key={sale.id} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-bold text-slate-900">{sale.code}</span>
                        <span className="text-[10px] text-slate-500 ml-2">{sale.date}</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-900">R$ {sale.total.toFixed(2)}</span>
                  </div>
                ))}

                {clientQuotes.map((quote) => (
                  <div key={quote.id} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <div>
                        <span className="font-bold text-slate-900">{quote.code}</span>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 ml-2">
                          {quote.status}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-900">R$ {quote.total.toFixed(2)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
