import React, { useState } from 'react';
import { Plan, Task, Milestone, TaskStatus } from '../types';
import { Storage } from '../lib/storage';
import confetti from 'canvas-confetti';
import {
  X,
  Calendar,
  Clock,
  Flag,
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  Edit2,
  Trash2,
  Layers,
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';

interface PlanDetailModalProps {
  plan: Plan | null;
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  onEditPlan: (plan: Plan) => void;
  onDeletePlan: (planId: string) => void;
  onUpdatePlan: (plan: Plan) => void;
  onUpdateTask: (task: Task) => void;
  onOpenCreateTask: (planId: string) => void;
}

export const PlanDetailModal: React.FC<PlanDetailModalProps> = ({
  plan,
  tasks,
  isOpen,
  onClose,
  onEditPlan,
  onDeletePlan,
  onUpdatePlan,
  onUpdateTask,
  onOpenCreateTask,
}) => {
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  if (!isOpen || !plan) return null;

  const planTasks = tasks.filter((t) => t.planId === plan.id);
  const completedTasks = planTasks.filter((t) => t.status === 'DONE').length;
  const progress = Storage.calculatePlanProgress(plan, tasks);

  const handleToggleMilestone = (milestoneId: string) => {
    const updatedMilestones = plan.milestones.map((m) => {
      if (m.id === milestoneId) {
        const nextState = !m.completed;
        if (nextState) {
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        }
        return {
          ...m,
          completed: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined,
        };
      }
      return m;
    });

    const updatedPlan: Plan = {
      ...plan,
      milestones: updatedMilestones,
      updatedAt: new Date().toISOString(),
    };
    onUpdatePlan(updatedPlan);

    const toggled = updatedMilestones.find(m => m.id === milestoneId);
    if (toggled?.completed) {
      Storage.logActivity({
        userId: plan.userId,
        action: 'MILESTONE_REACHED',
        description: `Reached milestone "${toggled.title}"`,
        entityTitle: plan.title,
      });
    }
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    const newM: Milestone = {
      id: `m_${Date.now()}`,
      planId: plan.id,
      title: newMilestoneTitle.trim(),
      targetDate: newMilestoneDate || plan.targetDate,
      completed: false,
    };

    const updatedPlan: Plan = {
      ...plan,
      milestones: [...plan.milestones, newM],
      updatedAt: new Date().toISOString(),
    };
    onUpdatePlan(updatedPlan);
    setNewMilestoneTitle('');
    setNewMilestoneDate('');
  };

  const handleToggleTaskStatus = (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    if (nextStatus === 'DONE') {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    }
    const updated: Task = {
      ...task,
      status: nextStatus,
      completedAt: nextStatus === 'DONE' ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };
    onUpdateTask(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#161618] border border-gray-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {plan.category}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-gray-800 text-gray-300 border border-gray-700/60">
                {plan.status.replace('_', ' ')}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Priority: {plan.priority}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-white">
              {plan.title}
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Created {new Date(plan.createdAt).toLocaleDateString()} • Target {plan.targetDate}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onEditPlan(plan)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
              title="Edit Plan"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onDeletePlan(plan.id);
                onClose();
              }}
              className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Delete Plan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Plan Overview
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed bg-[#121214] p-4 rounded-xl border border-gray-800">
              {plan.description}
            </p>
          </div>

          {/* Progress Banner */}
          <div className="p-4 rounded-xl bg-[#121214] border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                {progress}%
              </div>
              <div>
                <h5 className="text-sm font-semibold text-white">Overall Plan Completion</h5>
                <p className="text-xs text-gray-400">
                  {completedTasks} of {planTasks.length} tasks finished • {plan.milestones.filter(m => m.completed).length} of {plan.milestones.length} milestones reached
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-300">
              <div className="text-right">
                <span className="block font-semibold text-white">{plan.actualHours || 0}h / {plan.estimatedHours}h</span>
                <span className="text-[11px] text-gray-500">Hours Invested</span>
              </div>
            </div>
          </div>

          {/* Milestones Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Strategic Milestones ({plan.milestones.length})
              </h4>
            </div>

            <div className="space-y-2 mb-3">
              {plan.milestones.length === 0 ? (
                <div className="p-3 text-xs text-gray-500 text-center border border-dashed border-gray-800 rounded-lg">
                  No milestones defined yet.
                </div>
              ) : (
                plan.milestones.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleToggleMilestone(m.id)}
                    className="p-3 rounded-xl bg-[#121214] border border-gray-800 flex items-center justify-between gap-3 cursor-pointer hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {m.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-600 shrink-0" />
                      )}
                      <span className={`text-xs font-medium ${m.completed ? 'line-through text-gray-500' : 'text-white'} truncate`}>
                        {m.title}
                      </span>
                    </div>

                    <span className="text-[11px] text-gray-500 shrink-0 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {m.targetDate}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Quick add milestone */}
            <form onSubmit={handleAddMilestone} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add milestone title..."
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-[#121214] border border-gray-800 text-white placeholder-gray-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="date"
                value={newMilestoneDate}
                onChange={(e) => setNewMilestoneDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-[#121214] border border-gray-800 text-gray-300 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!newMilestoneTitle.trim()}
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition-colors disabled:opacity-40 border border-gray-700/60 cursor-pointer"
              >
                Add Milestone
              </button>
            </form>
          </div>

          {/* Associated Tasks Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                Plan Tasks ({planTasks.length})
              </h4>

              <button
                onClick={() => onOpenCreateTask(plan.id)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>

            <div className="space-y-2">
              {planTasks.length === 0 ? (
                <div className="p-4 text-xs text-gray-500 text-center border border-dashed border-gray-800 rounded-lg">
                  No tasks added to this plan yet. Click "Add Task" to create the first one.
                </div>
              ) : (
                planTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-[#121214] border border-gray-800 flex items-center justify-between gap-3 hover:bg-gray-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => handleToggleTaskStatus(t)}
                        className="text-gray-500 hover:text-emerald-400 transition-colors shrink-0 cursor-pointer"
                      >
                        {t.status === 'DONE' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <span className={`text-xs font-medium ${t.status === 'DONE' ? 'line-through text-gray-500' : 'text-white'} truncate`}>
                        {t.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-gray-400">
                        {t.status.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {t.dueDate}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
