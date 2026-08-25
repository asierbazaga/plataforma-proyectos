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
  const [age, setAge] = useState<number | ''>(profile.age || '');
  const [gender, setGender] = useState<Gender>(profile.gender || 'male');
  const [heightCm, setHeightCm] = useState<number | ''>(profile.height_cm || '');
  const [currentWeight, setCurrentWeight] = useState<number | ''>(profile.current_weight || '');
  const [targetWeight, setTargetWeight] = useState<number | ''>(profile.target_weight || '');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activity_level || 'moderate');
  const [goal, setGoal] = useState<FitnessGoal>(profile.goal || 'fat_loss');
  const [deficitSurplusPct, setDeficitSurplusPct] = useState<number | ''>(profile.deficit_surplus_pct ?? -20);
  const [targetCalories, setTargetCalories] = useState<number | ''>(profile.target_calories || '');
  const [targetProtein, setTargetProtein] = useState<number | ''>(profile.target_protein || '');
  const [targetCarbs, setTargetCarbs] = useState<number | ''>(profile.target_carbs || '');
  const [targetFat, setTargetFat] = useState<number | ''>(profile.target_fat || '');
  const [targetWaterMl, setTargetWaterMl] = useState<number | ''>(profile.target_water_ml || '');
  const [targetSteps, setTargetSteps] = useState<number | ''>(profile.target_daily_steps || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleAutoCalculate = () => {
    const w = Number(currentWeight) || 75;
    const h = Number(heightCm) || 178;
    const a = Number(age) || 28;

    let bmr = 10 * w + 6.25 * h - 5 * a;
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
    const prot = Math.round(w * (goal === 'fat_loss' || goal === 'recomp' ? 2.2 : 2.0));
    const fat = Math.round(w * 0.9);
    const remainingCals = cal - (prot * 4 + fat * 9);
    const carbs = Math.max(50, Math.round(remainingCals / 4));

    setDeficitSurplusPct(adjPct);
    setTargetCalories(cal);
    setTargetProtein(prot);
    setTargetCarbs(carbs);
    setTargetFat(fat);
    setTargetWaterMl(Math.round(w * 38));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        age: Number(age) || 28,
        gender,
        height_cm: Number(heightCm) || 178,
        current_weight: Number(currentWeight) || 75,
        target_weight: Number(targetWeight) || 70,
        activity_level: activityLevel,
        goal,
        deficit_surplus_pct: Number(deficitSurplusPct) || -20,
        target_calories: Number(targetCalories) || 2000,
        target_protein: Number(targetProtein) || 160,
        target_carbs: Number(targetCarbs) || 190,
        target_fat: Number(targetFat) || 65,
        target_water_ml: Number(targetWaterMl) || 2800,
        target_daily_steps: Number(targetSteps) || 10000
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111622] border border-white/10 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Perfil de Usuario</h3>
            <p className="text-xs text-slate-400">Biometría y metas físicas</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Biometría */}
          <div className="space-y-2">
            <label className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Biometría</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-slate-500">Edad</label>
                <input
                  type="number"
                  placeholder="0"
                  value={age}
                  onFocus={e => e.target.select()}
                  onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-white"
                />
              </div>
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
                <label className="text-slate-500">Altura (cm)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={heightCm}
                  onFocus={e => e.target.select()}
                  onChange={e => setHeightCm(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-500">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={currentWeight}
                  onFocus={e => e.target.select()}
                  onChange={e => setCurrentWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-[#FF6B00] font-bold"
                />
              </div>
            </div>
          </div>

          {/* Objetivo */}
          <div className="space-y-2">
            <label className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Objetivo</label>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-slate-500">Meta Principal</label>
                <select
                  value={goal}
                  onChange={e => setGoal(e.target.value as FitnessGoal)}
                  className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-white"
                >
                  <option value="fat_loss">Definición</option>
                  <option value="recomp">Recomposición</option>
                  <option value="muscle_gain">Volumen</option>
                  <option value="maintenance">Mantenimiento</option>
                </select>
              </div>
              <div>
                <label className="text-slate-500">Peso Objetivo (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={targetWeight}
                  onFocus={e => e.target.select()}
                  onChange={e => setTargetWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-emerald-400 font-bold"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAutoCalculate}
              className="mt-2 text-xs text-[#FF6B00] hover:underline font-bold flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" /> Autocalcular macros sugeridos
            </button>
          </div>

          {/* Macros */}
          <div className="space-y-2">
            <label className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Metas Diarias</label>
            <div className="grid grid-cols-4 gap-2">
              <div className="p-3 rounded-xl bg-[#090C15] border border-white/5 text-center">
                <span className="text-[10px] text-amber-400 block font-bold">KCAL</span>
                <input
                  type="number"
                  placeholder="0"
                  value={targetCalories}
                  onFocus={e => e.target.select()}
                  onChange={e => setTargetCalories(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-transparent text-center text-white font-black text-sm mt-0.5 focus:outline-none"
                />
              </div>
              <div className="p-3 rounded-xl bg-[#090C15] border border-white/5 text-center">
                <span className="text-[10px] text-[#FF3B30] block font-bold">PRO (g)</span>
                <input
                  type="number"
                  placeholder="0"
                  value={targetProtein}
                  onFocus={e => e.target.select()}
                  onChange={e => setTargetProtein(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-transparent text-center text-white font-black text-sm mt-0.5 focus:outline-none"
                />
              </div>
              <div className="p-3 rounded-xl bg-[#090C15] border border-white/5 text-center">
                <span className="text-[10px] text-[#38BDF8] block font-bold">CARB (g)</span>
                <input
                  type="number"
                  placeholder="0"
                  value={targetCarbs}
                  onFocus={e => e.target.select()}
                  onChange={e => setTargetCarbs(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-transparent text-center text-white font-black text-sm mt-0.5 focus:outline-none"
                />
              </div>
              <div className="p-3 rounded-xl bg-[#090C15] border border-white/5 text-center">
                <span className="text-[10px] text-[#30D158] block font-bold">FAT (g)</span>
                <input
                  type="number"
                  placeholder="0"
                  value={targetFat}
                  onFocus={e => e.target.select()}
                  onChange={e => setTargetFat(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-transparent text-center text-white font-black text-sm mt-0.5 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-[#FF6B00] text-white font-bold rounded-xl">
              {isSaving ? 'Guardando...' : 'Guardar Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
