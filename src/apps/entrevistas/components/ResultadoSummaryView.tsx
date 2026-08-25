import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  FileSpreadsheet, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Sparkles, 
  Layers, 
  ThumbsUp, 
  ThumbsDown, 
  DollarSign, 
  HelpCircle,
  FileText,
  Clock,
  Building
} from 'lucide-react';
import { CandidateInterview } from '../../../types';
import { MECALUX_RUBRICS } from '../services/mecaluxRubrics';
import { ExcelInterviewService } from '../services/excelService';

interface ResultadoSummaryViewProps {
  candidate: CandidateInterview;
  onUpdateCandidate: (updated: CandidateInterview) => void;
  onBackToInterview: () => void;
  onBackToList: () => void;
}

export const ResultadoSummaryView: React.FC<ResultadoSummaryViewProps> = ({
  candidate,
  onUpdateCandidate,
  onBackToInterview,
  onBackToList
}) => {
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleDecisionChange = (decision: CandidateInterview['resultadoFinal']['decision']) => {
    let status: CandidateInterview['status'] = candidate.status;
    if (decision === 'Aprobado / Contratar') status = 'approved';
    else if (decision === 'Rechazado') status = 'rejected';
    else if (decision === 'Duda / 2ª Vuelta' || decision === 'Reserva para otro puesto') status = 'on_hold';

    const updated: CandidateInterview = {
      ...candidate,
      status,
      resultadoFinal: {
        ...candidate.resultadoFinal,
        decision
      },
      updatedAt: new Date().toISOString()
    };
    onUpdateCandidate(updated);
    triggerSaveFeedback();
  };

  const handleConclusionesChange = (text: string) => {
    const updated: CandidateInterview = {
      ...candidate,
      resultadoFinal: {
        ...candidate.resultadoFinal,
        conclusionesTeamLeader: text
      },
      updatedAt: new Date().toISOString()
    };
    onUpdateCandidate(updated);
  };

  const handleSalaryRecommendationChange = (eur: number) => {
    const updated: CandidateInterview = {
      ...candidate,
      resultadoFinal: {
        ...candidate.resultadoFinal,
        salarioRecomendadoEur: eur
      },
      updatedAt: new Date().toISOString()
    };
    onUpdateCandidate(updated);
  };

  const handleAddPro = () => {
    if (!newPro.trim()) return;
    const currentPros = candidate.resultadoFinal.puntosFuertes || [];
    const updated: CandidateInterview = {
      ...candidate,
      resultadoFinal: {
        ...candidate.resultadoFinal,
        puntosFuertes: [...currentPros, newPro.trim()]
      },
      updatedAt: new Date().toISOString()
    };
    onUpdateCandidate(updated);
    setNewPro('');
    triggerSaveFeedback();
  };

  const handleRemovePro = (index: number) => {
    const currentPros = candidate.resultadoFinal.puntosFuertes || [];
    const updated: CandidateInterview = {
      ...candidate,
      resultadoFinal: {
        ...candidate.resultadoFinal,
        puntosFuertes: currentPros.filter((_, i) => i !== index)
      },
      updatedAt: new Date().toISOString()
    };
    onUpdateCandidate(updated);
  };

  const handleAddCon = () => {
    if (!newCon.trim()) return;
    const currentCons = candidate.resultadoFinal.puntosAMejorar || [];
    const updated: CandidateInterview = {
      ...candidate,
      resultadoFinal: {
        ...candidate.resultadoFinal,
        puntosAMejorar: [...currentCons, newCon.trim()]
      },
      updatedAt: new Date().toISOString()
    };
    onUpdateCandidate(updated);
    setNewCon('');
    triggerSaveFeedback();
  };

  const handleRemoveCon = (index: number) => {
    const currentCons = candidate.resultadoFinal.puntosAMejorar || [];
    const updated: CandidateInterview = {
      ...candidate,
      resultadoFinal: {
        ...candidate.resultadoFinal,
        puntosAMejorar: currentCons.filter((_, i) => i !== index)
      },
      updatedAt: new Date().toISOString()
    };
    onUpdateCandidate(updated);
  };

  const triggerSaveFeedback = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const decisions: { id: CandidateInterview['resultadoFinal']['decision']; label: string; color: string; bg: string }[] = [
    { id: 'Aprobado / Contratar', label: '✅ Aprobado / Contratar', color: 'text-emerald-300', bg: 'bg-emerald-600/30 border-emerald-500' },
    { id: 'Duda / 2ª Vuelta', label: '⚠️ Duda / 2ª Vuelta', color: 'text-amber-300', bg: 'bg-amber-600/30 border-amber-500' },
    { id: 'Reserva para otro puesto', label: '📦 Reserva para otro puesto', color: 'text-blue-300', bg: 'bg-blue-600/30 border-blue-500' },
    { id: 'Rechazado', label: '❌ Rechazado', color: 'text-rose-300', bg: 'bg-rose-600/30 border-rose-500' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Bar de Resultado */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              onClick={onBackToInterview}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
              title="Volver a rúbricas de entrevista"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-400">
                Pestaña Resultado (Excel Mecalux)
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Dictamen Final: {candidate.fullName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => ExcelInterviewService.exportCandidateToExcel(candidate)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/25"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Descargar Ficha en Excel (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Resumen Ejecutivo & Score Global */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta de Puntuación Global */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Calificación Ponderada
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-white">
                {candidate.resultadoFinal.puntuacionGlobal}%
              </span>
              <span className="text-xs font-semibold text-indigo-400">
                sobre el total de competencias
              </span>
            </div>
          </div>

          {/* Barra de Progreso */}
          <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                candidate.resultadoFinal.puntuacionGlobal >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                candidate.resultadoFinal.puntuacionGlobal >= 60 ? 'bg-gradient-to-r from-blue-500 to-indigo-400' :
                candidate.resultadoFinal.puntuacionGlobal >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-400' :
                'bg-gradient-to-r from-rose-500 to-pink-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, candidate.resultadoFinal.puntuacionGlobal))}%` }}
            />
          </div>

          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex justify-between">
            <span>Puesto: <strong className="text-white">{candidate.role}</strong></span>
            <span>Nivel: <strong className="text-indigo-300">{candidate.seniority}</strong></span>
          </div>
        </div>

        {/* Tarjeta de Decisión del Team Leader */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Decisión del Proceso de Selección
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {decisions.map(d => {
              const isSelected = candidate.resultadoFinal.decision === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => handleDecisionChange(d.id)}
                  className={`p-3.5 rounded-2xl border text-xs font-black transition-all flex items-center justify-between ${
                    isSelected
                      ? `${d.bg} ${d.color} shadow-lg ring-1 ring-white/20`
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span>{d.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4" />}
                </button>
              );
            })}
          </div>

          {/* Salario Recomendado */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              <span>Salario pretendido por candidato: </span>
              <strong className="text-white">
                {candidate.expectedSalaryEur ? `${candidate.expectedSalaryEur.toLocaleString()} €` : 'No indicado'}
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-300">Propuesta Mecalux (€):</label>
              <input
                type="number"
                value={candidate.resultadoFinal.salarioRecomendadoEur || ''}
                onChange={(e) => handleSalaryRecommendationChange(Number(e.target.value))}
                placeholder="42000"
                className="w-28 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Puntos Fuertes (Pros) & Puntos a Mejorar (Cons) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pros */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Puntos Fuertes (Pros)
            </h3>
          </div>

          <div className="space-y-2">
            {(candidate.resultadoFinal.puntosFuertes || []).map((pro, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-slate-200"
              >
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{pro}</span>
                </div>
                <button
                  onClick={() => handleRemovePro(index)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newPro}
              onChange={(e) => setNewPro(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPro()}
              placeholder="Añadir punto fuerte destacado..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleAddPro}
              className="p-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cons */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ThumbsDown className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Puntos a Mejorar / Riesgos (Cons)
            </h3>
          </div>

          <div className="space-y-2">
            {(candidate.resultadoFinal.puntosAMejorar || []).map((con, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-slate-200"
              >
                <div className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{con}</span>
                </div>
                <button
                  onClick={() => handleRemoveCon(index)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newCon}
              onChange={(e) => setNewCon(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCon()}
              placeholder="Añadir aspecto a mejorar o riesgo..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            <button
              onClick={handleAddCon}
              className="p-2 rounded-xl bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Conclusiones y Valoración Global del Team Leader */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-white uppercase tracking-wider">
            Conclusiones del Team Leader (Asier):
          </label>
          <span className="text-[11px] text-slate-400">
            Se incluirá en la hoja Resultado del Excel oficial
          </span>
        </div>
        <textarea
          rows={5}
          value={candidate.resultadoFinal.conclusionesTeamLeader || ''}
          onChange={(e) => handleConclusionesChange(e.target.value)}
          placeholder="Escribe el resumen ejecutivo de la entrevista, impresiones personales, encaje con el equipo de Mecalux y recomendación..."
          className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-y"
        />
      </div>

      {/* 5. Tabla Resumen de Evaluaciones por Competencia */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-wider">
          Desglose Completo de Evaluaciones Registradas
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Bloque</th>
                <th className="pb-3 font-semibold">Competencia</th>
                <th className="pb-3 font-semibold">Evaluación</th>
                <th className="pb-3 font-semibold">Comentarios del Team Leader</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {MECALUX_RUBRICS.map(r => {
                const ev = candidate.evaluations[r.id];
                const level = ev?.evaluacion;
                return (
                  <tr key={r.id} className="hover:bg-slate-800/30">
                    <td className="py-3 text-slate-400">{r.section}</td>
                    <td className="py-3 font-bold text-white">{r.nombre}</td>
                    <td className="py-3">
                      {level ? (
                        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold border ${
                          level === 'Fuerte' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                          level === 'Bueno' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                          level === 'Pobre' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                          'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}>
                          {level}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Pendiente</span>
                      )}
                    </td>
                    <td className="py-3 text-slate-300 max-w-xs truncate">
                      {ev?.comentarios || <span className="text-slate-600">Sin notas</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botones Finales */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBackToInterview}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition-all"
        >
          ← Volver a Rúbricas
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToList}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition-all"
          >
            Lista de Candidatos
          </button>
          <button
            onClick={() => ExcelInterviewService.exportCandidateToExcel(candidate)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Descargar Excel .xlsx</span>
          </button>
        </div>
      </div>
    </div>
  );
};
