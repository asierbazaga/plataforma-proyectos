import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Image as ImageIcon, 
  Upload, 
  Maximize2, 
  X, 
  Calendar,
  Award,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';

// Tabla oficial de incentivos según imagen R/O MES Drasanvi
const INCENTIVE_SCALE: { [key: number]: number } = {
  80: 250, 81: 270, 82: 290, 83: 310, 84: 330, 85: 350, 86: 370, 87: 390, 88: 410, 89: 430,
  90: 500, 91: 520, 92: 540, 93: 560, 94: 580, 95: 620, 96: 640, 97: 660, 98: 680, 99: 700,
  100: 800, 101: 820, 102: 840, 103: 860, 104: 880, 105: 1000, 106: 1020, 107: 1040, 108: 1060, 109: 1080,
  110: 1200, 111: 1220, 112: 1240, 113: 1260, 114: 1280, 115: 1300, 116: 1320, 117: 1340, 118: 1360, 119: 1380,
  120: 1500
};

export const LoreGoalsCalculator: React.FC = () => {
  const { canEditApp } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Función para calcular automáticamente días laborables (Lunes a Viernes) desde hoy hasta fin de mes
  const calculateAutoWorkDays = (): number => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    let workDays = 0;
    for (let day = currentDay; day <= lastDay; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay(); // 0: Domingo, 6: Sábado
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workDays++;
      }
    }
    return workDays > 0 ? workDays : 1;
  };

  // Estado del Objetivo Mensual y Venta Acumulada
  const [objetivoMensual, setObjetivoMensual] = useState<number>(15000);
  const [ventaAcumulada, setVentaAcumulada] = useState<number>(0);
  const [diasLaborablesRestantes, setDiasLaborablesRestantes] = useState<number>(calculateAutoWorkDays());
  const [incentiveImage, setIncentiveImage] = useState<string>('/tabla-incentivos.png');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    storageService.getLoreGoalsConfig().then(cfg => {
      if (cfg) {
        setObjetivoMensual(cfg.objetivoMensual);
        setVentaAcumulada(cfg.ventaAcumulada);
        setDiasLaborablesRestantes(cfg.diasLaborablesRestantes);
        if (cfg.incentiveImage) setIncentiveImage(cfg.incentiveImage);
      }
    });

    const unsubscribe = storageService.onSync(() => {
      storageService.getLoreGoalsConfig().then(cfg => {
        if (cfg) {
          setObjetivoMensual(cfg.objetivoMensual);
          setVentaAcumulada(cfg.ventaAcumulada);
          setDiasLaborablesRestantes(cfg.diasLaborablesRestantes);
          if (cfg.incentiveImage) setIncentiveImage(cfg.incentiveImage);
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const updateAndSaveGoals = (updates: Partial<{ objetivoMensual: number; ventaAcumulada: number; diasLaborablesRestantes: number; incentiveImage: string }>) => {
    if (updates.objetivoMensual !== undefined) setObjetivoMensual(updates.objetivoMensual);
    if (updates.ventaAcumulada !== undefined) setVentaAcumulada(updates.ventaAcumulada);
    if (updates.diasLaborablesRestantes !== undefined) setDiasLaborablesRestantes(updates.diasLaborablesRestantes);
    if (updates.incentiveImage !== undefined) setIncentiveImage(updates.incentiveImage);
    storageService.saveLoreGoalsConfig(updates);
  };

  // Cálculos de Objetivos y Ritmos
  const metaBono80 = objetivoMensual * 0.8;
  const porcentajeAlcanzado = objetivoMensual > 0 ? (ventaAcumulada / objetivoMensual) * 100 : 0;
  
  // Falta para el 80% y para el 100%
  const faltaPara80 = Math.max(0, metaBono80 - ventaAcumulada);
  const faltaPara100 = Math.max(0, objetivoMensual - ventaAcumulada);

  // Ritmo diario y semanal para Bono 80%
  const dias = diasLaborablesRestantes > 0 ? diasLaborablesRestantes : 1;
  const ritmoDiario80 = faltaPara80 / dias;
  const ritmoSemanal80 = ritmoDiario80 * 5;

  // Ritmo diario y semanal para 100%
  const ritmoDiario100 = faltaPara100 / dias;
  const ritmoSemanal100 = ritmoDiario100 * 5;

  // Incentivo actual ganado según la tabla de porcentajes
  const currentIncentive = useMemo(() => {
    const floorPct = Math.floor(porcentajeAlcanzado);
    if (floorPct < 80) return 0;
    if (floorPct >= 120) return INCENTIVE_SCALE[120];
    return INCENTIVE_SCALE[floorPct] || 0;
  }, [porcentajeAlcanzado]);

  // Estado Actual
  const getStatus = () => {
    if (ventaAcumulada >= objetivoMensual) {
      return {
        label: '¡Objetivo 100% Conseguido!',
        icon: '🏆',
        subtext: `Superado por +${(ventaAcumulada - objetivoMensual).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30'
      };
    }
    if (ventaAcumulada >= metaBono80) {
      return {
        label: '¡Bono 80% Asegurado!',
        icon: '🎯',
        subtext: `Falta para el 100%: ${faltaPara100.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10 border-purple-500/30'
      };
    }
    return {
      label: 'En Proceso',
      icon: '⏳',
      subtext: `Falta para el 80%: ${faltaPara80.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/30'
    };
  };

  const currentStatus = getStatus();

  // Subir / cambiar la imagen de objetivos
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          updateAndSaveGoals({ incentiveImage: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetImage = () => {
    updateAndSaveGoals({ incentiveImage: '/tabla-incentivos.png' });
  };

  const handleRecalculateDays = () => {
    const calculated = calculateAutoWorkDays();
    updateAndSaveGoals({ diasLaborablesRestantes: calculated });
  };

  return (
    <div className="space-y-6">
      {/* Header Container Principal Drasanvi Style */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#131B2E] to-[#0B0F19] border border-pink-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Glow ambient background spots */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Title Header */}
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-pink-500/20">
          <div className="flex items-center gap-3.5">
            <span className="text-3xl filter drop-shadow-md">🌸</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Cuadro de Mandos - Lore</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 font-extrabold text-xl sm:text-2xl">
                  (Drasanvi)
                </span>
              </h1>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Control de Objetivos y Ventas
              </p>
            </div>
          </div>

          {currentIncentive > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-900/60 to-pink-900/60 border border-purple-500/40 shadow-lg shadow-purple-500/10">
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-[10px] text-purple-300 font-bold uppercase">Incentivo Actual Ganado</p>
                <p className="text-base font-black text-white">+{currentIncentive} €</p>
              </div>
            </div>
          )}
        </div>

        {/* Sub-Header: Control de Objetivos y Ventas */}
        <div className="relative z-10 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-lg">📊</span>
            <span>Control de Objetivos y Ventas</span>
          </h2>

          {/* 3 Main Inputs Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Input 1: Objetivo Mensual Total */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Objetivo Mensual Total (€)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={objetivoMensual}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    updateAndSaveGoals({ objetivoMensual: val });
                  }}
                  className="w-full bg-[#1A2E35]/70 hover:bg-[#1A2E35] focus:bg-[#1A2E35] border border-emerald-500/30 focus:border-emerald-400 text-emerald-300 font-extrabold text-base rounded-2xl px-4 py-3 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Input 2: Venta Realizada Acumulada */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Venta Realizada Acumulada (€)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={ventaAcumulada}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    updateAndSaveGoals({ ventaAcumulada: val });
                  }}
                  className="w-full bg-[#1A2E35]/70 hover:bg-[#1A2E35] focus:bg-[#1A2E35] border border-emerald-500/30 focus:border-emerald-400 text-emerald-300 font-extrabold text-base rounded-2xl px-4 py-3 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Input 3: Días Laborables Restantes (Calculado Automáticamente) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-pink-400" />
                  <span>Días Laborables Restantes</span>
                </label>
                <button
                  type="button"
                  onClick={handleRecalculateDays}
                  title="Recalcular días laborales restantes de este mes"
                  className="text-[10px] font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1 bg-pink-500/10 px-2 py-0.5 rounded-md border border-pink-500/20"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> Auto: Hoy a fin de mes
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={diasLaborablesRestantes}
                  onChange={(e) => {
                    const val = Math.max(1, Number(e.target.value) || 1);
                    updateAndSaveGoals({ diasLaborablesRestantes: val });
                  }}
                  className="w-full bg-[#1A2E35]/70 hover:bg-[#1A2E35] focus:bg-[#1A2E35] border border-emerald-500/30 focus:border-emerald-400 text-emerald-300 font-extrabold text-base rounded-2xl px-4 py-3 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Enhanced Progress Bar with 80% Bono and 100% Goal Threshold Markers */}
          <div className="space-y-2 pt-2">
            <div className="relative w-full h-8 bg-[#0f172a]/90 rounded-2xl border border-[#1e293b] overflow-hidden shadow-inner flex items-center">
              {/* Active Progress Fill */}
              <div
                className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-700 rounded-l-2xl"
                style={{ width: `${Math.min(100, Math.max(0, porcentajeAlcanzado))}%` }}
              />

              {/* Porcentaje Texto flotante */}
              <span className="absolute left-4 text-xs font-black text-white drop-shadow-md">
                {porcentajeAlcanzado.toFixed(1)}%
              </span>

              {/* 80% Bono Marker Line */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-purple-400/80 z-20 shadow-[0_0_8px_#C084FC]"
                style={{ left: '80%' }}
              >
                <span className="absolute -top-0.5 right-2 text-[10px] font-bold text-purple-300 bg-[#0f172a]/90 px-1.5 py-0.5 rounded border border-purple-500/40 whitespace-nowrap">
                  Bono 80% ({metaBono80.toLocaleString('es-ES')} €)
                </span>
              </div>
            </div>
          </div>

          {/* 3 Outcome Cards (Estado Actual, Ritmo para Bono 80%, Ritmo para 100%) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Card 1: Estado Actual */}
            <div className="backdrop-blur-md bg-[#0f172a]/80 border border-[#1e293b] rounded-2xl p-5 text-center space-y-2 shadow-lg flex flex-col justify-center items-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Estado Actual
              </p>

              <div className="flex items-center gap-2 text-xl sm:text-2xl font-black text-white">
                <span>{currentStatus.icon}</span>
                <span className={currentStatus.color}>{currentStatus.label}</span>
              </div>

              <p className="text-xs font-semibold text-slate-400">
                {currentStatus.subtext}
              </p>
            </div>

            {/* Card 2: Ritmo para Bono 80% */}
            <div className="backdrop-blur-md bg-[#0f172a]/80 border border-[#1e293b] rounded-2xl p-5 text-center space-y-2 shadow-lg flex flex-col justify-center items-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Ritmo para Bono 80%
              </p>

              <div className="space-y-0.5">
                <p className="text-[11px] text-slate-400 font-medium">Venta Diaria Necesaria:</p>
                <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {faltaPara80 <= 0 ? (
                    <span className="text-emerald-400 text-xl font-extrabold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-5 h-5" /> ¡Conseguido!
                    </span>
                  ) : (
                    `${ritmoDiario80.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
                  )}
                </p>
              </div>

              <p className="text-xs font-medium text-slate-400">
                Semanal: <span className="font-bold text-slate-300">
                  {faltaPara80 <= 0 ? '0,00 €' : `${ritmoSemanal80.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}
                </span>
              </p>
            </div>

            {/* Card 3: Ritmo para 100% */}
            <div className="backdrop-blur-md bg-[#0f172a]/80 border border-[#1e293b] rounded-2xl p-5 text-center space-y-2 shadow-lg flex flex-col justify-center items-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Ritmo para 100%
              </p>

              <div className="space-y-0.5">
                <p className="text-[11px] text-slate-400 font-medium">Venta Diaria Necesaria:</p>
                <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {faltaPara100 <= 0 ? (
                    <span className="text-emerald-400 text-xl font-extrabold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-5 h-5" /> ¡Completado!
                    </span>
                  ) : (
                    `${ritmoDiario100.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
                  )}
                </p>
              </div>

              <p className="text-xs font-medium text-slate-400">
                Semanal: <span className="font-bold text-slate-300">
                  {faltaPara100 <= 0 ? '0,00 €' : `${ritmoSemanal100.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección Información Adicional: Tabla Oficial de Incentivos y Objetivos */}
      <div className="backdrop-blur-md p-6 sm:p-8 rounded-3xl bg-[#0f172a]/70 border border-[#1e293b] space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Información Adicional: Tabla de Incentivos Drasanvi</span>
              </h3>
              <p className="text-xs text-slate-400">Escala de bonus por ratio de cumplimiento (R/O Mes)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Input oculto para cambiar la imagen */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all shadow-sm"
              title="Subir una nueva imagen de objetivos para actualizar la tabla"
            >
              <Upload className="w-3.5 h-3.5 text-pink-400" />
              <span>Cambiar Imagen</span>
            </button>

            {incentiveImage !== '/tabla-incentivos.png' && (
              <button
                onClick={handleResetImage}
                className="px-3 py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all"
                title="Restablecer a la imagen por defecto"
              >
                Restablecer
              </button>
            )}

            <button
              onClick={() => setIsImageModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold rounded-xl border border-indigo-500/30 transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Ver Grande</span>
            </button>
          </div>
        </div>

        {/* Display Container de la Imagen */}
        <div className="relative rounded-2xl overflow-hidden bg-white/95 p-4 sm:p-6 shadow-inner border border-slate-300 max-w-2xl mx-auto flex items-center justify-center group cursor-pointer"
             onClick={() => setIsImageModalOpen(true)}>
          <img
            src={incentiveImage}
            alt="Tabla de Incentivos Drasanvi"
            className="w-full h-auto max-h-[500px] object-contain rounded-lg transition-transform group-hover:scale-[1.01]"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 bg-[#0f172a]/90 text-white text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-md transition-opacity shadow-lg">
              🔍 Clic para ampliar
            </span>
          </div>
        </div>
      </div>

      {/* Modal Zoom Imagen Completa */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setIsImageModalOpen(false)}>
          <div className="relative max-w-3xl w-full bg-white rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>🌸 Tabla de Incentivos Drasanvi</span>
              </h4>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto flex items-center justify-center">
              <img
                src={incentiveImage}
                alt="Tabla de Incentivos Drasanvi Ampliada"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
