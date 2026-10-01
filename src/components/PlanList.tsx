import React, { useState, useMemo } from 'react';
import { Plan, Task, PlanCategory, PlanStatus, Priority } from '../types';
import { Storage } from '../lib/storage';
import confetti from 'canvas-confetti';
import {
  Search,
  Plus,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  Flag,
  MoreVertical,
  LayoutGrid,
  List as ListIcon,
  Sparkles,
  Layers,
  ArrowUpDown,
  Trash2,
  Edit2
} from 'lucide-react';

interface PlanListProps {
  plans: Plan[];
  tasks: Task[];
  onSelectPlan: (plan: Plan) => void;
  onOpenCreatePlan: () => void;
  onEditPlan: (plan: Plan) => void;
  onDeletePlan: (planId: string) => void;
  onUpdatePlan: (updatedPlan: Plan) => void;
}

export const PlanList: React.FC<PlanListProps> = ({
  plans,
  tasks,
  onSelectPlan,
  onOpenCreatePlan,
  onEditPlan,
  onDeletePlan,
  onUpdatePlan,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'UPDATED' | 'PROGRESS' | 'DUE_DATE' | 'PRIORITY'>('UPDATED');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeMenuPlanId, setActiveMenuPlanId] = useState<string | null>(null);

  const categories: (PlanCategory | 'ALL')[] = ['ALL', 'Project', 'Health', 'Learning', 'Finance', 'Career', 'Personal'];
  const statuses: { label: string; value: PlanStatus | 'ALL' }[] = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'On Track', value: 'ON_TRACK' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Behind', value: 'BEHIND' },
    { label: 'On Hold', value: 'ON_HOLD' },
  ];

  const filteredPlans = useMemo(() => {
    return plans
      .filter((plan) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = plan.title.toLowerCase().includes(q);
          const matchDesc = plan.description.toLowerCase().includes(q);
          const matchTag = plan.tags.some(t => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchTag) return false;
        }

        // Category
        if (selectedCategory !== 'ALL' && plan.category !== selectedCategory) {
          return false;
        }

        // Status
        if (selectedStatus !== 'ALL' && plan.status !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'PROGRESS') {
          const progA = Storage.calculatePlanProgress(a, tasks);
          const progB = Storage.calculatePlanProgress(b, tasks);
          return progB - progA;
        }
        if (sortBy === 'DUE_DATE') {
          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        }
        if (sortBy === 'PRIORITY') {
          const priorityWeights: Record<Priority, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          return priorityWeights[b.priority] - priorityWeights[a.priority];
        }
        // Recently updated
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [plans, tasks, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const handleToggleComplete = (e: React.MouseEvent, plan: Plan) => {
    e.stopPropagation();
    const isCompleted = plan.status === 'COMPLETED';
    const newStatus: PlanStatus = isCompleted ? 'IN_PROGRESS' : 'COMPLETED';
    
    if (!isCompleted) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    const updated: Plan = {
      ...plan,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    onUpdatePlan(updated);
    Storage.logActivity({
      userId: plan.userId,
      action: 'STATUS_CHANGED',
      description: `Marked plan "${plan.title}" as ${newStatus}`,
      entityTitle: plan.title,
    });
  };

  const getCategoryColor = (cat: PlanCategory) => {
    switch (cat) {
      case 'Project':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Health':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Learning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Finance':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Career':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  const getStatusBadge = (status: PlanStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Completed</span>;
      case 'ON_TRACK':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">On Track</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">In Progress</span>;
      case 'BEHIND':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">Behind</span>;
      case 'ON_HOLD':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-gray-800 text-gray-400 border border-gray-700">On Hold</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-gray-800 text-gray-400 border border-gray-700">Not Started</span>;
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="flex items-center gap-1 text-xs font-semibold text-rose-400"><Flag className="w-3 h-3 fill-current" /> Urgent</span>;
      case 'HIGH':
        return <span className="flex items-center gap-1 text-xs font-semibold text-amber-400"><Flag className="w-3 h-3" /> High</span>;
      case 'MEDIUM':
        return <span className="flex items-center gap-1 text-xs font-medium text-gray-400"><Flag className="w-3 h-3" /> Medium</span>;
      default:
        return <span className="flex items-center gap-1 text-xs text-gray-500"><Flag className="w-3 h-3" /> Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Personal Plans Directory
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700/60 ml-1">
              {filteredPlans.length}
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            List and track your active initiatives, milestones, and goals
          </p>
        </div>

        {/* Action button */}
        <button
          id="btn-create-plan"
          onClick={onOpenCreatePlan}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-200 text-black font-semibold text-xs shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          Create New Plan
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#161618] border border-gray-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              id="input-plan-search"
              type="text"
              placeholder="Search plans by title, tags, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-[#121214] border border-gray-800 text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Sort & View Mode Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                id="select-plan-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort plans by"
                className="bg-[#121214] border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="UPDATED">Recently Updated</option>
                <option value="PROGRESS">Highest Progress</option>
                <option value="DUE_DATE">Target Due Date</option>
                <option value="PRIORITY">Priority Level</option>
              </select>
            </div>

            {/* Grid / List Switcher */}
            <div className="flex items-center p-0.5 rounded-lg bg-[#121214] border border-gray-800">
              <button
                id="btn-view-grid"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-gray-800 text-white shadow-xs' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                id="btn-view-list"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-gray-800 text-white shadow-xs' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills & Status Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-800">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-black font-semibold shadow-xs'
                    : 'bg-gray-800/80 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          {/* Status Select */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <select
              id="select-plan-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter plans by status"
              className="bg-[#121214] border border-gray-800 rounded-lg px-2.5 py-1 text-xs text-gray-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {statuses.map((st) => (
                <option key={st.value} value={st.value}>{st.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Plans Listing Container */}
      {filteredPlans.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#161618] border border-dashed border-gray-800">
          <Layers className="w-12 h-12 mx-auto text-gray-600 mb-3" />
          <h3 className="text-base font-semibold text-gray-200">No matching plans found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or create a brand-new plan to kick off your personal goals.
          </p>
          <button
            onClick={onOpenCreatePlan}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-black" /> Create Plan
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPlans.map((plan) => {
            const planTasks = tasks.filter((t) => t.planId === plan.id);
            const completedTasks = planTasks.filter((t) => t.status === 'DONE').length;
            const progress = Storage.calculatePlanProgress(plan, tasks);
            const reachedMilestones = plan.milestones.filter((m) => m.completed).length;

            return (
              <div
                key={plan.id}
                id={`plan-card-${plan.id}`}
                onClick={() => onSelectPlan(plan)}
                className="group relative p-5 rounded-2xl bg-[#161618] border border-gray-800 shadow-sm hover:border-gray-700 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Category & Actions */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-md border ${getCategoryColor(plan.category)}`}>
                      {plan.category}
                    </span>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {getStatusBadge(plan.status)}
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuPlanId(activeMenuPlanId === plan.id ? null : plan.id)}
                          className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuPlanId === plan.id && (
                          <div className="absolute right-0 mt-1 w-36 rounded-xl bg-[#121214] border border-gray-700 shadow-xl py-1 z-30">
                            <button
                              onClick={() => {
                                setActiveMenuPlanId(null);
                                onEditPlan(plan);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs font-medium text-gray-200 hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-gray-400" /> Edit Plan
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuPlanId(null);
                                onDeletePlan(plan.id);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete Plan
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {plan.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Tags */}
                  {plan.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {plan.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-[11px] rounded-md bg-gray-800/80 text-gray-400 border border-gray-700/50 font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Section: Progress & Metadata */}
                <div className="mt-5 pt-4 border-t border-gray-800/80 space-y-3">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-gray-300">Plan Progress</span>
                      <span className="font-bold text-indigo-400">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          progress === 100 
                            ? 'bg-emerald-500' 
                            : progress >= 60 
                            ? 'bg-indigo-500' 
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Metadata Chips: Milestones, Tasks, Due Date, Priority */}
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1" title="Tasks done">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {completedTasks}/{planTasks.length}
                      </span>
                      {plan.milestones.length > 0 && (
                        <span className="flex items-center gap-1" title="Milestones reached">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          {reachedMilestones}/{plan.milestones.length}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        {plan.actualHours || 0}/{plan.estimatedHours}h
                      </span>
                    </div>

                    {getPriorityBadge(plan.priority)}
                  </div>

                  {/* Due Date & Complete Button */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="flex items-center gap-1 text-gray-400 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      Target: {plan.targetDate}
                    </span>

                    <button
                      onClick={(e) => handleToggleComplete(e, plan)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        plan.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700/60'
                      }`}
                    >
                      {plan.status === 'COMPLETED' ? '✓ Completed' : 'Mark Done'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Layout */
        <div className="rounded-2xl bg-[#161618] border border-gray-800 divide-y divide-gray-800 overflow-hidden shadow-sm">
          {filteredPlans.map((plan) => {
            const planTasks = tasks.filter((t) => t.planId === plan.id);
            const completedTasks = planTasks.filter((t) => t.status === 'DONE').length;
            const progress = Storage.calculatePlanProgress(plan, tasks);

            return (
              <div
                key={plan.id}
                onClick={() => onSelectPlan(plan)}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-800/40 transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-md border ${getCategoryColor(plan.category)}`}>
                      {plan.category}
                    </span>
                    {getStatusBadge(plan.status)}
                    {getPriorityBadge(plan.priority)}
                  </div>
                  <h3 className="text-base font-semibold text-white truncate">
                    {plan.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-center gap-6 shrink-0 justify-between md:justify-end">
                  {/* Progress */}
                  <div className="w-32">
                    <div className="flex justify-between text-xs mb-1 font-semibold">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-indigo-400">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {/* Tasks count */}
                  <div className="text-xs text-gray-400 hidden sm:block">
                    {completedTasks}/{planTasks.length} tasks
                  </div>

                  {/* Due Date */}
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    {plan.targetDate}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEditPlan(plan)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeletePlan(plan.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
