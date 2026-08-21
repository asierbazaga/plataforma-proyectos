// Servicio de Autenticación Biométrica Nativa del Dispositivo (WebAuthn / Passkeys)
// Utiliza el hardware real del teléfono (Sensor de Huella Dactilar / Touch ID / Face ID / Windows Hello)

export interface DeviceBiometricCredential {
  credentialId: string; // Base64
  userId: string;
  userEmail: string;
  userName: string;
  deviceLabel: string;
  createdAt: string;
}

// Convertidores de ArrayBuffer a Base64 y viceversa
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function getRandomChallenge(): Uint8Array {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return array;
}

class WebAuthnService {
  private STORAGE_KEY = 'plataforma_device_biometrics_v1';

  // Verificar si el dispositivo físico cuenta con sensor biométrico de hardware (Huella/FaceID)
  async isBiometricAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (!window.PublicKeyCredential) return false;
    try {
      if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  // Obtener todas las credenciales biométricas registradas en este navegador/dispositivo
  getRegisteredCredentials(): DeviceBiometricCredential[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // Guardar credencial
  private saveCredential(cred: DeviceBiometricCredential): void {
    const list = this.getRegisteredCredentials().filter(c => c.credentialId !== cred.credentialId);
    list.push(cred);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }

  // Eliminar credencial de este dispositivo
  removeCredential(userId: string): void {
    const list = this.getRegisteredCredentials().filter(c => c.userId !== userId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }

  // 1. REGISTRAR LA HUELLA REAL DEL TELÉFONO PARA UN USUARIO
  // Dispara el diálogo nativo del SO (Android Fingerprint / iOS Touch ID / Windows Hello)
  async registerDeviceBiometric(userId: string, userEmail: string, userName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        return { success: false, error: 'Este dispositivo o navegador no tiene sensor de huella compatible con WebAuthn.' };
      }

      const challenge = getRandomChallenge();
      const userBuffer = new TextEncoder().encode(userId);

      const hostname = window.location.hostname || 'localhost';

      const createOptions: CredentialCreationOptions = {
        publicKey: {
          challenge: challenge as any,
          rp: {
            name: 'Plataforma Proyectos',
            id: hostname === 'localhost' ? 'localhost' : hostname
          },
          user: {
            id: userBuffer as any,
            name: userEmail,
            displayName: userName
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },  // ES256
            { alg: -257, type: 'public-key' } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform', // Obliga a usar el hardware biométrico del teléfono
            userVerification: 'required',        // Exige escaneo de huella / rostro en el sensor real
            residentKey: 'preferred'
          },
          timeout: 60000,
          attestation: 'none'
        }
      };

      // Dispara la ventana nativa del sistema operativo
      const credential = (await navigator.credentials.create(createOptions)) as PublicKeyCredential;

      if (!credential || !credential.id) {
        return { success: false, error: 'No se completó el registro de la huella en el sensor.' };
      }

      const credIdBase64 = bufferToBase64(credential.rawId);

      const deviceData: DeviceBiometricCredential = {
        credentialId: credIdBase64,
        userId,
        userEmail,
        userName,
        deviceLabel: navigator.userAgent.includes('Mobile') ? 'Teléfono Móvil' : 'Dispositivo Personal',
        createdAt: new Date().toISOString()
      };

      this.saveCredential(deviceData);
      return { success: true };
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        return { success: false, error: 'El escaneo de huella fue cancelado o no se reconoció en el sensor.' };
      }
      return { success: false, error: err.message || 'Error al comunicarse con el sensor biométrico del teléfono.' };
    }
  }

  // 2. IDENTIFICAR Y AUTENTICAR CON EL SENSOR DE HUELLA REAL DEL TELÉFONO
  // El teléfono pide la huella y devuelve la credencial con la que se sabe quién es
  async authenticateWithDeviceBiometric(): Promise<{ success: boolean; userEmail?: string; userName?: string; error?: string }> {
    try {
      const credentials = this.getRegisteredCredentials();
      if (credentials.length === 0) {
        return { 
          success: false, 
          error: 'No hay ninguna huella de este teléfono registrada aún. Registra tu huella primero.' 
        };
      }

      const challenge = getRandomChallenge();
      const hostname = window.location.hostname || 'localhost';

      // Permitir cualquiera de las credenciales registradas en este dispositivo
      const allowCredentials = credentials.map(c => ({
        id: base64ToBuffer(c.credentialId),
        type: 'public-key' as const,
        transports: ['internal'] as AuthenticatorTransport[]
      }));

      const getOptions: CredentialRequestOptions = {
        publicKey: {
          challenge: challenge as any,
          rpId: hostname === 'localhost' ? 'localhost' : hostname,
          allowCredentials: allowCredentials.length > 0 ? (allowCredentials as any) : undefined,
          userVerification: 'required', // Obliga a verificar con el sensor de huellas real del teléfono
          timeout: 60000
        }
      };

      // Dispara la ventana nativa del teléfono (Android / iOS TouchID)
      const assertion = (await navigator.credentials.get(getOptions)) as PublicKeyCredential;

      if (!assertion) {
        return { success: false, error: 'No se recibió confirmación del sensor biométrico.' };
      }

      const assertionIdBase64 = bufferToBase64(assertion.rawId);

      // Buscar a qué usuario corresponde esta credencial de hardware
      const matched = credentials.find(c => c.credentialId === assertionIdBase64) || credentials[0];

      if (!matched) {
        return { success: false, error: 'La huella verificada no coincide con ningún usuario registrado en este teléfono.' };
      }

      return {
        success: true,
        userEmail: matched.userEmail,
        userName: matched.userName
      };

    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        return { success: false, error: 'Lectura de huella cancelada en el sensor del teléfono.' };
      }
      return { success: false, error: err.message || 'Error al validar la huella en el sensor.' };
    }
  }
}

export const webAuthnService = new WebAuthnService();
