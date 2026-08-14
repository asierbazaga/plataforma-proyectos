import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@plataforma.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = await login(email);
    if (!ok) {
      setError('Correo electrónico no registrado. Pruebe uno de los accesos rápidos.');
    }
  };

  const handleQuickLogin = async (quickEmail: string) => {
    setEmail(quickEmail);
    await login(quickEmail);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-panel bg-slate-900/80 border border-slate-800 rounded-3xl w-full max-w-lg p-8 shadow-2xl space-y-6 relative z-10">
        {/* Brand Logo Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto shadow-2xl shadow-indigo-500/30 ring-1 ring-white/20">
            <img src="/favicon.svg" alt="Plataforma Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">PLATAFORMA UNIFICADA</h1>
          <p className="text-xs text-slate-400">Control de Acceso Centralizado a tus 4 Aplicaciones</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-400">Correo Electrónico</label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Contraseña</label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Iniciar Sesión</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Quick Demo Access Buttons */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Accesos Rápidos de Prueba (Demo)
          </p>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleQuickLogin('admin@plataforma.com')}
              className="p-3 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-left transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-indigo-300">👑 Entrar como Administrador</p>
                <p className="text-[10px] text-slate-400">admin@plataforma.com (Acceso total + Matriz RBAC)</p>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => handleQuickLogin('usuario@plataforma.com')}
              className="p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-left transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-emerald-300">👤 Entrar como Usuario Estándar</p>
                <p className="text-[10px] text-slate-400">usuario@plataforma.com (Fitness & Gastos habilitados)</p>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => handleQuickLogin('invitado@plataforma.com')}
              className="p-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-left transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-amber-300">👁️ Entrar como Invitado</p>
                <p className="text-[10px] text-slate-400">invitado@plataforma.com (Solo lectura a Libros & Juegos)</p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
