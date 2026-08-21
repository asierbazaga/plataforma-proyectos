import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Wallet, 
  ShieldAlert, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowLeft,
  Target,
  PiggyBank,
  Building,
  Users,
  Calendar,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit2,
  Percent,
  Coins,
  ArrowRight,
  Filter
} from 'lucide-react';
import { ExpenseItem, SavingsGoal, WalletAccount } from '../../types';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';

interface GastosAppProps {
  onBack?: () => void;
}

export const GastosApp: React.FC<GastosAppProps> = ({ onBack }) => {
  const { canEditApp, currentUser } = useAuth();
  const canEdit = canEditApp('gastos');

  // Sub-pestañas: Movimientos / Cuentas vs Objetivos de Ahorro
  const [activeTab, setActiveTab] = useState<'movements' | 'goals'>('movements');

  // Filtro de Cartera Activa: 'all' | 'abanca' | 'ing'
  const [selectedWallet, setSelectedWallet] = useState<'all' | WalletAccount>('all');

  // Datos
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);

  // Modales
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState<number | string>('');

  // Formulario Transacción
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('Alimentación');
  const [transactionAccount, setTransactionAccount] = useState<WalletAccount>('abanca');

  // Formulario Objetivo de Ahorro
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTargetAmount, setGoalTargetAmount] = useState<number | string>('');
  const [goalCurrentAmount, setGoalCurrentAmount] = useState<number | string>('');
  const [goalAccount, setGoalAccount] = useState<'abanca' | 'ing' | 'global'>('ing');
  const [goalDate, setGoalDate] = useState('');
  const [goalNotes, setGoalNotes] = useState('');

  const loadData = async () => {
    const list = await storageService.getExpenses();
    const goalsList = await storageService.getSavingsGoals();
    setExpenses(list);
    setGoals(goalsList);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Guardar nueva transacción
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    await storageService.addExpense({
      description: description.trim(),
      amount: Number(amount),
      type,
      category,
      account: transactionAccount,
      transaction_date: new Date().toISOString().split('T')[0]
    });

    setDescription('');
    setAmount('');
    setShowTransactionModal(false);
    await loadData();
  };

  // Eliminar transacción
  const handleDeleteTransaction = async (id: string) => {
    if (confirm('¿Eliminar este movimiento?')) {
      await storageService.deleteExpense(id);
      await loadData();
    }
  };

  // Guardar nuevo objetivo de ahorro
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim() || !goalTargetAmount) return;

    await storageService.addSavingsGoal({
      title: goalTitle.trim(),
      target_amount: Number(goalTargetAmount),
      current_amount: Number(goalCurrentAmount) || 0,
      account: goalAccount,
      target_date: goalDate || undefined,
      notes: goalNotes.trim() || undefined
    });

    setGoalTitle('');
    setGoalTargetAmount('');
    setGoalCurrentAmount('');
    setGoalNotes('');
    setGoalDate('');
    setShowGoalModal(false);
    await loadData();
  };

  // Aportar dinero a un objetivo existente
  const handleContribute = async (goalId: string) => {
    if (!contributionAmount || Number(contributionAmount) <= 0) return;
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newAmount = goal.current_amount + Number(contributionAmount);
    await storageService.updateSavingsGoal(goalId, { current_amount: newAmount });
    
    setContributeGoalId(null);
    setContributionAmount('');
    await loadData();
  };

  // Eliminar objetivo
  const handleDeleteGoal = async (id: string) => {
    if (confirm('¿Eliminar esta meta de ahorro?')) {
      await storageService.deleteSavingsGoal(id);
      await loadData();
    }
  };

  // Filtro de movimientos según cartera seleccionada
  const filteredExpenses = expenses.filter(e => {
    if (selectedWallet === 'all') return true;
    return (e.account || 'abanca') === selectedWallet;
  });

  // Cálculos por Cartera
  // 1. Abanca Personal
  const abancaIncome = expenses.filter(e => (e.account || 'abanca') === 'abanca' && e.type === 'income').reduce((acc, c) => acc + c.amount, 0);
  const abancaExpense = expenses.filter(e => (e.account || 'abanca') === 'abanca' && e.type === 'expense').reduce((acc, c) => acc + c.amount, 0);
  const abancaBalance = abancaIncome - abancaExpense;

  // 2. ING Conjunta (con Lore)
  const ingIncome = expenses.filter(e => e.account === 'ing' && e.type === 'income').reduce((acc, c) => acc + c.amount, 0);
  const ingExpense = expenses.filter(e => e.account === 'ing' && e.type === 'expense').reduce((acc, c) => acc + c.amount, 0);
  const ingBalance = ingIncome - ingExpense;

  // 3. Totales Filtrados
  const totalIncome = filteredExpenses.filter(e => e.type === 'income').reduce((acc, c) => acc + c.amount, 0);
  const totalExpense = filteredExpenses.filter(e => e.type === 'expense').reduce((acc, c) => acc + c.amount, 0);
  const netBalance = totalIncome - totalExpense;

  // Totales de Objetivos
  const totalTargetGoals = goals.reduce((acc, g) => acc + g.target_amount, 0);
  const totalSavedGoals = goals.reduce((acc, g) => acc + g.current_amount, 0);
  const totalGoalsPct = totalTargetGoals > 0 ? (totalSavedGoals / totalTargetGoals) * 100 : 0;

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* Header Principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-5 sm:p-6 rounded-3xl border border-emerald-500/20">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              title="Volver al Catálogo"
              className="p-3 rounded-2xl bg-slate-800/90 hover:bg-emerald-600 hover:text-white text-slate-300 border border-slate-700 hover:border-emerald-400 transition-all flex items-center justify-center group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0 ring-1 ring-white/20">
            <DollarSign className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">APP GASTOS Y FINANZAS</h1>
              <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Multi-Cartera
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Control de Cartera Personal Abanca, Cartera Conjunta ING y Metas de Ahorro.
            </p>
          </div>
        </div>

        {/* Acciones Rápidas Superior */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {canEdit && (
            <>
              <button
                onClick={() => setShowGoalModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-purple-600 text-white font-bold text-xs rounded-xl border border-slate-700 hover:border-purple-400 transition-all shadow-md"
              >
                <Target className="w-4 h-4 text-purple-400 group-hover:text-white" />
                <span>Nuevo Objetivo</span>
              </button>

              <button
                onClick={() => setShowTransactionModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Transacción</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Subnavegación de Pestañas: 1. Movimientos & Cuentas | 2. Objetivos de Ahorro */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('movements')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'movements'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Movimientos & Cuentas</span>
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'goals'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            <span>Objetivos & Metas de Ahorro</span>
            {goals.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black text-white">
                {goals.length}
              </span>
            )}
          </button>
        </div>

        {/* Selector de Cartera Activa (Píldoras) */}
        {activeTab === 'movements' && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedWallet('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedWallet === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({expenses.length})
            </button>
            <button
              onClick={() => setSelectedWallet('abanca')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                selectedWallet === 'abanca'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Abanca Personal</span>
            </button>
            <button
              onClick={() => setSelectedWallet('ing')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                selectedWallet === 'ing'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>ING Conjunta (Lore)</span>
            </button>
          </div>
        )}
      </div>

      {/* VISTA 1: MOVIMIENTOS & CUENTAS */}
      {activeTab === 'movements' && (
        <div className="space-y-6">
          {/* Tarjetas de Carteras (Abanca vs ING vs Total) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Cartera Personal Abanca */}
            <div 
              onClick={() => setSelectedWallet('abanca')}
              className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                selectedWallet === 'abanca'
                  ? 'bg-gradient-to-br from-indigo-950/60 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/15 ring-1 ring-indigo-500'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                    🏦
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Abanca Personal</h3>
                    <p className="text-[10px] text-slate-400">Cuenta de Asier</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  Personal
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-400">Saldo Disponible</p>
                <p className={`text-2xl font-black ${abancaBalance >= 0 ? 'text-indigo-300' : 'text-rose-400'}`}>
                  {abancaBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </p>
              </div>

              <div className="flex justify-between items-center text-[11px] pt-3 mt-3 border-t border-slate-800 text-slate-400">
                <span>Ing: <b className="text-emerald-400">+{abancaIncome.toFixed(0)}€</b></span>
                <span>Gas: <b className="text-rose-400">-{abancaExpense.toFixed(0)}€</b></span>
              </div>
            </div>

            {/* 2. Cartera Conjunta ING (Lore) */}
            <div 
              onClick={() => setSelectedWallet('ing')}
              className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                selectedWallet === 'ing'
                  ? 'bg-gradient-to-br from-orange-950/60 to-slate-900 border-orange-500 shadow-xl shadow-orange-500/15 ring-1 ring-orange-500'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-600/30 text-orange-400 flex items-center justify-center font-bold text-xs border border-orange-500/30">
                    🤝
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">ING Conjunta</h3>
                    <p className="text-[10px] text-slate-400">Asier & Lore</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">
                  Compartida
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-400">Saldo Disponible</p>
                <p className={`text-2xl font-black ${ingBalance >= 0 ? 'text-orange-300' : 'text-rose-400'}`}>
                  {ingBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </p>
              </div>

              <div className="flex justify-between items-center text-[11px] pt-3 mt-3 border-t border-slate-800 text-slate-400">
                <span>Ing: <b className="text-emerald-400">+{ingIncome.toFixed(0)}€</b></span>
                <span>Gas: <b className="text-rose-400">-{ingExpense.toFixed(0)}€</b></span>
              </div>
            </div>

            {/* 3. Balance Total Combinado */}
            <div 
              onClick={() => setSelectedWallet('all')}
              className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                selectedWallet === 'all'
                  ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/15 ring-1 ring-emerald-500'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                    💰
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Patrimonio Global</h3>
                    <p className="text-[10px] text-slate-400">Suma de Ambas Cuentas</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Total
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-400">Balance Neto Total</p>
                <p className={`text-2xl font-black ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {netBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </p>
              </div>

              <div className="flex justify-between items-center text-[11px] pt-3 mt-3 border-t border-slate-800 text-slate-400">
                <span>Ing: <b className="text-emerald-400">+{totalIncome.toFixed(0)}€</b></span>
                <span>Gas: <b className="text-rose-400">-{totalExpense.toFixed(0)}€</b></span>
              </div>
            </div>
          </div>

          {/* Tabla de Movimientos */}
          <div className="glass-panel bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>Movimientos {selectedWallet === 'abanca' ? '• Abanca Personal' : selectedWallet === 'ing' ? '• ING Conjunta' : '• Todas las Cuentas'}</span>
              </h2>
              <span className="text-xs font-semibold text-slate-400">
                {filteredExpenses.length} movimientos
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Concepto</th>
                    <th className="py-3 px-4">Cartera / Cuenta</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4 text-right">Importe</th>
                    {canEdit && <th className="py-3 px-4 text-center">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                        No hay movimientos registrados en esta cuenta. Pulsa "+ Nueva Transacción" para añadir uno.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map(item => {
                      const isAbanca = (item.account || 'abanca') === 'abanca';
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                          <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                            {item.type === 'income' ? (
                              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                                <ArrowUpRight className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 flex-shrink-0">
                                <ArrowDownRight className="w-4 h-4" />
                              </span>
                            )}
                            <span>{item.description}</span>
                          </td>

                          {/* Cuenta asignada */}
                          <td className="py-3 px-4">
                            {isAbanca ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                                <span>🏦</span> Abanca Personal
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-950/60 border border-orange-500/30 text-orange-300 text-xs font-bold">
                                <span>🤝</span> ING Conjunta
                              </span>
                            )}
                          </td>

                          {/* Categoría */}
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs border border-slate-700/60">
                              {item.category}
                            </span>
                          </td>

                          {/* Fecha */}
                          <td className="py-3 px-4 text-xs text-slate-400">{item.transaction_date}</td>

                          {/* Importe */}
                          <td className={`py-3 px-4 text-right font-black ${item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {item.type === 'income' ? '+' : '-'}{item.amount.toFixed(2)} €
                          </td>

                          {/* Acciones */}
                          {canEdit && (
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleDeleteTransaction(item.id)}
                                title="Eliminar transacción"
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: PANEL DE METAS Y OBJETIVOS DE AHORRO ("HUCHA DE METAS") */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          {/* Banner Resumen de Metas */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-pink-950/30 border border-purple-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                  Hucha de Objetivos Financieros
                </span>
                <h2 className="text-2xl font-black text-white mt-1">Metas & Ahorro Acumulado</h2>
                <p className="text-xs text-slate-400">
                  Controla cuánto necesitas para cada meta y registra tus aportaciones periódicas.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs font-bold text-slate-400 uppercase">Ahorrado / Total Metas</p>
                <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {totalSavedGoals.toLocaleString('es-ES')} € / {totalTargetGoals.toLocaleString('es-ES')} €
                </p>
                <p className="text-xs font-bold text-emerald-400 mt-0.5">{totalGoalsPct.toFixed(1)}% Conseguido</p>
              </div>
            </div>

            {/* Barra Global de Ahorro */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, totalGoalsPct))}%` }}
              />
            </div>
          </div>

          {/* Grid de Tarjetas de Objetivos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {goals.map(goal => {
              const pct = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
              const remaining = Math.max(0, goal.target_amount - goal.current_amount);
              const isCompleted = goal.current_amount >= goal.target_amount;

              return (
                <div 
                  key={goal.id}
                  className={`p-6 rounded-3xl border transition-all space-y-5 relative overflow-hidden ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/50 shadow-xl shadow-emerald-500/10' 
                      : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {goal.account === 'abanca' ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            🏦 Abanca Personal
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                            🤝 ING Conjunta
                          </span>
                        )}

                        {isCompleted && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> ¡Completado!
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-black text-white tracking-tight pt-1">
                        {goal.title}
                      </h3>
                      {goal.notes && (
                        <p className="text-xs text-slate-400">{goal.notes}</p>
                      )}
                    </div>

                    {canEdit && (
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-slate-600 hover:text-rose-400 p-1 rounded-lg transition-colors"
                        title="Eliminar meta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Cifras: Precio vs Ahorrado */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 text-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Precio / Meta</p>
                      <p className="text-base font-black text-white">{goal.target_amount.toLocaleString('es-ES')} €</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-400 uppercase">Ahorrado</p>
                      <p className="text-base font-black text-emerald-400">{goal.current_amount.toLocaleString('es-ES')} €</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Falta</p>
                      <p className="text-base font-black text-slate-300">{remaining.toLocaleString('es-ES')} €</p>
                    </div>
                  </div>

                  {/* Barra de Progreso Individual */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Progreso conseguido</span>
                      <span className={isCompleted ? 'text-emerald-400' : 'text-purple-400'}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                            : 'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                      />
                    </div>
                  </div>

                  {/* Botón de Aportación Rápida */}
                  {canEdit && (
                    <div className="pt-2 border-t border-slate-800/80">
                      {contributeGoalId === goal.id ? (
                        <div className="flex items-center gap-2 animate-fadeIn">
                          <input
                            type="number"
                            step="10"
                            placeholder="Importe a sumar (+€)"
                            value={contributionAmount}
                            onChange={e => setContributionAmount(e.target.value)}
                            className="flex-1 bg-slate-800 border border-purple-500/50 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleContribute(goal.id)}
                            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-md"
                          >
                            Sumar
                          </button>
                          <button
                            onClick={() => { setContributeGoalId(null); setContributionAmount(''); }}
                            className="px-2.5 py-2 text-slate-400 hover:text-white text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 font-medium">
                            {goal.target_date ? `Fecha prevista: ${goal.target_date}` : 'Sin fecha límite'}
                          </span>
                          <button
                            onClick={() => { setContributeGoalId(goal.id); setContributionAmount(50); }}
                            className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <Coins className="w-3.5 h-3.5" />
                            <span>+ Aportar Dinero</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: NUEVA TRANSACCIÓN (Con selector de Abanca vs ING) */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-fadeIn">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>Registrar Movimiento</span>
            </h3>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              {/* Cartera / Cuenta Asignada */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cartera / Cuenta</label>
                <div className="grid grid-cols-2 gap-2.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setTransactionAccount('abanca')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      transactionAccount === 'abanca'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <span>🏦 Abanca Personal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionAccount('ing')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      transactionAccount === 'ing'
                        ? 'bg-orange-600 text-white border-orange-500 shadow-md'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <span>🤝 ING Conjunta</span>
                  </button>
                </div>
              </div>

              {/* Tipo: Gasto o Ingreso */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo</label>
                <div className="grid grid-cols-2 gap-2.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      type === 'expense'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Gasto (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      type === 'income'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Ingreso (+)
                  </button>
                </div>
              </div>

              {/* Concepto */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Concepto / Descripción</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Supermercado, Alquiler, Restaurante..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm font-semibold"
                />
              </div>

              {/* Importe y Categoría */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Importe (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categoría</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
                  >
                    <option value="Alimentación">Alimentación</option>
                    <option value="Hogar / Alquiler">Hogar / Alquiler</option>
                    <option value="Tecnología">Tecnología</option>
                    <option value="Servicios / Suministros">Servicios</option>
                    <option value="Transporte / Gasolina">Transporte</option>
                    <option value="Ocio & Restaurantes">Ocio</option>
                    <option value="Salud & Bienestar">Salud</option>
                    <option value="Ahorro/Común">Ahorro</option>
                    <option value="Nómina / Ingresos">Nómina</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO OBJETIVO DE AHORRO */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-fadeIn">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              <span>Marcar Nuevo Objetivo de Ahorro</span>
            </h3>

            <form onSubmit={handleAddGoal} className="space-y-4">
              {/* Título del Objetivo */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre del Objetivo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Vacaciones de Verano, Coche, Fondo Emergencia..."
                  value={goalTitle}
                  onChange={e => setGoalTitle(e.target.value)}
                  className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-semibold"
                />
              </div>

              {/* Precio / Meta Total (€) y Aportación Inicial */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Precio / Meta (€)</label>
                  <input
                    type="number"
                    step="10"
                    required
                    placeholder="Ej. 3000"
                    value={goalTargetAmount}
                    onChange={e => setGoalTargetAmount(e.target.value)}
                    className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aportado Hoy (€)</label>
                  <input
                    type="number"
                    step="10"
                    placeholder="0"
                    value={goalCurrentAmount}
                    onChange={e => setGoalCurrentAmount(e.target.value)}
                    className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-bold text-emerald-400"
                  />
                </div>
              </div>

              {/* Cuenta Asignada */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cuenta Asociada</label>
                <div className="grid grid-cols-2 gap-2.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setGoalAccount('ing')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      goalAccount === 'ing'
                        ? 'bg-orange-600 text-white border-orange-500 shadow-md'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <span>🤝 ING Conjunta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoalAccount('abanca')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      goalAccount === 'abanca'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <span>🏦 Abanca Personal</span>
                  </button>
                </div>
              </div>

              {/* Fecha Prevista */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha Prevista (Opcional)</label>
                <input
                  type="date"
                  value={goalDate}
                  onChange={e => setGoalDate(e.target.value)}
                  className="w-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/25"
                >
                  Crear Meta de Ahorro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
