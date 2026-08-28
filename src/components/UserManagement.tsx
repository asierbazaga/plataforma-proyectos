import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Dumbbell,
  DollarSign,
  BookOpen,
  BookMarked,
  CheckCircle2,
  XCircle,
  Edit3,
  Eye,
  Lock,
  ArrowLeft,
  Search,
  KeyRound,
  Trash2,
  ShieldAlert,
  UserX,
  Users,
  Shield,
  Activity,
  Check,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import { AppId, Role, UserProfile, UserStatus } from '../types';

interface UserManagementProps {
  onBack?: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
  const {
    allProfiles,
    permissions,
    updatePermissions,
    addUser,
    updateUser,
    deleteUser,
    currentUser
  } = useAuth();

  const toast = useToast();

  // Filtros y Búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');

  // Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserProfile | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  // Form states para Crear Usuario
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('123456');
  const [addRole, setAddRole] = useState<Role>('user');
  const [addDepartment, setAddDepartment] = useState('Operaciones');

  // Form states para Editar Usuario
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editRole, setEditRole] = useState<Role>('user');

  // Form state para Reset Password
  const [newPassword, setNewPassword] = useState('');

  // Expandir permisos en vista móvil
  const [expandedUserMobile, setExpandedUserMobile] = useState<string | null>(null);

  const appsList: { id: AppId; name: string; icon: React.FC<{ className?: string }>; color: string }[] = [
    { id: 'fitness', name: 'Fitness & Polar', icon: Dumbbell, color: 'text-[#FF6B00]' },
    { id: 'gastos', name: 'Gastos & Finanzas', icon: DollarSign, color: 'text-emerald-400' },
    { id: 'libros-juegos', name: 'Libros & Juegos', icon: BookOpen, color: 'text-purple-400' },
    { id: 'lore', name: 'Lore CRM & Rutas', icon: BookMarked, color: 'text-sky-400' },
  ];

  // Métricas KPIs
  const totalUsers = allProfiles.length;
  const adminUsers = allProfiles.filter(p => p.role === 'admin').length;
  const activeUsers = allProfiles.filter(p => (p.status || 'active') === 'active').length;
  const suspendedUsers = allProfiles.filter(p => p.status === 'suspended').length;

  // Filtrado de usuarios
  const filteredProfiles = useMemo(() => {
    return allProfiles.filter(user => {
      const matchesSearch =
        user.full_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (user.department || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const userStatus = user.status || 'active';
      const matchesStatus = statusFilter === 'all' || userStatus === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [allProfiles, debouncedSearchTerm, roleFilter, statusFilter]);

  const handleToggleAccess = async (userId: string, appId: AppId, currentAccess: boolean, currentEdit: boolean) => {
    try {
      const newAccess = !currentAccess;
      const newEdit = newAccess ? currentEdit : false;

      const userPerms = appsList.map(a => {
        if (a.id === appId) {
          return { user_id: userId, app_id: a.id, can_access: newAccess, can_edit: newEdit };
        }
        const existing = permissions.find(p => p.user_id === userId && p.app_id === a.id);
        return existing || { user_id: userId, app_id: a.id, can_access: false, can_edit: false };
      });

      await updatePermissions(userId, userPerms);
      toast.success(`Permiso de acceso actualizado`);
    } catch (e: any) {
      toast.error(e.message || 'Error actualizando permisos');
    }
  };

  const handleToggleEdit = async (userId: string, appId: AppId, currentAccess: boolean, currentEdit: boolean) => {
    if (!currentAccess) return;
    try {
      const newEdit = !currentEdit;

      const userPerms = appsList.map(a => {
        if (a.id === appId) {
          return { user_id: userId, app_id: a.id, can_access: true, can_edit: newEdit };
        }
        const existing = permissions.find(p => p.user_id === userId && p.app_id === a.id);
        return existing || { user_id: userId, app_id: a.id, can_access: false, can_edit: false };
      });

      await updatePermissions(userId, userPerms);
      toast.success(`Permiso de edición actualizado`);
    } catch (e: any) {
      toast.error(e.message || 'Error actualizando permisos');
    }
  };

  const handleStatusChange = async (userId: string, currentStatus: UserStatus) => {
    try {
      const nextStatus: UserStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await updateUser(userId, { status: nextStatus });
      toast.success(`Estado del usuario actualizado a ${nextStatus}`);
    } catch (e: any) {
      toast.error(e.message || 'Error actualizando estado');
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      await updateUser(userId, { role: newRole });
      toast.success(`Rol actualizado a ${newRole}`);
    } catch (e: any) {
      toast.error(e.message || 'Error actualizando rol');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addEmail.trim()) return;

    try {
      await addUser(addName, addEmail, addRole, addDepartment, addPassword);
      setAddName('');
      setAddEmail('');
      setAddPassword('123456');
      setShowAddModal(false);
      toast.success('Usuario creado exitosamente');
    } catch (e: any) {
      toast.error(e.message || 'Error creando el usuario');
    }
  };

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setEditName(user.full_name);
    setEditEmail(user.email);
    setEditDepartment(user.department || '');
    setEditRole(user.role);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await updateUser(editingUser.id, {
        full_name: editName.trim(),
        email: editEmail.trim().toLowerCase(),
        department: editDepartment.trim(),
        role: editRole
      });

      setEditingUser(null);
      toast.success('Perfil de usuario actualizado');
    } catch (e: any) {
      toast.error(e.message || 'Error actualizando perfil');
    }
  };

  const handleSaveResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser || !newPassword.trim()) return;

    try {
      await updateUser(resetPasswordUser.id, {
        password: newPassword.trim()
      });

      setResetPasswordUser(null);
      setNewPassword('');
      toast.success('Contraseña actualizada');
    } catch (e: any) {
      toast.error(e.message || 'Error cambiando contraseña');
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      setUserToDelete(null);
      toast.success('Usuario eliminado permanentemente');
    } catch (e: any) {
      toast.error(e.message || 'Error eliminando usuario');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111622] p-5 sm:p-6 rounded-3xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-3.5 sm:gap-4">
          {onBack && (
            <button
              onClick={onBack}
              title="Volver a la Plataforma"
              className="p-2.5 sm:p-3 rounded-2xl bg-[#090C15] hover:bg-white/10 text-slate-300 border border-white/5 transition-all flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center shadow-lg shadow-[#FF6B00]/10 flex-shrink-0">
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Gestión de Usuarios & Accesos
            </h1>
            <p className="text-slate-400 text-xs mt-0.5 hidden sm:block">
              Administra cuentas, roles, estados y permisos de lectura/escritura por aplicación.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#FA8500] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#FF6B00]/20 transition-all hover:scale-[1.02] w-full md:w-auto justify-center"
        >
          <UserPlus className="w-4 h-4" />
          Crear Nuevo Usuario
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-[#111622] border border-white/5 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Total Cuentas</span>
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{totalUsers}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-500">Usuarios en el sistema</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-[#111622] border border-white/5 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Super Admins</span>
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-400">{adminUsers}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-500">Acceso total a todo</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-[#111622] border border-white/5 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Activos</span>
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">{activeUsers}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-500">Sesión autorizada</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-[#111622] border border-white/5 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Suspendidos</span>
            <UserX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-400">{suspendedUsers}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-500">Acceso bloqueado</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="p-3 sm:p-4 rounded-3xl bg-[#111622] border border-white/5 shadow-md flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o departamento..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#090C15] border border-white/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00]"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as any)}
            className="bg-[#090C15] border border-white/5 rounded-2xl px-3 py-2.5 text-xs text-slate-300 font-bold focus:outline-none"
          >
            <option value="all">Todos los Roles</option>
            <option value="admin">Administrador</option>
            <option value="user">Usuario</option>
            <option value="guest">Invitado</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-[#090C15] border border-white/5 rounded-2xl px-3 py-2.5 text-xs text-slate-300 font-bold focus:outline-none"
          >
            <option value="all">Todos los Estados</option>
            <option value="active">Activos</option>
            <option value="suspended">Suspendidos</option>
          </select>
        </div>
      </div>

      {/* 1. VISTA MÓVIL OPTIMIZADA EN TARJETAS (Mobile Cards) */}
      <div className="block md:hidden space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Usuarios ({filteredProfiles.length})
          </h2>
          <span className="text-[10px] text-slate-500">Toca para gestionar permisos</span>
        </div>

        {filteredProfiles.map(user => {
          const isAdmin = user.role === 'admin';
          const isSuspended = user.status === 'suspended';
          const isSelf = currentUser?.id === user.id;
          const isExpanded = expandedUserMobile === user.id;

          return (
            <div
              key={user.id}
              className={`p-5 rounded-3xl bg-[#111622] border border-white/5 space-y-4 shadow-lg transition-all ${
                isSuspended ? 'opacity-60' : ''
              }`}
            >
              {/* Header de Usuario */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={user.full_name}
                    className="w-11 h-11 rounded-2xl object-cover ring-1 ring-white/10 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-white text-sm">{user.full_name}</h3>
                      {isSelf && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] font-bold">
                          Tú
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-[190px]">{user.email}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{user.department || 'General'}</p>
                  </div>
                </div>

                {/* Status Toggle Badge */}
                <button
                  type="button"
                  disabled={isSelf}
                  onClick={() => handleStatusChange(user.id, user.status || 'active')}
                  className={`px-3 py-1 rounded-xl font-bold text-[10px] border flex-shrink-0 ${
                    !isSuspended
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {!isSuspended ? 'Activo' : 'Suspendido'}
                </button>
              </div>

              {/* Selector de Rol en Móvil */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#090C15] border border-white/5">
                <span className="text-xs text-slate-400 font-medium">Rol de Usuario:</span>
                <select
                  value={user.role}
                  disabled={isSelf}
                  onChange={e => handleRoleChange(user.id, e.target.value as Role)}
                  className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border focus:outline-none ${
                    user.role === 'admin'
                      ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                      : user.role === 'user'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}
                >
                  <option value="admin" className="bg-[#090C15] text-white">Admin</option>
                  <option value="user" className="bg-[#090C15] text-white">Usuario</option>
                  <option value="guest" className="bg-[#090C15] text-white">Invitado</option>
                </select>
              </div>

              {/* Botón Desplegar Permisos de Aplicaciones */}
              <button
                type="button"
                onClick={() => setExpandedUserMobile(isExpanded ? null : user.id)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] hover:bg-white/5 border border-white/5 text-xs text-slate-300 font-bold transition-colors"
              >
                <span>Permisos por Aplicación (4 Apps)</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Grid de Permisos Móvil Desplegable */}
              {isExpanded && (
                <div className="space-y-2.5 pt-1 animate-in fade-in">
                  {isAdmin ? (
                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center text-xs font-bold text-indigo-400 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Acceso Total Super Administrador
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {appsList.map(app => {
                        const userPerm = permissions.find(p => p.user_id === user.id && p.app_id === app.id);
                        const canAccess = userPerm ? userPerm.can_access : false;
                        const canEdit = userPerm ? userPerm.can_edit : false;

                        return (
                          <div
                            key={app.id}
                            className="p-3 rounded-2xl bg-[#090C15] border border-white/5 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <app.icon className={`w-4 h-4 ${app.color}`} />
                              <span className="text-xs font-bold text-white">{app.name}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Toggle Acceso */}
                              <button
                                type="button"
                                onClick={() => handleToggleAccess(user.id, app.id, canAccess, canEdit)}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                                  canAccess
                                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                    : 'bg-white/5 border-white/5 text-slate-500'
                                }`}
                              >
                                {canAccess ? 'Acceso SI' : 'Bloqueado'}
                              </button>

                              {/* Toggle Edición */}
                              {canAccess && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleEdit(user.id, app.id, canAccess, canEdit)}
                                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                                    canEdit
                                      ? 'bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]/30'
                                      : 'bg-white/5 text-slate-400 border-white/5'
                                  }`}
                                >
                                  {canEdit ? 'Edición' : 'Lectura'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Barra de Acciones Móvil */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setResetPasswordUser(user)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-400 text-xs font-bold border border-white/5"
                >
                  <KeyRound className="w-3.5 h-3.5" /> Clave
                </button>

                <button
                  type="button"
                  onClick={() => openEditModal(user)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/5"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar
                </button>

                {!isSelf && (
                  <button
                    type="button"
                    onClick={() => setUserToDelete(user)}
                    className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. VISTA ESCRITORIO / TABLET EN MATRIZ (Desktop Table) */}
      <div className="hidden md:block p-6 rounded-3xl bg-[#111622] border border-white/5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
            Matriz de Control y Permisos ({filteredProfiles.length} usuarios)
          </h2>
          <span className="text-[11px] text-slate-500">Los cambios se aplican en tiempo real</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-[#090C15]/60">
                <th className="py-3.5 px-4 min-w-[220px]">Usuario & Datos</th>
                <th className="py-3.5 px-3 text-center">Rol</th>
                <th className="py-3.5 px-3 text-center">Estado</th>
                {appsList.map(app => (
                  <th key={app.id} className="py-3.5 px-3 text-center min-w-[130px]">
                    <div className="flex items-center justify-center gap-1.5 text-slate-200">
                      <app.icon className={`w-3.5 h-3.5 ${app.color}`} />
                      <span>{app.name}</span>
                    </div>
                  </th>
                ))}
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredProfiles.map(user => {
                const isAdmin = user.role === 'admin';
                const isSuspended = user.status === 'suspended';
                const isSelf = currentUser?.id === user.id;

                return (
                  <tr key={user.id} className={`hover:bg-white/[0.02] transition-colors ${isSuspended ? 'opacity-60' : ''}`}>
                    {/* Usuario Info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={user.full_name}
                          className="w-10 h-10 rounded-2xl object-cover ring-1 ring-white/10"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-white text-sm">{user.full_name}</p>
                            {isSelf && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] font-bold">
                                Tú
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{user.email}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span>{user.department || 'General'}</span>
                            {user.last_login && (
                              <>
                                <span>•</span>
                                <span>Último acceso: {new Date(user.last_login).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Rol Selector */}
                    <td className="py-4 px-3 text-center">
                      <select
                        value={user.role}
                        disabled={isSelf}
                        onChange={e => handleRoleChange(user.id, e.target.value as Role)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider border focus:outline-none cursor-pointer ${
                          user.role === 'admin'
                            ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                            : user.role === 'user'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        <option value="admin" className="bg-[#090C15] text-white">Admin</option>
                        <option value="user" className="bg-[#090C15] text-white">Usuario</option>
                        <option value="guest" className="bg-[#090C15] text-white">Invitado</option>
                      </select>
                    </td>

                    {/* Estado Toggle */}
                    <td className="py-4 px-3 text-center">
                      <button
                        type="button"
                        disabled={isSelf}
                        onClick={() => handleStatusChange(user.id, user.status || 'active')}
                        className={`px-3 py-1 rounded-xl font-bold text-[11px] border transition-all ${
                          !isSuspended
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/15 hover:text-rose-400 hover:border-rose-500/30'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-emerald-500/15 hover:text-emerald-400'
                        }`}
                      >
                        {!isSuspended ? 'Activo' : 'Suspendido'}
                      </button>
                    </td>

                    {/* Permisos Matrix */}
                    {appsList.map(app => {
                      if (isAdmin) {
                        return (
                          <td key={app.id} className="py-4 px-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[11px] font-bold border border-indigo-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Total Admin
                            </span>
                          </td>
                        );
                      }

                      const userPerm = permissions.find(p => p.user_id === user.id && p.app_id === app.id);
                      const canAccess = userPerm ? userPerm.can_access : false;
                      const canEdit = userPerm ? userPerm.can_edit : false;

                      return (
                        <td key={app.id} className="py-4 px-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {/* Toggle Acceso */}
                            <button
                              type="button"
                              onClick={() => handleToggleAccess(user.id, app.id, canAccess, canEdit)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 transition-all ${
                                canAccess
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                  : 'bg-[#090C15] border-white/5 text-slate-500 hover:text-white'
                              }`}
                            >
                              {canAccess ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              {canAccess ? 'Acceso' : 'Bloqueado'}
                            </button>

                            {/* Toggle Edición */}
                            {canAccess && (
                              <button
                                type="button"
                                onClick={() => handleToggleEdit(user.id, app.id, canAccess, canEdit)}
                                className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 border transition-all ${
                                  canEdit
                                    ? 'bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/25'
                                    : 'bg-white/5 text-slate-400 border-white/5'
                                }`}
                              >
                                {canEdit ? <Edit3 className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                                {canEdit ? 'Edición' : 'Lectura'}
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Acciones */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setResetPasswordUser(user)}
                          title="Cambiar contraseña de usuario"
                          className="p-2 text-slate-400 hover:text-amber-400 rounded-xl hover:bg-white/5 transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          title="Editar perfil"
                          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => setUserToDelete(user)}
                            title="Eliminar usuario"
                            className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-white/5 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR USUARIO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-white/10 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#FF6B00]" />
                Crear Nuevo Usuario
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Laura Gómez"
                  value={addName}
                  onChange={e => setAddName(e.target.value)}
                  className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="laura@empresa.com"
                  value={addEmail}
                  onChange={e => setAddEmail(e.target.value)}
                  className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Rol</label>
                  <select
                    value={addRole}
                    onChange={e => setAddRole(e.target.value as Role)}
                    className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none"
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                    <option value="guest">Invitado</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Departamento</label>
                  <input
                    type="text"
                    required
                    value={addDepartment}
                    onChange={e => setAddDepartment(e.target.value)}
                    className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Contraseña Inicial</label>
                <input
                  type="text"
                  required
                  value={addPassword}
                  onChange={e => setAddPassword(e.target.value)}
                  className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#FA8500] text-white font-black rounded-xl shadow-lg shadow-[#FF6B00]/20 transition-all"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR USUARIO */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-white/10 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#FF6B00]" />
                Editar Usuario
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Rol</label>
                  <select
                    value={editRole}
                    disabled={currentUser?.id === editingUser.id}
                    onChange={e => setEditRole(e.target.value as Role)}
                    className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none"
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                    <option value="guest">Invitado</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Departamento</label>
                  <input
                    type="text"
                    required
                    value={editDepartment}
                    onChange={e => setEditDepartment(e.target.value)}
                    className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#FA8500] text-white font-black rounded-xl shadow-lg transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESET PASSWORD */}
      {resetPasswordUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-white/10 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                Cambiar Contraseña
              </h3>
              <button onClick={() => setResetPasswordUser(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Asignando nueva contraseña para <strong className="text-white">{resetPasswordUser.full_name}</strong> ({resetPasswordUser.email}).
            </p>

            <form onSubmit={handleSaveResetPassword} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Nueva Contraseña</label>
                <input
                  type="text"
                  required
                  placeholder="Introduce la nueva clave"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setResetPasswordUser(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl shadow-lg transition-all"
                >
                  Actualizar Clave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINACIÓN */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-rose-500/20 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">¿Eliminar Usuario?</h3>
                <p className="text-xs text-rose-400">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Estás a punto de eliminar permanentemente a <strong className="text-white">{userToDelete.full_name}</strong> ({userToDelete.email}) y todos sus permisos asociados.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-xl shadow-lg transition-all"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
