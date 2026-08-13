import React, { useState, useEffect } from 'react';
import { UserAccount, AppUser } from '../types';
import {
  getUsers,
  approveUser,
  rejectUser,
  deleteUser,
  updateUser,
  SUPERADMIN_EMAIL,
} from '../services/storage';

interface SuperAdminPanelProps {
  currentUser: AppUser;
  onRefreshUsers?: () => void;
  onShowToast: (msg: string) => void;
}

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({
  currentUser,
  onRefreshUsers,
  onShowToast,
}) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'system'>('pending');

  // Estado do Modal de Aprovação
  const [approvingUser, setApprovingUser] = useState<UserAccount | null>(null);
  const [customUsername, setCustomUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'operador'>('operador');
  const [customPassword, setCustomPassword] = useState('');

  // Estado de Edição de Usuário Ativo
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'operador' | 'superadmin'>('operador');
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const list = getUsers();
    setUsers(list);
    if (onRefreshUsers) onRefreshUsers();
  };

  const pendingUsers = users.filter((u) => u.status === 'pendente');
  const approvedUsers = users.filter((u) => u.status === 'aprovado');

  // Abrir Modal de Aprovação
  const handleOpenApprovalModal = (user: UserAccount) => {
    setApprovingUser(user);
    const suggestedUsername = user.name
      .split(' ')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    setCustomUsername(suggestedUsername);
    setSelectedRole(user.role === 'admin' ? 'admin' : 'operador');
    setCustomPassword(user.password || '123456');
  };

  // Confirmar Aprovação
  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingUser) return;

    if (!customUsername.trim()) {
      alert('Por favor, informe um nome de usuário (username) para o login.');
      return;
    }

    const updated = approveUser(
      approvingUser.id,
      {
        username: customUsername.trim(),
        role: selectedRole,
        password: customPassword.trim(),
      },
      currentUser.name || 'Super Admin'
    );

    if (updated) {
      onShowToast(
        `Usuário "${updated.name}" APROVADO! Usuário de acesso: ${updated.username}`
      );
      setApprovingUser(null);
      loadUsers();
    }
  };

  // Rejeitar Solicitação
  const handleReject = (userId: string, name: string) => {
    if (confirm(`Tem certeza que deseja rejeitar o cadastro de "${name}"?`)) {
      rejectUser(userId);
      onShowToast(`Cadastro de "${name}" foi rejeitado.`);
      loadUsers();
    }
  };

  // Salvar Edição de Usuário Aprovado
  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUser(editingUser.id, {
      username: editUsername.trim().toLowerCase(),
      role: editRole,
      password: editPassword.trim(),
    });

    onShowToast(`Dados do usuário "${editingUser.name}" atualizados com sucesso!`);
    setEditingUser(null);
    loadUsers();
  };

  // Excluir Usuário
  const handleDeleteUser = (userId: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover permanentemente o usuário "${name}"?`)) {
      deleteUser(userId);
      onShowToast(`Usuário "${name}" removido.`);
      loadUsers();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho do Painel Super Admin */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-amber-500/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">Painel Super Admin</h1>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Acesso Restrito
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                Gestão de Usuários, Liberação de Cadastros e Configurações de Sistema
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 px-4 py-2.5 rounded-2xl text-xs text-slate-300 flex items-center gap-2 self-start md:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Logado como: <strong>{currentUser.email}</strong></span>
          </div>
        </div>

        {/* KPIs / Cards Metricos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700/60">
          <div
            onClick={() => setActiveTab('pending')}
            className={`p-4 rounded-2xl cursor-pointer transition-all border ${
              activeTab === 'pending'
                ? 'bg-amber-500/20 border-amber-500/50 text-white'
                : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Solicitações Pendentes</span>
              {pendingUsers.length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                  {pendingUsers.length} Novo
                </span>
              )}
            </div>
            <div className="text-2xl font-black mt-2 text-amber-400">{pendingUsers.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Aguardando liberação de acesso</p>
          </div>

          <div
            onClick={() => setActiveTab('approved')}
            className={`p-4 rounded-2xl cursor-pointer transition-all border ${
              activeTab === 'approved'
                ? 'bg-amber-500/20 border-amber-500/50 text-white'
                : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-xs font-bold text-slate-300">Usuários Liberados</span>
            <div className="text-2xl font-black mt-2 text-emerald-400">{approvedUsers.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Ativos com acesso ao sistema</p>
          </div>

          <div
            onClick={() => setActiveTab('system')}
            className={`p-4 rounded-2xl cursor-pointer transition-all border ${
              activeTab === 'system'
                ? 'bg-amber-500/20 border-amber-500/50 text-white'
                : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-xs font-bold text-slate-300">Acesso Simplificado</span>
            <div className="text-2xl font-black mt-2 text-sky-400">
              {approvedUsers.filter((u) => u.username).length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Acessam por Username (sem e-mail)</p>
          </div>
        </div>
      </div>

      {/* Abas do Painel */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-amber-500 text-slate-900 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>⏳ Cadastros Pendentes</span>
          {pendingUsers.length > 0 && (
            <span className="bg-amber-500 text-slate-950 px-2 py-0.2 rounded-full text-[10px] font-extrabold">
              {pendingUsers.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('approved')}
          className={`px-5 py-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'approved'
              ? 'border-amber-500 text-slate-900 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>👥 Usuários Ativos & Liberados</span>
          <span className="bg-slate-200 text-slate-700 px-2 py-0.2 rounded-full text-[10px] font-bold">
            {approvedUsers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('system')}
          className={`px-5 py-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'system'
              ? 'border-amber-500 text-slate-900 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>⚙️ Infraestrutura & Supabase</span>
        </button>
      </div>

      {/* ABA 1: SOLICITANTES PENDENTES */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="mb-4">
            <h2 className="text-base font-extrabold text-slate-900">Solicitações de Cadastro</h2>
            <p className="text-xs text-slate-500">
              Ao aprovar um cadastro, você definirá o Nível e um Nome de Usuário (username) para o cliente/operador logar no sistema sem precisar digitar o e-mail.
            </p>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <span className="text-3xl block mb-2">🎉</span>
              <p className="text-sm font-bold text-slate-700">Nenhum cadastro pendente de aprovação</p>
              <p className="text-xs text-slate-500 mt-1">Todos os solicitantes já foram liberados ou analisados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                    <th className="p-3 font-bold">Nome</th>
                    <th className="p-3 font-bold">E-mail</th>
                    <th className="p-3 font-bold">Data Solicitação</th>
                    <th className="p-3 font-bold text-center">Status</th>
                    <th className="p-3 font-bold text-right">Ações de Liberação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{u.name}</td>
                      <td className="p-3 text-slate-600">{u.email}</td>
                      <td className="p-3 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(u.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-extrabold text-[10px] uppercase tracking-wider">
                          Pendente
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenApprovalModal(u)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow text-xs flex items-center gap-1"
                          >
                            <span>✅</span> Aprovar & Criar User
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(u.id, u.name)}
                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition-all text-xs"
                          >
                            Rejeitar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ABA 2: USUÁRIOS LIBERADOS & ATIVOS */}
      {activeTab === 'approved' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Usuários Liberados do Sistema</h2>
              <p className="text-xs text-slate-500">
                Lista de todas as contas aprovadas com permissão de acesso ao ERP Smart Vidros.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-3 font-bold">Nome</th>
                  <th className="p-3 font-bold">Usuário (Username)</th>
                  <th className="p-3 font-bold">E-mail</th>
                  <th className="p-3 font-bold">Nível / Role</th>
                  <th className="p-3 font-bold">Aprovado por</th>
                  <th className="p-3 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approvedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      {u.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase() && (
                        <span className="text-xs" title="Super Admin">👑</span>
                      )}
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3">
                      {u.username ? (
                        <span className="font-mono bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 font-bold text-slate-800">
                          @{u.username}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Sem username</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wider ${
                          u.role === 'superadmin'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : u.role === 'admin'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{u.approvedBy || 'Super Admin'}</td>
                    <td className="p-3 text-right">
                      {u.email.toLowerCase() !== SUPERADMIN_EMAIL.toLowerCase() && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUser(u);
                              setEditUsername(u.username || '');
                              setEditRole(u.role === 'superadmin' ? 'admin' : u.role);
                              setEditPassword(u.password || '');
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-all"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition-all"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: INFRAESTRUTURA & SUPABASE */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Infraestrutura e Preparação Supabase</h2>
            <p className="text-xs text-slate-500">
              Status do ambiente de dados e credenciais do Super Admin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-2">
                👑 Super Admin do Sistema
              </h3>
              <p className="text-xs text-slate-600 mb-1">
                E-mail Mestre: <strong className="text-slate-900">{SUPERADMIN_EMAIL}</strong>
              </p>
              <p className="text-[11px] text-slate-500">
                Esta conta tem privilégios totais para aprovar usuários, gerenciar orçamentos, vendas e alterar dados da empresa.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-2">
                🗄️ Camada de Dados (Repository Pattern)
              </h3>
              <p className="text-xs text-slate-600 mb-1">
                Status Atual: <span className="text-emerald-600 font-bold">Persistência Local Pronta</span>
              </p>
              <p className="text-[11px] text-slate-500">
                A aplicação utiliza os repositórios desacoplados em <code className="bg-slate-200 px-1 rounded">src/services/data/repositories/</code> para futura sincronização com o banco PostgreSQL / Supabase sem alterar componentes da UI.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE APROVAÇÃO E CRIAÇÃO DE USERNAME */}
      {approvingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Aprovar & Ativar Cadastro de Usuário
              </h3>
              <button
                type="button"
                onClick={() => setApprovingUser(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmApproval} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900 leading-relaxed">
                👤 <strong>Solicitante:</strong> {approvingUser.name}
                <br />
                📧 <strong>E-mail:</strong> {approvingUser.email}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome de Usuário (Username para login sem e-mail)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">@</span>
                  <input
                    type="text"
                    value={customUsername}
                    onChange={(e) => setCustomUsername(e.target.value)}
                    placeholder="ex: joaovidros"
                    className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none font-mono"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Com esse username, o usuário poderá fazer login no sistema sem precisar digitar o e-mail.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nível de Permissão
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'operador')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                >
                  <option value="operador">Operador (Acesso a vendas, orçamentos e recibos)</option>
                  <option value="admin">Administrador (Acesso total)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Senha Inicial
                </label>
                <input
                  type="text"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApprovingUser(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  Confirmar e Aprovar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO DE USUÁRIO */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Editar Usuário: {editingUser.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username para Login
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nível
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as 'admin' | 'operador')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                >
                  <option value="operador">Operador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nova Senha
                </label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
