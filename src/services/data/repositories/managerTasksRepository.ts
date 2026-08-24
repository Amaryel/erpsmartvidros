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
  taskData: Omit<ManagerTask, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; logNote?: string; authorName?: string }
): ManagerTask {
  const tasks = getManagerTasks();
  const now = new Date().toISOString();
  const companyId = taskData.companyId || getCurrentCompanyId();
  const userId = taskData.userId || getCurrentUserId();
  const author = taskData.authorName || 'Gestor';

  if (taskData.id) {
    const idx = tasks.findIndex((t) => t.id === taskData.id);
    if (idx !== -1) {
      const currentLogs = tasks[idx].taskLogs ? [...tasks[idx].taskLogs] : [];
      if (taskData.logNote || taskData.title !== tasks[idx].title || taskData.priority !== tasks[idx].priority) {
        currentLogs.unshift({
          id: generateUUID(),
          date: now,
          authorName: author,
          action: taskData.logNote ? 'Anotação / Atualização da Tarefa' : 'Edição da Tarefa',
          notes: taskData.logNote || taskData.notes,
        });
      }

      const updated: ManagerTask = {
        ...tasks[idx],
        ...taskData,
        companyId,
        userId,
        taskLogs: currentLogs,
        updatedAt: now,
      };
      tasks[idx] = updated;
      storageAdapter.setItem(TASKS_KEY, tasks);
      return updated;
    }
  }

  const initialLogs = [
    {
      id: generateUUID(),
      date: now,
      authorName: author,
      action: 'Tarefa Criada',
      notes: taskData.notes || 'Tarefa adicionada ao painel do gestor.',
    },
  ];

  const newTask: ManagerTask = {
    ...taskData,
    id: generateUUID(),
    companyId,
    userId,
    taskLogs: initialLogs,
    createdAt: now,
    updatedAt: now,
  };

  tasks.unshift(newTask);
  storageAdapter.setItem(TASKS_KEY, tasks);
  return newTask;
}

export function toggleManagerTask(id: string, authorName?: string): ManagerTask[] {
  const tasks = getManagerTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx !== -1) {
    const newStatus = !tasks[idx].completed;
    const now = new Date().toISOString();
    const currentLogs = tasks[idx].taskLogs ? [...tasks[idx].taskLogs] : [];

    currentLogs.unshift({
      id: generateUUID(),
      date: now,
      authorName: authorName || 'Gestor',
      action: newStatus ? 'Tarefa marcada como Concluída' : 'Tarefa reaberta / Em andamento',
    });

    tasks[idx].completed = newStatus;
    tasks[idx].taskLogs = currentLogs;
    tasks[idx].updatedAt = now;
    storageAdapter.setItem(TASKS_KEY, tasks);
  }
  return tasks;
}

export function deleteManagerTask(id: string): ManagerTask[] {
  const tasks = getManagerTasks().filter((t) => t.id !== id);
  storageAdapter.setItem(TASKS_KEY, tasks);
  return tasks;
}
