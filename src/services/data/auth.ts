import { AppUser, UserAccount } from '../../types';
import { storageAdapter } from './storageAdapter';
import { findUserByEmailOrUsername, getUserById, upsertUserInRepository, SUPERADMIN_EMAIL } from './repositories/usersRepository';
import { getDefaultPermissions, getUserPermissions } from '../../utils/permissions';
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

  // Verificar se o identificador foi informado
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

  let userAccount: UserAccount | null = null;
  const isEmail = cleanId.includes('@');
  const targetLower = cleanId.toLowerCase();

  // 1. Tentar autenticação remota via Supabase se disponível
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      // 1.1 Se for e-mail, tentar primeiro pelo Supabase Auth oficial (senhas com hash do Supabase)
      if (isEmail) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: targetLower,
            password: cleanPass,
          });

          if (!authError && authData?.user) {
            // Sucesso no Supabase Auth! Buscar perfil correspondente na tabela user_accounts
            const { data: profileRows } = await supabase
              .from('user_accounts')
              .select('*')
              .or(`id.eq.${authData.user.id},email.ilike.${targetLower}`)
              .limit(1);

            if (profileRows && profileRows.length > 0) {
              const row = profileRows[0];
              userAccount = {
                id: row.id,
                companyId: row.company_id || DEFAULT_COMPANY_ID,
                name: row.name || authData.user.user_metadata?.name || targetLower.split('@')[0],
                email: row.email || authData.user.email || targetLower,
                username: row.username || targetLower.split('@')[0],
                password: cleanPass,
                role: row.role || (targetLower === SUPERADMIN_EMAIL.toLowerCase() ? 'superadmin' : 'vendedor'),
                status: row.status || 'aprovado',
                createdAt: row.created_at || authData.user.created_at || new Date().toISOString(),
                updatedAt: row.updated_at || new Date().toISOString(),
                approvedAt: row.approved_at,
                approvedBy: row.approved_by,
                permissions: getDefaultPermissions(row.role || (targetLower === SUPERADMIN_EMAIL.toLowerCase() ? 'superadmin' : 'vendedor')),
              };
            } else {
              // Registro não encontrado na tabela user_accounts, mas autenticado com sucesso no Supabase Auth
              const isSuper = targetLower === SUPERADMIN_EMAIL.toLowerCase();
              userAccount = {
                id: authData.user.id,
                companyId: DEFAULT_COMPANY_ID,
                name: authData.user.user_metadata?.name || targetLower.split('@')[0],
                email: authData.user.email || targetLower,
                username: targetLower.split('@')[0],
                password: cleanPass,
                role: isSuper ? 'superadmin' : 'vendedor',
                status: 'aprovado',
                createdAt: authData.user.created_at || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                permissions: getDefaultPermissions(isSuper ? 'superadmin' : 'vendedor'),
              };

              // Salvar na tabela user_accounts para manter consistência
              try {
                await supabase
                  .from('user_accounts')
                  .upsert({
                    id: userAccount.id,
                    company_id: userAccount.companyId,
                    name: userAccount.name,
                    email: userAccount.email,
                    username: userAccount.username,
                    password: userAccount.password,
                    role: userAccount.role,
                    status: userAccount.status,
                    created_at: userAccount.createdAt,
                    updated_at: userAccount.updatedAt,
                  });
              } catch (upsertErr) {
                console.warn('[Auth] Não foi possível sincronizar perfil na tabela user_accounts:', upsertErr);
              }
            }

            // Atualizar repositório local com dados do Supabase
            if (userAccount) {
              upsertUserInRepository(userAccount);
            }
          }
        } catch (authErr) {
          console.warn('[Auth] Supabase Auth signInWithPassword falhou, tentando tabela user_accounts:', authErr);
        }
      }

      // 1.2 Se ainda não autenticou pelo Supabase Auth (ex: usuário em texto na tabela SQL ou login por username)
      if (!userAccount) {
        const { data: dbRows, error: dbError } = await supabase
          .from('user_accounts')
          .select('*')
          .or(`email.ilike.${targetLower},username.ilike.${targetLower}`)
          .limit(1);

        if (!dbError && dbRows && dbRows.length > 0) {
          const row = dbRows[0];
          // Verificar se a senha informada confere com a gravada na tabela
          if (row.password && row.password !== cleanPass) {
            return {
              success: false,
              message: 'Senha incorreta. Verifique a senha cadastrada no Supabase e tente novamente.',
            };
          }

          userAccount = {
            id: row.id,
            companyId: row.company_id || DEFAULT_COMPANY_ID,
            name: row.name,
            email: row.email,
            username: row.username,
            password: row.password,
            role: row.role || (row.email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase() ? 'superadmin' : 'vendedor'),
            status: row.status || 'aprovado',
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
            approvedAt: row.approved_at,
            approvedBy: row.approved_by,
            permissions: getDefaultPermissions(row.role || 'vendedor'),
          };

          // Atualizar repositório local
          upsertUserInRepository(userAccount);
        }
      }
    }
  } catch (err) {
    console.warn('[Auth] Consulta ao Supabase falhou, recorrendo ao repositório local:', err);
  }

  // 2. Fallback: Se não encontrou no Supabase ou se não houver Supabase configurado, consultar repositório local
  if (!userAccount) {
    userAccount = findUserByEmailOrUsername(cleanId);
  }

  if (!userAccount) {
    return {
      success: false,
      message: 'Usuário ou e-mail não encontrado. Verifique se o e-mail/usuário está correto ou se a conexão com o Supabase foi configurada.',
    };
  }

  // 3. Verificar senha para usuários locais / fallback
  if (userAccount.password && userAccount.password !== cleanPass) {
    return {
      success: false,
      message: 'Senha incorreta. Verifique seus dados e tente novamente.',
    };
  }

  // 4. Verificar se o cadastro está aprovado
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

  // 5. Salvar sessão de acordo com a opção de persistência
  if (rememberMe) {
    // Manter conectado neste dispositivo (LocalStorage + SessionStorage)
    storageAdapter.setItem(AUTH_SESSION_KEY, appUser);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(appUser));
      }
    } catch {}
  } else {
    // Apenas na aba atual (SessionStorage)
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
