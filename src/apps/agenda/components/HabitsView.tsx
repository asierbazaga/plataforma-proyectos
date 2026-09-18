import React, { useState, useEffect } from 'react';
import { Activity, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { agendaService } from '../../../services/agendaService';
import { AgendaHabit, AgendaHabitLog } from '../../../types';

interface HabitWithLogs {
  habit: AgendaHabit;
  logs: AgendaHabitLog[];
}

export const HabitsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  const [habitsData, setHabitsData] = useState<HabitWithLogs[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newHabitName, setNewHabitName] = useState('');

  // Get last 7 days for the tracker UI
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  useEffect(() => {
    if (currentUser?.id) {
      loadHabits();
    }
  }, [currentUser]);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const data = await agendaService.getHabits(currentUser!.id);
      setHabitsData(data);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim() || !currentUser?.id) return;

    try {
      const habit = await agendaService.createHabit({
        user_id: currentUser.id,
        name: newHabitName,
        frequency: 'daily',
        color: '#10B981' // default emerald
      });
      
      setHabitsData([...habitsData, { habit, logs: [] }]);
      setNewHabitName('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const deleteHabit = async (habitId: string) => {
    setHabitsData(habitsData.filter(h => h.habit.id !== habitId));
    try {
      await agendaService.deleteHabit(habitId);
    } catch (error) {
      console.error('Error deleting habit:', error);
      loadHabits();
    }
  };

  const toggleLog = async (habitId: string, date: string) => {
    // Optimistic update
    setHabitsData(prev => prev.map(hd => {
      if (hd.habit.id === habitId) {
        const hasLog = hd.logs.some(l => l.completed_date === date);
        if (hasLog) {
          return { ...hd, logs: hd.logs.filter(l => l.completed_date !== date) };
        } else {
          return { ...hd, logs: [...hd.logs, { id: 'temp', habit_id: habitId, completed_date: date, created_at: new Date().toISOString() }] };
        }
      }
      return hd;
    }));

    try {
      await agendaService.toggleHabitLog(habitId, date);
    } catch (error) {
      console.error('Error toggling habit log:', error);
      loadHabits(); // reload to fix sync
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Tracker de Hábitos
          </h2>
          <p className="text-sm text-slate-400">Construye constancia marcando tus logros diarios.</p>
        </div>
        
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Nuevo Hábito
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddHabit} className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Ej: Leer 15 minutos, Beber agua..."
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
              autoFocus
            />

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
                disabled={!newHabitName.trim()}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Crear Hábito
              </button>
            </div>
          </div>
        </form>
      )}

      {habitsData.length === 0 ? (
        <div className={`p-8 text-center rounded-2xl border border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No estás siguiendo ningún hábito todavía.</p>
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-x-auto ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
          <table className="w-full text-sm text-left">
            <thead className={`text-xs uppercase ${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
              <tr>
                <th className="px-4 py-3 rounded-tl-2xl">Hábito</th>
                {last7Days.map(date => {
                  const d = new Date(date);
                  return (
                    <th key={date} className="px-2 py-3 text-center min-w-[40px]">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] opacity-70">
                          {d.toLocaleDateString('es-ES', { weekday: 'short' })}
                        </span>
                        <span>{d.getDate()}</span>
                      </div>
                    </th>
                  );
                })}
                <th className="px-4 py-3 rounded-tr-2xl text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {habitsData.map(({ habit, logs }) => (
                <tr key={habit.id} className={`group hover:bg-slate-800/20 transition-colors`}>
                  <td className={`px-4 py-4 font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {habit.name}
                  </td>
                  {last7Days.map(date => {
                    const isCompleted = logs.some(l => l.completed_date === date);
                    return (
                      <td key={date} className="px-2 py-4 text-center">
                        <button
                          onClick={() => toggleLog(habit.id, date)}
                          className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : isDark
                              ? 'bg-slate-800 hover:bg-slate-700 text-transparent hover:text-slate-500'
                              : 'bg-slate-100 hover:bg-slate-200 text-transparent hover:text-slate-400'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                      title="Eliminar Hábito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
