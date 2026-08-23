import React from 'react';
import {
  Flame,
  Dumbbell,
  Droplet,
  Heart,
  TrendingDown,
  TrendingUp,
  Target,
  Award,
  Zap,
  Plus,
  ArrowRight,
  Activity,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronRight,
  Clock
} from 'lucide-react';
import {
  FitnessProfile,
  FitnessWorkout,
  DailyNutritionLog,
  BodyProgressEntry,
  PolarGritMetrics
} from '../../../types';

interface FitnessDashboardProps {
  profile: FitnessProfile;
  todayNutrition: DailyNutritionLog;
  workouts: FitnessWorkout[];
  bodyProgress: BodyProgressEntry[];
  latestPolar?: PolarGritMetrics;
  onNavigateTab: (tabId: string) => void;
  onOpenNewWorkoutModal: () => void;
  onOpenNewFoodModal: () => void;
  onOpenWeightModal: () => void;
  onOpenProfileModal: () => void;
}

export const FitnessDashboard: React.FC<FitnessDashboardProps> = ({
  profile,
  todayNutrition,
  workouts,
  bodyProgress,
  latestPolar,
  onNavigateTab,
  onOpenNewWorkoutModal,
  onOpenNewFoodModal,
  onOpenWeightModal,
  onOpenProfileModal
}) => {
  // Macros consumidos hoy
  const consumedCalories = todayNutrition.meals.reduce((acc, m) => acc + m.calories, 0);
  const consumedProtein = todayNutrition.meals.reduce((acc, m) => acc + m.protein, 0);
  const consumedCarbs = todayNutrition.meals.reduce((acc, m) => acc + m.carbs, 0);
  const consumedFat = todayNutrition.meals.reduce((acc, m) => acc + m.fat, 0);

  const caloriesRemaining = Math.max(0, profile.target_calories - consumedCalories);
  const caloriesPct = Math.min(100, Math.round((consumedCalories / profile.target_calories) * 100)) || 0;
  const proteinPct = Math.min(100, Math.round((consumedProtein / profile.target_protein) * 100)) || 0;
  const carbsPct = Math.min(100, Math.round((consumedCarbs / profile.target_carbs) * 100)) || 0;
  const fatPct = Math.min(100, Math.round((consumedFat / profile.target_fat) * 100)) || 0;
  const waterPct = Math.min(100, Math.round((todayNutrition.water_ml / profile.target_water_ml) * 100)) || 0;

  // Peso actual y diferencia con objetivo
  const latestWeight = bodyProgress.length > 0 ? bodyProgress[0].weight : profile.current_weight;
  const weightDiff = Math.abs(latestWeight - profile.target_weight).toFixed(1);
  const isLosing = profile.goal === 'fat_loss' || latestWeight > profile.target_weight;

  // Sesión reciente
  const recentWorkout = workouts.length > 0 ? workouts[0] : null;

  // Etiqueta del objetivo
  const goalLabelMap: Record<string, string> = {
    fat_loss: 'Definición / Quema de Grasa',
    recomp: 'Recomposición Corporal',
    muscle_gain: 'Volumen Limpio / Hipertrofia',
    maintenance: 'Mantenimiento Óptimo'
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero Banner: Estado de Transformación & Racha */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600/25 via-amber-600/15 to-slate-900 border border-orange-500/30 p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow-md shadow-orange-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Plan Activo
              </span>
              <span className="text-xs font-semibold text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                {goalLabelMap[profile.goal] || 'Cambio Físico'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Centro de Mando de Cambio Físico
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Progreso integral de fuerza, calorías, recuperación Polar y peso corporal hacia tu meta de{' '}
              <strong className="text-white">{profile.target_weight} kg</strong> (a {weightDiff} kg de distancia).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenProfileModal}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Target className="w-4 h-4 text-orange-400" />
              Editar Objetivos
            </button>
            <button
              onClick={() => onNavigateTab('macros')}
              className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center gap-1.5 hover:scale-105"
            >
              <Zap className="w-4 h-4" />
              Calculadora Macros
            </button>
          </div>
        </div>

        {/* Floating background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      </div>

      {/* 2. Acciones Rápidas (Quick Actions) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenNewWorkoutModal}
          className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 hover:border-orange-500/50 hover:bg-slate-800/80 transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">+ Entreno</p>
            <p className="text-[10px] text-slate-400">Registrar sesión</p>
          </div>
        </button>

        <button
          onClick={onOpenNewFoodModal}
          className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">+ Comida</p>
            <p className="text-[10px] text-slate-400">Añadir al diario</p>
          </div>
        </button>

        <button
          onClick={onOpenWeightModal}
          className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">+ Peso / Medida</p>
            <p className="text-[10px] text-slate-400">Registrar peso hoy</p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('polar')}
          className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 hover:border-rose-500/50 hover:bg-slate-800/80 transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">Polar Hub</p>
            <p className="text-[10px] text-slate-400">Grit X Pro status</p>
          </div>
        </button>
      </div>

      {/* 3. Grid Principal: Nutrición Diaria & Polar FitSpark */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Nutrición & Balance Calórico del Día (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Nutrición & Macros de Hoy</h3>
                <p className="text-xs text-slate-400">{todayNutrition.meals.length} tomas registradas</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('nutrition')}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 group"
            >
              Ver Diario <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Calorie Bar & Hero Stats */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs text-slate-400">Consumido hoy</span>
                <div className="text-2xl font-black text-white">
                  {consumedCalories}{' '}
                  <span className="text-xs font-normal text-slate-400">/ {profile.target_calories} kcal</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Restante</span>
                <div className="text-lg font-bold text-amber-400">
                  {caloriesRemaining} <span className="text-xs font-normal text-slate-400">kcal</span>
                </div>
              </div>
            </div>

            {/* Barra de progreso animada */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500 rounded-full"
                style={{ width: `${caloriesPct}%` }}
              />
            </div>
          </div>

          {/* 3 Barras de Macros (Proteína, Carbos, Grasas) */}
          <div className="grid grid-cols-3 gap-3">
            {/* Proteína */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-rose-500/20 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-rose-400">Proteína</span>
                <span className="text-slate-400">{consumedProtein}/{profile.target_protein}g</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${proteinPct}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 block text-right">{proteinPct}%</span>
            </div>

            {/* Carbohidratos */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-sky-500/20 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-sky-400">Carbos</span>
                <span className="text-slate-400">{consumedCarbs}/{profile.target_carbs}g</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${carbsPct}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 block text-right">{carbsPct}%</span>
            </div>

            {/* Grasas */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-500/20 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-emerald-400">Grasas</span>
                <span className="text-slate-400">{consumedFat}/{profile.target_fat}g</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${fatPct}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 block text-right">{fatPct}%</span>
            </div>
          </div>

          {/* Hidratación Rápida */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20">
            <div className="flex items-center gap-3">
              <Droplet className="w-5 h-5 text-sky-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Agua Diaria</p>
                <p className="text-[11px] text-sky-300">
                  {todayNutrition.water_ml} ml / {profile.target_water_ml} ml ({waterPct}%)
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('nutrition')}
              className="text-xs px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-lg font-semibold transition-colors"
            >
              + Beber Agua
            </button>
          </div>
        </div>

        {/* Polar Grit X Pro & Estado de Recuperación (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Polar Grit X Pro Hub</h3>
                  <p className="text-xs text-slate-400">Nightly Recharge & FitSpark™</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('polar')}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 group"
              >
                Detalles <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Nightly Recharge Box */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Recuperación Nocturna</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  {latestPolar?.nightly_recharge_status || 'Muy Bueno'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-xl bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">Carga SNA</span>
                  <span className="text-sm font-bold text-emerald-400">
                    +{latestPolar?.ans_charge || 5.8}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">Sueño</span>
                  <span className="text-sm font-bold text-sky-400">
                    {latestPolar?.sleep_score || 88} pts
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">FC Reposo</span>
                  <span className="text-sm font-bold text-rose-400">
                    {latestPolar?.resting_hr || 48} ppm
                  </span>
                </div>
              </div>
            </div>

            {/* FitSpark Suggestion */}
            <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400">
                <Zap className="w-3.5 h-3.5" /> Recomendación FitSpark™ para Hoy:
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {latestPolar?.fitspark_recommendation ||
                  'Tu recuperación ha sido excelente. El sistema neuromuscular está en condiciones óptimas para entrenar Fuerza Pesada o Hipertrofia.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <span>Training Load Pro: <strong className="text-white">{latestPolar?.cardio_load_status || 'Productivo'}</strong></span>
            <span>Pasos: <strong className="text-amber-400">{latestPolar?.daily_steps || '11.420'}</strong></span>
          </div>
        </div>
      </div>

      {/* 4. Resumen de Entrenamiento Reciente & Peso Corporal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Último Entrenamiento Realizado */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-orange-400" />
              Última Sesión de Entrenamiento
            </h3>
            <button
              onClick={() => onNavigateTab('workouts')}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
            >
              Ver Todas
            </button>
          </div>

          {recentWorkout ? (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-base">{recentWorkout.title}</h4>
                  <p className="text-xs text-slate-400">{recentWorkout.workout_date}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-md bg-orange-500/20 text-orange-400 font-semibold">
                  {recentWorkout.category}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> {recentWorkout.duration_minutes} min
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" /> {recentWorkout.calories_burned} kcal
                </span>
                {recentWorkout.heart_rate_avg && (
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-400" /> {recentWorkout.heart_rate_avg} ppm
                  </span>
                )}
              </div>

              {recentWorkout.notes && (
                <p className="text-xs text-slate-400 italic bg-slate-800/40 p-2 rounded-lg">
                  "{recentWorkout.notes}"
                </p>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-900/40 rounded-xl">
              No hay entrenamientos registrados aún. ¡Registra el primero!
            </div>
          )}
        </div>

        {/* Peso y Progreso Corporal */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Evolución de Peso & Medidas
            </h3>
            <button
              onClick={() => onNavigateTab('weight')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Historial
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400">Peso Actual</span>
                <div className="text-2xl font-black text-white">{latestWeight} kg</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Meta Final</span>
                <div className="text-lg font-bold text-emerald-400">{profile.target_weight} kg</div>
              </div>
            </div>

            {/* Mini Progress Bar towards weight goal */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Distancia a meta:</span>
                <span className="font-semibold text-white">{weightDiff} kg restantes</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
