import React, { useState, useRef, useEffect } from 'react';
import { User, Search, Phone, MapPin, Plus, X, Check, ChevronDown, Sparkles } from 'lucide-react';
import { Client } from '../types';

interface ClientSelectProps {
  clients: Client[];
  selectedName: string;
  selectedPhone: string;
  onSelectClient: (client: { name: string; phone?: string; address?: string }) => void;
  onClear: () => void;
  onOpenNewClientModal?: () => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export const ClientSelect: React.FC<ClientSelectProps> = ({
  clients,
  selectedName,
  selectedPhone,
  onSelectClient,
  onClear,
  onOpenNewClientModal,
  placeholder = 'Buscar ou cadastrar cliente...',
  label = 'Cliente',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.whatsapp && c.whatsapp.includes(searchTerm)) ||
      (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const matchedClient = clients.find(
    (c) => c.name.trim().toLowerCase() === selectedName.trim().toLowerCase()
  );

  return (
    <div className="space-y-1 relative" ref={wrapperRef}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-amber-600">*</span>}
        </label>

        {onOpenNewClientModal && (
          <button
            type="button"
            onClick={onOpenNewClientModal}
            className="text-[11px] text-amber-700 hover:text-amber-900 font-extrabold flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3 h-3" />
            <span>+ Novo Cliente</span>
          </button>
        )}
      </div>

      {/* SE O CLIENTE JÁ ESTIVER SELECIONADO / DIGITADO */}
      {selectedName.trim().length > 0 && !isOpen ? (
        <div className="flex items-center justify-between p-3 bg-amber-50/80 border-2 border-amber-300 rounded-2xl shadow-xs transition-all">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
              {selectedName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm leading-tight">
                  {selectedName}
                </span>
                {matchedClient && (
                  <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.2 rounded-full border border-amber-300">
                    Cadastrado
                  </span>
                )}
              </div>
              {selectedPhone ? (
                <span className="text-xs text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-amber-600" />
                  <span>{selectedPhone}</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 italic">Sem telefone informado</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setSearchTerm(selectedName);
                setIsOpen(true);
              }}
              className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Alterar
            </button>

            <button
              type="button"
              onClick={onClear}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Remover seleção"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* CAMPO DE BUSCA E SELEÇÃO BONITO */
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-amber-600 pointer-events-none" />
            <input
              type="text"
              value={isOpen ? searchTerm : selectedName}
              onFocus={() => {
                setIsOpen(true);
                setSearchTerm('');
              }}
              onChange={(e) => {
                const val = e.target.value;
                setSearchTerm(val);
                onSelectClient({ name: val, phone: selectedPhone });
                if (!isOpen) setIsOpen(true);
              }}
              placeholder={placeholder}
              className="w-full bg-slate-50/90 border border-slate-300 rounded-2xl pl-10 pr-10 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-xs"
            />
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="absolute right-3 text-slate-400 hover:text-slate-600"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* DROPDOWN FLUTUANTE DE CLIENTES */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border-2 border-amber-300 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
              {/* Opção para usar texto livre / Não Cadastrado */}
              {searchTerm.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectClient({ name: searchTerm.trim(), phone: selectedPhone });
                    setIsOpen(false);
                  }}
                  className="w-full p-3 text-left hover:bg-amber-50 flex items-center justify-between text-xs text-amber-900 font-bold bg-amber-50/40"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-600" />
                    <span>Usar "{searchTerm.trim()}" (Cliente Avulso)</span>
                  </div>
                  <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded">Selecionar</span>
                </button>
              )}

              {filteredClients.length === 0 ? (
                <div className="p-4 text-center space-y-2">
                  <p className="text-xs text-slate-500">Nenhum cliente cadastrado encontrado.</p>
                  {onOpenNewClientModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onOpenNewClientModal();
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl"
                    >
                      + Cadastrar Novo Cliente Agora
                    </button>
                  )}
                </div>
              ) : (
                filteredClients.map((client) => {
                  const isSelected = client.name.trim().toLowerCase() === selectedName.trim().toLowerCase();
                  const phoneStr = client.phone || client.whatsapp || '';

                  return (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => {
                        onSelectClient({
                          name: client.name,
                          phone: phoneStr,
                          address: client.address ? `${client.address}${client.city ? `, ${client.city}` : ''}` : undefined,
                        });
                        setIsOpen(false);
                      }}
                      className={`w-full p-3 text-left hover:bg-amber-50 transition-colors flex items-center justify-between gap-3 ${
                        isSelected ? 'bg-amber-100/80 font-bold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs block leading-tight">
                            {client.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {phoneStr && (
                              <span className="text-[11px] text-slate-600 font-medium flex items-center gap-0.5">
                                <Phone className="w-2.5 h-2.5 text-amber-600" />
                                <span>{phoneStr}</span>
                              </span>
                            )}
                            {client.city && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" />
                                <span>{client.city}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
