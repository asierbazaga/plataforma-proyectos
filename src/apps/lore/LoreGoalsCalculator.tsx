import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Calendar, 
  Award, 
  CheckCircle2, 
  DollarSign, 
  Plus, 
  RefreshCw, 
  Sparkles, 
  Target, 
  Hourglass, 
  Zap,
  ArrowUpRight,
  HelpCircle,
  Percent,
  Layers,
  History,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoreGoalsData {
  objetivoMensual: number;
  ventaAcumulada: number;
  diasLaborablesRestantes: number;
  salesLog: { id: string; amount: number; description: string; date: string }[];
}

export const LoreGoalsCalculator: React.FC = () => {
  const { canEditApp } = useAuth();
  const canEdit = canEditApp('lore');

  // Calcular días laborables restantes por defecto (Lunes a Viernes hasta fin de mes)
  const calculateDefaultWorkDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    let workDays = 0;

    for (let day = today.getDate(); day <= lastDay; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workDays++;
      }
    }
    return workDays > 0 ? workDays : 21;
  };

  // Cargar estado inicial persistente
  const [objetivoMensual, setObjetivoMensual] = useState<number>(() => {
    const saved = localStorage.getItem('lore_goal_objetivo');
    return saved ? Number(saved) : 15000;
  });

  const [ventaAcumulada, setVentaAcumulada] = useState<number>(() => {
    const saved = localStorage.getItem('lore_goal_venta');
    return saved ? Number(saved) : 0;
  });

  const [diasLaborablesRestantes, setDiasLaborablesRestantes] = useState<number>(() => {
    const saved = localStorage.getItem('lore_goal_dias');
    return saved ? Number(saved) : calculateDefaultWorkDays();
  });

  const [salesHistory, setSalesHistory] = useState<{ id: string; amount: number; description: string; date: string }[]>(() => {
    const saved = localStorage.getItem('lore_goal_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Modal para registrar una venta rápida
  const [showAddSaleModal, setShowAddSaleModal] = useState(false);
  const [newSaleAmount, setNewSaleAmount] = useState<number | string>('');
  const [newSaleDesc, setNewSaleDesc] = useState('');

  // Guardar en localStorage ante cualquier cambio
  useEffect(() => {
    localStorage.setItem('lore_goal_objetivo', String(objetivoMensual));
    localStorage.setItem('lore_goal_venta', String(ventaAcumulada));
    localStorage.setItem('lore_goal_dias', String(diasLaborablesRestantes));
    localStorage.setItem('lore_goal_history', JSON.stringify(salesHistory));
  }, [objetivoMensual, ventaAcumulada, diasLaborablesRestantes, salesHistory]);

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

  // Función para registrar venta rápida al acumulado
  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(newSaleAmount);
    if (!amount || isNaN(amount) || amount <= 0) return;

    const newRecord = {
      id: `sale_${Date.now()}`,
      amount,
      description: newSaleDesc.trim() || 'Venta Drasanvi',
      date: new Date().toLocaleDateString('es-ES')
    };

    setVentaAcumulada(prev => prev + amount);
    setSalesHistory(prev => [newRecord, ...prev]);
    setNewSaleAmount('');
    setNewSaleDesc('');
    setShowAddSaleModal(false);
  };

  const handleReset = () => {
    if (window.confirm('¿Deseas reiniciar los valores del mes a los valores iniciales?')) {
      setObjetivoMensual(15000);
      setVentaAcumulada(0);
      setDiasLaborablesRestantes(calculateDefaultWorkDays());
      setSalesHistory([]);
    }
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
                Calculadora & Control de Objetivos de Venta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddSaleModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-pink-500/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Sumar Venta</span>
            </button>

            <button
              onClick={handleReset}
              title="Reiniciar valores"
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
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
                  onChange={(e) => setObjetivoMensual(Number(e.target.value) || 0)}
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
                  onChange={(e) => setVentaAcumulada(Number(e.target.value) || 0)}
                  className="w-full bg-[#1A2E35]/70 hover:bg-[#1A2E35] focus:bg-[#1A2E35] border border-emerald-500/30 focus:border-emerald-400 text-emerald-300 font-extrabold text-base rounded-2xl px-4 py-3 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Input 3: Días Laborables Restantes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Días Laborables Restantes</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={diasLaborablesRestantes}
                  onChange={(e) => setDiasLaborablesRestantes(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-[#1A2E35]/70 hover:bg-[#1A2E35] focus:bg-[#1A2E35] border border-emerald-500/30 focus:border-emerald-400 text-emerald-300 font-extrabold text-base rounded-2xl px-4 py-3 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Enhanced Progress Bar with 80% Bono and 100% Goal Threshold Markers */}
          <div className="space-y-2 pt-2">
            <div className="relative w-full h-8 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-inner flex items-center">
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
                <span className="absolute -top-0.5 right-2 text-[10px] font-bold text-purple-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-purple-500/40 whitespace-nowrap">
                  Bono 80% ({metaBono80.toLocaleString('es-ES')} €)
                </span>
              </div>
            </div>
          </div>

          {/* 3 Outcome Cards (Estado Actual, Ritmo para Bono 80%, Ritmo para 100%) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Card 1: Estado Actual */}
            <div className="glass-panel bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center space-y-2 shadow-lg flex flex-col justify-center items-center">
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
            <div className="glass-panel bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center space-y-2 shadow-lg flex flex-col justify-center items-center">
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
            <div className="glass-panel bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center space-y-2 shadow-lg flex flex-col justify-center items-center">
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

      {/* Historial de Ventas / Registro Rápido */}
      {salesHistory.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-pink-400" />
              Historial de Ventas Registradas
            </h3>
            <span className="text-xs text-slate-400">{salesHistory.length} registros</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {salesHistory.map(sale => (
              <div key={sale.id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-white">{sale.description}</p>
                  <p className="text-[10px] text-slate-500">{sale.date}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400">
                    +{sale.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Sumar Venta */}
      {showAddSaleModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Sumar Venta al Acumulado</h3>
                <p className="text-xs text-slate-400">Se agregará directamente a tu total mensual</p>
              </div>
            </div>

            <form onSubmit={handleAddSale} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400">Importe de la Venta (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  autoFocus
                  placeholder="Ej. 350.00"
                  value={newSaleAmount}
                  onChange={e => setNewSaleAmount(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Concepto / Cliente</label>
                <input
                  type="text"
                  placeholder="Ej. Pedido Farmacia Central"
                  value={newSaleDesc}
                  onChange={e => setNewSaleDesc(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-pink-500 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSaleModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold rounded-xl hover:shadow-lg shadow-pink-500/20"
                >
                  Sumar al Total
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
