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

type MacroProtocol = 'balanced_fit' | 'high_protein_recomp' | 'carb_cycling' | 'low_carb_keto';

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

  const calculateResult = (): MacroCalculationResult => {
    let bmr = 0;
    if (typeof bodyFatPct === 'number' && bodyFatPct > 5 && bodyFatPct < 60) {
      const leanMassKg = weightKg * (1 - bodyFatPct / 100);
      bmr = Math.round(370 + 21.6 * leanMassKg);
    } else {
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

    let calorieAdj = 0;
    if (goal === 'fat_loss') {
      if (deficitSurplusMode === 'mild') calorieAdj = -0.15;
      else if (deficitSurplusMode === 'moderate') calorieAdj = -0.20;
      else calorieAdj = -0.25;
    } else if (goal === 'muscle_gain') {
      if (deficitSurplusMode === 'mild') calorieAdj = 0.08;
      else if (deficitSurplusMode === 'moderate') calorieAdj = 0.12;
      else calorieAdj = 0.18;
    } else if (goal === 'recomp') {
      calorieAdj = -0.06;
    } else {
      calorieAdj = 0;
    }

    const targetCalories = Math.round(tdee * (1 + calorieAdj));

    let protein = Math.round(weightKg * proteinGPerKg);
    let fat = Math.round(weightKg * fatGPerKg);
    let carbs = 0;
    let trainingCarbs = 0;
    let restCarbs = 0;

    if (protocol === 'low_carb_keto') {
      protein = Math.round(weightKg * 2.0);
      carbs = 40;
      const remainingCals = targetCalories - (protein * 4 + carbs * 4);
      fat = Math.max(30, Math.round(remainingCals / 9));
    } else if (protocol === 'carb_cycling') {
      protein = Math.round(weightKg * proteinGPerKg);
      fat = Math.round(weightKg * fatGPerKg);
      const remainingCals = targetCalories - (protein * 4 + fat * 9);
      carbs = Math.max(50, Math.round(remainingCals / 4));
      trainingCarbs = Math.round(carbs * 1.3);
      restCarbs = Math.round(carbs * 0.7);
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

  useEffect(() => {
    if (protocol === 'high_protein_recomp') {
      setProteinGPerKg(2.4);
      setFatGPerKg(0.8);
    } else if (protocol === 'low_carb_keto') {
      setProteinGPerKg(2.0);
      setFatGPerKg(1.2);
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

  const totalMacroCals = result.target_protein * 4 + result.target_carbs * 4 + result.target_fat * 9;
  const pctProtein = Math.round(((result.target_protein * 4) / totalMacroCals) * 100) || 30;
  const pctCarbs = Math.round(((result.target_carbs * 4) / totalMacroCals) * 100) || 45;
  const pctFat = 100 - pctProtein - pctCarbs;

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-slate-900 p-6 sm:p-7 rounded-3xl border border-orange-500/25 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 flex-shrink-0">
            <Calculator className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-3">
              Calculadora de Macronutrientes
              <span className="text-xs px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold">
                TDEE Adaptativo
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cálculo metabólico por ciencia nutricional (Mifflin-St Jeor / Katch-McArdle).
            </p>
          </div>
        </div>

        <button
          onClick={handleApply}
          disabled={isApplying}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-xs transition-all shadow-lg ${
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
              <Sparkles className="w-4 h-4" /> Aplicar a mis Metas Diarias
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Columna Izquierda: Parámetros (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Parámetros Básicos */}
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-5 shadow-lg">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-orange-400" />
              1. Biometría & Nivel de Actividad
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium">Género</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as Gender)}
                  className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="male">Hombre</option>
                  <option value="female">Mujer</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Edad</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Altura (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={e => setHeightCm(Number(e.target.value))}
                  className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={e => setWeightKg(Number(e.target.value))}
                  className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-orange-400 font-bold text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs text-slate-400 font-medium">% Grasa Corporal (Opcional)</label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="number"
                    placeholder="Ej. 17"
                    value={bodyFatPct}
                    onChange={e => setBodyFatPct(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                  <span className="text-xs text-slate-500 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Nivel de Actividad Diaria</label>
                <select
                  value={activityLevel}
                  onChange={e => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="sedentary">Sedentario (Poco movimiento)</option>
                  <option value="light">Ligero (1-2 días entreno / ~6k pasos)</option>
                  <option value="moderate">Moderado (3-5 días entreno / ~10k pasos)</option>
                  <option value="very_active">Muy Activo (6-7 días entreno intenso)</option>
                  <option value="extra_active">Atleta / Doble sesión</option>
                </select>
              </div>
            </div>
          </div>

          {/* Objetivo */}
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-5 shadow-lg">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-amber-400" />
              2. Objetivo de Transformación
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'fat_loss', label: 'Definición', desc: 'Déficit calórico para quemar grasa' },
                { key: 'recomp', label: 'Recomposición', desc: 'Perder grasa y ganar músculo' },
                { key: 'muscle_gain', label: 'Volumen', desc: 'Superávit para hipertrofia' },
                { key: 'maintenance', label: 'Mantenimiento', desc: 'Estabilizar peso' }
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setGoal(item.key as FitnessGoal)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    goal === item.key
                      ? 'bg-orange-500/20 border-orange-500 text-white shadow-md shadow-orange-500/15 scale-[1.02]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <p className="font-extrabold text-xs">{item.label}</p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{item.desc}</p>
                </button>
              ))}
            </div>

            {goal !== 'maintenance' && (
              <div className="pt-2">
                <label className="text-xs text-slate-400 font-medium">Ritmo del Déficit / Superávit</label>
                <div className="grid grid-cols-3 gap-3 mt-1.5">
                  {[
                    { key: 'mild', label: 'Conservador', pct: goal === 'fat_loss' ? '-15%' : '+8%' },
                    { key: 'moderate', label: 'Óptimo (Recomendado)', pct: goal === 'fat_loss' ? '-20%' : '+12%' },
                    { key: 'aggressive', label: 'Agresivo', pct: goal === 'fat_loss' ? '-25%' : '+18%' }
                  ].map(m => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setDeficitSurplusMode(m.key as any)}
                      className={`p-3 rounded-2xl border text-center text-xs transition-all ${
                        deficitSurplusMode === m.key
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div>{m.label}</div>
                      <div className="text-xs font-black text-white mt-0.5">{m.pct}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Protocolo */}
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-5 shadow-lg">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              <PieChart className="w-5 h-5 text-sky-400" />
              3. Protocolo de Macronutrientes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: 'balanced_fit', title: 'Equilibrado High Protein', desc: '2.2g/kg proteína, óptimo para fuerza' },
                { key: 'carb_cycling', title: 'Ciclado de Carbos', desc: '+Carbos en entreno, -Carbos en descanso' },
                { key: 'high_protein_recomp', title: 'Recomposición Agresiva', desc: '2.4g/kg proteína para corte magro' }
              ].map(p => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setProtocol(p.key as MacroProtocol)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    protocol === p.key
                      ? 'bg-sky-500/20 border-sky-500 text-white shadow-md shadow-sky-500/15'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <p className="font-bold text-xs text-sky-300">{p.title}</p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{p.desc}</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs text-slate-400 flex justify-between font-medium">
                  <span>Proteína</span>
                  <span className="text-rose-400 font-bold">{proteinGPerKg} g/kg</span>
                </label>
                <input
                  type="range"
                  min="1.6"
                  max="2.8"
                  step="0.1"
                  value={proteinGPerKg}
                  onChange={e => setProteinGPerKg(Number(e.target.value))}
                  className="w-full accent-rose-500 mt-2 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 flex justify-between font-medium">
                  <span>Grasas</span>
                  <span className="text-emerald-400 font-bold">{fatGPerKg} g/kg</span>
                </label>
                <input
                  type="range"
                  min="0.6"
                  max="1.5"
                  step="0.05"
                  value={fatGPerKg}
                  onChange={e => setFatGPerKg(Number(e.target.value))}
                  className="w-full accent-emerald-500 mt-2 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Resultados (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-7 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-orange-400">Resultado</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Plan Diario</h3>
              </div>
              <div className="px-3 py-1 rounded-xl bg-slate-800 text-xs font-bold text-slate-300">
                TDEE: <span className="text-amber-400">{result.tdee} kcal</span>
              </div>
            </div>

            {/* Target Calories Hero Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-orange-500/10 to-transparent border border-orange-500/30 text-center space-y-1.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">Calorías Diarias Meta</span>
              <div className="text-4xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
                {result.target_calories}
                <span className="text-base font-normal text-amber-400">kcal</span>
              </div>
              <p className="text-xs text-slate-400">
                {result.target_calories < result.tdee ? (
                  <span className="text-rose-400 font-bold">Déficit de {result.tdee - result.target_calories} kcal/día</span>
                ) : result.target_calories > result.tdee ? (
                  <span className="text-emerald-400 font-bold">Superávit de {result.target_calories - result.tdee} kcal/día</span>
                ) : (
                  <span className="text-sky-400 font-bold">Mantenimiento Exacto</span>
                )}
              </p>
            </div>

            {/* Macro Breakdown */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-rose-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                    PRO
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Proteínas</h4>
                    <p className="text-xs text-slate-400">{proteinGPerKg} g/kg • {pctProtein}% cals</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-rose-400">{result.target_protein} g</span>
                  <p className="text-[11px] text-slate-400">{result.target_protein * 4} kcal</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-sky-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                    CARB
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Carbohidratos</h4>
                    <p className="text-xs text-slate-400">{pctCarbs}% cals</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-sky-400">{result.target_carbs} g</span>
                  <p className="text-[11px] text-slate-400">{result.target_carbs * 4} kcal</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    FAT
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Grasas Saludables</h4>
                    <p className="text-xs text-slate-400">{fatGPerKg} g/kg • {pctFat}% cals</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-400">{result.target_fat} g</span>
                  <p className="text-[11px] text-slate-400">{result.target_fat * 9} kcal</p>
                </div>
              </div>
            </div>

            {protocol === 'carb_cycling' && (
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                  <Zap className="w-4 h-4" /> Ciclado de Carbos:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-slate-400 text-[11px]">Día Entreno</p>
                    <p className="font-bold text-sky-400 text-sm mt-0.5">{result.training_day_carbs}g</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-slate-400 text-[11px]">Día Descanso</p>
                    <p className="font-bold text-amber-400 text-sm mt-0.5">{result.rest_day_carbs}g</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleApply}
              disabled={isApplying}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-xs"
            >
              {appliedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> ¡Guardado en tu Perfil!
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Guardar y Aplicar al Plan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
