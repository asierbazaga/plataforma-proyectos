import React, { useState } from 'react';
import { 
  CheckCircle2, 
  FileSpreadsheet, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Save, 
  ArrowLeft,
  ArrowRight,
  Layers,
  Award,
  AlertTriangle,
  UserCheck,
  Bot,
  Key
} from 'lucide-react';
import { CandidateInterview, MecaluxCompetencySection, MecaluxEvaluationLevel, MecaluxCompetencyRubric } from '../../../types';
import { EVALUATION_LEVELS } from '../services/mecaluxRubrics';
import { ExcelInterviewService } from '../services/excelService';
import { CandidatePreviewModal } from './CandidatePreviewModal';
import { aiEvaluatorService } from '../services/aiEvaluatorService';

interface LiveInterviewViewProps {
  candidate: CandidateInterview;
  onUpdateCandidate: (updated: CandidateInterview) => void;
  onGoToResultado: () => void;
  onBackToList: () => void;
  rubrics: MecaluxCompetencyRubric[];
}

export const LiveInterviewView: React.FC<LiveInterviewViewProps> = ({
  candidate,
  onUpdateCandidate,
  onGoToResultado,
  onBackToList,
  rubrics
}) => {
  const [activeSection, setActiveSection] = useState<MecaluxCompetencySection>('Competencias Profesionales');
  const [expandedRubrics, setExpandedRubrics] = useState<Record<string, boolean>>({});
  const [autoSaveToast, setAutoSaveToast] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // AI Notes State
  const [notes, setNotes] = useState<string>(candidate.interviewNotes || '');
  const [manualAiPromptOpen, setManualAiPromptOpen] = useState<boolean>(false);
  const [manualAiResponse, setManualAiResponse] = useState<string>('');

  const handleNotesChange = (val: string) => {
    setNotes(val);
    onUpdateCandidate({ ...candidate, interviewNotes: val });
    setAutoSaveToast(true);
    setTimeout(() => setAutoSaveToast(false), 1800);
  };

  const handleGeneratePromptClick = () => {
    if (!notes.trim()) {
      alert("Por favor, escribe algunas notas primero.");
      return;
    }
    const promptText = aiEvaluatorService.generatePrompt(notes, rubrics);
    navigator.clipboard.writeText(promptText).then(() => {
      setManualAiResponse('');
      setManualAiPromptOpen(true);
    }).catch(err => {
      alert("No se pudo copiar al portapapeles. Cópialo manualmente.");
      console.error(err);
    });
  };

  const applyManualAiResponse = () => {
    try {
      if (!manualAiResponse.trim()) {
        alert("Pega la respuesta JSON primero.");
        return;
      }
      
      const result = aiEvaluatorService.parseResponse(manualAiResponse);
      
      const newEvals = { ...candidate.evaluations };
      Object.entries(result.evaluations).forEach(([rubricId, evalData]) => {
         const rubric = rubrics.find(r => r.id === rubricId);
         if (rubric) {
           newEvals[rubricId] = {
             competencyId: rubricId,
             section: rubric.section,
             nombre: rubric.nombre,
             evaluacion: evalData.evaluacion as MecaluxEvaluationLevel,
             comentarios: evalData.comentarios
           };
         }
      });
      
      const newFinal = {
        ...candidate.resultadoFinal,
        puntosFuertes: result.puntosFuertes || [],
        puntosAMejorar: result.puntosAMejorar || [],
        conclusionesTeamLeader: result.resumen || ''
      };
      
      onUpdateCandidate({
        ...candidate,
        evaluations: newEvals,
        resultadoFinal: newFinal
      });
      
      setManualAiPromptOpen(false);
      alert("Evaluación completada con éxito. Revisa las pestañas.");
    } catch (err: any) {
      alert("Error al procesar la respuesta. Asegúrate de pegar un JSON válido: " + err.message);
    }
  };

  const handleRatingChange = (rubricId: string, section: MecaluxCompetencySection, name: string, level: MecaluxEvaluationLevel) => {
    const existing = candidate.evaluations[rubricId] || {
      competencyId: rubricId,
      section,
      nombre: name,
      evaluacion: '',
      comentarios: ''
    };

    const updatedEvaluations = {
      ...candidate.evaluations,
      [rubricId]: {
        ...existing,
        evaluacion: level
      }
    };

    // Recalcular puntuación global automáticamente
    const totalPossible = rubrics.length * 3; // Nivel máximo 'Fuerte' = 3 pts
    let totalScore = 0;
    let evaluatedCount = 0;

    rubrics.forEach(r => {
      const ev = updatedEvaluations[r.id];
      if (ev && ev.evaluacion) {
        evaluatedCount++;
        if (ev.evaluacion === 'Fuerte') totalScore += 3;
        else if (ev.evaluacion === 'Bueno') totalScore += 2;
        else if (ev.evaluacion === 'Pobre') totalScore += 1;
      }
    });

    const puntuacionGlobal = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

    const updatedCandidate: CandidateInterview = {
      ...candidate,
      status: evaluatedCount > 0 ? 'in_progress' : candidate.status,
      evaluations: updatedEvaluations,
      resultadoFinal: {
        ...candidate.resultadoFinal,
        puntuacionGlobal
      },
      updatedAt: new Date().toISOString()
    };

    onUpdateCandidate(updatedCandidate);
    triggerAutoSaveToast();
  };

  const handleCommentsChange = (rubricId: string, section: MecaluxCompetencySection, name: string, comments: string) => {
    const existing = candidate.evaluations[rubricId] || {
      competencyId: rubricId,
      section,
      nombre: name,
      evaluacion: '',
      comentarios: ''
    };

    const updatedCandidate: CandidateInterview = {
      ...candidate,
      evaluations: {
        ...candidate.evaluations,
        [rubricId]: {
          ...existing,
          comentarios: comments
        }
      },
      updatedAt: new Date().toISOString()
    };

    onUpdateCandidate(updatedCandidate);
  };

  const triggerAutoSaveToast = () => {
    setAutoSaveToast(true);
    setTimeout(() => setAutoSaveToast(false), 1800);
  };

  const toggleExpand = (rubricId: string) => {
    setExpandedRubrics(prev => ({ ...prev, [rubricId]: !prev[rubricId] }));
  };

  const rubricsInSection = rubrics.filter(r => r.section === activeSection);

  const sections: { id: MecaluxCompetencySection; label: string; count: number }[] = [
    { id: 'Competencias Profesionales', label: 'Competencias Profesionales', count: rubrics.filter(r => r.section === 'Competencias Profesionales').length },
    { id: 'Softskills', label: 'Softskills & Liderazgo', count: rubrics.filter(r => r.section === 'Softskills').length },
    { id: 'Preguntas Dinámicas', label: 'Preguntas Dinámicas', count: rubrics.filter(r => r.section === 'Preguntas Dinámicas').length }
  ];

  // Conteo de evaluados en la sección actual
  const evaluatedInSection = rubricsInSection.filter(r => candidate.evaluations[r.id]?.evaluacion).length;

  // Componente interno para evitar lag al escribir (Local State)
  const LocalTextArea = ({ initialValue, onChange, placeholder, className }: any) => {
    const [val, setVal] = useState(initialValue);
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
      setVal(initialValue);
    }, [initialValue]);

    const handleChange = (e: any) => {
      const newVal = e.target.value;
      setVal(newVal); // Actualiza la UI al instante
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onChange(newVal);
      }, 500); // Propaga al padre despues de medio segundo sin escribir
    };

    return (
      <textarea
        value={val}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        rows={3}
      />
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Bar de Entrevista en Directo */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Info Candidato */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={onBackToList}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
              title="Volver a lista de candidatos"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {candidate.fullName}
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {candidate.seniority}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {candidate.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {candidate.currentCompany ? `Empresa: ${candidate.currentCompany} • ` : ''}
                {candidate.expectedSalaryEur ? `Pretende: ${candidate.expectedSalaryEur.toLocaleString()} € • ` : ''}
                Inglés: {candidate.englishLevel || 'N/A'}
              </p>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="flex items-center gap-3 flex-wrap">

            {/* Score Global Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30">
              <Award className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-indigo-300 font-semibold">Nota:</span>
              <span className="font-extrabold text-sm text-white">
                {candidate.resultadoFinal.puntuacionGlobal}%
              </span>
            </div>

            {/* Ver Ficha & CV del Candidato */}
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all shadow-sm"
              title="Abrir ficha completa y texto del currículum"
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span>Ver Ficha & CV</span>
            </button>

            {/* Descargar Excel Nativo */}
            <button
              onClick={() => ExcelInterviewService.exportCandidateToExcel(candidate)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm"
              title="Descargar plantilla Excel oficial Mecalux rellena con estas evaluaciones"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Exportar Excel</span>
            </button>

            {/* Botón Ir a Resultado Final */}
            <button
              onClick={onGoToResultado}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
            >
              <span>Ver Dictamen Final</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notificación flotante de autoguardado */}
        <div className="h-6 flex justify-end">
          {autoSaveToast && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20 animate-fade-in">
              <CheckCircle2 className="w-3 h-3" />
              <span>Guardado en directo</span>
            </span>
          )}
        </div>

        {/* --- BLOC DE NOTAS CON IA --- */}
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-400" />
              Bloc de Notas de la Entrevista (Evaluación IA)
            </h3>
            <button
              onClick={handleGeneratePromptClick}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generar Instrucciones para IA
            </button>
          </div>
          <LocalTextArea
            initialValue={notes}
            onChange={(val: string) => handleNotesChange(val)}
            placeholder="Toma tus apuntes en sucio durante la entrevista... (ej. 'Tiene 3 años de exp en C#, conoce bien los JOINs, pero se ha puesto muy nervioso al explicar su mayor error y ha dudado...')"
            className="w-full h-32 bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-y"
          />
        </div>

        {/* API KEY MODAL */}
        {manualAiPromptOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Instrucciones Copiadas
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Hemos copiado las instrucciones (el <i>prompt</i>) con las rúbricas y tus apuntes en tu portapapeles.<br/>
                1. Ve a ChatGPT, Gemini o Claude.<br/>
                2. Pega el texto y envíalo.<br/>
                3. Pega el código JSON que te responda aquí abajo:
              </p>
              
              <textarea
                value={manualAiResponse}
                onChange={(e) => setManualAiResponse(e.target.value)}
                placeholder='{"evaluations": {...}}'
                className="w-full h-48 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 font-mono focus:outline-none focus:border-indigo-500/50 resize-y mb-4"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setManualAiPromptOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={applyManualAiResponse}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  Aplicar Evaluación
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Pestañas de Secciones (Idénticas a las hojas del Excel de Mecalux) */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/80">
          {sections.map(s => {
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{s.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-400'
                }`}>
                  {s.count}
                </span>
              </button>
            );
          })}

          <button
            onClick={onGoToResultado}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all bg-slate-800/80 text-indigo-300 hover:bg-indigo-950/60 hover:text-white border border-indigo-500/30"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Pestaña Resultado</span>
          </button>
        </div>
      </div>

      {/* 3. Bloques de Competencias con el Diseño Oficial de la Plantilla Excel */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Evaluando {activeSection} ({evaluatedInSection}/{rubricsInSection.length} completadas)
          </p>
          <span className="text-xs text-slate-500">
            Escala oficial: Inexistente | Pobre | Bueno | Fuerte
          </span>
        </div>

        {rubricsInSection.map((rubric) => {
          const evalData = candidate.evaluations[rubric.id] || {
            evaluacion: '',
            comentarios: ''
          };
          const currentLevel = evalData.evaluacion;
          const isExpanded = expandedRubrics[rubric.id] !== false; // Abierto por defecto

          return (
            <div
              key={rubric.id}
              className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-lg backdrop-blur-md transition-all hover:border-slate-700"
            >
              {/* Barra Azul Oficial Mecalux (Cabecera de Competencia) */}
              <div 
                onClick={() => toggleExpand(rubric.id)}
                className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-4 sm:p-5 flex items-center justify-between cursor-pointer border-b border-indigo-500/20 select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-300 bg-indigo-950/80 px-3 py-1 rounded-xl border border-indigo-500/30">
                    Competencia
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                    {rubric.nombre}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {/* Badge de Nivel Actual */}
                  {currentLevel ? (
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-xl border ${
                      currentLevel === 'Fuerte' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                      currentLevel === 'Bueno' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                      currentLevel === 'Pobre' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                      'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {currentLevel}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700">
                      Sin calificar
                    </span>
                  )}

                  <button className="text-slate-400 hover:text-white p-1 rounded-lg">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Contenido del Bloque (Criterios, Disparadores, Evaluación y Comentarios) */}
              {isExpanded && (
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Tabla de 4 Niveles / Criterios de Evaluación */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Criterios de evaluación:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {/* Inexistente */}
                      <div 
                        onClick={() => handleRatingChange(rubric.id, rubric.section, rubric.nombre, 'Inexistente')}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          currentLevel === 'Inexistente'
                            ? 'bg-rose-950/40 border-rose-500 text-rose-100 shadow-md shadow-rose-500/10 ring-1 ring-rose-500/30'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-rose-400">Inexistente</span>
                            {currentLevel === 'Inexistente' && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
                          </div>
                          <p className="text-xs leading-relaxed text-slate-300">
                            {rubric.criterios.inexistente}
                          </p>
                        </div>
                        <button className={`mt-3 py-1 px-2 rounded-lg text-[10px] font-bold w-full ${
                          currentLevel === 'Inexistente' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}>
                          Seleccionar
                        </button>
                      </div>

                      {/* Pobre */}
                      <div 
                        onClick={() => handleRatingChange(rubric.id, rubric.section, rubric.nombre, 'Pobre')}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          currentLevel === 'Pobre'
                            ? 'bg-amber-950/40 border-amber-500 text-amber-100 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-amber-400">Pobre</span>
                            {currentLevel === 'Pobre' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                          </div>
                          <p className="text-xs leading-relaxed text-slate-300">
                            {rubric.criterios.pobre}
                          </p>
                        </div>
                        <button className={`mt-3 py-1 px-2 rounded-lg text-[10px] font-bold w-full ${
                          currentLevel === 'Pobre' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}>
                          Seleccionar
                        </button>
                      </div>

                      {/* Bueno */}
                      <div 
                        onClick={() => handleRatingChange(rubric.id, rubric.section, rubric.nombre, 'Bueno')}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          currentLevel === 'Bueno'
                            ? 'bg-blue-950/40 border-blue-500 text-blue-100 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/30'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-blue-400">Bueno</span>
                            {currentLevel === 'Bueno' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                          </div>
                          <p className="text-xs leading-relaxed text-slate-300">
                            {rubric.criterios.bueno}
                          </p>
                        </div>
                        <button className={`mt-3 py-1 px-2 rounded-lg text-[10px] font-bold w-full ${
                          currentLevel === 'Bueno' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}>
                          Seleccionar
                        </button>
                      </div>

                      {/* Fuerte */}
                      <div 
                        onClick={() => handleRatingChange(rubric.id, rubric.section, rubric.nombre, 'Fuerte')}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          currentLevel === 'Fuerte'
                            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-emerald-400">Fuerte</span>
                            {currentLevel === 'Fuerte' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </div>
                          <p className="text-xs leading-relaxed text-slate-300">
                            {rubric.criterios.fuerte}
                          </p>
                        </div>
                        <button className={`mt-3 py-1 px-2 rounded-lg text-[10px] font-bold w-full ${
                          currentLevel === 'Fuerte' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}>
                          Seleccionar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Disparadores (Preguntas dinámicas a realizar) */}
                  {rubric.disparadores && rubric.disparadores.length > 0 && (
                    <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-extrabold text-indigo-200 uppercase tracking-wider">
                          Disparadores sugeridos para el Team Leader:
                        </span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {rubric.disparadores.map((d, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-indigo-400 font-bold">•</span>
                            <span className="leading-relaxed">{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Comentarios de la persona entrevistadora */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Comentarios persona entrevistadora:
                    </label>
                    <LocalTextArea
                      initialValue={evalData.comentarios}
                      onChange={(val: string) => handleCommentsChange(rubric.id, rubric.section, rubric.nombre, val)}
                      placeholder="Escribe aquí tus observaciones, respuestas destacadas del candidato o dudas técnicas..."
                      className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-y"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Barra Inferior Flotante de Navegación de Secciones */}
      <div className="sticky bottom-4 z-30 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToList}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all border border-slate-700"
          >
            ← Volver a Candidatos
          </button>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Progreso total: {candidate.resultadoFinal.puntuacionGlobal}%
          </span>
        </div>

        <button
          onClick={onGoToResultado}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
        >
          <span>Pestaña de Resultado & Conclusiones</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal de Vista Preliminar y Consulta del CV */}
      <CandidatePreviewModal
        isOpen={isPreviewOpen}
        candidate={candidate}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
};
