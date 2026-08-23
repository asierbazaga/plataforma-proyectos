import React, { useState } from 'react';
import {
  Sparkles,
  Target,
  Dumbbell,
  Flame,
  Scale,
  Heart,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Zap,
  Activity,
  Droplet,
  Watch,
  X
} from 'lucide-react';
import { FitnessProfile, FitnessGoal, ActivityLevel, Gender } from '../../../types';

interface FitnessAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FitnessProfile;
  onSavePlan: (updated: Partial<FitnessProfile>, initialWeightEntry?: number) => Promise<void>;
}

export const FitnessAssessmentModal: React.FC<FitnessAssessmentModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSavePlan
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  // Paso 1: Biometría
  const [currentWeight, setCurrentWeight] = useState<number>(profile.current_weight || 78.5);
  const [heightCm, setHeightCm] = useState<number>(profile.height_cm || 178);
  const [age, setAge] = useState<number>(profile.age || 28);
  const [gender, setGender] = useState<Gender>(profile.gender || 'male');

  // Paso 2: Objetivo
  const [goal, setGoal] = useState<FitnessGoal>(profile.goal || 'fat_loss');
  const [targetWeight, setTargetWeight] = useState<number>(profile.target_weight || 74.0);
  const [intensity, setIntensity] = useState<'moderate' | 'mild' | 'aggressive'>('moderate');

  // Paso 3: Frecuencia de entreno & Polar
  const [trainingDays, setTrainingDays] = useState<number>(4);
  const [hasPolar, setHasPolar] = useState<boolean>(true);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activity_level || 'moderate');

  if (!isOpen) return null;

  // Cálculo Dinámico en Tiempo Real
  const calculatePlan = () => {
    // 1. TDEE
    let bmr = 10 * currentWeight + 6.25 * heightCm - 5 * age + (gender === 'male' ? 5 : -161);
    const actMultipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725,
      extra_active: 1.9
    };
    const tdee = Math.round(bmr * (actMultipliers[activityLevel] || 1.55));

    // 2. Ajuste Calórico
    let calAdjustment = 0;
    if (goal === 'fat_loss') {
      calAdjustment = intensity === 'mild' ? -0.15 : intensity === 'aggressive' ? -0.25 : -0.20;
    } else if (goal === 'muscle_gain') {
      calAdjustment = intensity === 'mild' ? 0.08 : intensity === 'aggressive' ? 0.16 : 0.12;
    } else if (goal === 'recomp') {
      calAdjustment = -0.06;
    }

    const targetCalories = Math.round(tdee * (1 + calAdjustment));

    // 3. Macros
    const proteinRatio = goal === 'fat_loss' || goal === 'recomp' ? 2.2 : 2.0;
    const targetProtein = Math.round(currentWeight * proteinRatio);
    const targetFat = Math.round(currentWeight * 0.85);
    const remainingCals = targetCalories - (targetProtein * 4 + targetFat * 9);
    const targetCarbs = Math.max(50, Math.round(remainingCals / 4));
    const targetWater = Math.round(currentWeight * 38);

    // 4. Rutina Recomendada
    let recommendedRoutine = 'Torso - Pierna (4 días/semana)';
    let splitType = 'torso_pierna';
    if (trainingDays <= 3) {
      recommendedRoutine = 'Full Body Frecuencia 3 (3 días/semana)';
      splitType = 'full_body';
    } else if (trainingDays >= 5) {
      recommendedRoutine = 'Push - Pull - Legs Hipertrofia (5-6 días/semana)';
      splitType = 'ppl';
    }
    if (hasPolar && trainingDays === 4) {
      recommendedRoutine = 'Polar Híbrido: Fuerza Torso/Pierna + Cardio Zona 2';
      splitType = 'polar_hybrid';
    }

    return {
      tdee,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      targetWater,
      recommendedRoutine,
      splitType,
      deficitPct: Math.round(calAdjustment * 100)
    };
  };

  const plan = calculatePlan();

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      await onSavePlan(
        {
          current_weight: Number(currentWeight),
          height_cm: Number(heightCm),
          age: Number(age),
          gender,
          goal,
          target_weight: Number(targetWeight),
          activity_level: activityLevel,
          target_calories: plan.targetCalories,
          target_protein: plan.targetProtein,
          target_carbs: plan.targetCarbs,
          target_fat: plan.targetFat,
          target_water_ml: plan.targetWater,
          target_daily_steps: hasPolar ? 11000 : 10000,
          preferred_split: plan.splitType,
          onboarding_completed: true
        },
        Number(currentWeight)
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111622] border border-white/10 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl relative animate-in fade-in">
        {/* Header del Test */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Evaluación & Plan de Cambio Físico</h3>
              <p className="text-xs text-slate-400">Paso {step} de 4 • Configuración inteligente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar de Pasos */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-[#FF6B00]' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* PASO 1: BIOMETRÍA & PESO REAL */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h4 className="text-base font-bold text-white">1. Tu punto de partida</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Introduce tu peso en ayunas (puedes actualizarlo mañana tras pesarte) y tus datos antropométricos básicos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#090C15] border border-white/5 space-y-2">
                <label className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider block">
                  Peso Actual (en ayunas)
                </label>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={currentWeight}
                    onChange={e => setCurrentWeight(Number(e.target.value))}
                    className="w-full bg-transparent text-3xl font-black text-white focus:outline-none font-mono"
                  />
                  <span className="text-sm font-bold text-slate-400">kg</span>
                </div>
                <p className="text-[11px] text-slate-500">Pésate por la mañana antes de desayunar.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090C15] border border-white/5 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Altura
                </label>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    required
                    value={heightCm}
                    onChange={e => setHeightCm(Number(e.target.value))}
                    className="w-full bg-transparent text-3xl font-black text-white focus:outline-none font-mono"
                  />
                  <span className="text-sm font-bold text-slate-400">cm</span>
                </div>
                <p className="text-[11px] text-slate-500">Para el cálculo de gasto metabólico basal.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Edad</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-bold text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Género</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as Gender)}
                  className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-bold text-xs"
                >
                  <option value="male">Hombre</option>
                  <option value="female">Mujer</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: OBJETIVO */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h4 className="text-base font-bold text-white">2. ¿Cuál es tu objetivo de cambio físico?</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Ajustará el balance calórico exacto y los gramos de proteína por kilo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  key: 'fat_loss',
                  title: 'Definición & Pérdida de Grasa',
                  desc: 'Déficit calórico para marcar abdomen y preservar el 100% del músculo.',
                  icon: Flame,
                  badge: 'Popular'
                },
                {
                  key: 'recomp',
                  title: 'Recomposición Corporal',
                  desc: 'Perder grasa y ganar músculo simultáneamente con 2.2g/kg de proteína.',
                  icon: Activity,
                  badge: 'Ideal Intermedios'
                },
                {
                  key: 'muscle_gain',
                  title: 'Volumen Limpio / Hipertrofia',
                  desc: 'Superávit controlado para maximizar ganancias de fuerza y masa muscular.',
                  icon: Dumbbell,
                  badge: '+Fuerza'
                },
                {
                  key: 'maintenance',
                  title: 'Mantenimiento & Salud',
                  desc: 'Estabilizar peso corporal con rendimiento atlético óptimo.',
                  icon: Target,
                  badge: 'Balance'
                }
              ].map(item => {
                const Icon = item.icon;
                const isSelected = goal === item.key;
                return (
                  <div
                    key={item.key}
                    onClick={() => setGoal(item.key as FitnessGoal)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-[#FF6B00]/15 border-[#FF6B00] shadow-md shadow-[#FF6B00]/10 scale-[1.01]'
                        : 'bg-[#090C15] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#FF6B00]' : 'text-slate-400'}`} />
                        <h5 className="font-bold text-white text-xs">{item.title}</h5>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 font-semibold">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Peso Objetivo (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={e => setTargetWeight(Number(e.target.value))}
                  className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3.5 py-2.5 text-emerald-400 font-black text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Ritmo del Plan</label>
                <select
                  value={intensity}
                  onChange={e => setIntensity(e.target.value as any)}
                  className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-bold text-xs"
                >
                  <option value="mild">Conservador (Más sostenible)</option>
                  <option value="moderate">Óptimo Recomendado (Equilibrado)</option>
                  <option value="aggressive">Acelerado</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: ENTRENAMIENTO & POLAR */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h4 className="text-base font-bold text-white">3. Entrenamiento & Ecosistema Polar</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Configuraremos tu división de rutinas y la monitorización de recuperación.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium block">
                ¿Cuántos días a la semana vas a entrenar?
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {[3, 4, 5, 6].map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setTrainingDays(days)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      trainingDays === days
                        ? 'bg-[#FF6B00] border-[#FF6B00] text-white font-black shadow-md'
                        : 'bg-[#090C15] border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-base font-mono">{days} días</div>
                    <div className="text-[10px] opacity-80 mt-0.5">
                      {days === 3 ? 'FullBody' : days === 4 ? 'Torso/Pierna' : 'PPL'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reloj Polar */}
            <div
              onClick={() => setHasPolar(!hasPolar)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                hasPolar
                  ? 'bg-rose-500/10 border-rose-500/40 text-white'
                  : 'bg-[#090C15] border-white/5 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Watch className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-white text-xs">Uso Polar Grit X Pro</h5>
                  <p className="text-[11px] text-slate-400">
                    Sincronizar Nightly Recharge, Carga SNA, Training Load y Zonas de FC.
                  </p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs ${
                  hasPolar ? 'bg-rose-500 border-rose-500 text-white font-bold' : 'border-slate-700'
                }`}
              >
                {hasPolar && '✓'}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Nivel de Actividad Diaria</label>
              <select
                value={activityLevel}
                onChange={e => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full bg-[#090C15] border border-white/5 rounded-xl px-3.5 py-2.5 text-white font-bold text-xs"
              >
                <option value="sedentary">Sedentario (Trabajo de oficina / ~4.000 pasos)</option>
                <option value="light">Ligero (~7.000 pasos diarios)</option>
                <option value="moderate">Moderado (Entrenamientos regulares / ~10.000 pasos)</option>
                <option value="very_active">Muy Activo (Alta demanda diaria / +12.000 pasos)</option>
              </select>
            </div>
          </div>
        )}

        {/* PASO 4: RESUMEN DEL PLAN GENERADO */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">Plan Generado</span>
              <h4 className="text-lg font-black text-white mt-0.5">Tu Estrategia Personalizada</h4>
              <p className="text-xs text-slate-400">
                Todo listo para empezar mañana desde tu primer pesaje.
              </p>
            </div>

            {/* Calories Hero */}
            <div className="p-5 rounded-2xl bg-[#090C15] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Objetivo Calórico</span>
                <div className="text-3xl font-black text-white font-mono flex items-baseline gap-1 mt-0.5">
                  {plan.targetCalories} <span className="text-xs font-normal text-[#FF6B00]">kcal / día</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  TDEE estimado: {plan.tdee} kcal ({plan.deficitPct > 0 ? `+${plan.deficitPct}%` : `${plan.deficitPct}%`})
                </p>
              </div>

              <div className="text-right space-y-1">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {goal === 'fat_loss' ? 'Quema de Grasa' : goal === 'recomp' ? 'Recomposición' : 'Hipertrofia'}
                </span>
                <p className="text-[11px] text-slate-400">Meta: {targetWeight} kg</p>
              </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-2xl bg-[#090C15] border border-white/5">
                <span className="text-[10px] font-bold text-[#FF3B30] block">PROTEÍNA</span>
                <span className="text-xl font-black text-white font-mono">{plan.targetProtein}g</span>
                <span className="text-[10px] text-slate-500 block">{(plan.targetProtein / currentWeight).toFixed(1)}g/kg</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#090C15] border border-white/5">
                <span className="text-[10px] font-bold text-[#38BDF8] block">CARBOS</span>
                <span className="text-xl font-black text-white font-mono">{plan.targetCarbs}g</span>
                <span className="text-[10px] text-slate-500 block">Energía</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#090C15] border border-white/5">
                <span className="text-[10px] font-bold text-[#30D158] block">GRASAS</span>
                <span className="text-xl font-black text-white font-mono">{plan.targetFat}g</span>
                <span className="text-[10px] text-slate-500 block">Salud hormonal</span>
              </div>
            </div>

            {/* Rutina Sugerida */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-[#FF6B00] flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5" /> Rutina Asignada:
              </span>
              <h5 className="font-bold text-white text-sm">{plan.recommendedRoutine}</h5>
              <p className="text-[11px] text-slate-400">
                La encontrarás disponible en la pestaña <strong>Entrenar &gt; Rutinas Sugeridas</strong> para registrar tus series y cargas en 1 toque.
              </p>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#FF6B00] hover:bg-[#FA8500] text-white text-xs font-bold rounded-xl shadow-lg transition-all"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#30D158] hover:bg-emerald-600 text-black font-black text-xs rounded-xl shadow-lg transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSaving ? 'Guardando...' : 'Iniciar mi Plan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
