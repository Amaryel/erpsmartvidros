import { AppUser, UserAccount } from '../../types';
import { storageAdapter } from './storageAdapter';
import { findUserByEmailOrUsername, getUserById, upsertUserInRepository, SUPERADMIN_EMAIL } from './repositories/usersRepository';
import { getUserPermissions } from '../../utils/permissions';
import { getSupabaseClient } from '../../lib/supabase';

const AUTH_SESSION_KEY = 'smart_vidros_auth_session';

export const DEFAULT_COMPANY_ID = 'comp-smart-vidros-001';
export const DEFAULT_USER_ID = 'usr-superadmin-001';

export function getCurrentSessionUser(): AppUser | null {
  let sessionUser: AppUser | null = null;

  // 1. Verificar primeiro a sessão da aba atual (sessionStorage)
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const sessionData = window.sessionStorage.getItem(AUTH_SESSION_KEY);
      if (sessionData) {
        sessionUser = JSON.parse(sessionData);
      }
    }
  } catch (err) {
    console.error('Erro ao ler sessionStorage:', err);
  }

  // 2. Se não estiver no sessionStorage, verificar se o usuário optou por "Manter conectado" (localStorage)
  if (!sessionUser) {
    sessionUser = storageAdapter.getItem<AppUser>(AUTH_SESSION_KEY, null);
  }

  if (sessionUser) {
    // Sincronizar permissões e cargo atualizados do banco/repositório
    const liveAccount = getUserById(sessionUser.id) || findUserByEmailOrUsername(sessionUser.email);
    if (liveAccount) {
      sessionUser = {
        ...sessionUser,
        name: liveAccount.name,
        role: liveAccount.role,
        status: liveAccount.status,
        permissions: getUserPermissions(liveAccount),
      };
    } else {
      sessionUser.permissions = getUserPermissions(sessionUser);
    }
  }

  return sessionUser;
}

export function getCurrentUser(): AppUser | null {
  return getCurrentSessionUser();
}

export function getCurrentCompanyId(): string {
  const user = getCurrentSessionUser();
  return user?.companyId || DEFAULT_COMPANY_ID;
}

export function getCurrentUserId(): string {
  const user = getCurrentSessionUser();
  return user?.id || DEFAULT_USER_ID;
}

export function isSuperAdmin(user?: AppUser | UserAccount | null): boolean {
  if (!user) return false;
  return (
    user.role === 'superadmin' ||
    user.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()
  );
}

export async function loginUser(
  identifier: string,
  password?: string,
  rememberMe: boolean = true
): Promise<{ success: boolean; message: string; user?: AppUser }> {
  const cleanId = (identifier || '').trim();
  const cleanPass = (password || '').trim();

  // Verificar se o usuário foi informado
  if (!cleanId) {
    return {
      success: false,
      message: 'Por favor, digite seu e-mail ou nome de usuário.',
    };
  }

  // Verificar se a senha foi informada
  if (!cleanPass) {
    return {
      success: false,
      message: 'Por favor, informe a senha para acessar o sistema.',
    };
  }

  // 1. Procurar no repositório local
  let userAccount = findUserByEmailOrUsername(cleanId);

  // 2. Se Supabase estiver conectado, buscar em tempo real na tabela user_accounts
  // Isso garante que logins criados em outras máquinas/redes ou no painel do Supabase funcionem em qualquer lugar (ex: Vercel)
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const target = cleanId.toLowerCase();
      const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .or(`email.ilike.${target},username.ilike.${target}`)
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0];
        const remoteUser: UserAccount = {
          id: row.id,
          companyId: row.company_id || 'comp-smart-vidros-001',
          name: row.name,
          email: row.email,
          username: row.username,
          password: row.password,
          role: row.role || 'vendedor',
          status: row.status || 'aprovado',
          createdAt: row.created_at || new Date().toISOString(),
          updatedAt: row.updated_at || new Date().toISOString(),
          approvedAt: row.approved_at,
          approvedBy: row.approved_by,
          permissions: getUserPermissions({ role: row.role }),
        };

        // Atualizar repositório local com os dados vindos do Supabase
        upsertUserInRepository(remoteUser);
        userAccount = remoteUser;
      }
    }
  } catch (err) {
    console.warn('[Auth] Não foi possível consultar Supabase durante login, usando cache local:', err);
  }

  if (!userAccount) {
    return {
      success: false,
      message: 'Usuário ou e-mail não encontrado. Verifique os dados digitados.',
    };
  }

  // Verificar se a senha confere
  if (userAccount.password && userAccount.password !== cleanPass) {
    return {
      success: false,
      message: 'Senha incorreta. Verifique seus dados e tente novamente.',
    };
  }

  // Verificar se o cadastro está aprovado
  if (userAccount.status === 'pendente') {
    return {
      success: false,
      message:
        'Sua conta está em análise aguardando liberação do Administrador. Assim que for aprovada, você poderá acessar o sistema.',
    };
  }

  if (userAccount.status === 'rejeitado') {
    return {
      success: false,
      message: 'Esta solicitação de cadastro não foi aprovada pelo administrador.',
    };
  }

  const permissions = getUserPermissions(userAccount);

  const appUser: AppUser = {
    id: userAccount.id,
    email: userAccount.email,
    username: userAccount.username,
    name: userAccount.name,
    role: userAccount.role,
    status: userAccount.status,
    companyId: userAccount.companyId,
    permissions,
  };

  // Salvar sessão de acordo com a opção de persistência
  if (rememberMe) {
    // Manter conectado neste dispositivo (Persistir no LocalStorage + SessionStorage)
    storageAdapter.setItem(AUTH_SESSION_KEY, appUser);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(appUser));
      }
    } catch {}
  } else {
    // Apenas nesta sessão da aba (SessionStorage)
    storageAdapter.removeItem(AUTH_SESSION_KEY);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(appUser));
      }
    } catch {}
  }

  return {
    success: true,
    message: `Bem-vindo de volta, ${appUser.name}!`,
    user: appUser,
  };
}

export function logoutUser(): void {
  storageAdapter.removeItem(AUTH_SESSION_KEY);
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(AUTH_SESSION_KEY);
    }
  } catch {}
}

export function setSessionUser(user: AppUser, rememberMe: boolean = true): void {
  if (rememberMe) {
    storageAdapter.setItem(AUTH_SESSION_KEY, user);
  }
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
    }
  } catch {}
}
