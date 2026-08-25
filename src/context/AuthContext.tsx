import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AppPermission, AppId, Role, UserStatus } from '../types';
import { storageService } from '../services/storageService';

interface AuthContextType {
  currentUser: UserProfile | null;
  allProfiles: UserProfile[];
  permissions: AppPermission[];
  loading: boolean;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string, department?: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  logout: () => void;
  switchUser: (user: UserProfile) => void;
  hasAccessToApp: (appId: AppId) => boolean;
  canEditApp: (appId: AppId) => boolean;
  updatePermissions: (userId: string, perms: AppPermission[]) => Promise<void>;
  addUser: (name: string, email: string, role: Role, department: string, password?: string) => Promise<UserProfile>;
  updateUser: (id: string, updates: Partial<UserProfile>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>(() => storageService.getProfilesSync());
  const [permissions, setPermissions] = useState<AppPermission[]>(() => storageService.getPermissionsSync());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshData = async () => {
    try {
      const profiles = await storageService.getProfiles();
      const perms = await storageService.getPermissions();
      setAllProfiles(profiles);
      setPermissions(perms);

      // Si el usuario actual ha sido modificado, actualizarlo en el contexto
      if (currentUser) {
        const found = profiles.find(p => p.id === currentUser.id);
        if (found) {
          if (found.status === 'suspended') {
            setCurrentUser(null);
            localStorage.removeItem('plataforma_active_email');
          } else {
            setCurrentUser(found);
          }
        }
      }
    } catch (err) {
      console.warn('Sincronización de perfiles completada con cache local.');
    }
  };

  useEffect(() => {
    refreshData();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sessionStorage.setItem('app_hidden_time', String(Date.now()));
      } else if (document.visibilityState === 'visible') {
        const hiddenTime = sessionStorage.getItem('app_hidden_time');
        if (hiddenTime && Date.now() - Number(hiddenTime) > 60000) {
          setCurrentUser(null);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const login = async (identifier: string, password?: string): Promise<{ success: boolean; error?: string }> => {
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
      if ((cleanId === 'invitado' || cleanId === 'guest' || cleanId === 'demo') &&
          (email.includes('invitado') || email.includes('guest') || p.role === 'guest')) {
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

    // Comprobación de contraseña si se introduce o si el usuario tiene contraseña configurada
    if (password && user.password && user.password !== password) {
      return { success: false, error: 'Contraseña incorrecta.' };
    }

    const updatedUser = {
      ...user,
      last_login: new Date().toISOString()
    };
    await storageService.updateProfile(user.id, { last_login: updatedUser.last_login });

    setCurrentUser(updatedUser);
    localStorage.setItem('plataforma_active_email', user.email);
    storageService.logAction(user.email, 'LOGIN', `Inicio de sesión exitoso como ${user.role} (${user.full_name})`);

    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    password?: string,
    department: string = 'General'
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const profiles = await storageService.getProfiles();

    if (profiles.some(p => p.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Ya existe una cuenta registrada con este correo electrónico.' };
    }

    const newProfile = await storageService.createProfile({
      full_name: name.trim(),
      email: cleanEmail,
      role: 'user',
      status: 'active',
      password: password || '123456',
      department: department.trim() || 'General',
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`
    });

    await refreshData();
    setCurrentUser(newProfile);
    localStorage.setItem('plataforma_active_email', newProfile.email);
    storageService.logAction(newProfile.email, 'REGISTER', `Autoregistro de nuevo usuario: ${name} (${cleanEmail})`);

    return { success: true, user: newProfile };
  };

  const logout = () => {
    if (currentUser) {
      storageService.logAction(currentUser.email, 'LOGOUT', 'Cierre de sesión');
    }
    setCurrentUser(null);
    localStorage.removeItem('plataforma_active_email');
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
    await storageService.updateProfile(id, updates);
    await refreshData();
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
        refreshData
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
