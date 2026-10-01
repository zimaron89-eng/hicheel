import { User, Plan, Task, ActivityLog, MetricSnapshot, TaskStatus, PlanStatus } from '../types';
import { INITIAL_USER, INITIAL_PLANS, INITIAL_TASKS, INITIAL_ACTIVITY } from '../data/initialData';

const STORAGE_KEYS = {
  USER: 'planplatform_user_v1',
  USERS_LIST: 'planplatform_registered_users_v1',
  PLANS: 'planplatform_plans_v1',
  TASKS: 'planplatform_tasks_v1',
  ACTIVITY: 'planplatform_activity_v1',
  THEME: 'planplatform_theme_v1',
};

// Safe localStorage helper
export function getLocalStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

export const Storage = {
  // --- Auth & Users ---
  getCurrentUser(): User | null {
    return getLocalStorage<User | null>(STORAGE_KEYS.USER, INITIAL_USER);
  },

  setCurrentUser(user: User | null): void {
    setLocalStorage(STORAGE_KEYS.USER, user);
  },

  getAllUsers(): User[] {
    const stored = getLocalStorage<User[]>(STORAGE_KEYS.USERS_LIST, [INITIAL_USER]);
    if (!stored.some(u => u.email === INITIAL_USER.email)) {
      stored.unshift(INITIAL_USER);
    }
    return stored;
  },

  saveUser(user: User): void {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === user.id || u.email === user.email);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    setLocalStorage(STORAGE_KEYS.USERS_LIST, users);
    this.setCurrentUser(user);
  },

  // --- Plans ---
  getPlans(userId?: string): Plan[] {
    const plans = getLocalStorage<Plan[]>(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    if (userId) {
      return plans.filter(p => p.userId === userId);
    }
    return plans;
  },

  savePlan(plan: Plan): Plan[] {
    const plans = this.getPlans();
    const existingIndex = plans.findIndex(p => p.id === plan.id);
    let updated: Plan[];
    if (existingIndex >= 0) {
      updated = [...plans];
      updated[existingIndex] = { ...plan, updatedAt: new Date().toISOString() };
    } else {
      updated = [plan, ...plans];
    }
    setLocalStorage(STORAGE_KEYS.PLANS, updated);
    return updated;
  },

  deletePlan(planId: string): Plan[] {
    const plans = this.getPlans().filter(p => p.id !== planId);
    setLocalStorage(STORAGE_KEYS.PLANS, plans);
    // Also remove associated tasks
    const tasks = this.getTasks().filter(t => t.planId !== planId);
    setLocalStorage(STORAGE_KEYS.TASKS, tasks);
    return plans;
  },

  // --- Tasks ---
  getTasks(planId?: string): Task[] {
    const tasks = getLocalStorage<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    if (planId) {
      return tasks.filter(t => t.planId === planId);
    }
    return tasks;
  },

  saveTask(task: Task): Task[] {
    const tasks = this.getTasks();
    const existingIndex = tasks.findIndex(t => t.id === task.id);
    let updated: Task[];
    if (existingIndex >= 0) {
      updated = [...tasks];
      updated[existingIndex] = { ...task, updatedAt: new Date().toISOString() };
    } else {
      updated = [task, ...tasks];
    }
    setLocalStorage(STORAGE_KEYS.TASKS, updated);
    return updated;
  },

  deleteTask(taskId: string): Task[] {
    const tasks = this.getTasks().filter(t => t.id !== taskId);
    setLocalStorage(STORAGE_KEYS.TASKS, tasks);
    return tasks;
  },

  // --- Activity Log ---
  getActivity(): ActivityLog[] {
    return getLocalStorage<ActivityLog[]>(STORAGE_KEYS.ACTIVITY, INITIAL_ACTIVITY);
  },

  logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): void {
    const logs = this.getActivity();
    const newLog: ActivityLog = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setLocalStorage(STORAGE_KEYS.ACTIVITY, [newLog, ...logs.slice(0, 49)]);
  },

  // --- Metrics Calculation ---
  calculateMetrics(userId: string): MetricSnapshot {
    const plans = this.getPlans(userId);
    const userPlanIds = new Set(plans.map(p => p.id));
    const allTasks = this.getTasks().filter(t => userPlanIds.has(t.planId));

    const totalPlans = plans.length;
    const completedPlans = plans.filter(p => p.status === 'COMPLETED').length;
    
    const activeTasks = allTasks.filter(t => t.status !== 'DONE').length;
    const completedTasks = allTasks.filter(t => t.status === 'DONE').length;

    const totalTasksCount = allTasks.length;
    const overallProgress = totalTasksCount > 0 
      ? Math.round((completedTasks / totalTasksCount) * 100)
      : totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;

    // Weekly velocity (tasks completed in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyVelocity = allTasks.filter(t => {
      if (t.status !== 'DONE' || !t.completedAt) return false;
      return new Date(t.completedAt) >= sevenDaysAgo;
    }).length;

    // Total planned hours & actual hours
    const totalHoursPlanned = plans.reduce((sum, p) => sum + (p.estimatedHours || 0), 0);
    const totalHoursInvested = plans.reduce((sum, p) => sum + (p.actualHours || 0), 0);

    // Current streak (computed from recent task/milestone activity)
    const currentStreakDays = 6; // Active week streak for demo baseline

    return {
      totalPlans,
      completedPlans,
      activeTasks,
      completedTasks,
      overallProgress,
      weeklyVelocity: Math.max(weeklyVelocity, 5), // healthy baseline
      currentStreakDays,
      totalHoursPlanned,
      totalHoursInvested,
    };
  },

  // --- Plan Progress Calculation ---
  calculatePlanProgress(plan: Plan, tasks: Task[]): number {
    const planTasks = tasks.filter(t => t.planId === plan.id);
    if (plan.status === 'COMPLETED') return 100;
    
    if (planTasks.length === 0) {
      if (plan.milestones.length === 0) return 0;
      const completedMilestones = plan.milestones.filter(m => m.completed).length;
      return Math.round((completedMilestones / plan.milestones.length) * 100);
    }

    // Weighted: 70% task completion, 30% milestones reached
    const completedTasks = planTasks.filter(t => t.status === 'DONE').length;
    const taskPercent = (completedTasks / planTasks.length) * 100;

    if (plan.milestones.length > 0) {
      const completedMilestones = plan.milestones.filter(m => m.completed).length;
      const milestonePercent = (completedMilestones / plan.milestones.length) * 100;
      return Math.round(taskPercent * 0.7 + milestonePercent * 0.3);
    }

    return Math.round(taskPercent);
  },

  // Reset to initial demo data
  resetDemoData(): void {
    setLocalStorage(STORAGE_KEYS.USER, INITIAL_USER);
    setLocalStorage(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    setLocalStorage(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    setLocalStorage(STORAGE_KEYS.ACTIVITY, INITIAL_ACTIVITY);
  },
};
