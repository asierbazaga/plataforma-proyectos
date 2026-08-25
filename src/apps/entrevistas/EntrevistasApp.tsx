import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Play, 
  Award, 
  FileSpreadsheet, 
  Sparkles, 
  ArrowLeft, 
  Plus, 
  HelpCircle, 
  BookOpen, 
  Layers, 
  Download, 
  Upload, 
  CheckCircle2,
  Lock,
  Search,
  ChevronRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { CandidateInterview } from '../../types';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { CandidateListView } from './components/CandidateListView';
import { LiveInterviewView } from './components/LiveInterviewView';
import { ResultadoSummaryView } from './components/ResultadoSummaryView';
import { CandidateModal } from './components/CandidateModal';
import { MECALUX_RUBRICS } from './services/mecaluxRubrics';
import { ExcelInterviewService } from './services/excelService';

interface EntrevistasAppProps {
  onBack?: () => void;
}

export const EntrevistasApp: React.FC<EntrevistasAppProps> = ({ onBack }) => {
  const { currentUser, hasAccessToApp } = useAuth();
  const canAccess = hasAccessToApp('entrevistas');

  const [candidates, setCandidates] = useState<CandidateInterview[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'candidates' | 'interview' | 'resultado' | 'rubrics' | 'excel_center'>('candidates');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [candidateToEdit, setCandidateToEdit] = useState<CandidateInterview | null>(null);
  const [rubricSearch, setRubricSearch] = useState<string>('');

  const loadCandidates = async () => {
    const list = await storageService.getInterviewCandidates(currentUser?.id);
    setCandidates(list);
    if (!selectedCandidateId && list.length > 0) {
      setSelectedCandidateId(list[0].id);
    }
  };

  useEffect(() => {
    loadCandidates();
    storageService.syncFromCloud().then(() => {
      loadCandidates();
    });

    const unsub = storageService.onSync(() => {
      loadCandidates();
    });
    return () => unsub();
  }, [currentUser]);

  if (!canAccess) {
    return (
      <div className="p-12 text-center rounded-3xl bg-slate-900 border border-rose-500/30 max-w-lg mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Módulo Exclusivo Team Leader</h2>
        <p className="text-xs text-slate-400">
          Este módulo está restringido al perfil de Asier Bazaga (Team Leader Mecalux).
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700"
          >
            Volver al Catálogo
          </button>
        )}
      </div>
    );
  }

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0] || null;

  const handleUpdateCandidate = async (updated: CandidateInterview) => {
    await storageService.saveInterviewCandidate(updated, currentUser?.id);
    setCandidates(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleDeleteCandidate = async (id: string) => {
    await storageService.deleteInterviewCandidate(id, currentUser?.id);
    setCandidates(prev => prev.filter(c => c.id !== id));
    if (selectedCandidateId === id) {
      const remaining = candidates.filter(c => c.id !== id);
      setSelectedCandidateId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleSaveFromModal = async (candidate: CandidateInterview, startNow?: boolean) => {
    await storageService.saveInterviewCandidate(candidate, currentUser?.id);
    await loadCandidates();
    setSelectedCandidateId(candidate.id);
    setIsModalOpen(false);
    setCandidateToEdit(null);

    if (startNow) {
      setActiveTab('interview');
    }
  };

  const handleImportCandidates = async (imported: Partial<CandidateInterview>[]) => {
    for (const item of imported) {
      const fullCand: CandidateInterview = {
        id: item.id || `cand_${Date.now()}_${Math.random()}`,
        fullName: item.fullName || 'Candidato Importado',
        email: item.email || '',
        phone: item.phone || '',
        role: item.role || 'Software Engineer Backend (.NET / SGA)',
        seniority: item.seniority || 'Senior',
        expectedSalaryEur: item.expectedSalaryEur,
        status: item.status || 'scheduled',
        interviewDate: item.interviewDate || new Date().toISOString().split('T')[0],
        evaluations: item.evaluations || {},
        resultadoFinal: item.resultadoFinal || {
          decision: 'Pendiente',
          puntuacionGlobal: 0,
          puntosFuertes: [],
          puntosAMejorar: [],
          conclusionesTeamLeader: ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await storageService.saveInterviewCandidate(fullCand, currentUser?.id);
    }
    await loadCandidates();
  };

  const filteredRubrics = MECALUX_RUBRICS.filter(r => {
    const q = rubricSearch.toLowerCase();
    return r.nombre.toLowerCase().includes(q) ||
           r.section.toLowerCase().includes(q) ||
           r.disparadores.some(d => d.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* 1. Barra de Navegación del Módulo Entrevistas Mecalux */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Título & Badge Mecalux */}
        <div className="flex items-center gap-3.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
              title="Volver al Catálogo de Proyectos"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/20 flex-shrink-0">
            <Building className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Mecalux Talent & Entrevistas
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Team Leader
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Evaluación por competencias, disparadores dinámicos y generación nativa de Excel (.xlsx)
            </p>
          </div>
        </div>

        {/* Pestañas Principales */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('candidates')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'candidates'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Candidatos ({candidates.length})</span>
          </button>

          <button
            onClick={() => {
              if (selectedCandidate) setActiveTab('interview');
              else setIsModalOpen(true);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'interview'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Entrevista en Directo</span>
          </button>

          <button
            onClick={() => {
              if (selectedCandidate) setActiveTab('resultado');
            }}
            disabled={!selectedCandidate}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'resultado'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60 disabled:opacity-40'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Resultado</span>
          </button>

          <button
            onClick={() => setActiveTab('rubrics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'rubrics'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Banco Rúbricas</span>
          </button>

          <button
            onClick={() => setActiveTab('excel_center')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'excel_center'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-emerald-300 hover:bg-emerald-950/60 hover:text-white border border-emerald-500/30'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Plantilla Excel</span>
          </button>
        </div>
      </div>

      {/* 2. Selector de Candidato Activo (visible cuando estamos en Entrevista o Resultado) */}
      {(activeTab === 'interview' || activeTab === 'resultado') && selectedCandidate && (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3.5 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Evaluando a:</span>
            <select
              value={selectedCandidate.id}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
            >
              {candidates.map(c => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.role}) - {c.resultadoFinal.puntuacionGlobal}%
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCandidateToEdit(selectedCandidate);
                setIsModalOpen(true);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-500/30"
            >
              Editar Ficha
            </button>
            <button
              onClick={() => {
                setCandidateToEdit(null);
                setIsModalOpen(true);
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30"
            >
              + Nuevo
            </button>
          </div>
        </div>
      )}

      {/* 3. Vistas Principales */}
      {activeTab === 'candidates' && (
        <CandidateListView
          candidates={candidates}
          onSelectCandidate={(cand, mode) => {
            setSelectedCandidateId(cand.id);
            setActiveTab(mode);
          }}
          onNewCandidate={() => {
            setCandidateToEdit(null);
            setIsModalOpen(true);
          }}
          onEditCandidate={(cand) => {
            setCandidateToEdit(cand);
            setIsModalOpen(true);
          }}
          onDeleteCandidate={handleDeleteCandidate}
          onImportCandidates={handleImportCandidates}
        />
      )}

      {activeTab === 'interview' && selectedCandidate && (
        <LiveInterviewView
          candidate={selectedCandidate}
          onUpdateCandidate={handleUpdateCandidate}
          onGoToResultado={() => setActiveTab('resultado')}
          onBackToList={() => setActiveTab('candidates')}
        />
      )}

      {activeTab === 'resultado' && selectedCandidate && (
        <ResultadoSummaryView
          candidate={selectedCandidate}
          onUpdateCandidate={handleUpdateCandidate}
          onBackToInterview={() => setActiveTab('interview')}
          onBackToList={() => setActiveTab('candidates')}
        />
      )}

      {/* 4. Banco de Rúbricas & Disparadores */}
      {activeTab === 'rubrics' && (
        <div className="space-y-6 pb-12">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">Banco de Competencias & Disparadores Mecalux</h2>
                <p className="text-xs text-slate-400">
                  Guía oficial para Team Leaders con criterios de evaluación y preguntas sugeridas por área
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={rubricSearch}
                  onChange={(e) => setRubricSearch(e.target.value)}
                  placeholder="Buscar disparador o competencia..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredRubrics.map((r) => (
              <div key={r.id} className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {r.section}
                    </span>
                    <h3 className="text-base font-black text-white">{r.nombre}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/20 text-rose-200">
                    <strong className="block text-rose-400 mb-1">Inexistente:</strong>
                    {r.criterios.inexistente}
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-amber-200">
                    <strong className="block text-amber-400 mb-1">Pobre:</strong>
                    {r.criterios.pobre}
                  </div>
                  <div className="p-3 rounded-2xl bg-blue-950/20 border border-blue-500/20 text-blue-200">
                    <strong className="block text-blue-400 mb-1">Bueno:</strong>
                    {r.criterios.bueno}
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-200">
                    <strong className="block text-emerald-400 mb-1">Fuerte:</strong>
                    {r.criterios.fuerte}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                    Disparadores sugeridos:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {r.disparadores.map((d, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Centro de Integración Excel */}
      {activeTab === 'excel_center' && (
        <div className="space-y-6 pb-12">
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Centro de Exportación & Plantilla Excel Mecalux</h2>
                <p className="text-xs text-slate-400">
                  Generación automatizada de archivos Excel (.xlsx) con la estructura corporativa oficial de 4 hojas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Exportar Candidato Activo */}
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white">1. Exportar Ficha Individual de Candidato</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Descarga el archivo Excel con las 4 hojas completas (<strong>Framework</strong>, <strong>Competencias Profesionales</strong>, <strong>Softskills</strong> y <strong>Resultado</strong>) conteniendo todas las notas, niveles marcados y comentarios registrados durante la entrevista.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {selectedCandidate ? (
                    <button
                      onClick={() => ExcelInterviewService.exportCandidateToExcel(selectedCandidate)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar Excel de {selectedCandidate.fullName} (.xlsx)</span>
                    </button>
                  ) : (
                    <p className="text-xs text-slate-500">Selecciona o crea un candidato para exportar su ficha.</p>
                  )}
                </div>
              </div>

              {/* Exportar Matriz Global */}
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white">2. Exportar Matriz Global de Selección</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Descarga una hoja resumen con la tabla comparativa de todos los candidatos ({candidates.length}), sus notas ponderadas, salarios pretendidos vs recomendados y decisión final del Team Leader.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => ExcelInterviewService.exportAllCandidatesSummary(candidates)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Matriz Completa de Candidatos (.xlsx)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nuevo/Editar Candidato */}
      <CandidateModal
        isOpen={isModalOpen}
        candidateToEdit={candidateToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setCandidateToEdit(null);
        }}
        onSave={handleSaveFromModal}
      />
    </div>
  );
};
