import React, { useState, useEffect } from 'react';
import {
  UserAccount,
  AppUser,
  UserRole,
  SystemModuleId,
  UserPermissions,
} from '../types';
import {
  getUsers,
  createUser,
  approveUser,
  rejectUser,
  deleteUser,
  updateUser,
  SUPERADMIN_EMAIL,
} from '../services/storage';
import {
  ALL_SYSTEM_MODULES,
  getDefaultPermissions,
  getUserPermissions,
  canActorManageTarget,
  canAccessSensitiveSettings,
} from '../utils/permissions';
import {
  ShieldCheck,
  Users,
  UserPlus,
  Percent,
  Lock,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Search,
  Key,
  Sliders,
  CheckSquare,
  Square,
  AlertTriangle,
  Database,
  Building2,
  Sparkles,
} from 'lucide-react';

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
  const isSuper =
    currentUser?.role === 'superadmin' ||
    (currentUser?.email && currentUser.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase());

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'pending' | 'system'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  // Modal de Criação Rápida de Usuário / Vendedor / Funcionário
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('123456');
  const [newUserRole, setNewUserRole] = useState<UserRole>('vendedor');
  const [newUserMaxDiscount, setNewUserMaxDiscount] = useState<number>(10);
  const [newUserModules, setNewUserModules] = useState<SystemModuleId[]>(
    getDefaultPermissions('vendedor').allowedModules
  );
  const [newUserCanSettle, setNewUserCanSettle] = useState(true);
  const [newUserCanCancelSales, setNewUserCanCancelSales] = useState(false);

  // Modal de Edição de Usuário Existente
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('vendedor');
  const [editPassword, setEditPassword] = useState('');
  const [editMaxDiscount, setEditMaxDiscount] = useState<number>(10);
  const [editModules, setEditModules] = useState<SystemModuleId[]>([]);
  const [editCanSettle, setEditCanSettle] = useState(true);
  const [editCanCancelSales, setEditCanCancelSales] = useState(false);

  // Modal de Aprovação de Solicitação Pendente
  const [approvingUser, setApprovingUser] = useState<UserAccount | null>(null);
  const [approvalUsername, setApprovalUsername] = useState('');
  const [approvalRole, setApprovalRole] = useState<UserRole>('vendedor');
  const [approvalPassword, setApprovalPassword] = useState('123456');
  const [approvalMaxDiscount, setApprovalMaxDiscount] = useState<number>(10);
  const [approvalModules, setApprovalModules] = useState<SystemModuleId[]>(
    getDefaultPermissions('vendedor').allowedModules
  );
  const [approvalCanSettle, setApprovalCanSettle] = useState(true);

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

  // Filtragem de Usuários
  const filteredUsers = approvedUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Estados de Erro e Confirmações
  const [createModalError, setCreateModalError] = useState<string | null>(null);
  const [editModalError, setEditModalError] = useState<string | null>(null);
  const [approvalModalError, setApprovalModalError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [userToReject, setUserToReject] = useState<{ id: string; name: string } | null>(null);

  // Abrir Modal de Criação com Presets de Cargo
  const handleOpenCreateModal = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserUsername('');
    setNewUserPassword('123456');
    setNewUserRole('vendedor');
    const defaultPerms = getDefaultPermissions('vendedor');
    setNewUserMaxDiscount(defaultPerms.maxDiscountPercent);
    setNewUserModules(defaultPerms.allowedModules);
    setNewUserCanSettle(true);
    setNewUserCanCancelSales(false);
    setCreateModalError(null);
    setIsCreateModalOpen(true);
  };

  const handleRoleChangeForNewUser = (role: UserRole) => {
    setNewUserRole(role);
    const defaultPerms = getDefaultPermissions(role);
    setNewUserMaxDiscount(defaultPerms.maxDiscountPercent);
    setNewUserModules(defaultPerms.allowedModules);
    setNewUserCanSettle(role !== 'funcionario');
  };

  const handleToggleModuleForNew = (modId: SystemModuleId) => {
    if (newUserModules.includes(modId)) {
      setNewUserModules(newUserModules.filter((m) => m !== modId));
    } else {
      setNewUserModules([...newUserModules, modId]);
    }
  };

  // Salvar Novo Usuário
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateModalError(null);

    const trimmedName = newUserName.trim();
    const trimmedEmail = newUserEmail.trim();

    if (!trimmedName || !trimmedEmail) {
      setCreateModalError('Por favor, preencha o Nome Completo e o E-mail de Acesso.');
      return;
    }

    const permissions: UserPermissions = {
      allowedModules: newUserModules,
      maxDiscountPercent: Number(newUserMaxDiscount) || 0,
      canGiveDiscount: Number(newUserMaxDiscount) > 0,
      canSettleReceivables: newUserCanSettle,
      canCancelSales: newUserCanCancelSales,
      canManageUsers: newUserRole === 'admin' || newUserRole === 'superadmin',
      canAccessSensitiveSettings: newUserRole === 'superadmin',
    };

    const res = createUser({
      name: trimmedName,
      email: trimmedEmail,
      username: newUserUsername.trim() || undefined,
      password: newUserPassword.trim() || '123456',
      role: newUserRole,
      permissions,
      createdBy: currentUser?.name || 'Administrador',
    });

    if (!res.success) {
      setCreateModalError(res.message);
      return;
    }

    onShowToast(res.message);
    setIsCreateModalOpen(false);
    loadUsers();
  };

  // Abrir Modal de Edição
  const handleOpenEditModal = (u: UserAccount) => {
    if (!canActorManageTarget(currentUser, u)) {
      onShowToast('Você não tem autorização para alterar parâmetros deste usuário.');
      return;
    }

    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditUsername(u.username || '');
    setEditRole(u.role || 'vendedor');
    setEditPassword(u.password || '');
    setEditModalError(null);

    const perms = getUserPermissions(u);
    setEditMaxDiscount(typeof perms.maxDiscountPercent === 'number' ? perms.maxDiscountPercent : 10);
    setEditModules(perms.allowedModules || []);
    setEditCanSettle(perms.canSettleReceivables !== false);
    setEditCanCancelSales(perms.canCancelSales === true);
  };

  const handleRoleChangeForEdit = (role: UserRole) => {
    setEditRole(role);
    const defaultPerms = getDefaultPermissions(role);
    setEditMaxDiscount(defaultPerms.maxDiscountPercent);
    setEditModules(defaultPerms.allowedModules);
    setEditCanSettle(role !== 'funcionario');
  };

  const handleToggleModuleForEdit = (modId: SystemModuleId) => {
    if (editModules.includes(modId)) {
      setEditModules(editModules.filter((m) => m !== modId));
    } else {
      setEditModules([...editModules, modId]);
    }
  };

  // Salvar Edição
  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditModalError(null);

    if (!editName.trim()) {
      setEditModalError('O nome do usuário não pode ficar em branco.');
      return;
    }

    const permissions: UserPermissions = {
      allowedModules: editModules,
      maxDiscountPercent: Number(editMaxDiscount) || 0,
      canGiveDiscount: Number(editMaxDiscount) > 0,
      canSettleReceivables: editCanSettle,
      canCancelSales: editCanCancelSales,
      canManageUsers: editRole === 'admin' || editRole === 'superadmin',
      canAccessSensitiveSettings: editRole === 'superadmin',
    };

    updateUser(editingUser.id, {
      name: editName.trim(),
      username: editUsername.trim().toLowerCase() || undefined,
      role: editRole,
      password: editPassword.trim() || editingUser.password,
      permissions,
    });

    onShowToast(`Permissões e dados de "${editName}" atualizados com sucesso!`);
    setEditingUser(null);
    loadUsers();
  };

  // Abrir Modal de Aprovação de Solicitação
  const handleOpenApprovalModal = (user: UserAccount) => {
    setApprovingUser(user);
    const suggestedUsername = user.name
      .split(' ')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    setApprovalUsername(suggestedUsername);
    setApprovalRole('vendedor');
    setApprovalPassword(user.password || '123456');
    setApprovalModalError(null);

    const defaultPerms = getDefaultPermissions('vendedor');
    setApprovalMaxDiscount(defaultPerms.maxDiscountPercent);
    setApprovalModules(defaultPerms.allowedModules);
    setApprovalCanSettle(true);
  };

  // Confirmar Aprovação
  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingUser) return;
    setApprovalModalError(null);

    if (!approvalUsername.trim()) {
      setApprovalModalError('Por favor, informe um nome de usuário (username) para o login.');
      return;
    }

    const permissions: UserPermissions = {
      allowedModules: approvalModules,
      maxDiscountPercent: Number(approvalMaxDiscount) || 0,
      canGiveDiscount: Number(approvalMaxDiscount) > 0,
      canSettleReceivables: approvalCanSettle,
      canCancelSales: false,
      canManageUsers: approvalRole === 'admin' || approvalRole === 'superadmin',
      canAccessSensitiveSettings: approvalRole === 'superadmin',
    };

    const updated = approveUser(
      approvingUser.id,
      {
        username: approvalUsername.trim(),
        role: approvalRole,
        password: approvalPassword.trim(),
        permissions,
      },
      currentUser.name || 'Administrador'
    );

    if (updated) {
      onShowToast(
        `Usuário "${updated.name}" APROVADO como ${updated.role.toUpperCase()} com limite de ${permissions.maxDiscountPercent}% de desconto!`
      );
      setApprovingUser(null);
      loadUsers();
    }
  };

  // Rejeitar Solicitação
  const handleConfirmReject = () => {
    if (!userToReject) return;
    rejectUser(userToReject.id);
    onShowToast(`Cadastro de "${userToReject.name}" foi rejeitado.`);
    setUserToReject(null);
    loadUsers();
  };

  // Excluir Usuário
  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    deleteUser(userToDelete.id);
    onShowToast(`Usuário "${userToDelete.name}" foi removido do sistema.`);
    setUserToDelete(null);
    loadUsers();
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Painel */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-amber-500/20">
              {isSuper ? '👑' : '👥'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {isSuper ? 'Painel Master Super Admin' : 'Gestão de Usuários & Equipe'}
                </h1>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {isSuper ? 'Nível Supremo' : 'Nível Administrador'}
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                {isSuper
                  ? 'Controle total de permissões, limites de desconto de vendedores, infraestrutura e contas'
                  : 'Cadastre vendedores e funcionários, defina módulos de acesso e limite de descontos comerciais'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Novo Vendedor / Funcionário</span>
            </button>
          </div>
        </div>

        {/* KPIs / Cards Métricos */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700/60">
          <div
            onClick={() => setActiveTab('users')}
            className={`p-4 rounded-2xl cursor-pointer transition-all border ${
              activeTab === 'users'
                ? 'bg-amber-500/20 border-amber-500/50 text-white'
                : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-xs font-bold text-slate-300">Total de Usuários Ativos</span>
            <div className="text-2xl font-black mt-2 text-emerald-400">{approvedUsers.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Vendedores, Admins & Equipe</p>
          </div>

          <div
            onClick={() => setActiveTab('pending')}
            className={`p-4 rounded-2xl cursor-pointer transition-all border ${
              activeTab === 'pending'
                ? 'bg-amber-500/20 border-amber-500/50 text-white'
                : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Cadastros Pendentes</span>
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
            onClick={() => {
              setActiveTab('users');
              setRoleFilter('vendedor');
            }}
            className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800 cursor-pointer transition-all"
          >
            <span className="text-xs font-bold text-slate-300">Vendedores Configurados</span>
            <div className="text-2xl font-black mt-2 text-sky-400">
              {approvedUsers.filter((u) => u.role === 'vendedor').length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Com limites de desconto ativos</p>
          </div>

          <div
            onClick={() => setActiveTab('system')}
            className={`p-4 rounded-2xl cursor-pointer transition-all border ${
              activeTab === 'system'
                ? 'bg-amber-500/20 border-amber-500/50 text-white'
                : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-xs font-bold text-slate-300">
              {isSuper ? 'Banco & Supabase' : 'Privilégios & Sistema'}
            </span>
            <div className="text-2xl font-black mt-2 text-indigo-400">
              {isSuper ? 'Master' : 'Admin'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {isSuper ? 'Configurações Sensíveis' : 'Infraestrutura Gerenciada'}
            </p>
          </div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-amber-500 text-slate-900 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-amber-600" />
          <span>Usuários & Equipe Ativa</span>
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
            {approvedUsers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-amber-500 text-slate-900 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>⏳ Solicitações Pendentes</span>
          {pendingUsers.length > 0 && (
            <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-extrabold animate-pulse">
              {pendingUsers.length}
            </span>
          )}
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
          <Database className="w-4 h-4 text-indigo-600" />
          <span>Infraestrutura & Supabase</span>
        </button>
      </div>

      {/* ABA 1: LISTA DE USUÁRIOS E PERMISSÕES */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Usuários, Vendedores e Níveis de Acesso
              </h2>
              <p className="text-xs text-slate-500">
                Configure os módulos liberados e o limite máximo de desconto para cada vendedor e funcionário.
              </p>
            </div>

            {/* Filtros e Busca */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou @user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 w-48 sm:w-60"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="all">Todos os Cargos</option>
                <option value="vendedor">Vendedores</option>
                <option value="funcionario">Funcionários</option>
                <option value="admin">Administradores</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-3 font-bold">Colaborador / Usuário</th>
                  <th className="p-3 font-bold">Login (@Username)</th>
                  <th className="p-3 font-bold">Cargo / Nível</th>
                  <th className="p-3 font-bold">Limite de Desconto</th>
                  <th className="p-3 font-bold">Módulos Acessíveis</th>
                  <th className="p-3 font-bold">Dar Baixa</th>
                  <th className="p-3 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const perms = getUserPermissions(u);
                  const isUserSuper =
                    u.role === 'superadmin' ||
                    u.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();

                  const canManage = canActorManageTarget(currentUser, u);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              isUserSuper
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : u.role === 'admin'
                                ? 'bg-indigo-100 text-indigo-800'
                                : u.role === 'vendedor'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {isUserSuper && <span title="Super Admin Supremo">👑</span>}
                              <span>{u.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </div>
                        </div>
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

                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1 ${
                            isUserSuper
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : u.role === 'admin'
                              ? 'bg-indigo-100 text-indigo-800'
                              : u.role === 'vendedor'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isUserSuper
                            ? 'Super Admin'
                            : u.role === 'admin'
                            ? 'Administrador'
                            : u.role === 'vendedor'
                            ? 'Vendedor'
                            : 'Funcionário'}
                        </span>
                      </td>

                      <td className="p-3">
                        {isUserSuper || u.role === 'admin' ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg text-[11px]">
                            Ilimitado (100%)
                          </span>
                        ) : perms.maxDiscountPercent > 0 ? (
                          <span className="text-amber-900 font-extrabold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-[11px] inline-flex items-center gap-1">
                            <Percent className="w-3 h-3 text-amber-600" />
                            <span>Máx: {perms.maxDiscountPercent}%</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-lg text-[11px]">
                            Sem Desconto (0%)
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-lg text-[11px]">
                          {perms.allowedModules.length} de {ALL_SYSTEM_MODULES.length} módulos
                        </span>
                      </td>

                      <td className="p-3">
                        {perms.canSettleReceivables !== false ? (
                          <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Liberado
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Bloqueado
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canManage ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(u)}
                                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-xl transition-all text-xs flex items-center gap-1"
                                title="Editar Permissões, Módulos e Limites de Desconto"
                              >
                                <Sliders className="w-3.5 h-3.5 text-amber-700" />
                                <span>Permissões</span>
                              </button>

                              {!isUserSuper && (
                                <button
                                  type="button"
                                  onClick={() => setUserToDelete(u)}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all text-xs"
                                  title="Remover Usuário"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-slate-400 italic text-[10px] flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Protegido
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: SOLICITAÇÕES PENDENTES */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Solicitações de Cadastro Pendentes</h2>
            <p className="text-xs text-slate-500">
              Aprove novos cadastros definindo de imediato se o colaborador atuará como Vendedor, Funcionário ou Administrador, além dos seus módulos e limite de desconto.
            </p>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <span className="text-3xl block mb-2">🎉</span>
              <p className="text-sm font-bold text-slate-700">Nenhum cadastro pendente</p>
              <p className="text-xs text-slate-500 mt-1">Todos os solicitantes já foram analisados e liberados.</p>
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
                    <th className="p-3 font-bold text-right">Ações</th>
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
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm text-xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Aprovar & Configurar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setUserToReject({ id: u.id, name: u.name })}
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

      {/* ABA 3: INFRAESTRUTURA & SUPABASE */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Infraestrutura & Configurações Sensíveis</h2>
            <p className="text-xs text-slate-500">
              Gerenciamento de banco de dados, chaves de API Supabase e credenciais mestras do sistema.
            </p>
          </div>

          {isSuper ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-700 shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">👑</span>
                    <h3 className="font-extrabold text-sm text-amber-400">Super Admin Master</h3>
                  </div>
                  <p className="text-xs text-slate-300 mb-1">
                    E-mail Primário: <strong>{SUPERADMIN_EMAIL}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Você possui autoridade irrestrita para alterar qualquer parâmetro do Administrador, gerenciar todas as credenciais Supabase e controlar os dados de toda a vidraçaria.
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-emerald-700" />
                    <h3 className="font-extrabold text-sm text-emerald-900">Banco de Dados Supabase</h3>
                  </div>
                  <p className="text-xs text-emerald-800 mb-1">
                    Camada Repository + LocalStorage + Sincronização em Nuvem ativa.
                  </p>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    As credenciais de conexão do Supabase estão protegidas contra alterações de operadores e administradores padrão.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-600" />
                  <span>Regras de Proteção e Hierarquia Ativas</span>
                </h3>
                <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
                  <li><strong>Superadmin:</strong> Altera qualquer parâmetro do Administrador, Vendedor e Funcionário.</li>
                  <li><strong>Admin:</strong> Pode ver todo o sistema operacional, cadastrar e configurar vendedores/funcionários, mas <em>não pode</em> alterar chaves do Supabase nem editar contas Superadmin.</li>
                  <li><strong>Vendedor:</strong> Pode gerar orçamentos, vendas (PDV), dar baixa em recebíveis e emitir recibos, respeitando rigorosamente o <em>limite de desconto</em> configurado pelo Admin.</li>
                  <li><strong>Funcionário:</strong> Acesso restrito a operações e catálogo de peças.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center mx-auto text-xl font-bold">
                🔒
              </div>
              <h3 className="text-base font-extrabold text-amber-950">
                Acesso Restrito a Infraestrutura Sensível
              </h3>
              <p className="text-xs text-amber-800 max-w-md mx-auto leading-relaxed">
                As configurações de chaves de API do Supabase e infraestrutura de servidores são exclusivas do Super Administrador (<strong>{SUPERADMIN_EMAIL}</strong>).
                <br />
                Como Administrador, você possui controle total sobre o cadastro de colaboradores, orçamentos, vendas, clientes e limites de desconto na aba <strong>"Usuários & Equipe Ativa"</strong>.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CRIAR NOVO VENDEDOR / FUNCIONÁRIO / ADMIN */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl max-w-2xl w-full border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Cadastrar Novo Colaborador
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              {createModalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <span className="font-bold">⚠️</span>
                  <span>{createModalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={newUserName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewUserName(val);
                      if (!newUserUsername || newUserUsername === newUserName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')) {
                        const first = val.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
                        setNewUserUsername(first);
                      }
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    E-mail de Acesso *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="joao@smartvidros.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome de Usuário (@Username)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">@</span>
                    <input
                      type="text"
                      placeholder="joaovendas"
                      value={newUserUsername}
                      onChange={(e) => setNewUserUsername(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Senha Inicial *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Seleção do Cargo / Nível */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cargo / Nível de Acesso
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div
                    onClick={() => handleRoleChangeForNewUser('vendedor')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      newUserRole === 'vendedor'
                        ? 'border-amber-500 bg-amber-50 text-slate-900 font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-black">
                      <span>💼 Vendedor</span>
                      {newUserRole === 'vendedor' && <span>✓</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Orçamentos, vendas e limite de desconto comercial.</p>
                  </div>

                  <div
                    onClick={() => handleRoleChangeForNewUser('funcionario')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      newUserRole === 'funcionario'
                        ? 'border-amber-500 bg-amber-50 text-slate-900 font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-black">
                      <span>🛠️ Funcionário</span>
                      {newUserRole === 'funcionario' && <span>✓</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Operações, medições, instalação e catálogo.</p>
                  </div>

                  <div
                    onClick={() => handleRoleChangeForNewUser('admin')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      newUserRole === 'admin'
                        ? 'border-amber-500 bg-amber-50 text-slate-900 font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-black">
                      <span>👔 Administrador</span>
                      {newUserRole === 'admin' && <span>✓</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Visão completa e gestão de vendedores.</p>
                  </div>
                </div>
              </div>

              {/* Limite de Desconto Comercial */}
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                    <Percent className="w-4 h-4 text-amber-700" />
                    <span>Limite Máximo de Desconto Permitido</span>
                  </div>
                  <span className="font-mono text-base font-black text-amber-900 bg-white px-2.5 py-0.5 rounded-lg border border-amber-300">
                    {newUserRole === 'admin' ? 'Ilimitado (100%)' : `${newUserMaxDiscount}%`}
                  </span>
                </div>

                {newUserRole !== 'admin' ? (
                  <div className="space-y-2 pt-1">
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={newUserMaxDiscount}
                      onChange={(e) => setNewUserMaxDiscount(Number(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                      <button
                        type="button"
                        onClick={() => setNewUserMaxDiscount(0)}
                        className={`px-2 py-1 rounded-md border ${
                          newUserMaxDiscount === 0 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-white'
                        }`}
                      >
                        0% (Sem Desconto)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewUserMaxDiscount(5)}
                        className={`px-2 py-1 rounded-md border ${
                          newUserMaxDiscount === 5 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-white'
                        }`}
                      >
                        5%
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewUserMaxDiscount(10)}
                        className={`px-2 py-1 rounded-md border ${
                          newUserMaxDiscount === 10 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-white'
                        }`}
                      >
                        10% (Recomendado)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewUserMaxDiscount(15)}
                        className={`px-2 py-1 rounded-md border ${
                          newUserMaxDiscount === 15 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-white'
                        }`}
                      >
                        15%
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewUserMaxDiscount(20)}
                        className={`px-2 py-1 rounded-md border ${
                          newUserMaxDiscount === 20 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-white'
                        }`}
                      >
                        20%
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-800">
                    Administradores possuem permissão irrestrita para aplicar qualquer percentual de desconto.
                  </p>
                )}
              </div>

              {/* Seleção Detalhada de Módulos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Módulos Liberados no Sistema ({newUserModules.length} de {ALL_SYSTEM_MODULES.length})
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setNewUserModules(ALL_SYSTEM_MODULES.map((m) => m.id))}
                      className="text-amber-700 hover:underline font-bold"
                    >
                      Marcar Todos
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setNewUserModules(['dashboard'])}
                      className="text-slate-500 hover:underline"
                    >
                      Apenas Início
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                  {ALL_SYSTEM_MODULES.map((mod) => {
                    const isChecked = newUserModules.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => handleToggleModuleForNew(mod.id)}
                        className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center gap-2 transition-colors ${
                          isChecked
                            ? 'bg-amber-50 border-amber-300 text-slate-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate">{mod.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ações Especiais */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Pode dar baixa em Contas a Receber (Fiado)</div>
                  <div className="text-[11px] text-slate-500">Permite registrar recebimento de clientes no sistema.</div>
                </div>
                <input
                  type="checkbox"
                  checked={newUserCanSettle}
                  onChange={(e) => setNewUserCanSettle(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar Colaborador</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR USUÁRIO EXISTENTE */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl max-w-2xl w-full border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Editar Permissões: {editingUser.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-4">
              {editModalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <span className="font-bold">⚠️</span>
                  <span>{editModalError}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    disabled
                    value={editEmail}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome de Usuário (@Username)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">@</span>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alterar Senha
                  </label>
                  <input
                    type="text"
                    placeholder="Digite nova senha (ou deixe em branco)"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Cargo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cargo / Nível
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div
                    onClick={() => handleRoleChangeForEdit('vendedor')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      editRole === 'vendedor'
                        ? 'border-amber-500 bg-amber-50 text-slate-900 font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-black">
                      <span>💼 Vendedor</span>
                      {editRole === 'vendedor' && <span>✓</span>}
                    </div>
                  </div>

                  <div
                    onClick={() => handleRoleChangeForEdit('funcionario')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      editRole === 'funcionario'
                        ? 'border-amber-500 bg-amber-50 text-slate-900 font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-black">
                      <span>🛠️ Funcionário</span>
                      {editRole === 'funcionario' && <span>✓</span>}
                    </div>
                  </div>

                  {isSuper ? (
                    <div
                      onClick={() => handleRoleChangeForEdit('admin')}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        editRole === 'admin'
                          ? 'border-amber-500 bg-amber-50 text-slate-900 font-bold shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-black">
                        <span>👔 Administrador</span>
                        {editRole === 'admin' && <span>✓</span>}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl border border-slate-200 bg-slate-100 text-slate-400 text-xs">
                      <div className="font-bold">👔 Administrador</div>
                      <span className="text-[10px]">Apenas Super Admin altera</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Limite de Desconto Comercial */}
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                    <Percent className="w-4 h-4 text-amber-700" />
                    <span>Limite Máximo de Desconto deste Usuário</span>
                  </div>
                  <span className="font-mono text-base font-black text-amber-900 bg-white px-2.5 py-0.5 rounded-lg border border-amber-300">
                    {editRole === 'admin' ? 'Ilimitado (100%)' : `${editMaxDiscount}%`}
                  </span>
                </div>

                {editRole !== 'admin' && (
                  <div className="space-y-2 pt-1">
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={editMaxDiscount}
                      onChange={(e) => setEditMaxDiscount(Number(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                      <button
                        type="button"
                        onClick={() => setEditMaxDiscount(0)}
                        className={`px-2 py-1 rounded-md border ${
                          editMaxDiscount === 0 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-white'
                        }`}
                      >
                        0%
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditMaxDiscount(5)}
                        className={`px-2 py-1 rounded-md border ${
                          editMaxDiscount === 5 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-white'
                        }`}
                      >
                        5%
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditMaxDiscount(10)}
                        className={`px-2 py-1 rounded-md border ${
                          editMaxDiscount === 10 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-white'
                        }`}
                      >
                        10%
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditMaxDiscount(15)}
                        className={`px-2 py-1 rounded-md border ${
                          editMaxDiscount === 15 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-white'
                        }`}
                      >
                        15%
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditMaxDiscount(20)}
                        className={`px-2 py-1 rounded-md border ${
                          editMaxDiscount === 20 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-white'
                        }`}
                      >
                        20%
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Módulos Liberados */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Módulos Liberados ({editModules.length} de {ALL_SYSTEM_MODULES.length})
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setEditModules(ALL_SYSTEM_MODULES.map((m) => m.id))}
                      className="text-amber-700 hover:underline font-bold"
                    >
                      Liberar Todos
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                  {ALL_SYSTEM_MODULES.map((mod) => {
                    const isChecked = editModules.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => handleToggleModuleForEdit(mod.id)}
                        className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center gap-2 transition-colors ${
                          isChecked
                            ? 'bg-amber-50 border-amber-300 text-slate-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate">{mod.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Baixa em Contas a Receber */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Pode dar baixa em Contas a Receber (Fiado)</div>
                  <div className="text-[11px] text-slate-500">Permite registrar pagamentos recebidos dos clientes.</div>
                </div>
                <input
                  type="checkbox"
                  checked={editCanSettle}
                  onChange={(e) => setEditCanSettle(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: APROVAÇÃO DE CADASTRO PENDENTE */}
      {approvingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl max-w-xl w-full border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Aprovar & Ativar Colaborador</span>
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
              {approvalModalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <span className="font-bold">⚠️</span>
                  <span>{approvalModalError}</span>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-950 leading-relaxed">
                👤 <strong>Solicitante:</strong> {approvingUser.name}
                <br />
                📧 <strong>E-mail:</strong> {approvingUser.email}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome de Usuário (@Username) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">@</span>
                    <input
                      type="text"
                      required
                      value={approvalUsername}
                      onChange={(e) => setApprovalUsername(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Senha de Acesso *
                  </label>
                  <input
                    type="text"
                    required
                    value={approvalPassword}
                    onChange={(e) => setApprovalPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cargo / Perfil
                </label>
                <select
                  value={approvalRole}
                  onChange={(e) => {
                    const r = e.target.value as UserRole;
                    setApprovalRole(r);
                    const d = getDefaultPermissions(r);
                    setApprovalMaxDiscount(d.maxDiscountPercent);
                    setApprovalModules(d.allowedModules);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="vendedor">Vendedor (Orçamentos, Vendas, PDV)</option>
                  <option value="funcionario">Funcionário (Obras, Operações, Catálogo)</option>
                  <option value="admin">Administrador (Gestão Operacional)</option>
                </select>
              </div>

              {/* Limite de Desconto */}
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                  <span>Limite de Desconto Autorizado:</span>
                  <span className="font-mono font-black text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-300">
                    {approvalMaxDiscount}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={approvalMaxDiscount}
                  onChange={(e) => setApprovalMaxDiscount(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setApprovingUser(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Liberar e Ativar Usuário</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRMAÇÃO DE EXCLUSÃO DE USUÁRIO */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl max-w-md w-full border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">
              🗑️
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">
                Excluir Colaborador?
              </h3>
              <p className="text-xs text-slate-600">
                Tem certeza que deseja remover permanentemente o acesso de <strong>{userToDelete.name}</strong> ({userToDelete.email})?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CONFIRMAÇÃO DE REJEIÇÃO DE CADASTRO */}
      {userToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl max-w-md w-full border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl font-bold">
              🚫
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">
                Rejeitar Solicitação?
              </h3>
              <p className="text-xs text-slate-600">
                Tem certeza que deseja recusar o cadastro de <strong>{userToReject.name}</strong>?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToReject(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-md"
              >
                Sim, Rejeitar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
