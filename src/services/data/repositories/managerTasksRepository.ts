import { ManagerTask } from '../../../types';
import { storageAdapter } from '../storageAdapter';
import { generateUUID } from '../uuid';
import { getCurrentCompanyId, getCurrentUserId } from '../auth';

const TASKS_KEY = 'smart_vidros_manager_tasks';

export function getManagerTasks(): ManagerTask[] {
  const data = storageAdapter.getItem<ManagerTask[]>(TASKS_KEY, null);
  if (!data) {
    const initialTasks: ManagerTask[] = [
      {
        id: generateUUID(),
        companyId: getCurrentCompanyId(),
        userId: getCurrentUserId(),
        title: 'Conferir estoque de vidro temperado 8mm incolor',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'alta',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateUUID(),
        companyId: getCurrentCompanyId(),
        userId: getCurrentUserId(),
        title: 'Ligar para fornecedor de perfis e alumínio',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'media',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    storageAdapter.setItem(TASKS_KEY, initialTasks);
    return initialTasks;
  }
  return data;
}

export function saveManagerTask(
  taskData: Omit<ManagerTask, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): ManagerTask {
  const tasks = getManagerTasks();
  const now = new Date().toISOString();
  const companyId = taskData.companyId || getCurrentCompanyId();
  const userId = taskData.userId || getCurrentUserId();

  if (taskData.id) {
    const idx = tasks.findIndex((t) => t.id === taskData.id);
    if (idx !== -1) {
      const updated: ManagerTask = {
        ...tasks[idx],
        ...taskData,
        companyId,
        userId,
        updatedAt: now,
      };
      tasks[idx] = updated;
      storageAdapter.setItem(TASKS_KEY, tasks);
      return updated;
    }
  }

  const newTask: ManagerTask = {
    ...taskData,
    id: generateUUID(),
    companyId,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  tasks.unshift(newTask);
  storageAdapter.setItem(TASKS_KEY, tasks);
  return newTask;
}

export function toggleManagerTask(id: string): ManagerTask[] {
  const tasks = getManagerTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx !== -1) {
    tasks[idx].completed = !tasks[idx].completed;
    tasks[idx].updatedAt = new Date().toISOString();
    storageAdapter.setItem(TASKS_KEY, tasks);
  }
  return tasks;
}

export function deleteManagerTask(id: string): ManagerTask[] {
  const tasks = getManagerTasks().filter((t) => t.id !== id);
  storageAdapter.setItem(TASKS_KEY, tasks);
  return tasks;
}
