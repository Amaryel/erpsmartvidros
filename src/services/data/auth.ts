import { AppUser, UserAccount } from '../../types';
import { storageAdapter } from './storageAdapter';
import { findUserByEmailOrUsername, getUserById, SUPERADMIN_EMAIL } from './repositories/usersRepository';
import { getUserPermissions } from '../../utils/permissions';

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

export function loginUser(
  identifier: string,
  password?: string,
  rememberMe: boolean = true
): { success: boolean; message: string; user?: AppUser } {
  const userAccount = findUserByEmailOrUsername(identifier);

  if (!userAccount) {
    return {
      success: false,
      message: 'Usuário ou e-mail não encontrado.',
    };
  }

  // Verificar se a senha foi informada
  if (!password || !password.trim()) {
    return {
      success: false,
      message: 'Por favor, informe a senha para acessar o sistema.',
    };
  }

  // Verificar se a senha confere
  if (userAccount.password && userAccount.password !== password) {
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
    // Manter conectado neste dispositivo (Persistir no LocalStorage)
    storageAdapter.setItem(AUTH_SESSION_KEY, appUser);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(appUser));
      }
    } catch {}
  } else {
    // Apenas nesta sessão do navegador (sessionStorage)
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
