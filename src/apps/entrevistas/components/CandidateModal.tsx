import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  Download,
  CheckCircle2, 
  Briefcase,
  Trash2,
  Plus,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { CandidateInterview, MecaluxCompetencyRubric } from '../../../types';
import { getDefaultDynamicQuestions } from '../services/mecaluxRubrics';
import { analyzeCvText, ParsedCvResult } from '../services/cvAnalysisEngine';
import { extractTextFromPdfFile } from '../services/pdfExtractor';
import { useToast } from '../../../context/ToastContext';

interface CandidateModalProps {
  isOpen: boolean;
  candidateToEdit?: CandidateInterview | null;
  onClose: () => void;
  onSave: (candidate: CandidateInterview, startInterviewNow?: boolean) => void;
}

const PREDEFINED_ROLES = [
  'Técnico de Nivel 1 (Soporte & Helpdesk Mecalux)',
  'Técnico de Nivel 1 (Implantación & Puesta en Marcha SGA)',
  'Consultor SGA / WMS (Easy WMS Mecalux)',
  'Software Engineer Backend (.NET / C# / SGA)',
  'Software Engineer Backend (Java / Spring)',
  'Software Engineer Frontend (React / Angular / TS)',
  'Full Stack Software Engineer',
  'Ingeniero de Automatización, Robótica & PLC (Siemens / TIA Portal)',
  'QA Automation & Quality Engineer',
  'DevOps & Cloud Systems Engineer (Azure / AWS)',
  'Project Manager / Scrum Master Intralogística'
];

