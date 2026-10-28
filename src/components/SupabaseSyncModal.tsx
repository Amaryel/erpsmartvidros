import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  X,
  Code,
  Copy,
  Check,
  AlertTriangle,
  Server,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  pushAllToSupabase,
  pullAllFromSupabase,
  syncAllWithSupabase,
  getLastSyncTime,
} from '../services/storage';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSynced?: () => void;
  onShowToast: (msg: string) => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  onDataSynced,
  onShowToast,
}) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url);
      setKey(config.key);
      setLastSync(getLastSyncTime());
      if (config.url && config.key) {
        handleTestConnection(config.url, config.key);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async (testUrl = url, testKey = key) => {
    setLoading(true);
    setStatusMsg('Testando conexão com Supabase...');
    const res = await testSupabaseConnection(testUrl, testKey);
    setIsConnected(res.success);
    setStatusMsg(res.message);
    setLoading(false);
  };

  const handleSaveConfig = () => {
    saveSupabaseConfig(url, key);
    onShowToast('Configurações do Supabase salvas!');
    handleTestConnection(url, key);
  };

  const handlePush = async () => {
    setLoading(true);
    setStatusMsg('Enviando todos os dados locais para o Supabase...');
    const res = await pushAllToSupabase();
    setLoading(false);
    if (res.success) {
      setLastSync(getLastSyncTime());
      onShowToast('Dados locais enviados com sucesso para o Supabase!');
      if (onDataSynced) onDataSynced();
    }
    setStatusMsg(res.message);
  };

  const handlePull = async () => {
    setLoading(true);
    setStatusMsg('Baixando dados do banco Supabase...');
    const res = await pullAllFromSupabase();
    setLoading(false);
    if (res.success) {
      setLastSync(getLastSyncTime());
      onShowToast('Dados sincronizados do Supabase para o aplicativo!');
      if (onDataSynced) onDataSynced();
    }
    setStatusMsg(res.message);
  };

  const handleFullSync = async () => {
    setLoading(true);
    setStatusMsg('Realizando sincronização bidirecional completa...');
    const res = await syncAllWithSupabase();
    setLoading(false);
    if (res.success) {
      setLastSync(getLastSyncTime());
      onShowToast('Sincronização bidirecional concluída!');
      if (onDataSynced) onDataSynced();
    }
    setStatusMsg(res.message);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabeçalho */}
        <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white leading-tight">Sincronização com Supabase</h2>
              <p className="text-xs text-slate-400">Integração da base de dados, nuvem e segurança RLS</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title="Fechar"
            id="btn-close-supabase-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Card de Status da Conexão */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              isConnected === true
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : isConnected === false
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              {isConnected === true ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : isConnected === false ? (
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
              ) : (
                <Server className="w-6 h-6 text-slate-500 shrink-0" />
              )}
              <div>
                <span className="text-xs font-black block uppercase tracking-wider">
                  {isConnected === true
                    ? '🟢 Supabase Conectado'
                    : isConnected === false
                    ? '⚠️ Não Conectado ao Supabase'
                    : '⚪ Status da Conexão'}
                </span>
                <p className="text-xs mt-0.5 opacity-90">
                  {statusMsg || 'Aguardando teste de conexão com o banco de dados.'}
                </p>
                {lastSync && (
                  <p className="text-[10px] font-mono text-slate-500 mt-1">
                    Última sincronização: {new Date(lastSync).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleTestConnection()}
              disabled={loading}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-sm transition-all shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Testar</span>
            </button>
          </div>

          {/* Formulário de Configuração URL / Anon Key */}
          <div className="space-y-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔑 Credenciais do Projeto Supabase</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Project URL (SUPABASE_URL)
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Anon Public Key (SUPABASE_ANON_KEY)
                </label>
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Salvar Credenciais
                </button>
              </div>
            </div>
          </div>

          {/* Botões de Ação de Sincronização */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Ações de Sincronização de Dados
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handlePush}
                disabled={loading}
                className="p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-600/20 text-left transition-all active:scale-95 flex flex-col justify-between gap-2"
              >
                <Upload className="w-5 h-5 text-emerald-200" />
                <div>
                  <span className="text-xs font-black block leading-tight">Enviar para Nuvem (Push)</span>
                  <span className="text-[10px] text-emerald-100 opacity-90">Sobe dados locais para o Supabase</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handlePull}
                disabled={loading}
                className="p-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-600/20 text-left transition-all active:scale-95 flex flex-col justify-between gap-2"
              >
                <Download className="w-5 h-5 text-blue-200" />
                <div>
                  <span className="text-xs font-black block leading-tight">Baixar da Nuvem (Pull)</span>
                  <span className="text-[10px] text-blue-100 opacity-90">Atualiza este app com o banco remote</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleFullSync}
                disabled={loading}
                className="p-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-lg shadow-slate-900/20 text-left transition-all active:scale-95 flex flex-col justify-between gap-2"
              >
                <RefreshCw className={`w-5 h-5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
                <div>
                  <span className="text-xs font-black block leading-tight">Sincronização Completa</span>
                  <span className="text-[10px] text-slate-300">Push + Pull Bidirecional</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
