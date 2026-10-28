import { AppUser, UserAccount } from '../../types';
import { storageAdapter } from './storageAdapter';
import { getUserById, upsertUserInRepository, mapUserRow, USERS_KEY } from './repositories/usersRepository';
import { getUserPermissions } from '../../utils/permissions';
import { getSupabaseClient } from '../../lib/supabase';

/**
 * AUTENTICAÇÃO
 * -----------------------------------------------------------------------------
 * Login exclusivamente pelo Supabase Auth (senhas com hash no servidor).
 * O perfil (papel, status, empresa, permissões) vem da tabela user_accounts,
 * protegida por RLS. Nenhuma senha é comparada, guardada ou enviada por este app.
 */

const AUTH_SESSION_KEY = 'smart_vidros_auth_session';
const REMEMBER_KEY = 'smart_vidros_remember_session';
const TAB_SESSION_MARKER = 'smart_vidros_tab_session';
const SECURITY_MIGRATION_KEY = 'smart_vidros_security_v2';

export const DEFAULT_COMPANY_ID = 'comp-smart-vidros-001';
export const DEFAULT_USER_ID = 'usr-superadmin-001';

type LoginResult = { success: boolean; message: string; user?: AppUser };

// -----------------------------------------------------------------------------
// Sessão local (cópia do perfil para a interface; a autorização real é do banco)
// -----------------------------------------------------------------------------

function readTabSession(): AppUser | null {
  try {
    const raw = window.sessionStorage.getItem(AUTH_SESSION_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}

function writeSession(user: AppUser, rememberMe: boolean): void {
  storageAdapter.setItem(AUTH_SESSION_KEY, user);
  try {
    window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
    window.sessionStorage.setItem(TAB_SESSION_MARKER, '1');
    window.localStorage.setItem(REMEMBER_KEY, rememberMe ? '1' : '0');
  } catch {
    // armazenamento indisponível
  }
}

function clearLocalSession(): void {
  storageAdapter.removeItem(AUTH_SESSION_KEY);
  try {
    window.sessionStorage.removeItem(AUTH_SESSION_KEY);
    window.sessionStorage.removeItem(TAB_SESSION_MARKER);
    window.localStorage.removeItem(REMEMBER_KEY);
  } catch {
    // armazenamento indisponível
  }
}

function toAppUser(account: UserAccount): AppUser {
  return {
    id: account.id,
    email: account.email,
    username: account.username,
    name: account.name,
    role: account.role,
    status: account.status,
    companyId: account.companyId || DEFAULT_COMPANY_ID,
    permissions: getUserPermissions(account),
  };
}

export function getCurrentSessionUser(): AppUser | null {
  let sessionUser = readTabSession() || storageAdapter.getItem<AppUser>(AUTH_SESSION_KEY, null);
  if (!sessionUser) return null;

  // Reflete alterações de perfil já baixadas do banco (papel, status, permissões)
  const liveAccount = getUserById(sessionUser.id);
  if (liveAccount) {
    sessionUser = {
      ...sessionUser,
      name: liveAccount.name,
      username: liveAccount.username,
      role: liveAccount.role,
      status: liveAccount.status,
      permissions: getUserPermissions(liveAccount),
    };
  } else {
    sessionUser = { ...sessionUser, permissions: getUserPermissions(sessionUser) };
  }

  return sessionUser;
}

export function getCurrentUser(): AppUser | null {
  return getCurrentSessionUser();
}

export function getCurrentCompanyId(): string {
  return getCurrentSessionUser()?.companyId || DEFAULT_COMPANY_ID;
}

export function getCurrentUserId(): string {
  return getCurrentSessionUser()?.id || DEFAULT_USER_ID;
}

export function isSuperAdmin(user?: AppUser | UserAccount | null): boolean {
  return Boolean(user && user.role === 'superadmin');
}

/** Mantido por compatibilidade com telas que atualizam a sessão (ex.: perfil). */
export function setSessionUser(user: AppUser, rememberMe?: boolean): void {
  let remember = rememberMe;
  if (remember === undefined) {
    try {
      remember = window.localStorage.getItem(REMEMBER_KEY) !== '0';
    } catch {
      remember = true;
    }
  }
  writeSession(user, remember);
}

// -----------------------------------------------------------------------------
// Limpeza única de dados antigos (versões anteriores guardavam senhas no navegador)
// -----------------------------------------------------------------------------

export function purgeLegacyCredentials(): void {
  try {
    if (window.localStorage.getItem(SECURITY_MIGRATION_KEY) === 'done') return;
    window.localStorage.removeItem(USERS_KEY);
    window.localStorage.removeItem('smart_vidros_user_accounts');
    clearLocalSession();
    window.localStorage.setItem(SECURITY_MIGRATION_KEY, 'done');
  } catch {
    // armazenamento indisponível
  }
}

// -----------------------------------------------------------------------------
// Perfil do usuário autenticado
// -----------------------------------------------------------------------------

async function fetchOwnProfile(authUserId: string): Promise<UserAccount | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('user_accounts')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapUserRow(data) : null;
}

function statusBlockMessage(status: string): string | null {
  if (status === 'pendente') {
    return 'Sua conta está em análise aguardando liberação do Administrador. Assim que for aprovada, você poderá acessar o sistema.';
  }
  if (status === 'rejeitado') {
    return 'Esta solicitação de cadastro não foi aprovada pelo administrador.';
  }
  if (status !== 'aprovado') {
    return 'Seu acesso está bloqueado. Fale com o administrador.';
  }
  return null;
}

// -----------------------------------------------------------------------------
// Login / Logout
// -----------------------------------------------------------------------------

export async function loginUser(
  identifier: string,
  password?: string,
  rememberMe: boolean = true
): Promise<LoginResult> {
  const cleanId = (identifier || '').trim();
  const cleanPass = password || '';

  if (!cleanId) {
    return { success: false, message: 'Por favor, digite seu e-mail ou nome de usuário.' };
  }
  if (!cleanPass) {
    return { success: false, message: 'Por favor, informe a senha para acessar o sistema.' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.' };
  }

  const invalidCredentials: LoginResult = { success: false, message: 'Usuário ou senha incorretos.' };

  try {
    // 1. Login por nome de usuário: o banco devolve o e-mail correspondente (nunca a senha)
    let email = cleanId.toLowerCase();
    if (!email.includes('@')) {
      const { data, error } = await client.rpc('get_login_email', { p_identifier: cleanId });
      if (error) {
        return { success: false, message: 'Não foi possível validar o usuário agora. Tente entrar com o seu e-mail.' };
      }
      if (!data) return invalidCredentials;
      email = String(data).toLowerCase();
    }

    // 2. Autenticação no Supabase Auth
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email,
      password: cleanPass,
    });

    if (authError || !authData?.user) {
      if (/email not confirmed/i.test(authError?.message || '')) {
        return { success: false, message: 'Confirme seu e-mail pelo link enviado antes de entrar.' };
      }
      if (/failed to fetch|network/i.test(authError?.message || '')) {
        return { success: false, message: 'Sem conexão com o servidor. Verifique sua internet e tente novamente.' };
      }
      return invalidCredentials;
    }

    // 3. Perfil e status de aprovação
    const profile = await fetchOwnProfile(authData.user.id);
    if (!profile) {
      await client.auth.signOut();
      return {
        success: false,
        message: 'Sua conta ainda não está vinculada a um perfil do sistema. Fale com o administrador.',
      };
    }

    const blocked = statusBlockMessage(profile.status);
    if (blocked) {
      await client.auth.signOut();
      return { success: false, message: blocked };
    }

    upsertUserInRepository(profile);
    const appUser = toAppUser(profile);
    writeSession(appUser, rememberMe);

    return { success: true, message: `Bem-vindo de volta, ${appUser.name}!`, user: appUser };
  } catch (err: any) {
    console.warn('[Auth] Falha no login:', err);
    return { success: false, message: 'Ocorreu um erro ao processar o login. Tente novamente.' };
  }
}

