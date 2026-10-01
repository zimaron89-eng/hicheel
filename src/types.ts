export type PlanCategory = 
  | 'Career'
  | 'Health'
  | 'Finance'
  | 'Learning'
  | 'Personal'
  | 'Project';

export type PlanStatus = 
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'ON_TRACK'
  | 'BEHIND'
  | 'COMPLETED'
  | 'ON_HOLD';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  createdAt: string;
  twoFactorEnabled?: boolean;
}

export interface Milestone {
  id: string;
  planId: string;
  title: string;
  targetDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  planId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  subtasks: SubTask[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: PlanCategory;
  status: PlanStatus;
  priority: Priority;
  startDate: string;
  targetDate: string;
  estimatedHours: number;
  actualHours?: number;
  color?: string;
  tags: string[];
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: 'PLAN_CREATED' | 'TASK_COMPLETED' | 'MILESTONE_REACHED' | 'STATUS_CHANGED' | 'TASK_CREATED';
  description: string;
  timestamp: string;
  entityTitle?: string;
}

export interface MetricSnapshot {
  totalPlans: number;
  completedPlans: number;
  activeTasks: number;
  completedTasks: number;
  overallProgress: number;
  weeklyVelocity: number; // tasks completed this week
  currentStreakDays: number;
  totalHoursPlanned: number;
  totalHoursInvested: number;
}
