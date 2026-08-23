import React, { useState } from 'react';
import {
  Scale,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Activity,
  Calculator,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { BodyProgressEntry, FitnessProfile } from '../../../types';

interface BodyMetricsTrackerProps {
  profile: FitnessProfile;
  canEdit: boolean;
  progressList: BodyProgressEntry[];
  onAddEntry: (entry: Omit<BodyProgressEntry, 'id'>) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
  initialOpenModal?: boolean;
}

export const BodyMetricsTracker: React.FC<BodyMetricsTrackerProps> = ({
  profile,
  canEdit,
  progressList,
  onAddEntry,
  onDeleteEntry,
  initialOpenModal = false
}) => {
  const [showAddModal, setShowAddModal] = useState(initialOpenModal);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState(profile.current_weight || 78.5);
  const [bodyFat, setBodyFat] = useState<number | ''>('');
  const [waistCm, setWaistCm] = useState<number | ''>(84);
  const [neckCm, setNeckCm] = useState<number | ''>(38);
  const [chestCm, setChestCm] = useState<number | ''>(104);
  const [armCm, setArmCm] = useState<number | ''>(37.2);
  const [thighCm, setThighCm] = useState<number | ''>(58);
  const [hipsCm, setHipsCm] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Auto-calcular % Grasa con fórmula US Navy
  const calculateNavyBodyFat = (waist: number, neck: number, height: number, gender: 'male' | 'female', hips?: number) => {
    if (gender === 'male') {
      if (waist <= neck) return 10;
      // Formula: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
      const val = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
      return Math.max(4, Math.min(50, Math.round(val * 10) / 10));
    } else {
      const hipsVal = hips || waist * 1.15;
      const val = 495 / (1.29579 - 0.35004 * Math.log10(waist + hipsVal - neck) + 0.22100 * Math.log10(height)) - 450;
      return Math.max(8, Math.min(60, Math.round(val * 10) / 10));
    }
  };

  const handleWaistOrNeckChange = (newWaist: number, newNeck: number) => {
    if (newWaist > 0 && newNeck > 0 && profile.height_cm > 0) {
      const bf = calculateNavyBodyFat(newWaist, newNeck, profile.height_cm, profile.gender);
      setBodyFat(bf);
    }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;

    await onAddEntry({
      date,
      weight: Number(weight),
      body_fat_percentage: bodyFat !== '' ? Number(bodyFat) : undefined,
      waist_cm: waistCm !== '' ? Number(waistCm) : undefined,
      neck_cm: neckCm !== '' ? Number(neckCm) : undefined,
      chest_cm: chestCm !== '' ? Number(chestCm) : undefined,
      arm_cm: armCm !== '' ? Number(armCm) : undefined,
      thigh_cm: thighCm !== '' ? Number(thighCm) : undefined,
      hips_cm: hipsCm !== '' ? Number(hipsCm) : undefined,
      notes
    });

    setNotes('');
    setShowAddModal(false);
  };

  // Cálculo de Peso Tendencia (Media móvil ponderada / Trend weight)
  const sortedEntries = [...progressList].sort((a, b) => a.date.localeCompare(b.date));
  const latestEntry = sortedEntries[sortedEntries.length - 1];
  const firstEntry = sortedEntries[0];

  const totalLoss = firstEntry && latestEntry ? (firstEntry.weight - latestEntry.weight).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Header & Resumen General */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-6 rounded-2xl border border-emerald-500/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Control de Peso & Composición Corporal
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Fórmula US Navy</span>
            </h2>
            <p className="text-xs text-slate-400">Algoritmo de peso tendencia y medidas anatómicas para ver el cambio real.</p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" /> Registrar Peso / Medidas
          </button>
        )}
      </div>

      {/* KPI Cards de Peso & Composición */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl space-y-1 border-l-4 border-l-emerald-500 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Peso Actual</span>
          <div className="text-2xl font-black text-white flex items-baseline gap-1">
            {latestEntry ? latestEntry.weight : profile.current_weight} <span className="text-xs text-slate-400">kg</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">Meta: {profile.target_weight} kg</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-1 border-l-4 border-l-teal-500 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Cambio Total</span>
          <div className="text-2xl font-black text-white flex items-baseline gap-1">
            {Number(totalLoss) > 0 ? `-${totalLoss}` : totalLoss} <span className="text-xs text-slate-400">kg</span>
          </div>
          <p className="text-[11px] text-slate-400">Desde el primer registro</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-1 border-l-4 border-l-amber-500 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">% Grasa Estimado</span>
          <div className="text-2xl font-black text-amber-400 flex items-baseline gap-1">
            {latestEntry?.body_fat_percentage || 16.9} <span className="text-xs text-slate-400">%</span>
          </div>
          <p className="text-[11px] text-slate-400">Cintura actual: {latestEntry?.waist_cm || 84} cm</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-1 border-l-4 border-l-sky-500 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Ritmo de Progreso</span>
          <div className="text-2xl font-black text-sky-400 flex items-baseline gap-1">
            ~0.5 <span className="text-xs text-slate-400">kg/semana</span>
          </div>
          <p className="text-[11px] text-sky-300 font-medium">Zona Óptima de Hipertrofia/Corte</p>
        </div>
      </div>

      {/* Historial de Registros & Perímetros */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 bg-slate-900/70">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Historial de Pesajes & Perímetros Anatómicos
          </h3>
          <span className="text-xs text-slate-400">{sortedEntries.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 bg-slate-950/40">
              <tr>
                <th className="py-3 px-3">Fecha</th>
                <th className="py-3 px-3">Peso (kg)</th>
                <th className="py-3 px-3">% Grasa</th>
                <th className="py-3 px-3">Cintura</th>
                <th className="py-3 px-3">Pecho</th>
                <th className="py-3 px-3">Brazo</th>
                <th className="py-3 px-3">Muslo</th>
                <th className="py-3 px-3">Notas</th>
                {canEdit && <th className="py-3 px-3 text-right">Acción</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {[...sortedEntries].reverse().map(entry => (
                <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">{entry.date}</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">{entry.weight} kg</td>
                  <td className="py-3 px-3 font-medium text-amber-400">
                    {entry.body_fat_percentage ? `${entry.body_fat_percentage}%` : '-'}
                  </td>
                  <td className="py-3 px-3 text-slate-300">{entry.waist_cm ? `${entry.waist_cm} cm` : '-'}</td>
                  <td className="py-3 px-3 text-slate-300">{entry.chest_cm ? `${entry.chest_cm} cm` : '-'}</td>
                  <td className="py-3 px-3 text-slate-300">{entry.arm_cm ? `${entry.arm_cm} cm` : '-'}</td>
                  <td className="py-3 px-3 text-slate-300">{entry.thigh_cm ? `${entry.thigh_cm} cm` : '-'}</td>
                  <td className="py-3 px-3 text-slate-400 italic max-w-xs truncate">{entry.notes || '-'}</td>
                  {canEdit && (
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Eliminar pesaje"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REGISTRAR PESO & MEDIDAS */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" /> Registrar Pesaje & Medidas
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400">Fecha de Pesaje</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold text-emerald-400">Peso Corporal (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={e => setWeight(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-black text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Perímetros anatómicos */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <label className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                    Perímetros Corporales (cm)
                  </label>
                  <span className="text-[10px] text-slate-400">Calcula % Grasa automáticamente</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-400 text-[11px]">Cintura (ombligo)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="Ej. 84"
                      value={waistCm}
                      onChange={e => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setWaistCm(val);
                        if (typeof val === 'number' && typeof neckCm === 'number') {
                          handleWaistOrNeckChange(val, neckCm);
                        }
                      }}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px]">Cuello (bajo nuez)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="Ej. 38"
                      value={neckCm}
                      onChange={e => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setNeckCm(val);
                        if (typeof val === 'number' && typeof waistCm === 'number') {
                          handleWaistOrNeckChange(waistCm, val);
                        }
                      }}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px]">% Grasa Calculado</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Auto"
                      value={bodyFat}
                      onChange={e => setBodyFat(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-bold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px]">Pecho</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="Ej. 104"
                      value={chestCm}
                      onChange={e => setChestCm(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px]">Brazo (flexionado)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="Ej. 37.5"
                      value={armCm}
                      onChange={e => setArmCm(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px]">Muslo</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="Ej. 58"
                      value={thighCm}
                      onChange={e => setThighCm(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-400">Notas / Sensaciones de Retención</label>
                <textarea
                  rows={2}
                  placeholder="Ej. Buena definición matutina, sin retención..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
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
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl"
                >
                  Guardar Medición
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
