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
  Filter,
  CreditCard,
  Layers
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

  // Sub-pestañas: Movimientos & Cuentas vs Objetivos de Ahorro
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
    <div className="space-y-4 sm:space-y-6 pb-12 font-sans">
      {/* Header Principal Adaptable a Móvil */}
      <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900/90 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-emerald-500/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                title="Volver al Catálogo"
                className="p-2 sm:p-2.5 rounded-xl bg-slate-800/90 hover:bg-emerald-600 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center justify-center flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0 ring-1 ring-white/20">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-xl font-black text-white tracking-tight">GASTOS & FINANZAS</h1>
                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Multi-Cartera
                </span>
              </div>
              <p className="text-slate-400 text-[11px] sm:text-xs">
                Abanca Personal • ING Conjunta • Metas de Ahorro
              </p>
            </div>
          </div>
        </div>

        {/* Acciones Móviles en 2 Columnas o Fila */}
        {canEdit && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setShowGoalModal(true)}
              className="py-2.5 px-3 bg-slate-800 hover:bg-purple-600 text-white font-bold text-xs rounded-xl border border-slate-700 hover:border-purple-400 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <Target className="w-3.5 h-3.5 text-purple-400" />
              <span>+ Objetivo</span>
            </button>

            <button
              onClick={() => setShowTransactionModal(true)}
              className="py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Movimiento</span>
            </button>
          </div>
        )}
      </div>

      {/* Subnavegación Principal: Pestañas de Vista */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('movements')}
          className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'movements'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Movimientos ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('goals')}
          className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'goals'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PiggyBank className="w-3.5 h-3.5" />
          <span>Metas Ahorro ({goals.length})</span>
        </button>
      </div>

      {/* Selector de Cartera Activa (Píldoras con scroll horizontal en móvil) */}
      {activeTab === 'movements' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
          <button
            onClick={() => setSelectedWallet('all')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1.5 ${
              selectedWallet === 'all'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Todas las Cuentas</span>
          </button>

          <button
            onClick={() => setSelectedWallet('abanca')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1.5 ${
              selectedWallet === 'abanca'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-500'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <span>🏦</span>
            <span>Abanca Personal</span>
          </button>

          <button
            onClick={() => setSelectedWallet('ing')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1.5 ${
              selectedWallet === 'ing'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20 border border-orange-500'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <span>🤝</span>
            <span>ING Conjunta (Lore)</span>
          </button>
        </div>
      )}

      {/* VISTA 1: MOVIMIENTOS & CUENTAS */}
      {activeTab === 'movements' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Tarjetas de Saldos de Carteras (Grid adaptable) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Abanca Personal */}
            <div 
              onClick={() => setSelectedWallet('abanca')}
              className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all cursor-pointer relative overflow-hidden active:scale-[0.99] ${
                selectedWallet === 'abanca'
                  ? 'bg-gradient-to-br from-indigo-950/70 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/15'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                    🏦
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Abanca Personal</h3>
                  </div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  Asier
                </span>
              </div>

              <div className="space-y-0.5">
                <p className="text-[11px] text-slate-400">Saldo Disponible</p>
                <p className={`text-xl sm:text-2xl font-black ${abancaBalance >= 0 ? 'text-indigo-300' : 'text-rose-400'}`}>
                  {abancaBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </p>
              </div>

              <div className="flex justify-between items-center text-[10px] sm:text-[11px] pt-2 mt-2 border-t border-slate-800 text-slate-400">
                <span>Ing: <b className="text-emerald-400">+{abancaIncome.toFixed(0)}€</b></span>
                <span>Gas: <b className="text-rose-400">-{abancaExpense.toFixed(0)}€</b></span>
              </div>
            </div>

            {/* 2. ING Conjunta (con Lore) */}
            <div 
              onClick={() => setSelectedWallet('ing')}
              className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all cursor-pointer relative overflow-hidden active:scale-[0.99] ${
                selectedWallet === 'ing'
                  ? 'bg-gradient-to-br from-orange-950/70 to-slate-900 border-orange-500 shadow-xl shadow-orange-500/15'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-600/30 text-orange-300 flex items-center justify-center font-bold text-xs border border-orange-500/30">
                    🤝
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">ING Conjunta</h3>
                  </div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">
                  Común
                </span>
              </div>

              <div className="space-y-0.5">
                <p className="text-[11px] text-slate-400">Saldo Disponible</p>
                <p className={`text-xl sm:text-2xl font-black ${ingBalance >= 0 ? 'text-orange-300' : 'text-rose-400'}`}>
                  {ingBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </p>
              </div>

              <div className="flex justify-between items-center text-[10px] sm:text-[11px] pt-2 mt-2 border-t border-slate-800 text-slate-400">
                <span>Ing: <b className="text-emerald-400">+{ingIncome.toFixed(0)}€</b></span>
                <span>Gas: <b className="text-rose-400">-{ingExpense.toFixed(0)}€</b></span>
              </div>
            </div>

            {/* 3. Patrimonio Global */}
            <div 
              onClick={() => setSelectedWallet('all')}
              className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all cursor-pointer relative overflow-hidden active:scale-[0.99] ${
                selectedWallet === 'all'
                  ? 'bg-gradient-to-br from-emerald-950/70 to-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/15'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600/30 text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                    💰
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Patrimonio Global</h3>
                  </div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Total
                </span>
              </div>

              <div className="space-y-0.5">
                <p className="text-[11px] text-slate-400">Balance Neto Total</p>
                <p className={`text-xl sm:text-2xl font-black ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {netBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </p>
              </div>

              <div className="flex justify-between items-center text-[10px] sm:text-[11px] pt-2 mt-2 border-t border-slate-800 text-slate-400">
                <span>Ing: <b className="text-emerald-400">+{totalIncome.toFixed(0)}€</b></span>
                <span>Gas: <b className="text-rose-400">-{totalExpense.toFixed(0)}€</b></span>
              </div>
            </div>
          </div>

          {/* LISTA DE MOVIMIENTOS: FEED MÓVIL ESTILO APP BANCARIA (sm:hidden) */}
          <div className="sm:hidden space-y-2.5">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-slate-300">
                Historial de Movimientos ({filteredExpenses.length})
              </span>
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-500 text-xs">
                No hay movimientos registrados en esta cuenta.
              </div>
            ) : (
              filteredExpenses.map(item => {
                const isAbanca = (item.account || 'abanca') === 'abanca';
                const isIncome = item.type === 'income';

                return (
                  <div 
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isIncome ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.description}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isAbanca ? 'bg-indigo-500/20 text-indigo-300' : 'bg-orange-500/20 text-orange-300'
                          }`}>
                            {isAbanca ? 'Abanca' : 'ING'}
                          </span>
                          <span className="text-[10px] text-slate-500">•</span>
                          <span className="text-[10px] text-slate-400">{item.category}</span>
                          <span className="text-[10px] text-slate-500">•</span>
                          <span className="text-[10px] text-slate-500">{item.transaction_date.slice(5)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className={`text-xs font-black ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isIncome ? '+' : '-'}{item.amount.toFixed(2)} €
                      </p>
                      {canEdit && (
                        <button
                          onClick={() => handleDeleteTransaction(item.id)}
                          className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* TABLA DE MOVIMIENTOS EN ESCRITORIO / TABLET (hidden sm:block) */}
          <div className="hidden sm:block glass-panel bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 space-y-4 shadow-xl">
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
                        No hay movimientos registrados en esta cuenta.
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
        <div className="space-y-4 sm:space-y-6">
          {/* Banner Resumen de Metas */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-pink-950/30 border border-purple-500/30 space-y-3 sm:space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                  Hucha de Objetivos
                </span>
                <h2 className="text-lg sm:text-2xl font-black text-white mt-1">Metas & Ahorro Acumulado</h2>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Ahorrado / Total</p>
                <p className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {totalSavedGoals.toLocaleString('es-ES')} € / {totalTargetGoals.toLocaleString('es-ES')} €
                </p>
                <p className="text-[11px] font-bold text-emerald-400">{totalGoalsPct.toFixed(1)}% Conseguido</p>
              </div>
            </div>

            {/* Barra Global de Ahorro */}
            <div className="w-full h-2.5 sm:h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, totalGoalsPct))}%` }}
              />
            </div>
          </div>

          {/* Grid de Tarjetas de Objetivos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
            {goals.map(goal => {
              const pct = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
              const remaining = Math.max(0, goal.target_amount - goal.current_amount);
              const isCompleted = goal.current_amount >= goal.target_amount;

              return (
                <div 
                  key={goal.id}
                  className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all space-y-4 relative overflow-hidden shadow-lg ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/50' 
                      : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        {goal.account === 'abanca' ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            🏦 Abanca
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                            🤝 ING Conjunta
                          </span>
                        )}

                        {isCompleted && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> ¡Completado!
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-xl font-black text-white tracking-tight pt-0.5">
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
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-slate-950/60 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-800/80 text-center">
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">Precio / Meta</p>
                      <p className="text-xs sm:text-base font-black text-white">{goal.target_amount.toLocaleString('es-ES')} €</p>
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase">Ahorrado</p>
                      <p className="text-xs sm:text-base font-black text-emerald-400">{goal.current_amount.toLocaleString('es-ES')} €</p>
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">Falta</p>
                      <p className="text-xs sm:text-base font-black text-slate-300">{remaining.toLocaleString('es-ES')} €</p>
                    </div>
                  </div>

                  {/* Barra de Progreso Individual */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 text-[11px]">Progreso</span>
                      <span className={`text-[11px] ${isCompleted ? 'text-emerald-400' : 'text-purple-400'}`}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2 sm:h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
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
                        <div className="flex items-center gap-1.5 animate-fadeIn">
                          <input
                            type="number"
                            step="10"
                            placeholder="Aportar (+€)"
                            value={contributionAmount}
                            onChange={e => setContributionAmount(e.target.value)}
                            className="flex-1 bg-slate-800 border border-purple-500/50 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleContribute(goal.id)}
                            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-md flex-shrink-0"
                          >
                            Sumar
                          </button>
                          <button
                            onClick={() => { setContributeGoalId(null); setContributionAmount(''); }}
                            className="px-2 py-2 text-slate-400 hover:text-white text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-medium">
                            {goal.target_date ? `Meta: ${goal.target_date}` : 'Sin fecha'}
                          </span>
                          <button
                            onClick={() => { setContributeGoalId(goal.id); setContributionAmount(50); }}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95"
                          >
                            <Coins className="w-3.5 h-3.5" />
                            <span>+ Aportar</span>
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

      {/* MODAL: NUEVA TRANSACCIÓN (Bottom Sheet en móvil) */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>Registrar Movimiento</span>
            </h3>

            <form onSubmit={handleAddTransaction} className="space-y-3 sm:space-y-4">
              {/* Cartera / Cuenta Asignada */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cartera / Cuenta</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setTransactionAccount('abanca')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      transactionAccount === 'abanca'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <span>🏦 Abanca</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionAccount('ing')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
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
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tipo</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
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
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Concepto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Supermercado, Gasolina, Alquiler..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs sm:text-sm font-semibold"
                />
              </div>

              {/* Importe y Categoría */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Importe (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Categoría</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs sm:text-sm"
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

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO OBJETIVO DE AHORRO (Bottom Sheet en móvil) */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              <span>Marcar Nuevo Objetivo de Ahorro</span>
            </h3>

            <form onSubmit={handleAddGoal} className="space-y-3 sm:space-y-4">
              {/* Título del Objetivo */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nombre del Objetivo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Vacaciones, Coche, Fondo Emergencia..."
                  value={goalTitle}
                  onChange={e => setGoalTitle(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-500 text-xs sm:text-sm font-semibold"
                />
              </div>

              {/* Precio / Meta Total (€) y Aportación Inicial */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Precio / Meta (€)</label>
                  <input
                    type="number"
                    step="10"
                    required
                    placeholder="Ej. 3000"
                    value={goalTargetAmount}
                    onChange={e => setGoalTargetAmount(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aportado Hoy (€)</label>
                  <input
                    type="number"
                    step="10"
                    placeholder="0"
                    value={goalCurrentAmount}
                    onChange={e => setGoalCurrentAmount(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 text-sm font-bold text-emerald-400"
                  />
                </div>
              </div>

              {/* Cuenta Asignada */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cuenta Asociada</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
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
                    <span>🏦 Abanca</span>
                  </button>
                </div>
              </div>

              {/* Fecha Prevista */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fecha Prevista (Opcional)</label>
                <input
                  type="date"
                  value={goalDate}
                  onChange={e => setGoalDate(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-500 text-xs sm:text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/25"
                >
                  Crear Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
