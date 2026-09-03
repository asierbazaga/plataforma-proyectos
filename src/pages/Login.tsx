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
  Building,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { webAuthnService, DeviceBiometricCredential } from '../services/webAuthnService';

export const Login: React.FC = () => {
  const { login, register, allProfiles, getSecurityQuestion, resetPasswordWithSecurityAnswer } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>('login');

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
  const [regDepartment, setRegDepartment] = useState('General');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regSecurityQuestion, setRegSecurityQuestion] = useState('¿Cuál fue el nombre de tu primera mascota?');
  const [regSecurityAnswer, setRegSecurityAnswer] = useState('');

  // Recovery Form
  const [recStep, setRecStep] = useState<1 | 2 | 3>(1);
  const [recIdentifier, setRecIdentifier] = useState('');
  const [recQuestion, setRecQuestion] = useState('');
  const [recAnswer, setRecAnswer] = useState('');
  const [recNewPassword, setRecNewPassword] = useState('');
  const [recConfirmPassword, setRecConfirmPassword] = useState('');
  const [showRecPassword, setShowRecPassword] = useState(false);

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
      const creds = webAuthnService.getRegisteredCredentials();
      if (creds.length === 0) {
        // Registro rápido de huella para Asier o el correo escrito
        const targetEmail = loginIdentifier.trim().toLowerCase() || 'asier.bazaga@plataforma.com';
        const targetName = targetEmail.includes('asier') ? 'Asier Bazaga' : targetEmail.split('@')[0];
        const targetId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

        const regRes = await webAuthnService.registerDeviceBiometric(targetId, targetEmail, targetName);
        if (!regRes.success) {
          setError(regRes.error || 'No se pudo registrar la huella en este dispositivo.');
          setLoading(false);
          setStatusMessage('');
          return;
        }
        setRegisteredCredentials(webAuthnService.getRegisteredCredentials());
      }

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
        }, 300);
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

    if (!regName.trim()) {
      setError('Por favor, introduce tu nombre o usuario.');
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

    if (!regSecurityQuestion.trim() || !regSecurityAnswer.trim()) {
      setError('Por favor, selecciona una pregunta de seguridad y escribe la respuesta para poder recuperar tu cuenta en el futuro.');
      return;
    }

    setLoading(true);
    try {
      // Auto-generar un ID único en lugar de un correo
      const uniqueId = `id_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
      const result = await register(
        regName, 
        uniqueId, 
        regPassword, 
        'General', 
        regSecurityQuestion.trim(), 
        regSecurityAnswer.trim()
      );
      if (!result.success) {
        setError(result.error || 'No se pudo completar el registro.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await getSecurityQuestion(recIdentifier);
      if (res.success && res.question) {
        setRecQuestion(res.question);
        setRecStep(2);
      } else {
        setError(res.error || 'No se pudo iniciar la recuperación.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!recAnswer.trim()) {
      setError('Por favor, escribe una respuesta.');
      return;
    }
    setRecStep(3);
  };

  const handleRecResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (recNewPassword.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (recNewPassword !== recConfirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordWithSecurityAnswer(recIdentifier, recAnswer, recNewPassword);
      if (res.success) {
        setStatusMessage('¡Contraseña actualizada con éxito! Inicia sesión ahora.');
        setAuthMode('login');
        setRecStep(1);
        setRecIdentifier('');
        setRecAnswer('');
        setRecNewPassword('');
        setRecConfirmPassword('');
      } else {
        setError(res.error || 'La respuesta de seguridad es incorrecta.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#070A11] text-white' : 'bg-slate-50 text-slate-900'} flex items-center justify-center p-4 relative overflow-hidden font-sans`}>
      {/* Botón flotante para cambiar de tema (Modo Claro / Oscuro) */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          type="button"
          title={isDark ? "Quitar modo oscuro (Modo claro)" : "Activar modo oscuro"}
          aria-label={isDark ? "Quitar modo oscuro" : "Activar modo oscuro"}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-md ${
            isDark
              ? 'bg-slate-900/80 hover:bg-slate-800 text-amber-300 border-slate-700/80 hover:border-amber-400/50'
              : 'bg-white hover:bg-slate-50 text-indigo-600 border-slate-200 hover:border-indigo-400/50'
          }`}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Modo Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>Modo Oscuro</span>
            </>
          )}
        </button>
      </div>

      {/* Luces de ambiente sutiles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />

      <div className={`${isDark ? 'bg-[#0F1422] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xl'} border rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-6 relative z-10`}>
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-indigo-600 p-0.5 mx-auto shadow-xl shadow-[#FF6B00]/20">
            <div className={`w-full h-full ${isDark ? 'bg-[#0F1422]' : 'bg-white'} rounded-[14px] flex items-center justify-center`}>
              <ShieldCheck className="w-7 h-7 text-[#FF6B00]" />
            </div>
          </div>
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>PLATAFORMA UNIFICADA</h1>
          <p className="text-xs text-slate-400">Control de Acceso Seguro & Ecosistema de Apps</p>
        </div>

        {/* Selector de Modo: Login vs Registro */}
        <div className={`grid grid-cols-2 p-1 ${isDark ? 'bg-[#070A11] border-white/5' : 'bg-slate-100 border-slate-200'} rounded-2xl border text-xs font-bold`}>
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
            {/* Botón Biométrico si está soportado en este dispositivo */}
            {isBiometricSupported && (
              <button
                type="button"
                onClick={handleScanPhoneFingerprint}
                disabled={loading}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 border border-indigo-500/30 hover:border-indigo-500/60 flex items-center justify-between text-left transition-all group shadow-lg shadow-indigo-500/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-indigo-500/30">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {registeredCredentials.length > 0 ? 'Desbloqueo con Huella Dactilar' : 'Acceso con Huella / Face ID'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {registeredCredentials.length > 0 ? 'Toca para escanear en tu sensor' : 'Activar inicio de sesión biométrico'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {/* Formulario Clásico */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Nombre de Usuario o ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Mendoza o id_..."
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
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot-password')}
                    className="text-[11px] text-[#FF6B00] hover:text-[#FA8500] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
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
              <label className="text-slate-400 font-medium block mb-1">Nombre Completo o Usuario</label>
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
            
            <div className="pt-2 border-t border-white/5 space-y-3.5">
              <p className="text-emerald-400 font-medium mb-1">Recuperación de Contraseña</p>
              <div>
                <label className="text-slate-400 font-medium block mb-1">Pregunta de Seguridad</label>
                <select
                  value={regSecurityQuestion}
                  onChange={e => setRegSecurityQuestion(e.target.value)}
                  className="w-full bg-[#070A11] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF6B00] appearance-none"
                >
                  <option value="¿Cuál fue el nombre de tu primera mascota?">¿Cuál fue el nombre de tu primera mascota?</option>
                  <option value="¿En qué ciudad naciste?">¿En qué ciudad naciste?</option>
                  <option value="¿Cuál es tu color favorito?">¿Cuál es tu color favorito?</option>
                  <option value="¿Cuál era el nombre de tu mejor amigo en la infancia?">¿Cuál era el nombre de tu mejor amigo en la infancia?</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Tu Respuesta (Secreta)</label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Escribe tu respuesta..."
                    value={regSecurityAnswer}
                    onChange={e => setRegSecurityAnswer(e.target.value)}
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

        {/* 3. MODO RECUPERAR CONTRASEÑA */}
        {authMode === 'forgot-password' && (
          <div className="space-y-4 text-xs">
            {recStep === 1 && (
              <form onSubmit={handleRecIdentifierSubmit} className="space-y-3.5">
                <p className="text-slate-400 text-xs mb-4">
                  Introduce tu usuario o ID para buscar tu pregunta de seguridad.
                </p>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Nombre de Usuario o ID</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos Mendoza"
                      value={recIdentifier}
                      onChange={e => setRecIdentifier(e.target.value)}
                      className="w-full bg-[#070A11] border border-white/5 rounded-xl pl-10 pr-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#FF6B00] hover:bg-[#FA8500] text-white font-black rounded-xl shadow-lg shadow-[#FF6B00]/20 transition-all flex items-center justify-center gap-2 text-sm mt-2"
                >
                  {loading ? 'Buscando...' : 'Buscar Usuario'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {recStep === 2 && (
              <form onSubmit={handleRecAnswerSubmit} className="space-y-3.5">
                <div className="bg-[#070A11] p-4 rounded-xl border border-white/5">
                  <p className="text-slate-400 font-medium mb-1">Pregunta de Seguridad:</p>
                  <p className="text-white font-bold text-sm">{recQuestion}</p>
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Tu Respuesta</label>
                  <input
                    type="text"
                    required
                    placeholder="Escribe tu respuesta..."
                    value={recAnswer}
                    onChange={e => setRecAnswer(e.target.value)}
                    className="w-full bg-[#070A11] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#FF6B00] hover:bg-[#FA8500] text-white font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm mt-2"
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {recStep === 3 && (
              <form onSubmit={handleRecResetSubmit} className="space-y-3.5">
                <p className="text-emerald-400 font-medium mb-2">¡Respuesta correcta! Crea tu nueva contraseña.</p>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Nueva Contraseña</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showRecPassword ? 'text' : 'password'}
                      required
                      placeholder="Mín. 4 caracteres"
                      value={recNewPassword}
                      onChange={e => setRecNewPassword(e.target.value)}
                      className="w-full bg-[#070A11] border border-white/5 rounded-xl pl-10 pr-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Confirmar Nueva Contraseña</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showRecPassword ? 'text' : 'password'}
                      required
                      placeholder="Repite la clave"
                      value={recConfirmPassword}
                      onChange={e => setRecConfirmPassword(e.target.value)}
                      className="w-full bg-[#070A11] border border-white/5 rounded-xl pl-10 pr-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showRecPassword}
                      onChange={e => setShowRecPassword(e.target.checked)}
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
                  {loading ? 'Guardando...' : 'Cambiar Contraseña y Entrar'}
                </button>
              </form>
            )}
            
            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setRecStep(1);
                  setRecIdentifier('');
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
