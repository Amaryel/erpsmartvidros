import { UserAccount, UserRole, UserPermissions, UserStatus } from '../../../types';
import { storageAdapter } from '../storageAdapter';
import { getDefaultPermissions } from '../../../utils/permissions';
import { getSupabaseClient } from '../../../lib/supabase';

/**
 * REPOSITÓRIO DE USUÁRIOS
 * -----------------------------------------------------------------------------
 * Fonte da verdade: tabela public.user_accounts (Supabase), protegida por RLS.
 * Credenciais (senhas) ficam EXCLUSIVAMENTE no Supabase Auth — nunca neste app,
 * nunca no banco de dados da aplicação e nunca no armazenamento do navegador.
 *
 * O armazenamento local guarda apenas uma cópia (cache) dos perfis da empresa
 * para exibição rápida e uso offline.
 */

export const USERS_KEY = 'smart_vidros_users';
const MIN_PASSWORD_LENGTH = 8;

/** Mantido por compatibilidade: não existem mais usuários pré-cadastrados no código. */
export const INITIAL_USERS: UserAccount[] = [];

type RepoResult = { success: boolean; message: string; user?: UserAccount };

// -----------------------------------------------------------------------------
// Utilitários internos
// -----------------------------------------------------------------------------

function sanitizeUser(user: UserAccount): UserAccount {
  // Remove qualquer resquício de senha que possa existir em caches antigos
  const { password: _ignored, ...rest } = user as UserAccount & { password?: unknown };
  return rest as UserAccount;
}

function normalizeUsername(value?: string): string {
  return (value || '').trim().toLowerCase().replace(/\s+/g, '');
}

/** Converte uma linha da tabela user_accounts no modelo usado pelo app. */
export function mapUserRow(row: any): UserAccount {
  const role: UserRole = row.role || 'vendedor';
  return {
    id: row.id,
    companyId: row.company_id || '',
    name: row.name || '',
    email: (row.email || '').toLowerCase(),
    username: row.username || undefined,
    role,
    status: (row.status || 'pendente') as UserStatus,
    permissions: row.permissions || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
    approvedAt: row.approved_at || undefined,
    approvedBy: row.approved_by || undefined,
  };
}

function saveLocalUsers(users: UserAccount[]): void {
  storageAdapter.setItem(USERS_KEY, users.map(sanitizeUser));
}

function requireClient() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.');
  }
  return client;
}

function friendlyError(err: unknown, fallback: string): string {
  const message = (err as any)?.message || '';
  if (/failed to fetch|network/i.test(message)) {
    return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.';
  }
  if (/row-level security|permission denied/i.test(message)) {
    return 'Você não tem permissão para realizar esta ação.';
  }
  if (/duplicate key|unique/i.test(message) && /username/i.test(message)) {
    return 'Este nome de usuário já está em uso.';
  }
  return message || fallback;
}

/**
 * Atualiza campos do perfil no banco. Se a coluna "permissions" ainda não existir
 * (script 01b não executado), tenta novamente sem ela para não bloquear o uso.
 */
async function updateProfileRow(id: string, fields: Record<string, unknown>): Promise<void> {
  const client = requireClient();
  const payload = { ...fields, updated_at: new Date().toISOString() };

  let { error } = await client.from('user_accounts').update(payload).eq('id', id);

  if (error && 'permissions' in payload && /permissions/i.test(error.message || '')) {
    const { permissions: _skip, ...withoutPermissions } = payload;
    ({ error } = await client.from('user_accounts').update(withoutPermissions).eq('id', id));
  }

  if (error) throw error;
}

/** Chama a Edge Function "admin-users" (operações que exigem privilégio de servidor). */
async function invokeAdminUsers(body: Record<string, unknown>): Promise<any> {
  const client = requireClient();
  const { data, error } = await client.functions.invoke('admin-users', { body });

  if (error) {
    let message = '';
    try {
      const ctx = (error as any).context;
      if (ctx && typeof ctx.json === 'function') {
        const parsed = await ctx.json();
        message = parsed?.error || '';
      }
    } catch {
      // resposta sem corpo JSON
    }
    if (!message && /Failed to send a request|Failed to fetch/i.test(error.message || '')) {
      message = 'Serviço de usuários indisponível. Confirme se a função "admin-users" foi publicada no Supabase.';
    }
    throw new Error(message || error.message || 'Não foi possível concluir a operação.');
  }

  if (data && data.error) throw new Error(data.error);
  return data;
}

