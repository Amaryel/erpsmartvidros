import React, { useState } from 'react';
import { UserAccount, AppUser } from '../types';
import { loginUser, registerUser, SUPERADMIN_EMAIL } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccessLogin: (user: AppUser) => void;
  currentUser?: AppUser | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form de Login
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form de Cadastro
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regStatusMessage, setRegStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginIdentifier.trim()) {
      setLoginError('Por favor, informe seu e-mail ou nome de usuário.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginUser(loginIdentifier, loginPassword);
      if (res.success && res.user) {
        onSuccessLogin(res.user);
        if (onClose) onClose();
      } else {
        setLoginError(res.message);
      }
    } catch (err: any) {
      setLoginError('Ocorreu um erro ao processar o login. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegStatusMessage(null);

    if (!regName.trim() || !regEmail.trim()) {
      setRegStatusMessage({
        type: 'error',
        text: 'Preencha seu nome completo e e-mail.',
      });
      return;
    }

    const res = registerUser({
      name: regName,
      email: regEmail,
      password: regPassword || '123456',
    });

    if (res.success) {
      setRegStatusMessage({
        type: 'success',
        text: res.message,
      });
      setRegName('');
      setRegEmail('');
      setRegPassword('');
    } else {
      setRegStatusMessage({
        type: 'error',
        text: res.message,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
        
        {/* Cabeçalho da Janela de Acesso */}
        <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xl shadow-lg shadow-amber-500/30">
              SV
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-tight">Smart Vidros ERP</h2>
              <p className="text-xs text-slate-400">Autenticação e Controle de Acesso</p>
            </div>
          </div>

          {currentUser && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white font-bold text-xl px-2 py-1 rounded-lg transition-colors"
              title="Fechar"
            >
              ✕
            </button>
          )}
        </div>

        {/* Abas Alternadoras (Login / Solicitacao de Cadastro) */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLoginError(null);
            }}
            className={`flex-1 py-3.5 text-xs font-bold text-center transition-colors ${
              activeTab === 'login'
                ? 'bg-white text-slate-900 border-b-2 border-amber-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            🔑 Já tenho Acesso
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setRegStatusMessage(null);
            }}
            className={`flex-1 py-3.5 text-xs font-bold text-center transition-colors ${
              activeTab === 'register'
                ? 'bg-white text-slate-900 border-b-2 border-amber-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            📝 Solicitar Cadastro
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="p-6 flex-1">
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium leading-relaxed">
                  ⚠️ {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Usuário ou E-mail
                </label>
                <input
                  type="text"
                  placeholder="Ex: amaryel ou joao@email.com"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  💡 Você pode usar seu e-mail cadastrado ou o nome de usuário (username) definido pelo Super Admin.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-xl active:scale-[0.98] mt-2"
              >
                Entrar no Sistema
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {regStatusMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs font-medium leading-relaxed ${
                    regStatusMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  {regStatusMessage.type === 'success' ? '✅ ' : '⚠️ '}
                  {regStatusMessage.text}
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-[11px] text-slate-600 leading-relaxed">
                ℹ️ <strong>Como funciona o cadastro:</strong> Ao criar sua solicitação com Nome e E-mail, a conta ficará aguardando a liberação do Super Admin. Assim que aprovada, você receberá permissão e poderá usar um nome de usuário (username) personalizado para acessar o sistema dispensando o e-mail.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Seu nome ou nome da empresa"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Crie uma Senha
                </label>
                <input
                  type="password"
                  placeholder="Sua senha de preferência"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-xl active:scale-[0.98] mt-2"
              >
                Solicitar Cadastro
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
