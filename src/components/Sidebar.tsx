import React from 'react';
import { LayoutDashboard, Dumbbell, DollarSign, BookOpen, BookMarked, ShieldCheck, FileText, Lock, ChevronRight, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AppId } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { currentUser, hasAccessToApp } = useAuth();
  const { isDark } = useTheme();

  const appsList: { id: AppId; name: string; icon: React.FC<{ className?: string }>; color: string }[] = [
    { id: 'fitness', name: 'APP FITNESS', icon: Dumbbell, color: 'text-orange-400' },
    { id: 'gastos', name: 'APP GASTOS', icon: DollarSign, color: 'text-emerald-400' },
    { id: 'libros-juegos', name: 'MULTIMEDIA & CULTURA', icon: BookOpen, color: 'text-purple-400' },
    { id: 'lore', name: 'APP LORE', icon: BookMarked, color: 'text-blue-400' },
    { id: 'entrevistas', name: 'ENTREVISTAS MECALUX', icon: Building, color: 'text-cyan-400' },
  ];

  return (
    <aside className={`w-64 border-r transition-colors duration-200 ${isDark ? 'border-slate-800 bg-[#0B0F19]' : 'border-slate-200 bg-white shadow-sm'} p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]`}>
      <div className="space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Navegación Principal</p>
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              currentTab === 'dashboard'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4" />
              <span>Catálogo Proyectos</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </button>
        </div>

        {/* Application Modules (Only authorized ones) */}
        {appsList.some(app => hasAccessToApp(app.id)) && (
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
              {currentUser?.role === 'admin' ? 'Módulos de Aplicaciones' : 'Módulos Autorizados'}
            </p>
            {appsList
              .filter(app => hasAccessToApp(app.id))
              .map(app => {
                const Icon = app.icon;
                const isActive = currentTab === app.id;

                return (
                  <button
                    key={app.id}
                    onClick={() => onSelectTab(app.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? (isDark ? 'bg-slate-800 text-white border border-slate-700' : 'bg-slate-100 text-slate-900 border border-slate-300 font-bold shadow-sm')
                        : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-900/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${app.color}`} />
                      <span>{app.name}</span>
                    </div>

                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </button>
                );
              })}
          </div>
        )}

        {/* Admin Tools */}
        {currentUser?.role === 'admin' && (
          <div className={`space-y-1 pt-4 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-3 mb-2">Administración RBAC</p>
            <button
              onClick={() => onSelectTab('permissions')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                currentTab === 'permissions'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Matriz de Permisos</span>
            </button>

            <button
              onClick={() => onSelectTab('logs')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                currentTab === 'logs'
                  ? (isDark ? 'bg-slate-800 text-white border border-slate-700' : 'bg-slate-100 text-slate-900 border border-slate-300 font-bold')
                  : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
              }`}
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Registro de Actividad</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className={`pt-4 border-t ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'} text-[11px]`}>
        <p className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Plataforma Unificada v1.0</p>
        <p>Vercel + Supabase Engine</p>
      </div>
    </aside>
  );
};
