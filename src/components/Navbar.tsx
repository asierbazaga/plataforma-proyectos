import React from 'react';
import { ShieldCheck, LogOut, User, Database, CheckCircle2, AlertTriangle, ArrowLeft, Dumbbell, DollarSign, BookOpen, BookMarked, FileText, Building, RotateCcw, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { storageService } from '../services/storageService';

interface NavbarProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab = 'dashboard', onSelectTab }) => {
  const { currentUser, allProfiles, switchUser, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

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
      case 'entrevistas':
        return {
          title: 'MECALUX TALENT & ENTREVISTAS',
          subtitle: 'Evaluación Team Leader & Excel',
          icon: <Building className="w-5 h-5 text-white" />,
          gradient: 'from-cyan-600 via-blue-600 to-indigo-600 shadow-blue-500/25',
          accent: 'hover:text-cyan-300'
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
    <header className={`h-16 border-b transition-colors duration-200 ${isDark ? 'border-slate-800 bg-[#0B0F19]/90' : 'border-slate-200 bg-white/90 shadow-sm'} backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40`}>
      {/* Dynamic Brand & Application Title */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Back Button on Mobile / Desktop when inside app */}
        {isInsideApp && (
          <button
            onClick={() => onSelectTab?.('dashboard')}
            title="Volver al Catálogo de Plataforma"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm group ${
              isDark
                ? 'bg-slate-800/90 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700 hover:border-indigo-400'
                : 'bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white border border-slate-200 hover:border-indigo-400'
            }`}
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
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr ${headerInfo.gradient} flex items-center justify-center shadow-lg ring-1 ring-white/10 flex-shrink-0 group-hover:scale-105 transition-transform`}>
              {headerInfo.icon}
            </div>
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 flex-shrink-0 group-hover:scale-105 transition-transform">
              <img src="/favicon.svg" alt="Plataforma Logo" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="min-w-0">
            <h1 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} text-xs sm:text-base tracking-tight leading-tight transition-colors truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none ${headerInfo.accent}`}>
              {headerInfo.title}
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-widest truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none">
              {headerInfo.subtitle}
            </p>
          </div>
        </button>

        {/* Database Status Indicator */}
        <div className={`hidden xs:flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full border text-[10px] sm:text-xs ${
          isDark ? 'bg-slate-900/90 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
          <Database className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
          {isSupabaseConfigured ? (
            <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Supabase</span> Conectado
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-500 font-medium" title="Modo Local Demo">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Local
            </span>
          )}
        </div>
      </div>

      {/* Right Actions: Theme Toggle, User Session & Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Botón para Alternar / Quitar Modo Oscuro */}
        <button
          onClick={toggleTheme}
          type="button"
          title={isDark ? "Quitar modo oscuro (Cambiar a modo claro)" : "Activar modo oscuro"}
          aria-label={isDark ? "Quitar modo oscuro" : "Activar modo oscuro"}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
            isDark
              ? 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-slate-700/80 hover:border-amber-400/50 hover:shadow-amber-500/10'
              : 'bg-white hover:bg-slate-50 text-indigo-600 border-slate-200 hover:border-indigo-400/50 hover:shadow-indigo-500/10'
          }`}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 transition-transform group-hover:rotate-45" />
              <span className="hidden sm:inline font-medium">Modo Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600 transition-transform group-hover:-rotate-12" />
              <span className="hidden sm:inline font-medium">Modo Oscuro</span>
            </>
          )}
        </button>

        {currentUser && (
          <>
            {/* Current Profile Badge */}
            <div className={`flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-xl border ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100 border-slate-200 shadow-sm'
            }`}>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-md ${
                currentUser.role === 'admin'
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-indigo-500/20'
                  : currentUser.email.includes('lore')
                  ? 'bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-pink-500/20'
                  : 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white'
              }`}>
                <span>{currentUser.role === 'admin' ? '👑' : currentUser.email.includes('lore') ? '🌸' : '👁️'}</span>
              </div>
              <div className="text-left hidden sm:block">
                <p className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentUser.full_name}</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">
                  Rol: <span className="text-indigo-500">{currentUser.role}</span>
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Cerrar Sesión"
              className={`p-2 rounded-xl border transition-all ${
                isDark
                  ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border-transparent hover:border-rose-500/20'
                  : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 border-transparent hover:border-rose-200'
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
