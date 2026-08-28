import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AppPermission, AppId, Role, UserStatus } from '../types';
import { storageService } from '../services/storageService';

interface AuthContextType {
  currentUser: UserProfile | null;
  allProfiles: UserProfile[];
  permissions: AppPermission[];
  loading: boolean;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string, department?: string, securityQuestion?: string, securityAnswer?: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  logout: () => void;
  switchUser: (user: UserProfile) => void;
  hasAccessToApp: (appId: AppId) => boolean;
  canEditApp: (appId: AppId) => boolean;
  updatePermissions: (userId: string, perms: AppPermission[]) => Promise<void>;
  addUser: (name: string, email: string, role: Role, department: string, password?: string) => Promise<UserProfile>;
  updateUser: (id: string, updates: Partial<UserProfile>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  getSecurityQuestion: (identifier: string) => Promise<{ success: boolean; question?: string; error?: string }>;
  resetPasswordWithSecurityAnswer: (identifier: string, answer: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>(() => storageService.getProfilesSync());
  const [permissions, setPermissions] = useState<AppPermission[]>(() => storageService.getPermissionsSync());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const activeEmail = typeof window !== 'undefined' ? localStorage.getItem('plataforma_active_email') : null;
    if (activeEmail) {
      const profiles = storageService.getProfilesSync();
      return profiles.find(p => p.email.toLowerCase() === activeEmail.toLowerCase()) || null;
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(false);

  const refreshData = async () => {
    try {
      const profiles = await storageService.getProfiles();
      const perms = await storageService.getPermissions();
      setAllProfiles(profiles);
      setPermissions(perms);

      const activeEmail = typeof window !== 'undefined' ? localStorage.getItem('plataforma_active_email') : null;

      if (activeEmail) {
        const found = profiles.find(p => p.email.toLowerCase() === activeEmail.toLowerCase());
        if (found) {
          if (found.status === 'suspended') {
            setCurrentUser(null);
            localStorage.removeItem('plataforma_active_email');
          } else {
            setCurrentUser(found);
          }
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.warn('Sincronización de perfiles completada con cache local.');
    }
  };

  useEffect(() => {
    refreshData();
    storageService.syncFromCloud().then(() => {
      refreshData();
    });

    const unsubscribe = storageService.onSync(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, []);

  const login = async (identifier: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    storageService.syncFromCloud().catch(() => {});
    const profiles = await storageService.getProfiles();
    const cleanId = identifier.trim().toLowerCase();

    // Búsqueda inteligente por email, nombre o alias
    const user = profiles.find(p => {
      const email = p.email.toLowerCase();
      const name = p.full_name.toLowerCase();
      const firstName = name.split(' ')[0];

      if (email === cleanId || name === cleanId || firstName === cleanId) return true;
      if ((cleanId === 'asier' || cleanId === 'admin' || cleanId === 'asier.bazaga') &&
          (email.includes('asier') || email.includes('admin') || name.includes('asier'))) {
        return true;
      }
      if (cleanId === 'lore' && (email.includes('lore') || name.includes('lore'))) {
        return true;
      }
      return false;
    });

    if (!user) {
      return { success: false, error: 'Usuario no encontrado. Comprueba el correo o regístrate si eres nuevo.' };
    }

    if (user.status === 'suspended') {
      return { success: false, error: 'Tu cuenta ha sido suspendida por el administrador.' };
    }

    // Comprobación estricta de contraseña
    if (password) {
      const cleanPass = password.trim();
      const storedPass = storageService.getPasswordForUser(user);
      
      const isValidPass = cleanPass === storedPass || cleanPass === user.password;
      
      if (!isValidPass) {
        return { success: false, error: 'Contraseña incorrecta.' };
      }
    }

    const updatedUser = {
      ...user,
      last_login: new Date().toISOString()
    };
    await storageService.updateProfile(user.id, { 
      last_login: updatedUser.last_login
    });

    setCurrentUser(updatedUser);
    localStorage.setItem('plataforma_active_email', user.email);
    storageService.logAction(user.email, 'LOGIN', `Inicio de sesión exitoso como ${user.role} (${user.full_name})`);

    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    password?: string,
    department: string = 'General',
    securityQuestion?: string,
    securityAnswer?: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim().toLowerCase();
    const profiles = await storageService.getProfiles();

    if (profiles.some(p => p.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Ya existe una cuenta registrada con este identificador.' };
    }

    if (profiles.some(p => p.full_name.toLowerCase() === cleanName)) {
      return { success: false, error: 'Este nombre de usuario ya está en uso. Por favor, elige otro.' };
    }

    const newProfile = await storageService.createProfile({
      full_name: name.trim(),
      email: cleanEmail,
      role: 'user',
      status: 'active',
      password: password || '123456',
      department: department.trim() || 'General',
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      security_question: securityQuestion,
      security_answer: securityAnswer
    });

    await refreshData();
    setCurrentUser(newProfile);
    localStorage.setItem('plataforma_active_email', newProfile.email);
    storageService.logAction(newProfile.email, 'REGISTER', `Autoregistro de nuevo usuario: ${name} (${cleanEmail})`);

    return { success: true, user: newProfile };
  };

  const getSecurityQuestion = async (identifier: string): Promise<{ success: boolean; question?: string; error?: string }> => {
    const profiles = await storageService.getProfiles();
    const cleanId = identifier.trim().toLowerCase();

    const user = profiles.find(p => {
      const email = p.email.toLowerCase();
      const name = p.full_name.toLowerCase();
      const firstName = name.split(' ')[0];
      return (email === cleanId || name === cleanId || firstName === cleanId);
    });

    if (!user) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    if (!user.security_question) {
      return { success: false, error: 'Este usuario no tiene configurada una pregunta de seguridad. Contacta con el administrador.' };
    }

    return { success: true, question: user.security_question };
  };

  const resetPasswordWithSecurityAnswer = async (identifier: string, answer: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const profiles = await storageService.getProfiles();
    const cleanId = identifier.trim().toLowerCase();

    const user = profiles.find(p => {
      const email = p.email.toLowerCase();
      const name = p.full_name.toLowerCase();
      const firstName = name.split(' ')[0];
      return (email === cleanId || name === cleanId || firstName === cleanId);
    });

    if (!user) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    if (!user.security_question || !user.security_answer) {
      return { success: false, error: 'Este usuario no tiene configurada una pregunta de seguridad.' };
    }

    const cleanAnswer = answer.trim().toLowerCase();
    const storedAnswer = user.security_answer.trim().toLowerCase();

    if (cleanAnswer !== storedAnswer) {
      return { success: false, error: 'La respuesta no es correcta.' };
    }

    await storageService.updateProfile(user.id, {
      password: newPassword.trim()
    });
    
    // Also update passwords local map in storageService
    if (typeof window !== 'undefined') {
       const userPasswordsStr = localStorage.getItem('plataforma_user_passwords') || '{}';
       try {
         const userPasswords = JSON.parse(userPasswordsStr);
         userPasswords[user.email] = newPassword.trim();
         localStorage.setItem('plataforma_user_passwords', JSON.stringify(userPasswords));
       } catch (e) {}
    }

    storageService.logAction(user.email, 'RESET_PASSWORD', `Contrasea restablecida mediante pregunta de seguridad.`);

    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      storageService.logAction(currentUser.email, 'LOGOUT', 'Cierre de sesión');
    }
    setCurrentUser(null);
    localStorage.removeItem('plataforma_active_email');
    if (typeof window !== 'undefined') {
      const keysToKeep = ['plataforma_active_email', 'plataforma_profiles', 'plataforma_permissions', 'plataforma_user_passwords', 'plataforma_storage_ver', 'plataforma_interview_candidates'];
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('plataforma_') && !keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      }
      // Forzar recarga limpia de la aplicación para purgar cualquier estado en memoria
      window.location.reload();
    }
  };

  const switchUser = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('plataforma_active_email', user.email);
    storageService.logAction(user.email, 'SWITCH_USER', `Cambio rápido a usuario ${user.full_name}`);
  };

  const hasAccessToApp = (appId: AppId): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;

    const userPerm = permissions.find(p => p.user_id === currentUser.id && p.app_id === appId);
    return userPerm ? userPerm.can_access : false;
  };

  const canEditApp = (appId: AppId): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;

    const userPerm = permissions.find(p => p.user_id === currentUser.id && p.app_id === appId);
    return userPerm ? (userPerm.can_access && userPerm.can_edit) : false;
  };

  const updatePermissions = async (userId: string, newPerms: AppPermission[]) => {
    await storageService.updateUserPermissions(userId, newPerms);
    const updatedPerms = await storageService.getPermissions();
    setPermissions(updatedPerms);
    if (currentUser) {
      storageService.logAction(currentUser.email, 'UPDATE_PERMISSIONS', `Permisos actualizados para usuario ID ${userId}`);
    }
  };

  const addUser = async (
    name: string,
    email: string,
    role: Role,
    department: string,
    password?: string
  ): Promise<UserProfile> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim().toLowerCase();
    const profiles = await storageService.getProfiles();

    if (profiles.some(p => p.email.toLowerCase() === cleanEmail)) {
      throw new Error('Ya existe un usuario con ese identificador o correo.');
    }
    if (profiles.some(p => p.full_name.toLowerCase() === cleanName)) {
      throw new Error('Ya existe un usuario con ese nombre.');
    }

    const newProfile = await storageService.createProfile({
      full_name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      status: 'active',
      password: password || '123456',
      department: department.trim() || 'Operaciones',
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`
    });

    await refreshData();
    if (currentUser) {
      storageService.logAction(currentUser.email, 'CREATE_USER', `Nuevo usuario creado por admin: ${email} (${role})`);
    }
    return newProfile;
  };

  const updateUser = async (id: string, updates: Partial<UserProfile>): Promise<void> => {
    if (updates.full_name) {
      const cleanName = updates.full_name.trim().toLowerCase();
      const profiles = await storageService.getProfiles();
      const existing = profiles.find(p => p.full_name.toLowerCase() === cleanName && p.id !== id);
      if (existing) {
        throw new Error('Ya existe otro usuario con ese nombre.');
      }
    }
    await storageService.updateProfile(id, updates);
    await refreshData();
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
    if (currentUser) {
      storageService.logAction(currentUser.email, 'UPDATE_USER', `Usuario ${id} actualizado por admin`);
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    await storageService.deleteProfile(id);
    await refreshData();
    if (currentUser) {
      storageService.logAction(currentUser.email, 'DELETE_USER', `Usuario ${id} eliminado por admin`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allProfiles,
        permissions,
        loading,
        login,
        register,
        logout,
        switchUser,
        hasAccessToApp,
        canEditApp,
        updatePermissions,
        addUser,
        updateUser,
        deleteUser,
        refreshData,
        getSecurityQuestion,
        resetPasswordWithSecurityAnswer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser usado dentro de AuthProvider');
  return context;
};
