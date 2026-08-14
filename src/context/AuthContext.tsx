import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AppPermission, AppId, Role } from '../types';
import { storageService } from '../services/storageService';

interface AuthContextType {
  currentUser: UserProfile | null;
  allProfiles: UserProfile[];
  permissions: AppPermission[];
  loading: boolean;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (user: UserProfile) => void;
  hasAccessToApp: (appId: AppId) => boolean;
  canEditApp: (appId: AppId) => boolean;
  updatePermissions: (userId: string, perms: AppPermission[]) => Promise<void>;
  addUser: (name: string, email: string, role: Role, department: string) => Promise<UserProfile>;
  refreshData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [permissions, setPermissions] = useState<AppPermission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshData = async () => {
    try {
      setLoading(true);
      const profiles = await storageService.getProfiles();
      const perms = await storageService.getPermissions();
      setAllProfiles(profiles);
      setPermissions(perms);

      // Si no hay usuario en sesión, iniciar por defecto con el Admin
      if (!currentUser && profiles.length > 0) {
        const savedEmail = localStorage.getItem('plataforma_active_email');
        const found = profiles.find(p => p.email === savedEmail) || profiles[0];
        setCurrentUser(found);
      }
    } catch (err) {
      console.error('Error al cargar perfiles/permisos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const login = async (email: string): Promise<boolean> => {
    const profiles = await storageService.getProfiles();
    const user = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('plataforma_active_email', user.email);
      await storageService.logAction(user.email, 'LOGIN', `Inicio de sesión exitoso como ${user.role}`);
      return true;
    }
    return false;
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
    // Si es Administrador siempre tiene acceso
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

  const addUser = async (name: string, email: string, role: Role, department: string): Promise<UserProfile> => {
    const newProfile = await storageService.createProfile({
      full_name: name,
      email,
      role,
      department,
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`
    });

    await refreshData();
    if (currentUser) {
      storageService.logAction(currentUser.email, 'CREATE_USER', `Nuevo usuario creado: ${email} (${role})`);
    }
    return newProfile;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allProfiles,
        permissions,
        loading,
        login,
        logout,
        switchUser,
        hasAccessToApp,
        canEditApp,
        updatePermissions,
        addUser,
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
