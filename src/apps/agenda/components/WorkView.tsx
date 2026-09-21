import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Trash2, CheckCircle2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
  
  const [newTitle, setNewTitle] = useState('');
  const [newTotal, setNewTotal] = useState<number>(1);
  const [newNotes, setNewNotes] = useState('');

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
    if (!newTitle.trim() || !currentUser?.id) return;

    try {
      const day = await agendaService.createCompensatoryDay({
        user_id: currentUser.id,
        title: newTitle,
        total_days: newTotal,
        spent_days: 0,
        notes: newNotes,
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

  const updateSpent = async (day: AgendaCompensatoryDay, amount: number) => {
    const newSpent = Math.max(0, Math.min(day.total_days, day.spent_days + amount));
    if (newSpent === day.spent_days) return;

    // Optimistic
    setDays(days.map(d => d.id === day.id ? { ...d, spent_days: newSpent } : d));

    try {
      await agendaService.updateCompensatoryDay(day.id, { spent_days: newSpent });
    } catch (error) {
      console.error('Error updating spent days:', error);
      setDays(days.map(d => d.id === day.id ? { ...d, spent_days: day.spent_days } : d));
    }
  };

  const deleteDay = async (id: string) => {
    // Optimistic delete
    setDays(days.filter(d => d.id !== id));
    try {
      await agendaService.deleteCompensatoryDay(id);
    } catch (error) {
      console.error('Error deleting day:', error);
      loadDays(); // reload on error
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
                  step="0.5"
                  min="0.5"
                  value={newTotal}
                  onChange={(e) => setNewTotal(Number(e.target.value))}
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
                className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'
                } ${isCompleted ? 'opacity-50' : ''}`}
              >
                <div className="flex-1 mb-4 sm:mb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'} ${isCompleted ? 'line-through' : ''}`}>
                      {day.title}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                  </div>
                  {day.notes && (
                    <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{day.notes}</p>
                  )}
                  
                  {/* Progress Bar */}
                  <div className="mt-2 max-w-sm">
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
                </div>

                <div className="flex items-center gap-4 sm:ml-4 border-t sm:border-t-0 sm:border-l border-slate-700/30 pt-4 sm:pt-0 sm:pl-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateSpent(day, -0.5)}
                      disabled={day.spent_days <= 0}
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Restar medio día gastado"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className={`w-12 text-center font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {day.spent_days}
                    </span>
                    <button
                      onClick={() => updateSpent(day, 0.5)}
                      disabled={isCompleted}
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Sumar medio día gastado"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => deleteDay(day.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors ml-auto sm:ml-0"
                    title="Eliminar bolsa completa"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
