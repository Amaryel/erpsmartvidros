import { UserAccount } from '../../../types';
import { storageAdapter } from '../storageAdapter';
import { generateUUID } from '../uuid';

const USERS_KEY = 'smart_vidros_users';
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: 'Sistema',
  },
  {
    id: 'usr-admin-001',
    companyId: DEFAULT_COMPANY_ID,
    name: 'James Clayton',
    email: 'contato.smartvidros@gmail.com',
    username: 'smartvidros',
    password: '123',
    role: 'admin',
    status: 'aprovado',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: 'Amaryel',
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

export function registerUser(userData: {
  name: string;
  email: string;
  password?: string;
}): { success: boolean; message: string; user?: UserAccount } {
  const users = getUsers();
  const cleanEmail = userData.email.trim().toLowerCase();

  // Se for o email do super admin, aprova automaticamente
  const isSuper = cleanEmail === SUPERADMIN_EMAIL.toLowerCase();

  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    if (existing.status === 'pendente') {
      return {
        success: false,
        message: 'Este e-mail já possui um cadastro pendente aguardando aprovação do Super Admin.',
      };
    }
    return {
      success: false,
      message: 'Este e-mail já está cadastrado no sistema.',
    };
  }

  const now = new Date().toISOString();
  const newUser: UserAccount = {
    id: generateUUID(),
    companyId: DEFAULT_COMPANY_ID,
    name: userData.name.trim(),
    email: cleanEmail,
    password: userData.password || '123456',
    role: isSuper ? 'superadmin' : 'operador',
    status: isSuper ? 'aprovado' : 'pendente',
    createdAt: now,
    updatedAt: now,
  };

  users.unshift(newUser);
  storageAdapter.setItem(USERS_KEY, users);

  return {
    success: true,
    message: isSuper
      ? 'Conta de Super Admin cadastrada e aprovada automaticamente!'
      : 'Cadastro realizado com sucesso! Sua solicitação foi enviada para aprovação do Super Admin.',
    user: newUser,
  };
}

export function approveUser(
  userId: string,
  approvalData?: { username?: string; role?: 'admin' | 'operador'; password?: string },
  approvedBy: string = 'Super Admin'
): UserAccount | null {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  const user = users[idx];

  // Se for fornecido um nome de usuário (username), remove caracteres especiais/espaços
  let cleanUsername = approvalData?.username
    ? approvalData.username.trim().toLowerCase().replace(/\s+/g, '')
    : user.username;

  // Se não tiver username, cria um baseado no primeiro nome + sufixo
  if (!cleanUsername) {
    const firstName = user.name.split(' ')[0].toLowerCase().replace(/[^a-z0-0]/g, '');
    cleanUsername = firstName + Math.floor(100 + Math.random() * 900);
  }

  const updatedUser: UserAccount = {
    ...user,
    status: 'aprovado',
    username: cleanUsername,
    role: approvalData?.role || user.role || 'operador',
    password: approvalData?.password || user.password || '123456',
    approvedAt: now,
    approvedBy,
    updatedAt: now,
  };

  users[idx] = updatedUser;
  storageAdapter.setItem(USERS_KEY, users);
  return updatedUser;
}

export function rejectUser(userId: string): UserAccount | null {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  users[idx].status = 'rejeitado';
  users[idx].updatedAt = new Date().toISOString();
  storageAdapter.setItem(USERS_KEY, users);
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
  return users[idx];
}

export function deleteUser(id: string): UserAccount[] {
  const users = getUsers().filter((u) => u.id !== id);
  storageAdapter.setItem(USERS_KEY, users);
  return users;
}
