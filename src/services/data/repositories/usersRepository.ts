import { UserAccount, UserRole, UserPermissions } from '../../../types';
import { storageAdapter } from '../storageAdapter';
import { generateUUID } from '../uuid';
import { autoSyncEntityChange } from '../supabaseSync';
import { getDefaultPermissions } from '../../../utils/permissions';

export const USERS_KEY = 'smart_vidros_users';
export const SUPERADMIN_EMAIL = 'amaryelcc@gmail.com';
const DEFAULT_COMPANY_ID = 'comp-smart-vidros-001';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-superadmin-001',
    companyId: DEFAULT_COMPANY_ID,
    name: 'Amaryel (Super Admin)',
    email: SUPERADMIN_EMAIL,
    username: 'amaryel',
    password: 'admin',
    role: 'superadmin',
    status: 'aprovado',
    permissions: getDefaultPermissions('superadmin'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: 'Sistema',
  },
  {
    id: 'usr-admin-001',
    companyId: DEFAULT_COMPANY_ID,
    name: 'James Clayton (Admin)',
    email: 'contato.smartvidros@gmail.com',
    username: 'smartvidros',
    password: '123',
    role: 'admin',
    status: 'aprovado',
    permissions: getDefaultPermissions('admin'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: 'Amaryel',
  },
  {
    id: 'usr-vendedor-001',
    companyId: DEFAULT_COMPANY_ID,
    name: 'Carlos Mendes (Vendedor)',
    email: 'vendedor@smartvidros.com',
    username: 'vendedor',
    password: '123',
    role: 'vendedor',
    status: 'aprovado',
    permissions: {
      ...getDefaultPermissions('vendedor'),
      maxDiscountPercent: 10,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: 'James Clayton',
  },
];

export function getUsers(): UserAccount[] {
  const data = storageAdapter.getItem<UserAccount[]>(USERS_KEY, null);
  if (!data) {
    storageAdapter.setItem(USERS_KEY, INITIAL_USERS);
    return INITIAL_USERS;
  }
  // Garantir que o superadmin sempre exista
  const hasSuperAdmin = data.some((u) => u.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase());
  if (!hasSuperAdmin) {
    data.unshift(INITIAL_USERS[0]);
    storageAdapter.setItem(USERS_KEY, data);
  }
  return data;
}

export function upsertUserInRepository(user: UserAccount): void {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...user };
  } else {
    users.push(user);
  }
  storageAdapter.setItem(USERS_KEY, users);
}

export function getUserById(id: string): UserAccount | undefined {
  return getUsers().find((u) => u.id === id);
}

export function findUserByEmailOrUsername(identifier: string): UserAccount | undefined {
  if (!identifier || !identifier.trim()) return undefined;
  const target = identifier.trim().toLowerCase();
  return getUsers().find(
    (u) =>
      u.email.toLowerCase() === target ||
      (u.username && u.username.toLowerCase() === target)
  );
}

export function createUser(userData: {
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: UserRole;
  permissions?: UserPermissions;
  createdBy?: string;
}): { success: boolean; message: string; user?: UserAccount } {
  const users = getUsers();
  const cleanEmail = userData.email.trim().toLowerCase();
  
  if (!cleanEmail) {
    return {
      success: false,
      message: 'O e-mail do colaborador é obrigatório.',
    };
  }

  if (!userData.name || !userData.name.trim()) {
    return {
      success: false,
      message: 'O nome do colaborador é obrigatório.',
    };
  }

  // Resolver username limpo e único
  let cleanUsername = userData.username ? userData.username.trim().toLowerCase().replace(/\s+/g, '') : '';
  if (!cleanUsername) {
    const base = userData.name.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'usuario';
    cleanUsername = base;
    let counter = 1;
    while (users.some((u) => u.username && u.username.toLowerCase() === cleanUsername)) {
      counter++;
      cleanUsername = `${base}${counter}`;
    }
  } else {
    // Se o usuário digitou um username que já existe
    const existingUsername = users.find((u) => u.username && u.username.toLowerCase() === cleanUsername);
    if (existingUsername) {
      return {
        success: false,
        message: `O nome de usuário "@${cleanUsername}" já está em uso por outro colaborador. Escolha outro username.`,
      };
    }
  }

  const role = userData.role || 'vendedor';
  const permissions = userData.permissions || getDefaultPermissions(role);
  const now = new Date().toISOString();

  // Verificar se o e-mail já existe
  const existingIdx = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
  if (existingIdx !== -1) {
    const existing = users[existingIdx];
    if (existing.status === 'aprovado') {
      return {
        success: false,
        message: `Já existe um colaborador ativo cadastrado com o e-mail "${cleanEmail}".`,
      };
    }

    // Se estava pendente ou rejeitado, ativa e atualiza
    const updatedUser: UserAccount = {
      ...existing,
      name: userData.name.trim(),
      username: cleanUsername,
      role,
      password: userData.password || existing.password || '123456',
      status: 'aprovado',
      permissions,
      approvedAt: now,
      approvedBy: userData.createdBy || 'Administrador',
      updatedAt: now,
    };

    users[existingIdx] = updatedUser;
    storageAdapter.setItem(USERS_KEY, users);
    autoSyncEntityChange('user_accounts', 'upsert', updatedUser);

    return {
      success: true,
      message: `Colaborador "${updatedUser.name}" aprovado e ativado com sucesso como ${updatedUser.role.toUpperCase()}!`,
      user: updatedUser,
    };
  }

  const newUser: UserAccount = {
    id: generateUUID(),
    companyId: DEFAULT_COMPANY_ID,
    name: userData.name.trim(),
    email: cleanEmail,
    username: cleanUsername,
    password: userData.password || '123456',
    role,
    status: 'aprovado',
    permissions,
    approvedAt: now,
    approvedBy: userData.createdBy || 'Administrador',
    createdAt: now,
    updatedAt: now,
  };

  users.push(newUser);
  storageAdapter.setItem(USERS_KEY, users);
  autoSyncEntityChange('user_accounts', 'upsert', newUser);

  return {
    success: true,
    message: `Colaborador "${newUser.name}" cadastrado com sucesso como ${newUser.role.toUpperCase()}!`,
    user: newUser,
  };
}

