import React, { useState } from 'react';
import { ArrowLeft, Building, Briefcase, Users } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { EntrevistasApp } from '../entrevistas/EntrevistasApp';
import { WorkView } from '../agenda/components/WorkView';

interface TeamLeaderAppProps {
  onBack: () => void;
}

export const TeamLeaderApp: React.FC<TeamLeaderAppProps> = ({ onBack }) => {
  const { isDark } = useTheme();
  const [activePlugin, setActivePlugin] = useState<'entrevistas' | 'trabajo'>('entrevistas');

  return (
    <div className="space-y-6 pb-20">
      {/* Header General del Módulo Team Leader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className={`p-2.5 rounded-xl border transition-all ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
            }`}
            title="Volver al Catálogo de Proyectos"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/20 flex-shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                  Team Leader
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  Hub de Gestión
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-400">
                Selección de talento Mecalux y control laboral de días compensables
              </p>
            </div>
          </div>
        </div>

        {/* Selector de Plugins */}
        <div className={`flex items-center gap-2 p-1.5 rounded-2xl border ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setActivePlugin('entrevistas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activePlugin === 'entrevistas'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/25'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Plugin Entrevistas</span>
          </button>

          <button
            onClick={() => setActivePlugin('trabajo')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activePlugin === 'trabajo'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Plugin Trabajo</span>
          </button>
        </div>
      </div>

      {/* Renderizado del Plugin Activo */}
      <div>
        {activePlugin === 'entrevistas' && <EntrevistasApp />}
        {activePlugin === 'trabajo' && (
          <div className={`min-h-[500px] rounded-3xl border p-4 sm:p-6 ${
            isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <WorkView />
          </div>
        )}
      </div>
    </div>
  );
};
