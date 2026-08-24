import { CatalogItem } from '../../../types';
import { storageAdapter } from '../storageAdapter';
import { generateUUID } from '../uuid';
import { getCurrentCompanyId } from '../auth';
import { autoSyncEntityChange } from '../supabaseSync';

const CATALOG_KEY = 'smart_vidros_catalog';

export function getSmartProductImage(name: string, description?: string): string {
  const text = `${name} ${description || ''}`.toLowerCase();
  
  if (text.includes('box') && (text.includes('banheiro') || text.includes('padrao') || text.includes('kit'))) {
    return 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=600&q=80';
  }
  if (text.includes('box') || text.includes('frontal') || text.includes('f1+m1') || text.includes('correr')) {
    return 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=600&q=80';
  }
  if (text.includes('espelho') && (text.includes('redondo') || text.includes('circular') || text.includes('60cm') || text.includes('moldura'))) {
    return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80';
  }
  if (text.includes('espelho')) {
    return 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80';
  }
  if (text.includes('temperado') || text.includes('seguranca') || text.includes('segurança') || text.includes('8mm') || text.includes('10mm')) {
    return 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80';
  }
  if (text.includes('janela') || text.includes('folhas') || text.includes('esquadria')) {
    return 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?auto=format&fit=crop&w=600&q=80';
  }
  if (text.includes('porta') || text.includes('pivotante')) {
    return 'https://images.unsplash.com/photo-1533779283484-8da497b17369?auto=format&fit=crop&w=600&q=80';
  }
  if (text.includes('guarda') || text.includes('sacada') || text.includes('varanda')) {
    return 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80';
  }
  if (text.includes('tampo') || text.includes('mesa')) {
    return 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=600&q=80';
  }
  if (text.includes('silicone') || text.includes('pu') || text.includes('cola') || text.includes('vedacao') || text.includes('vedação')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
  }
  if (text.includes('fechadura') || text.includes('puxador') || text.includes('ferragem') || text.includes('roldana')) {
    return 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80';
  }
  if (text.includes('aluminio') || text.includes('alumínio') || text.includes('perfil') || text.includes('barra')) {
    return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80';
  }
  if (text.includes('instalacao') || text.includes('instalação') || text.includes('frete') || text.includes('serviço') || text.includes('montagem')) {
    return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80';
  }
  if (text.includes('manutencao') || text.includes('manutenção') || text.includes('reparo') || text.includes('ajuste')) {
    return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';
  }
  return 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80';
}

