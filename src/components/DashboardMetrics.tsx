import React, { useState } from 'react';
import { Plan, Task, MetricSnapshot } from '../types';
import { 
  CheckCircle2, 
  Flame, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface DashboardMetricsProps {
  plans: Plan[];
  tasks: Task[];
  metrics: MetricSnapshot;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  plans,
  tasks,
  metrics,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<{ day: string; value: number; x: number; y: number } | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Category breakdown
  const categoryCounts = plans.reduce((acc, plan) => {
    acc[plan.category] = (acc[plan.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryColors: Record<string, { fill: string; stroke: string; bg: string; text: string }> = {
    Project: { fill: '#6366f1', stroke: '#6366f1', bg: 'bg-indigo-500/10 border border-indigo-500/20', text: 'text-indigo-400' },
    Health: { fill: '#10b981', stroke: '#10b981', bg: 'bg-emerald-500/10 border border-emerald-500/20', text: 'text-emerald-400' },
    Learning: { fill: '#f59e0b', stroke: '#f59e0b', bg: 'bg-amber-500/10 border border-amber-500/20', text: 'text-amber-400' },
    Finance: { fill: '#3b82f6', stroke: '#3b82f6', bg: 'bg-blue-500/10 border border-blue-500/20', text: 'text-blue-400' },
    Career: { fill: '#8b5cf6', stroke: '#8b5cf6', bg: 'bg-purple-500/10 border border-purple-500/20', text: 'text-purple-400' },
    Personal: { fill: '#ec4899', stroke: '#ec4899', bg: 'bg-pink-500/10 border border-pink-500/20', text: 'text-pink-400' },
  };

  const totalCategoryPlans = Math.max(1, plans.length);

  // Status breakdown
  const statusCounts = {
    DONE: tasks.filter(t => t.status === 'DONE').length,
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    BLOCKED: tasks.filter(t => t.status === 'BLOCKED').length,
    TODO: tasks.filter(t => t.status === 'TODO').length,
  };
  const totalTasks = Math.max(1, tasks.length);

  // Velocity data points for the last 14 days
  const velocityData = [
    { day: 'Aug 20', completed: 1 },
    { day: 'Aug 21', completed: 2 },
    { day: 'Aug 22', completed: 1 },
    { day: 'Aug 23', completed: 3 },
    { day: 'Aug 24', completed: 2 },
    { day: 'Aug 25', completed: 4 },
    { day: 'Aug 26', completed: 3 },
    { day: 'Aug 27', completed: 2 },
    { day: 'Aug 28', completed: 4 },
    { day: 'Aug 29', completed: 3 },
    { day: 'Aug 30', completed: 5 },
    { day: 'Aug 31', completed: 4 },
    { day: 'Sep 01', completed: 3 },
    { day: 'Sep 02', completed: 6 },
  ];

  // Calculate SVG curve path for velocity
  const chartWidth = 500;
  const chartHeight = 160;
  const paddingX = 24;
  const paddingY = 24;
  const maxVal = Math.max(...velocityData.map(d => d.completed), 8);

  const points = velocityData.map((d, i) => {
    const x = paddingX + (i / (velocityData.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (d.completed / maxVal) * (chartHeight - paddingY * 2);
    return { x, y, day: d.day, val: d.completed };
  });

  const linePath = points.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[idx - 1];
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (curr.x - prev.x) / 2;
    const cpY2 = curr.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  // Heatmap: Past 28 days (4 weeks x 7 days)
  const heatmapDays = Array.from({ length: 28 }, (_, i) => {
    const dayNum = i + 1;
    // create realistic deterministic pattern
    const count = (dayNum % 7 === 0 || dayNum % 7 === 6) 
      ? (dayNum % 3 === 0 ? 1 : 0) 
      : ((dayNum * 3 + 2) % 5);
    return { day: dayNum, count };
  });

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Progress */}
        <div id="metric-card-progress" className="p-5 rounded-2xl bg-[#161618] border border-gray-800 transition-all hover:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall Progress</span>
            <div className="p-2 rounded-xl bg-gray-800/80 text-indigo-400 border border-gray-700/50">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-white">
              {metrics.overallProgress}%
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-400 gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +8% this mo
            </span>
          </div>
          <div className="mt-3 w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.overallProgress}%` }}
            />
          </div>
          <p className="mt-2.5 text-xs text-gray-400 flex justify-between">
            <span>{metrics.completedPlans} of {metrics.totalPlans} plans completed</span>
            <span className="text-gray-500">{Math.max(0, metrics.totalPlans - metrics.completedPlans)} active</span>
          </p>
        </div>

        {/* Metric 2: Task Execution */}
        <div id="metric-card-tasks" className="p-5 rounded-2xl bg-[#161618] border border-gray-800 transition-all hover:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tasks Completed</span>
            <div className="p-2 rounded-xl bg-gray-800/80 text-emerald-400 border border-gray-700/50">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-white">
              {metrics.completedTasks} <span className="text-sm font-normal text-gray-500">/ {tasks.length}</span>
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700/60">
              {metrics.activeTasks} open
            </span>
          </div>
          <div className="mt-3 w-full bg-gray-800 h-1.5 rounded-full overflow-hidden flex">
            <div 
              className="bg-emerald-500 h-full" 
              style={{ width: `${(statusCounts.DONE / totalTasks) * 100}%` }} 
              title="Done"
            />
            <div 
              className="bg-blue-500 h-full" 
              style={{ width: `${(statusCounts.IN_PROGRESS / totalTasks) * 100}%` }} 
              title="In Progress"
            />
            <div 
              className="bg-rose-500 h-full" 
              style={{ width: `${(statusCounts.BLOCKED / totalTasks) * 100}%` }} 
              title="Blocked"
            />
          </div>
          <p className="mt-2.5 text-xs text-gray-400">
            {metrics.weeklyVelocity} tasks closed this past week
          </p>
        </div>

        {/* Metric 3: Active Streak */}
        <div id="metric-card-streak" className="p-5 rounded-2xl bg-[#161618] border border-gray-800 transition-all hover:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Consistency Streak</span>
            <div className="p-2 rounded-xl bg-gray-800/80 text-amber-400 border border-gray-700/50">
              <Flame className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-white">
              {metrics.currentStreakDays} <span className="text-sm font-medium text-gray-400">days</span>
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-amber-400">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Best: 14d
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
              const active = idx < metrics.currentStreakDays;
              return (
                <div 
                  key={idx} 
                  className={`flex-1 text-center py-1 text-[11px] font-semibold rounded-md ${
                    active 
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' 
                      : 'bg-gray-800/60 text-gray-500'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
          <p className="mt-2.5 text-xs text-gray-400">
            Daily goal achieved 6 of 7 days
          </p>
        </div>

        {/* Metric 4: Accent Card (Hours Invested) */}
        <div id="metric-card-hours" className="p-5 rounded-2xl bg-indigo-600 border border-indigo-400/20 shadow-lg shadow-indigo-950/40 text-white transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">Hours Invested</span>
            <div className="p-2 rounded-xl bg-white/20 text-white">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-white">
              {metrics.totalHoursInvested}h
            </span>
            <span className="text-xs font-medium text-indigo-200">
              of {metrics.totalHoursPlanned}h planned
            </span>
          </div>
          <div className="mt-3 w-full bg-indigo-950/40 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full rounded-full"
              style={{ width: `${Math.min(100, Math.round((metrics.totalHoursInvested / Math.max(1, metrics.totalHoursPlanned)) * 100))}%` }}
            />
          </div>
          <p className="mt-2.5 text-xs text-indigo-100/80 flex justify-between">
            <span>Pace: On schedule</span>
            <span>{Math.round((metrics.totalHoursInvested / Math.max(1, metrics.totalHoursPlanned)) * 100)}% budget</span>
          </p>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Task Completion Velocity (Area Chart) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#161618] border border-gray-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Velocity &amp; Task Completion Trend
              </h3>
              <p className="text-xs text-gray-400">
                Daily completed tasks velocity over the last 14 days
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-300 font-medium px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700/60">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Daily Velocity
              </span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                Avg: 3.2 / day
              </span>
            </div>
          </div>

          {/* SVG Area Chart */}
          <div className="relative w-full aspect-21/9 min-h-[180px] select-none">
            <svg 
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = paddingY + ratio * (chartHeight - paddingY * 2);
                return (
                  <line 
                    key={idx}
                    x1={paddingX} 
                    y1={y} 
                    x2={chartWidth - paddingX} 
                    y2={y} 
                    stroke="currentColor" 
                    className="text-gray-800/80" 
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Area */}
              <path d={areaPath} fill="url(#velocityGradient)" />

              {/* Line */}
              <path 
                d={linePath} 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />

              {/* Data points */}
              {points.map((pt, idx) => (
                <g key={idx} className="cursor-pointer">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={activeTooltip?.day === pt.day ? "6" : "3.5"}
                    fill="#6366f1"
                    stroke="#161618"
                    strokeWidth="2"
                    className="transition-all duration-150 hover:scale-125"
                    onMouseEnter={() => setActiveTooltip({ day: pt.day, value: pt.val, x: pt.x, y: pt.y })}
                    onMouseLeave={() => setActiveTooltip(null)}
                  />
                </g>
              ))}
            </svg>

            {/* Interactive Tooltip */}
            {activeTooltip && (
              <div 
                className="absolute z-20 pointer-events-none px-2.5 py-1.5 rounded-lg bg-[#121214] border border-gray-700 text-white text-xs shadow-xl transform -translate-x-1/2 -translate-y-full mb-2 font-medium"
                style={{ 
                  left: `${(activeTooltip.x / chartWidth) * 100}%`, 
                  top: `${(activeTooltip.y / chartHeight) * 100}%` 
                }}
              >
                <div className="font-semibold text-white">{activeTooltip.day}</div>
                <div className="text-[11px] text-gray-400">{activeTooltip.value} tasks completed</div>
              </div>
            )}

            {/* X-axis labels */}
            <div className="flex justify-between text-[10px] text-gray-500 pt-2 px-4">
              <span>{velocityData[0].day}</span>
              <span>{velocityData[Math.floor(velocityData.length / 2)].day}</span>
              <span>{velocityData[velocityData.length - 1].day}</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Category Distribution (Donut Chart) */}
        <div className="p-6 rounded-2xl bg-[#161618] border border-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Plans by Category
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Balance of goals across life &amp; work domains
            </p>

            {/* SVG Donut */}
            <div className="relative flex items-center justify-center my-2">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                {(() => {
                  let accumulatedPercent = 0;
                  const radius = 38;
                  const circumference = 2 * Math.PI * radius;

                  return Object.entries(categoryCounts).map(([cat, count], idx) => {
                    const countNum = Number(count);
                    const percent = countNum / totalCategoryPlans;
                    const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
                    const strokeDashoffset = -circumference * accumulatedPercent;
                    accumulatedPercent += percent;

                    const color = categoryColors[cat]?.stroke || '#64748b';
                    const isHovered = hoveredCategory === cat;

                    return (
                      <circle
                        key={cat}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={color}
                        strokeWidth={isHovered ? "14" : "11"}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredCategory(cat)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      />
                    );
                  });
                })()}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl font-bold text-white">
                  {hoveredCategory 
                    ? categoryCounts[hoveredCategory] || 0
                    : plans.length}
                </span>
                <span className="text-[11px] font-medium text-gray-400">
                  {hoveredCategory || 'Total Plans'}
                </span>
              </div>
            </div>
          </div>

          {/* Category Chips Legend */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-800">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const meta = categoryColors[cat] || { stroke: '#64748b', bg: 'bg-gray-800', text: 'text-gray-300' };
              const percent = Math.round((Number(count) / totalCategoryPlans) * 100);
              return (
                <div 
                  key={cat} 
                  className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    hoveredCategory === cat ? 'bg-gray-800 font-semibold' : 'hover:bg-gray-800/50'
                  }`}
                  onMouseEnter={() => setHoveredCategory(cat)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: meta.stroke }} />
                    <span className="text-gray-300 truncate">{cat}</span>
                  </div>
                  <span className="text-gray-500 font-medium shrink-0">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Productivity Heatmap & Task Status Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#161618] border border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Productivity Consistency Grid (Past 4 Weeks)
              </h3>
              <p className="text-xs text-gray-400">
                Daily activity tracking frequency and completed tasks
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-xs bg-gray-800" />
              <div className="w-2.5 h-2.5 rounded-xs bg-emerald-950 border border-emerald-800/40" />
              <div className="w-2.5 h-2.5 rounded-xs bg-emerald-700" />
              <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
              <span>More</span>
            </div>
          </div>

          <div className="grid grid-flow-col grid-rows-7 gap-1.5 pt-2 overflow-x-auto">
            {heatmapDays.map((item, idx) => {
              const bgClass = item.count === 0 
                ? 'bg-gray-800/80 border border-gray-800' 
                : item.count === 1 
                ? 'bg-emerald-950 border border-emerald-800/40' 
                : item.count <= 3 
                ? 'bg-emerald-700' 
                : 'bg-emerald-500';

              return (
                <div
                  key={idx}
                  title={`Day ${item.day}: ${item.count} tasks executed`}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md ${bgClass} transition-all hover:scale-110 hover:ring-2 hover:ring-emerald-400 cursor-default`}
                />
              );
            })}
          </div>
        </div>

        {/* Task Status Breakdown */}
        <div className="p-6 rounded-2xl bg-[#161618] border border-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Task Execution Status
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Real-time task state distribution
            </p>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed
                  </span>
                  <span className="text-white font-semibold">
                    {statusCounts.DONE} ({Math.round((statusCounts.DONE / totalTasks) * 100)}%)
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(statusCounts.DONE / totalTasks) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-blue-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> In Progress
                  </span>
                  <span className="text-white font-semibold">
                    {statusCounts.IN_PROGRESS} ({Math.round((statusCounts.IN_PROGRESS / totalTasks) * 100)}%)
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(statusCounts.IN_PROGRESS / totalTasks) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-500" /> Todo Backlog
                  </span>
                  <span className="text-white font-semibold">
                    {statusCounts.TODO} ({Math.round((statusCounts.TODO / totalTasks) * 100)}%)
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-500 rounded-full" style={{ width: `${(statusCounts.TODO / totalTasks) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Blocked
                  </span>
                  <span className="text-white font-semibold">
                    {statusCounts.BLOCKED} ({Math.round((statusCounts.BLOCKED / totalTasks) * 100)}%)
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(statusCounts.BLOCKED / totalTasks) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
