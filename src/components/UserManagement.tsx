import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Dumbbell,
  DollarSign,
  BookOpen,
  BookMarked,
  CheckCircle2,
  Edit3,
  Eye,
  ArrowLeft,
  Search,
  KeyRound,
  Trash2,
  UserX,
  Users,
  Shield,
  Activity,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  Building,
  Package,
  CalendarDays,
  ChefHat,
  LayoutGrid,
  Table2,
  Ban,
  Filter,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import { AppId, Role, UserProfile, UserStatus } from '../types';
import { GlobalExpenseCategoriesManager } from './GlobalExpenseCategoriesManager';

interface UserManagementProps {
  onBack?: () => void;
}

type PermissionLevel = 'none' | 'read' | 'edit';

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

  // Filtros, Búsqueda y Modo de Vista
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 250);
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [appFilter, setAppFilter] = useState<'all' | AppId>('all');
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');

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

  const appsList: {
    id: AppId;
    name: string;
    shortName: string;
    icon: React.FC<{ className?: string }>;
    color: string;
    badgeBg: string;
  }[] = [
    { id: 'fitness', name: 'Fitness & Polar', shortName: 'Fitness', icon: Dumbbell, color: 'text-[#FF6B00]', badgeBg: 'bg-[#FF6B00]/10 border-[#FF6B00]/25' },
    { id: 'gastos', name: 'Gastos & Finanzas', shortName: 'Gastos', icon: DollarSign, color: 'text-emerald-400', badgeBg: 'bg-emerald-500/10 border-emerald-500/25' },
    { id: 'libros-juegos', name: 'Libros, Cine & Juegos', shortName: 'Cultura', icon: BookOpen, color: 'text-purple-400', badgeBg: 'bg-purple-500/10 border-purple-500/25' },
    { id: 'lore', name: 'Lore CRM & Rutas', shortName: 'Lore CRM', icon: BookMarked, color: 'text-sky-400', badgeBg: 'bg-sky-500/10 border-sky-500/25' },
    { id: 'entrevistas', name: 'Mecalux Ops Hub', shortName: 'Mecalux Ops', icon: Building, color: 'text-cyan-400', badgeBg: 'bg-cyan-500/10 border-cyan-500/25' },
    { id: 'inversiones', name: 'Inversiones', shortName: 'Inversiones', icon: Package, color: 'text-yellow-400', badgeBg: 'bg-yellow-500/10 border-yellow-500/25' },
    { id: 'agenda', name: 'Agenda Personal', shortName: 'Agenda', icon: CalendarDays, color: 'text-blue-400', badgeBg: 'bg-blue-500/10 border-blue-500/25' },
    { id: 'recetas', name: 'Recetas & Nutrición', shortName: 'Recetas', icon: ChefHat, color: 'text-rose-400', badgeBg: 'bg-rose-500/10 border-rose-500/25' },
  ];

  // Métricas KPIs
  const totalUsers = allProfiles.length;
  const adminUsers = allProfiles.filter(p => p.role === 'admin').length;
  const activeUsers = allProfiles.filter(p => (p.status || 'active') === 'active').length;
  const suspendedUsers = allProfiles.filter(p => p.status === 'suspended').length;

  // Helper para obtener el nivel de permiso actual de un usuario en una app
  const getUserAppLevel = (user: UserProfile, appId: AppId): PermissionLevel => {
    if (user.role === 'admin') return 'edit';
    const userPerm = permissions.find(p => p.user_id === user.id && p.app_id === appId);
    if (!userPerm || !userPerm.can_access) return 'none';
    return userPerm.can_edit ? 'edit' : 'read';
  };

  // Conteo de usuarios con acceso por aplicación
  const appAccessCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    appsList.forEach(app => {
      counts[app.id] = allProfiles.filter(u => {
        if (u.role === 'admin') return true;
        const perm = permissions.find(p => p.user_id === u.id && p.app_id === app.id);
        return Boolean(perm?.can_access);
      }).length;
    });
    return counts;
  }, [allProfiles, permissions]);

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

      let matchesApp = true;
      if (appFilter !== 'all') {
        matchesApp = getUserAppLevel(user, appFilter) !== 'none';
      }

      return matchesSearch && matchesRole && matchesStatus && matchesApp;
    });
  }, [allProfiles, debouncedSearchTerm, roleFilter, statusFilter, appFilter, permissions]);

  // Cambiar permiso directamente a un nivel ('none' | 'read' | 'edit') en 1 clic
  const handleSetPermissionLevel = async (userId: string, appId: AppId, level: PermissionLevel) => {
    try {
      const can_access = level !== 'none';
      const can_edit = level === 'edit';

      const userPerms = appsList.map(a => {
        if (a.id === appId) {
          return { user_id: userId, app_id: a.id, can_access, can_edit };
        }
        const existing = permissions.find(p => p.user_id === userId && p.app_id === a.id);
        return existing || { user_id: userId, app_id: a.id, can_access: false, can_edit: false };
      });

      await updatePermissions(userId, userPerms);
      const label = level === 'edit' ? 'Edición completa' : level === 'read' ? 'Solo lectura' : 'Bloqueado';
      toast.success(`Permiso actualizado: ${label}`);
    } catch (e: any) {
      toast.error(e.message || 'Error actualizando permisos');
    }
  };

  // Acción rápida masiva para un usuario (activar todo o revocar todo)
  const handleBulkUserPermissions = async (userId: string, level: PermissionLevel) => {
    try {
      const can_access = level !== 'none';
      const can_edit = level === 'edit';
      const userPerms = appsList.map(a => ({
        user_id: userId,
        app_id: a.id,
        can_access,
        can_edit
      }));
      await updatePermissions(userId, userPerms);
      toast.success(
        level === 'edit'
          ? 'Acceso total concedido a todas las apps'
          : level === 'read'
          ? 'Modo lectura asignado a todas las apps'
          : 'Todos los accesos han sido revocados'
      );
    } catch (e: any) {
      toast.error(e.message || 'Error aplicando permisos masivos');
    }
  };

  const handleStatusChange = async (userId: string, currentStatus: UserStatus) => {
    try {
      const nextStatus: UserStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await updateUser(userId, { status: nextStatus });
      toast.success(`Estado del usuario actualizado a ${nextStatus === 'active' ? 'Activo' : 'Suspendido'}`);
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
        department: editDepartment.trim() || 'General',
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

  // Renderizador del control de 3 estados para cada celda de aplicación
  const renderPermissionControl = (user: UserProfile, app: typeof appsList[number], compact = false) => {
    const level = getUserAppLevel(user, app.id);
    const isTeamLeaderApp = app.id === 'entrevistas';

    // Ciclo rápido al pulsar la etiqueta inferior: Bloqueado -> Edición -> Solo Lectura -> Bloqueado
    const handleQuickCycle = () => {
      const nextLevel: PermissionLevel =
        level === 'none' ? 'edit' : level === 'edit' ? 'read' : 'none';
      handleSetPermissionLevel(user.id, app.id, nextLevel);
    };

    const statusLabel =
      level === 'none'
        ? 'Bloqueado'
        : level === 'read'
        ? isTeamLeaderApp
          ? 'Ver Saldo'
          : 'Lectura'
        : isTeamLeaderApp
        ? 'Field Ops'
        : 'Edición';

    return (
      <div
        className={`group/cell flex flex-col items-center justify-center rounded-xl border transition-all ${
          compact ? 'p-1.5' : 'p-2'
        } ${
          level === 'none'
            ? 'bg-[#090C15]/50 border-white/[0.04] hover:border-white/15 opacity-55 hover:opacity-100'
            : level === 'read'
            ? 'bg-sky-500/[0.08] border-sky-500/30 shadow-sm shadow-sky-500/5'
            : isTeamLeaderApp
            ? 'bg-cyan-500/[0.12] border-cyan-500/35 shadow-sm shadow-cyan-500/10'
            : 'bg-emerald-500/[0.10] border-emerald-500/30 shadow-sm shadow-emerald-500/10'
        }`}
      >
        {/* Botonera segmentada de 1 clic: Bloqueado | Lectura | Edición */}
        <div className="flex items-center gap-0.5 bg-[#090C15]/90 p-0.5 rounded-lg border border-white/5">
          <button
            type="button"
            onClick={() => level !== 'none' && handleSetPermissionLevel(user.id, app.id, 'none')}
            title="Bloquear acceso"
            className={`p-1 rounded-md transition-all ${
              level === 'none'
                ? 'bg-rose-500/20 text-rose-400 shadow-inner'
                : 'text-slate-600 hover:text-rose-400 hover:bg-white/5'
            }`}
          >
            <Ban className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => level !== 'read' && handleSetPermissionLevel(user.id, app.id, 'read')}
            title={isTeamLeaderApp ? 'Solo lectura de saldo Field Ops' : 'Acceso de Solo Lectura'}
            className={`p-1 rounded-md transition-all ${
              level === 'read'
                ? 'bg-sky-500/25 text-sky-300 shadow-inner'
                : 'text-slate-500 hover:text-sky-300 hover:bg-white/5'
            }`}
          >
            <Eye className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => level !== 'edit' && handleSetPermissionLevel(user.id, app.id, 'edit')}
            title={isTeamLeaderApp ? 'Field Ops: Registrar bolsas y librar días' : 'Acceso Total (Lectura y Edición)'}
            className={`p-1 rounded-md transition-all ${
              level === 'edit'
                ? isTeamLeaderApp
                  ? 'bg-cyan-500/25 text-cyan-300 shadow-inner'
                  : 'bg-emerald-500/25 text-emerald-300 shadow-inner'
                : 'text-slate-500 hover:text-emerald-300 hover:bg-white/5'
            }`}
          >
            <Edit3 className="w-3 h-3" />
          </button>
        </div>

        {/* Etiqueta interactiva inferior */}
        <button
          type="button"
          onClick={handleQuickCycle}
          title="Clic para alternar permiso rápidamente"
          className={`mt-1 text-[10px] font-extrabold tracking-tight leading-none transition-colors ${
            level === 'none'
              ? 'text-slate-500 group-hover/cell:text-slate-300'
              : level === 'read'
              ? 'text-sky-400'
              : isTeamLeaderApp
              ? 'text-cyan-300'
              : 'text-emerald-400'
          }`}
        >
          {statusLabel}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-5 max-w-[1600px] w-full mx-auto pb-12 px-2 sm:px-4">
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
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center shadow-lg shadow-[#FF6B00]/10 flex-shrink-0 border border-[#FF6B00]/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Control de Usuarios & Permisos
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Gestiona accesos y niveles de edición en un clic para cada módulo de la plataforma.
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
        <button
          type="button"
          onClick={() => {
            setRoleFilter('all');
            setStatusFilter('all');
          }}
          className={`text-left p-4 rounded-2xl bg-[#111622] border transition-all ${
            roleFilter === 'all' && statusFilter === 'all'
              ? 'border-[#FF6B00]/40 shadow-lg shadow-[#FF6B00]/5'
              : 'border-white/5 hover:border-white/10'
          }`}
        >
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Total Cuentas</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">{totalUsers}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-500">Usuarios registrados</p>
        </button>

        <button
          type="button"
          onClick={() => setRoleFilter(roleFilter === 'admin' ? 'all' : 'admin')}
          className={`text-left p-4 rounded-2xl bg-[#111622] border transition-all ${
            roleFilter === 'admin'
              ? 'border-indigo-500/50 bg-indigo-500/[0.04]'
              : 'border-white/5 hover:border-white/10'
          }`}
        >
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Super Admins</span>
            <Shield className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-400 mt-1">{adminUsers}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-500">Acceso total automático</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
          className={`text-left p-4 rounded-2xl bg-[#111622] border transition-all ${
            statusFilter === 'active'
              ? 'border-emerald-500/50 bg-emerald-500/[0.04]'
              : 'border-white/5 hover:border-white/10'
          }`}
        >
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Activos</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{activeUsers}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-500">Sesión autorizada</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'suspended' ? 'all' : 'suspended')}
          className={`text-left p-4 rounded-2xl bg-[#111622] border transition-all ${
            statusFilter === 'suspended'
              ? 'border-rose-500/50 bg-rose-500/[0.04]'
              : 'border-white/5 hover:border-white/10'
          }`}
        >
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Suspendidos</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-400 mt-1">{suspendedUsers}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-500">Acceso bloqueado</p>
        </button>
      </div>

      {/* Barra de Filtros, Filtro por App y Selector de Vista */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-[#111622] border border-white/5 shadow-md space-y-3">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o departamento..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#090C15] border border-white/5 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Selectores y Modo de Vista */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as any)}
              className="bg-[#090C15] border border-white/5 rounded-2xl px-3 py-2.5 text-xs text-slate-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">Rol: Todos</option>
              <option value="admin">Administrador</option>
              <option value="user">Usuario</option>
              <option value="guest">Invitado</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-[#090C15] border border-white/5 rounded-2xl px-3 py-2.5 text-xs text-slate-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">Estado: Todos</option>
              <option value="active">Activos</option>
              <option value="suspended">Suspendidos</option>
            </select>

            {(roleFilter !== 'all' || statusFilter !== 'all' || appFilter !== 'all' || searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setRoleFilter('all');
                  setStatusFilter('all');
                  setAppFilter('all');
                  setSearchTerm('');
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpiar
              </button>
            )}

            {/* Switcher de Vista en Escritorio */}
            <div className="hidden md:flex items-center bg-[#090C15] p-1 rounded-2xl border border-white/5 ml-auto">
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'matrix'
                    ? 'bg-[#FF6B00] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                Matriz Compacta
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-[#FF6B00] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Tarjetas Detalle
              </button>
            </div>
          </div>
        </div>

        {/* Píldoras de Filtro Rápido por Aplicación */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mr-1 flex-shrink-0">
            <Filter className="w-3 h-3" /> Filtrar con acceso a:
          </span>
          <button
            type="button"
            onClick={() => setAppFilter('all')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex-shrink-0 ${
              appFilter === 'all'
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-[#090C15] text-slate-400 border-white/5 hover:text-white'
            }`}
          >
            Todas ({allProfiles.length})
          </button>
          {appsList.map(app => {
            const isSelected = appFilter === app.id;
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => setAppFilter(isSelected ? 'all' : app.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]/40'
                    : 'bg-[#090C15] text-slate-400 border-white/5 hover:border-white/15 hover:text-slate-200'
                }`}
              >
                <app.icon className={`w-3 h-3 ${app.color}`} />
                <span>{app.shortName}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/5 text-slate-300">
                  {appAccessCounts[app.id] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. VISTA MÓVIL OPTIMIZADA EN TARJETAS (Sin fotos laterales) */}
      <div className="block md:hidden space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Usuarios ({filteredProfiles.length})
          </h2>
          <span className="text-[10px] text-slate-500">Toca un usuario para gestionar</span>
        </div>

        {filteredProfiles.map(user => {
          const isAdmin = user.role === 'admin';
          const isSuspended = user.status === 'suspended';
          const isSelf = currentUser?.id === user.id;
          const isExpanded = expandedUserMobile === user.id;
          const activeAppsCount = isAdmin
            ? appsList.length
            : appsList.filter(a => getUserAppLevel(user, a.id) !== 'none').length;

          return (
            <div
              key={user.id}
              className={`p-4 rounded-3xl bg-[#111622] border border-white/5 space-y-3.5 shadow-lg transition-all ${
                isSuspended ? 'opacity-60' : ''
              }`}
            >
              {/* Header de Usuario sin foto */}
              <div className="flex items-start justify-between gap-3">
                <div className="border-l-2 pl-3 border-[#FF6B00]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-black text-white text-sm">{user.full_name}</h3>
                    {isSelf && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] font-bold">
                        Tú
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 text-slate-300 font-bold">
                      {activeAppsCount}/{appsList.length} apps
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate max-w-[230px]">{user.email}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{user.department || 'General'}</p>
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
                <span className="text-xs text-slate-400 font-medium">Rol asignado:</span>
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
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/5 border border-white/5 text-xs text-slate-200 font-bold transition-colors"
              >
                <span>Configurar Permisos ({activeAppsCount} de {appsList.length} activos)</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Grid de Permisos Móvil Desplegable */}
              {isExpanded && (
                <div className="space-y-2.5 pt-1">
                  {isAdmin ? (
                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center text-xs font-bold text-indigo-400 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Acceso Total Super Administrador
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2 pb-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Acción rápida:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleBulkUserPermissions(user.id, 'edit')}
                            className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold"
                          >
                            Activar Todo
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBulkUserPermissions(user.id, 'none')}
                            className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold"
                          >
                            Bloquear Todo
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {appsList.map(app => (
                          <div
                            key={app.id}
                            className="p-2.5 rounded-2xl bg-[#090C15] border border-white/5 flex flex-col justify-between gap-2"
                          >
                            <div className="flex items-center gap-1.5">
                              <app.icon className={`w-3.5 h-3.5 ${app.color} flex-shrink-0`} />
                              <span className="text-[11px] font-bold text-white truncate">{app.shortName}</span>
                            </div>
                            {renderPermissionControl(user, app, true)}
                          </div>
                        ))}
                      </div>
                    </>
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

      {/* 2A. VISTA ESCRITORIO: MATRIZ COMPACTA SIN FOTOS Y DE FÁCIL REVISIÓN */}
      {viewMode === 'matrix' && (
        <div className="hidden md:block p-5 sm:p-6 rounded-3xl bg-[#111622] border border-white/5 space-y-4 shadow-xl">
          {/* Cabecera + Leyenda Visual */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 pb-2 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#FF6B00]" />
              <div>
                <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                  Matriz de Control y Permisos ({filteredProfiles.length} usuarios)
                </h2>
                <p className="text-[11px] text-slate-400">
                  Haz clic directo en el icono de cada módulo para cambiar entre Bloqueado, Solo Lectura o Edición.
                </p>
              </div>
            </div>

            {/* Leyenda de Estados */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] bg-[#090C15] px-3.5 py-2 rounded-2xl border border-white/5">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mr-1">Leyenda:</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                <Ban className="w-3 h-3" /> Bloqueado
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold">
                <Eye className="w-3 h-3" /> Solo Lectura
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                <Edit3 className="w-3 h-3" /> Edición / Field Ops
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-[#090C15]/80">
                  <th className="py-3.5 px-4 min-w-[210px] rounded-tl-2xl">Usuario & Resumen</th>
                  <th className="py-3.5 px-2.5 text-center min-w-[115px]">Rol & Estado</th>
                  {appsList.map(app => (
                    <th key={app.id} className="py-3 px-1.5 text-center min-w-[104px]">
                      <button
                        type="button"
                        onClick={() => setAppFilter(appFilter === app.id ? 'all' : app.id)}
                        title={`Filtrar usuarios con acceso a ${app.name}`}
                        className={`w-full flex flex-col items-center justify-center gap-1 py-1 px-1.5 rounded-xl transition-all ${
                          appFilter === app.id
                            ? 'bg-[#FF6B00]/15 ring-1 ring-[#FF6B00]/40 text-white'
                            : 'hover:bg-white/5 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <app.icon className={`w-3.5 h-3.5 ${app.color} flex-shrink-0`} />
                          <span className="truncate max-w-[78px]">{app.shortName}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-500">
                          {appAccessCounts[app.id]}/{totalUsers} activos
                        </span>
                      </button>
                    </th>
                  ))}
                  <th className="py-3.5 px-3 text-right min-w-[120px] rounded-tr-2xl">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredProfiles.map(user => {
                  const isAdmin = user.role === 'admin';
                  const isSuspended = user.status === 'suspended';
                  const isSelf = currentUser?.id === user.id;

                  const activeAppsCount = isAdmin
                    ? appsList.length
                    : appsList.filter(a => getUserAppLevel(user, a.id) !== 'none').length;
                  const editAppsCount = isAdmin
                    ? appsList.length
                    : appsList.filter(a => getUserAppLevel(user, a.id) === 'edit').length;

                  return (
                    <tr
                      key={user.id}
                      className={`group hover:bg-white/[0.025] transition-colors ${
                        isSuspended ? 'opacity-55 bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Usuario Info (SIN FOTO LATERAL) */}
                      <td className="py-3.5 px-4">
                        <div
                          className={`border-l-[3px] pl-3 transition-colors ${
                            isSuspended
                              ? 'border-rose-500'
                              : isAdmin
                              ? 'border-indigo-500'
                              : activeAppsCount > 0
                              ? 'border-emerald-500'
                              : 'border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-extrabold text-white text-sm leading-tight">
                              {user.full_name}
                            </p>
                            {isSelf && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] font-black uppercase">
                                Tú
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{user.email}</p>

                          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/5 font-semibold">
                              {user.department || 'General'}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${
                                isAdmin
                                  ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                                  : activeAppsCount > 0
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-white/5 text-slate-500 border-white/5'
                              }`}
                              title={`${activeAppsCount} apps con acceso (${editAppsCount} con edición)`}
                            >
                              {activeAppsCount}/{appsList.length} apps
                            </span>
                          </div>

                          {user.last_login && (
                            <p className="text-[10px] text-slate-500 mt-1">
                              Último acceso: {new Date(user.last_login).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Rol & Estado Compactos */}
                      <td className="py-3.5 px-2.5 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <select
                            value={user.role}
                            disabled={isSelf}
                            onChange={e => handleRoleChange(user.id, e.target.value as Role)}
                            className={`w-full max-w-[105px] px-2 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border focus:outline-none cursor-pointer text-center ${
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

                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => handleStatusChange(user.id, user.status || 'active')}
                            className={`w-full max-w-[105px] px-2 py-0.5 rounded-lg font-bold text-[10px] border transition-all ${
                              !isSuspended
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-rose-500/15 hover:text-rose-400 hover:border-rose-500/30'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-emerald-500/15 hover:text-emerald-400'
                            }`}
                          >
                            {!isSuspended ? '● Activo' : '● Suspendido'}
                          </button>
                        </div>
                      </td>

                      {/* Celdas de Permisos por Aplicación */}
                      {appsList.map(app => {
                        if (isAdmin) {
                          return (
                            <td key={app.id} className="py-3.5 px-1.5 text-center">
                              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-300">
                                <CheckCircle2 className="w-4 h-4 mb-0.5 text-indigo-400" />
                                <span className="text-[10px] font-extrabold tracking-tight">Total Admin</span>
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td key={app.id} className="py-3 px-1.5 text-center align-middle">
                            {renderPermissionControl(user, app, true)}
                          </td>
                        );
                      })}

                      {/* Acciones + Atajos Masivos */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setResetPasswordUser(user)}
                              title="Cambiar contraseña"
                              className="p-1.5 text-slate-400 hover:text-amber-400 rounded-xl hover:bg-white/5 transition-colors"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditModal(user)}
                              title="Editar datos del usuario"
                              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => setUserToDelete(user)}
                                title="Eliminar usuario"
                                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-white/5 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Botones rápidos de fila para usuarios no admin */}
                          {!isAdmin && (
                            <div className="flex items-center gap-1 opacity-75 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleBulkUserPermissions(user.id, 'edit')}
                                title="Conceder acceso y edición a todas las apps"
                                className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold"
                              >
                                Todo Sí
                              </button>
                              <button
                                type="button"
                                onClick={() => handleBulkUserPermissions(user.id, 'none')}
                                title="Bloquear todas las apps para este usuario"
                                className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold"
                              >
                                Ninguno
                              </button>
                            </div>
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
      )}

      {/* 2B. VISTA ESCRITORIO: TARJETAS DETALLE (Cero scroll horizontal, ideal para revisar usuario por usuario) */}
      {viewMode === 'cards' && (
        <div className="hidden md:grid md:grid-cols-2 gap-4">
          {filteredProfiles.map(user => {
            const isAdmin = user.role === 'admin';
            const isSuspended = user.status === 'suspended';
            const isSelf = currentUser?.id === user.id;
            const activeAppsCount = isAdmin
              ? appsList.length
              : appsList.filter(a => getUserAppLevel(user, a.id) !== 'none').length;

            return (
              <div
                key={user.id}
                className={`p-5 rounded-3xl bg-[#111622] border border-white/5 flex flex-col justify-between space-y-4 shadow-xl transition-all ${
                  isSuspended ? 'opacity-60 border-rose-500/20' : 'hover:border-white/10'
                }`}
              >
                {/* Cabecera del Usuario (Sin foto lateral) */}
                <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-3.5">
                  <div
                    className={`border-l-4 pl-3.5 ${
                      isSuspended
                        ? 'border-rose-500'
                        : isAdmin
                        ? 'border-indigo-500'
                        : activeAppsCount > 0
                        ? 'border-emerald-500'
                        : 'border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-white">{user.full_name}</h3>
                      {isSelf && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] font-black">
                          Tú
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold border ${
                          isAdmin
                            ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                            : activeAppsCount > 0
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-white/5 text-slate-500 border-white/10'
                        }`}
                      >
                        {activeAppsCount} de {appsList.length} módulos activos
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span className="font-semibold text-slate-400">{user.department || 'General'}</span>
                      {user.last_login && (
                        <>
                          <span>•</span>
                          <span>Último acceso: {new Date(user.last_login).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Controles de Rol, Estado y Acciones */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={user.role}
                        disabled={isSelf}
                        onChange={e => handleRoleChange(user.id, e.target.value as Role)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border focus:outline-none cursor-pointer ${
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

                      <button
                        type="button"
                        disabled={isSelf}
                        onClick={() => handleStatusChange(user.id, user.status || 'active')}
                        className={`px-2.5 py-1 rounded-xl font-bold text-[10px] border transition-all ${
                          !isSuspended
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {!isSuspended ? 'Activo' : 'Suspendido'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {!isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleBulkUserPermissions(user.id, 'edit')}
                            className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold"
                          >
                            Activar Todo
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBulkUserPermissions(user.id, 'none')}
                            className="text-[10px] px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold"
                          >
                            Bloquear Todo
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setResetPasswordUser(user)}
                        title="Cambiar contraseña"
                        className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-white/5"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(user)}
                        title="Editar usuario"
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {!isSelf && (
                        <button
                          type="button"
                          onClick={() => setUserToDelete(user)}
                          title="Eliminar usuario"
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Grid de los 8 Módulos dentro de la Tarjeta */}
                {isAdmin ? (
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center gap-2 text-xs font-extrabold text-indigo-300">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Super Administrador — Control y edición habilitados en los {appsList.length} módulos
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {appsList.map(app => (
                      <div
                        key={app.id}
                        className="p-2.5 rounded-2xl bg-[#090C15]/70 border border-white/5 flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-center gap-1.5">
                          <app.icon className={`w-3.5 h-3.5 ${app.color} flex-shrink-0`} />
                          <span className="text-[11px] font-bold text-slate-200 truncate" title={app.name}>
                            {app.shortName}
                          </span>
                        </div>
                        {renderPermissionControl(user, app, true)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <GlobalExpenseCategoriesManager />

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
                <label className="text-slate-400 font-medium block mb-1">Preseleccionar Técnico Mecalux (Opcional)</label>
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      setAddName(val);
                      const clean = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(' ');
                      const generatedEmail = `${clean[0]}.${clean[1] || 'tecnico'}@mecalux.com`;
                      setAddEmail(generatedEmail);
                      setAddDepartment('Mecalux SGA');
                    }
                  }}
                  className="w-full bg-[#090C15] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-cyan-400 font-bold focus:outline-none mb-2"
                >
                  <option value="">-- Elegir de la lista de Técnicos Oficiales --</option>
                  <option value="Asier Beamonte Urretxo">Asier Beamonte Urretxo</option>
                  <option value="Hugo Uría Miguelez">Hugo Uría Miguelez</option>
                  <option value="Javier Masero Delgado">Javier Masero Delgado</option>
                  <option value="Jose Maria Abad Fernández">Jose Maria Abad Fernández</option>
                  <option value="Pablo Navareño Bernardo de la Rua">Pablo Navareño Bernardo de la Rua</option>
                  <option value="Pablo Plaza Perez">Pablo Plaza Perez</option>
                  <option value="Roberto Gomez Fernandez">Roberto Gomez Fernandez</option>
                  <option value="Yoel Rozada Penil">Yoel Rozada Penil</option>
                </select>
              </div>

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
                <label className="text-slate-400 font-medium block mb-1">Identificador / Usuario / Email</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. laura o laura@empresa.com"
                  value={addEmail}
                  onChange={e => setAddEmail(e.target.value)}
                  className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Departamento</label>
                  <input
                    type="text"
                    placeholder="Ej. Operaciones"
                    value={addDepartment}
                    onChange={e => setAddDepartment(e.target.value)}
                    className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

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
                <label className="text-slate-400 font-medium block mb-1">Email / Identificador</label>
                <input
                  type="text"
                  required
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Departamento</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={e => setEditDepartment(e.target.value)}
                    className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none"
                  />
                </div>

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