export const DEFAULT_CATALOG: CatalogItem[] = [
  {
    id: 'cat-1',
    companyId: getCurrentCompanyId(),
    type: 'dimensao',
    category: 'produto',
    unit: 'm²',
    name: 'Vidro 4mm Incolor',
    description: 'Vidro float comum 4mm plano cristalino',
    defaultPrice: 150.0,
    status: 'ativo',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-2',
    companyId: getCurrentCompanyId(),
    type: 'dimensao',
    category: 'produto',
    unit: 'm²',
    name: 'Vidro Temperado 8mm Incolor',
    description: 'Vidro de alta segurança 8mm lapidado com têmpera certificada',
    defaultPrice: 280.0,
    status: 'ativo',
    imageUrl: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-3',
    companyId: getCurrentCompanyId(),
    type: 'dimensao',
    category: 'produto',
    unit: 'm²',
    name: 'Espelho 4mm Lapidado',
    description: 'Espelho cristal de primeira linha com acabamento lapidado',
    defaultPrice: 220.0,
    status: 'ativo',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-4',
    companyId: getCurrentCompanyId(),
    type: 'simples',
    category: 'produto',
    unit: 'unidade',
    name: 'Espelho Circular 60cm',
    description: 'Espelho redondo decorativo moderno com acabamento refinado',
    defaultPrice: 100.0,
    status: 'ativo',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-5',
    companyId: getCurrentCompanyId(),
    type: 'simples',
    category: 'produto',
    unit: 'unidade',
    name: 'Kit Box Banheiro Padrão',
    description: 'Kit completo de alumínio e acessórios para box de banheiro',
    defaultPrice: 250.0,
    status: 'ativo',
    imageUrl: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-8',
    companyId: getCurrentCompanyId(),
    type: 'dimensao',
    category: 'produto',
    unit: 'm²',
    name: 'Box de Vidro Temperado 8mm F1+M1',
    description: 'Box frontal padrão com 1 folha fixa e 1 folha móvel de correr',
    defaultPrice: 320.0,
    status: 'ativo',
    imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-9',
    companyId: getCurrentCompanyId(),
    type: 'dimensao',
    category: 'produto',
    unit: 'm²',
    name: 'Janela 4 Folhas Vidro Temperado 8mm',
    description: 'Janela de correr com 2 fixos e 2 móveis com perfis de alumínio',
    defaultPrice: 350.0,
    status: 'ativo',
    imageUrl: 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-10',
    companyId: getCurrentCompanyId(),
    type: 'dimensao',
    category: 'produto',
    unit: 'm²',
    name: 'Porta de Vidro Temperado 10mm',
    description: 'Porta de correr ou pivotante em vidro temperado 10mm',
    defaultPrice: 420.0,
    status: 'ativo',
    imageUrl: 'https://images.unsplash.com/photo-1533779283484-8da497b17369?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-11',
    companyId: getCurrentCompanyId(),
    type: 'dimensao',
    category: 'produto',
    unit: 'm²',
    name: 'Guarda-Corpo Vidro Laminado/Temperado',
    description: 'Guarda-corpo panorâmico de alta resistência e segurança',
    defaultPrice: 480.0,
    status: 'ativo',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-6',
    companyId: getCurrentCompanyId(),
    type: 'simples',
    category: 'servico',
    unit: 'serviço',
    name: 'Instalação e Frete Especial',
    description: 'Serviço de entrega e colocação técnica com medição no local',
    defaultPrice: 150.0,
    status: 'ativo',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-7',
    companyId: getCurrentCompanyId(),
    type: 'simples',
    category: 'servico',
    unit: 'serviço',
    name: 'Manutenção de Box de Banheiro',
    description: 'Ajuste de roldanas, trava de segurança e calafetação com silicone',
    defaultPrice: 120.0,
    status: 'ativo',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
  },
];

export function getCatalog(): CatalogItem[] {
  const data = storageAdapter.getItem<CatalogItem[]>(CATALOG_KEY, null);
  if (!data) {
    storageAdapter.setItem(CATALOG_KEY, DEFAULT_CATALOG);
    return DEFAULT_CATALOG;
  }

  let updated = false;
  const processed = data.map((i) => {
    const category = i.category || (i.name.toLowerCase().includes('serviço') || i.name.toLowerCase().includes('instalacao') ? 'servico' : 'produto');
    const unit = i.unit || (i.type === 'dimensao' ? 'm²' : 'unidade');
    const status = i.status || 'ativo';
    const companyId = i.companyId || getCurrentCompanyId();
    // Se o item não tem imagem, atribui imagem real inteligente com base no nome/descrição
    let imageUrl = i.imageUrl;
    if (!imageUrl) {
      imageUrl = getSmartProductImage(i.name, i.description);
      updated = true;
    }

    return {
      ...i,
      category,
      unit,
      status,
      companyId,
      imageUrl,
    };
  });

  // Também verificar se faltam itens novos do DEFAULT_CATALOG
  DEFAULT_CATALOG.forEach((def) => {
    const exists = processed.some((c) => c.id === def.id || c.name.toLowerCase() === def.name.toLowerCase());
    if (!exists) {
      processed.push(def);
      updated = true;
    }
  });

  if (updated) {
    storageAdapter.setItem(CATALOG_KEY, processed);
  }

  return processed;
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

  let savedItem: CatalogItem | null = null;

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
      savedItem = catalog[idx];
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
    savedItem = newItem;
  }

  storageAdapter.setItem(CATALOG_KEY, catalog);
  if (savedItem) {
    autoSyncEntityChange('catalog', 'upsert', savedItem);
  }
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
  autoSyncEntityChange('catalog', 'delete', id);
  return catalog;
}
