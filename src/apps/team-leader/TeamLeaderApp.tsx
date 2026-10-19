import React, { useState } from 'react';
import { ArrowLeft, Users, CalendarCheck2, ShieldCheck, Briefcase, Lock, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { EntrevistasApp } from '../entrevistas/EntrevistasApp';
import { TeamCompensatoryView } from './components/TeamCompensatoryView';

interface TeamLeaderAppProps {
  onBack: () => void;
}

export const TeamLeaderApp: React.FC<TeamLeaderAppProps> = ({ onBack }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();

  // Asier Bazaga es el Team Leader / Super Admin
  const isTeamLeader = currentUser?.role === 'admin' || currentUser?.email?.toLowerCase().includes('asier.bazaga');

  // Si es un técnico, siempre estará en la pestaña de compensatorios
  const [activeTab, setActiveTab] = useState<'entrevistas' | 'compensatorios'>(
    isTeamLeader ? 'entrevistas' : 'compensatorios'
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Cabecera Principal Unificada de Mecalux Operations */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className={`p-2.5 rounded-2xl border transition-all ${
              isDark
                ? 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
            }`}
            title="Volver al Catálogo de Proyectos"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20 flex-shrink-0">
            {isTeamLeader ? (
              <ShieldCheck className="w-6 h-6 text-white" />
            ) : (
              <Wrench className="w-6 h-6 text-white" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isTeamLeader ? 'Mecalux Ops Hub' : 'Mecalux Field Ops'}
              </h1>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg border ${
                isTeamLeader 
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {isTeamLeader ? 'Team Leader & Operaciones' : 'Área Técnica Mecalux'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {isTeamLeader 
                ? 'Plataforma unificada: Selección técnica de candidatos Mecalux y gestión de días compensables' 
                : 'Control de saldo, registro de bolsas de guardias e intervenciones y libranza de días'}
            </p>
          </div>
        </div>

        {/* Pestañas Principales: Solo visibles si eres el Team Leader (Asier) */}
        {isTeamLeader ? (
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 self-stretch md:self-auto justify-center sm:justify-start">
            <button
              onClick={() => setActiveTab('entrevistas')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'entrevistas'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Selección & Entrevistas</span>
            </button>

            <button
              onClick={() => setActiveTab('compensatorios')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'compensatorios'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Días Compensables (Equipo)</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
              <span className="text-white font-bold">{currentUser?.full_name}</span>
              {currentUser?.email && (
                <span className="text-[11px] text-cyan-400 font-medium">({currentUser.email})</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contenido según la pestaña seleccionada y rol */}
      <div>
        {isTeamLeader && activeTab === 'entrevistas' && (
          <EntrevistasApp hideHeader={true} />
        )}

        {(!isTeamLeader || activeTab === 'compensatorios') && (
          <TeamCompensatoryView />
        )}
      </div>
    </div>
  );
};
