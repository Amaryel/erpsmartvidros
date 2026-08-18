import { CompanyInfo } from '../../../types';
import { storageAdapter } from '../storageAdapter';
import smartVidrosLogoImg from '../../../assets/images/smart_vidros_logo_1786536378370.jpg';
import { getCurrentCompanyId } from '../auth';
import { autoSyncEntityChange } from '../supabaseSync';

const COMPANY_KEY = 'smart_vidros_company';

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  id: getCurrentCompanyId(),
  companyId: getCurrentCompanyId(),
  name: 'Smart Vidros',
  ownerName: 'James Clayton do Nascimento',
  cnpj: '51.840.669/0001-22',
  phone: '(89) 9 9991-0028',
  email: 'contato.smartvidros@gmail.com',
  address: 'Rua Projetada – Sussuapara-PI',
  city: 'Picos – PI',
  logoUrl: smartVidrosLogoImg,
};

export function getCompanyInfo(): CompanyInfo {
  const data = storageAdapter.getItem<CompanyInfo>(COMPANY_KEY, null);
  if (!data) return DEFAULT_COMPANY_INFO;
  return {
    ...DEFAULT_COMPANY_INFO,
    ...data,
    logoUrl: data.logoUrl || DEFAULT_COMPANY_INFO.logoUrl,
  };
}

export function saveCompanyInfo(info: CompanyInfo): void {
  const now = new Date().toISOString();
  const updatedInfo: CompanyInfo = {
    ...DEFAULT_COMPANY_INFO,
    ...info,
    updatedAt: now,
  };
  storageAdapter.setItem(COMPANY_KEY, updatedInfo);
  autoSyncEntityChange('companies', 'upsert', updatedInfo);
}
