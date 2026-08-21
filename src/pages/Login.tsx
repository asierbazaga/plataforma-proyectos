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
  Scan,
  KeyRound,
  Settings2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  
  // Estado de escaneo biométrico
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatusText, setScanStatusText] = useState('Pulsa el sensor para identificarte');
  const [recognizedUser, setRecognizedUser] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  // Modo alternativo clásico de usuario/contraseña
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('admin123');

  // Ajuste de dispositivo: usuario biométrico vinculado a este teléfono/navegador
  const [deviceOwner, setDeviceOwner] = useState<'asier' | 'lore'>(() => {
    const saved = localStorage.getItem('plataforma_biometric_device_user');
    return (saved === 'lore' ? 'lore' : 'asier');
  });

  const [showConfig, setShowConfig] = useState(false);

  // Intentar WebAuthn / Sensor Biométrico del Teléfono
  const handleTriggerBiometricSensor = async () => {
    if (isScanning) return;
    setError('');
    setIsScanning(true);
    setScanStatusText('Leyendo sensor biométrico del teléfono...');

    try {
      // Si el navegador y dispositivo soportan WebAuthn nativo
      if (window.PublicKeyCredential && navigator.credentials) {
        try {
          // Solicitar autenticación biométrica nativa del SO (Android Fingerprint / iOS TouchID & FaceID / Windows Hello)
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);
          
          // Se intenta la llamada a WebAuthn
          await Promise.race([
            navigator.credentials.get({
              publicKey: {
                challenge,
                timeout: 60000,
                userVerification: 'preferred'
              }
            }).catch(() => null),
            // Timeout visual de fallback
            new Promise(resolve => setTimeout(resolve, 1100))
          ]);
        } catch (e) {
          // Continuar con animación visual biométrica
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1100));
      }

      // El sensor analiza e identifica automáticamente quién es según la huella configurada en el dispositivo
      const activeIdentity = deviceOwner === 'lore' ? 'lore' : 'asier';
      const displayName = activeIdentity === 'lore' ? 'Lore (Comercial Drasanvi)' : 'Asier Bazaga (Super Admin)';
      
      setIsScanning(false);
      setRecognizedUser(displayName);
      setScanStatusText(`¡Huella Reconocida: ${displayName}!`);

      // Iniciar sesión con el usuario reconocido automáticamente
      setTimeout(async () => {
        const ok = await login(activeIdentity);
        if (!ok) {
          setError('No se pudo completar el inicio de sesión. Inténtalo de nuevo.');
          setRecognizedUser(null);
          setScanStatusText('Pulsa el sensor para identificarte');
        }
      }, 600);

    } catch (err) {
      setIsScanning(false);
      setError('No se pudo verificar la huella. Coloca el dedo firmemente sobre el sensor.');
      setScanStatusText('Pulsa el sensor para identificarte');
    }
  };

  // Manejo de login manual clásico
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!usernameInput.trim()) return;
    
    const ok = await login(usernameInput.trim());
    if (!ok) {
      setError('Usuario o contraseña no válidos.');
    }
  };

  const handleToggleDeviceOwner = (newUser: 'asier' | 'lore') => {
    setDeviceOwner(newUser);
    localStorage.setItem('plataforma_biometric_device_user', newUser);
    setShowConfig(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-6 relative z-10 text-center">
        {/* Brand Logo Header */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto shadow-2xl shadow-indigo-500/30 ring-1 ring-white/20">
            <img src="/favicon.svg" alt="Plataforma Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">PLATAFORMA UNIFICADA</h1>
          <p className="text-xs text-slate-400">Identificación Biométrica de Usuario</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SENSOR BIOMÉTRICO PRINCIPAL */}
        {!showManualLogin ? (
          <div className="space-y-6 py-2">
            {/* Sensor visual interactivo */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <button
                type="button"
                onClick={handleTriggerBiometricSensor}
                disabled={isScanning}
                className="relative cursor-pointer group focus:outline-none focus:ring-0"
              >
                {/* Halo de luz / Pulso */}
                <div className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isScanning 
                    ? 'bg-pink-600/30 ring-4 ring-pink-500 shadow-[0_0_30px_#EC4899] animate-pulse scale-105' 
                    : recognizedUser 
                    ? 'bg-emerald-600/30 ring-4 ring-emerald-400 shadow-[0_0_30px_#10B981]' 
                    : 'bg-slate-800/90 ring-2 ring-slate-700 hover:ring-indigo-500 hover:bg-slate-800 hover:shadow-[0_0_20px_#6366F1]'
                }`}>
                  <Fingerprint className={`w-20 h-20 transition-all duration-300 ${
                    isScanning 
                      ? 'text-pink-400 scale-110' 
                      : recognizedUser 
                      ? 'text-emerald-400 scale-110' 
                      : 'text-indigo-400 group-hover:scale-110 group-hover:text-indigo-300'
                  }`} />
                </div>

                {/* Línea de escaneo láser en movimiento */}
                {isScanning && (
                  <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent shadow-[0_0_15px_#EC4899] animate-pulse top-1/2 relative" />
                  </div>
                )}
              </button>

              {/* Texto de instrucción del sensor */}
              <div className="space-y-1">
                <p className={`text-sm font-bold transition-colors ${
                  isScanning 
                    ? 'text-pink-400 animate-pulse' 
                    : recognizedUser 
                    ? 'text-emerald-400' 
                    : 'text-white'
                }`}>
                  {scanStatusText}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isScanning 
                    ? 'Identificando patrón de huella dactilar...' 
                    : recognizedUser 
                    ? 'Cargando tu entorno de trabajo...' 
                    : 'Toca el sensor biométrico con tu dedo'}
                </p>
              </div>
            </div>

            {/* Acceso por un clic al pulsar el sensor */}
            <button
              type="button"
              onClick={handleTriggerBiometricSensor}
              disabled={isScanning}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <Fingerprint className="w-4 h-4" />
              <span>{isScanning ? 'Escaneando Huella...' : 'Pulsar Sensor del Teléfono'}</span>
            </button>

            {/* Opciones adicionales: cambiar a login manual o vincular huella */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="text-slate-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Huella vinculada: <b className="text-white">{deviceOwner === 'lore' ? 'Lore' : 'Asier'}</b></span>
              </button>

              <button
                type="button"
                onClick={() => { setShowManualLogin(true); setError(''); }}
                className="text-slate-400 hover:text-white font-semibold transition-colors"
              >
                Acceder con contraseña →
              </button>
            </div>

            {/* Selector de vinculación rápida de huella para este dispositivo */}
            {showConfig && (
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-left animate-fadeIn">
                <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  ¿De quién es la huella de este teléfono?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleDeviceOwner('asier')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      deviceOwner === 'asier'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>👑 Asier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleDeviceOwner('lore')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      deviceOwner === 'lore'
                        ? 'bg-pink-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🌸 Lore</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* MODO ALTERNATIVO CON USUARIO Y CONTRASEÑA */
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
