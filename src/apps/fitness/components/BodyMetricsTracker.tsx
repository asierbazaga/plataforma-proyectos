import React, { useState } from 'react';
import { Scale, Plus, Trash2, Calendar, TrendingDown } from 'lucide-react';
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

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState<number | ''>(profile.current_weight || '');
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

    setShowAddModal(false);
  };

  const sortedEntries = [...progressList].sort((a, b) => a.date.localeCompare(b.date));
  const latestEntry = sortedEntries[sortedEntries.length - 1];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111622] p-6 rounded-3xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Peso & Composición Corporal</h2>
            <p className="text-xs text-slate-400">Seguimiento de peso y estimación de grasa por la fórmula US Navy.</p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Registrar Pesaje
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#111622] border border-white/5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Peso Actual</span>
          <div className="text-3xl font-black text-white">{latestEntry ? latestEntry.weight : profile.current_weight} kg</div>
          <p className="text-xs text-emerald-400">Meta: {profile.target_weight} kg</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111622] border border-white/5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">% Grasa Corporal</span>
          <div className="text-3xl font-black text-amber-400">{latestEntry?.body_fat_percentage || 16.9}%</div>
          <p className="text-xs text-slate-400">Cintura: {latestEntry?.waist_cm || 84} cm</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111622] border border-white/5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Registros</span>
          <div className="text-3xl font-black text-sky-400">{sortedEntries.length}</div>
          <p className="text-xs text-slate-400">Historial completo</p>
        </div>
      </div>

      {/* Historial Tabla */}
      <div className="p-6 rounded-3xl bg-[#111622] border border-white/5 space-y-4 shadow-xl">
        <h4 className="text-sm font-bold text-white">Historial de Pesajes</h4>
        <div className="overflow-x-auto">
          {sortedEntries.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              No hay pesajes registrados todavía. ¡Añade tu primer pesaje de la mañana!
            </p>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-white/5">
                <tr>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Peso</th>
                  <th className="py-2.5 px-3">% Grasa</th>
                  <th className="py-2.5 px-3">Cintura</th>
                  <th className="py-2.5 px-3">Pecho</th>
                  <th className="py-2.5 px-3">Brazo</th>
                  {canEdit && <th className="py-2.5 px-3 text-right">Acción</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {[...sortedEntries].reverse().map(entry => (
                  <tr key={entry.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 text-white font-bold">{entry.date}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{entry.weight} kg</td>
                    <td className="py-2.5 px-3 font-mono text-amber-400">{entry.body_fat_percentage ? `${entry.body_fat_percentage}%` : '-'}</td>
                    <td className="py-2.5 px-3 text-slate-300">{entry.waist_cm ? `${entry.waist_cm} cm` : '-'}</td>
                    <td className="py-2.5 px-3 text-slate-300">{entry.chest_cm ? `${entry.chest_cm} cm` : '-'}</td>
                    <td className="py-2.5 px-3 text-slate-300">{entry.arm_cm ? `${entry.arm_cm} cm` : '-'}</td>
                    {canEdit && (
                      <td className="py-2.5 px-3 text-right">
                        <button onClick={() => onDeleteEntry(entry.id)} className="text-slate-600 hover:text-[#FF3B30]">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL PESO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-white/10 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h4 className="font-bold text-white text-base">Registrar Peso & Medidas</h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-3 text-xs">
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
                  <label className="text-slate-400">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="0.0"
                    value={weight}
                    onFocus={e => e.target.select()}
                    onChange={e => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-emerald-400 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400">Cintura (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="0"
                    value={waistCm}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      setWaistCm(val);
                      if (typeof val === 'number' && typeof neckCm === 'number') handleWaistOrNeckChange(val, neckCm);
                    }}
                    className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Cuello (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="0"
                    value={neckCm}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      setNeckCm(val);
                      if (typeof val === 'number' && typeof waistCm === 'number') handleWaistOrNeckChange(waistCm, val);
                    }}
                    className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">% Grasa (US Navy)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={bodyFat}
                    onFocus={e => e.target.select()}
                    onChange={e => setBodyFat(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-2 py-1.5 text-amber-400 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
