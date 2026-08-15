import React from 'react';
import { ShieldCheck, LogOut, User, Database, CheckCircle2, AlertTriangle, ArrowLeft, Dumbbell, DollarSign, BookOpen, BookMarked, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab = 'dashboard', onSelectTab }) => {
  const { currentUser, allProfiles, switchUser, logout } = useAuth();

  const getHeaderInfo = () => {
    switch (currentTab) {
      case 'fitness':
        return {
          title: 'APP FITNESS & SALUD',
          subtitle: 'Salud, Rendimiento & Rutinas',
          icon: <Dumbbell className="w-5 h-5 text-white" />,
          gradient: 'from-orange-600 to-amber-500 shadow-orange-500/25',
          accent: 'hover:text-orange-300'
        };
      case 'gastos':
        return {
          title: 'APP GASTOS & FINANZAS',
          subtitle: 'Control Presupuestario & Balances',
          icon: <DollarSign className="w-5 h-5 text-white" />,
          gradient: 'from-emerald-600 to-teal-500 shadow-emerald-500/25',
          accent: 'hover:text-emerald-300'
        };
      case 'libros-juegos':
        return {
          title: 'APP LIBROS & JUEGOS',
          subtitle: 'Biblioteca Digital & Gaming',
          icon: <BookOpen className="w-5 h-5 text-white" />,
          gradient: 'from-purple-600 to-pink-500 shadow-purple-500/25',
          accent: 'hover:text-purple-300'
        };
      case 'lore':
        return {
          title: 'APP LORE & RUTAS',
          subtitle: 'Mapa Comercial & Clientes',
          icon: <BookMarked className="w-5 h-5 text-white" />,
          gradient: 'from-blue-600 to-cyan-500 shadow-blue-500/25',
          accent: 'hover:text-blue-300'
        };
      case 'permissions':
        return {
          title: 'MATRIZ DE PERMISOS',
          subtitle: 'Administración de Roles RBAC',
          icon: <ShieldCheck className="w-5 h-5 text-white" />,
          gradient: 'from-indigo-600 to-purple-600 shadow-indigo-500/25',
          accent: 'hover:text-indigo-300'
        };
      case 'logs':
        return {
          title: 'REGISTRO DE ACTIVIDAD',
          subtitle: 'Auditoría de Eventos del Sistema',
          icon: <FileText className="w-5 h-5 text-white" />,
          gradient: 'from-slate-700 to-indigo-700 shadow-indigo-500/20',
          accent: 'hover:text-slate-300'
        };
      default:
        return {
          title: 'PLATAFORMA PROYECTOS',
          subtitle: 'Portal Único Unificado',
          icon: null,
          gradient: 'from-indigo-600 via-purple-600 to-pink-500 shadow-indigo-500/25',
          accent: 'hover:text-indigo-300'
        };
    }
  };

  const headerInfo = getHeaderInfo();
  const isInsideApp = currentTab !== 'dashboard';

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0B0F19]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Dynamic Brand & Application Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Back Button on Mobile / Desktop when inside app */}
        {isInsideApp && (
          <button
            onClick={() => onSelectTab?.('dashboard')}
            title="Volver al Catálogo de Plataforma"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700 hover:border-indigo-400 text-xs font-bold transition-all shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Catálogo</span>
          </button>
        )}

        {/* Dynamic App Brand */}
        <button
          onClick={() => onSelectTab?.('dashboard')}
          title={isInsideApp ? "Volver al Catálogo" : "Plataforma de Proyectos"}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          {headerInfo.icon ? (
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${headerInfo.gradient} flex items-center justify-center shadow-lg ring-1 ring-white/10 flex-shrink-0 group-hover:scale-105 transition-transform`}>
              {headerInfo.icon}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 flex-shrink-0 group-hover:scale-105 transition-transform">
              <img src="/favicon.svg" alt="Plataforma Logo" className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            <h1 className={`font-bold text-white text-sm sm:text-base tracking-tight leading-tight transition-colors ${headerInfo.accent}`}>
              {headerInfo.title}
            </h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
              {headerInfo.subtitle}
            </p>
          </div>
        </button>

        {/* Database Status Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          {isSupabaseConfigured ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              DB Conectada
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400 font-medium" title="Modo Local Demo">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Modo Local
            </span>
          )}
        </div>
      </div>

      {/* User Session & Role Switcher */}
      {currentUser && (
        <div className="flex items-center gap-4">
          {/* Quick Role Switcher */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 pl-2 font-medium">Cambiar Perfil:</span>
            {allProfiles.map(p => (
              <button
                key={p.id}
                onClick={() => switchUser(p)}
                className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                  currentUser.id === p.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {p.role === 'admin' 
                  ? `👑 ${p.full_name.split(' ')[0]}` 
                  : p.role === 'user' 
                  ? `👤 ${p.full_name.split(' ')[0]}` 
                  : `👁️ ${p.full_name.split(' ')[0]}`}
              </button>
            ))}
          </div>

          {/* Current Profile Badge */}
          <div className="flex items-center gap-3 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.full_name}
              className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/40"
            />
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-white leading-tight">{currentUser.full_name}</p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">
                Rol: <span className="text-indigo-400">{currentUser.role}</span>
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Cerrar Sesión"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      )}
    </header>
  );
};
