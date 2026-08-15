import React from 'react';
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
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppId } from '../types';

interface DashboardProps {
  onSelectApp: (appId: AppId | 'permissions' | 'logs') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectApp }) => {
  const { currentUser, hasAccessToApp } = useAuth();

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
      category: 'Comercial & Rutas',
      title: 'Lore & Rutas',
      subtitle: 'Mapa interactivo GPS y clientes',
      description: 'Gestor geolocalizado de clientes por deciles (D07-D10), optimización de rutas comerciales.',
      icon: Navigation,
      glowColor: 'group-hover:shadow-blue-500/20 group-hover:border-blue-500/50',
      iconGradient: 'from-blue-500 to-cyan-500 shadow-blue-500/30',
      tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      btnGradient: 'from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 shadow-blue-500/25',
      highlights: [
        { label: 'Mapa GPS Leaflet', icon: MapPin },
        { label: 'Deciles D10 a D07', icon: Layers },
        { label: 'Generador de Rutas', icon: Navigation }
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#111827] to-[#0B0F19] border border-slate-800/90 p-6 sm:p-8 shadow-2xl">
        {/* Glow ambient spots */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Plataforma Unificada Centralizada</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Bienvenido,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                {currentUser?.full_name}
              </span>
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed">
              Selecciona una de las 4 aplicaciones para acceder a tus módulos de gestión, salud, finanzas y rutas con tu sesión activa.
            </p>
          </div>

          {/* Quick Platform Status Card */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-md">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-tight">Apps Activas</p>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Sistema OK
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                {currentUser?.role === 'admin' ? '👑' : '👤'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-tight">
                  {currentUser?.role === 'admin' ? 'Super Admin' : 'Usuario'}
                </p>
                <p className="text-[10px] text-indigo-300 font-medium">
                  {currentUser?.role === 'admin' ? 'Control Total' : 'Acceso Completo'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern 4 Cards Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Catálogo de Aplicaciones</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">4 herramientas sincronizadas en un solo portal</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-semibold">
            4 Módulos Disponibles
          </span>
        </div>

        {/* 2x2 Interactive Luxury Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {apps.map((app) => {
            const hasAccess = hasAccessToApp(app.id);
            const Icon = app.icon;

            return (
              <div
                key={app.id}
                onClick={() => hasAccess && onSelectApp(app.id)}
                className={`group relative overflow-hidden rounded-3xl bg-slate-900/70 border border-slate-800/90 p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all duration-300 backdrop-blur-md ${
                  hasAccess
                    ? `cursor-pointer hover:border-slate-700 hover:-translate-y-1 hover:shadow-2xl ${app.glowColor}`
                    : 'opacity-70 border-slate-800/50 cursor-not-allowed'
                }`}
              >
                {/* Subtle card top glow on hover */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-white/[0.05] transition-all" />

                <div className="space-y-4 relative z-10">
                  {/* Card Top Strip: Category & Access Status */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-xl border uppercase tracking-wider ${app.tagColor}`}>
                        {app.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        #{app.number}
                      </span>
                    </div>

                    {hasAccess ? (
                      <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Habilitado</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Restringido</span>
                      </span>
                    )}
                  </div>

                  {/* Icon & Title Group */}
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

                  {/* Feature Highlights Pills */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {app.highlights.map((h, i) => {
                      const HIcon = h.icon;
                      return (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60"
                        >
                          <HIcon className="w-3 h-3 text-slate-400" />
                          <span>{h.label}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-4 border-t border-slate-800/80 relative z-10">
                  {hasAccess ? (
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
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-xl text-slate-500 font-semibold text-sm bg-slate-800/40 border border-slate-800 transition-all flex items-center justify-center gap-2 cursor-not-allowed"
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

      {/* Admin Quick Management Strip (Visible for Admin) */}
      {currentUser?.role === 'admin' && (
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