function validatePassword(password: string): string | null {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return null;
}

// -----------------------------------------------------------------------------
// Leitura
// -----------------------------------------------------------------------------

/** Perfis em cache local (somente leitura rápida / offline). */
export function getUsers(): UserAccount[] {
  const data = storageAdapter.getItem<UserAccount[]>(USERS_KEY, []);
  return Array.isArray(data) ? data.map(sanitizeUser) : [];
}

export function getUserById(id: string): UserAccount | undefined {
  return getUsers().find((u) => u.id === id);
}

export function findUserByEmailOrUsername(identifier: string): UserAccount | undefined {
  if (!identifier || !identifier.trim()) return undefined;
  const target = identifier.trim().toLowerCase();
  return getUsers().find(
    (u) => u.email.toLowerCase() === target || (u.username && u.username.toLowerCase() === target)
  );
}

export function upsertUserInRepository(user: UserAccount): void {
  const users = getUsers();
  const clean = sanitizeUser(user);
  const idx = users.findIndex((u) => u.id === clean.id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...clean };
  } else {
    users.push(clean);
  }
  saveLocalUsers(users);
}

/**
 * Busca os perfis visíveis para o usuário logado (a RLS limita à própria empresa)
 * e atualiza o cache local.
 */
export async function fetchUsersFromSupabase(): Promise<UserAccount[]> {
  const client = getSupabaseClient();
  if (!client) return getUsers();

  const { data: sessionData } = await client.auth.getSession();
  if (!sessionData?.session) return getUsers();

  const { data, error } = await client
    .from('user_accounts')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;

  const users = (data || []).map(mapUserRow);
  saveLocalUsers(users);
  return users;
}

// -----------------------------------------------------------------------------
// Cadastro público ("Solicitar Cadastro" na tela de login)
// -----------------------------------------------------------------------------

export async function registerUser(userData: {
  name: string;
  email: string;
  username?: string;
  password?: string;
}): Promise<RepoResult> {
  const name = (userData.name || '').trim();
  const email = (userData.email || '').trim().toLowerCase();
  const username = normalizeUsername(userData.username) || email.split('@')[0];
  const password = userData.password || '';

  if (!name || !email.includes('@')) {
    return { success: false, message: 'Informe seu nome completo e um e-mail válido.' };
  }
  const passwordError = validatePassword(password);
  if (passwordError) return { success: false, message: passwordError };

  try {
    const client = requireClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { name, username } },
    });

    if (error) {
      if (/already registered|already exists/i.test(error.message)) {
        return { success: false, message: 'Este e-mail já está cadastrado. Use a opção "Entrar".' };
      }
      if (/password/i.test(error.message)) {
        return { success: false, message: 'Senha muito fraca. Use pelo menos 8 caracteres, misturando letras e números.' };
      }
      return { success: false, message: friendlyError(error, 'Não foi possível enviar sua solicitação.') };
    }

    // O perfil é criado como PENDENTE pelo banco. Encerramos a sessão criada pelo cadastro:
    // o acesso só é liberado depois da aprovação do administrador.
    if (data?.session) {
      await client.auth.signOut();
    }

    const needsEmailConfirmation = !data?.session;
    return {
      success: true,
      message: needsEmailConfirmation
        ? 'Solicitação enviada! Confirme seu e-mail pelo link que enviamos e aguarde a aprovação do administrador.'
        : 'Solicitação enviada! Você poderá entrar assim que o administrador aprovar seu acesso.',
    };
  } catch (err) {
    return { success: false, message: friendlyError(err, 'Não foi possível enviar sua solicitação.') };
  }
}

// -----------------------------------------------------------------------------
// Gestão de usuários (painel do administrador)
// -----------------------------------------------------------------------------