export function registerUser(userData: {
  name: string;
  email: string;
  username?: string;
  password?: string;
}): { success: boolean; message: string; user?: UserAccount } {
  const users = getUsers();
  const cleanEmail = userData.email.trim().toLowerCase();
  const cleanUsername = userData.username ? userData.username.trim().toLowerCase().replace(/\s+/g, '') : undefined;

  // Se for o email do super admin, aprova automaticamente
  const isSuper = cleanEmail === SUPERADMIN_EMAIL.toLowerCase();

  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    if (existing.status === 'pendente') {
      return {
        success: false,
        message: 'Este e-mail já possui um cadastro pendente aguardando aprovação do Administrador.',
      };
    }
    return {
      success: false,
      message: 'Este e-mail já está cadastrado no sistema.',
    };
  }

  if (cleanUsername) {
    const existingUsername = users.find((u) => u.username && u.username.toLowerCase() === cleanUsername);
    if (existingUsername) {
      return {
        success: false,
        message: `O nome de usuário "@${cleanUsername}" já está em uso por outro usuário.`,
      };
    }
  }

  const now = new Date().toISOString();
  const role: UserRole = isSuper ? 'superadmin' : 'vendedor';
  const newUser: UserAccount = {
    id: generateUUID(),
    companyId: DEFAULT_COMPANY_ID,
    name: userData.name.trim(),
    email: cleanEmail,
    username: cleanUsername,
    password: userData.password || '123456',
    role,
    status: isSuper ? 'aprovado' : 'pendente',
    permissions: getDefaultPermissions(role),
    createdAt: now,
    updatedAt: now,
    approvedAt: isSuper ? now : undefined,
    approvedBy: isSuper ? 'Sistema' : undefined,
  };

  users.unshift(newUser);
  storageAdapter.setItem(USERS_KEY, users);
  autoSyncEntityChange('user_accounts', 'upsert', newUser);

  return {
    success: true,
    message: isSuper
      ? 'Conta de Super Admin cadastrada e aprovada automaticamente!'
      : 'Cadastro realizado com sucesso! Sua solicitação foi enviada para aprovação do Administrador.',
    user: newUser,
  };
}

export function approveUser(
  userId: string,
  approvalData?: {
    username?: string;
    role?: UserRole;
    password?: string;
    permissions?: UserPermissions;
  },
  approvedBy: string = 'Administrador'
): UserAccount | null {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  const user = users[idx];

  let cleanUsername = approvalData?.username
    ? approvalData.username.trim().toLowerCase().replace(/\s+/g, '')
    : user.username;

  if (!cleanUsername) {
    const firstName = user.name.split(' ')[0].toLowerCase().replace(/[^a-z0-0]/g, '');
    cleanUsername = firstName + Math.floor(100 + Math.random() * 900);
  }

  const role = approvalData?.role || user.role || 'vendedor';
  const permissions = approvalData?.permissions || user.permissions || getDefaultPermissions(role);

  const updatedUser: UserAccount = {
    ...user,
    status: 'aprovado',
    username: cleanUsername,
    role,
    password: approvalData?.password || user.password || '123456',
    permissions,
    approvedAt: now,
    approvedBy,
    updatedAt: now,
  };

  users[idx] = updatedUser;
  storageAdapter.setItem(USERS_KEY, users);
  autoSyncEntityChange('user_accounts', 'upsert', updatedUser);
  return updatedUser;
}

export function rejectUser(userId: string): UserAccount | null {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  users[idx].status = 'rejeitado';
  users[idx].updatedAt = new Date().toISOString();
  storageAdapter.setItem(USERS_KEY, users);
  autoSyncEntityChange('user_accounts', 'upsert', users[idx]);
  return users[idx];
}

export function updateUser(
  id: string,
  updates: Partial<Omit<UserAccount, 'id' | 'createdAt'>>
): UserAccount | null {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;

  users[idx] = {
    ...users[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  storageAdapter.setItem(USERS_KEY, users);
  autoSyncEntityChange('user_accounts', 'upsert', users[idx]);
  return users[idx];
}

export function deleteUser(id: string): UserAccount[] {
  const users = getUsers().filter((u) => u.id !== id);
  storageAdapter.setItem(USERS_KEY, users);
  autoSyncEntityChange('user_accounts', 'delete', id);
  return users;
}

