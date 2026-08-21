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
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { webAuthnService, DeviceBiometricCredential } from '../services/webAuthnService';

export const Login: React.FC = () => {
  const { login, allProfiles } = useAuth();
  
  const [registeredCredentials, setRegisteredCredentials] = useState<DeviceBiometricCredential[]>([]);
  const [isBiometricSupported, setIsBiometricSupported] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Modo de registro de huella en dispositivo nuevo
  const [isRegisteringMode, setIsRegisteringMode] = useState(false);
  const [selectedUserForRegister, setSelectedUserForRegister] = useState<string>('asier.bazaga@plataforma.com');

  // Modo manual con contraseña
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('admin123');

  // Cargar estado biométrico del hardware y disparar automáticamente el sensor del teléfono
  useEffect(() => {
    let timer: any;
    const checkAndAutoTrigger = async () => {
      const available = await webAuthnService.isBiometricAvailable();
      setIsBiometricSupported(available);
      const creds = webAuthnService.getRegisteredCredentials();
      setRegisteredCredentials(creds);
      
      if (creds.length > 0) {
        // Disparo automático e inmediato de la huella del teléfono
        timer = setTimeout(() => {
          handleScanPhoneFingerprint();
        }, 250);
      } else {
        setIsRegisteringMode(true);
      }
    };
    checkAndAutoTrigger();
    return () => clearTimeout(timer);
  }, []);

  // 1. DISPARAR EL SENSOR DE HUELLAS REAL DEL TELÉFONO (WebAuthn Platform Authenticator)
  const handleScanPhoneFingerprint = async () => {
    setError('');
    setStatusMessage('Coloca tu dedo en el sensor de huella de tu teléfono...');
    setLoading(true);

    try {
      const res = await webAuthnService.authenticateWithDeviceBiometric();

      if (res.success && res.userEmail) {
        setStatusMessage(`¡Huella verificada por hardware! Accediendo como ${res.userName || res.userEmail}...`);
        
        setTimeout(async () => {
          const ok = await login(res.userEmail!);
          if (!ok) {
            setError('Error al sincronizar sesión tras la lectura biométrica.');
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
      setError(err.message || 'Error al comunicarse con el sensor biométrico del teléfono.');
      setStatusMessage('');
    }
  };

  // 2. REGISTRAR LA HUELLA DEL HARDWARE DE ESTE TELÉFONO PARA UN USUARIO
  const handleRegisterDeviceFingerprint = async () => {
    setError('');
    setStatusMessage('Coloca tu dedo en el sensor de huella de tu teléfono para vincularlo...');
    setLoading(true);

    const userProfile = allProfiles.find(p => p.email.toLowerCase() === selectedUserForRegister.toLowerCase()) 
      || allProfiles[0];

    if (!userProfile) {
      setError('Selecciona un usuario válido.');
      setLoading(false);
      return;
    }

    try {
      const res = await webAuthnService.registerDeviceBiometric(
        userProfile.id,
        userProfile.email,
        userProfile.full_name
      );

      if (res.success) {
        const updated = webAuthnService.getRegisteredCredentials();
        setRegisteredCredentials(updated);
        setIsRegisteringMode(false);
        setStatusMessage(`¡Dispositivo vinculado con éxito a ${userProfile.full_name}! Iniciando sesión...`);
        
        setTimeout(async () => {
          await login(userProfile.email);
        }, 500);
      } else {
        setLoading(false);
        setError(res.error || 'No se pudo registrar la huella en el hardware del teléfono.');
        setStatusMessage('');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error durante el registro biométrico.');
      setStatusMessage('');
    }
  };

  // 3. LOGIN MANUAL CLÁSICO
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!usernameInput.trim()) return;
    
    const ok = await login(usernameInput.trim());
    if (!ok) {
      setError('Usuario o contraseña no válidos.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-6 relative z-10 text-center">
        {/* Logo & Header */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto shadow-2xl shadow-indigo-500/30 ring-1 ring-white/20">
            <img src="/favicon.svg" alt="Plataforma Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">PLATAFORMA UNIFICADA</h1>
          <p className="text-xs text-slate-400">Sensor de Huella Dactilar del Dispositivo</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {statusMessage && (
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold text-center flex items-center justify-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* 1. MODO PRINCIPAL: SENSOR REAL DEL TELÉFONO */}
        {!showManualLogin && !isRegisteringMode && (
          <div className="space-y-6 py-2">
            {/* Visual Hardware Sensor Pad */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <button
                type="button"
                onClick={handleScanPhoneFingerprint}
                disabled={loading}
                className="relative cursor-pointer group focus:outline-none focus:ring-0"
              >
                <div className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 ${
                  loading 
                    ? 'bg-indigo-600/30 ring-4 ring-indigo-500 shadow-[0_0_35px_#6366F1] animate-pulse scale-105' 
                    : 'bg-slate-800/90 ring-2 ring-slate-700 hover:ring-indigo-500 hover:bg-slate-800 hover:shadow-[0_0_25px_#6366F1]'
                }`}>
                  <Fingerprint className={`w-20 h-20 transition-all duration-300 ${
                    loading 
                      ? 'text-indigo-400 animate-pulse scale-110' 
                      : 'text-indigo-400 group-hover:scale-110 group-hover:text-indigo-300'
                  }`} />
                </div>
              </button>

              <div className="space-y-1">
                <p className="text-sm font-black text-white">
                  {loading ? 'Leyendo sensor del teléfono...' : 'Sensor de Huellas del Teléfono'}
                </p>
                <p className="text-xs text-slate-400">
                  {registeredCredentials.length > 0 
                    ? `Dispositivo vinculado a: ${registeredCredentials.map(c => c.userName).join(', ')}`
                    : 'Pulsa para activar el sensor nativo de tu teléfono'}
                </p>
              </div>
            </div>

            {/* Botón de activación del sensor */}
            <button
              type="button"
              onClick={handleScanPhoneFingerprint}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <Fingerprint className="w-5 h-5" />
              <span>{loading ? 'Esperando Huella en el Teléfono...' : 'Acceder con la Huella del Teléfono'}</span>
            </button>

            {/* Opciones inferiores */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => { setIsRegisteringMode(true); setError(''); }}
                className="text-slate-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Vincular otra huella</span>
              </button>

              <button
                type="button"
                onClick={() => { setShowManualLogin(true); setError(''); }}
                className="text-slate-400 hover:text-white font-semibold transition-colors"
              >
                Acceder con contraseña →
              </button>
            </div>
          </div>
        )}

        {/* 2. MODO VINCULAR HUELLA DE ESTE TELÉFONO (Primera vez o cambio de usuario) */}
        {!showManualLogin && isRegisteringMode && (
          <div className="space-y-5 text-left py-2">
            <div className="space-y-1.5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-2">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Vincular Sensor de este Teléfono</h3>
              <p className="text-xs text-slate-400">
                Selecciona quién usa este teléfono para registrar su huella en el hardware
              </p>
            </div>

            {/* Selector de Usuario para este hardware */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setSelectedUserForRegister('asier.bazaga@plataforma.com')}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  selectedUserForRegister.includes('asier')
                    ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-sm ring-1 ring-white/10">
                    👑
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Asier Bazaga</p>
                    <p className="text-[10px] text-slate-400">Super Administrador (Control Total)</p>
                  </div>
                </div>
                {selectedUserForRegister.includes('asier') && (
                  <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedUserForRegister('lore@plataforma.com')}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  selectedUserForRegister.includes('lore')
                    ? 'bg-pink-950/60 border-pink-500 shadow-lg shadow-pink-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-600/30 text-pink-300 font-bold flex items-center justify-center text-sm ring-1 ring-white/10">
                    🌸
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Lore</p>
                    <p className="text-[10px] text-slate-400">Comercial Drasanvi & Farmacias</p>
                  </div>
                </div>
                {selectedUserForRegister.includes('lore') && (
                  <CheckCircle2 className="w-5 h-5 text-pink-400" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleRegisterDeviceFingerprint}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Fingerprint className="w-4 h-4" />
              <span>{loading ? 'Abriendo sensor del teléfono...' : 'Tocar Sensor del Teléfono para Registrar'}</span>
            </button>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              {registeredCredentials.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsRegisteringMode(false)}
                  className="text-slate-400 hover:text-white font-semibold"
                >
                  ← Volver a Escanear
                </button>
              )}

              <button
                type="button"
                onClick={() => { setShowManualLogin(true); setError(''); }}
                className="text-slate-400 hover:text-white font-semibold ml-auto"
              >
                Acceder con contraseña →
              </button>
            </div>
          </div>
        )}

        {/* 3. MODO ALTERNATIVO CON CONTRASEÑA */}
        {showManualLogin && (
          <form onSubmit={handleManualSubmit} className="space-y-4 text-left py-2">
            <div>
              <label className="text-xs font-semibold text-slate-400">Usuario o Nombre (Ej. "asier" o "lore")</label>
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
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
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

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setShowManualLogin(false); setError(''); }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center justify-center gap-1.5 mx-auto"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Volver al Sensor de Huella</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
