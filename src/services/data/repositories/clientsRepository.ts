import { Client } from '../../../types';
import { storageAdapter } from '../storageAdapter';
import { generateUUID } from '../uuid';
import { getCurrentCompanyId, getCurrentUserId } from '../auth';

const CLIENTS_KEY = 'smart_vidros_clients';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    companyId: getCurrentCompanyId(),
    userId: getCurrentUserId(),
    name: 'Amaryel',
    cpfCnpj: '000.000.000-00',
    phone: '(89) 9 9991-0028',
    whatsapp: '(89) 9 9991-0028',
    email: 'amaryel@exemplo.com',
    address: 'Avenida Severo Eulálio, 100',
    city: 'Picos',
    state: 'PI',
    notes: 'Cliente preferencial da vidraçaria.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cli-2',
    companyId: getCurrentCompanyId(),
    userId: getCurrentUserId(),
    name: 'Construtora Vale do Guaribas',
    cpfCnpj: '12.345.678/0001-90',
    phone: '(89) 3422-1000',
    whatsapp: '(89) 9 8888-2222',
    email: 'contato@valedoguaribas.com.br',
    address: 'Rua Monsenhor Hipólito, 450, Centro',
    city: 'Picos',
    state: 'PI',
    notes: 'Obras comerciais e residenciais.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getClients(): Client[] {
  const data = storageAdapter.getItem<Client[]>(CLIENTS_KEY, null);
  if (!data) {
    storageAdapter.setItem(CLIENTS_KEY, INITIAL_CLIENTS);
    return INITIAL_CLIENTS;
  }
  return data;
}

export function getClientById(id: string): Client | undefined {
  return getClients().find((c) => c.id === id);
}

export function findClientByName(name: string): Client | undefined {
  if (!name || !name.trim()) return undefined;
  const target = name.trim().toLowerCase();
  return getClients().find((c) => c.name.trim().toLowerCase() === target);
}

export function createClient(
  clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
): Client {
  return saveClient(clientData);
}

export function saveClient(
  clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Client {
  const clients = getClients();
  const now = new Date().toISOString();
  const companyId = clientData.companyId || getCurrentCompanyId();
  const userId = clientData.userId || getCurrentUserId();

  if (clientData.id) {
    const index = clients.findIndex((c) => c.id === clientData.id);
    if (index !== -1) {
      const updatedClient: Client = {
        ...clients[index],
        ...clientData,
        id: clientData.id,
        companyId,
        userId,
        updatedAt: now,
      };
      clients[index] = updatedClient;
      storageAdapter.setItem(CLIENTS_KEY, clients);
      return updatedClient;
    }
  }

  // Verificar se já existe um cliente com exatamente o mesmo nome
  const existingByName = clients.find(
    (c) => c.name.trim().toLowerCase() === clientData.name.trim().toLowerCase()
  );
  if (existingByName) {
    const updatedClient: Client = {
      ...existingByName,
      ...clientData,
      id: existingByName.id,
      companyId,
      userId,
      updatedAt: now,
    };
    const index = clients.findIndex((c) => c.id === existingByName.id);
    clients[index] = updatedClient;
    storageAdapter.setItem(CLIENTS_KEY, clients);
    return updatedClient;
  }

  const newClient: Client = {
    ...clientData,
    id: generateUUID(),
    companyId,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  clients.unshift(newClient);
  storageAdapter.setItem(CLIENTS_KEY, clients);
  return newClient;
}

export function updateClient(
  id: string,
  clientData: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>
): Client | null {
  const client = getClientById(id);
  if (!client) return null;

  return saveClient({
    ...client,
    ...clientData,
    id,
  });
}

export function deleteClient(id: string): Client[] {
  const clients = getClients().filter((c) => c.id !== id);
  storageAdapter.setItem(CLIENTS_KEY, clients);
  return clients;
}
