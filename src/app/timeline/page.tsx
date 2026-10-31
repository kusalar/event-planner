'use client';

import React, { useState } from 'react';
import { useEventContext } from '@/context/EventContext';
import {
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  CalendarDays,
} from 'lucide-react';
import { TaskModal } from '@/components/TaskModal';
import { TaskPhase } from '@/types';
import confetti from 'canvas-confetti';

export default function TimelinePage() {
  const {
    currentEvent,
    timelineTasks,
    toggleTimelineTask,
    deleteTimelineTask,
    completedTasksCount,
    totalTasksCount,
    taskCompletionPercentage,
  } = useEventContext();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'phases' | 'calendar'>('phases');

  if (!currentEvent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-slate-500">Please select or create an event first.</p>
      </div>
    );
  }

  const phases: Array<{ id: TaskPhase; label: string; desc: string }> = [
    { id: '6_months', label: '6 Months Before', desc: 'Lock venue, budget framework & core vendors' },
    { id: '3_months', label: '3 Months Before', desc: 'Retain photographer, invitations & menus' },
    { id: '1_month', label: '1 Month Before', desc: 'Decor layouts, attire trials & RSVPs' },
    { id: '2_weeks', label: '2 Weeks Before', desc: 'Final headcount, playlists & gift trays' },
    { id: '1_week', label: '1 Week Before', desc: 'Vendor schedules, balances & emergency pack' },
    { id: 'event_day', label: 'Event Day', desc: 'Stage logistics, audio tests & master execution' },
  ];

  // Filtering tasks
  const filteredTasks = timelineTasks.filter((task) => {
    if (selectedPhase !== 'all' && task.phase !== selectedPhase) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    return true;
  });

  const handleToggle = (taskId: string, currentStatus: boolean) => {
    toggleTimelineTask(taskId);
    if (!currentStatus) {
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.7 },
      });
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs text-violet-600 dark:text-violet-400 font-bold mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Phased Milestone Orchestrator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Smart Timeline: {currentEvent.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Event Date: {new Date(currentEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* View switcher */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('phases')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'phases'
                  ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Phased View
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'calendar'
                  ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Monthly Calendar
            </button>
          </div>

          <button
            onClick={() => setTaskModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-500/25 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Progress Metric Banner */}
      <div className="mb-8 p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-200 uppercase tracking-wider">
            Total Completion Velocity
          </span>
          <div className="text-3xl font-black text-slate-950 dark:text-white mt-1">
            {taskCompletionPercentage}% Complete
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {completedTasksCount} of {totalTasksCount} milestones accomplished
          </p>
        </div>

        <div className="sm:w-72">
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, taskCompletionPercentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            <span>6 Months Out</span>
            <span>Event Day</span>
          </div>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-xs mr-1">Phase:</span>
          <button
            onClick={() => setSelectedPhase('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedPhase === 'all'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            All Phases
          </button>
          {phases.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPhase(p.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedPhase === p.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Main View: Phased Milestone Timeline */}
      {activeTab === 'phases' && (
        <div className="space-y-6">
          {phases
            .filter((p) => selectedPhase === 'all' || selectedPhase === p.id)
            .map((phase) => {
              const phaseTasks = filteredTasks.filter((t) => t.phase === phase.id);
              if (phaseTasks.length === 0 && selectedPhase !== 'all') return null;

              return (
                <div
                  key={phase.id}
                  className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-xs">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">{phase.label}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{phase.desc}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {phaseTasks.filter((t) => t.isCompleted).length} / {phaseTasks.length} Completed
                    </span>
                  </div>

                  {phaseTasks.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      No tasks scheduled in this milestone phase.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {phaseTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 text-xs ${
                            task.isCompleted
                              ? 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/40 opacity-70'
                              : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-violet-400'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <button
                              onClick={() => handleToggle(task.id, task.isCompleted)}
                              className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors"
                            >
                              {task.isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <Circle className="w-5 h-5" />
                              )}
                            </button>
                            <div>
                              <div
                                className={`font-semibold ${
                                  task.isCompleted
                                    ? 'line-through text-slate-400'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {task.title}
                              </div>
                              {task.description && (
                                <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>
                              )}
                              <div className="flex items-center space-x-2 mt-2 text-[10px] text-slate-400">
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                                  {task.category}
                                </span>
                                <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                task.priority === 'high'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                  : task.priority === 'medium'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              }`}
                            >
                              {task.priority}
                            </span>
                            <button
                              onClick={() => deleteTimelineTask(task.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                              title="Delete task"
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
            })}
        </div>
      )}

      {/* Secondary View: Interactive Monthly Calendar View */}
      {activeTab === 'calendar' && (
        <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Scheduled Tasks Calendar Matrix</h3>
            <span className="text-xs text-slate-400">Chronological list of deadlines</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {timelineTasks
              .slice()
              .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
              .map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-xs space-y-2 hover:border-violet-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-violet-600 dark:text-violet-400 text-[11px] font-mono">
                      {new Date(task.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        task.isCompleted ? 'bg-emerald-500' : task.priority === 'high' ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                    />
                  </div>
                  <div className={`font-semibold ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                    {task.title}
                  </div>
                  <div className="text-[10px] text-slate-400">Category: {task.category}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Task Modal */}
      <TaskModal isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
    </div>
  );
}

