import React, { useState, useMemo } from 'react';
import { Task, Plan, TaskStatus, Priority } from '../types';
import { Storage } from '../lib/storage';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Filter,
  Search,
  CheckSquare,
  AlertCircle,
  Flag,
  Calendar,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  MoreVertical,
  Trash2,
  Edit2,
  Layers,
  ArrowRightCircle
} from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  plans: Plan[];
  selectedPlanId?: string | null;
  onOpenCreateTask: (defaultPlanId?: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  plans,
  selectedPlanId,
  onOpenCreateTask,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
}) => {
  const [filterPlan, setFilterPlan] = useState<string>(selectedPlanId || 'ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPlanId, setQuickPlanId] = useState(plans[0]?.id || '');

  // Keep filterPlan synced if prop changes
  React.useEffect(() => {
    if (selectedPlanId) {
      setFilterPlan(selectedPlanId);
    }
  }, [selectedPlanId]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterPlan !== 'ALL' && t.planId !== filterPlan) return false;
      if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [tasks, filterPlan, filterPriority, searchQuery]);

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    const isNowDone = newStatus === 'DONE';
    if (isNowDone && task.status !== 'DONE') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }

    const updatedTask: Task = {
      ...task,
      status: newStatus,
      completedAt: isNowDone ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };
    onUpdateTask(updatedTask);

    Storage.logActivity({
      userId: plans.find(p => p.id === task.planId)?.userId || 'usr_cuid_Reki_01',
      action: isNowDone ? 'TASK_COMPLETED' : 'STATUS_CHANGED',
      description: isNowDone 
        ? `Completed task "${task.title}"`
        : `Moved task "${task.title}" to ${newStatus}`,
      entityTitle: plans.find(p => p.id === task.planId)?.title,
    });
  };

  const handleToggleSubtask = (task: Task, subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    // If all subtasks completed, suggest moving task to DONE
    const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
    const newStatus = allCompleted ? 'DONE' : task.status;

    const updatedTask: Task = {
      ...task,
      subtasks: updatedSubtasks,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    onUpdateTask(updatedTask);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const planToUse = plans.find(p => p.id === quickPlanId) || plans[0];
    if (!planToUse) return;

    const newTask: Task = {
      id: `tsk_${Date.now()}`,
      planId: planToUse.id,
      title: quickTitle.trim(),
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      estimatedMinutes: 60,
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateTask(newTask);
    setQuickTitle('');
    Storage.logActivity({
      userId: planToUse.userId,
      action: 'TASK_CREATED',
      description: `Created new task "${newTask.title}"`,
      entityTitle: planToUse.title,
    });
  };

  const columns: { status: TaskStatus; label: string; color: string; badge: string }[] = [
    { status: 'TODO', label: 'To Do', color: 'border-gray-800', badge: 'bg-gray-800 text-gray-300 border border-gray-700/60' },
    { status: 'IN_PROGRESS', label: 'In Progress', color: 'border-blue-500/30', badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
    { status: 'BLOCKED', label: 'Blocked', color: 'border-rose-500/30', badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' },
    { status: 'DONE', label: 'Completed', color: 'border-emerald-500/30', badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  ];

  const getPlanTitle = (planId: string) => {
    return plans.find((p) => p.id === planId)?.title || 'General';
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1"><Flag className="w-3 h-3 fill-current" /> Urgent</span>;
      case 'HIGH':
        return <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1"><Flag className="w-3 h-3" /> High</span>;
      case 'MEDIUM':
        return <span className="text-[11px] text-gray-400 flex items-center gap-1"><Flag className="w-3 h-3" /> Med</span>;
      default:
        return <span className="text-[11px] text-gray-500 flex items-center gap-1"><Flag className="w-3 h-3" /> Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            Task Management &amp; Execution
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700/60">
              {filteredTasks.length}
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Organize action items with Kanban status boards, priority flags, and checklists
          </p>
        </div>

        <button
          id="btn-create-task"
          onClick={() => onOpenCreateTask(filterPlan !== 'ALL' ? filterPlan : undefined)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-200 text-black font-semibold text-xs shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          Add New Task
        </button>
      </div>

      {/* Filter and Quick Add Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#161618] border border-gray-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              id="input-task-search"
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Layers className="w-3.5 h-3.5" />
              <select
                id="select-task-plan-filter"
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                aria-label="Filter tasks by plan"
                className="bg-[#121214] border border-gray-800 rounded-lg px-2 py-1 text-xs text-gray-300 max-w-[180px] truncate focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Plans ({plans.length})</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Filter className="w-3.5 h-3.5" />
              <select
                id="select-task-priority-filter"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                aria-label="Filter tasks by priority"
                className="bg-[#121214] border border-gray-800 rounded-lg px-2 py-1 text-xs text-gray-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* View Switcher */}
            <div className="flex items-center p-0.5 rounded-lg bg-[#121214] border border-gray-800">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md ${viewMode === 'kanban' ? 'bg-gray-800 text-white shadow-xs' : 'text-gray-500 hover:text-gray-300'}`}
                title="Kanban Board"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-gray-800 text-white shadow-xs' : 'text-gray-500 hover:text-gray-300'}`}
                title="List View"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Add Bar */}
        <form onSubmit={handleQuickAdd} className="flex items-center gap-2 pt-2 border-t border-gray-800">
          <input
            id="input-quick-task-title"
            type="text"
            placeholder="Quick add: Type task title and press Enter..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-[#121214] border border-gray-800 text-white placeholder-gray-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
          {plans.length > 1 && (
            <select
              value={quickPlanId}
              onChange={(e) => setQuickPlanId(e.target.value)}
              aria-label="Select target plan for quick task"
              className="bg-[#121214] border border-gray-800 rounded-lg px-2 py-1.5 text-xs text-gray-300 max-w-[140px] truncate focus:outline-hidden"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          )}
          <button
            type="submit"
            disabled={!quickTitle.trim()}
            className="px-3 py-1.5 rounded-lg bg-white disabled:opacity-40 text-black text-xs font-semibold hover:bg-gray-200 transition-colors shrink-0 cursor-pointer"
          >
            Add
          </button>
        </form>
      </div>

      {/* Main Task View: Kanban vs List */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);

            return (
              <div
                key={col.status}
                className="flex flex-col rounded-2xl bg-[#121214] border border-gray-800 p-3.5 min-h-[480px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{col.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${col.badge}`}>
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => onOpenCreateTask(filterPlan !== 'ALL' ? filterPlan : undefined)}
                    className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                    title="Add task to column"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Column Task Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-xs text-gray-500 border border-dashed border-gray-800/80 rounded-xl">
                      No tasks in {col.label}
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const completedSubtasks = task.subtasks.filter((st) => st.completed).length;

                      return (
                        <div
                          key={task.id}
                          className="group p-3.5 rounded-xl bg-[#161618] border border-gray-800 shadow-sm hover:border-gray-700 transition-all"
                        >
                          {/* Top: Plan badge & Actions */}
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-800/80 text-gray-400 border border-gray-700/40 truncate max-w-[150px]">
                              {getPlanTitle(task.planId)}
                            </span>
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                              <button
                                onClick={() => onEditTask(task)}
                                className="p-1 rounded text-gray-400 hover:text-white transition-colors cursor-pointer"
                                title="Edit task"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onDeleteTask(task.id)}
                                className="p-1 rounded text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Delete task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Task Title */}
                          <h4 className={`text-xs font-semibold ${task.status === 'DONE' ? 'line-through text-gray-500' : 'text-white'}`}>
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Subtasks checklist if present */}
                          {task.subtasks.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-gray-800 space-y-1">
                              <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                                <span>Checklist</span>
                                <span>{completedSubtasks}/{task.subtasks.length}</span>
                              </div>
                              {task.subtasks.map((st) => (
                                <div
                                  key={st.id}
                                  onClick={() => handleToggleSubtask(task, st.id)}
                                  className="flex items-center gap-1.5 text-[11px] text-gray-300 hover:text-indigo-400 cursor-pointer transition-colors"
                                >
                                  {st.completed ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                  ) : (
                                    <Circle className="w-3 h-3 text-gray-600 shrink-0" />
                                  )}
                                  <span className={`truncate ${st.completed ? 'line-through text-gray-500' : ''}`}>
                                    {st.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Footer: Priority, Due Date, Move button */}
                          <div className="mt-3 pt-2 border-t border-gray-800 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              {getPriorityIcon(task.priority)}
                              <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                                <Calendar className="w-2.5 h-2.5" />
                                {task.dueDate}
                              </span>
                            </div>

                            {/* Move status cycle button */}
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                              aria-label="Change task status"
                              className="text-[10px] font-semibold bg-[#121214] border border-gray-800 rounded-md px-1.5 py-0.5 text-gray-300 focus:outline-hidden"
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="BLOCKED">Blocked</option>
                              <option value="DONE">Done</option>
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-2xl bg-[#161618] border border-gray-800 divide-y divide-gray-800 overflow-hidden shadow-sm">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-800/40 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <button
                  onClick={() => handleStatusChange(task, task.status === 'DONE' ? 'TODO' : 'DONE')}
                  className="mt-0.5 text-gray-500 hover:text-emerald-400 transition-colors shrink-0 cursor-pointer"
                >
                  {task.status === 'DONE' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/10" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700/60">
                      {getPlanTitle(task.planId)}
                    </span>
                    {getPriorityIcon(task.priority)}
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Due {task.dueDate}
                    </span>
                  </div>
                  <h4 className={`text-xs font-semibold ${task.status === 'DONE' ? 'line-through text-gray-500' : 'text-white'}`}>
                    {task.title}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                  aria-label="Change task status"
                  className="text-xs font-semibold bg-[#121214] border border-gray-800 rounded-lg px-2.5 py-1 text-gray-300 focus:outline-hidden"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="DONE">Done</option>
                </select>

                <button
                  onClick={() => onEditTask(task)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
