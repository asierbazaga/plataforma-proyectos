import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  FileText, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  DollarSign, 
  Calendar,
  Clock,
  Layers,
  Award,
  FileSpreadsheet
} from 'lucide-react';
import { CandidateInterview } from '../../../types';
import { analyzeCvText, ParsedCvResult } from '../services/cvAnalysisEngine';
import { extractTextFromPdfFile } from '../services/pdfExtractor';

interface CandidateModalProps {
  isOpen: boolean;
  candidateToEdit?: CandidateInterview | null;
  onClose: () => void;
  onSave: (candidate: CandidateInterview, startInterviewNow?: boolean) => void;
}

const PREDEFINED_ROLES = [
  'Software Engineer Backend (.NET / C# / SGA)',
  'Software Engineer Backend (Java / Spring)',
  'Software Engineer Frontend (React / Angular / TS)',
  'Full Stack Software Engineer',
  'Consultor SGA / WMS (Easy WMS Mecalux)',
  'Ingeniero de Automatización, Robótica & PLC (Siemens / TIA Portal)',
  'QA Automation & Quality Engineer',
  'DevOps & Cloud Systems Engineer (Azure / AWS)',
  'Project Manager / Scrum Master Intralogística',
  'Technical Support & Helpdesk 24/7'
];

export const CandidateModal: React.FC<CandidateModalProps> = ({
  isOpen,
  candidateToEdit,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [cvText, setCvText] = useState(candidateToEdit?.cvText || '');
  const [cvFileName, setCvFileName] = useState(candidateToEdit?.cvFileName || '');
  const [fullName, setFullName] = useState(candidateToEdit?.fullName || '');
  const [email, setEmail] = useState(candidateToEdit?.email || '');
  const [phone, setPhone] = useState(candidateToEdit?.phone || '');
  const [location, setLocation] = useState(candidateToEdit?.location || '');
  const [role, setRole] = useState(candidateToEdit?.role || PREDEFINED_ROLES[0]);
  const [customRole, setCustomRole] = useState('');
  const [seniority, setSeniority] = useState<CandidateInterview['seniority']>(candidateToEdit?.seniority || 'Senior');
  const [currentCompany, setCurrentCompany] = useState(candidateToEdit?.currentCompany || '');
  const [currentSalaryEur, setCurrentSalaryEur] = useState<number | undefined>(candidateToEdit?.currentSalaryEur);
  const [expectedSalaryEur, setExpectedSalaryEur] = useState<number | undefined>(candidateToEdit?.expectedSalaryEur);
  const [noticePeriodWeeks, setNoticePeriodWeeks] = useState<number>(candidateToEdit?.noticePeriodWeeks || 2);
  const [englishLevel, setEnglishLevel] = useState(candidateToEdit?.englishLevel || 'B2');
  const [interviewDate, setInterviewDate] = useState(candidateToEdit?.interviewDate || new Date().toISOString().split('T')[0]);
  
  const [analysisResult, setAnalysisResult] = useState<ParsedCvResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const applyAnalysis = (text: string) => {
    const result = analyzeCvText(text);
    setAnalysisResult(result);
    if (result.fullName && (!fullName || fullName === 'Candidato Detectado')) {
      setFullName(result.fullName);
    }
    if (result.email && !email) setEmail(result.email);
    if (result.phone && !phone) setPhone(result.phone);
    if (result.location && !location) setLocation(result.location);
    if (result.estimatedSeniority) setSeniority(result.estimatedSeniority);
    return result;
  };

  const handleAnalyzeCv = () => {
    if (!cvText.trim()) return;
    setAnalyzing(true);

    setTimeout(() => {
      applyAnalysis(cvText);
      setAnalyzing(false);
    }, 300);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvFileName(file.name);

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setUploadingPdf(true);
      setAnalyzing(true);
      try {
        const text = await extractTextFromPdfFile(file);
        setCvText(text);
        applyAnalysis(text);
      } catch (err: any) {
        alert(err.message || 'Error al procesar el archivo PDF');
      } finally {
        setUploadingPdf(false);
        setAnalyzing(false);
      }
      return;
    }

    // Archivos de texto (.txt, .csv, etc.)
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCvText(text);
        applyAnalysis(text);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (startNow: boolean) => {
    if (!fullName.trim()) return;

    const finalRole = role === 'Otro' && customRole.trim() ? customRole.trim() : role;

    const candidateData: CandidateInterview = {
      id: candidateToEdit?.id || `cand_${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      role: finalRole,
      seniority,
      currentCompany: currentCompany.trim(),
      currentSalaryEur: currentSalaryEur || undefined,
      expectedSalaryEur: expectedSalaryEur || undefined,
      noticePeriodWeeks,
      englishLevel,
      status: candidateToEdit?.status || (startNow ? 'in_progress' : 'scheduled'),
      interviewDate,
      durationMinutes: candidateToEdit?.durationMinutes || 0,
      cvText,
      parsedSkills: analysisResult?.detectedSkills || candidateToEdit?.parsedSkills || [],
      evaluations: candidateToEdit?.evaluations || {},
      resultadoFinal: candidateToEdit?.resultadoFinal || {
        decision: 'Pendiente',
        puntuacionGlobal: 0,
        puntosFuertes: [],
        puntosAMejorar: [],
        conclusionesTeamLeader: ''
      },
      createdAt: candidateToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(candidateData, startNow);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-scale-in">
        {/* Cabecera */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {candidateToEdit ? 'Editar Candidato Mecalux' : 'Nuevo Candidato & Asistente de CV'}
              </h2>
              <p className="text-xs text-slate-400">
                Pega el CV para autocompletar datos y generar preguntas personalizadas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo con Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Sección de Análisis de CV */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Importar o Pegar Texto del CV
                </span>
              </div>
              <label className="cursor-pointer text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingPdf ? 'Leyendo PDF...' : cvFileName ? `📄 ${cvFileName}` : 'Cargar CV (PDF / TXT)'}</span>
                <input type="file" accept=".pdf,.txt,.docx,.csv,.json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {uploadingPdf && (
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span>Extrayendo texto y analizando estructura del PDF...</span>
              </div>
            )}

            <textarea
              rows={4}
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Pega aquí el contenido del CV o resumen del candidato..."
              className="w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAnalyzeCv}
                disabled={!cvText.trim() || analyzing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{analyzing ? 'Analizando CV...' : 'Autocompletar y Analizar CV'}</span>
              </button>
            </div>

            {/* Resultado de Análisis */}
            {analysisResult && (
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    Análisis Completado: Seniority estimada como {analysisResult.estimatedSeniority} ({analysisResult.yearsOfExperienceEstimate} años aprox.)
                  </span>
                </div>
                {analysisResult.detectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {analysisResult.detectedSkills.map((s, i) => (
                      <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Formulario de Datos del Candidato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre Completo */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Nombre Completo *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Carlos Ramos Martínez"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Puesto / Rol */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Puesto en Mecalux</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                {PREDEFINED_ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
                <option value="Otro">Otro (Especificar)</option>
              </select>
            </div>

            {/* Seniority */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Seniority</label>
              <select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Junior">Junior (0-2 años)</option>
                <option value="Mid">Mid (2-4 años)</option>
                <option value="Senior">Senior (4-7 años)</option>
                <option value="Lead">Lead / Responsable (7+ años)</option>
                <option value="Tech Lead">Tech Lead / Arquitecto</option>
                <option value="Especialista">Especialista Técnico</option>
              </select>
            </div>

            {role === 'Otro' && (
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Especificar Puesto</label>
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="Nombre del puesto a evaluar..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="carlos@ejemplo.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Teléfono</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34 600 000 000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Empresa Actual */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Empresa Actual / Origen</label>
              <input
                type="text"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                placeholder="Ej. Indra, Accenture, Consultora..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Ubicación */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Ubicación / Residencia</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Gijón / Barcelona / Remoto..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Salario Actual (€) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Salario Actual Bruto (€)</label>
              <input
                type="number"
                value={currentSalaryEur || ''}
                onChange={(e) => setCurrentSalaryEur(Number(e.target.value) || undefined)}
                placeholder="Ej. 35000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Salario Pretendido (€) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Salario Pretendido (€)</label>
              <input
                type="number"
                value={expectedSalaryEur || ''}
                onChange={(e) => setExpectedSalaryEur(Number(e.target.value) || undefined)}
                placeholder="Ej. 42000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Preaviso (Semanas) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Preaviso / Disponibilidad</label>
              <select
                value={noticePeriodWeeks}
                onChange={(e) => setNoticePeriodWeeks(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value={0}>Inmediata (0 semanas)</option>
                <option value={2}>2 semanas (15 días estándar)</option>
                <option value={4}>1 mes (4 semanas)</option>
                <option value={8}>2 meses (8 semanas)</option>
              </select>
            </div>

            {/* Nivel de Inglés */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Nivel de Inglés</label>
              <select
                value={englishLevel}
                onChange={(e) => setEnglishLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="A2">A2 - Básico</option>
                <option value="B1">B1 - Intermedio</option>
                <option value="B2">B2 - Fluido Profesional</option>
                <option value="C1">C1 - Avanzado</option>
                <option value="C2 / Nativo">C2 / Nativo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botones del Pie */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-between bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={!fullName.trim()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold border border-slate-700 transition-all"
            >
              Guardar en Lista
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={!fullName.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              {candidateToEdit ? 'Guardar & Abrir Rúbricas' : 'Crear & Empezar Entrevista'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
