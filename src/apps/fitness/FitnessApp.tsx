import React, { useState, useEffect } from 'react';
import { Dumbbell, Plus, Flame, Clock, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';
import { FitnessWorkout } from '../../types';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';

export const FitnessApp: React.FC = () => {
  const { canEditApp } = useAuth();
  const canEdit = canEditApp('fitness');
  const [workouts, setWorkouts] = useState<FitnessWorkout[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Fuerza');
  const [duration, setDuration] = useState(45);
  const [calories, setCalories] = useState(350);
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    const list = await storageService.getWorkouts();
    setWorkouts(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await storageService.addWorkout({
      title,
      category,
      duration_minutes: Number(duration),
      calories_burned: Number(calories),
      workout_date: new Date().toISOString().split('T')[0],
      notes
    });

    setTitle('');
    setNotes('');
    setShowModal(false);
    await loadData();
  };

  const totalCalories = workouts.reduce((acc, curr) => acc + curr.calories_burned, 0);
  const totalMinutes = workouts.reduce((acc, curr) => acc + curr.duration_minutes, 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-6 rounded-2xl border border-orange-500/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              APP FITNESS & SALUD
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">Módulo Activo</span>
            </h1>
            <p className="text-slate-400 text-sm">Registro de entrenamientos, gasto calórico y objetivos físicos.</p>
          </div>
        </div>

        {canEdit ? (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Nuevo Entrenamiento
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/20">
            <ShieldAlert className="w-4 h-4" />
            Modo Solo Lectura
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-orange-500">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Entrenamientos</p>
            <p className="text-2xl font-bold text-white mt-1">{workouts.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
            <Dumbbell className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Calorías Quemadas</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{totalCalories} kcal</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-yellow-500">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tiempo Invertido</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{totalMinutes} min</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Workouts List */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-400" />
          Historial de Sesiones
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workouts.map(w => (
            <div key={w.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-orange-500/40 transition-all space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-white text-base">{w.title}</h3>
                <span className="text-xs px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  {w.category}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-400" /> {w.duration_minutes} min</span>
                <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-400" /> {w.calories_burned} kcal</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {w.workout_date}</span>
              </div>
              {w.notes && <p className="text-xs text-slate-300 italic pt-1 bg-slate-800/40 p-2 rounded-lg">{w.notes}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Añadir */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-orange-400" />
              Nuevo Entrenamiento
            </h3>
            <form onSubmit={handleAddWorkout} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400">Título / Ejercicio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Rutina de Pecho y Espalda"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Categoría</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Fuerza">Fuerza</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Flexibilidad">Flexibilidad</option>
                    <option value="HIIT">HIIT</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Duración (min)</label>
                  <input
                    type="number"
                    required
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Calorías Quemadas</label>
                <input
                  type="number"
                  required
                  value={calories}
                  onChange={e => setCalories(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Notas Adicionales</label>
                <textarea
                  rows={2}
                  placeholder="Detalles de series, pesos..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
