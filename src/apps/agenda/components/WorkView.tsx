import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Trash2, CheckCircle2, TrendingUp, TrendingDown, Calendar, X, Calculator } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { agendaService } from '../../../services/agendaService';
import { AgendaCompensatoryDay } from '../../../types';

export const WorkView: React.FC = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  const [days, setDays] = useState<AgendaCompensatoryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newTotal, setNewTotal] = useState<number | string>(1);
  const [newNotes, setNewNotes] = useState('');

  const [augustDays, setAugustDays] = useState<number | string>('');

  // Date selection state for logging spent days
  const [spendDateInputs, setSpendDateInputs] = useState<Record<string, string>>({});

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

    try {
      const day = await agendaService.createCompensatoryDay({
        user_id: currentUser.id,
        title: newTitle,
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
      alert('Error al guardar. Asegúrate de ejecutar el script SQL en Supabase.');
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
    setSpendDateInputs(prev => ({ ...prev, [day.id]: '' })); // reset input

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalEarned = days.reduce((sum, d) => sum + Number(d.total_days), 0);
  const totalSpent = days.reduce((sum, d) => sum + Number(d.spent_days), 0);
  const totalRemaining = totalEarned - totalSpent;

  const getAugustCompensation = () => {
    const d = Number(augustDays);
    if (!d || isNaN(d) || d <= 0) return { hours: 0, minutes: 0 };
    const totalMins = 36 * d;
    return {
      hours: Math.floor(totalMins / 60),
      minutes: totalMins % 60
    };
  };
  const augResult = getAugustCompensation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            Días Compensables
          </h2>
          <p className="text-sm text-slate-400">Controla los días de descanso que has ganado y gastado.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors border ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Calc. Agosto</span>
          </button>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              Añadir Días
            </button>
          )}
        </div>
      </div>

      {/* Calculator Section */}
      {showCalculator && (
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-800/80 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className={`font-semibold mb-1 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                Calculadora de Agosto
              </h3>
              <p className="text-sm text-slate-400">Introduce los días trabajados para ver tu compensación generada (36 min / día).</p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Días trabajados"
                value={augustDays}
                onChange={(e) => setAugustDays(e.target.value === '' ? '' : Number(e.target.value))}
                className={`w-32 px-4 py-2 rounded-xl border text-center font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <div className="text-right min-w-[120px]">
                <div className={`text-xl font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {augResult.hours}h {augResult.minutes}m
                </div>
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Generados
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-slate-400">Ganados Totales</h3>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{totalEarned}</p>
        </div>
        
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
              <TrendingDown className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-slate-400">Gastados Totales</h3>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{totalSpent}</p>
        </div>
        
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/20 text-indigo-500 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className={`text-sm font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>Saldo Disponible</h3>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{totalRemaining}</p>
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAddDay} className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">Concepto / Motivo</label>
                <input
                  type="text"
                  placeholder="Ej: Exceso anual, Finde trabajado..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Días Totales Ganados</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={newTotal}
                  onChange={(e) => setNewTotal(e.target.value === '' ? '' : Number(e.target.value))}
                  className={`w-full px-4 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Notas (Opcional)</label>
              <input
                type="text"
                placeholder="Detalles extra..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
                }`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      )}

      {/* List */}
      <div className="space-y-4">
        {days.length === 0 ? (
          <div className={`col-span-full p-8 text-center rounded-2xl border border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
            <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No has registrado ningún día compensable.</p>
          </div>
        ) : (
          days.map(day => {
            const progress = (day.spent_days / day.total_days) * 100;
            const isCompleted = day.spent_days >= day.total_days;

            return (
              <div
                key={day.id}
                className={`relative flex flex-col p-4 sm:p-5 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'
                } ${isCompleted ? 'opacity-70' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'} ${isCompleted ? 'line-through' : ''}`}>
                        {day.title}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400">
                        {new Date(day.date).toLocaleDateString()}
                      </span>
                    </div>
                    {day.notes && (
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{day.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteDay(day.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Eliminar bolsa completa"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1 font-medium text-slate-400">
                    <span>Gastados: {day.spent_days}</span>
                    <span>Total: {day.total_days}</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div 
                      className={`h-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                </div>

                {/* Spent Logs & Add Spends */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end mt-2 pt-4 border-t border-slate-700/30">
                  <div className="flex flex-wrap gap-2 flex-1">
                    {(day.spent_logs || []).map((log) => (
                      <div key={log.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        <span>{new Date(log.date).toLocaleDateString()}</span>
                        <button 
                          onClick={() => removeSpentLog(day, log.id)}
                          className="ml-1 hover:text-rose-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {(day.spent_logs?.length === 0 || !day.spent_logs) && (
                      <span className="text-xs text-slate-500 italic">No hay días gastados registrados.</span>
                    )}
                  </div>

                  {!isCompleted && (
                    <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
                      <input
                        type="date"
                        value={spendDateInputs[day.id] || ''}
                        onChange={(e) => setSpendDateInputs(prev => ({ ...prev, [day.id]: e.target.value }))}
                        className={`px-3 py-1.5 rounded-xl border text-sm outline-none transition-all h-9 ${
                          isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                        }`}
                        style={{ colorScheme: isDark ? 'dark' : 'light' }}
                        title="Fecha en la que gastas el día"
                      />
                      <button
                        onClick={() => addSpentLog(day)}
                        className="flex items-center gap-1.5 px-3 py-1.5 h-9 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4" />
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
