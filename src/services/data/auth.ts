import { AppUser, UserAccount } from '../../types';
import { storageAdapter } from './storageAdapter';
import { findUserByEmailOrUsername, SUPERADMIN_EMAIL } from './repositories/usersRepository';

const AUTH_SESSION_KEY = 'smart_vidros_auth_session';

export const DEFAULT_COMPANY_ID = 'comp-smart-vidros-001';
export const DEFAULT_USER_ID = 'usr-superadmin-001';

export function getCurrentSessionUser(): AppUser | null {
  const session = storageAdapter.getItem<AppUser>(AUTH_SESSION_KEY, null);
  return session;
}

export function getCurrentUser(): AppUser {
  const session = getCurrentSessionUser();
  if (session) return session;

  // Se não houver sessão ativa, retorna a conta default superadmin
  return {
    id: DEFAULT_USER_ID,
    email: SUPERADMIN_EMAIL,
    username: 'amaryel',
    name: 'Amaryel (Super Admin)',
    role: 'superadmin',
    status: 'aprovado',
    companyId: DEFAULT_COMPANY_ID,
  };
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
  password?: string
): { success: boolean; message: string; user?: AppUser } {
  const userAccount = findUserByEmailOrUsername(identifier);

  if (!userAccount) {
    return {
      success: false,
      message: 'Usuário ou e-mail não encontrado.',
    };
  }

  // Verificar se senha confere (se fornecida)
  if (password && userAccount.password && userAccount.password !== password) {
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
        'Sua conta está em análise aguardando liberação do Super Admin (amaryelcc@gmail.com). Assim que for aprovada, você poderá acessar o sistema.',
    };
  }

  if (userAccount.status === 'rejeitado') {
    return {
      success: false,
      message: 'Esta solicitação de cadastro não foi aprovada pelo administrador.',
    };
  }

  const appUser: AppUser = {
    id: userAccount.id,
    email: userAccount.email,
    username: userAccount.username,
    name: userAccount.name,
    role: userAccount.role,
    status: userAccount.status,
    companyId: userAccount.companyId,
  };

  storageAdapter.setItem(AUTH_SESSION_KEY, appUser);

  return {
    success: true,
    message: `Bem-vindo de volta, ${appUser.name}!`,
    user: appUser,
  };
}

export function logoutUser(): void {
  storageAdapter.removeItem(AUTH_SESSION_KEY);
}

export function setSessionUser(user: AppUser): void {
  storageAdapter.setItem(AUTH_SESSION_KEY, user);
}
