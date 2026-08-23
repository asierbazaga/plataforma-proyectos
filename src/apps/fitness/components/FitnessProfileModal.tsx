import React, { useState } from 'react';
import { X, User, Target, Flame, Scale, Save, Sparkles } from 'lucide-react';
import { FitnessProfile, FitnessGoal, ActivityLevel, Gender } from '../../../types';

interface FitnessProfileModalProps {
  profile: FitnessProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<FitnessProfile>) => Promise<void>;
}

export const FitnessProfileModal: React.FC<FitnessProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave
}) => {
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [heightCm, setHeightCm] = useState(profile.height_cm);
  const [currentWeight, setCurrentWeight] = useState(profile.current_weight);
  const [targetWeight, setTargetWeight] = useState(profile.target_weight);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activity_level);
  const [goal, setGoal] = useState<FitnessGoal>(profile.goal);
  const [deficitSurplusPct, setDeficitSurplusPct] = useState(profile.deficit_surplus_pct);
  const [targetCalories, setTargetCalories] = useState(profile.target_calories);
  const [targetProtein, setTargetProtein] = useState(profile.target_protein);
  const [targetCarbs, setTargetCarbs] = useState(profile.target_carbs);
  const [targetFat, setTargetFat] = useState(profile.target_fat);
  const [targetWaterMl, setTargetWaterMl] = useState(profile.target_water_ml);
  const [targetSteps, setTargetSteps] = useState(profile.target_daily_steps);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleAutoCalculate = () => {
    let bmr = 10 * currentWeight + 6.25 * heightCm - 5 * age;
    bmr += gender === 'male' ? 5 : -161;

    const multMap: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725,
      extra_active: 1.9
    };
    const tdee = Math.round(bmr * (multMap[activityLevel] || 1.55));

    let adjPct = 0;
    if (goal === 'fat_loss') adjPct = -20;
    else if (goal === 'muscle_gain') adjPct = 12;
    else if (goal === 'recomp') adjPct = -8;
    else adjPct = 0;

    const cal = Math.round(tdee * (1 + adjPct / 100));
    const prot = Math.round(currentWeight * (goal === 'fat_loss' || goal === 'recomp' ? 2.2 : 2.0));
    const fat = Math.round(currentWeight * 0.9);
    const remainingCals = cal - (prot * 4 + fat * 9);
    const carbs = Math.max(50, Math.round(remainingCals / 4));

    setDeficitSurplusPct(adjPct);
    setTargetCalories(cal);
    setTargetProtein(prot);
    setTargetCarbs(carbs);
    setTargetFat(fat);
    setTargetWaterMl(Math.round(currentWeight * 38));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        age: Number(age),
        gender,
        height_cm: Number(heightCm),
        current_weight: Number(currentWeight),
        target_weight: Number(targetWeight),
        activity_level: activityLevel,
        goal,
        deficit_surplus_pct: Number(deficitSurplusPct),
        target_calories: Number(targetCalories),
        target_protein: Number(targetProtein),
        target_carbs: Number(targetCarbs),
        target_fat: Number(targetFat),
        target_water_ml: Number(targetWaterMl),
        target_daily_steps: Number(targetSteps)
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Perfil & Objetivos Físicos</h2>
              <p className="text-xs text-slate-400">Parámetros biométricos y reparto de macros</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Biometría */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-orange-400 flex items-center gap-2 uppercase tracking-wider">
              <Scale className="w-4 h-4" /> 1. Datos Biométricos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium">Edad</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  required
                />
              </div>
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
                <label className="text-xs text-slate-400 font-medium">Altura (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={e => setHeightCm(Number(e.target.value))}
                  className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Peso Actual (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={currentWeight}
                  onChange={e => setCurrentWeight(Number(e.target.value))}
                  className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-orange-400 font-bold text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Objetivo */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-orange-400 flex items-center gap-2 uppercase tracking-wider">
              <Target className="w-4 h-4" /> 2. Objetivo & Actividad
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium">Meta Principal</label>
                <select
                  value={goal}
                  onChange={e => setGoal(e.target.value as FitnessGoal)}
                  className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="fat_loss">Definición / Pérdida Grasa</option>
                  <option value="recomp">Recomposición Corporal</option>
                  <option value="muscle_gain">Volumen Limpio / Hipertrofia</option>
                  <option value="maintenance">Mantenimiento Saludable</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Nivel de Actividad</label>
                <select
                  value={activityLevel}
                  onChange={e => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="sedentary">Sedentario (Oficina / Poco movimiento)</option>
                  <option value="light">Ligero (1-2 días entreno / ~6k pasos)</option>
                  <option value="moderate">Moderado (3-5 días entreno / ~10k pasos)</option>
                  <option value="very_active">Muy Activo (6-7 días entreno)</option>
                  <option value="extra_active">Atleta / Doble sesión</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Peso Meta (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={e => setTargetWeight(Number(e.target.value))}
                  className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-bold text-xs"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAutoCalculate}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-xs font-bold rounded-xl border border-orange-500/40 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Autocalcular Macros Sugeridos
              </button>
            </div>
          </div>

          {/* Metas Nutricionales */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-orange-400 flex items-center gap-2 uppercase tracking-wider">
              <Flame className="w-4 h-4" /> 3. Metas Diarias
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <label className="text-[11px] text-amber-400 font-bold">Calorías</label>
                <input
                  type="number"
                  value={targetCalories}
                  onChange={e => setTargetCalories(Number(e.target.value))}
                  className="w-full bg-transparent border-b border-slate-700 text-white font-extrabold text-lg focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <label className="text-[11px] text-rose-400 font-bold">Proteína (g)</label>
                <input
                  type="number"
                  value={targetProtein}
                  onChange={e => setTargetProtein(Number(e.target.value))}
                  className="w-full bg-transparent border-b border-slate-700 text-white font-extrabold text-lg focus:outline-none focus:border-rose-500"
                  required
                />
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <label className="text-[11px] text-sky-400 font-bold">Carbos (g)</label>
                <input
                  type="number"
                  value={targetCarbs}
                  onChange={e => setTargetCarbs(Number(e.target.value))}
                  className="w-full bg-transparent border-b border-slate-700 text-white font-extrabold text-lg focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <label className="text-[11px] text-emerald-400 font-bold">Grasas (g)</label>
                <input
                  type="number"
                  value={targetFat}
                  onChange={e => setTargetFat(Number(e.target.value))}
                  className="w-full bg-transparent border-b border-slate-700 text-white font-extrabold text-lg focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs text-slate-400 font-medium">Meta de Agua (ml)</label>
                <input
                  type="number"
                  step="250"
                  value={targetWaterMl}
                  onChange={e => setTargetWaterMl(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Meta Pasos Polar</label>
                <input
                  type="number"
                  step="500"
                  value={targetSteps}
                  onChange={e => setTargetSteps(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-400 hover:text-white text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Guardando...' : 'Guardar Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
