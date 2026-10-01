import React, { useState, useEffect } from 'react';
import { Plan, PlanCategory, PlanStatus, Priority, Milestone } from '../types';
import { X, Plus, Trash2, Calendar, Clock, Flag, Layers, Sparkles } from 'lucide-react';

interface PlanCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: Plan) => void;
  planToEdit?: Plan | null;
  userId: string;
}

export const PlanCreateModal: React.FC<PlanCreateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  planToEdit,
  userId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PlanCategory>('Project');
  const [status, setStatus] = useState<PlanStatus>('IN_PROGRESS');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number>(40);
  const [tagsInput, setTagsInput] = useState('');
  const [milestones, setMilestones] = useState<{ title: string; targetDate: string }[]>([]);
  const [newMilestoneText, setNewMilestoneText] = useState('');

  useEffect(() => {
    if (planToEdit) {
      setTitle(planToEdit.title);
      setDescription(planToEdit.description);
      setCategory(planToEdit.category);
      setStatus(planToEdit.status);
      setPriority(planToEdit.priority);
      setStartDate(planToEdit.startDate);
      setTargetDate(planToEdit.targetDate);
      setEstimatedHours(planToEdit.estimatedHours);
      setTagsInput(planToEdit.tags.join(', '));
      setMilestones(planToEdit.milestones.map(m => ({ title: m.title, targetDate: m.targetDate })));
    } else {
      setTitle('');
      setDescription('');
      setCategory('Project');
      setStatus('IN_PROGRESS');
      setPriority('MEDIUM');
      const now = new Date();
      setStartDate(now.toISOString().split('T')[0]);
      const target = new Date();
      target.setDate(target.getDate() + 30);
      setTargetDate(target.toISOString().split('T')[0]);
      setEstimatedHours(40);
      setTagsInput('');
      setMilestones([
        { title: 'Core specification & initial setup', targetDate: now.toISOString().split('T')[0] },
      ]);
    }
  }, [planToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddMilestone = () => {
    if (!newMilestoneText.trim()) return;
    setMilestones([...milestones, { title: newMilestoneText.trim(), targetDate: targetDate || startDate }]);
    setNewMilestoneText('');
  };

  const handleRemoveMilestone = (idx: number) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const generatedMilestones: Milestone[] = milestones.map((m, idx) => ({
      id: planToEdit?.milestones[idx]?.id || `m_${Date.now()}_${idx}`,
      planId: planToEdit?.id || `plan_${Date.now()}`,
      title: m.title,
      targetDate: m.targetDate || targetDate,
      completed: planToEdit?.milestones[idx]?.completed || false,
    }));

    const savedPlan: Plan = {
      id: planToEdit?.id || `plan_${Date.now()}`,
      userId,
      title: title.trim(),
      description: description.trim(),
      category,
      status,
      priority,
      startDate: startDate || new Date().toISOString().split('T')[0],
      targetDate: targetDate || new Date().toISOString().split('T')[0],
      estimatedHours: Number(estimatedHours) || 0,
      actualHours: planToEdit?.actualHours || 0,
      tags: parsedTags.length > 0 ? parsedTags : [category],
      milestones: generatedMilestones,
      createdAt: planToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(savedPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#161618] border border-gray-800 shadow-2xl overflow-hidden my-8">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              {planToEdit ? 'Edit Personal Plan' : 'Create New Personal Plan'}
            </h3>
            <p className="text-xs text-gray-400">
              Set goals, target deadlines, milestone checkpoints, and categories
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Plan Title *
            </label>
            <input
              id="input-plan-title"
              type="text"
              required
              placeholder="e.g. Master Rust Concurrency, Launch MVP, Marathon Prep"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-[#121214] border border-gray-800 text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category, Status, Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Category
              </label>
              <select
                id="select-create-plan-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as PlanCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Project">Project</option>
                <option value="Health">Health</option>
                <option value="Learning">Learning</option>
                <option value="Finance">Finance</option>
                <option value="Career">Career</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Status
              </label>
              <select
                id="select-create-plan-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as PlanStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ON_TRACK">On Track</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="BEHIND">Behind</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Priority
              </label>
              <select
                id="select-create-plan-priority"
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

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Description / Objectives
            </label>
            <textarea
              rows={3}
              placeholder="Outline the core objective, success criteria, and scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Dates & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Target Due Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Next.js, Prisma, MVP, Architecture"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white placeholder-gray-500 focus:outline-hidden"
            />
          </div>

          {/* Milestones list builder */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Strategic Milestones
            </label>
            <div className="space-y-2 mb-2">
              {milestones.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#121214] border border-gray-800 text-xs">
                  <span className="font-medium text-gray-200 truncate">{m.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500">{m.targetDate}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="text-gray-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add milestone checkpoint..."
                value={newMilestoneText}
                onChange={(e) => setNewMilestoneText(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-[#121214] border border-gray-800 text-white placeholder-gray-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddMilestone}
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
              id="btn-save-plan"
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-gray-200 text-black shadow-md transition-colors cursor-pointer"
            >
              {planToEdit ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
