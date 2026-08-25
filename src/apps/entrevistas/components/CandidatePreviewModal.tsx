import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Award, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink,
  Layers,
  Search
} from 'lucide-react';
import { CandidateInterview } from '../../../types';

interface CandidatePreviewModalProps {
  isOpen: boolean;
  candidate: CandidateInterview | null;
  onClose: () => void;
  onStartInterview?: () => void;
}

export const CandidatePreviewModal: React.FC<CandidatePreviewModalProps> = ({
  isOpen,
  candidate,
  onClose,
  onStartInterview
}) => {
  if (!isOpen || !candidate) return null;

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'cvText'>('summary');
  const [cvSearch, setCvSearch] = useState('');

  const handleCopyCv = () => {
    if (!candidate.cvText) return;
    navigator.clipboard.writeText(candidate.cvText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightCvText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? `<mark class="bg-amber-400 text-black px-1 rounded font-bold">${part}</mark>` 
        : part
    ).join('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-scale-in">
        {/* Cabecera del Preview */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-black text-base shadow-lg shadow-blue-500/20">
              {candidate.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {candidate.fullName}
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {candidate.seniority}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {candidate.resultadoFinal.decision || 'Pendiente'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {candidate.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onStartInterview && (
              <button
                onClick={onStartInterview}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-md"
              >
                <span>Evaluar en Directo</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pestañas de Vista */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800/80 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'summary'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Ficha & Datos Clave
          </button>
          <button
            onClick={() => setActiveTab('cvText')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'cvText'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Texto Completo del Currículum</span>
            {candidate.cvFileName && (
              <span className="text-[10px] text-slate-500 font-normal">({candidate.cvFileName})</span>
            )}
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Tarjetas de Datos de Contacto y Perfil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Residencia / Ciudad</span>
                  </div>
                  <p className="font-bold text-white text-sm">
                    {candidate.location || 'No especificada'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Empresa / Puesto Actual</span>
                  </div>
                  <p className="font-bold text-white text-sm truncate">
                    {candidate.currentCompany || 'No especificada'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Email</span>
                  </div>
                  <p className="font-bold text-white text-sm truncate">
                    {candidate.email || 'No indicado'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Teléfono</span>
                  </div>
                  <p className="font-bold text-white text-sm">
                    {candidate.phone || 'No indicado'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Nivel de Inglés</span>
                  </div>
                  <p className="font-bold text-white text-sm">
                    {candidate.englishLevel || 'B2'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Disponibilidad / Preaviso</span>
                  </div>
                  <p className="font-bold text-white text-sm">
                    {candidate.noticePeriodWeeks === 0 ? 'Inmediata' : `${candidate.noticePeriodWeeks} semanas`}
                  </p>
                </div>
              </div>

              {/* Tecnologías Detectadas */}
              {candidate.parsedSkills && candidate.parsedSkills.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-white uppercase tracking-wider text-xs">
                      Stack Tecnológico & Competencias Detectadas
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {candidate.parsedSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumen de Evaluación si ya ha sido evaluado */}
              {candidate.resultadoFinal.puntuacionGlobal > 0 && (
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase tracking-wider text-xs">
                      Estado de Evaluación
                    </span>
                    <span className="font-black text-sm text-indigo-400">
                      Nota: {candidate.resultadoFinal.puntuacionGlobal}%
                    </span>
                  </div>

                  {candidate.resultadoFinal.conclusionesTeamLeader && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed italic">
                      "{candidate.resultadoFinal.conclusionesTeamLeader}"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'cvText' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cvSearch}
                    onChange={(e) => setCvSearch(e.target.value)}
                    placeholder="Buscar palabra o tecnología en el texto del currículum..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={handleCopyCv}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
                </button>
              </div>

              {candidate.cvText ? (
                <div 
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-mono select-text max-h-[55vh] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: highlightCvText(candidate.cvText, cvSearch) }}
                />
              ) : (
                <div className="p-12 text-center rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p>No se guardó el texto en bruto del CV para este candidato.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-between bg-slate-900/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700"
          >
            Cerrar Vista Preliminar
          </button>

          {onStartInterview && (
            <button
              onClick={onStartInterview}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25"
            >
              Abrir Rúbricas de Entrevista
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
