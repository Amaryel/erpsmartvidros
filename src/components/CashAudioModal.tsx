import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  Edit3,
  X,
  Volume2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  User,
  Tag,
  FileText
} from 'lucide-react';
import {
  CashCategoryItem,
  CashPaymentMethod,
  CashTransaction,
  CashTransactionType,
  AppUser
} from '../types';
import { interpretCashAudioText, InterpretedCashMovement } from '../utils/cashAudioParser';
import { getCashCategories, createCashTransaction } from '../services/data/repositories/cashRepository';

interface CashAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (transaction: CashTransaction) => void;
  onOpenManualEdit: (prefilled: Partial<CashTransaction>) => void;
  currentUser?: AppUser | null;
}

export const CashAudioModal: React.FC<CashAudioModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  onOpenManualEdit,
  currentUser,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [interpretedData, setInterpretedData] = useState<InterpretedCashMovement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CashCategoryItem[]>([]);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setCategories(getCashCategories());
      setTranscript('');
      setInterimTranscript('');
      setInterpretedData(null);
      setSpeechError(null);
      setIsRecording(false);
      setRecordingSeconds(0);
    } else {
      stopRecording();
    }
  }, [isOpen]);

  // Contagem do timer de gravação
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = () => {
    setSpeechError(null);
    setInterpretedData(null);
    setTranscript('');
    setInterimTranscript('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        'Seu navegador não suporta reconhecimento de voz direto. Você pode digitar ou colar o texto abaixo para interpretação imediata.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let final = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setTranscript((prev) => (prev + ' ' + final).trim());
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError(
            'Permissão de microfone bloqueada pelo navegador. Você pode digitar a descrição no campo abaixo.'
          );
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Aviso de áudio: ${event.error}. Use o campo de texto para continuar.`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error('Error starting speech recognition:', err);
      setSpeechError('Não foi possível iniciar o microfone. Digite o que deseja lançar abaixo.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const handleProcessText = (textToProcess?: string) => {
    const text = (textToProcess !== undefined ? textToProcess : transcript).trim();
    if (!text) {
      setSpeechError('Por favor, fale ou digite algo para interpretar a movimentação.');
      return;
    }

    setIsProcessing(true);
    setSpeechError(null);

    try {
      const result = interpretCashAudioText(text);
      setInterpretedData(result);
    } catch (err: any) {
      setSpeechError('Erro ao interpretar o texto. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmLaunch = () => {
    if (!interpretedData) return;

    if (interpretedData.amount <= 0) {
      setSpeechError('O valor identificado é R$ 0,00. Clique em "Editar Detalhes" para informar o valor correto.');
      return;
    }

    const newTx = createCashTransaction({
      type: interpretedData.type,
      amount: interpretedData.amount,
      categoryId: interpretedData.categoryId,
      categoryName: interpretedData.categoryName,
      description: interpretedData.description,
      date: interpretedData.date,
      paymentMethod: interpretedData.paymentMethod,
      clientName: interpretedData.clientName,
      notes: `Lançado via comando de voz / texto: "${interpretedData.rawText}"`,
      companyId: currentUser?.companyId || 'comp-smart-vidros-001',
      userId: currentUser?.id || 'usr-superadmin-001',
      userName: currentUser?.name || 'Administrador',
    });

    onSaveSuccess(newTx);
    onClose();
  };

  const handleEditManually = () => {
    if (!interpretedData) return;
    onOpenManualEdit({
      type: interpretedData.type,
      amount: interpretedData.amount,
      categoryId: interpretedData.categoryId,
      categoryName: interpretedData.categoryName,
      description: interpretedData.description,
      date: interpretedData.date,
      paymentMethod: interpretedData.paymentMethod,
      clientName: interpretedData.clientName,
      notes: `Lançado por voz: "${interpretedData.rawText}"`,
    });
    onClose();
  };

  if (!isOpen) return null;

  const paymentMethodLabels: Record<CashPaymentMethod, string> = {
    dinheiro: 'Dinheiro',
    pix: 'PIX',
    cartao_credito: 'Cartão de Crédito',
    cartao_debito: 'Cartão de Débito',
    transferencia: 'Transferência',
    cheque: 'Cheque',
    outro: 'Outro',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Glow de Fundo */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Topo do Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-md font-bold">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Lançar por Áudio</span>
                <span className="bg-amber-100 text-amber-900 text-[10px] uppercase font-black px-2 py-0.5 rounded-full">
                  IA & Voz
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Fale ou digite a movimentação. O sistema interpretará e pedirá sua confirmação.
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

        {/* Área de Gravação / Interação */}
        {!interpretedData && (
          <div className="space-y-5">
            {/* Botão de Microfone Central */}
            <div className="flex flex-col items-center justify-center py-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40 ring-8 ring-rose-200'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30 ring-4 ring-amber-100 hover:ring-amber-200'
                }`}
                title={isRecording ? 'Clique para parar' : 'Clique para falar'}
              >
                {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>

              <div className="text-center">
                <span className="text-xs font-black text-slate-800">
                  {isRecording ? `Ouvindo... (${recordingSeconds}s) — Clique para parar` : 'Toque no microfone para falar'}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ex: "Gastei 150 reais de combustível hoje" ou "Recebi 800 do João"
                </p>
              </div>
            </div>

            {/* Campo de Texto para Visualização / Ajuste / Digitação Manual */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Texto transcrito / digitado:</span>
                {transcript && (
                  <button
                    type="button"
                    onClick={() => {
                      setTranscript('');
                      setInterimTranscript('');
                    }}
                    className="text-[11px] text-rose-600 hover:underline"
                  >
                    Limpar
                  </button>
                )}
              </label>
              <textarea
                value={transcript + (interimTranscript ? ` (${interimTranscript})` : '')}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Exemplo: Hoje gastei 150 reais de combustível no posto..."
                rows={3}
                className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all font-medium"
              />
            </div>

            {/* Exemplos Rápidos de Sugestão */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Exemplos para testar com 1 clique:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Gastei 150 reais de combustível no posto no cartão',
                  'Almoço da equipe 75 reais em dinheiro',
                  'Comprei 450 reais de ferragens e kits de box no PIX',
                  'Paguei 120 reais de diária do ajudante em dinheiro',
                  'Recebi 1200 reais da Maria referente ao box no PIX',
                  'Comprei 85 reais de silicone e parafusos no dinheiro',
                  'Recebi 350 reais do Carlos referente ao fiado no PIX',
                  'Gastei 90 reais em compras de mercado e café para a oficina',
                ].map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTranscript(ex);
                      handleProcessText(ex);
                    }}
                    className="text-[11px] bg-slate-100 hover:bg-amber-100 hover:text-amber-950 text-slate-700 px-2.5 py-1 rounded-xl transition-colors text-left"
                  >
                    "{ex}"
                  </button>
                ))}
              </div>
            </div>

            {/* Mensagem de Erro */}
            {speechError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{speechError}</span>
              </div>
            )}

            {/* Botão de Interpretar */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleProcessText()}
                disabled={!transcript.trim() || isProcessing}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Interpretar Lançamento</span>
              </button>
            </div>
          </div>
        )}

        {/* RESUMO PARA CONFIRMAÇÃO DO LANÇAMENTO INTERPRETADO */}
        {interpretedData && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Banner de Identificação */}
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-black text-amber-950">
                  Identifiquei esta movimentação:
                </h3>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Confira os dados abaixo. O saldo do caixa só será alterado após sua confirmação.
                </p>
              </div>
            </div>

            {/* Card Detalhado com os Dados Interpretados */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
              
              {/* Topo do Card: Tipo & Valor */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                      interpretedData.type === 'entrada'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {interpretedData.type === 'entrada' ? (
                      <>
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Entrada</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>Saída</span>
                      </>
                    )}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {interpretedData.type === 'entrada' ? 'Recebimento' : 'Despesa'}
                  </span>
                </div>

                <div className="text-right">
                  <div
                    className={`text-2xl font-black font-mono ${
                      interpretedData.type === 'entrada' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {interpretedData.type === 'entrada' ? '+' : '-'} R${' '}
                    {interpretedData.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Grid de Informações */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* Categoria */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3 text-amber-500" />
                    Categoria
                  </span>
                  <p className="font-extrabold text-slate-900">{interpretedData.categoryName}</p>
                </div>

                {/* Forma de Pagamento */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-amber-500" />
                    Forma de Pagamento
                  </span>
                  <p className="font-extrabold text-slate-900">
                    {paymentMethodLabels[interpretedData.paymentMethod] || interpretedData.paymentMethod}
                  </p>
                </div>

                {/* Data */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-500" />
                    Data do Lançamento
                  </span>
                  <p className="font-extrabold text-slate-900">
                    {new Date(interpretedData.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {/* Cliente (se houver) */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3 text-amber-500" />
                    Cliente / Contato
                  </span>
                  <p className="font-extrabold text-slate-900">
                    {interpretedData.clientName || 'Não especificado'}
                  </p>
                </div>

              </div>

              {/* Descrição Completa */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <FileText className="w-3 h-3 text-amber-500" />
                  Descrição da Movimentação
                </span>
                <p className="text-xs font-semibold text-slate-800">{interpretedData.description}</p>
              </div>

              {/* Texto Original */}
              <div className="text-[10px] text-slate-500 italic bg-slate-100/80 p-2 rounded-xl border border-slate-200/60">
                Áudio/Texto original: "{interpretedData.rawText}"
              </div>

            </div>

            {/* BOTÕES DE AÇÃO: [Confirmar lançamento] [Editar] [Cancelar] */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              
              <button
                type="button"
                onClick={() => setInterpretedData(null)}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Falar Novamente
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleEditManually}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmLaunch}
                  className="flex-1 sm:flex-initial px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Lançamento</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
