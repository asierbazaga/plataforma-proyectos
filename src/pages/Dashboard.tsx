import React from 'react';
import { Dumbbell, DollarSign, BookOpen, BookMarked, Lock, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppId, ApplicationInfo } from '../types';

interface DashboardProps {
  onSelectApp: (appId: AppId) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectApp }) => {
  const { currentUser, hasAccessToApp } = useAuth();

  const applications: ApplicationInfo[] = [
    {
      id: 'fitness',
      name: 'APP FITNESS & SALUD',
      description: 'Seguimiento de entrenamientos, gasto calórico, rutinas de fuerza y análisis de progreso diario.',
      category: 'Salud & Deporte',
      iconName: 'Dumbbell',
      badgeText: 'Módulo 01',
      gradient: 'from-orange-600/20 via-amber-600/10 to-transparent border-orange-500/30',
      tags: ['Fuerza', 'Cardio', 'Calorías', 'Rutinas']
    },
    {
      id: 'gastos',
      name: 'APP GASTOS & FINANZAS',
      description: 'Control de presupuesto personal y empresarial, registro de ingresos, gastos por categorías y balance neto.',
      category: 'Finanzas',
      iconName: 'DollarSign',
      badgeText: 'Módulo 02',
      gradient: 'from-emerald-600/20 via-teal-600/10 to-transparent border-emerald-500/30',
      tags: ['Ingresos', 'Egresos', 'Presupuesto', 'Balances']
    },
    {
      id: 'libros-juegos',
      name: 'APP LIBROS & JUEGOS',
      description: 'Biblioteca digital para registrar lecturas, catálogo de videojuegos completados y seguimiento de metas.',
      category: 'Ocio & Cultura',
      iconName: 'BookOpen',
      badgeText: 'Módulo 03',
      gradient: 'from-purple-600/20 via-pink-600/10 to-transparent border-purple-500/30',
      tags: ['Lectura', 'Gaming', 'Valoraciones', 'Metas']
    },
    {
      id: 'lore',
      name: 'APP LORE & CONOCIMIENTO',
      description: 'Directorio enciclopédico de conocimiento, documentación técnica, procedimientos y fichas de clientes.',
      category: 'Documentación',
      iconName: 'BookMarked',
      badgeText: 'Módulo 04',
      gradient: 'from-blue-600/20 via-cyan-600/10 to-transparent border-blue-500/30',
      tags: ['Wiki', 'Procedimientos', 'Tags', 'Guías']
    }
  ];

  const getIcon = (id: AppId) => {
    switch (id) {
      case 'fitness': return <Dumbbell className="w-8 h-8 text-orange-400" />;
      case 'gastos': return <DollarSign className="w-8 h-8 text-emerald-400" />;
      case 'libros-juegos': return <BookOpen className="w-8 h-8 text-purple-400" />;
      case 'lore': return <BookMarked className="w-8 h-8 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/80 via-purple-900/60 to-slate-900 border border-indigo-500/30 p-8">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Portal Unificado Centralizado
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">{currentUser?.full_name}</span>
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Accede a cualquiera de tus 4 aplicaciones integradas desde un único panel con control de permisos RBAC respaldado en Supabase.
          </p>
        </div>

        {/* Background glow decoration */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
      </div>

      {/* Applications Catalog Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Catálogo de las 4 Aplicaciones
          </h2>
          <span className="text-xs text-slate-400 font-medium">Selecciona un módulo para ingresar</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applications.map(app => {
            const hasAccess = hasAccessToApp(app.id);

            return (
              <div
                key={app.id}
                className={`glass-panel p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-6 ${
                  hasAccess 
                    ? 'hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1' 
                    : 'opacity-75 border-slate-800'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
                      {getIcon(app.id)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                        {app.badgeText}
                      </span>
                      {hasAccess ? (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Acceso
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" /> Bloqueado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{app.category}</span>
                    <h3 className="text-xl font-bold text-white mt-1">{app.name}</h3>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">{app.description}</p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {app.tags.map(tag => (
                      <span key={tag} className="text-xs text-slate-300 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Launch Button */}
                <div className="pt-4 border-t border-slate-800/80">
                  {hasAccess ? (
                    <button
                      onClick={() => onSelectApp(app.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all group"
                    >
                      <span>Abrir Aplicación</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800/60 text-slate-500 font-semibold rounded-xl border border-slate-800 cursor-not-allowed"
                    >
                      <Lock className="w-4 h-4 text-rose-400" />
                      <span>Acceso Denegado por Permisos</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