export async function createUser(userData: {
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: UserRole;
  permissions?: UserPermissions;
  createdBy?: string;
}): Promise<RepoResult> {
  const name = (userData.name || '').trim();
  const email = (userData.email || '').trim().toLowerCase();
  const role = userData.role || 'vendedor';
  const password = userData.password || '';

  if (!name) return { success: false, message: 'O nome do colaborador é obrigatório.' };
  if (!email.includes('@')) return { success: false, message: 'Informe um e-mail válido para o colaborador.' };

  const passwordError = validatePassword(password);
  if (passwordError) return { success: false, message: passwordError };

  let username = normalizeUsername(userData.username);
  if (!username) {
    const base = name.split(' ')[0].toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '') || 'usuario';
    const taken = new Set(getUsers().map((u) => (u.username || '').toLowerCase()));
    username = base;
    let counter = 1;
    while (taken.has(username)) {
      counter += 1;
      username = `${base}${counter}`;
    }
  }

  try {
    const result = await invokeAdminUsers({ action: 'create', name, email, username, password, role });
    const userId: string = result?.userId;

    if (userId && userData.permissions) {
      await updateProfileRow(userId, { permissions: userData.permissions });
    }

    const users = await fetchUsersFromSupabase();
    const created = users.find((u) => u.id === userId);

    return {
      success: true,
      message: `Colaborador "${name}" cadastrado com sucesso como ${role.toUpperCase()}!`,
      user: created,
    };
  } catch (err) {
    return { success: false, message: friendlyError(err, 'Não foi possível cadastrar o colaborador.') };
  }
}

export async function approveUser(
  userId: string,
  approvalData?: {
    username?: string;
    role?: UserRole;
    permissions?: UserPermissions;
  },
  approvedBy: string = 'Administrador'
): Promise<UserAccount | null> {
  const current = getUserById(userId);
  const role = approvalData?.role || current?.role || 'vendedor';
  const username = normalizeUsername(approvalData?.username) || current?.username;

  if (username) {
    const conflict = getUsers().find((u) => u.id !== userId && (u.username || '').toLowerCase() === username);
    if (conflict) throw new Error(`O nome de usuário "@${username}" já está em uso.`);
  }

  const now = new Date().toISOString();
  await updateProfileRow(userId, {
    status: 'aprovado',
    role,
    ...(username ? { username } : {}),
    permissions: approvalData?.permissions || getDefaultPermissions(role),
    approved_at: now,
    approved_by: approvedBy,
  });

  const users = await fetchUsersFromSupabase();
  return users.find((u) => u.id === userId) || null;
}

export async function rejectUser(userId: string): Promise<UserAccount | null> {
  await updateProfileRow(userId, { status: 'rejeitado' });
  const users = await fetchUsersFromSupabase();
  return users.find((u) => u.id === userId) || null;
}

/** Atualiza dados do perfil (nunca senha nem e-mail de login). */
export async function updateUser(
  id: string,
  updates: Partial<Pick<UserAccount, 'name' | 'username' | 'role' | 'status' | 'permissions'>>
): Promise<UserAccount | null> {
  const fields: Record<string, unknown> = {};
  if (updates.name !== undefined) fields.name = updates.name.trim();
  if (updates.username !== undefined) {
    const username = normalizeUsername(updates.username);
    if (username) {
      const conflict = getUsers().find((u) => u.id !== id && (u.username || '').toLowerCase() === username);
      if (conflict) throw new Error(`O nome de usuário "@${username}" já está em uso.`);
      fields.username = username;
    }
  }
  if (updates.role !== undefined) fields.role = updates.role;
  if (updates.status !== undefined) fields.status = updates.status;
  if (updates.permissions !== undefined) fields.permissions = updates.permissions;

  if (Object.keys(fields).length > 0) {
    await updateProfileRow(id, fields);
  }

  const users = await fetchUsersFromSupabase();
  return users.find((u) => u.id === id) || null;
}

/** Define uma nova senha para outro usuário (somente administradores). */
export async function setUserPassword(userId: string, newPassword: string): Promise<void> {
  const passwordError = validatePassword(newPassword);
  if (passwordError) throw new Error(passwordError);
  await invokeAdminUsers({ action: 'set_password', userId, password: newPassword });
}

/** Exclui o perfil e a conta de login do usuário (somente administradores). */
export async function deleteUser(id: string): Promise<UserAccount[]> {
  await invokeAdminUsers({ action: 'delete', userId: id });
  saveLocalUsers(getUsers().filter((u) => u.id !== id));
  try {
    return await fetchUsersFromSupabase();
  } catch {
    return getUsers();
  }
}
