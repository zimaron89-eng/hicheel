import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Plan, Task, MetricSnapshot } from './types';
import { Storage } from './lib/storage';
import { Navbar } from './components/Navbar';
import { DashboardMetrics } from './components/DashboardMetrics';
import { PlanList } from './components/PlanList';
import { TaskBoard } from './components/TaskBoard';
import { PlanDetailModal } from './components/PlanDetailModal';
import { PlanCreateModal } from './components/PlanCreateModal';
import { TaskCreateModal } from './components/TaskCreateModal';
import { AuthModal } from './components/AuthModal';
import { PrismaSchemaModal } from './components/PrismaSchemaModal';
import { UserProfileModal } from './components/UserProfileModal';
import { WorldClock } from './components/WorldClock';
import { 
  Plus, 
  Layers, 
  CheckSquare, 
  LayoutDashboard, 
  Sparkles,
  ShieldCheck,
  Database,
  ArrowRight
} from 'lucide-react';

function MainApp() {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [currentView, setCurrentView] = useState<'dashboard' | 'plans' | 'tasks'>('dashboard');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedPlanForDetail, setSelectedPlanForDetail] = useState<Plan | null>(null);

  // Modals
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<Plan | null>(null);

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultPlanIdForTask, setDefaultPlanIdForTask] = useState<string | undefined>(undefined);

  const [isPrismaModalOpen, setIsPrismaModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Filter for tasks if navigated from plan
  const [activePlanFilterForTasks, setActivePlanFilterForTasks] = useState<string | null>(null);

  // Refresh data from storage
  const reloadData = () => {
    const currentUserId = user?.id || 'usr_cuid_Reki_01';
    const fetchedPlans = Storage.getPlans(currentUserId);
    const fetchedTasks = Storage.getTasks();
    setPlans(fetchedPlans);
    setTasks(fetchedTasks);
  };

  useEffect(() => {
    reloadData();
  }, [user]);

  // Keep selected plan for detail synchronized
  useEffect(() => {
    if (selectedPlanForDetail) {
      const updated = plans.find(p => p.id === selectedPlanForDetail.id);
      if (updated) setSelectedPlanForDetail(updated);
    }
  }, [plans]);

  // Metrics
  const metrics: MetricSnapshot = useMemo(() => {
    const currentUserId = user?.id || 'usr_cuid_Reki_01';
    return Storage.calculateMetrics(currentUserId);
  }, [plans, tasks, user]);

  const openTasksCount = tasks.filter(t => t.status !== 'DONE').length;

  // Plan Handlers
  const handleSavePlan = (plan: Plan) => {
    const updated = Storage.savePlan(plan);
    setPlans(updated);
    setPlanToEdit(null);
  };

  const handleDeletePlan = (planId: string) => {
    const updated = Storage.deletePlan(planId);
    setPlans(updated);
    setTasks(Storage.getTasks());
    if (selectedPlanForDetail?.id === planId) {
      setSelectedPlanForDetail(null);
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setPlanToEdit(plan);
    setIsCreatePlanOpen(true);
  };

  // Task Handlers
  const handleSaveTask = (task: Task) => {
    const updated = Storage.saveTask(task);
    setTasks(updated);
    setTaskToEdit(null);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = Storage.deleteTask(taskId);
    setTasks(updated);
  };

  const handleEditTask = (task: Task) => {
    setDefaultPlanIdForTask(task.planId);
    setTaskToEdit(task);
    setIsCreateTaskOpen(true);
  };

  const handleOpenCreateTask = (planId?: string) => {
    setDefaultPlanIdForTask(planId || (plans[0]?.id));
    setTaskToEdit(null);
    setIsCreateTaskOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-200 flex flex-col selection:bg-indigo-600 selection:text-white pb-16 md:pb-8">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenPrismaSchema={() => setIsPrismaModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        plansCount={plans.length}
        openTasksCount={openTasksCount}
      />

      {/* Demo Architecture Notice Ribbon */}
      <div className="bg-[#121214] border-b border-gray-800 text-gray-300 text-xs px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 px-1.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
              Architecture Prototype
            </span>
            <span className="text-gray-400 text-xs">
              Powered by <strong className="text-gray-200">Next.js App Router</strong>, <strong className="text-gray-200">Tailwind CSS</strong> &amp; <strong className="text-gray-200">Prisma ORM</strong> relational state
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsPrismaModalOpen(true)}
              className="text-xs font-semibold text-indigo-400 underline hover:text-indigo-300 cursor-pointer flex items-center gap-1"
            >
              <Database className="w-3 h-3" />
              View schema.prisma &amp; API routes
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => openAuthModal('login')}
                className="px-2.5 py-0.5 rounded-md bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            {/* Greeting and Quick Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-2xl bg-[#161618] border border-gray-800 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-2.5 border border-indigo-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  Personal Plan Execution Platform
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  Welcome back, {user?.name || 'Customer'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl leading-relaxed">
                  Track your personal roadmap, execute daily milestones, and visualize goal velocity with precision data models.
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap gap-2.5 shrink-0">
                <button
                  id="btn-quick-create-plan"
                  onClick={() => {
                    setPlanToEdit(null);
                    setIsCreatePlanOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-200 text-black text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-black" />
                  New Plan
                </button>
                <button
                  id="btn-quick-create-task"
                  onClick={() => handleOpenCreateTask()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold border border-indigo-400/20 shadow-lg shadow-indigo-950/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  New Task
                </button>
              </div>

              {/* Ambient indigo glow */}
              <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Intuitive Data Visualizations & Metrics Dashboard */}
            <DashboardMetrics
              plans={plans}
              tasks={tasks}
              metrics={metrics}
            />

            {/* World Clock */}
            <WorldClock />

            {/* Quick Link to Plans Section */}
            <div className="p-5 rounded-2xl bg-[#161618] border border-gray-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Active Personal Plans Overview
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  You currently have {plans.length} strategic personal plans registered in your database.
                </p>
              </div>
              <button
                onClick={() => setCurrentView('plans')}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-gray-800/60 hover:bg-gray-800 text-gray-200 border border-gray-700/60 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Browse All Plans</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {currentView === 'plans' && (
          <PlanList
            plans={plans}
            tasks={tasks}
            onSelectPlan={(plan) => setSelectedPlanForDetail(plan)}
            onOpenCreatePlan={() => {
              setPlanToEdit(null);
              setIsCreatePlanOpen(true);
            }}
            onEditPlan={handleEditPlan}
            onDeletePlan={handleDeletePlan}
            onUpdatePlan={handleSavePlan}
          />
        )}

        {currentView === 'tasks' && (
          <TaskBoard
            tasks={tasks}
            plans={plans}
            selectedPlanId={activePlanFilterForTasks}
            onOpenCreateTask={handleOpenCreateTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleSaveTask}
          />
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#161618]/95 border-t border-gray-800 py-2.5 px-6 flex items-center justify-around backdrop-blur-md">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            currentView === 'dashboard' ? 'text-white font-bold' : 'text-gray-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setCurrentView('plans')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            currentView === 'plans' ? 'text-white font-bold' : 'text-gray-400'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>Plans ({plans.length})</span>
        </button>

        <button
          onClick={() => setCurrentView('tasks')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            currentView === 'tasks' ? 'text-white font-bold' : 'text-gray-400'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span>Tasks ({openTasksCount})</span>
        </button>
      </div>

      {/* Modals */}
      <PlanDetailModal
        plan={selectedPlanForDetail}
        tasks={tasks}
        isOpen={!!selectedPlanForDetail}
        onClose={() => setSelectedPlanForDetail(null)}
        onEditPlan={handleEditPlan}
        onDeletePlan={handleDeletePlan}
        onUpdatePlan={handleSavePlan}
        onUpdateTask={handleSaveTask}
        onOpenCreateTask={(pId) => handleOpenCreateTask(pId)}
      />

      <PlanCreateModal
        isOpen={isCreatePlanOpen}
        onClose={() => {
          setIsCreatePlanOpen(false);
          setPlanToEdit(null);
        }}
        onSave={handleSavePlan}
        planToEdit={planToEdit}
        userId={user?.id || 'usr_cuid_Reki_01'}
      />

      <TaskCreateModal
        isOpen={isCreateTaskOpen}
        onClose={() => {
          setIsCreateTaskOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        plans={plans}
        taskToEdit={taskToEdit}
        defaultPlanId={defaultPlanIdForTask}
      />

      <PrismaSchemaModal
        isOpen={isPrismaModalOpen}
        onClose={() => setIsPrismaModalOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
