import React from 'react';
import { ShieldCheck, LogOut, User, Database, CheckCircle2, AlertTriangle, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab = 'dashboard', onSelectTab }) => {
  const { currentUser, allProfiles, switchUser, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0B0F19]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Return to Platform */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Brand Link - Click to Return to Dashboard */}
        <button
          onClick={() => onSelectTab?.('dashboard')}
          title="Ir al Catálogo de Plataforma"
          className="flex items-center gap-2.5 text-left group hover:opacity-90 transition-opacity focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 flex-shrink-0 group-hover:scale-105 transition-transform">
            <img src="/favicon.svg" alt="Plataforma Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm sm:text-base tracking-tight leading-tight group-hover:text-indigo-300 transition-colors">
              PLATAFORMA PROYECTOS
            </h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
              Portal Único Unificado
            </p>
          </div>
        </button>

        {/* Prominent Back to Platform Button when inside any app */}
        {currentTab !== 'dashboard' && (
          <button
            onClick={() => onSelectTab?.('dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold transition-all shadow-sm shadow-indigo-500/10 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Volver a la Plataforma</span>
            <span className="sm:hidden">Catálogo</span>
          </button>
        )}

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
                {p.role === 'admin' ? '👑 Admin' : p.role === 'user' ? '👤 Usuario' : '👁️ Invitado'}
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
