import React, { useState } from 'react';
import { X, User, Target, Flame, Scale, Activity, Save, Sparkles } from 'lucide-react';
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

  // Auto-calcular sugerencia de calorías y macros
  const handleAutoCalculate = () => {
    // Mifflin-St Jeor BMR
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

    // Proteína: 2.2g/kg para recomposición/corte, 2.0g/kg para volumen
    const prot = Math.round(currentWeight * (goal === 'fat_loss' || goal === 'recomp' ? 2.2 : 2.0));
    // Grasa: 0.9g/kg
    const fat = Math.round(currentWeight * 0.9);
    // Carbos restantes
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Configuración del Perfil Físico</h2>
              <p className="text-xs text-slate-400">Datos biométricos y objetivos para cálculo metabólico</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Biometría */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-orange-400 flex items-center gap-2 uppercase tracking-wider">
              <Scale className="w-4 h-4" /> 1. Datos Biométricos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-slate-400">Edad</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Género</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as Gender)}
                  className="w-full mt-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="male">Hombre</option>
                  <option value="female">Mujer</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Altura (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={e => setHeightCm(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Peso Actual (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={currentWeight}
                  onChange={e => setCurrentWeight(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none font-semibold text-orange-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* Objetivo y Actividad */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-orange-400 flex items-center gap-2 uppercase tracking-wider">
              <Target className="w-4 h-4" /> 2. Objetivo de Cambio Físico & Actividad
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400">Meta Principal</label>
                <select
                  value={goal}
                  onChange={e => setGoal(e.target.value as FitnessGoal)}
                  className="w-full mt-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="fat_loss">Definición / Pérdida de Grasa</option>
                  <option value="recomp">Recomposición Corporal</option>
                  <option value="muscle_gain">Volumen Limpio / Masa Muscular</option>
                  <option value="maintenance">Mantenimiento Saludable</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Nivel de Actividad Diaria</label>
                <select
                  value={activityLevel}
                  onChange={e => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full mt-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="sedentary">Sedentario (Oficina / Poco movimiento)</option>
                  <option value="light">Ligero (1-2 días entreno / 6k pasos)</option>
                  <option value="moderate">Moderado (3-5 días entreno / 10k pasos)</option>
                  <option value="very_active">Muy Activo (6-7 días entreno intenso)</option>
                  <option value="extra_active">Atleta / Trabajo Físico Pesado</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Peso Objetivo (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={e => setTargetWeight(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none font-semibold text-emerald-400"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAutoCalculate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-xs font-semibold rounded-lg border border-orange-500/40 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Autocalcular Macros y Calorías Sugeridas
              </button>
            </div>
          </div>

          {/* Metas Nutricionales y Hábitos */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-orange-400 flex items-center gap-2 uppercase tracking-wider">
              <Flame className="w-4 h-4" /> 3. Metas Diarias de Nutrición & Hábitos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <label className="text-xs text-amber-400 font-semibold">Calorías Diarias</label>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    value={targetCalories}
                    onChange={e => setTargetCalories(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-base focus:border-amber-500 focus:outline-none"
                    required
                  />
                  <span className="text-xs text-slate-400">kcal</span>
                </div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <label className="text-xs text-rose-400 font-semibold">Proteína Meta</label>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    value={targetProtein}
                    onChange={e => setTargetProtein(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-base focus:border-rose-500 focus:outline-none"
                    required
                  />
                  <span className="text-xs text-slate-400">g</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">{(targetProtein / currentWeight).toFixed(1)} g/kg</span>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <label className="text-xs text-sky-400 font-semibold">Carbohidratos</label>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    value={targetCarbs}
                    onChange={e => setTargetCarbs(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-base focus:border-sky-500 focus:outline-none"
                    required
                  />
                  <span className="text-xs text-slate-400">g</span>
                </div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <label className="text-xs text-emerald-400 font-semibold">Grasas</label>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    value={targetFat}
                    onChange={e => setTargetFat(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-base focus:border-emerald-500 focus:outline-none"
                    required
                  />
                  <span className="text-xs text-slate-400">g</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs text-slate-400">Meta de Agua Diaria (ml)</label>
                <input
                  type="number"
                  step="250"
                  value={targetWaterMl}
                  onChange={e => setTargetWaterMl(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Meta Pasos Diarios (Polar)</label>
                <input
                  type="number"
                  step="500"
                  value={targetSteps}
                  onChange={e => setTargetSteps(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50"
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
