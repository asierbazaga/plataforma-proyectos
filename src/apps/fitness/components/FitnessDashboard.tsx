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
  Activity,
  ArrowUpRight
} from 'lucide-react';
import {
  FitnessProfile,
  FitnessWorkout,
  DailyNutritionLog,
  BodyProgressEntry,
  PolarGritMetrics
} from '../../../types';
import { MacroRings } from './MacroRings';

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
  onUpdateWater?: (amountMl: number) => Promise<void>;
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
  onOpenProfileModal,
  onUpdateWater
}) => {
  // Macros consumidos
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

  const handleAddWater = async (deltaMl: number) => {
    if (onUpdateWater) {
      const next = Math.max(0, (todayNutrition.water_ml || 0) + deltaMl);
      await onUpdateWater(next);
    }
  };

  const latestWeight = (bodyProgress && bodyProgress.length > 0) ? (Number(bodyProgress[0].weight) || Number(profile.current_weight) || 75) : (Number(profile.current_weight) || 75);
  const weightDiff = Math.abs(latestWeight - (Number(profile.target_weight) || 70)).toFixed(1);

  const recentWorkout = workouts.length > 0 ? workouts[0] : null;

  return (
    <div className="space-y-8">
      {/* 1. Minimalist Top Scoreboard */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#111622] border border-white/5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Calorías Restantes</span>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
            {caloriesRemaining} <span className="text-xs font-medium text-slate-500">kcal</span>
          </div>
          <p className="text-xs text-[#FF6B00] font-semibold">{consumedCalories} / {profile.target_calories} meta</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111622] border border-white/5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Peso Actual</span>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
            {latestWeight} <span className="text-xs font-medium text-slate-500">kg</span>
          </div>
          <p className="text-xs text-emerald-400 font-semibold">{weightDiff} kg hasta {profile.target_weight} kg</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111622] border border-white/5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Polar Recovery</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
            {latestPolar?.nightly_recharge_status || 'Muy Bueno'}
          </div>
          <p className="text-xs text-slate-400 font-semibold">SNA: +{latestPolar?.ans_charge || 5.8} • Sueño: {latestPolar?.sleep_score || 88} pts</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111622] border border-white/5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Entrenamiento</span>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {workouts.length} <span className="text-xs font-medium text-slate-500">sesiones</span>
          </div>
          <p className="text-xs text-amber-400 font-semibold">{workouts.reduce((acc, w) => acc + w.calories_burned, 0)} kcal quemadas</p>
        </div>
      </section>

      {/* 2. Apple Fitness Style Nutrient & Activity Heart */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Anillos & Macros (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-[#111622] border border-white/5 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Anillos de Nutrición & Macros</h3>
              <p className="text-xs text-slate-400">Calorías, proteínas y energía consumida hoy</p>
            </div>
            <button
              onClick={() => onNavigateTab('nutrition')}
              className="text-xs font-bold text-[#FF6B00] hover:text-[#FA8500] flex items-center gap-1 group"
            >
              Diario Completo <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8 py-2">
            {/* SVG Concentric Rings */}
            <div className="flex-shrink-0">
              <MacroRings
                caloriePct={caloriesPct}
                proteinPct={proteinPct}
                carbsPct={carbsPct}
                fatPct={fatPct}
                size={180}
              />
            </div>

            {/* Macro Bars */}
            <div className="flex-1 w-full space-y-4">
              {/* Proteína */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-[#FF3B30]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30]" /> Proteína
                  </span>
                  <span className="text-white font-mono">{consumedProtein} / {profile.target_protein}g</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF3B30] rounded-full transition-all duration-500" style={{ width: `${proteinPct}%` }} />
                </div>
              </div>

              {/* Carbos */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-[#38BDF8]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" /> Carbohidratos
                  </span>
                  <span className="text-white font-mono">{consumedCarbs} / {profile.target_carbs}g</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-[#38BDF8] rounded-full transition-all duration-500" style={{ width: `${carbsPct}%` }} />
                </div>
              </div>

              {/* Grasas */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-[#30D158]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#30D158]" /> Grasas Saludables
                  </span>
                  <span className="text-white font-mono">{consumedFat} / {profile.target_fat}g</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-[#30D158] rounded-full transition-all duration-500" style={{ width: `${fatPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Water Pill con botones interactivos */}
          <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/15 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Agua: {todayNutrition.water_ml || 0} ml / {profile.target_water_ml} ml</p>
                  <p className="text-[11px] text-sky-300 font-semibold">{waterPct}% de tu objetivo diario</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('nutrition')}
                className="text-[11px] text-slate-400 hover:text-white font-medium"
              >
                Ver detalle →
              </button>
            </div>

            {/* Barra de progreso de agua */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-sky-400 rounded-full transition-all duration-300" style={{ width: `${waterPct}%` }} />
            </div>

            {/* Botones de acción rápida para beber agua */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleAddWater(250)}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 active:scale-95 text-sky-300 font-bold text-xs border border-sky-500/30 transition-all flex items-center justify-center gap-1"
              >
                <span>💧 +250 ml</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddWater(500)}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 active:scale-95 text-sky-300 font-bold text-xs border border-sky-500/30 transition-all flex items-center justify-center gap-1"
              >
                <span>🍾 +500 ml</span>
              </button>
              {(todayNutrition.water_ml || 0) > 0 && (
                <button
                  type="button"
                  onClick={() => handleAddWater(-250)}
                  title="Restar 250ml"
                  className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 font-bold text-xs border border-white/5 transition-all"
                >
                  -250ml
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Polar Grit X Pro Hero Card (5 Cols) */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-[#111622] border border-white/5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Polar Grit X Pro Hub</h3>
                <p className="text-xs text-slate-400">Nightly Recharge & FitSpark™</p>
              </div>
              <button
                onClick={() => onNavigateTab('polar')}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 group"
              >
                Métricas <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>

            {/* Nightly Recharge Box */}
            {latestPolar ? (
              <div className="p-4 rounded-2xl bg-[#090C15] border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Recuperación Nocturna</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-extrabold border border-emerald-500/30">
                    {latestPolar.nightly_recharge_status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-white/[0.03]">
                    <span className="text-[10px] text-slate-400 block font-semibold">Carga SNA</span>
                    <span className="text-sm font-black text-emerald-400">+{latestPolar.ans_charge}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03]">
                    <span className="text-[10px] text-slate-400 block font-semibold">Sueño</span>
                    <span className="text-sm font-black text-sky-400">{latestPolar.sleep_score} pts</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03]">
                    <span className="text-[10px] text-slate-400 block font-semibold">FC Reposo</span>
                    <span className="text-sm font-black text-rose-400">{latestPolar.resting_hr} ppm</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#090C15] border border-white/5 text-center space-y-2">
                <p className="text-xs font-bold text-slate-300">Sin datos de Polar Grit X Pro hoy</p>
                <p className="text-[11px] text-slate-500">
                  Registra tu recuperación nocturna o entrenamiento para ver tu carga del sistema nervioso.
                </p>
              </div>
            )}

            {/* FitSpark Box */}
            <div className="p-4 rounded-2xl bg-[#FF6B00]/5 border border-[#FF6B00]/15 space-y-1.5">
              <span className="text-xs font-bold text-[#FF6B00] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Orientación Diaria:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {latestPolar?.fitspark_recommendation ||
                  'Comienza registrando tu entrenamiento de hoy o tu pesaje para calibrar tu progresión muscular.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5">
            <span>Training Load: <strong className="text-white font-bold">{latestPolar ? latestPolar.cardio_load_status : 'Sin registrar'}</strong></span>
            <span>Pasos: <strong className="text-white font-bold">{latestPolar ? `${latestPolar.daily_steps.toLocaleString()} pasos` : '0 pasos'}</strong></span>
          </div>
        </div>
      </section>

      {/* 3. Acciones Rápidas Ultra-Limpias */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={onOpenNewWorkoutModal}
          className="p-4 rounded-2xl bg-[#111622] hover:bg-[#161C2C] border border-white/5 hover:border-[#FF6B00]/40 transition-all flex items-center gap-3.5 group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-[#FF6B00] transition-colors">+ Registrar Entreno</p>
            <p className="text-[11px] text-slate-400">Series y cargas</p>
          </div>
        </button>

        <button
          onClick={onOpenNewFoodModal}
          className="p-4 rounded-2xl bg-[#111622] hover:bg-[#161C2C] border border-white/5 hover:border-amber-500/40 transition-all flex items-center gap-3.5 group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">+ Añadir Comida</p>
            <p className="text-[11px] text-slate-400">Diario de macros</p>
          </div>
        </button>

        <button
          onClick={onOpenWeightModal}
          className="p-4 rounded-2xl bg-[#111622] hover:bg-[#161C2C] border border-white/5 hover:border-emerald-500/40 transition-all flex items-center gap-3.5 group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">+ Registrar Peso</p>
            <p className="text-[11px] text-slate-400">Pesaje y % grasa</p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('macros')}
          className="p-4 rounded-2xl bg-[#111622] hover:bg-[#161C2C] border border-white/5 hover:border-[#FF6B00]/40 transition-all flex items-center gap-3.5 group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-[#FF6B00] transition-colors">Calculadora Macros</p>
            <p className="text-[11px] text-slate-400">Ajustar TDEE</p>
          </div>
        </button>
      </section>

      {/* 4. Resumen de Último Entrenamiento & Meta */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-[#111622] border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-white text-base">Última Sesión Realizada</h4>
            <button
              onClick={() => onNavigateTab('workouts')}
              className="text-xs font-bold text-[#FF6B00] hover:underline"
            >
              Ver Todas
            </button>
          </div>

          {recentWorkout ? (
            <div className="p-4 rounded-2xl bg-[#090C15] border border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <h5 className="font-bold text-white text-sm">{recentWorkout.title}</h5>
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-[#FF6B00]/15 text-[#FF6B00] font-bold">
                  {recentWorkout.category}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>{recentWorkout.duration_minutes} min</span>
                <span>•</span>
                <span>{recentWorkout.calories_burned} kcal</span>
                <span>•</span>
                <span>{recentWorkout.workout_date}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-3">Aún no hay sesiones registradas.</p>
          )}
        </div>

        <div className="p-6 rounded-3xl bg-[#111622] border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-white text-base">Objetivo de Peso</h4>
            <button
              onClick={() => onNavigateTab('weight')}
              className="text-xs font-bold text-emerald-400 hover:underline"
            >
              Historial
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#090C15] border border-white/5 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-black text-white">{latestWeight} kg</span>
              <span className="text-xs font-bold text-emerald-400">Meta: {profile.target_weight} kg</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-3/4" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
