import React from 'react';
import {
  Flame,
  Dumbbell,
  Droplet,
  Heart,
  TrendingDown,
  Target,
  Zap,
  Plus,
  ChevronRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Moon,
  Activity
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
  // Totales de macros hoy
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

  // Peso actual y meta
  const latestWeight = bodyProgress.length > 0 ? bodyProgress[0].weight : profile.current_weight;
  const weightDiff = Math.abs(latestWeight - profile.target_weight).toFixed(1);

  const recentWorkout = workouts.length > 0 ? workouts[0] : null;

  const goalNames: Record<string, string> = {
    fat_loss: 'Definición & Quema de Grasa',
    recomp: 'Recomposición Corporal',
    muscle_gain: 'Volumen Limpio / Hipertrofia',
    maintenance: 'Mantenimiento Saludable'
  };

  return (
    <div className="space-y-8">
      {/* 1. Hero Card: Estado del Plan */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-slate-900 border border-orange-500/30 p-7 sm:p-9 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow-md shadow-orange-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Plan Activo
              </span>
              <span className="text-xs font-semibold text-amber-300 bg-amber-400/10 px-3.5 py-1 rounded-full border border-amber-400/20">
                {goalNames[profile.goal] || 'Cambio Físico'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Centro de Mando Diario
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Objetivo: llegar a <strong className="text-white font-bold">{profile.target_weight} kg</strong>{' '}
              (a {weightDiff} kg de distancia). Monitorea tus calorías, sesiones de fuerza y recuperación Polar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenProfileModal}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-2 shadow-md"
            >
              <Target className="w-4 h-4 text-orange-400" />
              Ajustar Metas
            </button>
            <button
              onClick={() => onNavigateTab('macros')}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2 hover:scale-105"
            >
              <Zap className="w-4 h-4" />
              Calculadora Macros
            </button>
          </div>
        </div>
      </section>

      {/* 2. Acciones Rápidas (4 Botones Espaciosos) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={onOpenNewWorkoutModal}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-orange-500/50 hover:bg-slate-800/80 transition-all group text-left shadow-lg"
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-500/15 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
            <Dumbbell className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
            + Registrar Entreno
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Series, cargas y reps</p>
        </button>

        <button
          onClick={onOpenNewFoodModal}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all group text-left shadow-lg"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
            <Flame className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
            + Añadir Comida
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Diario de macros</p>
        </button>

        <button
          onClick={onOpenWeightModal}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all group text-left shadow-lg"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
            <TrendingDown className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
            + Peso & Medidas
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Pesaje de hoy y % grasa</p>
        </button>

        <button
          onClick={() => onNavigateTab('polar')}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-800/80 transition-all group text-left shadow-lg"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
            <Heart className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
            Polar Grit X Hub
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Nightly Recharge & Zonas</p>
        </button>
      </section>

      {/* 3. Grid Principal: Nutrición y Polar Recovery */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Nutrición & Macros (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Nutrición de Hoy</h3>
                <p className="text-xs text-slate-400">Balance calórico y macronutrientes</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('nutrition')}
              className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 group"
            >
              Abrir Diario <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Calorías Barra Principal */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs text-slate-400 font-medium">Consumido hoy</span>
                <div className="text-3xl font-black text-white tracking-tight">
                  {consumedCalories}{' '}
                  <span className="text-sm font-normal text-slate-400">/ {profile.target_calories} kcal</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium">Restante</span>
                <div className="text-xl font-extrabold text-amber-400">
                  {caloriesRemaining} <span className="text-xs font-normal text-slate-400">kcal</span>
                </div>
              </div>
            </div>

            <div className="w-full h-3.5 bg-slate-800/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500 rounded-full"
                style={{ width: `${caloriesPct}%` }}
              />
            </div>
          </div>

          {/* 3 Bloques Grandes de Macros */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Proteína */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-rose-500/25 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-rose-400">Proteína</span>
                <span className="text-slate-300 font-bold">{consumedProtein}/{profile.target_protein}g</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${proteinPct}%` }} />
              </div>
              <p className="text-[11px] text-slate-400 text-right">{proteinPct}% de la meta</p>
            </div>

            {/* Carbohidratos */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-sky-500/25 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-sky-400">Carbos</span>
                <span className="text-slate-300 font-bold">{consumedCarbs}/{profile.target_carbs}g</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${carbsPct}%` }} />
              </div>
              <p className="text-[11px] text-slate-400 text-right">{carbsPct}% de la meta</p>
            </div>

            {/* Grasas */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-emerald-500/25 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-400">Grasas</span>
                <span className="text-slate-300 font-bold">{consumedFat}/{profile.target_fat}g</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${fatPct}%` }} />
              </div>
              <p className="text-[11px] text-slate-400 text-right">{fatPct}% de la meta</p>
            </div>
          </div>

          {/* Hidratación */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Agua Consumida</p>
                <p className="text-xs text-sky-300">
                  {todayNutrition.water_ml} ml / {profile.target_water_ml} ml ({waterPct}%)
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('nutrition')}
              className="text-xs px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-xl font-bold transition-colors"
            >
              + Beber Agua
            </button>
          </div>
        </div>

        {/* Polar Grit X Pro & Recuperación (5 Cols) */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Polar Grit X Pro</h3>
                  <p className="text-xs text-slate-400">Recuperación & FitSpark™</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('polar')}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 group"
              >
                Ver Hub <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Nightly Recharge Banner */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Nightly Recharge™</span>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30">
                  {latestPolar?.nightly_recharge_status || 'Muy Bueno'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center pt-1">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Carga SNA</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    +{latestPolar?.ans_charge || 5.8}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Sueño</span>
                  <span className="text-base font-extrabold text-sky-400">
                    {latestPolar?.sleep_score || 88} pts
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">FC Reposo</span>
                  <span className="text-base font-extrabold text-rose-400">
                    {latestPolar?.resting_hr || 48} ppm
                  </span>
                </div>
              </div>
            </div>

            {/* FitSpark Recomendación */}
            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
                <Zap className="w-4 h-4" /> Recomendación FitSpark™ para Hoy:
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {latestPolar?.fitspark_recommendation ||
                  'Tu sistema neuromuscular está al 100%. Día ideal para sesión de fuerza pesada o hipertrofia de alta intensidad.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <span>Carga: <strong className="text-white font-bold">{latestPolar?.cardio_load_status || 'Productivo'}</strong></span>
            <span>Pasos: <strong className="text-amber-400 font-bold">{latestPolar?.daily_steps || '11.420'}</strong></span>
          </div>
        </div>
      </section>

      {/* 4. Resumen de Entreno Reciente & Peso */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              <Dumbbell className="w-5 h-5 text-orange-400" />
              Último Entrenamiento Registrado
            </h3>
            <button
              onClick={() => onNavigateTab('workouts')}
              className="text-xs text-orange-400 hover:text-orange-300 font-bold"
            >
              Ver Todas
            </button>
          </div>

          {recentWorkout ? (
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-white text-base">{recentWorkout.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{recentWorkout.workout_date}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-xl bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
                  {recentWorkout.category}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" /> {recentWorkout.duration_minutes} min
                </span>
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" /> {recentWorkout.calories_burned} kcal
                </span>
                {recentWorkout.heart_rate_avg && (
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-400" /> {recentWorkout.heart_rate_avg} ppm
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-950/40 rounded-2xl">
              No hay entrenamientos registrados aún. ¡Registra el primero!
            </div>
          )}
        </div>

        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              <Target className="w-5 h-5 text-emerald-400" />
              Evolución de Peso Corporal
            </h3>
            <button
              onClick={() => onNavigateTab('weight')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
            >
              Historial
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 font-medium">Peso Actual</span>
                <div className="text-3xl font-black text-white tracking-tight">{latestWeight} kg</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium">Meta Final</span>
                <div className="text-2xl font-black text-emerald-400 tracking-tight">{profile.target_weight} kg</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Distancia a meta:</span>
                <span className="font-bold text-white">{weightDiff} kg restantes</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-4/5" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
