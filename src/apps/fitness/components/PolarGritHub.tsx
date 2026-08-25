import React, { useState } from 'react';
import { Heart, Activity, Zap, Moon, Flame, Plus, Watch, Calendar } from 'lucide-react';
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

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [nightlyStatus, setNightlyStatus] = useState<'Muy Bueno' | 'Bueno' | 'Comprometido' | 'Pobre'>('Muy Bueno');
  const [ansCharge, setAnsCharge] = useState<number | ''>('');
  const [sleepScore, setSleepScore] = useState<number | ''>('');
  const [restingHr, setRestingHr] = useState<number | ''>('');
  const [maxHr, setMaxHr] = useState<number | ''>('');
  const [vo2Max, setVo2Max] = useState<number | ''>('');
  const [cardioStatus, setCardioStatus] = useState<'Sobrecarga' | 'Productivo' | 'Mantenimiento' | 'Desentrenamiento'>('Productivo');
  const [cardioRatio, setCardioRatio] = useState<number | ''>('');
  const [z1z2Min, setZ1z2Min] = useState<number | ''>('');
  const [z3Min, setZ3Min] = useState<number | ''>('');
  const [z4z5Min, setZ4z5Min] = useState<number | ''>('');
  const [steps, setSteps] = useState<number | ''>('');
  const [calories, setCalories] = useState<number | ''>('');
  const [recommendation, setRecommendation] = useState(
    'Recuperación excelente. El sistema neuromuscular está en condiciones óptimas para entrenar Fuerza Pesada o Hipertrofia.'
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveMetric({
      date,
      nightly_recharge_status: nightlyStatus,
      ans_charge: ansCharge !== '' ? Number(ansCharge) : 0,
      sleep_score: sleepScore !== '' ? Number(sleepScore) : 0,
      resting_hr: restingHr !== '' ? Number(restingHr) : 0,
      max_hr: maxHr !== '' ? Number(maxHr) : 0,
      vo2_max_running_index: vo2Max !== '' ? Number(vo2Max) : undefined,
      cardio_load_status: cardioStatus,
      cardio_load_ratio: cardioRatio !== '' ? Number(cardioRatio) : 1.0,
      cardio_z1_z2_min: z1z2Min !== '' ? Number(z1z2Min) : 0,
      cardio_z3_min: z3Min !== '' ? Number(z3Min) : 0,
      cardio_z4_z5_min: z4z5Min !== '' ? Number(z4z5Min) : 0,
      daily_steps: steps !== '' ? Number(steps) : 0,
      polar_calories: calories !== '' ? Number(calories) : 0,
      fitspark_recommendation: recommendation
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111622] p-6 rounded-3xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
            <Watch className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Polar Grit X Pro Hub</h2>
            <p className="text-xs text-slate-400">Nightly Recharge™, Carga Cardiovascular & Zonas FC</p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-2xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Registrar Métricas
          </button>
        )}
      </div>

      {/* Grid Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#111622] border border-white/5 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Nightly Recharge</span>
          <div className="text-2xl font-black text-emerald-400">
            {latestMetric ? latestMetric.nightly_recharge_status : 'Sin datos'}
          </div>
          <p className="text-xs text-slate-400">
            {latestMetric ? `SNA: +${latestMetric.ans_charge} • Sueño: ${latestMetric.sleep_score} pts` : 'No hay registros'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111622] border border-white/5 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Training Load Pro</span>
          <div className="text-2xl font-black text-amber-400">
            {latestMetric ? latestMetric.cardio_load_status : 'Sin datos'}
          </div>
          <p className="text-xs text-slate-400">
            {latestMetric ? `Ratio de Carga: ${latestMetric.cardio_load_ratio}` : 'No hay registros'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111622] border border-white/5 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Frecuencia Cardíaca</span>
          <div className="text-2xl font-black text-white">
            {latestMetric ? `${latestMetric.resting_hr} ppm` : '--'}
          </div>
          <p className="text-xs text-slate-400">
            {latestMetric ? `FC Máx: ${latestMetric.max_hr} ppm` : 'Pendiente de sincronizar'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111622] border border-white/5 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Actividad Polar</span>
          <div className="text-2xl font-black text-white">
            {latestMetric ? `${latestMetric.daily_steps.toLocaleString()} pasos` : '--'}
          </div>
          <p className="text-xs text-slate-400">
            {latestMetric ? `Gasto: ${latestMetric.polar_calories} kcal` : '0 pasos'}
          </p>
        </div>
      </div>

      {/* Zonas FC & FitSpark */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#111622] border border-white/5 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-rose-400" /> Orientación Diaria FitSpark™
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed p-4 rounded-2xl bg-[#090C15] border border-white/5">
            {latestMetric?.fitspark_recommendation ||
              'Aún no hay métricas registradas de tu Polar Grit X Pro. En cuanto registres tu primer sueño o entrenamiento, aquí aparecerán las recomendaciones de recuperación del sistema nervioso y carga neuromuscular.'}
          </p>
        </div>

        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#111622] border border-white/5 space-y-4">
          <h4 className="text-sm font-bold text-white">Zonas de Frecuencia Cardíaca</h4>
          <div className="space-y-3 pt-1">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-emerald-400">Zona 1 & 2 (Quema Grasa / Base)</span>
                <span className="text-white font-mono">{latestMetric ? `${latestMetric.cardio_z1_z2_min} min` : '0 min'}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: latestMetric ? `${Math.min(100, latestMetric.cardio_z1_z2_min)}%` : '0%' }}
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-amber-400">Zona 3 (Aeróbico)</span>
                <span className="text-white font-mono">{latestMetric ? `${latestMetric.cardio_z3_min} min` : '0 min'}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: latestMetric ? `${Math.min(100, latestMetric.cardio_z3_min)}%` : '0%' }}
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-rose-400">Zona 4 & 5 (Umbral Anaeróbico)</span>
                <span className="text-white font-mono">{latestMetric ? `${latestMetric.cardio_z4_z5_min} min` : '0 min'}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all"
                  style={{ width: latestMetric ? `${Math.min(100, latestMetric.cardio_z4_z5_min)}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL REGISTRAR POLAR */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-white/10 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h4 className="font-bold text-white text-base">Registrar Métricas Polar</h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400">Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Nightly Recharge</label>
                  <select
                    value={nightlyStatus}
                    onChange={e => setNightlyStatus(e.target.value as any)}
                    className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Muy Bueno">Muy Bueno</option>
                    <option value="Bueno">Bueno</option>
                    <option value="Comprometido">Comprometido</option>
                    <option value="Pobre">Pobre</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400">Carga SNA</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={ansCharge}
                    onFocus={e => e.target.select()}
                    onChange={e => setAnsCharge(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Sueño (pts)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={sleepScore}
                    onFocus={e => e.target.select()}
                    onChange={e => setSleepScore(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">FC Reposo</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={restingHr}
                    onFocus={e => e.target.select()}
                    onChange={e => setRestingHr(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-rose-500 text-white font-bold rounded-xl">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
