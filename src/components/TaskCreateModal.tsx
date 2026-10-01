import React, { useState, useEffect } from 'react';
import { Task, Plan, TaskStatus, Priority, SubTask } from '../types';
import { X, Plus, Trash2, CheckSquare, Calendar, Clock, Flag, Layers } from 'lucide-react';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  plans: Plan[];
  taskToEdit?: Task | null;
  defaultPlanId?: string;
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  plans,
  taskToEdit,
  defaultPlanId,
}) => {
  const [planId, setPlanId] = useState(defaultPlanId || plans[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setPlanId(taskToEdit.planId);
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate);
      setEstimatedMinutes(taskToEdit.estimatedMinutes);
      setSubtasks(taskToEdit.subtasks);
    } else {
      setPlanId(defaultPlanId || plans[0]?.id || '');
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setPriority('MEDIUM');
      const in3Days = new Date();
      in3Days.setDate(in3Days.getDate() + 3);
      setDueDate(in3Days.toISOString().split('T')[0]);
      setEstimatedMinutes(45);
      setSubtasks([]);
    }
  }, [taskToEdit, defaultPlanId, plans, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `st_${Date.now()}`, title: subtaskInput.trim(), completed: false },
    ]);
    setSubtaskInput('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !planId) return;

    const savedTask: Task = {
      id: taskToEdit?.id || `tsk_${Date.now()}`,
      planId,
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      estimatedMinutes: Number(estimatedMinutes) || 30,
      actualMinutes: taskToEdit?.actualMinutes,
      subtasks,
      completedAt: status === 'DONE' ? (taskToEdit?.completedAt || new Date().toISOString()) : undefined,
      createdAt: taskToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(savedTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#161618] border border-gray-800 shadow-2xl overflow-hidden my-8">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-indigo-400" />
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Plan Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Parent Plan *
            </label>
            <select
              id="select-task-parent-plan"
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.title} ({p.category})</option>
              ))}
            </select>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Task Title *
            </label>
            <input
              id="input-task-title"
              type="text"
              required
              placeholder="e.g. Write integration test suite"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-[#121214] border border-gray-800 text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Status
              </label>
              <select
                id="select-task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="BLOCKED">Blocked</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Priority
              </label>
              <select
                id="select-task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Due Date & Estimated Minutes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Est. Minutes
              </label>
              <input
                type="number"
                min={5}
                step={5}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Task details and instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Subtasks Checklist */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Checklist / Subtasks
            </label>
            <div className="space-y-1.5 mb-2">
              {subtasks.map((st) => (
                <div key={st.id} className="flex items-center justify-between p-2 rounded-lg bg-[#121214] border border-gray-800 text-xs">
                  <span className="text-gray-200 truncate">{st.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add subtask item..."
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-[#121214] border border-gray-800 text-white placeholder-gray-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700/60 cursor-pointer transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-gray-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-save-task"
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-gray-200 text-black shadow-md transition-colors cursor-pointer"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
