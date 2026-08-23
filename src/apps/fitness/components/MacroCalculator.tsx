import React, { useState, useEffect } from 'react';
import { Calculator, Flame, Sparkles, Check, PieChart, Activity, Zap } from 'lucide-react';
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

  return (
    <div className="space-y-7 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111622] p-6 rounded-3xl border border-white/5 shadow-xl">
        <div>
          <h2 className="text-xl font-extrabold text-white">Calculadora Metabólica & Macros</h2>
          <p className="text-xs text-slate-400 mt-0.5">Mifflin-St Jeor & Katch-McArdle con ajuste por objetivo.</p>
        </div>

        <button
          onClick={handleApply}
          disabled={isApplying}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs transition-all ${
            appliedSuccess ? 'bg-[#30D158] text-white' : 'bg-[#FF6B00] hover:bg-[#FA8500] text-white shadow-lg'
          }`}
        >
          {appliedSuccess ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {appliedSuccess ? '¡Guardado en tu Perfil!' : 'Aplicar a mis Metas'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parámetros (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Biometría */}
          <div className="p-6 rounded-3xl bg-[#111622] border border-white/5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Biometría</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-slate-500">Género</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as Gender)}
                  className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-white"
                >
                  <option value="male">Hombre</option>
                  <option value="female">Mujer</option>
                </select>
              </div>
              <div>
                <label className="text-slate-500">Edad</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-500">Altura (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={e => setHeightCm(Number(e.target.value))}
                  className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-500">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={e => setWeightKg(Number(e.target.value))}
                  className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-[#FF6B00] font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500">Nivel de Actividad Diaria</label>
              <select
                value={activityLevel}
                onChange={e => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="sedentary">Sedentario (Oficina / ~4k pasos)</option>
                <option value="light">Ligero (1-2 días entreno / ~7k pasos)</option>
                <option value="moderate">Moderado (3-5 días entreno / ~10k pasos)</option>
                <option value="very_active">Muy Activo (6-7 días entreno intenso)</option>
              </select>
            </div>
          </div>

          {/* Objetivo */}
          <div className="p-6 rounded-3xl bg-[#111622] border border-white/5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Estrategia</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { key: 'fat_loss', label: 'Definición' },
                { key: 'recomp', label: 'Recomposición' },
                { key: 'muscle_gain', label: 'Volumen' },
                { key: 'maintenance', label: 'Mantenimiento' }
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setGoal(item.key as FitnessGoal)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                    goal === item.key
                      ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-md'
                      : 'bg-[#090C15] border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
              <div>
                <label className="text-slate-400 flex justify-between font-medium">
                  <span>Proteína</span>
                  <span className="text-[#FF3B30] font-bold">{proteinGPerKg} g/kg</span>
                </label>
                <input
                  type="range"
                  min="1.6"
                  max="2.8"
                  step="0.1"
                  value={proteinGPerKg}
                  onChange={e => setProteinGPerKg(Number(e.target.value))}
                  className="w-full accent-[#FF3B30] mt-2 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-slate-400 flex justify-between font-medium">
                  <span>Grasas</span>
                  <span className="text-[#30D158] font-bold">{fatGPerKg} g/kg</span>
                </label>
                <input
                  type="range"
                  min="0.6"
                  max="1.5"
                  step="0.05"
                  value={fatGPerKg}
                  onChange={e => setFatGPerKg(Number(e.target.value))}
                  className="w-full accent-[#30D158] mt-2 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta Resultado (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-7 rounded-3xl bg-[#111622] border border-white/5 space-y-6 shadow-xl sticky top-6">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Calorías Diarias Meta</span>
              <div className="text-4xl font-black text-white tracking-tight flex items-baseline justify-center gap-1">
                {result.target_calories} <span className="text-sm font-normal text-[#FF6B00]">kcal</span>
              </div>
              <p className="text-xs text-slate-400">Gasto TDEE: {result.tdee} kcal</p>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center p-3.5 rounded-2xl bg-[#090C15] border border-white/5 text-xs">
                <span className="font-bold text-[#FF3B30]">Proteínas</span>
                <span className="font-black text-white font-mono">{result.target_protein}g</span>
              </div>
              <div className="flex justify-between items-center p-3.5 rounded-2xl bg-[#090C15] border border-white/5 text-xs">
                <span className="font-bold text-[#38BDF8]">Carbohidratos</span>
                <span className="font-black text-white font-mono">{result.target_carbs}g</span>
              </div>
              <div className="flex justify-between items-center p-3.5 rounded-2xl bg-[#090C15] border border-white/5 text-xs">
                <span className="font-bold text-[#30D158]">Grasas</span>
                <span className="font-black text-white font-mono">{result.target_fat}g</span>
              </div>
            </div>

            <button
              onClick={handleApply}
              disabled={isApplying}
              className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#FA8500] text-white font-bold text-xs rounded-2xl shadow-lg transition-all"
            >
              {appliedSuccess ? '¡Guardado con Éxito!' : 'Aplicar a mi Perfil'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
