import React, { useState } from 'react';
import {
  Heart,
  Activity,
  Zap,
  Moon,
  Flame,
  Plus,
  Watch,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { PolarGritMetrics } from '../../../types';

interface PolarGritHubProps {
  metricsList: PolarGritMetrics[];
  canEdit: boolean;
  onSaveMetric: (metric: Omit<PolarGritMetrics, 'id'>) => Promise<void>;
}

export const PolarGritHub: React.FC<PolarGritHubProps> = ({
  metricsList,
  canEdit,
  onSaveMetric
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const latestMetric = metricsList.length > 0 ? metricsList[0] : null;

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [nightlyStatus, setNightlyStatus] = useState<'Muy Bueno' | 'Bueno' | 'Comprometido' | 'Pobre'>('Muy Bueno');
  const [ansCharge, setAnsCharge] = useState(5.8);
  const [sleepScore, setSleepScore] = useState(88);
  const [restingHr, setRestingHr] = useState(48);
  const [maxHr, setMaxHr] = useState(186);
  const [vo2Max, setVo2Max] = useState<number | ''>(54);
  const [cardioStatus, setCardioStatus] = useState<'Sobrecarga' | 'Productivo' | 'Mantenimiento' | 'Desentrenamiento'>('Productivo');
  const [cardioRatio, setCardioRatio] = useState(1.15);
  const [z1z2Min, setZ1z2Min] = useState(35);
  const [z3Min, setZ3Min] = useState(20);
  const [z4z5Min, setZ4z5Min] = useState(15);
  const [steps, setSteps] = useState(11420);
  const [calories, setCalories] = useState(2680);
  const [recommendation, setRecommendation] = useState(
    'Recuperación excelente. El sistema neuromuscular está en condiciones óptimas para entrenar Fuerza Pesada o Hipertrofia.'
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveMetric({
      date,
      nightly_recharge_status: nightlyStatus,
      ans_charge: Number(ansCharge),
      sleep_score: Number(sleepScore),
      resting_hr: Number(restingHr),
      max_hr: Number(maxHr),
      vo2_max_running_index: vo2Max !== '' ? Number(vo2Max) : undefined,
      cardio_load_status: cardioStatus,
      cardio_load_ratio: Number(cardioRatio),
      cardio_z1_z2_min: Number(z1z2Min),
      cardio_z3_min: Number(z3Min),
      cardio_z4_z5_min: Number(z4z5Min),
      daily_steps: Number(steps),
      polar_calories: Number(calories),
      fitspark_recommendation: recommendation
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-7">
      {/* Header Banner Polar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 bg-gradient-to-r from-rose-600/15 via-pink-600/10 to-slate-900 p-6 sm:p-7 rounded-3xl border border-rose-500/25 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/25 flex-shrink-0">
            <Watch className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Polar Grit X Pro Hub</h2>
              <span className="text-xs px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                Multideporte
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Métricas de recuperación Nightly Recharge™, Carga cardiovascular Training Load Pro™ y Zonas FC.
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs rounded-2xl shadow-lg shadow-rose-500/25 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" /> Registrar Datos Polar
          </button>
        )}
      </div>

      {/* 1. Grid de Métricas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-2.5 border-l-4 border-l-emerald-500 shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nightly Recharge™</span>
            <Moon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {latestMetric?.nightly_recharge_status || 'Muy Bueno'}
          </div>
          <div className="flex justify-between text-xs text-slate-400 pt-1">
            <span>Carga SNA: <strong className="text-white font-bold">+{latestMetric?.ans_charge || 5.8}</strong></span>
            <span>Sueño: <strong className="text-sky-400 font-bold">{latestMetric?.sleep_score || 88} pts</strong></span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-2.5 border-l-4 border-l-amber-500 shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Training Load Pro™</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {latestMetric?.cardio_load_status || 'Productivo'}
          </div>
          <div className="flex justify-between text-xs text-slate-400 pt-1">
            <span>Ratio Carga: <strong className="text-white font-bold">{latestMetric?.cardio_load_ratio || 1.15}</strong></span>
            <span className="text-emerald-400 font-bold">Adaptación Óptima</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-2.5 border-l-4 border-l-rose-500 shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Frecuencia Cardíaca</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white flex items-baseline gap-1">
            {latestMetric?.resting_hr || 48} <span className="text-xs text-rose-400 font-normal">ppm reposo</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 pt-1">
            <span>FC Máxima: <strong className="text-white font-bold">{latestMetric?.max_hr || 186} ppm</strong></span>
            <span>VO2max: <strong className="text-amber-400 font-bold">{latestMetric?.vo2_max_running_index || 54}</strong></span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-2.5 border-l-4 border-l-sky-500 shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Actividad Diaria</span>
            <Flame className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white flex items-baseline gap-1">
            {latestMetric?.daily_steps?.toLocaleString() || '11.420'} <span className="text-xs text-sky-400 font-normal">pasos</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 pt-1">
            <span>Gasto Polar: <strong className="text-amber-400 font-bold">{latestMetric?.polar_calories || 2680} kcal</strong></span>
            <span className="text-emerald-400 font-bold">100% Meta</span>
          </div>
        </div>
      </div>

      {/* 2. FitSpark & Zonas Cardíacas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        <div className="lg:col-span-5 p-7 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Zap className="w-4 h-4" />
              FitSpark™ Daily Training Guidance
            </div>
            <h3 className="text-xl font-extrabold text-white leading-snug">
              Sugerencia de Esfuerzo Basada en tu Recuperación
            </h3>
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                {latestMetric?.fitspark_recommendation ||
                  'Tu sistema nervioso central (SNA) se encuentra plenamente recuperado. Recomendación: Sesión principal de Fuerza Pesada o Hipertrofia de alta intensidad.'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-xs text-emerald-300 font-bold">
              Semáforo Verde: Permiso total para entrenar a alta intensidad (RIR 1-2).
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 p-7 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-rose-400" />
              Zonas de Frecuencia Cardíaca Polar (Grit X Pro)
            </h3>
            <span className="text-xs text-slate-400 font-bold">
              Total: {(latestMetric?.cardio_z1_z2_min || 35) + (latestMetric?.cardio_z3_min || 20) + (latestMetric?.cardio_z4_z5_min || 15)} min
            </span>
          </div>

          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-emerald-400">Zona 1 & 2: Quema Grasa / Base Aeróbica (50-70% FC)</span>
                <span className="text-white font-bold">{latestMetric?.cardio_z1_z2_min || 35} min</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-3/5" />
              </div>
              <p className="text-[11px] text-slate-400">Máxima salud mitocondrial y oxidación de grasas sin fatiga residual.</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-amber-400">Zona 3: Resistencia Aeróbica (70-80% FC)</span>
                <span className="text-white font-bold">{latestMetric?.cardio_z3_min || 20} min</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-2/5" />
              </div>
              <p className="text-[11px] text-slate-400">Mejora el gasto cardíaco y la eficiencia cardiovascular.</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-rose-400">Zona 4 & 5: Umbral Anaeróbico & VO2max (80-100% FC)</span>
                <span className="text-white font-bold">{latestMetric?.cardio_z4_z5_min || 15} min</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full w-1/4" />
              </div>
              <p className="text-[11px] text-slate-400">HIIT y series pesadas. Acelera el metabolismo post-ejercicio.</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL REGISTRAR DATOS POLAR */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Watch className="w-5 h-5 text-rose-400" /> Registrar Métricas Polar
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium">Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Nightly Recharge</label>
                  <select
                    value={nightlyStatus}
                    onChange={e => setNightlyStatus(e.target.value as any)}
                    className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Muy Bueno">Muy Bueno (Verde)</option>
                    <option value="Bueno">Bueno (Verde Claro)</option>
                    <option value="Comprometido">Comprometido (Naranja)</option>
                    <option value="Pobre">Pobre (Rojo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400">Carga SNA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ansCharge}
                    onChange={e => setAnsCharge(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Sueño (pts)</label>
                  <input
                    type="number"
                    value={sleepScore}
                    onChange={e => setSleepScore(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">FC Reposo (ppm)</label>
                  <input
                    type="number"
                    value={restingHr}
                    onChange={e => setRestingHr(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400">Z1-Z2 (min)</label>
                  <input
                    type="number"
                    value={z1z2Min}
                    onChange={e => setZ1z2Min(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Z3 (min)</label>
                  <input
                    type="number"
                    value={z3Min}
                    onChange={e => setZ3Min(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Z4-Z5 (min)</label>
                  <input
                    type="number"
                    value={z4z5Min}
                    onChange={e => setZ4z5Min(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400">Pasos</label>
                  <input
                    type="number"
                    value={steps}
                    onChange={e => setSteps(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Calorías Polar</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={e => setCalories(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-xl"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
