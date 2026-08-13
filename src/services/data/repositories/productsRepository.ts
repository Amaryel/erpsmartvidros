import { CatalogItem } from '../../../types';
import { storageAdapter } from '../storageAdapter';
import { generateUUID } from '../uuid';
import { getCurrentCompanyId } from '../auth';

const CATALOG_KEY = 'smart_vidros_catalog';

export const DEFAULT_CATALOG: CatalogItem[] = [
  { id: 'cat-1', companyId: getCurrentCompanyId(), type: 'dimensao', category: 'produto', unit: 'm²', name: 'Vidro 4mm Incolor', description: 'Vidro float comum 4mm', defaultPrice: 150.00, status: 'ativo' },
  { id: 'cat-2', companyId: getCurrentCompanyId(), type: 'dimensao', category: 'produto', unit: 'm²', name: 'Vidro Temperado 8mm Incolor', description: 'Vidro de segurança 8mm', defaultPrice: 280.00, status: 'ativo' },
  { id: 'cat-3', companyId: getCurrentCompanyId(), type: 'dimensao', category: 'produto', unit: 'm²', name: 'Espelho 4mm Lapidado', description: 'Espelho com acabamento lapidado', defaultPrice: 220.00, status: 'ativo' },
  { id: 'cat-4', companyId: getCurrentCompanyId(), type: 'simples', category: 'produto', unit: 'unidade', name: 'Espelho Circular 60cm', description: 'Espelho redondo com moldura / lapidado', defaultPrice: 100.00, status: 'ativo' },
  { id: 'cat-5', companyId: getCurrentCompanyId(), type: 'simples', category: 'produto', unit: 'unidade', name: 'Kit Box Banheiro Padrão', description: 'Kit de alumínio para box de banheiro', defaultPrice: 250.00, status: 'ativo' },
  { id: 'cat-6', companyId: getCurrentCompanyId(), type: 'simples', category: 'servico', unit: 'serviço', name: 'Instalação e Frete Especial', description: 'Serviço de entrega e colocação no local', defaultPrice: 150.00, status: 'ativo' },
  { id: 'cat-7', companyId: getCurrentCompanyId(), type: 'simples', category: 'servico', unit: 'serviço', name: 'Manutenção de Box de Banheiro', description: 'Ajuste de roldanas e silicone', defaultPrice: 120.00, status: 'ativo' },
];

export function getCatalog(): CatalogItem[] {
  const data = storageAdapter.getItem<CatalogItem[]>(CATALOG_KEY, null);
  if (!data) {
    storageAdapter.setItem(CATALOG_KEY, DEFAULT_CATALOG);
    return DEFAULT_CATALOG;
  }
  return data.map((i) => ({
    ...i,
    category: i.category || (i.name.toLowerCase().includes('serviço') || i.name.toLowerCase().includes('instalacao') ? 'servico' : 'produto'),
    unit: i.unit || (i.type === 'dimensao' ? 'm²' : 'unidade'),
    status: i.status || 'ativo',
    companyId: i.companyId || getCurrentCompanyId(),
  }));
}

export function getProducts(): CatalogItem[] {
  return getCatalog().filter((i) => i.category === 'produto');
}

export function getProductById(id: string): CatalogItem | undefined {
  return getCatalog().find((i) => i.id === id);
}

export function saveCatalogItem(item: Omit<CatalogItem, 'id'> & { id?: string }): CatalogItem[] {
  const catalog = getCatalog();
  const category = item.category || (item.name.toLowerCase().includes('serviço') || item.name.toLowerCase().includes('instalacao') ? 'servico' : 'produto');
  const unit = item.unit || (item.type === 'dimensao' ? 'm²' : 'unidade');
  const status = item.status || 'ativo';
  const companyId = item.companyId || getCurrentCompanyId();
  const now = new Date().toISOString();

  if (item.id) {
    const idx = catalog.findIndex((c) => c.id === item.id);
    if (idx !== -1) {
      catalog[idx] = {
        ...catalog[idx],
        ...item,
        category,
        unit,
        status,
        companyId,
        updatedAt: now,
      };
    }
  } else {
    const newItem: CatalogItem = {
      category,
      unit,
      status,
      ...item,
      id: generateUUID(),
      companyId,
      createdAt: now,
      updatedAt: now,
    };
    catalog.unshift(newItem);
  }

  storageAdapter.setItem(CATALOG_KEY, catalog);
  return catalog;
}

export function createProduct(productData: Omit<CatalogItem, 'id' | 'category'>): CatalogItem[] {
  return saveCatalogItem({ ...productData, category: 'produto' });
}

export function updateProduct(id: string, updates: Partial<CatalogItem>): CatalogItem[] {
  const existing = getProductById(id);
  if (!existing) return getCatalog();
  return saveCatalogItem({ ...existing, ...updates, id });
}

export function deleteProduct(id: string): CatalogItem[] {
  return deleteCatalogItem(id);
}

export function deleteCatalogItem(id: string): CatalogItem[] {
  const catalog = getCatalog().filter((c) => c.id !== id);
  storageAdapter.setItem(CATALOG_KEY, catalog);
  return catalog;
}
