import React, { useState, useEffect } from 'react';
import { User, KeyRound, ShieldCheck, UserCheck, Eye, EyeOff, Save, X, Mail } from 'lucide-react';
import { AppUser } from '../types';
import { updateUser, getUsers, setSessionUser, changeOwnPassword } from '../services/storage';

interface UserProfileModalProps {
  currentUser: AppUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updatedUser: AppUser) => void;
  onShowToast: (msg: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onUpdateUser,
  onShowToast,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setUsername(currentUser.username || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Por favor, informe seu nome completo.');
      return;
    }

    if (!username.trim()) {
      setErrorMsg('Por favor, informe um nome de usuário (username) para login.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');

    // Verificar se o username já está em uso por outro usuário
    const existingUsernameUser = getUsers().find(
      (u) => u.id !== currentUser.id && u.username && u.username.toLowerCase() === cleanUsername
    );
    if (existingUsernameUser) {
      setErrorMsg(`O nome de usuário "@${cleanUsername}" já está em uso por outra conta.`);
      return;
    }

    const wantsPasswordChange = Boolean(newPassword || confirmPassword || currentPassword);
    if (wantsPasswordChange) {
      if (!currentPassword) {
        setErrorMsg('Informe sua senha atual para definir uma nova senha.');
        return;
      }
      if (newPassword.length < 8) {
        setErrorMsg('A nova senha deve possuir no mínimo 8 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('A confirmação de senha não confere com a nova senha digitada.');
        return;
      }
    }

    setIsSaving(true);
    try {
      // A senha é alterada no Supabase Auth (com confirmação da senha atual)
      if (wantsPasswordChange) {
        const pwd = await changeOwnPassword(currentPassword, newPassword);
        if (!pwd.success) {
          setErrorMsg(pwd.message);
          return;
        }
      }

      const updatedAcc = await updateUser(currentUser.id, {
        name: name.trim(),
        username: cleanUsername,
      });

      const updatedAppUser: AppUser = {
        ...currentUser,
        name: updatedAcc?.name || name.trim(),
        username: updatedAcc?.username || cleanUsername,
      };

      setSessionUser(updatedAppUser);
      onUpdateUser(updatedAppUser);
      onShowToast(wantsPasswordChange ? 'Perfil e senha atualizados com sucesso!' : 'Perfil atualizado com sucesso!');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ocorreu um erro ao atualizar os dados. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-[0] z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho do Modal */}
        <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white leading-tight">Configurar Meu Perfil</h2>
              <p className="text-xs text-slate-400">Edite seus dados de acesso e senha</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          
          {/* Badge Nível de Acesso */}
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  Nível de Permissão
                </span>
                <span className="text-xs font-black text-slate-900 uppercase">
                  {currentUser.role === 'superadmin'
                    ? '👑 Super Admin (Acesso Total)'
                    : currentUser.role === 'admin'
                    ? '🛡️ Administrador'
                    : '👤 Operador / Vendedor'}
                </span>
              </div>
            </div>

            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
              {currentUser.status}
            </span>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Dados Pessoais */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                  placeholder="Seu nome completo"
                  required
                />
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    readOnly
                    aria-readonly="true"
                    title="O e-mail de acesso é gerenciado pelo administrador"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                    placeholder="exemplo@email.com"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Usuário de Login (Username)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                    placeholder="amaryel"
                    required
                  />
                  <span className="text-slate-400 font-mono font-bold absolute left-3 top-2.5 text-sm">@</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Alteração de Senha */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>Alterar Senha de Acesso</span>
              </label>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 hover:text-slate-900 text-xs font-bold flex items-center gap-1 transition-colors"
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

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Para alterar sua senha, informe a senha atual e defina a nova senha.
            </p>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                Senha Atual
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400"
                placeholder="Informe sua senha atual"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                  Nova Senha
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Nova senha"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Repita a nova senha"
                />
              </div>
            </div>
          </div>

          {/* Rodapé com Botões */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
