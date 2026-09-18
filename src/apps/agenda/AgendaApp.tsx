import React, { useState } from 'react';
import { ArrowLeft, CheckSquare, CalendarDays, Activity, FileText, Timer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

import { TasksView } from './components/TasksView';
import { CalendarView } from './components/CalendarView';
import { HabitsView } from './components/HabitsView';
import { NotesView } from './components/NotesView';
import { PomodoroTimer } from './components/PomodoroTimer';

interface AgendaAppProps {
  onBack: () => void;
}

type TabId = 'tasks' | 'calendar' | 'habits' | 'notes' | 'pomodoro';

export const AgendaApp: React.FC<AgendaAppProps> = ({ onBack }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>('tasks');

  const tabs = [
    { id: 'tasks', label: 'Tareas', icon: CheckSquare },
    { id: 'calendar', label: 'Calendario', icon: CalendarDays },
    { id: 'habits', label: 'Hábitos', icon: Activity },
    { id: 'notes', label: 'Notas', icon: FileText },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Agenda Personal
            </h1>
            <p className="text-sm text-slate-500">Organiza tu día a día</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`flex gap-2 p-1.5 rounded-2xl overflow-x-auto hide-scrollbar ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-blue-500 text-white shadow-md'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className={`min-h-[500px] rounded-3xl border p-4 sm:p-6 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        {activeTab === 'tasks' && <TasksView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'habits' && <HabitsView />}
        {activeTab === 'notes' && <NotesView />}
        {activeTab === 'pomodoro' && <PomodoroTimer />}
      </div>
    </div>
  );
};
