import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Dumbbell, DollarSign, BookOpen, BookMarked, CheckCircle2, XCircle, Edit3, Eye, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppId, Role } from '../types';

interface UserManagementProps {
  onBack?: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
  const { allProfiles, permissions, updatePermissions, addUser } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state para crear usuario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('user');
  const [department, setDepartment] = useState('Operaciones');

  const appsList: { id: AppId; name: string; icon: React.FC<{ className?: string }>; color: string }[] = [
    { id: 'fitness', name: 'APP FITNESS', icon: Dumbbell, color: 'text-orange-400' },
    { id: 'gastos', name: 'APP GASTOS', icon: DollarSign, color: 'text-emerald-400' },
    { id: 'libros-juegos', name: 'LIBROS & JUEGOS', icon: BookOpen, color: 'text-purple-400' },
    { id: 'lore', name: 'APP LORE', icon: BookMarked, color: 'text-blue-400' },
  ];

  const handleToggleAccess = async (userId: string, appId: AppId, currentAccess: boolean, currentEdit: boolean) => {
    // Si desactivamos acceso, también desactivamos edición
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
  };

  const handleToggleEdit = async (userId: string, appId: AppId, currentAccess: boolean, currentEdit: boolean) => {
    // Para cambiar edición, el acceso debe estar activado
    if (!currentAccess) return;
    const newEdit = !currentEdit;

    const userPerms = appsList.map(a => {
      if (a.id === appId) {
        return { user_id: userId, app_id: a.id, can_access: true, can_edit: newEdit };
      }
      const existing = permissions.find(p => p.user_id === userId && p.app_id === a.id);
      return existing || { user_id: userId, app_id: a.id, can_access: false, can_edit: false };
    });

    await updatePermissions(userId, userPerms);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    await addUser(name, email, role, department);
    setName('');
    setEmail('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-transparent p-6 rounded-2xl border border-indigo-500/20">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              title="Volver a la Plataforma"
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-700 hover:border-indigo-400 transition-all flex items-center justify-center group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              MATRIZ DE CONTROL DE ACCESO (RBAC)
            </h1>
            <p className="text-slate-400 text-sm">Gestiona usuarios y asigna o revoca permisos para cada una de las 4 aplicaciones.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" /> Plataforma
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-105"
          >
            <UserPlus className="w-5 h-5" />
            Crear Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Permissions Table Matrix */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          Matriz de Permisos por Usuario
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-900/60">
                <th className="py-4 px-4 min-w-[220px]">Usuario / Perfil</th>
                <th className="py-4 px-4 text-center">Rol</th>
                {appsList.map(app => (
                  <th key={app.id} className="py-4 px-4 text-center min-w-[140px]">
                    <div className="flex items-center justify-center gap-1.5 text-slate-200">
                      <app.icon className={`w-4 h-4 ${app.color}`} />
                      <span>{app.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {allProfiles.map(user => {
                const isAdmin = user.role === 'admin';

                return (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* User Profile Cell */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={user.full_name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/20"
                        />
                        <div>
                          <p className="font-bold text-white text-sm">{user.full_name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                          <span className="text-[10px] text-slate-500 font-medium">{user.department}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role Cell */}
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        user.role === 'admin' 
                          ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' 
                          : user.role === 'user'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Matrix App Permission Toggles */}
                    {appsList.map(app => {
                      if (isAdmin) {
                        return (
                          <td key={app.id} className="py-4 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Total (Admin)
                            </span>
                          </td>
                        );
                      }

                      const userPerm = permissions.find(p => p.user_id === user.id && p.app_id === app.id);
                      const canAccess = userPerm ? userPerm.can_access : false;
                      const canEdit = userPerm ? userPerm.can_edit : false;

                      return (
                        <td key={app.id} className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            {/* Toggle Access Switch */}
                            <button
                              onClick={() => handleToggleAccess(user.id, app.id, canAccess, canEdit)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                                canAccess
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
                                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                              }`}
                            >
                              {canAccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              {canAccess ? 'Acceso SI' : 'Acceso NO'}
                            </button>

                            {/* Mode Indicator (Edit vs Read-Only) */}
                            {canAccess && (
                              <button
                                onClick={() => handleToggleEdit(user.id, app.id, canAccess, canEdit)}
                                className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 border transition-all ${
                                  canEdit
                                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {canEdit ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                {canEdit ? 'Edición' : 'Solo Lectura'}
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Usuario */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-400" />
              Crear Nuevo Usuario
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. María Sánchez"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="maria@plataforma.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Rol Inicial</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as Role)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                    <option value="guest">Invitado</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Departamento</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
