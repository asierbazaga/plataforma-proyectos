import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  User,
  AlertCircle,
  Smartphone,
  KeyRound,
  Shield,
  RefreshCw,
  Plus,
  Eye,
  EyeOff,
  UserPlus,
  Mail,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { webAuthnService, DeviceBiometricCredential } from '../services/webAuthnService';

export const Login: React.FC = () => {
  const { login, register, allProfiles } = useAuth();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Biometría
  const [registeredCredentials, setRegisteredCredentials] = useState<DeviceBiometricCredential[]>([]);
  const [isBiometricSupported, setIsBiometricSupported] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Login Form
  const [showPassword, setShowPassword] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('General');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Cargar estado biométrico
  useEffect(() => {
    let timer: any;
    const checkAndAutoTrigger = async () => {
      const available = await webAuthnService.isBiometricAvailable();
      setIsBiometricSupported(available);
      const creds = webAuthnService.getRegisteredCredentials();
      setRegisteredCredentials(creds);

      if (creds.length > 0) {
        timer = setTimeout(() => {
          handleScanPhoneFingerprint();
        }, 300);
      }
    };
    checkAndAutoTrigger();
    return () => clearTimeout(timer);
  }, []);

  const handleScanPhoneFingerprint = async () => {
    setError('');
    setStatusMessage('Coloca tu dedo en el sensor de huella de tu teléfono...');
    setLoading(true);

    try {
      const res = await webAuthnService.authenticateWithDeviceBiometric();

      if (res.success && res.userEmail) {
        setStatusMessage(`¡Huella verificada por hardware! Accediendo como ${res.userName || res.userEmail}...`);

        setTimeout(async () => {
          const result = await login(res.userEmail!);
          if (!result.success) {
            setError(result.error || 'Error al sincronizar sesión tras la lectura biométrica.');
            setLoading(false);
            setStatusMessage('');
          }
        }, 400);
      } else {
        setLoading(false);
        setError(res.error || 'No se pudo verificar la huella en el sensor del dispositivo.');
        setStatusMessage('');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error al comunicarse con el sensor biométrico.');
      setStatusMessage('');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginIdentifier.trim()) return;

    setLoading(true);
    try {
      const result = await login(loginIdentifier.trim(), loginPassword || undefined);
      if (!result.success) {
        setError(result.error || 'Credenciales no válidas.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regName.trim() || !regEmail.trim()) {
      setError('Por favor, introduce tu nombre y correo electrónico.');
      return;
    }

    if (regPassword.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const result = await register(regName, regEmail, regPassword, regDepartment);
      if (!result.success) {
        setError(result.error || 'No se pudo completar el registro.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Luces de ambiente sutiles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-[#0F1422] border border-white/10 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-6 relative z-10">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-indigo-600 p-0.5 mx-auto shadow-xl shadow-[#FF6B00]/20">
            <div className="w-full h-full bg-[#0F1422] rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-[#FF6B00]" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">PLATAFORMA UNIFICADA</h1>
          <p className="text-xs text-slate-400">Control de Acceso Seguro & Ecosistema de Apps</p>
        </div>

        {/* Selector de Modo: Login vs Registro */}
        <div className="grid grid-cols-2 p-1 bg-[#070A11] rounded-2xl border border-white/5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError('');
            }}
            className={`py-2.5 rounded-xl transition-all ${
              authMode === 'login'
                ? 'bg-[#FF6B00] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setError('');
            }}
            className={`py-2.5 rounded-xl transition-all ${
              authMode === 'register'
                ? 'bg-[#FF6B00] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Mensajes de Estado o Error */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {statusMessage && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* 1. MODO INICIAR SESIÓN */}
        {authMode === 'login' && (
          <div className="space-y-5">
            {/* Botón Biométrico si está soportado */}
            {isBiometricSupported && registeredCredentials.length > 0 && (
              <button
                type="button"
                onClick={handleScanPhoneFingerprint}
                disabled={loading}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 border border-indigo-500/30 hover:border-indigo-500/60 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Desbloqueo Biométrico</p>
                    <p className="text-[11px] text-slate-400">Usar huella o Face ID de este dispositivo</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {/* Formulario Clásico */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Usuario o Correo Electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="asier.bazaga@plataforma.com"
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    className="w-full bg-[#070A11] border border-white/5 rounded-xl pl-10 pr-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Introduce tu contraseña"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full bg-[#070A11] border border-white/5 rounded-xl pl-10 pr-10 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF6B00]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#FF6B00] hover:bg-[#FA8500] text-white font-black rounded-xl shadow-lg shadow-[#FF6B00]/20 transition-all flex items-center justify-center gap-2 text-sm mt-2"
              >
                {loading ? 'Verificando...' : 'Iniciar Sesión'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* 2. MODO CREAR CUENTA (REGISTRO PÚBLICO) */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Nombre Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Mendoza"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="w-full bg-[#070A11] border border-white/5 rounded-xl pl-10 pr-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="carlos@empresa.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full bg-[#070A11] border border-white/5 rounded-xl pl-10 pr-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Departamento / Área (Opcional)</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ej. Finanzas, Marketing, etc."
                  value={regDepartment}
                  onChange={e => setRegDepartment(e.target.value)}
                  className="w-full bg-[#070A11] border border-white/5 rounded-xl pl-10 pr-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Mín. 4 caracteres"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full bg-[#070A11] border border-white/5 rounded-xl pl-10 pr-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Confirmar</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Repite la clave"
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    className="w-full bg-[#070A11] border border-white/5 rounded-xl pl-10 pr-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRegPassword}
                  onChange={e => setShowRegPassword(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-[#FF6B00]"
                />
                Mostrar contraseñas
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#30D158] hover:bg-emerald-600 text-black font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm mt-2"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creando cuenta...' : 'Crear Cuenta y Entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
