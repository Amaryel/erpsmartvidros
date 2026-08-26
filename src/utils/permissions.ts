import { AppUser, UserAccount, UserRole, SystemModuleId, UserPermissions } from '../types';
import { SUPERADMIN_EMAIL } from '../services/data/repositories/usersRepository';

export { SUPERADMIN_EMAIL };

export interface ModuleDefinition {
  id: SystemModuleId;
  label: string;
  shortLabel: string;
  category: 'Geral' | 'Comercial' | 'Financeiro' | 'Catálogo' | 'Sistema';
  description: string;
  iconName: string;
}

export const ALL_SYSTEM_MODULES: ModuleDefinition[] = [
  {
    id: 'dashboard',
    label: 'Início / Dashboard',
    shortLabel: 'Início',
    category: 'Geral',
    description: 'Resumo geral, métricas de vendas, gráficos e avisos do dia',
    iconName: 'LayoutDashboard',
  },
  {
    id: 'operations',
    label: 'Obras & Operações',
    shortLabel: 'Obras',
    category: 'Geral',
    description: 'Acompanhamento de prazos, produção e tickets de instalação',
    iconName: 'Briefcase',
  },
  {
    id: 'quotes',
    label: 'Orçamentos',
    shortLabel: 'Orçamentos',
    category: 'Comercial',
    description: 'Elaboração e cálculo detalhado de orçamentos com PDF e WhatsApp',
    iconName: 'FileText',
  },
  {
    id: 'sales',
    label: 'Vendas & PDV',
    shortLabel: 'Vendas',
    category: 'Comercial',
    description: 'Ponto de venda com emissão de vendas rápidas e parcelamentos',
    iconName: 'ShoppingBag',
  },
  {
    id: 'contracts',
    label: 'Contratos',
    shortLabel: 'Contratos',
    category: 'Comercial',
    description: 'Emissão e impressão de contratos de prestação de serviços com valor por extenso',
    iconName: 'Scroll',
  },
  {
    id: 'clients',
    label: 'Clientes',
    shortLabel: 'Clientes',
    category: 'Comercial',
    description: 'Cadastro de clientes, histórico de orçamentos e vendas',
    iconName: 'Users',
  },
  {
    id: 'cash',
    label: 'Caixa Diário',
    shortLabel: 'Caixa',
    category: 'Financeiro',
    description: 'Abertura, fechamento, sangrias, suprimentos e controle de saldo diário',
    iconName: 'Wallet',
  },
  {
    id: 'receivables',
    label: 'Contas a Receber (Fiado)',
    shortLabel: 'A Receber',
    category: 'Financeiro',
    description: 'Controle de parcelas em aberto, vencimentos e baixa de pagamentos',
    iconName: 'ShieldCheck',
  },
  {
    id: 'receipts',
    label: 'Recibos',
    shortLabel: 'Recibos',
    category: 'Financeiro',
    description: 'Emissão e histórico de recibos de pagamento',
    iconName: 'ReceiptText',
  },
  {
    id: 'reports',
    label: 'Relatórios de Vendas & Faturamento',
    shortLabel: 'Relatórios',
    category: 'Financeiro',
    description: 'Relatórios gerenciais de vendas, faturamento, ticket médio e lucratividade com filtros por período e vendedor',
    iconName: 'BarChart3',
  },
  {
    id: 'products',
    label: 'Produtos & Vidros',
    shortLabel: 'Produtos',
    category: 'Catálogo',
    description: 'Catálogo de vidros temperados, esquadrias, espelhos e fotos',
    iconName: 'Package',
  },
  {
    id: 'services',
    label: 'Serviços & Mão de Obra',
    shortLabel: 'Serviços',
    category: 'Catálogo',
    description: 'Tabela de preços de instalação, manutenção e consultoria',
    iconName: 'Wrench',
  },
  {
    id: 'company',
    label: 'Dados da Empresa',
    shortLabel: 'Empresa',
    category: 'Sistema',
    description: 'Razão social, CNPJ, telefone, logotipo e dados de cabeçalho',
    iconName: 'Building2',
  },
];

/**
 * Retorna as permissões padrão recomendadas para cada perfil/nível de usuário
 */
export function getDefaultPermissions(role: UserRole): UserPermissions {
  switch (role) {
    case 'superadmin':
      return {
        allowedModules: [
          'dashboard',
          'operations',
          'quotes',
          'sales',
          'cash',
          'contracts',
          'receivables',
          'receipts',
          'reports',
          'clients',
          'products',
          'services',
          'company',
          'users',
        ],
        maxDiscountPercent: 100,
        canGiveDiscount: true,
        canSettleReceivables: true,
        canCancelSales: true,
        canManageUsers: true,
        canAccessSensitiveSettings: true,
      };

    case 'admin':
      return {
        allowedModules: [
          'dashboard',
          'operations',
          'quotes',
          'sales',
          'cash',
          'contracts',
          'receivables',
          'receipts',
          'reports',
          'clients',
          'products',
          'services',
          'company',
          'users',
        ],
        maxDiscountPercent: 100,
        canGiveDiscount: true,
        canSettleReceivables: true,
        canCancelSales: true,
        canManageUsers: true,
        canAccessSensitiveSettings: false, // Admin não mexe em credenciais sensíveis/Supabase
      };

    case 'vendedor':
      return {
        allowedModules: [
          'dashboard',
          'quotes',
          'sales',
          'contracts',
          'clients',
          'receivables',
          'receipts',
          'reports',
          'products',
          'services',
        ],
        maxDiscountPercent: 10, // Padrão 10% configurável pelo admin/superadmin
        canGiveDiscount: true,
        canSettleReceivables: true,
        canCancelSales: false,
        canManageUsers: false,
        canAccessSensitiveSettings: false,
      };

    case 'funcionario':
    case 'operador':
    default:
      return {
        allowedModules: [
          'dashboard',
          'operations',
          'products',
          'services',
          'clients',
        ],
        maxDiscountPercent: 0,
        canGiveDiscount: false,
        canSettleReceivables: false,
        canCancelSales: false,
        canManageUsers: false,
        canAccessSensitiveSettings: false,
      };
  }
}

