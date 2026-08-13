import { CatalogItem } from '../../../types';
import { getCatalog, saveCatalogItem, deleteCatalogItem } from './productsRepository';
import { storageAdapter } from '../storageAdapter';

const SERVICES_LIST_KEY = 'smart_vidros_services_list';

export const DEFAULT_SERVICES: string[] = [
  'Manutenção de porta(s)',
  'Manutenção de janela(s)',
  'Manutenção de portão(ões)',
  'Instalação de box de banheiro',
  'Troca de vidro',
  'Reparo de vidro quebrado',
  'Manutenção de vidro em geral',
  'Envidraçamento de sacadas',
  'Cortinas de vidro',
  'Vidros temperados',
  'Instalação de espelho',
  'Serviços gerais de vidraçaria',
];

export function getServices(): CatalogItem[] {
  return getCatalog().filter((i) => i.category === 'servico');
}

export function getServiceById(id: string): CatalogItem | undefined {
  return getCatalog().find((i) => i.id === id && i.category === 'servico');
}

export function saveService(serviceData: Omit<CatalogItem, 'id' | 'category'> & { id?: string }): CatalogItem[] {
  return saveCatalogItem({ ...serviceData, category: 'servico' });
}

export function updateService(id: string, updates: Partial<CatalogItem>): CatalogItem[] {
  const existing = getServiceById(id);
  if (!existing) return getCatalog();
  return saveCatalogItem({ ...existing, ...updates, id, category: 'servico' });
}

export function deleteService(id: string): CatalogItem[] {
  return deleteCatalogItem(id);
}

export function getServicesList(): string[] {
  const data = storageAdapter.getItem<string[]>(SERVICES_LIST_KEY, null);
  if (!data) {
    storageAdapter.setItem(SERVICES_LIST_KEY, DEFAULT_SERVICES);
    return DEFAULT_SERVICES;
  }
  return data;
}

export function addServiceToList(newService: string): string[] {
  const list = getServicesList();
  const trimmed = newService.trim();
  if (trimmed && !list.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
    list.push(trimmed);
    storageAdapter.setItem(SERVICES_LIST_KEY, list);
  }
  return list;
}
