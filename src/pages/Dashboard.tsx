import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  DollarSign, 
  BookOpen, 
  Navigation, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  TrendingUp, 
  Gamepad2, 
  MapPin, 
  Activity,
  Layers,
  Zap,
  ChevronRight,
  Target,
  Building2,
  Award,
  Calendar,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppId } from '../types';

interface DashboardProps {
  onSelectApp: (appId: AppId | 'permissions' | 'logs') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectApp }) => {
  const { currentUser, hasAccessToApp } = useAuth();

  const isLore = currentUser?.email?.toLowerCase().includes('lore') || currentUser?.full_name?.toLowerCase().includes('lore');
  const isAsier = currentUser?.role === 'admin';

  // Leer datos de objetivos de Lore si existen en local
  const [loreGoal, setLoreGoal] = useState({
    objetivo: 15000,
    venta: 0,
    dias: 21
  });

  useEffect(() => {
    const obj = localStorage.getItem('lore_goal_objetivo');
    const ven = localStorage.getItem('lore_goal_venta');
    const dias = localStorage.getItem('lore_goal_dias');
    if (obj) setLoreGoal(prev => ({ ...prev, objetivo: Number(obj) }));
    if (ven) setLoreGoal(prev => ({ ...prev, venta: Number(ven) }));
    if (dias) setLoreGoal(prev => ({ ...prev, dias: Number(dias) }));
  }, []);

  const lorePct = loreGoal.objetivo > 0 ? (loreGoal.venta / loreGoal.objetivo) * 100 : 0;
  const loreFalta80 = Math.max(0, (loreGoal.objetivo * 0.8) - loreGoal.venta);
  const loreRitmo80 = loreGoal.dias > 0 ? loreFalta80 / loreGoal.dias : 0;

  const apps = [
    {
      id: 'fitness' as AppId,
      number: '01',
      category: 'Salud & Rendimiento',
      title: 'Fitness & Salud',
      subtitle: 'Entrenamientos, calorías y metas físicas',
      description: 'Registro de sesiones de fuerza, cardio, gasto calórico y progreso corporal diario.',
      icon: Dumbbell,
      glowColor: 'group-hover:shadow-orange-500/20 group-hover:border-orange-500/50',
      iconGradient: 'from-orange-500 to-amber-500 shadow-orange-500/30',
      tagColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      btnGradient: 'from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-orange-500/25',
      highlights: [
        { label: 'Calorías & Métricas', icon: Flame },
        { label: 'Rutinas de Fuerza', icon: Dumbbell },
        { label: 'Historial Activo', icon: Zap }
      ]
    },
    {
      id: 'gastos' as AppId,
      number: '02',
      category: 'Finanzas & Control',
      title: 'Gastos & Finanzas',
      subtitle: 'Presupuestos, ingresos y balances',
      description: 'Control detallado de ingresos y gastos diarios, balances netos y desglose por categorías.',
      icon: DollarSign,
      glowColor: 'group-hover:shadow-emerald-500/20 group-hover:border-emerald-500/50',
      iconGradient: 'from-emerald-500 to-teal-500 shadow-emerald-500/30',
      tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      btnGradient: 'from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/25',
      highlights: [
        { label: 'Ingresos & Gastos', icon: TrendingUp },
        { label: 'Balance en Directo', icon: DollarSign },
        { label: 'Gestión Contable', icon: Zap }
      ]
    },
    {
      id: 'libros-juegos' as AppId,
      number: '03',
      category: 'Ocio & Cultura',
      title: 'Libros & Juegos',
      subtitle: 'Biblioteca personal y catálogo gaming',
      description: 'Seguimiento de lecturas, archivo de videojuegos completados, valoraciones y progreso.',
      icon: BookOpen,
      glowColor: 'group-hover:shadow-purple-500/20 group-hover:border-purple-500/50',
      iconGradient: 'from-purple-500 to-pink-500 shadow-purple-500/30',
      tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      btnGradient: 'from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 shadow-purple-500/25',
      highlights: [
        { label: 'Biblioteca Digital', icon: BookOpen },
        { label: 'Registro Gaming', icon: Gamepad2 },
        { label: 'Valoraciones & Metas', icon: Zap }
      ]
    },
    {
      id: 'lore' as AppId,
      number: '04',
      category: 'Comercial & Drasanvi',
      title: 'Lore Comercial & CRM',
      subtitle: 'Cuadro de mandos, farmacias y rutas',
      description: 'Calculadora de objetivos y bonos Drasanvi, CRM general de seguimiento a farmacias por tendencias/competencia y rutas GPS.',
      icon: Navigation,
      glowColor: 'group-hover:shadow-pink-500/20 group-hover:border-pink-500/50',
      iconGradient: 'from-pink-500 via-purple-500 to-cyan-500 shadow-pink-500/30',
      tagColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
      btnGradient: 'from-pink-500 via-purple-600 to-cyan-600 hover:from-pink-400 hover:to-cyan-500 shadow-pink-500/25',
      highlights: [
        { text: 'Objetivos Drasanvi', icon: Sparkles },
        { text: 'CRM Farmacias', icon: Building2 },
        { text: 'Rutas & Deciles', icon: MapPin }
      ]
    }
  ];

  // Si es Lore, ordenar para que su aplicación comercial aparezca en primer lugar
  const sortedApps = isLore 
    ? [...apps.filter(a => a.id === 'lore'), ...apps.filter(a => a.id !== 'lore')]
    : apps;

  // Filtrar estrictamente solo las aplicaciones a las que el usuario tiene permisos
  const accessibleApps = sortedApps.filter(app => hasAccessToApp(app.id));

  // Monograma de iniciales para el avatar
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Saludo Limpio y Estructurado */}
      <div className="flex items-center justify-between py-2 px-1">
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm shadow-lg ring-1 ring-white/20 flex-shrink-0 ${
            isAsier 
              ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-indigo-500/20' 
              : isLore 
              ? 'bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-pink-500/20' 
              : 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white'
          }`}>
            <span>{isAsier ? '👑' : isLore ? '🌸' : '👁️'}</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{isLore ? '¡Hola,' : 'Bienvenido,'}</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                {currentUser?.full_name}
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {isAsier 
                ? 'Super Administrador' 
                : isLore 
                ? 'Comercial Drasanvi' 
                : 'Usuario Plataforma'}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-semibold">{currentUser?.role === 'admin' ? 'Super Admin' : 'Usuario'}</span>
        </div>
      </div>

      {/* 2. CATÁLOGO DE APLICACIONES (Limpio y directo) */}
      <div className="space-y-4">
        <div className="px-1 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {accessibleApps.length === 4 ? 'Catálogo de Aplicaciones' : 'Tus Módulos Asignados'}
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {accessibleApps.length} {accessibleApps.length === 1 ? 'módulo activo' : 'módulos activos'}
          </span>
        </div>

        {/* Grid de Tarjetas o Estado Vacío */}
        {accessibleApps.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Sin módulos asignados</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Tu cuenta está registrada pero aún no tiene módulos asignados. El administrador te otorgará los accesos oportunos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {accessibleApps.map((app) => {
              const Icon = app.icon;

              return (
                <div
                  key={app.id}
                  onClick={() => onSelectApp(app.id)}
                  className={`group relative overflow-hidden rounded-3xl bg-slate-900/70 border border-slate-800/90 p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all duration-300 backdrop-blur-md cursor-pointer hover:border-slate-700 hover:-translate-y-1 hover:shadow-2xl ${app.glowColor}`}
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-white/[0.05] transition-all" />

                  <div className="space-y-4 relative z-10">
                    {/* Category & Status */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-xl border uppercase tracking-wider ${app.tagColor}`}>
                          {app.category}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          #{app.number}
                        </span>
                      </div>

                      <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Habilitado</span>
                      </span>
                    </div>

                    {/* Icon & Title */}
                    <div className="flex items-start gap-4 pt-1">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${app.iconGradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform flex-shrink-0 ring-1 ring-white/20`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight group-hover:text-white transition-colors">
                          {app.title}
                        </h3>
                        <p className="text-xs font-medium text-slate-400">
                          {app.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-300/90 leading-relaxed pt-1">
                      {app.description}
                    </p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {app.highlights.map((h, i) => {
                        const HIcon = h.icon;
                        return (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300"
                          >
                            <HIcon className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{h.text}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="pt-4 border-t border-slate-800/80 relative z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectApp(app.id);
                      }}
                      className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r ${app.btnGradient} transition-all flex items-center justify-center gap-2 shadow-lg group-hover:shadow-xl hover:scale-[1.01]`}
                    >
                      <span>Abrir {app.title}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. HERRAMIENTAS DE ADMINISTRACIÓN (Solo visible si es Asier / Admin) */}
      {isAsier && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-indigo-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                👑
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Herramientas de Administración</h3>
                <p className="text-xs text-slate-400">Control de usuarios y trazabilidad de actividad del sistema</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => onSelectApp('permissions')}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
                <div>
                  <p className="font-bold text-white text-sm">Matriz de Permisos (RBAC)</p>
                  <p className="text-xs text-slate-400">Gestionar accesos y altas de usuarios</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => onSelectApp('logs')}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-purple-400" />
                <div>
                  <p className="font-bold text-white text-sm">Registro de Actividad (Audit Trail)</p>
                  <p className="text-xs text-slate-400">Historial de accesos y cambios</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
