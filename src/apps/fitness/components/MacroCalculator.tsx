import React, { useState, useEffect } from 'react';
import { Calculator, Flame, Dumbbell, Sparkles, Check, ArrowRight, ShieldCheck, PieChart, Activity, RefreshCw, Zap } from 'lucide-react';
import { FitnessProfile, FitnessGoal, ActivityLevel, Gender, MacroCalculationResult } from '../../../types';

interface MacroCalculatorProps {
  profile: FitnessProfile;
  onApplyMacros: (macros: {
    target_calories: number;
    target_protein: number;
    target_carbs: number;
    target_fat: number;
    carb_cycling_enabled?: boolean;
    training_day_carbs?: number;
    rest_day_carbs?: number;
  }) => Promise<void>;
}

type MacroProtocol = 'balanced_fit' | 'high_protein_recomp' | 'carb_cycling' | 'low_carb_keto' | 'endurance';

export const MacroCalculator: React.FC<MacroCalculatorProps> = ({ profile, onApplyMacros }) => {
  const [age, setAge] = useState(profile.age || 28);
  const [gender, setGender] = useState<Gender>(profile.gender || 'male');
  const [heightCm, setHeightCm] = useState(profile.height_cm || 178);
  const [weightKg, setWeightKg] = useState(profile.current_weight || 78.5);
  const [bodyFatPct, setBodyFatPct] = useState<number | ''>(17);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activity_level || 'moderate');
  const [goal, setGoal] = useState<FitnessGoal>(profile.goal || 'fat_loss');
  const [deficitSurplusMode, setDeficitSurplusMode] = useState<'moderate' | 'mild' | 'aggressive'>('moderate');
  const [protocol, setProtocol] = useState<MacroProtocol>('balanced_fit');
  const [proteinGPerKg, setProteinGPerKg] = useState(2.2);
  const [fatGPerKg, setFatGPerKg] = useState(0.85);

  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Cálculo de BMR y TDEE
  const calculateResult = (): MacroCalculationResult => {
    let bmr = 0;
    if (typeof bodyFatPct === 'number' && bodyFatPct > 5 && bodyFatPct < 60) {
      // Katch-McArdle (masa magra)
      const leanMassKg = weightKg * (1 - bodyFatPct / 100);
      bmr = Math.round(370 + 21.6 * leanMassKg);
    } else {
      // Mifflin-St Jeor
      bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + (gender === 'male' ? 5 : -161));
    }

    const activityMultipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725,
      extra_active: 1.9
    };

    const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));

    // Ajuste calórico según objetivo
    let calorieAdj = 0;
    if (goal === 'fat_loss') {
      if (deficitSurplusMode === 'mild') calorieAdj = -0.15; // -15%
      else if (deficitSurplusMode === 'moderate') calorieAdj = -0.20; // -20%
      else calorieAdj = -0.25; // -25%
    } else if (goal === 'muscle_gain') {
      if (deficitSurplusMode === 'mild') calorieAdj = 0.08; // +8%
      else if (deficitSurplusMode === 'moderate') calorieAdj = 0.12; // +12%
      else calorieAdj = 0.18; // +18%
    } else if (goal === 'recomp') {
      calorieAdj = -0.06; // Ligero déficit recomposición (-6%)
    } else {
      calorieAdj = 0; // Mantenimiento
    }

    const targetCalories = Math.round(tdee * (1 + calorieAdj));

    // Distribución de macros según protocolo
    let protein = Math.round(weightKg * proteinGPerKg);
    let fat = Math.round(weightKg * fatGPerKg);
    let carbs = 0;
    let trainingCarbs = 0;
    let restCarbs = 0;

    if (protocol === 'low_carb_keto') {
      protein = Math.round(weightKg * 2.0);
      carbs = 40; // 40g neto
      const remainingCals = targetCalories - (protein * 4 + carbs * 4);
      fat = Math.max(30, Math.round(remainingCals / 9));
    } else if (protocol === 'carb_cycling') {
      protein = Math.round(weightKg * proteinGPerKg);
      fat = Math.round(weightKg * fatGPerKg);
      const remainingCals = targetCalories - (protein * 4 + fat * 9);
      carbs = Math.max(50, Math.round(remainingCals / 4));
      trainingCarbs = Math.round(carbs * 1.3); // +30% en días de entreno
      restCarbs = Math.round(carbs * 0.7);     // -30% en descanso
    } else {
      const remainingCals = targetCalories - (protein * 4 + fat * 9);
      carbs = Math.max(40, Math.round(remainingCals / 4));
    }

    return {
      bmr,
      tdee,
      target_calories: targetCalories,
      target_protein: protein,
      target_carbs: carbs,
      target_fat: fat,
      training_day_carbs: trainingCarbs || carbs,
      rest_day_carbs: restCarbs || carbs,
      protein_ratio_g_per_kg: proteinGPerKg,
      fat_ratio_g_per_kg: fatGPerKg
    };
  };

  const result = calculateResult();

  // Actualizar ratios cuando cambia el protocolo
  useEffect(() => {
    if (protocol === 'high_protein_recomp') {
      setProteinGPerKg(2.4);
      setFatGPerKg(0.8);
    } else if (protocol === 'low_carb_keto') {
      setProteinGPerKg(2.0);
      setFatGPerKg(1.2);
    } else if (protocol === 'endurance') {
      setProteinGPerKg(1.8);
      setFatGPerKg(0.8);
    } else {
      setProteinGPerKg(2.2);
      setFatGPerKg(0.85);
    }
  }, [protocol]);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApplyMacros({
        target_calories: result.target_calories,
        target_protein: result.target_protein,
        target_carbs: result.target_carbs,
        target_fat: result.target_fat,
        carb_cycling_enabled: protocol === 'carb_cycling',
        training_day_carbs: result.training_day_carbs,
        rest_day_carbs: result.rest_day_carbs
      });
      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 4000);
    } finally {
      setIsApplying(false);
    }
  };

  // Porcentajes de macros respecto a calorías
  const totalMacroCals = result.target_protein * 4 + result.target_carbs * 4 + result.target_fat * 9;
  const pctProtein = Math.round(((result.target_protein * 4) / totalMacroCals) * 100) || 30;
  const pctCarbs = Math.round(((result.target_carbs * 4) / totalMacroCals) * 100) || 45;
  const pctFat = 100 - pctProtein - pctCarbs;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-6 rounded-2xl border border-orange-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Calculadora Avanzada de Macronutrientes
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">Ciencia Nutricional</span>
            </h2>
            <p className="text-xs text-slate-400">Modelado metabólico preciso según peso, actividad, % grasa y estrategia de cambio físico.</p>
          </div>
        </div>

        <button
          onClick={handleApply}
          disabled={isApplying}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
            appliedSuccess
              ? 'bg-emerald-500 text-white shadow-emerald-500/25'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:scale-105 shadow-orange-500/25'
          }`}
        >
          {appliedSuccess ? (
            <>
              <Check className="w-4 h-4" /> ¡Metas Aplicadas con Éxito!
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Aplicar a Mis Metas Diarias
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Parámetros y Protocolo (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Parámetros Básicos */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-400" />
              1. Parámetros Biométricos & Actividad
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-slate-400">Género</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as Gender)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
                >
                  <option value="male">Hombre</option>
                  <option value="female">Mujer</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Edad</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Altura (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={e => setHeightCm(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={e => setWeightKg(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none font-semibold text-orange-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs text-slate-400">% Grasa Corporal Estimado (Opcional)</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    placeholder="Ej. 16"
                    value={bodyFatPct}
                    onChange={e => setBodyFatPct(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500">%</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Usa Katch-McArdle para máxima precisión si conoces tu % graso.</p>
              </div>

              <div>
                <label className="text-xs text-slate-400">Nivel de Actividad Diaria</label>
                <select
                  value={activityLevel}
                  onChange={e => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
                >
                  <option value="sedentary">Sedentario (Poco o ningún ejercicio)</option>
                  <option value="light">Ligero (1-2 días entreno / ~6k pasos)</option>
                  <option value="moderate">Moderado (3-5 días entreno / ~10k pasos)</option>
                  <option value="very_active">Muy Activo (6-7 días entreno intenso)</option>
                  <option value="extra_active">Atleta / Doble sesión</option>
                </select>
              </div>
            </div>
          </div>

          {/* Objetivo y Estrategia */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              2. Objetivo de Transformación & Intensidad
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'fat_loss', label: 'Definición', desc: 'Déficit calórico para quemar grasa' },
                { key: 'recomp', label: 'Recomposición', desc: 'Perder grasa y ganar músculo a la vez' },
                { key: 'muscle_gain', label: 'Volumen Limpio', desc: 'Superávit moderado para hipertrofia' },
                { key: 'maintenance', label: 'Mantenimiento', desc: 'Estabilizar peso y energía' }
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setGoal(item.key as FitnessGoal)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    goal === item.key
                      ? 'bg-orange-500/20 border-orange-500 text-white shadow-md shadow-orange-500/10'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <p className="font-bold text-xs">{item.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">{item.desc}</p>
                </button>
              ))}
            </div>

            {goal !== 'maintenance' && (
              <div className="pt-2">
                <label className="text-xs text-slate-400">Ritmo / Intensidad del Déficit o Superávit</label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {[
                    { key: 'mild', label: 'Conservador', pct: goal === 'fat_loss' ? '-15%' : '+8%' },
                    { key: 'moderate', label: 'Estándar Óptimo (Recomendado)', pct: goal === 'fat_loss' ? '-20%' : '+12%' },
                    { key: 'aggressive', label: 'Agresivo', pct: goal === 'fat_loss' ? '-25%' : '+18%' }
                  ].map(m => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setDeficitSurplusMode(m.key as any)}
                      className={`p-2 rounded-xl border text-center text-xs transition-all ${
                        deficitSurplusMode === m.key
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div>{m.label}</div>
                      <div className="text-[11px] font-bold text-white mt-0.5">{m.pct}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Protocolo de Distribución de Macronutrientes */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-sky-400" />
              3. Protocolo de Macronutrientes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { key: 'balanced_fit', title: 'Equilibrado Fitness (High Protein)', desc: '2.2g/kg proteína, balance óptimo de carbos y grasas saludables' },
                { key: 'carb_cycling', title: 'Ciclado de Carbohidratos', desc: '+Carbos en días de entreno pesado, -Carbos en días de descanso' },
                { key: 'high_protein_recomp', title: 'Recomposición Alta Proteína', desc: '2.4g/kg proteína para máxima protección muscular en déficit' },
                { key: 'low_carb_keto', title: 'Low Carb / Cetogénico', desc: 'Carbohidratos restringidos (<50g), predominio de grasas saludables' }
              ].map(p => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setProtocol(p.key as MacroProtocol)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    protocol === p.key
                      ? 'bg-sky-500/20 border-sky-500 text-white shadow-md shadow-sky-500/10'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <p className="font-bold text-xs text-sky-300">{p.title}</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight">{p.desc}</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs text-slate-400 flex justify-between">
                  <span>Ratio Proteína</span>
                  <span className="text-rose-400 font-bold">{proteinGPerKg} g/kg</span>
                </label>
                <input
                  type="range"
                  min="1.6"
                  max="2.8"
                  step="0.1"
                  value={proteinGPerKg}
                  onChange={e => setProteinGPerKg(Number(e.target.value))}
                  className="w-full accent-rose-500 mt-1 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 flex justify-between">
                  <span>Ratio Grasas</span>
                  <span className="text-emerald-400 font-bold">{fatGPerKg} g/kg</span>
                </label>
                <input
                  type="range"
                  min="0.6"
                  max="1.5"
                  step="0.05"
                  value={fatGPerKg}
                  onChange={e => setFatGPerKg(Number(e.target.value))}
                  className="w-full accent-emerald-500 mt-1 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Resultados Visuales (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 space-y-6 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">Estrategia Calculada</span>
                <h3 className="text-lg font-bold text-white">Metabolismo & Distribución</h3>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300">
                TDEE: <span className="text-amber-400">{result.tdee} kcal</span>
              </div>
            </div>

            {/* Target Calories Hero Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-orange-500/10 to-transparent border border-orange-500/30 text-center space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">Calorías Diarias Objetivo</span>
              <div className="text-4xl font-extrabold text-white tracking-tight flex items-center justify-center gap-1">
                {result.target_calories}
                <span className="text-base font-normal text-amber-400">kcal/día</span>
              </div>
              <p className="text-xs text-slate-400">
                {result.target_calories < result.tdee ? (
                  <span className="text-rose-400 font-medium">Déficit de {result.tdee - result.target_calories} kcal/día</span>
                ) : result.target_calories > result.tdee ? (
                  <span className="text-emerald-400 font-medium">Superávit de {result.target_calories - result.tdee} kcal/día</span>
                ) : (
                  <span className="text-sky-400 font-medium">Mantenimiento Exacto</span>
                )}
              </p>
            </div>

            {/* Macro Breakdown Cards */}
            <div className="space-y-3">
              {/* Proteína */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-rose-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                    PRO
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Proteínas</h4>
                    <p className="text-[10px] text-slate-400">{proteinGPerKg} g/kg • {pctProtein}% de calorías</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-rose-400">{result.target_protein} g</span>
                  <p className="text-[10px] text-slate-400">{result.target_protein * 4} kcal</p>
                </div>
              </div>

              {/* Carbohidratos */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-sky-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                    CARB
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Carbohidratos</h4>
                    <p className="text-[10px] text-slate-400">
                      {((result.target_carbs * 4) / totalMacroCals * 100).toFixed(0)}% del total
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-sky-400">{result.target_carbs} g</span>
                  <p className="text-[10px] text-slate-400">{result.target_carbs * 4} kcal</p>
                </div>
              </div>

              {/* Grasas */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    FAT
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Grasas Saludables</h4>
                    <p className="text-[10px] text-slate-400">{fatGPerKg} g/kg • {pctFat}% del total</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-emerald-400">{result.target_fat} g</span>
                  <p className="text-[10px] text-slate-400">{result.target_fat * 9} kcal</p>
                </div>
              </div>
            </div>

            {/* Carb Cycling Preview if active */}
            {protocol === 'carb_cycling' && (
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
                  <Zap className="w-3.5 h-3.5" /> Esquema de Ciclado de Carbos:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Día Entreno Pesado</p>
                    <p className="font-bold text-sky-400 text-sm">{result.training_day_carbs}g carbos</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Día Descanso Activo</p>
                    <p className="font-bold text-amber-400 text-sm">{result.rest_day_carbs}g carbos</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botón de Aplicar */}
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              {appliedSuccess ? (
                <>
                  <Check className="w-5 h-5" /> ¡Guardado en tu Perfil!
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Guardar y Aplicar al Plan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
