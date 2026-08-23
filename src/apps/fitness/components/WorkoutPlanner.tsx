import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Flame,
  Heart,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Check,
  Calendar,
  Layers,
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

  // Form State para nueva sesión
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Fuerza' | 'Cardio' | 'HIIT' | 'Funcional' | 'Movilidad'>('Fuerza');
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [caloriesBurned, setCaloriesBurned] = useState(400);
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<WorkoutExerciseItem[]>([]);

  // Polar session fields
  const [heartRateAvg, setHeartRateAvg] = useState<number | ''>(135);
  const [heartRateMax, setHeartRateMax] = useState<number | ''>(165);
  const [polarLoad, setPolarLoad] = useState<'Baja' | 'Media' | 'Alta' | 'Muy Alta'>('Media');

  // Exercise picker modal
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('Todos');

  // Exercise detail modal in library
  const [selectedExerciseDef, setSelectedExerciseDef] = useState<ExerciseDef | null>(null);

  // Rest Stopwatch Timer
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

  // Cargar una plantilla de rutina
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

  // Añadir ejercicio a la sesión activa
  const handleAddExerciseToSession = (exDef: ExerciseDef) => {
    const newEx: WorkoutExerciseItem = {
      id: `ex_item_${Date.now()}`,
      exercise_id: exDef.id,
      name: exDef.name,
      muscle_group: exDef.muscle_group,
      equipment: exDef.equipment,
      sets: [
        {
          id: `s_${Date.now()}_1`,
          set_number: 1,
          type: 'warmup',
          reps: 12,
          weight_kg: 30,
          completed: false,
          rest_seconds: 60
        },
        {
          id: `s_${Date.now()}_2`,
          set_number: 2,
          type: 'normal',
          reps: 8,
          weight_kg: 60,
          rpe: 8,
          rir: 2,
          completed: false,
          rest_seconds: 90
        },
        {
          id: `s_${Date.now()}_3`,
          set_number: 3,
          type: 'normal',
          reps: 8,
          weight_kg: 60,
          rpe: 9,
          rir: 1,
          completed: false,
          rest_seconds: 90
        }
      ]
    };
    setExercises(prev => [...prev, newEx]);
    setShowExercisePicker(false);
  };

  // Añadir serie a un ejercicio
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

  // Eliminar serie
  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex].sets.splice(setIndex, 1);
      // Renumerar
      updated[exerciseIndex].sets.forEach((s, idx) => (s.set_number = idx + 1));
      return updated;
    });
  };

  // Actualizar campo de serie
  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof WorkoutSet,
    val: any
  ) => {
    setExercises(prev => {
      const updated = [...prev];
      const set = updated[exerciseIndex].sets[setIndex];
      (set as any)[field] = val;
      return updated;
    });
  };

  // Eliminar ejercicio de la sesión
  const handleRemoveExercise = (exerciseIndex: number) => {
    setExercises(prev => prev.filter((_, idx) => idx !== exerciseIndex));
  };

  // Guardar Sesión Completa
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
      heart_rate_max: heartRateMax ? Number(heartRateMax) : undefined,
      polar_training_load: polarLoad
    });

    setTitle('');
    setNotes('');
    setExercises([]);
    setShowLogModal(false);
  };

  // Filtrado de ejercicios para el buscador
  const filteredExercises = EXERCISE_LIBRARY.filter(ex => {
    const matchSearch =
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      ex.muscle_group.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchMuscle = selectedMuscleFilter === 'Todos' || ex.muscle_group.includes(selectedMuscleFilter);
    return matchSearch && matchMuscle;
  });

  return (
    <div className="space-y-6">
      {/* Sub-Header & Pestañas del Módulo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('log')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'log'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Historial de Sesiones
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'templates'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rutinas Sugeridas
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'library'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Biblioteca de Ejercicios
          </button>
        </div>

        {canEdit && (
          <button
            onClick={() => {
              setTitle('Nueva Sesión de Fuerza');
              setShowLogModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" /> Registrar Entrenamiento
          </button>
        )}
      </div>

      {/* Cronómetro Flotante de Descanso entre Series si está activo */}
      {restTimerSeconds !== null && (
        <div className="fixed bottom-6 right-6 z-40 bg-slate-900/95 backdrop-blur-xl border border-orange-500/40 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Descanso Entre Series</p>
            <p className="text-xl font-black text-white font-mono">
              {Math.floor(restTimerSeconds / 60)}:{(restTimerSeconds % 60).toString().padStart(2, '0')}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => startRestTimer((restTimerSeconds || 0) + 30)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg"
            >
              +30s
            </button>
            <button
              onClick={() => {
                setRestTimerSeconds(null);
                setRestTimerActive(false);
              }}
              className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* PESTAÑA 1: HISTORIAL DE SESIONES */}
      {activeTab === 'log' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workouts.map(w => (
              <div
                key={w.id}
                className="glass-panel p-5 rounded-2xl space-y-3 hover:border-orange-500/40 transition-all bg-slate-900/70"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-base">{w.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" /> {w.workout_date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-400 font-semibold border border-orange-500/30">
                      {w.category}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => onDeleteWorkout(w.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Eliminar sesión"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1 bg-slate-800/60 px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> {w.duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1 bg-slate-800/60 px-2.5 py-1 rounded-lg">
                    <Flame className="w-3.5 h-3.5 text-orange-400" /> {w.calories_burned} kcal
                  </span>
                  {w.heart_rate_avg && (
                    <span className="flex items-center gap-1 bg-slate-800/60 px-2.5 py-1 rounded-lg">
                      <Heart className="w-3.5 h-3.5 text-rose-400" /> {w.heart_rate_avg} ppm (Polar)
                    </span>
                  )}
                </div>

                {/* Lista de ejercicios registrados */}
                {w.exercises && w.exercises.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Ejercicios Realizados ({w.exercises.length}):
                    </p>
                    <div className="space-y-1">
                      {w.exercises.map(ex => (
                        <div
                          key={ex.id}
                          className="flex justify-between items-center text-xs py-1 px-2.5 rounded-lg bg-slate-950/60 border border-slate-800/50"
                        >
                          <span className="font-semibold text-slate-200">{ex.name}</span>
                          <span className="text-slate-400">
                            {ex.sets.length} series • Max: {Math.max(...ex.sets.map(s => s.weight_kg))} kg
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {w.notes && (
                  <p className="text-xs text-slate-400 italic bg-slate-800/40 p-2.5 rounded-xl">
                    "{w.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 2: RUTINAS SUGERIDAS LISTAS PARA CARGAR */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROUTINE_TEMPLATES.map(tpl => (
              <div
                key={tpl.id}
                className="glass-panel p-5 rounded-2xl space-y-4 flex flex-col justify-between hover:border-orange-500/40 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                      {tpl.split_type}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{tpl.level}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{tpl.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{tpl.description}</p>

                  <div className="pt-2 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-300">Ejercicios incluidos:</p>
                    <ul className="text-xs text-slate-400 space-y-1 pl-2">
                      {tpl.exercises.map((e, idx) => (
                        <li key={idx} className="flex justify-between text-[11px]">
                          <span>• {e.name}</span>
                          <span className="text-slate-500 font-mono">{e.default_sets}x{e.default_reps}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => handleLoadTemplate(tpl)}
                  className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5" /> Iniciar Esta Rutina
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 3: BIBLIOTECA DE EJERCICIOS */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por ejercicio o músculo (ej. banca, espalda, hombro)..."
                value={exerciseSearch}
                onChange={e => setExerciseSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Bíceps', 'Tríceps', 'Core', 'Cardio'].map(
                m => (
                  <button
                    key={m}
                    onClick={() => setSelectedMuscleFilter(m)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                      selectedMuscleFilter === m
                        ? 'bg-orange-500 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredExercises.map(ex => (
              <div
                key={ex.id}
                onClick={() => setSelectedExerciseDef(ex)}
                className="glass-panel p-4 rounded-xl space-y-2 hover:border-orange-500/50 cursor-pointer transition-all bg-slate-900/60"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white text-sm">{ex.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    {ex.equipment}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-orange-400 font-semibold">{ex.muscle_group}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{ex.mechanics}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{ex.instructions}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE EJERCICIO */}
      {selectedExerciseDef && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">
                  {selectedExerciseDef.muscle_group}
                </span>
                <h3 className="text-xl font-bold text-white">{selectedExerciseDef.name}</h3>
              </div>
              <button
                onClick={() => setSelectedExerciseDef(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-slate-800/60">
                <div>
                  <span className="text-slate-400 block text-[10px]">Equipamiento</span>
                  <span className="font-bold text-white">{selectedExerciseDef.equipment}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Mecánica</span>
                  <span className="font-bold text-white">{selectedExerciseDef.mechanics}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Dificultad</span>
                  <span className="font-bold text-white">{selectedExerciseDef.difficulty}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">Instrucciones de Ejecución:</h4>
                <p className="leading-relaxed text-slate-300">{selectedExerciseDef.instructions}</p>
              </div>

              {selectedExerciseDef.tips && (
                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300">
                  <strong className="block text-orange-400 font-bold">Consejo de Progresión:</strong>
                  {selectedExerciseDef.tips}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedExerciseDef(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR NUEVA SESIÓN DETALLADA */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl p-6 space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Registro de Entrenamiento</h3>
                  <p className="text-xs text-slate-400">Series, repeticiones, cargas y métricas Polar</p>
                </div>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-6">
              {/* Metadatos de la sesión */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Nombre de la Sesión</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ej. Torso Pesado + Polar Z2"
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Categoría</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
                  >
                    <option value="Fuerza">Fuerza / Hipertrofia</option>
                    <option value="Cardio">Cardio / Polar</option>
                    <option value="HIIT">HIIT</option>
                    <option value="Funcional">Funcional</option>
                    <option value="Movilidad">Movilidad</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Fecha</label>
                  <input
                    type="date"
                    value={workoutDate}
                    onChange={e => setWorkoutDate(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Duración, Calorías y Polar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Duración (min)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Calorías Quemadas</label>
                  <input
                    type="number"
                    value={caloriesBurned}
                    onChange={e => setCaloriesBurned(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none font-semibold text-orange-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">FC Media Polar (ppm)</label>
                  <input
                    type="number"
                    value={heartRateAvg}
                    onChange={e => setHeartRateAvg(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none text-rose-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">FC Máx Polar (ppm)</label>
                  <input
                    type="number"
                    value={heartRateMax}
                    onChange={e => setHeartRateMax(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none text-rose-400"
                  />
                </div>
              </div>

              {/* LISTA DE EJERCICIOS Y SERIES */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-orange-400" />
                    Ejercicios y Series de la Sesión
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowExercisePicker(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-xs font-semibold rounded-lg border border-orange-500/40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Añadir Ejercicio
                  </button>
                </div>

                {exercises.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-800/30 border border-dashed border-slate-700 text-center space-y-2">
                    <p className="text-xs text-slate-400">No has añadido ejercicios a esta sesión todavía.</p>
                    <button
                      type="button"
                      onClick={() => setShowExercisePicker(true)}
                      className="text-xs font-bold text-orange-400 hover:text-orange-300"
                    >
                      + Abrir Catálogo de Ejercicios
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {exercises.map((ex, exIdx) => (
                      <div
                        key={ex.id}
                        className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-orange-400">
                              {ex.muscle_group}
                            </span>
                            <h5 className="font-bold text-white text-sm">{ex.name}</h5>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(exIdx)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Tabla de Series */}
                        <div className="space-y-1.5">
                          <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                            <span className="col-span-2">Serie</span>
                            <span className="col-span-3">Peso (kg)</span>
                            <span className="col-span-3">Reps</span>
                            <span className="col-span-2">RPE</span>
                            <span className="col-span-2 text-center">1RM Est.</span>
                          </div>

                          {ex.sets.map((set, sIdx) => {
                            const est1RM =
                              set.weight_kg && set.reps
                                ? Math.round(set.weight_kg * (1 + set.reps / 30))
                                : 0;
                            return (
                              <div
                                key={set.id}
                                className="grid grid-cols-12 gap-2 items-center bg-slate-900/80 p-2 rounded-xl border border-slate-800/80 text-xs"
                              >
                                <div className="col-span-2 flex items-center gap-1.5 font-bold text-slate-300">
                                  <span>#{set.set_number}</span>
                                </div>
                                <div className="col-span-3">
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={set.weight_kg}
                                    onChange={e =>
                                      handleUpdateSet(exIdx, sIdx, 'weight_kg', Number(e.target.value))
                                    }
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-center font-bold text-xs"
                                  />
                                </div>
                                <div className="col-span-3">
                                  <input
                                    type="number"
                                    value={set.reps}
                                    onChange={e =>
                                      handleUpdateSet(exIdx, sIdx, 'reps', Number(e.target.value))
                                    }
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-center font-bold text-xs"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="6"
                                    max="10"
                                    value={set.rpe || 8}
                                    onChange={e =>
                                      handleUpdateSet(exIdx, sIdx, 'rpe', Number(e.target.value))
                                    }
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-1.5 py-1 text-amber-400 text-center font-bold text-xs"
                                  />
                                </div>
                                <div className="col-span-2 flex items-center justify-between">
                                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                                    {est1RM > 0 ? `${est1RM}kg` : '-'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSet(exIdx, sIdx)}
                                    className="text-slate-600 hover:text-rose-400"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex justify-between items-center pt-1">
                          <button
                            type="button"
                            onClick={() => handleAddSet(exIdx)}
                            className="text-xs font-semibold text-orange-400 hover:text-orange-300"
                          >
                            + Añadir Serie
                          </button>
                          <button
                            type="button"
                            onClick={() => startRestTimer(90)}
                            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                          >
                            <Clock className="w-3 h-3 text-amber-400" /> Descanso 90s
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notas */}
              <div>
                <label className="text-xs text-slate-400">Sensaciones y Notas</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ej. Buena progresión en banca, RPE 8.5 en última serie..."
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 hover:scale-105 transition-all"
                >
                  Guardar Entrenamiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SELECTOR DE EJERCICIOS MODAL */}
      {showExercisePicker && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-orange-400" /> Seleccionar Ejercicio
              </h3>
              <button
                onClick={() => setShowExercisePicker(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar ejercicio..."
                value={exerciseSearch}
                onChange={e => setExerciseSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredExercises.map(ex => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExerciseToSession(ex)}
                  className="p-3 rounded-xl bg-slate-800/60 hover:bg-orange-500/20 border border-slate-700 hover:border-orange-500 cursor-pointer transition-all flex justify-between items-center group"
                >
                  <div>
                    <h5 className="font-bold text-white text-xs group-hover:text-orange-300">
                      {ex.name}
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      {ex.muscle_group} • {ex.equipment}
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-slate-400 group-hover:text-orange-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