export const CandidateModal: React.FC<CandidateModalProps> = ({
  isOpen,
  candidateToEdit,
  onClose,
  onSave
}) => {
  const toast = useToast();
  if (!isOpen) return null;

  const [cvText, setCvText] = useState(candidateToEdit?.cvText || '');
  const [cvFileName, setCvFileName] = useState(candidateToEdit?.cvFileName || '');
  const [fullName, setFullName] = useState(candidateToEdit?.fullName || '');
  const [email, setEmail] = useState(candidateToEdit?.email || '');
  const [phone, setPhone] = useState(candidateToEdit?.phone || '');
  const [location, setLocation] = useState(candidateToEdit?.location || '');
  const [role, setRole] = useState(candidateToEdit?.role || PREDEFINED_ROLES[0]);
  const [customRole, setCustomRole] = useState('');
  const [seniority, setSeniority] = useState<CandidateInterview['seniority']>(candidateToEdit?.seniority || 'Junior');
  const [currentCompany, setCurrentCompany] = useState(candidateToEdit?.currentCompany || '');
  const [currentSalaryEur, setCurrentSalaryEur] = useState<number | undefined>(candidateToEdit?.currentSalaryEur);
  const [expectedSalaryEur, setExpectedSalaryEur] = useState<number | undefined>(candidateToEdit?.expectedSalaryEur);
  const [noticePeriodWeeks, setNoticePeriodWeeks] = useState<number>(candidateToEdit?.noticePeriodWeeks || 2);
  const [englishLevel, setEnglishLevel] = useState(candidateToEdit?.englishLevel || 'B2');
  
  const getInitialDate = () => {
    if (candidateToEdit?.interviewDate) {
      if (candidateToEdit.interviewDate.includes('T')) {
        return candidateToEdit.interviewDate.slice(0, 16);
      }
      return `${candidateToEdit.interviewDate}T10:00`;
    }
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().slice(0, 16);
  };
  const [interviewDate, setInterviewDate] = useState(getInitialDate());
  const [excelEnviadoAJefe, setExcelEnviadoAJefe] = useState<boolean>(Boolean(candidateToEdit?.excelEnviadoAJefe ?? candidateToEdit?.resultadoFinal?.excelEnviadoAJefe));
  
  const [analysisResult, setAnalysisResult] = useState<ParsedCvResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [dynamicQuestions, setDynamicQuestions] = useState<MecaluxCompetencyRubric[]>(() => {
    if (candidateToEdit?.dynamicQuestions && candidateToEdit.dynamicQuestions.length > 0) {
      return candidateToEdit.dynamicQuestions;
    }
    return getDefaultDynamicQuestions();
  });
  const [newCustomQuestionText, setNewCustomQuestionText] = useState('');

  useEffect(() => {
    if (candidateToEdit) {
      setCvText(candidateToEdit.cvText || '');
      setCvFileName(candidateToEdit.cvFileName || '');
      setFullName(candidateToEdit.fullName || '');
      setEmail(candidateToEdit.email || '');
      setPhone(candidateToEdit.phone || '');
      setLocation(candidateToEdit.location || '');
      setRole(candidateToEdit.role || PREDEFINED_ROLES[0]);
      setSeniority(candidateToEdit.seniority || 'Junior');
      setCurrentCompany(candidateToEdit.currentCompany || '');
      setCurrentSalaryEur(candidateToEdit.currentSalaryEur);
      setExpectedSalaryEur(candidateToEdit.expectedSalaryEur);
      setNoticePeriodWeeks(candidateToEdit.noticePeriodWeeks || 2);
      setEnglishLevel(candidateToEdit.englishLevel || 'B2');
      setDynamicQuestions(
        candidateToEdit.dynamicQuestions && candidateToEdit.dynamicQuestions.length > 0
          ? candidateToEdit.dynamicQuestions
          : getDefaultDynamicQuestions()
      );
    } else {
      setDynamicQuestions(getDefaultDynamicQuestions());
    }
  }, [candidateToEdit, isOpen]);

  const applyAnalysis = (text: string, fileName?: string) => {
    const result = analyzeCvText(text, fileName || cvFileName);
    setAnalysisResult(result);
    if (result.fullName && result.fullName !== 'Candidato Detectado') {
      setFullName(result.fullName);
    }
    if (result.email) setEmail(result.email);
    if (result.phone) setPhone(result.phone);
    if (result.location && result.location !== 'No especificada') {
      setLocation(result.location);
    }
    if (result.currentCompany && result.currentCompany !== 'No especificada') {
      if (result.currentPosition && result.currentPosition !== 'Técnico de Soporte') {
        setCurrentCompany(`${result.currentCompany} (${result.currentPosition})`);
      } else {
        setCurrentCompany(result.currentCompany);
      }
    } else if (result.currentPosition && result.currentPosition !== 'Técnico de Soporte') {
      setCurrentCompany(result.currentPosition);
    }
    if (result.estimatedSeniority) setSeniority(result.estimatedSeniority);
    if (result.englishLevel) setEnglishLevel(result.englishLevel);
    if (typeof result.noticePeriodWeeks === 'number') setNoticePeriodWeeks(result.noticePeriodWeeks);
    if (result.suggestedRole && !candidateToEdit) {
      if (PREDEFINED_ROLES.includes(result.suggestedRole)) {
        setRole(result.suggestedRole);
      }
    }
    if (result.expectedSalaryEur) setExpectedSalaryEur(result.expectedSalaryEur);
    if (result.currentSalaryEur) setCurrentSalaryEur(result.currentSalaryEur);

    // Incorporar preguntas dinámicas personalizadas sugeridas según el CV
    if (result.customSuggestedQuestions && result.customSuggestedQuestions.length > 0) {
      const generatedRubrics: MecaluxCompetencyRubric[] = result.customSuggestedQuestions.map((q, idx) => ({
        id: `cv_dyn_${candidateToEdit?.id || 'new'}_${idx}_${Date.now()}`,
        section: 'Preguntas Dinámicas',
        nombre: `${q.category}: ${q.question}`,
        criterios: {
          inexistente: 'No responde o no tiene conocimientos sobre el tema planteado.',
          pobre: 'Respuesta muy básica o superficial; demuestra dudas en la resolución.',
          bueno: 'Responde con solvencia, lógica y criterio profesional adecuado.',
          fuerte: 'Dominio total, aporta ejemplos reales y mejores prácticas.'
        },
        disparadores: [q.reason]
      }));

      setDynamicQuestions(prev => {
        const existingNames = new Set(prev.map(p => p.nombre.toLowerCase()));
        const unique = generatedRubrics.filter(g => !existingNames.has(g.nombre.toLowerCase()));
        return [...prev, ...unique];
      });
    }

    return result;
  };

  const handleAddCustomQuestionInModal = () => {
    if (!newCustomQuestionText.trim()) return;
    const newRubric: MecaluxCompetencyRubric = {
      id: `cand_dyn_${candidateToEdit?.id || 'new'}_${Date.now()}`,
      section: 'Preguntas Dinámicas',
      nombre: newCustomQuestionText.trim(),
      criterios: {
        inexistente: 'No responde o no tiene conocimientos sobre el tema planteado.',
        pobre: 'Respuesta muy básica o superficial; demuestra dudas en la resolución.',
        bueno: 'Responde con solvencia, lógica y criterio profesional adecuado.',
        fuerte: 'Dominio total, aporta ejemplos reales y mejores prácticas.'
      },
      disparadores: []
    };
    setDynamicQuestions(prev => [...prev, newRubric]);
    setNewCustomQuestionText('');
    toast.success('Pregunta añadida para este candidato');
  };

  const handleAnalyzeCv = () => {
    if (!cvText.trim()) return;
    setAnalyzing(true);

    setTimeout(() => {
      applyAnalysis(cvText, cvFileName);
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
        applyAnalysis(text, file.name);
      } catch (err: any) {
        toast.error(err.message || 'Error al procesar el archivo PDF');
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
        applyAnalysis(text, file.name);
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
      dynamicQuestions,
      evaluations: candidateToEdit?.evaluations || {},
      excelEnviadoAJefe,
      resultadoFinal: candidateToEdit?.resultadoFinal ? {
        ...candidateToEdit.resultadoFinal,
        dynamicQuestions,
        excelEnviadoAJefe
      } : {
        decision: 'Pendiente',
        puntuacionGlobal: 0,
        puntosFuertes: [],
        puntosAMejorar: [],
        conclusionesTeamLeader: '',
        dynamicQuestions,
        excelEnviadoAJefe
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
                <Download className="w-3.5 h-3.5" />
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

            {/* Empresa / Puesto Actual */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Empresa / Puesto Actual</label>
              <input
                type="text"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                placeholder="Ej. Indra (Técnico de Soporte)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Ubicación / Residencia */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Residencia / Ubicación</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej. Gijón, Asturias / Barcelona..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Salario Actual (€) - Opcional */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Salario Actual (€) <span className="text-slate-500 font-normal">(Opcional)</span></label>
              <input
                type="number"
                value={currentSalaryEur || ''}
                onChange={(e) => setCurrentSalaryEur(Number(e.target.value) || undefined)}
                placeholder="Ej. 24000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Salario Pretendido (€) - Opcional */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Salario Pretendido (€) <span className="text-slate-500 font-normal">(Opcional)</span></label>
              <input
                type="number"
                value={expectedSalaryEur || ''}
                onChange={(e) => setExpectedSalaryEur(Number(e.target.value) || undefined)}
                placeholder="Ej. 28000"
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

            {/* Fecha de Entrevista */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Fecha y Hora de Entrevista</label>
              <input
                type="datetime-local"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
              />
            </div>

            {/* Registro de Envío de Excel al Jefe */}
            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-bold text-white block">
                    📄 Ficha Excel Oficial Enviada al Jefe / Responsable
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Solo es necesario remitir el Excel oficial al jefe cuando el candidato haya sido elegido para la contratación
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExcelEnviadoAJefe(false)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      !excelEnviadoAJefe
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    ⏳ Pendiente de Enviar
                  </button>
                  <button
                    type="button"
                    onClick={() => setExcelEnviadoAJefe(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      excelEnviadoAJefe
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    ✅ Enviado al Jefe
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Preguntas Dinámicas Personalizadas del Candidato */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Preguntas Dinámicas Personalizadas ({dynamicQuestions.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Preguntas exclusivas para este candidato. No se comparten con otros perfiles.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Restablecer las preguntas dinámicas por defecto para este candidato?')) {
                    setDynamicQuestions(getDefaultDynamicQuestions());
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-[11px] font-semibold transition-all self-start sm:self-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar base</span>
              </button>
            </div>

            {/* Listado de preguntas con botón de eliminar */}
            <div className="space-y-2 pt-1 max-h-56 overflow-y-auto pr-1">
              {dynamicQuestions.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2 text-center">
                  Sin preguntas dinámicas asignadas. Puedes escribir una personalizada o restaurar la base.
                </p>
              ) : (
                dynamicQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
                  >
                    <div className="space-y-0.5 flex-1">
                      <span className="font-semibold text-slate-200 leading-relaxed block">
                        {q.nombre}
                      </span>
                      {q.disparadores && q.disparadores.length > 0 && (
                        <span className="text-[10px] text-cyan-400/80 block italic">
                          Pista / Disparador: {q.disparadores[0]}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDynamicQuestions(prev => prev.filter(item => item.id !== q.id));
                        toast.info('Pregunta eliminada para este candidato');
                      }}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all flex-shrink-0"
                      title="Eliminar esta pregunta para este candidato"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Añadir pregunta personalizada rápida */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newCustomQuestionText}
                onChange={(e) => setNewCustomQuestionText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomQuestionInModal();
                  }
                }}
                placeholder="Escribe una pregunta personalizada (ej. ¿Qué experiencia tienes con Oracle PL/SQL?)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleAddCustomQuestionInModal}
                disabled={!newCustomQuestionText.trim()}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold transition-all whitespace-nowrap shadow-md shadow-cyan-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir</span>
              </button>
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