/**
 * Normaliza e obtém as permissões ativas de um usuário (garantindo retrocompatibilidade)
 */
export function getUserPermissions(user?: AppUser | UserAccount | null): UserPermissions {
  if (!user) {
    return getDefaultPermissions('operador');
  }

  // Super Admin supremo (por e-mail fixo) sempre tem todas as permissões
  if (user.email && user.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()) {
    return getDefaultPermissions('superadmin');
  }

  const role = user.role || 'operador';
  const defaultPerms = getDefaultPermissions(role);

  if (!user.permissions) {
    return defaultPerms;
  }

  return {
    ...defaultPerms,
    ...user.permissions,
    allowedModules:
      user.permissions.allowedModules && user.permissions.allowedModules.length > 0
        ? user.permissions.allowedModules
        : defaultPerms.allowedModules,
    maxDiscountPercent:
      typeof user.permissions.maxDiscountPercent === 'number'
        ? user.permissions.maxDiscountPercent
        : defaultPerms.maxDiscountPercent,
  };
}

/**
 * Verifica se um usuário possui acesso a um determinado módulo
 */
export function hasModuleAccess(
  user: AppUser | UserAccount | null | undefined,
  moduleId: SystemModuleId | string
): boolean {
  // Se não estiver logado, não tem acesso (ou se for dashboard permite visão básica)
  if (!user) return true;

  // Super Admin por e-mail ou role tem acesso irrestrito
  if (user.role === 'superadmin' || (user.email && user.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase())) {
    return true;
  }

  // Módulo de Usuários: Apenas SuperAdmin e Admin
  if (moduleId === 'users' || moduleId === 'superadmin') {
    return user.role === 'admin' || user.permissions?.canManageUsers === true;
  }

  // Mapeamentos de abas secundárias
  let effectiveModule = moduleId;
  if (moduleId === 'new_quote') effectiveModule = 'quotes';
  if (moduleId === 'new_receipt') effectiveModule = 'receipts';
  if (moduleId === 'catalog') effectiveModule = 'products';

  const perms = getUserPermissions(user);
  return perms.allowedModules.includes(effectiveModule as SystemModuleId);
}

/**
 * Validação de hierarquia para gerenciamento de usuários:
 * - Superadmin pode alterar qualquer parâmetro do Admin, Vendedor e Funcionário.
 * - Admin pode cadastrar e editar Vendedor e Funcionário (e suas permissões/descontos), mas NÃO pode alterar Superadmin.
 * - Vendedor / Funcionário não podem gerenciar usuários.
 */
export function canActorManageTarget(
  actor: AppUser | UserAccount | null | undefined,
  target: UserAccount | AppUser | { role: UserRole; email?: string }
): boolean {
  if (!actor) return false;

  const isActorSuper =
    actor.role === 'superadmin' || (actor.email && actor.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase());

  // Superadmin pode gerenciar qualquer um
  if (isActorSuper) return true;

  // Se o alvo for Superadmin, apenas Superadmin pode alterar
  const isTargetSuper =
    target.role === 'superadmin' || (target.email && target.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase());
  if (isTargetSuper) return false;

  // Admin pode gerenciar Vendedor, Funcionário e Operador (e a si próprio se for seu perfil)
  if (actor.role === 'admin') {
    return target.role !== 'superadmin';
  }

  return false;
}

/**
 * Verifica se o usuário pode acessar configurações sensíveis do sistema (ex: chaves Supabase)
 */
export function canAccessSensitiveSettings(user: AppUser | UserAccount | null | undefined): boolean {
  if (!user) return false;
  return (
    user.role === 'superadmin' ||
    (user.email && user.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase())
  );
}

/**
 * Valida se um valor de desconto aplicado está dentro do limite configurado para o usuário
 */
export function validateUserDiscount(
  user: AppUser | UserAccount | null | undefined,
  subtotal: number,
  discountAmount: number
): {
  valid: boolean;
  maxAllowedPercent: number;
  maxAllowedAmount: number;
  appliedPercent: number;
  errorMessage?: string;
} {
  const perms = getUserPermissions(user);
  const maxPercent = typeof perms.maxDiscountPercent === 'number' ? perms.maxDiscountPercent : 100;
  
  if (subtotal <= 0) {
    return {
      valid: true,
      maxAllowedPercent: maxPercent,
      maxAllowedAmount: 0,
      appliedPercent: 0,
    };
  }

  const maxAllowedAmount = (subtotal * maxPercent) / 100;
  const appliedPercent = (discountAmount / subtotal) * 100;

  // Arredondamento com tolerância de 2 casas decimais (1 centavo)
  if (discountAmount > maxAllowedAmount + 0.01) {
    return {
      valid: false,
      maxAllowedPercent: maxPercent,
      maxAllowedAmount,
      appliedPercent,
      errorMessage: `O desconto de ${appliedPercent.toFixed(1)}% (R$ ${discountAmount.toFixed(2)}) ultrapassa o limite máximo permitido de ${maxPercent}% (R$ ${maxAllowedAmount.toFixed(2)}) para seu perfil de vendedor. Solicite autorização a um Administrador ou ajuste o valor.`,
    };
  }

  return {
    valid: true,
    maxAllowedPercent: maxPercent,
    maxAllowedAmount,
    appliedPercent,
  };
}
