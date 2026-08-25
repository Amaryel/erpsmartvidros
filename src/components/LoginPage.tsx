import React, { useState } from 'react';
import {
  Lock,
  Mail,
  UserCheck,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building2,
} from 'lucide-react';
import { AppUser } from '../types';
import { loginUser, registerUser, SUPERADMIN_EMAIL } from '../services/storage';

interface LoginPageProps {
  onSuccessLogin: (user: AppUser) => void;
  onOpenPublicCatalog?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin, onOpenPublicCatalog }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Formulário de Login
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Formulário de Cadastro
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regStatusMessage, setRegStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!identifier.trim()) {
      setLoginError('Por favor, digite seu e-mail ou nome de usuário.');
      return;
    }

    if (!password.trim()) {
      setLoginError('Por favor, informe sua senha de acesso.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = loginUser(identifier.trim(), password, rememberMe);
      setIsLoading(false);

      if (res.success && res.user) {
        onSuccessLogin(res.user);
      } else {
        setLoginError(res.message);
      }
    }, 200);
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

    if (regPassword && regPassword.length < 3) {
      setRegStatusMessage({
        type: 'error',
        text: 'A senha deve possuir pelo menos 3 caracteres.',
      });
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegStatusMessage({
        type: 'error',
        text: 'A confirmação de senha não confere.',
      });
      return;
    }

    const res = registerUser({
      name: regName.trim(),
      email: regEmail.trim(),
      username: regUsername.trim() || undefined,
      password: regPassword || '123456',
    });

    if (res.success) {
      setRegStatusMessage({
        type: 'success',
        text: res.message,
      });
      setRegName('');
      setRegEmail('');
      setRegUsername('');
      setRegPassword('');
      setRegConfirmPassword('');
    } else {
      setRegStatusMessage({
        type: 'error',
        text: res.message,
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-x-hidden selection:bg-amber-500 selection:text-slate-950 notranslate" translate="no">
      {/* Luzes e Efeitos de Fundo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-slate-800/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 my-auto">
        {/* Identidade Visual / Logotipo no Topo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl shadow-xl shadow-amber-500/30 mb-4 ring-4 ring-amber-500/20">
            SV
          </div>

          <div className="flex items-baseline justify-center gap-2 notranslate" translate="no">
            <span className="font-extrabold tracking-widest text-3xl text-amber-400 notranslate" translate="no">SMART</span>
            <span className="font-light tracking-widest text-2xl text-white uppercase notranslate" translate="no">VIDROS</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-medium tracking-wide">
            ERP de Gestão para Vidraçarias e Esquadrias
          </p>
        </div>

        {/* Card Principal de Autenticação */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
          
          {/* Alternador de Abas (Entrar / Solicitar Acesso) */}
          <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setLoginError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setRegStatusMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Solicitar Cadastro</span>
            </button>
          </div>

          {/* ABA 1: FORMULÁRIO DE LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3.5 bg-red-950/60 border border-red-500/40 rounded-2xl text-xs font-bold text-red-200 flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{loginError}</div>
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold text-slate-300 mb-1.5">
                  E-mail ou Usuário
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="amaryelcc@gmail.com ou amaryel"
                    autoComplete="username"
                    autoFocus
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-extrabold text-slate-300">
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Ocultar
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Mostrar
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-mono focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Opção Manter Conectado */}
              <div className="pt-1 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-xs font-semibold text-slate-300">
                    Manter conectado neste dispositivo
                  </span>
                </label>
              </div>

              {/* Botão de Entrar */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Acessar o Sistema</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ABA 2: FORMULÁRIO DE SOLICITAÇÃO DE CADASTRO */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {regStatusMessage && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2.5 ${
                    regStatusMessage.type === 'success'
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                      : 'bg-red-950/60 border border-red-500/40 text-red-200'
                  }`}
                >
                  {regStatusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="leading-relaxed">{regStatusMessage.text}</div>
                </div>
              )}

              <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                🛡️ Novos acessos passam por validação do administrador antes da liberação.
              </p>

              <div>
                <label className="block text-xs font-extrabold text-slate-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder:text-slate-600"
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-300 mb-1">
                    Nome de Usuário
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-mono focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="ex: amaryel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 mb-1">
                    Senha Desejada
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-mono focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-300 mb-1">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-mono focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-3"
              >
                <UserPlus className="w-4 h-4" />
                <span>Enviar Solicitação de Cadastro</span>
              </button>
            </form>
          )}

          {/* Divisor e Botão de Acesso ao Catálogo Público */}
          {onOpenPublicCatalog && (
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <button
                type="button"
                onClick={onOpenPublicCatalog}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 hover:from-amber-500/20 hover:to-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/50 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 group shadow-lg"
              >
                <span>✨</span>
                <span>Ver Catálogo Digital da Vidraçaria (Acesso Livre)</span>
                <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            </div>
          )}
        </div>

        {/* Rodapé Seguro */}
        <div className="text-center mt-6 text-xs text-slate-500 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Ambiente Protegido & Criptografado</span>
          </div>
          <p className="text-[11px] text-slate-600">
            Smart Vidros ERP • Administrador: {SUPERADMIN_EMAIL}
          </p>
        </div>
      </div>
    </div>
  );
};
