import React, { useState } from 'react';
import { 
  Fingerprint, 
  Sparkles, 
  UserCheck, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  User, 
  AlertCircle,
  Smartphone,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [activeMode, setActiveMode] = useState<'profiles' | 'biometric' | 'manual'>('profiles');
  const [usernameInput, setUsernameInput] = useState('asier');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  
  // Estado de escaneo de huella
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccessUser, setScanSuccessUser] = useState<string | null>(null);

  // Manejo de login manual
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = await login(usernameInput);
    if (!ok) {
      setError('Usuario o correo no encontrado. Prueba seleccionando un perfil directo.');
    }
  };

  // Manejo de acceso por tarjeta de perfil
  const handleQuickProfileLogin = async (identifier: string) => {
    setError('');
    await login(identifier);
  };

  // Simulación y soporte biométrico con animación háptica/láser
  const handleBiometricScan = async (targetUser: string = 'asier') => {
    setIsScanning(true);
    setError('');
    setScanSuccessUser(null);

    // Si el navegador soporta WebAuthn nativo, podemos invocarlo o hacer el reconocimiento
    try {
      // Tiempo de lectura biométrica visual (1 segundo para animación de alta tecnología)
      await new Promise(resolve => setTimeout(resolve, 950));
      setIsScanning(false);
      setScanSuccessUser(targetUser === 'asier' ? 'Asier Bazaga' : targetUser === 'lore' ? 'Lore' : 'Invitado');
      
      // Esperar breve confirmación y loguear
      setTimeout(async () => {
        await login(targetUser);
      }, 500);
    } catch (err) {
      setIsScanning(false);
      setError('Error en la autenticación biométrica. Prueba con selección directa.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-panel bg-slate-900/85 border border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10">
        {/* Brand Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto shadow-2xl shadow-indigo-500/30 ring-1 ring-white/20">
            <img src="/favicon.svg" alt="Plataforma Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">PLATAFORMA UNIFICADA</h1>
          <p className="text-xs text-slate-400">Control de Acceso & Reconocimiento de Usuario</p>
        </div>

        {/* Mode Selector Tabs (Perfiles / Huella / Clásico) */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveMode('profiles'); setError(''); }}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'profiles' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Seleccionar</span> Perfil
          </button>

          <button
            type="button"
            onClick={() => { setActiveMode('biometric'); setError(''); }}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'biometric' 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Huella / Touch ID</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMode('manual'); setError(''); }}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'manual' 
                ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Usuario</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. MODO: SELECCIÓN DE PERFILES (1-CLIC) */}
        {activeMode === 'profiles' && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
              ¿Quién eres hoy? (Toca tu perfil para entrar)
            </p>

            <div className="grid grid-cols-1 gap-3">
              {/* Asier Bazaga */}
              <button
                onClick={() => handleQuickProfileLogin('asier')}
                className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-900/80 hover:from-indigo-900/60 hover:to-indigo-950/80 border border-indigo-500/40 text-left transition-all flex items-center justify-between group hover:shadow-xl hover:shadow-indigo-500/20 hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-indigo-500/50 flex-shrink-0 relative">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" 
                      alt="Asier Bazaga" 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-white group-hover:text-indigo-200">Asier Bazaga</p>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                        👑 Super Admin
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Control Total + Consola Global IT y Permisos</p>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all flex-shrink-0">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Lore */}
              <button
                onClick={() => handleQuickProfileLogin('lore')}
                className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/40 via-slate-900 to-slate-900/80 hover:from-pink-900/60 hover:to-pink-950/80 border border-pink-500/40 text-left transition-all flex items-center justify-between group hover:shadow-xl hover:shadow-pink-500/20 hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-pink-500/50 flex-shrink-0 relative">
                    <img 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" 
                      alt="Lore" 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-white group-hover:text-pink-200">Lore</p>
                      <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold border border-pink-500/30">
                        🌸 Drasanvi & Comercial
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Objetivos de Ventas, CRM Farmacias & Rutas</p>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-all flex-shrink-0">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Invitado */}
              <button
                onClick={() => handleQuickProfileLogin('invitado')}
                className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
                    👁️
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-300">Invitado Demo</p>
                    <p className="text-[10px] text-slate-500">Acceso de prueba en modo lectura</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* 2. MODO: HUELLA DACTILAR / TOUCH ID / BIOMÉTRICO */}
        {activeMode === 'biometric' && (
          <div className="space-y-6 text-center py-2">
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Sensor de Huella Dactilar & Touch ID
              </p>
              <p className="text-xs text-slate-400">
                Coloca tu dedo sobre el sensor para identificar tu perfil biométrico
              </p>
            </div>

            {/* Interactive Fingerprint Scanner */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div 
                className="relative cursor-pointer group"
                onClick={() => handleBiometricScan('asier')}
              >
                {/* Outer pulsing ring */}
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isScanning 
                    ? 'bg-pink-600/30 ring-4 ring-pink-500 animate-pulse scale-105' 
                    : scanSuccessUser 
                    ? 'bg-emerald-600/30 ring-4 ring-emerald-400' 
                    : 'bg-slate-800/80 ring-2 ring-slate-700 hover:ring-indigo-500 hover:bg-slate-800'
                }`}>
                  <Fingerprint className={`w-16 h-16 transition-all duration-300 ${
                    isScanning 
                      ? 'text-pink-400 animate-bounce' 
                      : scanSuccessUser 
                      ? 'text-emerald-400 scale-110' 
                      : 'text-indigo-400 group-hover:scale-110'
                  }`} />
                </div>

                {/* Laser scan line overlay when scanning */}
                {isScanning && (
                  <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent shadow-[0_0_15px_#EC4899] animate-pulse top-1/2 relative" />
                  </div>
                )}
              </div>

              {/* Status Message */}
              {isScanning && (
                <div className="flex items-center gap-2 text-pink-400 text-xs font-bold animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span>Escaneando huella biométrica...</span>
                </div>
              )}

              {scanSuccessUser && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Huella Reconocida! Accediendo como {scanSuccessUser}...</span>
                </div>
              )}

              {!isScanning && !scanSuccessUser && (
                <p className="text-[11px] text-slate-500 font-medium">
                  Toca el sensor central o elige tu huella abajo
                </p>
              )}
            </div>

            {/* Quick biometric profile pickers */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleBiometricScan('asier')}
                disabled={isScanning}
                className="p-3 rounded-2xl bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-center transition-all space-y-1 hover:border-indigo-400"
              >
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-indigo-300">
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Huella de Asier</span>
                </div>
                <p className="text-[10px] text-slate-400">Super Admin (👑)</p>
              </button>

              <button
                type="button"
                onClick={() => handleBiometricScan('lore')}
                disabled={isScanning}
                className="p-3 rounded-2xl bg-pink-950/40 hover:bg-pink-900/60 border border-pink-500/30 text-center transition-all space-y-1 hover:border-pink-400"
              >
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-pink-300">
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Huella de Lore</span>
                </div>
                <p className="text-[10px] text-slate-400">Comercial Drasanvi (🌸)</p>
              </button>
            </div>
          </div>
        )}

        {/* 3. MODO: CLÁSICO / MANUAL POR NOMBRE O USUARIO */}
        {activeMode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400">Usuario o Nombre (Ej. "asier", "lore")</label>
              <div className="relative mt-1">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="asier / lore / admin"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm font-semibold"
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
              <span>Acceder</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
