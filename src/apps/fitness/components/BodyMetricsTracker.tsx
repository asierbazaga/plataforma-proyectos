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
  const [notes, setNotes] = useState('');

  const calculateNavyBodyFat = (waist: number, neck: number, height: number, gender: 'male' | 'female') => {
    if (gender === 'male') {
      if (waist <= neck) return 10;
      const val = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
      return Math.max(4, Math.min(50, Math.round(val * 10) / 10));
    } else {
      const val = 495 / (1.29579 - 0.35004 * Math.log10(waist + waist * 1.15 - neck) + 0.22100 * Math.log10(height)) - 450;
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
      notes
    });

    setNotes('');
    setShowAddModal(false);
  };

  const sortedEntries = [...progressList].sort((a, b) => a.date.localeCompare(b.date));
  const latestEntry = sortedEntries[sortedEntries.length - 1];
  const firstEntry = sortedEntries[0];

  const totalLoss = firstEntry && latestEntry ? (firstEntry.weight - latestEntry.weight).toFixed(1) : '0.0';

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-slate-900 p-6 sm:p-7 rounded-3xl border border-emerald-500/25 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 flex-shrink-0">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-3">
              Peso & Medidas Corporales
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Fórmula US Navy
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Control de peso tendencia y circunferencias para ver la recomposición real.
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/25 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" /> Registrar Pesaje
          </button>
        )}
      </div>

      {/* KPI Cards Espaciosas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-1.5 border-l-4 border-l-emerald-500 shadow-md">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Peso Actual</span>
          <div className="text-3xl font-black text-white flex items-baseline gap-1">
            {latestEntry ? latestEntry.weight : profile.current_weight} <span className="text-sm text-slate-400 font-normal">kg</span>
          </div>
          <p className="text-xs text-emerald-400 font-semibold">Meta: {profile.target_weight} kg</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-1.5 border-l-4 border-l-teal-500 shadow-md">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cambio Total</span>
          <div className="text-3xl font-black text-white flex items-baseline gap-1">
            {Number(totalLoss) > 0 ? `-${totalLoss}` : totalLoss} <span className="text-sm text-slate-400 font-normal">kg</span>
          </div>
          <p className="text-xs text-slate-400">Desde el inicio del plan</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-1.5 border-l-4 border-l-amber-500 shadow-md">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">% Grasa Estimado</span>
          <div className="text-3xl font-black text-amber-400 flex items-baseline gap-1">
            {latestEntry?.body_fat_percentage || 16.9} <span className="text-sm text-slate-400 font-normal">%</span>
          </div>
          <p className="text-xs text-slate-400">Cintura: {latestEntry?.waist_cm || 84} cm</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-1.5 border-l-4 border-l-sky-500 shadow-md">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ritmo de Progreso</span>
          <div className="text-3xl font-black text-sky-400 flex items-baseline gap-1">
            ~0.5 <span className="text-sm text-slate-400 font-normal">kg/sem</span>
          </div>
          <p className="text-xs text-sky-300 font-semibold">Zona Óptima de Cambio</p>
        </div>
      </div>

      {/* Tabla de Registros */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-5">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h3 className="font-extrabold text-white text-lg flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Historial de Pesajes & Medidas
          </h3>
          <span className="text-xs text-slate-400 font-bold">{sortedEntries.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase font-extrabold text-slate-400 border-b border-slate-800 bg-slate-950/40">
              <tr>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Peso (kg)</th>
                <th className="py-3 px-4">% Grasa</th>
                <th className="py-3 px-4">Cintura</th>
                <th className="py-3 px-4">Pecho</th>
                <th className="py-3 px-4">Brazo</th>
                <th className="py-3 px-4">Muslo</th>
                <th className="py-3 px-4">Notas</th>
                {canEdit && <th className="py-3 px-4 text-right">Acción</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {[...sortedEntries].reverse().map(entry => (
                <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{entry.date}</td>
                  <td className="py-3 px-4 font-black text-emerald-400">{entry.weight} kg</td>
                  <td className="py-3 px-4 font-bold text-amber-400">
                    {entry.body_fat_percentage ? `${entry.body_fat_percentage}%` : '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{entry.waist_cm ? `${entry.waist_cm} cm` : '-'}</td>
                  <td className="py-3 px-4 text-slate-300">{entry.chest_cm ? `${entry.chest_cm} cm` : '-'}</td>
                  <td className="py-3 px-4 text-slate-300">{entry.arm_cm ? `${entry.arm_cm} cm` : '-'}</td>
                  <td className="py-3 px-4 text-slate-300">{entry.thigh_cm ? `${entry.thigh_cm} cm` : '-'}</td>
                  <td className="py-3 px-4 text-slate-400 italic max-w-xs truncate">{entry.notes || '-'}</td>
                  {canEdit && (
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Eliminar pesaje"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REGISTRAR MEDIDAS */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-400" /> Registrar Pesaje & Medidas
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
                  <label className="text-slate-400 font-medium">Fecha</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
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
                    className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-black text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-slate-300 font-bold uppercase tracking-wider text-xs">
                    Perímetros Corporales (cm)
                  </label>
                  <span className="text-[11px] text-slate-400">Autocalcula % Grasa</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
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
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
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
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px]">Pecho</label>
                    <input
                      type="number"
                      step="0.5"
                      value={chestCm}
                      onChange={e => setChestCm(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px]">Brazo (flexionado)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={armCm}
                      onChange={e => setArmCm(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px]">Muslo</label>
                    <input
                      type="number"
                      step="0.5"
                      value={thighCm}
                      onChange={e => setThighCm(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium">Notas</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ej. Buena definición matutina..."
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
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
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl"
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
