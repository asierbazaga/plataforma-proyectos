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
  TrendingUp,
  ShieldAlert,
  Sparkles,
  Info,
  Calendar
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
    <div className="space-y-6">
      {/* Header Banner Polar Grit X Pro */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-rose-600/15 via-pink-600/10 to-transparent p-6 rounded-2xl border border-rose-500/25">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/25 flex-shrink-0">
            <Watch className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Polar Grit X Pro Hub</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Sincronización Multideporte
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Métricas de recuperación Nightly Recharge™, Carga cardiovascular Training Load Pro™ y Zonas FC.
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/25 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" /> Registrar Datos Polar Hoy
          </button>
        )}
      </div>

      {/* 1. Grid de Métricas Clave Polar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nightly Recharge */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-emerald-500 bg-slate-900/60">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Nightly Recharge™</span>
            <Moon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">
            {latestMetric?.nightly_recharge_status || 'Muy Bueno'}
          </div>
          <div className="flex justify-between text-xs text-slate-400 pt-1">
            <span>Carga SNA: <strong className="text-white">+{latestMetric?.ans_charge || 5.8}</strong></span>
            <span>Sueño: <strong className="text-sky-400">{latestMetric?.sleep_score || 88} pts</strong></span>
          </div>
        </div>

        {/* Training Load Pro */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-amber-500 bg-slate-900/60">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Training Load Pro™</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400">
            {latestMetric?.cardio_load_status || 'Productivo'}
          </div>
          <div className="flex justify-between text-xs text-slate-400 pt-1">
            <span>Ratio Carga: <strong className="text-white">{latestMetric?.cardio_load_ratio || 1.15}</strong></span>
            <span className="text-emerald-400 font-semibold">Adaptación Óptima</span>
          </div>
        </div>

        {/* Frecuencia Cardíaca & Running Index */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-rose-500 bg-slate-900/60">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Frecuencia Cardíaca</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-white flex items-baseline gap-1">
            {latestMetric?.resting_hr || 48} <span className="text-xs text-rose-400 font-normal">ppm reposo</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 pt-1">
            <span>FC Máxima: <strong className="text-white">{latestMetric?.max_hr || 186} ppm</strong></span>
            <span>VO2max: <strong className="text-amber-400">{latestMetric?.vo2_max_running_index || 54}</strong></span>
          </div>
        </div>

        {/* Pasos y Gasto Calórico Polar */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-sky-500 bg-slate-900/60">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Actividad Diaria</span>
            <Flame className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white flex items-baseline gap-1">
            {latestMetric?.daily_steps?.toLocaleString() || '11.420'} <span className="text-xs text-sky-400 font-normal">pasos</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 pt-1">
            <span>Gasto Polar: <strong className="text-amber-400">{latestMetric?.polar_calories || 2680} kcal</strong></span>
            <span className="text-emerald-400 font-semibold">100% Meta</span>
          </div>
        </div>
      </div>

      {/* 2. FitSpark™ Recommendation & Polar Heart Rate Zones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recomendación FitSpark (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-4 bg-slate-900/70 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Zap className="w-4 h-4" />
              FitSpark™ Daily Training Guidance
            </div>
            <h3 className="text-lg font-bold text-white leading-snug">
              Sugerencia de Esfuerzo Basada en tu Recuperación
            </h3>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                {latestMetric?.fitspark_recommendation ||
                  'Tu sistema nervioso central (SNA) se encuentra plenamente recuperado. Recomendación: Sesión principal de Fuerza Pesada (Presses / Sentadillas) o Hipertrofia de alta intensidad.'}
              </p>
            </div>
          </div>

          {/* Semáforo de Intensidad */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-xs text-emerald-300 font-bold">
              Semáforo Verde: Permiso total para entrenar a alta intensidad (RIR 1-2).
            </span>
          </div>
        </div>

        {/* Distribución en Zonas de Frecuencia Cardíaca (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl space-y-4 bg-slate-900/70">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              Zonas de Frecuencia Cardíaca Polar (Grit X Pro)
            </h3>
            <span className="text-xs text-slate-400">Total Cardio: {(latestMetric?.cardio_z1_z2_min || 35) + (latestMetric?.cardio_z3_min || 20) + (latestMetric?.cardio_z4_z5_min || 15)} min</span>
          </div>

          <div className="space-y-3 pt-1">
            {/* Zona 1 & 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-emerald-400">Zona 1 & 2: Quema Grasa / Base Aeróbica (50-70% FC)</span>
                <span className="text-white font-bold">{latestMetric?.cardio_z1_z2_min || 35} min</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-3/5" />
              </div>
              <p className="text-[10px] text-slate-400">Máxima salud mitocondrial y quema de triglicéridos sin fatigar el músculo.</p>
            </div>

            {/* Zona 3 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-amber-400">Zona 3: Resistencia Aeróbica (70-80% FC)</span>
                <span className="text-white font-bold">{latestMetric?.cardio_z3_min || 20} min</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-2/5" />
              </div>
              <p className="text-[10px] text-slate-400">Mejora el gasto cardíaco y la capacidad de transporte de oxígeno.</p>
            </div>

            {/* Zona 4 & 5 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-rose-400">Zona 4 & 5: Umbral Anaeróbico & VO2max (80-100% FC)</span>
                <span className="text-white font-bold">{latestMetric?.cardio_z4_z5_min || 15} min</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full w-1/4" />
              </div>
              <p className="text-[10px] text-slate-400">HIIT y series pesadas. Acelera el metabolismo (efecto EPOC).</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL REGISTRAR DATOS POLAR */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Watch className="w-4 h-4 text-rose-400" /> Registrar Métricas Polar Grit X Pro
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400">Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Nightly Recharge</label>
                  <select
                    value={nightlyStatus}
                    onChange={e => setNightlyStatus(e.target.value as any)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="Muy Bueno">Muy Bueno (Verde)</option>
                    <option value="Bueno">Bueno (Verde Claro)</option>
                    <option value="Comprometido">Comprometido (Naranja)</option>
                    <option value="Pobre">Pobre (Rojo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400">Carga SNA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ansCharge}
                    onChange={e => setAnsCharge(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Sueño (pts)</label>
                  <input
                    type="number"
                    value={sleepScore}
                    onChange={e => setSleepScore(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400">FC Reposo (ppm)</label>
                  <input
                    type="number"
                    value={restingHr}
                    onChange={e => setRestingHr(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400">Minutos Z1-Z2</label>
                  <input
                    type="number"
                    value={z1z2Min}
                    onChange={e => setZ1z2Min(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Minutos Z3</label>
                  <input
                    type="number"
                    value={z3Min}
                    onChange={e => setZ3Min(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Minutos Z4-Z5</label>
                  <input
                    type="number"
                    value={z4z5Min}
                    onChange={e => setZ4z5Min(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400">Pasos Diarios</label>
                  <input
                    type="number"
                    value={steps}
                    onChange={e => setSteps(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Calorías Polar</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={e => setCalories(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400">Consejo FitSpark de la Sesión</label>
                <textarea
                  rows={2}
                  value={recommendation}
                  onChange={e => setRecommendation(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-xl"
                >
                  Guardar Métricas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
