import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Plus,
  Trash2,
  Clock,
  Flame,
  Heart,
  Search,
  Play,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { FitnessWorkout, WorkoutExerciseItem, WorkoutSet, SetType, WorkoutRoutineTemplate } from '../../../types';
import { EXERCISE_LIBRARY, ExerciseDef } from '../data/exerciseLibrary';
import { ROUTINE_TEMPLATES } from '../data/routineTemplates';

interface WorkoutPlannerProps {
  workouts: FitnessWorkout[];
  canEdit: boolean;
  onSaveWorkout: (workout: Omit<FitnessWorkout, 'id'>) => Promise<void>;
  onDeleteWorkout: (id: string) => Promise<void>;
  initialOpenModal?: boolean;
}

export const WorkoutPlanner: React.FC<WorkoutPlannerProps> = ({
  workouts,
  canEdit,
  onSaveWorkout,
  onDeleteWorkout,
  initialOpenModal = false
}) => {
  const [activeTab, setActiveTab] = useState<'log' | 'templates' | 'library'>('log');
  const [showLogModal, setShowLogModal] = useState(initialOpenModal);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Fuerza' | 'Cardio' | 'HIIT' | 'Funcional' | 'Movilidad'>('Fuerza');
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [caloriesBurned, setCaloriesBurned] = useState(400);
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<WorkoutExerciseItem[]>([]);

  // Polar fields
  const [heartRateAvg, setHeartRateAvg] = useState<number | ''>(135);
  const [heartRateMax, setHeartRateMax] = useState<number | ''>(165);

  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('Todos');
  const [selectedExerciseDef, setSelectedExerciseDef] = useState<ExerciseDef | null>(null);

  // Rest Timer
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);
  const [restTimerActive, setRestTimerActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (restTimerActive && restTimerSeconds !== null && restTimerSeconds > 0) {
      interval = setInterval(() => {
        setRestTimerSeconds(prev => (prev && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (restTimerSeconds === 0) {
      setRestTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [restTimerActive, restTimerSeconds]);

  const startRestTimer = (seconds: number) => {
    setRestTimerSeconds(seconds);
    setRestTimerActive(true);
  };

  const handleLoadTemplate = (tpl: WorkoutRoutineTemplate) => {
    setTitle(tpl.name);
    setCategory(tpl.category === 'Fuerza' || tpl.category === 'Hipertrofia' ? 'Fuerza' : 'Cardio');
    const newExercises: WorkoutExerciseItem[] = tpl.exercises.map((ex, idx) => {
      const setsCount = ex.default_sets || 3;
      const sets: WorkoutSet[] = Array.from({ length: setsCount }, (_, sIdx) => ({
        id: `s_${Date.now()}_${idx}_${sIdx}`,
        set_number: sIdx + 1,
        type: 'normal' as SetType,
        reps: Number(ex.default_reps.split('-')[0]) || 8,
        weight_kg: 50,
        rpe: 8,
        rir: 2,
        completed: false,
        rest_seconds: 90
      }));
      return {
        id: `e_${Date.now()}_${idx}`,
        exercise_id: `ex_${idx}`,
        name: ex.name,
        muscle_group: ex.muscle_group,
        sets,
        notes: ex.notes
      };
    });
    setExercises(newExercises);
    setShowLogModal(true);
  };

  const handleAddExerciseToSession = (exDef: ExerciseDef) => {
    const newEx: WorkoutExerciseItem = {
      id: `ex_item_${Date.now()}`,
      exercise_id: exDef.id,
      name: exDef.name,
      muscle_group: exDef.muscle_group,
      equipment: exDef.equipment,
      sets: [
        { id: `s_${Date.now()}_1`, set_number: 1, type: 'warmup', reps: 12, weight_kg: 30, completed: false, rest_seconds: 60 },
        { id: `s_${Date.now()}_2`, set_number: 2, type: 'normal', reps: 8, weight_kg: 60, rpe: 8, rir: 2, completed: false, rest_seconds: 90 },
        { id: `s_${Date.now()}_3`, set_number: 3, type: 'normal', reps: 8, weight_kg: 60, rpe: 9, rir: 1, completed: false, rest_seconds: 90 }
      ]
    };
    setExercises(prev => [...prev, newEx]);
    setShowExercisePicker(false);
  };

  const handleAddSet = (exerciseIndex: number) => {
    setExercises(prev => {
      const updated = [...prev];
      const ex = updated[exerciseIndex];
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet: WorkoutSet = {
        id: `s_${Date.now()}_${ex.sets.length + 1}`,
        set_number: ex.sets.length + 1,
        type: 'normal',
        reps: lastSet ? lastSet.reps : 10,
        weight_kg: lastSet ? lastSet.weight_kg : 40,
        rpe: 8,
        rir: 2,
        completed: false,
        rest_seconds: 90
      };
      ex.sets.push(newSet);
      return updated;
    });
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex].sets.splice(setIndex, 1);
      updated[exerciseIndex].sets.forEach((s, idx) => (s.set_number = idx + 1));
      return updated;
    });
  };

  const handleUpdateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, val: any) => {
    setExercises(prev => {
      const updated = [...prev];
      const set = updated[exerciseIndex].sets[setIndex];
      (set as any)[field] = val;
      return updated;
    });
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    setExercises(prev => prev.filter((_, idx) => idx !== exerciseIndex));
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onSaveWorkout({
      title,
      category,
      duration_minutes: Number(durationMinutes),
      calories_burned: Number(caloriesBurned),
      workout_date: workoutDate,
      notes,
      exercises,
      heart_rate_avg: heartRateAvg ? Number(heartRateAvg) : undefined,
      heart_rate_max: heartRateMax ? Number(heartRateMax) : undefined
    });

    setTitle('');
    setNotes('');
    setExercises([]);
    setShowLogModal(false);
  };

  const filteredExercises = EXERCISE_LIBRARY.filter(ex => {
    const matchSearch = (ex.name || '').toLowerCase().includes(exerciseSearch.toLowerCase()) || (ex.muscle_group || '').toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchMuscle = selectedMuscleFilter === 'Todos' || ex.muscle_group.includes(selectedMuscleFilter);
    return matchSearch && matchMuscle;
  });

  return (
    <div className="space-y-7">
      {/* Selector de Pestañas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111622] p-4 rounded-3xl border border-white/5 shadow-md">
        <div className="flex items-center gap-2 bg-[#090C15] p-1.5 rounded-2xl border border-white/5 text-xs">
          <button
            onClick={() => setActiveTab('log')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'log'
                ? 'bg-[#FF6B00] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Historial ({workouts.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'templates'
                ? 'bg-[#FF6B00] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rutinas Sugeridas
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'library'
                ? 'bg-[#FF6B00] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Biblioteca ({EXERCISE_LIBRARY.length})
          </button>
        </div>

        {canEdit && (
          <button
            onClick={() => {
              setTitle('Sesión de Fuerza & Hipertrofia');
              setShowLogModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#FA8500] text-white text-xs font-bold rounded-2xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Nueva Sesión
          </button>
        )}
      </div>

      {/* Cronómetro Flotante */}
      {restTimerSeconds !== null && (
        <div className="fixed bottom-6 right-6 z-40 bg-[#111622] border border-[#FF6B00]/40 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in">
          <Clock className="w-6 h-6 text-[#FF6B00]" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Descanso</p>
            <p className="text-xl font-black text-white font-mono">{Math.floor(restTimerSeconds / 60)}:{(restTimerSeconds % 60).toString().padStart(2, '0')}</p>
          </div>
          <button
            onClick={() => setRestTimerSeconds(null)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-xl font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. HISTORIAL */}
      {activeTab === 'log' && (
        <div className="space-y-4">
          {workouts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#111622] border border-white/5 space-y-2">
              <Dumbbell className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">Sin entrenamientos aún</p>
              <p className="text-xs text-slate-400">Comienza con una rutina sugerida o crea tu propia sesión.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {workouts.map(w => (
                <div key={w.id} className="p-6 rounded-3xl bg-[#111622] border border-white/5 space-y-4 shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-white text-base">{w.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{w.workout_date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-lg bg-[#FF6B00]/15 text-[#FF6B00] font-bold">
                        {w.category}
                      </span>
                      {canEdit && (
                        <button
                          onClick={() => onDeleteWorkout(w.id)}
                          className="p-1 text-slate-500 hover:text-[#FF3B30] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <span>{w.duration_minutes} min</span>
                    <span>•</span>
                    <span>{w.calories_burned} kcal</span>
                    {w.heart_rate_avg && (
                      <>
                        <span>•</span>
                        <span className="text-[#FF3B30]">{w.heart_rate_avg} ppm</span>
                      </>
                    )}
                  </div>

                  {w.exercises && w.exercises.length > 0 && (
                    <div className="pt-2 border-t border-white/5 space-y-1">
                      {w.exercises.map(ex => (
                        <div key={ex.id} className="flex justify-between text-xs py-1 text-slate-300">
                          <span className="font-medium">{ex.name}</span>
                          <span className="text-slate-500 font-mono">{ex.sets.length} sets • {Math.max(...ex.sets.map(s => s.weight_kg))}kg</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. RUTINAS SUGERIDAS */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ROUTINE_TEMPLATES.map(tpl => (
            <div key={tpl.id} className="p-6 rounded-3xl bg-[#111622] border border-white/5 space-y-4 flex flex-col justify-between shadow-lg">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg bg-[#FF6B00]/15 text-[#FF6B00]">
                    {tpl.split_type}
                  </span>
                  <span className="text-xs text-slate-400">{tpl.level}</span>
                </div>
                <h4 className="font-extrabold text-white text-base leading-snug">{tpl.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{tpl.description}</p>

                <ul className="text-xs text-slate-300 space-y-1 pt-1">
                  {tpl.exercises.map((e, i) => (
                    <li key={i} className="flex justify-between text-xs text-slate-400">
                      <span>• {e.name}</span>
                      <span className="text-white font-mono">{e.default_sets}x{e.default_reps}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleLoadTemplate(tpl)}
                className="w-full py-3 bg-[#FF6B00] hover:bg-[#FA8500] text-white text-xs font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5" /> Iniciar Rutina
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. BIBLIOTECA */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Buscar por ejercicio..."
                value={exerciseSearch}
                onChange={e => setExerciseSearch(e.target.value)}
                className="w-full bg-[#111622] border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
              {['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Bíceps', 'Tríceps', 'Core'].map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMuscleFilter(m)}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap ${
                    selectedMuscleFilter === m ? 'bg-[#FF6B00] text-white' : 'bg-[#111622] text-slate-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map(ex => (
              <div
                key={ex.id}
                onClick={() => setSelectedExerciseDef(ex)}
                className="p-5 rounded-2xl bg-[#111622] border border-white/5 hover:border-[#FF6B00]/40 cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-white text-sm">{ex.name}</h5>
                  <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">{ex.equipment}</span>
                </div>
                <p className="text-xs text-[#FF6B00] font-semibold">{ex.muscle_group}</p>
                <p className="text-xs text-slate-400 line-clamp-2">{ex.instructions}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DETALLE EJERCICIO */}
      {selectedExerciseDef && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-white/10 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-[#FF6B00] font-bold uppercase">{selectedExerciseDef.muscle_group}</span>
                <h4 className="text-xl font-black text-white">{selectedExerciseDef.name}</h4>
              </div>
              <button onClick={() => setSelectedExerciseDef(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedExerciseDef.instructions}</p>
            {selectedExerciseDef.tips && (
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-slate-300">
                <strong className="text-[#FF6B00] block mb-0.5">Consejo:</strong> {selectedExerciseDef.tips}
              </div>
            )}
            <button
              onClick={() => setSelectedExerciseDef(null)}
              className="w-full py-2.5 bg-white/10 text-white font-bold text-xs rounded-xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL NUEVA SESIÓN */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111622] border border-white/10 rounded-3xl w-full max-w-3xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-xl font-black text-white">Registrar Entrenamiento</h3>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400">Título</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Categoría</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Fuerza">Fuerza / Hipertrofia</option>
                    <option value="Cardio">Cardio / Polar</option>
                    <option value="HIIT">HIIT</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400">Fecha</label>
                  <input
                    type="date"
                    value={workoutDate}
                    onChange={e => setWorkoutDate(e.target.value)}
                    className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h5 className="text-sm font-bold text-white">Ejercicios ({exercises.length})</h5>
                  <button
                    type="button"
                    onClick={() => setShowExercisePicker(true)}
                    className="px-3.5 py-1.5 bg-[#FF6B00] text-white text-xs font-bold rounded-xl"
                  >
                    + Añadir Ejercicio
                  </button>
                </div>

                {exercises.map((ex, exIdx) => (
                  <div key={ex.id} className="p-4 rounded-2xl bg-[#090C15] border border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-sm">{ex.name}</span>
                      <button type="button" onClick={() => handleRemoveExercise(exIdx)} className="text-slate-500 hover:text-[#FF3B30]">✕</button>
                    </div>

                    <div className="space-y-1.5">
                      {ex.sets.map((set, sIdx) => (
                        <div key={set.id} className="grid grid-cols-12 gap-2 items-center text-xs">
                          <span className="col-span-2 text-slate-500 font-bold">Set #{set.set_number}</span>
                          <input
                            type="number"
                            step="0.5"
                            placeholder="0"
                            value={set.weight_kg === 0 ? '' : set.weight_kg}
                            onFocus={e => e.target.select()}
                            onChange={e => handleUpdateSet(exIdx, sIdx, 'weight_kg', e.target.value === '' ? 0 : Number(e.target.value))}
                            className="col-span-4 bg-white/5 rounded-lg px-2.5 py-1 text-center font-bold text-white placeholder:text-slate-600"
                          />
                          <input
                            type="number"
                            placeholder="0"
                            value={set.reps === 0 ? '' : set.reps}
                            onFocus={e => e.target.select()}
                            onChange={e => handleUpdateSet(exIdx, sIdx, 'reps', e.target.value === '' ? 0 : Number(e.target.value))}
                            className="col-span-4 bg-white/5 rounded-lg px-2.5 py-1 text-center font-bold text-white placeholder:text-slate-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSet(exIdx, sIdx)}
                            className="col-span-2 text-slate-600 hover:text-[#FF3B30]"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-1 text-xs">
                      <button type="button" onClick={() => handleAddSet(exIdx)} className="text-[#FF6B00] font-bold">+ Set</button>
                      <button type="button" onClick={() => startRestTimer(90)} className="text-slate-400">Descanso 90s</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button type="button" onClick={() => setShowLogModal(false)} className="px-4 py-2 text-slate-400 text-xs">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-[#FF6B00] text-white font-bold text-xs rounded-xl">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SELECTOR */}
      {showExercisePicker && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-white/10 rounded-3xl w-full max-w-md p-6 space-y-4 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-white text-base">Seleccionar Ejercicio</h4>
              <button onClick={() => setShowExercisePicker(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              value={exerciseSearch}
              onChange={e => setExerciseSearch(e.target.value)}
              className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
            />
            <div className="flex-1 overflow-y-auto space-y-1.5">
              {filteredExercises.map(ex => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExerciseToSession(ex)}
                  className="p-3 rounded-xl bg-white/[0.02] hover:bg-[#FF6B00]/15 cursor-pointer text-xs flex justify-between items-center"
                >
                  <span className="font-bold text-white">{ex.name}</span>
                  <span className="text-slate-400">{ex.muscle_group}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