export function logoutUser(): void {
  clearLocalSession();
  const client = getSupabaseClient();
  if (client) {
    client.auth.signOut().catch(() => {});
  }
}

/**
 * Valida a sessão ao abrir o app: confere o token no Supabase e recarrega o perfil.
 * Retorna o usuário autenticado ou null (sessão inexistente, expirada ou bloqueada).
 * Sem internet, mantém a sessão local para permitir uso offline.
 */
export async function restoreSupabaseSession(): Promise<AppUser | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    // "Manter conectado" desmarcado: a sessão termina quando a aba/navegador é fechado
    let remember = '1';
    let tabMarker: string | null = '1';
    try {
      remember = window.localStorage.getItem(REMEMBER_KEY) || '1';
      tabMarker = window.sessionStorage.getItem(TAB_SESSION_MARKER);
    } catch {
      // armazenamento indisponível
    }
    if (remember === '0' && !tabMarker) {
      await client.auth.signOut();
      clearLocalSession();
      return null;
    }

    const { data } = await client.auth.getSession();
    const session = data?.session;
    if (!session) {
      clearLocalSession();
      return null;
    }

    let profile: UserAccount | null;
    try {
      profile = await fetchOwnProfile(session.user.id);
    } catch (err: any) {
      if (/failed to fetch|network/i.test(err?.message || '')) {
        return getCurrentSessionUser(); // offline: mantém a sessão local
      }
      throw err;
    }

    if (!profile || statusBlockMessage(profile.status)) {
      await client.auth.signOut();
      clearLocalSession();
      return null;
    }

    upsertUserInRepository(profile);
    const appUser = toAppUser(profile);
    writeSession(appUser, remember !== '0');
    return appUser;
  } catch (err) {
    console.warn('[Auth] Não foi possível validar a sessão:', err);
    return getCurrentSessionUser();
  }
}

/** Notifica quando a sessão do Supabase termina (logout em outra aba, token expirado etc.). */
export function subscribeToAuthChanges(onSignedOut: () => void): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};
  const { data } = client.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      clearLocalSession();
      onSignedOut();
    }
  });
  return () => data.subscription.unsubscribe();
}

/** Troca a senha do próprio usuário, confirmando a senha atual. */
export async function changeOwnPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, message: 'Sem conexão com o servidor.' };

  if (!newPassword || newPassword.length < 8) {
    return { success: false, message: 'A nova senha deve ter pelo menos 8 caracteres.' };
  }

  const { data } = await client.auth.getUser();
  const email = data?.user?.email;
  if (!email) return { success: false, message: 'Sua sessão expirou. Entre novamente.' };

  const { error: verifyError } = await client.auth.signInWithPassword({ email, password: currentPassword });
  if (verifyError) return { success: false, message: 'A senha atual digitada está incorreta.' };

  const { error } = await client.auth.updateUser({ password: newPassword });
  if (error) {
    if (/should be different|same/i.test(error.message)) {
      return { success: false, message: 'A nova senha precisa ser diferente da atual.' };
    }
    return { success: false, message: error.message || 'Não foi possível alterar a senha.' };
  }

  return { success: true, message: 'Senha alterada com sucesso!' };
}
