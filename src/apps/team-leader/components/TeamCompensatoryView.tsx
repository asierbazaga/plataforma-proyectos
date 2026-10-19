import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Calculator, 
  CalendarPlus,
  Mail
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { agendaService } from '../../../services/agendaService';
import { AgendaCompensatoryDay, UserProfile } from '../../../types';

export interface TeamMemberProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  isLead: boolean;
}

export const TeamCompensatoryView: React.FC = () => {
  const { currentUser, allProfiles, permissions } = useAuth();
  const { isDark } = useTheme();
  
  // Asier es Team Leader / Admin
  const isTeamLeader = currentUser?.role === 'admin' || currentUser?.email?.toLowerCase().includes('asier.bazaga');

  const [days, setDays] = useState<AgendaCompensatoryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  // Construir la lista de miembros basándose exclusivamente en los usuarios/correos dados de alta en la plataforma
  const teamMembers = useMemo<TeamMemberProfile[]>(() => {
    const profilesMap = new Map<string, UserProfile>();
    allProfiles.forEach(p => profilesMap.set(p.id, p));
    if (currentUser && !profilesMap.has(currentUser.id)) {
      profilesMap.set(currentUser.id, currentUser);
    }

    const relevantProfiles = Array.from(profilesMap.values()).filter(p => {
      if (p.status === 'suspended') return false;
      const emailLower = (p.email || '').toLowerCase();
      const isLeadUser = p.role === 'admin' || emailLower.includes('asier.bazaga');
      const isMecaluxEmail = emailLower.includes('@mecalux.com');
      const hasMecaluxPerm = permissions.some(
        perm => perm.user_id === p.id && perm.app_id === 'entrevistas' && perm.can_access
      );
      const hasDays = days.some(d => d.user_id === p.id);
      const isCurrent = currentUser?.id === p.id;

      return isLeadUser || isMecaluxEmail || hasMecaluxPerm || hasDays || isCurrent;
    });

    return relevantProfiles
      .map(p => {
        const isLead = p.role === 'admin' || p.email.toLowerCase().includes('asier.bazaga');
        return {
          id: p.id,
          name: p.full_name,
          email: p.email,
          role: isLead ? 'Team Leader' : 'Técnico',
          isLead
        };
      })
      .sort((a, b) => {
        if (a.isLead && !b.isLead) return -1;
        if (!a.isLead && b.isLead) return 1;
        return a.name.localeCompare(b.name, 'es');
      });
  }, [allProfiles, permissions, days, currentUser]);

  // Resolver a qué usuario dado de alta pertenece un registro de días compensables
  const resolveDayOwner = (day: AgendaCompensatoryDay): TeamMemberProfile => {
    // 1. Si el registro tiene un tag [TECH:...] explícito y fue creado por el admin para otro técnico,
    // buscar primero si coincide exactamente con el correo o ID de algún usuario registrado
    const rawTech = (day.technician_name || '').trim().toLowerCase();
    const ownerById = teamMembers.find(m => m.id === day.user_id);

    if (rawTech && (!ownerById || ownerById.isLead)) {
      const matchByEmailOrId = teamMembers.find(
        m =>
          m.id.toLowerCase() === rawTech ||
          m.email.toLowerCase() === rawTech ||
          m.name.toLowerCase() === rawTech
      );
      if (matchByEmailOrId) return matchByEmailOrId;

      // Coincidencia por prefijo de correo corporativo (ej: pablo.plaza, pablo.navareno, jmaria.abad)
      const matchByEmailPrefix = teamMembers.find(m => {
        const prefix = m.email.toLowerCase().split('@')[0];
        if (prefix.length < 4) return false;
        const normalizeStr = (s: string) =>
          s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const normTech = normalizeStr(rawTech);
        const normName = normalizeStr(m.name);
        if (normTech === normName) return true;
        // Comparar apellidos específicos del correo (ej: pablo.plaza vs pablo.navareno)
        const emailParts = prefix.split('.').filter(part => part.length >= 4);
        return emailParts.length > 0 && emailParts.every(part => normTech.includes(part));
      });
      if (matchByEmailPrefix) return matchByEmailPrefix;
    }

    // 2. Coincidencia directa y exacta por el user_id del usuario registrado en base de datos
    if (ownerById) {
      return ownerById;
    }

    // 3. Fallback buscando en todos los perfiles dados de alta por user_id
    const anyProfile = allProfiles.find(p => p.id === day.user_id);
    if (anyProfile) {
      const isLead = anyProfile.role === 'admin' || anyProfile.email.toLowerCase().includes('asier.bazaga');
      return {
        id: anyProfile.id,
        name: anyProfile.full_name,
        email: anyProfile.email,
        role: isLead ? 'Team Leader' : 'Técnico',
        isLead
      };
    }

    return {
      id: day.user_id || 'unknown',
      name: day.technician_name || 'Usuario',
      email: '',
      role: 'Técnico',
      isLead: false
    };
  };

  // Filtro de miembro seleccionado ('all' o el ID del usuario registrado)
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    isTeamLeader ? 'all' : (currentUser?.id || 'all')
  );

  // Estado del formulario para asignar días a un usuario registrado (por su ID)
  const [newTechnicianId, setNewTechnicianId] = useState<string>(
    currentUser?.id || ''
  );
  const [newTitle, setNewTitle] = useState('');
  const [newTotal, setNewTotal] = useState<number | string>(1);
  const [newNotes, setNewNotes] = useState('');

  // Sincronizar automáticamente el usuario activo cuando inicia sesión
  useEffect(() => {
    if (currentUser?.id) {
      if (!isTeamLeader) {
        setSelectedMemberId(currentUser.id);
      }
      setNewTechnicianId(currentUser.id);
    }
  }, [currentUser?.id, isTeamLeader]);

  // Calculadora de agosto
  const [augustDays, setAugustDays] = useState<number | string>('');

  // Date selection state for logging spent days
  const [spendDateInputs, setSpendDateInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currentUser?.id) {
      loadDays();
    }
  }, [currentUser?.id]);

  const loadDays = async () => {
    try {
      setLoading(true);
      const data = await agendaService.getCompensatoryDays(currentUser!.id);
      setDays(data);
    } catch (error) {
      console.error('Error loading compensatory days:', error);
    } finally {
      setLoading(false);
    }
  };

  // Estadísticas por cada usuario registrado (indexado por member.id)
  const memberStats = useMemo(() => {
    const stats: Record<string, { earned: number; spent: number; remaining: number; totalBags: number }> = {};
    
    teamMembers.forEach(m => {
      stats[m.id] = { earned: 0, spent: 0, remaining: 0, totalBags: 0 };
    });

    days.forEach(d => {
      const owner = resolveDayOwner(d);
      if (!stats[owner.id]) {
        stats[owner.id] = { earned: 0, spent: 0, remaining: 0, totalBags: 0 };
      }
      stats[owner.id].earned += Number(d.total_days || 0);
      stats[owner.id].spent += Number(d.spent_days || 0);
      stats[owner.id].totalBags += 1;
    });

    Object.keys(stats).forEach(k => {
      stats[k].remaining = Number((stats[k].earned - stats[k].spent).toFixed(1));
    });

    return stats;
  }, [teamMembers, days, allProfiles]);

  const handleAddDay = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalNum = Number(newTotal);
    if (!newTitle.trim() || !currentUser?.id || !totalNum || totalNum <= 0) return;

    // Determinar el usuario destinatario real a partir de los usuarios dados de alta
    const targetMember = !isTeamLeader
      ? teamMembers.find(m => m.id === currentUser.id)
      : teamMembers.find(m => m.id === newTechnicianId);

    const targetUserId = targetMember?.id || currentUser.id;
    const targetUserName = targetMember?.name || currentUser.full_name;

    try {
      const day = await agendaService.createCompensatoryDay({
        user_id: targetUserId,
        title: newTitle,
        technician_name: targetUserName,
        total_days: totalNum,
        spent_days: 0,
        notes: newNotes,
        spent_logs: [],
        date: new Date().toISOString().split('T')[0]
      });
      
      setDays([day, ...days]);
      setNewTitle('');
      setNewTotal(1);
      setNewNotes('');
      setIsAdding(false);
    } catch (error: any) {
      console.error('Error adding day:', error);
      alert('Error al guardar el día compensable.');
    }
  };

  const addSpentLog = async (day: AgendaCompensatoryDay, amount: number = 1) => {
    if (day.spent_days >= day.total_days) return;

    const remaining = day.total_days - day.spent_days;
    const actualSpend = Math.min(amount, remaining);
    const dateToLog = spendDateInputs[day.id] || new Date().toISOString().split('T')[0];
    const newLog = { 
      id: Date.now().toString(), 
      date: dateToLog,
      days: actualSpend
    };
    const newLogs = [...(day.spent_logs || []), newLog];
    const newSpent = Number((day.spent_days + actualSpend).toFixed(1));

    // Optimistic
    setDays(days.map(d => d.id === day.id ? { ...d, spent_days: newSpent, spent_logs: newLogs } : d));
    setSpendDateInputs(prev => ({ ...prev, [day.id]: '' }));

    try {
      await agendaService.updateCompensatoryDay(day.id, { spent_days: newSpent, spent_logs: newLogs });
    } catch (error) {
      console.error('Error adding spent log:', error);
      setDays(days.map(d => d.id === day.id ? { ...d, spent_days: day.spent_days, spent_logs: day.spent_logs } : d));
    }
  };

  const removeSpentLog = async (day: AgendaCompensatoryDay, logId: string) => {
    const targetLog = (day.spent_logs || []).find(l => l.id === logId);
    const amountToDeduct = (targetLog as any)?.days || 1;
    const newLogs = (day.spent_logs || []).filter(l => l.id !== logId);
    const newSpent = Math.max(0, Number((day.spent_days - amountToDeduct).toFixed(1)));

    // Optimistic
    setDays(days.map(d => d.id === day.id ? { ...d, spent_days: newSpent, spent_logs: newLogs } : d));

    try {
      await agendaService.updateCompensatoryDay(day.id, { spent_days: newSpent, spent_logs: newLogs });
    } catch (error) {
      console.error('Error removing spent log:', error);
      setDays(days.map(d => d.id === day.id ? { ...d, spent_days: day.spent_days, spent_logs: day.spent_logs } : d));
    }
  };

  const deleteDay = async (day: AgendaCompensatoryDay) => {
    const owner = resolveDayOwner(day);
    if (!isTeamLeader && day.user_id !== currentUser?.id && owner.id !== currentUser?.id) return;
    setDays(days.filter(d => d.id !== day.id));
    try {
      await agendaService.deleteCompensatoryDay(day.id);
    } catch (error) {
      console.error('Error deleting day:', error);
      loadDays();
    }
  };

  // Filtrado estricto por ID de usuario dado de alta
  const filteredDays = days.filter(d => {
    const owner = resolveDayOwner(d);
    if (!isTeamLeader) {
      return Boolean(currentUser?.id && (d.user_id === currentUser.id || owner.id === currentUser.id));
    }
    if (selectedMemberId === 'all') return true;
    return owner.id === selectedMemberId;
  });

  const selectedMemberObj = useMemo(
    () => teamMembers.find(m => m.id === selectedMemberId) || null,
    [teamMembers, selectedMemberId]
  );

  const totalEarned = Number(filteredDays.reduce((sum, d) => sum + Number(d.total_days), 0).toFixed(1));
  const totalSpent = Number(filteredDays.reduce((sum, d) => sum + Number(d.spent_days), 0).toFixed(1));
  const totalRemaining = Number((totalEarned - totalSpent).toFixed(1));

  // Calculadora de Agosto Mecalux
  const getAugustCompensation = () => {
    const d = Number(augustDays);
    if (!d || isNaN(d) || d <= 0) return { hours: 0, minutes: 0, extraMsg: null, subMsg: null, isSuccess: false };
    const totalMins = 36 * d;
    
    let extraMsg = null;
    let subMsg = null;
    let isSuccess = false;

    const targetMins = 480; // 8 hours = 1 day
    const thresholdMins = 240; // 4 hours

    const earnedDays = Math.floor(totalMins / targetMins);
    const remainder = totalMins % targetMins;

    const formatTime = (mins: number) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h > 0 ? `${h}h ` : ''}${m}m`;
    };

    if (earnedDays === 0) {
      if (remainder > thresholdMins) {
        extraMsg = `Llevas ${formatTime(remainder)}. Faltan ${formatTime(targetMins - remainder)} para 1 día extra.`;
      } else if (remainder > 0) {
        extraMsg = `Llevas ${formatTime(remainder)} (no computa día al ser menos de 4h).`;
      }
    } else {
      isSuccess = true;
      extraMsg = `¡Generado ${earnedDays} día${earnedDays > 1 ? 's' : ''} extra!`;
      
      if (remainder > thresholdMins) {
        subMsg = `Llevas ${formatTime(remainder)}. Faltan ${formatTime(targetMins - remainder)} para el siguiente.`;
      } else if (remainder > 0) {
        subMsg = `Sobran ${formatTime(remainder)} (no computa día extra).`;
      }
    }

    return {
      hours: Math.floor(totalMins / 60),
      minutes: totalMins % 60,
      extraMsg,
      subMsg,
      isSuccess
    };
  };
  const augResult = getAugustCompensation();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Tarjetas del Equipo de Usuarios Dados de Alta (Solo visible si eres Team Leader Asier) */}
      {isTeamLeader ? (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Usuarios Mecalux Dados de Alta ({teamMembers.length})
              </h2>
              <p className="text-xs text-slate-400">
                Selecciona un usuario registrado para filtrar sus bolsas o asignarle nuevos días compensables
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  showCalculator 
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' 
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                <span>Calc. Horas Agosto</span>
              </button>

              {!isAdding && (
                <button
                  onClick={() => {
                    if (selectedMemberId !== 'all') {
                      setNewTechnicianId(selectedMemberId);
                    } else if (currentUser?.id) {
                      setNewTechnicianId(currentUser.id);
                    }
                    setIsAdding(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Días</span>
                </button>
              )}
            </div>
          </div>

          {/* Grid de Usuarios Registrados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {/* Botón Ver Todos */}
            <button
              onClick={() => setSelectedMemberId('all')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                selectedMemberId === 'all'
                  ? 'bg-gradient-to-b from-indigo-900/60 to-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {days.length} bolsas
                </span>
              </div>
              <div>
                <p className="text-xs font-black text-white">Todo el Equipo</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Vista global de usuarios</p>
              </div>
            </button>

            {/* Tarjetas individuales de los usuarios dados de alta */}
            {teamMembers.map((m) => {
              const isSelected = selectedMemberId === m.id;
              const stats = memberStats[m.id] || { earned: 0, spent: 0, remaining: 0, totalBags: 0 };
              const initials = m.name
                .split(' ')
                .filter(p => p.length > 1)
                .slice(0, 2)
                .map(p => p[0])
                .join('')
                .toUpperCase();

              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMemberId(m.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                    isSelected
                      ? m.isLead
                        ? 'bg-gradient-to-b from-blue-900/60 to-slate-900 border-blue-500/50 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                        : 'bg-gradient-to-b from-cyan-900/60 to-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm ${
                      m.isLead 
                        ? 'bg-blue-600/25 text-blue-300 border border-blue-500/30' 
                        : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {initials || m.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {stats.totalBags} reg.
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        stats.remaining > 0 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {stats.remaining} d.
                      </span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white truncate" title={m.name}>
                      {m.name}
                    </p>
                    <p className="text-[11px] text-cyan-400/90 font-medium truncate flex items-center gap-1" title={m.email}>
                      <Mail className="w-3 h-3 flex-shrink-0 opacity-75" />
                      <span className="truncate">{m.email}</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Vista de Cabecera para el Usuario/Técnico logueado */
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Tus Días Compensables ({currentUser?.full_name})
                </h2>
                {currentUser?.email && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    <Mail className="w-3 h-3" />
                    {currentUser.email}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Consulta tu saldo disponible, registra tus días librados o solicita nuevas bolsas por guardias/intervenciones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-400" />
              <span>Calc. Agosto</span>
            </button>

            {!isAdding && (
              <button
                onClick={() => {
                  if (currentUser?.id) setNewTechnicianId(currentUser.id);
                  setIsAdding(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir Días</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Calculadora de Horas de Agosto (Desplegable) */}
      {showCalculator && (
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-indigo-500/30 shadow-xl transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Calculator className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-indigo-300">
                  Calculadora de Días Compensables por Jornada Intensiva de Agosto
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Regla Mecalux: 36 minutos acumulados por cada día trabajado en jornada intensiva. Cada 8 horas (480 min) equivale a 1 día libre.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Días Trabajados</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ej: 21"
                  value={augustDays}
                  onChange={(e) => setAugustDays(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-28 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-center font-bold text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="text-right min-w-[140px] flex flex-col items-end">
                <span className="text-xl font-black text-indigo-400">
                  {augResult.hours}h {augResult.minutes}m
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Tiempo Generado
                </span>
                
                {augResult.extraMsg && (
                  <div className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg max-w-[180px] text-center ${
                    augResult.isSuccess 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    <div>{augResult.extraMsg}</div>
                    {augResult.subMsg && (
                      <div className="mt-1 pt-1 border-t border-current/20 opacity-90 text-[10px]">
                        {augResult.subMsg}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Métricas Globales del Miembro o Equipo Seleccionado */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Días Ganados</span>
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{totalEarned} días</div>
          <p className="text-[11px] text-slate-500">
            {isTeamLeader && selectedMemberId === 'all' 
              ? 'Total sumando todo el equipo' 
              : 'Asignados en total'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Días Disfrutados</span>
            <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{totalSpent} días</div>
          <p className="text-[11px] text-slate-500">Consumidos o librados</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-tr from-cyan-950/40 via-slate-900/80 to-blue-950/40 border border-cyan-500/30 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Saldo Pendiente</span>
            <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-400">{totalRemaining} días</div>
          <p className="text-[11px] text-slate-400">Disponibles por librar</p>
        </div>
      </div>

      {/* 4. Formulario de Alta de Días Compensables */}
      {isAdding && (
        <form onSubmit={handleAddDay} className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              {isTeamLeader ? 'Asignar Días Compensables a Usuario' : 'Añadir Días Compensables'}
            </h3>
            <button 
              type="button" 
              onClick={() => setIsAdding(false)} 
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Asignado a (basado en los usuarios dados de alta) */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Usuario / Correo Dado de Alta</label>
              {isTeamLeader ? (
                <select
                  value={newTechnicianId}
                  onChange={(e) => setNewTechnicianId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                >
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  disabled
                  value={`${currentUser?.full_name || ''} (${currentUser?.email || ''})`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 font-bold opacity-80 cursor-not-allowed"
                />
              )}
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Motivo / Concepto</label>
              <input
                type="text"
                placeholder="Ej: Finde guardia, Puesta en marcha, Exceso..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            {/* Cantidad de días */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Días Ganados</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={newTotal}
                onChange={(e) => setNewTotal(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Notas / Observaciones (Opcional)</label>
            <input
              type="text"
              placeholder="Instalación, cliente, horario o notas adicionales..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-500/20"
            >
              Guardar
            </button>
          </div>
        </form>
      )}

      {/* 5. Lista de Registros */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isTeamLeader ? 'Registros Detallados' : 'Tus Bolsas Asignadas'} ({filteredDays.length})
          </h3>
          <span className="text-[11px] text-slate-400">
            {isTeamLeader ? (
              <>
                Filtrando por:{' '}
                <strong className="text-white">
                  {selectedMemberId === 'all'
                    ? 'Todo el equipo'
                    : `${selectedMemberObj?.name || ''} (${selectedMemberObj?.email || ''})`}
                </strong>
              </>
            ) : (
              <span className="text-emerald-400 font-bold">
                Cuenta activa: {currentUser?.email}
              </span>
            )}
          </span>
        </div>

        {filteredDays.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
              <CalendarPlus className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="text-base font-bold text-white">
                {isTeamLeader 
                  ? `No hay registros para ${selectedMemberId === 'all' ? 'el equipo' : `${selectedMemberObj?.name} (${selectedMemberObj?.email})`}`
                  : `Aún no tienes bolsas de días compensables registradas (${currentUser?.full_name})`}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isTeamLeader 
                  ? 'Asigna nuevas bolsas de días generados por guardias, puestas en marcha o exceso de jornada a los usuarios dados de alta.' 
                  : 'Registra tus días ganados por guardias de fin de semana, puestas en marcha en clientes o exceso de horas para llevar el control de tu saldo y libranzas.'}
              </p>
            </div>

            {!isAdding && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isTeamLeader && selectedMemberId !== 'all') {
                      setNewTechnicianId(selectedMemberId);
                    } else if (currentUser?.id) {
                      setNewTechnicianId(currentUser.id);
                    }
                    setIsAdding(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir Días</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredDays.map(day => {
            const progress = (day.spent_days / day.total_days) * 100;
            const isCompleted = day.spent_days >= day.total_days;
            const owner = resolveDayOwner(day);

            return (
              <div
                key={day.id}
                className={`p-5 rounded-2xl bg-slate-900/80 border transition-all ${
                  isCompleted ? 'border-slate-800/60 opacity-60' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border flex items-center gap-1.5 ${
                        owner.isLead 
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' 
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}>
                        <span className="uppercase">{owner.name}</span>
                        {owner.email && (
                          <span className="text-[10px] font-normal opacity-80 lowercase">
                            ({owner.email})
                          </span>
                        )}
                      </span>
                      <h4 className={`text-sm font-bold text-white ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                        {day.title}
                      </h4>
                      <span className="text-[10px] text-slate-500">
                        {new Date(day.date).toLocaleDateString()}
                      </span>
                    </div>

                    {day.notes && (
                      <p className="text-xs text-slate-400">{day.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
                      isCompleted 
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}>
                      {isCompleted ? 'Completado' : `Saldo: ${Number((day.total_days - day.spent_days).toFixed(1))} d.`}
                    </span>

                    {(isTeamLeader || day.user_id === currentUser?.id || owner.id === currentUser?.id) && (
                      <button
                        onClick={() => deleteDay(day)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Eliminar bolsa completa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-[11px] font-medium text-slate-400">
                    <span>Disfrutados: <strong className="text-white">{day.spent_days}</strong></span>
                    <span>Total bolsa: <strong className="text-white">{day.total_days} días</strong></span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                </div>

                {/* Días disfrutados y botón de gasto */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center pt-3 border-t border-slate-800/60">
                  <div className="flex flex-wrap gap-1.5 flex-1 items-center">
                    {(day.spent_logs || []).map((log: any) => (
                      <div 
                        key={log.id} 
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-950 border border-slate-800 text-slate-300"
                      >
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        <span>{new Date(log.date).toLocaleDateString()}</span>
                        {log.days && log.days < 1 && (
                          <span className="text-[10px] font-bold text-amber-400">({log.days}d)</span>
                        )}
                        <button 
                          onClick={() => removeSpentLog(day, log.id)}
                          className="hover:text-rose-400 ml-1 text-slate-500 font-bold"
                          title="Deshacer este día gastado"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {(!day.spent_logs || day.spent_logs.length === 0) && (
                      <span className="text-[11px] text-slate-500 italic">No se ha registrado ningún día gastado aún.</span>
                    )}
                  </div>

                  {!isCompleted && (
                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                      <input
                        type="date"
                        value={spendDateInputs[day.id] || ''}
                        onChange={(e) => setSpendDateInputs(prev => ({ ...prev, [day.id]: e.target.value }))}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                        title="Fecha en la que gastas el día"
                      />
                      <button
                        onClick={() => addSpentLog(day, 1)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 whitespace-nowrap"
                        title="Gastar 1 día"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Gastar 1 día</span>
                      </button>
                      {day.total_days - day.spent_days >= 0.5 && (
                        <button
                          onClick={() => addSpentLog(day, 0.5)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all whitespace-nowrap"
                          title="Gastar 0.5 día (media jornada)"
                        >
                          <span>0.5 día</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
