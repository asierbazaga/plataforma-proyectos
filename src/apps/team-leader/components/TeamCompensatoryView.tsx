import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  X, 
  Calculator, 
  Filter, 
  Clock,
  User,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { agendaService } from '../../../services/agendaService';
import { AgendaCompensatoryDay } from '../../../types';

export const TeamCompensatoryView: React.FC = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  const [days, setDays] = useState<AgendaCompensatoryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Filtro de miembro del equipo ('all', 'Asier' / 'mío', o nombre del técnico)
  const [selectedMember, setSelectedMember] = useState<string>('all');

  // Form states
  const [newTechnician, setNewTechnician] = useState('Asier Bazaga (Team Leader)');
  const [customTechnicianName, setCustomTechnicianName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newTotal, setNewTotal] = useState<number | string>(1);
  const [newNotes, setNewNotes] = useState('');

  // Calculadora de agosto
  const [augustDays, setAugustDays] = useState<number | string>('');

  // Date selection state for logging spent days
  const [spendDateInputs, setSpendDateInputs] = useState<Record<string, string>>({});

  // Lista de técnicos sugeridos (o existentes en los registros)
  const knownTechnicians = React.useMemo(() => {
    const list = new Set<string>();
    list.add('Asier Bazaga (Team Leader)');
    days.forEach(d => {
      if (d.technician_name && d.technician_name.trim()) {
        list.add(d.technician_name.trim());
      }
    });
    return Array.from(list);
  }, [days]);

  useEffect(() => {
    if (currentUser?.id) {
      loadDays();
    }
  }, [currentUser]);

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

  const handleAddDay = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalNum = Number(newTotal);
    if (!newTitle.trim() || !currentUser?.id || !totalNum || totalNum <= 0) return;

    const assignedTechnician = newTechnician === '__custom__' 
      ? (customTechnicianName.trim() || 'Técnico Sin Nombre')
      : newTechnician;

    try {
      const day = await agendaService.createCompensatoryDay({
        user_id: currentUser.id,
        title: newTitle,
        technician_name: assignedTechnician,
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
      setCustomTechnicianName('');
      setIsAdding(false);
    } catch (error: any) {
      console.error('Error adding day:', error);
      alert('Error al guardar el día compensable.');
    }
  };

  const addSpentLog = async (day: AgendaCompensatoryDay) => {
    if (day.spent_days >= day.total_days) return;

    const dateToLog = spendDateInputs[day.id] || new Date().toISOString().split('T')[0];
    const newLog = { id: Date.now().toString(), date: dateToLog };
    const newLogs = [...(day.spent_logs || []), newLog];
    const newSpent = day.spent_days + 1;

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
    const newLogs = (day.spent_logs || []).filter(l => l.id !== logId);
    const newSpent = Math.max(0, day.spent_days - 1);

    // Optimistic
    setDays(days.map(d => d.id === day.id ? { ...d, spent_days: newSpent, spent_logs: newLogs } : d));

    try {
      await agendaService.updateCompensatoryDay(day.id, { spent_days: newSpent, spent_logs: newLogs });
    } catch (error) {
      console.error('Error removing spent log:', error);
      setDays(days.map(d => d.id === day.id ? { ...d, spent_days: day.spent_days, spent_logs: day.spent_logs } : d));
    }
  };

  const deleteDay = async (id: string) => {
    setDays(days.filter(d => d.id !== id));
    try {
      await agendaService.deleteCompensatoryDay(id);
    } catch (error) {
      console.error('Error deleting day:', error);
      loadDays();
    }
  };

  // Filtrado por miembro del equipo
  const filteredDays = days.filter(d => {
    if (selectedMember === 'all') return true;
    const tech = d.technician_name || 'Asier Bazaga (Team Leader)';
    return tech === selectedMember;
  });

  const totalEarned = filteredDays.reduce((sum, d) => sum + Number(d.total_days), 0);
  const totalSpent = filteredDays.reduce((sum, d) => sum + Number(d.spent_days), 0);
  const totalRemaining = totalEarned - totalSpent;

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
      {/* Barra de Filtros por Técnico y Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        {/* Selector de Miembro */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedMember('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedMember === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Todo el Equipo ({days.length})</span>
          </button>

          {knownTechnicians.map(tech => {
            const count = days.filter(d => (d.technician_name || 'Asier Bazaga (Team Leader)') === tech).length;
            const isSelected = selectedMember === tech;
            const isMe = tech.includes('Asier');

            return (
              <button
                key={tech}
                onClick={() => setSelectedMember(tech)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? isMe 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                      : 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{tech} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              showCalculator 
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' 
                : isDark 
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' 
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Calc. Horas Agosto</span>
          </button>

          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Asignar Compensable</span>
            </button>
          )}
        </div>
      </div>

      {/* Calculadora de Agosto */}
      {showCalculator && (
        <div className={`p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-slate-900/90 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Calculator className="w-4 h-4 text-indigo-400" />
                <h3 className={`font-bold text-sm ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  Cálculo de Días Compensables por Jornada Intensiva de Agosto
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Regla Mecalux: 36 minutos acumulados por cada día trabajado en jornada completa. Cada 8 horas (480 min) equivale a 1 día libre.
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
                  className={`w-28 px-3 py-2 rounded-xl border text-center font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="text-right min-w-[140px] flex flex-col items-end">
                <span className={`text-xl font-black ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
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

      {/* Tarjetas de Resumen KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Días Ganados</span>
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{totalEarned}</div>
          <p className="text-[11px] text-slate-500">
            {selectedMember === 'all' ? 'Total en todo el equipo' : `Asignados a ${selectedMember}`}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Días Disfrutados</span>
            <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{totalSpent}</div>
          <p className="text-[11px] text-slate-500">Días ya consumidos o librados</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-950/40 via-slate-900/80 to-blue-950/40 border border-indigo-500/30 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Saldo Disponible</span>
            <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-400">{totalRemaining}</div>
          <p className="text-[11px] text-slate-400">Días pendientes por disfrutar</p>
        </div>
      </div>

      {/* Formulario de Alta de Días Compensables */}
      {isAdding && (
        <form onSubmit={handleAddDay} className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Asignar Bolsa de Días Compensables
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
            {/* Asignado a */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Miembro del Equipo</label>
              <select
                value={newTechnician}
                onChange={(e) => setNewTechnician(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value="Asier Bazaga (Team Leader)">Asier Bazaga (Team Leader - Mío)</option>
                {knownTechnicians
                  .filter(t => !t.includes('Asier'))
                  .map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))
                }
                <option value="__custom__">+ Añadir nuevo técnico...</option>
              </select>

              {newTechnician === '__custom__' && (
                <input
                  type="text"
                  placeholder="Nombre y Apellidos del Técnico"
                  value={customTechnicianName}
                  onChange={(e) => setCustomTechnicianName(e.target.value)}
                  className="w-full mt-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-indigo-500/50 text-xs text-white focus:outline-none"
                  autoFocus
                />
              )}
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Motivo / Concepto</label>
              <input
                type="text"
                placeholder="Ej: Finde de guardia, Exceso jornada, Go-live..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Notas / Observaciones (Opcional)</label>
            <input
              type="text"
              placeholder="Detalles sobre el proyecto, guardia o autorización..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/20"
            >
              Guardar Bolsa
            </button>
          </div>
        </form>
      )}

      {/* Lista de Registros */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Registros ({filteredDays.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Mostrando: <strong className="text-slate-300">{selectedMember === 'all' ? 'Todo el equipo' : selectedMember}</strong>
          </span>
        </div>

        {filteredDays.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <Clock className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No hay registros para este filtro</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Pulsa en "+ Asignar Compensable" para registrar nuevos días ganados para ti o para los técnicos de tu equipo.
            </p>
          </div>
        ) : (
          filteredDays.map(day => {
            const progress = (day.spent_days / day.total_days) * 100;
            const isCompleted = day.spent_days >= day.total_days;
            const techName = day.technician_name || 'Asier Bazaga (Team Leader)';
            const isMe = techName.includes('Asier');

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
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg border ${
                        isMe 
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' 
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {techName}
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
                      {isCompleted ? 'Completamente Disfrutado' : `Saldo: ${day.total_days - day.spent_days} días`}
                    </span>

                    <button
                      onClick={() => deleteDay(day.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Eliminar bolsa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                    {(day.spent_logs || []).map((log) => (
                      <div 
                        key={log.id} 
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-950 border border-slate-800 text-slate-300"
                      >
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        <span>{new Date(log.date).toLocaleDateString()}</span>
                        <button 
                          onClick={() => removeSpentLog(day, log.id)}
                          className="hover:text-rose-400 ml-1 text-slate-500"
                          title="Deshacer este día librado"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {(!day.spent_logs || day.spent_logs.length === 0) && (
                      <span className="text-[11px] text-slate-500 italic">No se ha registrado ningún día librado aún.</span>
                    )}
                  </div>

                  {!isCompleted && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <input
                        type="date"
                        value={spendDateInputs[day.id] || ''}
                        onChange={(e) => setSpendDateInputs(prev => ({ ...prev, [day.id]: e.target.value }))}
                        className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
                      />
                      <button
                        onClick={() => addSpentLog(day)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Gastar 1 día</span>
                      </button>
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
