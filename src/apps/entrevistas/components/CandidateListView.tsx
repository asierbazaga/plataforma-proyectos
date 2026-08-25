import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Award, 
  Clock, 
  DollarSign, 
  Trash2, 
  Edit2, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Briefcase,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { CandidateInterview } from '../../../types';
import { ExcelInterviewService } from '../services/excelService';
import { CandidatePreviewModal } from './CandidatePreviewModal';

interface CandidateListViewProps {
  candidates: CandidateInterview[];
  onSelectCandidate: (candidate: CandidateInterview, mode: 'interview' | 'resultado') => void;
  onNewCandidate: () => void;
  onEditCandidate: (candidate: CandidateInterview) => void;
  onDeleteCandidate: (id: string) => void;
  onImportCandidates: (imported: Partial<CandidateInterview>[]) => void;
}

export const CandidateListView: React.FC<CandidateListViewProps> = ({
  candidates,
  onSelectCandidate,
  onNewCandidate,
  onEditCandidate,
  onDeleteCandidate,
  onImportCandidates
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [previewCandidate, setPreviewCandidate] = useState<CandidateInterview | null>(null);

  // Cálculos de métricas globales
  const totalCandidates = candidates.length;
  const approvedCount = candidates.filter(c => c.status === 'approved' || c.resultadoFinal.decision === 'Aprobado / Contratar').length;
  const inProgressCount = candidates.filter(c => c.status === 'in_progress' || c.status === 'scheduled').length;
  
  const evaluatedWithScores = candidates.filter(c => c.resultadoFinal.puntuacionGlobal > 0);
  const averageScore = evaluatedWithScores.length > 0
    ? Math.round(evaluatedWithScores.reduce((acc, c) => acc + c.resultadoFinal.puntuacionGlobal, 0) / evaluatedWithScores.length)
    : 0;

  const candidatesWithSalary = candidates.filter(c => c.expectedSalaryEur && c.expectedSalaryEur > 0);
  const avgExpectedSalary = candidatesWithSalary.length > 0
    ? Math.round(candidatesWithSalary.reduce((acc, c) => acc + (c.expectedSalaryEur || 0), 0) / candidatesWithSalary.length)
    : 0;

  // Filtrado
  const filteredCandidates = candidates.filter(c => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (c.fullName || '').toLowerCase().includes(query) ||
   (c.role || '').toLowerCase().includes(query) ||
   (c.currentCompany && (c.currentCompany || '').toLowerCase().includes(query)) ||
   (c.parsedSkills && c.parsedSkills.some(s => (s || '').toLowerCase().includes(query)));

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'approved' && (c.status === 'approved' || c.resultadoFinal.decision === 'Aprobado / Contratar')) ||
      (statusFilter === 'rejected' && (c.status === 'rejected' || c.resultadoFinal.decision === 'Rechazado')) ||
      (statusFilter === 'in_progress' && (c.status === 'in_progress' || c.status === 'scheduled')) ||
      (statusFilter === 'evaluated' && c.status === 'evaluated');

    const matchesRole = roleFilter === 'all' || c.role.toLowerCase().includes(roleFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await ExcelInterviewService.importCandidatesFromExcel(file);
      onImportCandidates(imported);
    } catch (err) {
      alert('Error al importar el archivo Excel. Verifica el formato de columnas.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Métricas & KPIs de Selección Mecalux */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Candidatos</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{totalCandidates}</p>
          <p className="text-[10px] text-slate-400 font-medium">Registrados en la plataforma</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Aprobados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">{approvedCount}</p>
          <p className="text-[10px] text-slate-400 font-medium">Propuestos para contratación</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Nota Media</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-300">{averageScore}%</p>
          <p className="text-[10px] text-slate-400 font-medium">Rúbrica de competencias</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Salario Medio</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-cyan-300">
            {avgExpectedSalary > 0 ? `${(avgExpectedSalary / 1000).toFixed(0)}k €` : 'N/A'}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">Pretensión bruta anual</p>
        </div>
      </div>

      {/* 2. Barra de Búsqueda, Filtros y Acciones Globales */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por candidato, puesto, empresa o tecnología (ej. .NET, SQL, SGA)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Importar Excel */}
            <label className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>Importar Excel</span>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelImport} className="hidden" />
            </label>

            {/* Exportar Matriz Global */}
            <button
              onClick={() => ExcelInterviewService.exportAllCandidatesSummary(candidates)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
              title="Descargar matriz global con todos los candidatos en Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar Matriz (.xlsx)</span>
            </button>

            {/* Nuevo Candidato */}
            <button
              onClick={onNewCandidate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Candidato / CV</span>
            </button>
          </div>
        </div>

        {/* Filtros Rápidos de Estado */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          {[
            { id: 'all', label: 'Todos los Candidatos' },
            { id: 'approved', label: '✅ Aprobados / Oferta' },
            { id: 'in_progress', label: '⏳ En Curso / Programados' },
            { id: 'rejected', label: '❌ Descartados' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === f.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Listado de Candidatos en Tarjetas o Tabla */}
      {filteredCandidates.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No se encontraron candidatos</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery ? 'Prueba con otros términos de búsqueda o cambia los filtros.' : 'Comienza añadiendo un nuevo candidato o importando un CV.'}
          </p>
          <button
            onClick={onNewCandidate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Primer Candidato</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCandidates.map((candidate) => {
            const isApproved = candidate.status === 'approved' || candidate.resultadoFinal.decision === 'Aprobado / Contratar';
            const isRejected = candidate.status === 'rejected' || candidate.resultadoFinal.decision === 'Rechazado';
            const score = candidate.resultadoFinal.puntuacionGlobal;

            return (
              <div
                key={candidate.id}
                className="group rounded-3xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all hover:border-indigo-500/40 hover:shadow-xl"
              >
                {/* Info Principal */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                      {candidate.fullName}
                    </h3>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {candidate.seniority}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${
                      isApproved ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                      isRejected ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
                      'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {candidate.resultadoFinal.decision || 'Pendiente'}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-300">
                    <strong className="text-white">{candidate.role}</strong>
                    {candidate.currentCompany ? ` • ${candidate.currentCompany}` : ''}
                    {candidate.location ? ` • ${candidate.location}` : ''}
                  </p>

                  {/* Skills Detectados */}
                  {candidate.parsedSkills && candidate.parsedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {candidate.parsedSkills.slice(0, 6).map((s, i) => (
                        <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {s}
                        </span>
                      ))}
                      {candidate.parsedSkills.length > 6 && (
                        <span className="text-[10px] text-slate-500 px-1">
                          +{candidate.parsedSkills.length - 6} más
                        </span>
                      )}
                    </div>
                  )}

                  {/* Datos Económicos y Disponibilidad */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 flex-wrap">
                    {candidate.expectedSalaryEur && (
                      <span>Pretensión: <strong className="text-slate-200">{candidate.expectedSalaryEur.toLocaleString()} €</strong></span>
                    )}
                    {candidate.englishLevel && (
                      <span>Inglés: <strong className="text-slate-200">{candidate.englishLevel}</strong></span>
                    )}
                    <span>Fecha: <strong className="text-slate-200">{candidate.interviewDate}</strong></span>
                  </div>
                </div>

                {/* Score Badge & Acciones Rápidas */}
                <div className="flex items-center gap-4 lg:border-l lg:border-slate-800 lg:pl-6 justify-between sm:justify-end">
                  {/* Calificación */}
                  <div className="text-right">
                    <div className="text-2xl font-black text-white flex items-center gap-1 justify-end">
                      <Award className="w-5 h-5 text-indigo-400" />
                      <span>{score}%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Nota Global
                    </span>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex items-center gap-2">
                    {/* Ver Ficha & CV */}
                    <button
                      onClick={() => setPreviewCandidate(candidate)}
                      className="p-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 transition-all"
                      title="Ver Ficha y Currículum Completo"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                    </button>

                    {/* Evaluar / Iniciar Entrevista */}
                    <button
                      onClick={() => onSelectCandidate(candidate, 'interview')}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
                      title="Abrir rúbricas y disparadores en directo"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Evaluar</span>
                    </button>

                    {/* Descargar Excel Nativo */}
                    <button
                      onClick={() => ExcelInterviewService.exportCandidateToExcel(candidate)}
                      className="p-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 transition-all"
                      title="Descargar Ficha en Excel (.xlsx)"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    </button>

                    {/* Editar */}
                    <button
                      onClick={() => onEditCandidate(candidate)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
                      title="Editar datos del candidato"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Eliminar */}
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar la evaluación de ${candidate.fullName}?`)) {
                          onDeleteCandidate(candidate.id);
                        }
                      }}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 transition-all"
                      title="Eliminar candidato"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Vista Preliminar de Candidato y CV */}
      <CandidatePreviewModal
        isOpen={Boolean(previewCandidate)}
        candidate={previewCandidate}
        onClose={() => setPreviewCandidate(null)}
        onStartInterview={previewCandidate ? () => {
          const c = previewCandidate;
          setPreviewCandidate(null);
          onSelectCandidate(c, 'interview');
        } : undefined}
      />
    </div>
  );
};
