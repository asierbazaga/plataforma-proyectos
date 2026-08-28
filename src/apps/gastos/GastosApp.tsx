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
  Layers,
  RotateCcw,
  PieChart,
  Sliders,
  AlertTriangle,
  Flame,
  Check,
  BarChart3,
  Scale,
  Award,
  X
} from 'lucide-react';
import { ExpenseItem, SavingsGoal, CategoryBudget, WalletAccount, WalletConfig } from '../../types';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';

interface GastosAppProps {
  onBack?: () => void;
}

// Iconos y colores estándar por categoría
const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  'Alimentación': { icon: '🛒', color: '#10B981' },
  'Hogar / Alquiler': { icon: '🏠', color: '#6366F1' },
  'Transporte / Gasolina': { icon: '🚗', color: '#F59E0B' },
  'Ocio & Restaurantes': { icon: '🍿', color: '#EC4899' },
  'Servicios / Suministros': { icon: '⚡', color: '#06B6D4' },
  'Tecnología': { icon: '💻', color: '#8B5CF6' },
  'Salud & Bienestar': { icon: '💊', color: '#14B8A6' },
  'Ahorro/Común': { icon: '💰', color: '#3B82F6' },
  'Otros': { icon: '📦', color: '#64748B' }
};

export const GastosApp: React.FC<GastosAppProps> = ({ onBack }) => {
  const { canEditApp, currentUser } = useAuth();
  const canEdit = canEditApp('gastos');

  // Sub-pestañas: 1. Movimientos & Cuentas | 2. Distribución & Presupuestos | 3. Metas Ahorro
  const [activeTab, setActiveTab] = useState<'movements' | 'analytics' | 'goals'>('movements');

  // Filtro de Cartera Activa: 'all' | 'abanca' | 'ing'
  const [selectedWallet, setSelectedWallet] = useState<'all' | WalletAccount>('all');

  // Configuración de Cartera del Usuario
  const [walletConfig, setWalletConfig] = useState<WalletConfig>({
    account_1_name: 'Cuenta Principal',
    account_1_initial_balance: 0,
    account_2_name: '',
    account_2_initial_balance: 0,
    has_account_2: false,
    onboarding_completed: false
  });

  // Modal de Configuración / Onboarding de Cuentas
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupAcc1Name, setSetupAcc1Name] = useState('');
  const [setupAcc1Balance, setSetupAcc1Balance] = useState<number | string>('');
  const [setupHasAcc2, setSetupHasAcc2] = useState(false);
  const [setupAcc2Name, setSetupAcc2Name] = useState('');
  const [setupAcc2Balance, setSetupAcc2Balance] = useState<number | string>('');

  // Datos
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);

  // Modales
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Modal para editar límite de presupuesto de una categoría
  const [editingBudgetCategory, setEditingBudgetCategory] = useState<string | null>(null);
  const [budgetLimitInput, setBudgetLimitInput] = useState<number | string>('');

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
    const userId = currentUser?.id;
    const [cfg, list, goalsList, budgetsList] = await Promise.all([
      storageService.getWalletConfig(userId),
      storageService.getExpenses(userId),
      storageService.getSavingsGoals(userId),
      storageService.getCategoryBudgets(userId)
    ]);
    setWalletConfig(cfg);
    setExpenses(list);
    setGoals(goalsList);
    setBudgets(budgetsList);

    // Si es un usuario nuevo y no ha configurado sus cuentas ni tiene gastos, lanzar onboarding
    if (!cfg.onboarding_completed && list.length === 0) {
      setSetupAcc1Name(cfg.account_1_name || 'Cuenta Principal');
      setSetupAcc1Balance('');
      setSetupHasAcc2(cfg.has_account_2 ?? false);
      setSetupAcc2Name(cfg.account_2_name || '');
      setSetupAcc2Balance('');
      setShowSetupModal(true);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    loadData();
    storageService.syncFromCloud().then(() => {
      loadData();
    });

    const unsubscribe = storageService.onSync(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [currentUser?.id]);

  const handleOpenAccountConfig = () => {
    setSetupAcc1Name(walletConfig.account_1_name || 'Cuenta Principal');
    setSetupAcc1Balance('');
    setSetupHasAcc2(walletConfig.has_account_2 ?? false);
    setSetupAcc2Name(walletConfig.account_2_name || '');
    setSetupAcc2Balance('');
    setShowSetupModal(true);
  };

  const handleSaveAccountSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = currentUser?.id;
    const acc1 = setupAcc1Name.trim() || 'Cuenta Principal';
    const acc2 = setupHasAcc2 ? (setupAcc2Name.trim() || 'Cuenta Ahorro') : '';

    await storageService.updateWalletConfig({
      account_1_name: acc1,
      account_2_name: acc2,
      has_account_2: setupHasAcc2,
      onboarding_completed: true
    }, userId);

    // Si introduce saldo inicial en cuenta 1 y no existían movimientos
    const cleanAcc1Bal = Number(String(setupAcc1Balance).replace(',', '.'));
    if (cleanAcc1Bal > 0) {
      await storageService.addExpense({
        description: `Saldo Inicial - ${acc1}`,
        amount: cleanAcc1Bal,
        type: 'income',
        category: 'Ahorro/Común',
        account: 'abanca',
        transaction_date: new Date().toISOString().split('T')[0]
      }, userId);
    }

    // Si introduce saldo inicial en cuenta 2 y tiene activa la cuenta 2
    const cleanAcc2Bal = Number(String(setupAcc2Balance).replace(',', '.'));
    if (setupHasAcc2 && cleanAcc2Bal > 0) {
      await storageService.addExpense({
        description: `Saldo Inicial - ${acc2}`,
        amount: cleanAcc2Bal,
        type: 'income',
        category: 'Ahorro/Común',
        account: 'ing',
        transaction_date: new Date().toISOString().split('T')[0]
      }, userId);
    }

    setShowSetupModal(false);
    await loadData();
  };

  // Guardar nueva transacción
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawVal = String(amount).replace(',', '.');
    const parsedAmount = Math.abs(parseFloat(rawVal));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor, introduce un importe numérico válido.');
      return;
    }

    const finalDescription = description.trim() || (type === 'expense' ? 'Gasto' : 'Ingreso');

    const saved = await storageService.addExpense({
      description: finalDescription,
      amount: parsedAmount,
      type,
      category,
      account: transactionAccount,
      transaction_date: new Date().toISOString().split('T')[0]
    }, currentUser?.id);

    // Actualización inmediata optimista en el estado de React
    setExpenses(prev => [saved, ...prev.filter(x => x.id !== saved.id)]);

    setDescription('');
    setAmount('');
    setShowTransactionModal(false);
    await loadData();
  };

  // Eliminar transacción individual
  const handleDeleteTransaction = async (id: string) => {
    if (confirm('¿Eliminar este movimiento?')) {
      setExpenses(prev => prev.filter(e => e.id !== id));
      await storageService.deleteExpense(id, currentUser?.id);
      await loadData();
    }
  };

  // Limpiar todos los movimientos
  const handleClearAllExpenses = async () => {
    if (confirm('¿Estás seguro de que quieres borrar todos los movimientos de tu cartera para empezar desde cero?')) {
      setExpenses([]);
      await storageService.clearAllExpenses(currentUser?.id);
      await loadData();
    }
  };

  // Guardar límite de presupuesto
  const handleSaveBudgetLimit = async () => {
    if (!editingBudgetCategory || !budgetLimitInput || Number(budgetLimitInput) < 0) return;
    await storageService.updateCategoryBudget(editingBudgetCategory, Number(budgetLimitInput), currentUser?.id);
    setEditingBudgetCategory(null);
    setBudgetLimitInput('');
    await loadData();
  };

  // Abrir modal para crear nuevo objetivo
  const handleOpenCreateGoal = () => {
    setEditingGoal(null);
    setGoalTitle('');
    setGoalTargetAmount('');
    setGoalCurrentAmount('0');
    setGoalAccount('ing');
    setGoalDate('');
    setGoalNotes('');
    setShowGoalModal(true);
  };

  // Abrir modal para editar objetivo existente
  const handleOpenEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setGoalTitle(goal.title);
    setGoalTargetAmount(goal.target_amount);
    setGoalCurrentAmount(goal.current_amount);
    setGoalAccount(goal.account);
    setGoalDate(goal.target_date || '');
    setGoalNotes(goal.notes || '');
    setShowGoalModal(true);
  };

  // Guardar objetivo (Creación o Edición)
  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTarget = Number(String(goalTargetAmount).replace(',', '.'));
    const cleanCurrent = Number(String(goalCurrentAmount).replace(',', '.')) || 0;
    if (!goalTitle.trim() || isNaN(cleanTarget) || cleanTarget <= 0) return;

    if (editingGoal) {
      await storageService.updateSavingsGoal(editingGoal.id, {
        title: goalTitle.trim(),
        target_amount: cleanTarget,
        current_amount: cleanCurrent,
        account: goalAccount,
        target_date: goalDate || undefined,
        notes: goalNotes.trim() || undefined
      }, currentUser?.id);
    } else {
      await storageService.addSavingsGoal({
        title: goalTitle.trim(),
        target_amount: cleanTarget,
        current_amount: cleanCurrent,
        account: goalAccount,
        target_date: goalDate || undefined,
        notes: goalNotes.trim() || undefined
      }, currentUser?.id);
    }

    setShowGoalModal(false);
    setEditingGoal(null);
    await loadData();
  };

  // Aportar dinero a un objetivo existente
  const handleContribute = async (goalId: string) => {
    const cleanContrib = Number(String(contributionAmount).replace(',', '.'));
    if (isNaN(cleanContrib) || cleanContrib === 0) return;
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newAmount = Math.max(0, goal.current_amount + cleanContrib);
    await storageService.updateSavingsGoal(goalId, { current_amount: newAmount }, currentUser?.id);
    
    setContributeGoalId(null);
    setContributionAmount('');
    await loadData();
  };

  // Eliminar objetivo
  const handleDeleteGoal = async (id: string) => {
    if (confirm('¿Eliminar esta meta de ahorro?')) {
      await storageService.deleteSavingsGoal(id, currentUser?.id);
      await loadData();
    }
  };

  // Cálculos por Cartera
  const {
    abancaIncome, abancaExpense, abancaBalance,
    ingIncome, ingExpense, ingBalance,
    totalIncome, totalExpense, netBalance,
    filteredExpenses
  } = React.useMemo(() => {
    const filtered = expenses.filter(e => {
      if (selectedWallet === 'all') return true;
      return (e.account || 'abanca') === selectedWallet;
    });

    const abInc = expenses.filter(e => (e.account || 'abanca') === 'abanca' && e.type === 'income').reduce((acc, c) => acc + c.amount, 0);
    const abExp = expenses.filter(e => (e.account || 'abanca') === 'abanca' && e.type === 'expense').reduce((acc, c) => acc + c.amount, 0);
    const inInc = expenses.filter(e => e.account === 'ing' && e.type === 'income').reduce((acc, c) => acc + c.amount, 0);
    const inExp = expenses.filter(e => e.account === 'ing' && e.type === 'expense').reduce((acc, c) => acc + c.amount, 0);
    
    const tInc = filtered.filter(e => e.type === 'income').reduce((acc, c) => acc + c.amount, 0);
    const tExp = filtered.filter(e => e.type === 'expense').reduce((acc, c) => acc + c.amount, 0);

    return {
      abancaIncome: abInc, abancaExpense: abExp, abancaBalance: abInc - abExp,
      ingIncome: inInc, ingExpense: inExp, ingBalance: inInc - inExp,
      totalIncome: tInc, totalExpense: tExp, netBalance: tInc - tExp,
      filteredExpenses: filtered
    };
  }, [expenses, selectedWallet]);

  // Totales de Objetivos
  const { totalTargetGoals, totalSavedGoals, totalGoalsPct } = React.useMemo(() => {
    const tTarget = goals.reduce((acc, g) => acc + g.target_amount, 0);
    const tSaved = goals.reduce((acc, g) => acc + g.current_amount, 0);
    return {
      totalTargetGoals: tTarget,
      totalSavedGoals: tSaved,
      totalGoalsPct: tTarget > 0 ? (tSaved / tTarget) * 100 : 0
    };
  }, [goals]);

  // CÁLCULO DE DISTRIBUCIÓN POR CATEGORÍA PARA EL GRÁFICO
  const { categoryBreakdown, totalMonthlyBudget, totalBudgetConsumedPct } = React.useMemo(() => {
    const onlyExpenses = filteredExpenses.filter(e => e.type === 'expense');
    const totalExpenseSum = onlyExpenses.reduce((acc, c) => acc + c.amount, 0);

    const breakdown = Object.keys(CATEGORY_META).map(catName => {
      const catTotal = onlyExpenses.filter(e => e.category === catName).reduce((acc, c) => acc + c.amount, 0);
      const catPct = totalExpenseSum > 0 ? (catTotal / totalExpenseSum) * 100 : 0;
      const meta = CATEGORY_META[catName] || { icon: '📦', color: '#64748B' };
      const budgetObj = budgets.find(b => b.category === catName);
      const monthlyLimit = budgetObj ? budgetObj.monthly_limit : 200;
      const budgetConsumedPct = monthlyLimit > 0 ? (catTotal / monthlyLimit) * 100 : 0;

      return {
        category: catName,
        total: catTotal,
        percentage: catPct,
        icon: meta.icon,
        color: meta.color,
        monthlyLimit,
        budgetConsumedPct
      };
    }).filter(item => item.total > 0 || item.monthlyLimit > 0)
      .sort((a, b) => b.total - a.total);

    const tMonthlyBudget = budgets.reduce((acc, b) => acc + b.monthly_limit, 0);
    const tBudgetConsumedPct = tMonthlyBudget > 0 ? (totalExpenseSum / tMonthlyBudget) * 100 : 0;

    return {
      categoryBreakdown: breakdown,
      totalMonthlyBudget: tMonthlyBudget,
      totalBudgetConsumedPct: tBudgetConsumedPct
    };
  }, [filteredExpenses, budgets]);

  // =========================================================================
  // CÁLCULO DE COMPARATIVA MES A MES (HISTÓRICO ÚLTIMOS 6 MESES)
  // =========================================================================
  const { last6Months, currentMonthData, previousMonthData, expenseDiff, incomeDiff, savingsDiff, maxMonthlyBar } = React.useMemo(() => {
    const currentDate = new Date();
    const l6m = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
      const fullLabel = `${d.toLocaleString('es-ES', { month: 'long' })} ${d.getFullYear()}`;

      const monthExpenses = filteredExpenses.filter(e => String(e.transaction_date || '').startsWith(key) && e.type === 'expense');
      const monthIncomes = filteredExpenses.filter(e => String(e.transaction_date || '').startsWith(key) && e.type === 'income');

      const expenseTotal = monthExpenses.reduce((acc, c) => acc + c.amount, 0);
      const incomeTotal = monthIncomes.reduce((acc, c) => acc + c.amount, 0);
      const netSavings = incomeTotal - expenseTotal;
      const savingsRate = incomeTotal > 0 ? (netSavings / incomeTotal) * 100 : 0;

      return {
        key,
        label,
        fullLabel,
        expenseTotal,
        incomeTotal,
        netSavings,
        savingsRate,
        isCurrent: i === 5
      };
    });

    const curr = l6m[5];
    const prev = l6m[4];

    const eDiff = prev.expenseTotal > 0
      ? ((curr.expenseTotal - prev.expenseTotal) / prev.expenseTotal) * 100
      : 0;

    const iDiff = prev.incomeTotal > 0
      ? ((curr.incomeTotal - prev.incomeTotal) / prev.incomeTotal) * 100
      : 0;

    const sDiff = curr.netSavings - prev.netSavings;

    const maxBar = Math.max(
      ...l6m.map(m => Math.max(m.expenseTotal, m.incomeTotal)),
      100
    );

    return {
      last6Months: l6m,
      currentMonthData: curr,
      previousMonthData: prev,
      expenseDiff: eDiff,
      incomeDiff: iDiff,
      savingsDiff: sDiff,
      maxMonthlyBar: maxBar
    };
  }, [filteredExpenses]);

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 font-sans">
      {/* Header Principal */}
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
                  {walletConfig.has_account_2 ? 'Multi-Cartera & Metas' : 'Cartera Personal & Metas'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] sm:text-xs">
                {walletConfig.account_1_name} {walletConfig.has_account_2 && walletConfig.account_2_name ? `• ${walletConfig.account_2_name}` : ''} • Control & Presupuestos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAccountConfig}
              title="Configurar cuentas y saldos"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Configurar Cuentas</span>
            </button>

            {canEdit && expenses.length > 0 && (
              <button
                onClick={handleClearAllExpenses}
                title="Borrar todos los movimientos para empezar de cero"
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Vaciar Cartera</span>
              </button>
            )}
          </div>
        </div>

        {/* Acciones Rápidas */}
        {canEdit && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleOpenCreateGoal}
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

      {/* Subnavegación Principal: 3 Pestañas */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('movements')}
          className={`py-2 px-2 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'movements'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Movimientos</span>
          <span className="xs:hidden">Cuentas</span>
          <span className="text-[10px] opacity-80">({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-2 px-2 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Análisis & Mes a Mes</span>
          <span className="xs:hidden">Análisis</span>
        </button>

        <button
          onClick={() => setActiveTab('goals')}
          className={`py-2 px-2 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'goals'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PiggyBank className="w-3.5 h-3.5" />
          <span>Metas</span>
          <span className="text-[10px] opacity-80">({goals.length})</span>
        </button>
      </div>

      {/* Selector de Cartera Activa (Sólo si tiene más de 1 cuenta activada) */}
      {walletConfig.has_account_2 && (
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
            <span>{walletConfig.account_1_name}</span>
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
            <span>{walletConfig.account_2_name}</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 1: MOVIMIENTOS & CUENTAS */}
      {/* ========================================================================= */}
      {activeTab === 'movements' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Tarjetas de Saldos de Carteras */}
          {walletConfig.has_account_2 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Cuenta Principal */}
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
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">{walletConfig.account_1_name}</h3>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    {currentUser?.full_name?.split(' ')[0] || 'Cuenta 1'}
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

              {/* 2. Cuenta Secundaria / Ahorro */}
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
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">{walletConfig.account_2_name}</h3>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">
                    Ahorro / Común
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
                  <p className={`text-xl sm:text-2xl font-black ${netBalance >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                    {netBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                  </p>
                </div>

                <div className="flex justify-between items-center text-[10px] sm:text-[11px] pt-2 mt-2 border-t border-slate-800 text-slate-400">
                  <span>Ing: <b className="text-emerald-400">+{totalIncome.toFixed(0)}€</b></span>
                  <span>Gas: <b className="text-rose-400">-{totalExpense.toFixed(0)}€</b></span>
                </div>
              </div>
            </div>
          ) : (
            /* Vista para usuario con 1 sóla cuenta configurada */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tarjeta Cuenta Principal */}
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-950/70 to-slate-900 border border-indigo-500/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
                      🏦
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">{walletConfig.account_1_name}</h3>
                      <p className="text-[11px] text-slate-400">Cuenta Principal</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    Activa
                  </span>
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs text-slate-400">Saldo Disponible</p>
                  <p className={`text-2xl sm:text-3xl font-black ${abancaBalance >= 0 ? 'text-indigo-300' : 'text-rose-400'}`}>
                    {abancaBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-800/80 text-slate-400">
                  <span>Total Ingresos: <b className="text-emerald-400">+{abancaIncome.toFixed(0)}€</b></span>
                  <span>Total Gastos: <b className="text-rose-400">-{abancaExpense.toFixed(0)}€</b></span>
                </div>
              </div>

              {/* Botón Card: Añadir Cuenta Secundaria Opcional */}
              <div
                onClick={handleOpenAccountConfig}
                className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-900/30 hover:bg-slate-900/70 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2.5 group min-h-[140px]"
              >
                <div className="w-10 h-10 rounded-2xl bg-slate-800 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-400 flex items-center justify-center font-bold transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">+ Añadir Cuenta Secundaria</p>
                  <p className="text-[10px] text-slate-500">Ahorro, conjunta, inversión o segundo banco (opcional)</p>
                </div>
              </div>
            </div>
          )}

          {/* LISTA DE MOVIMIENTOS EN MÓVIL (sm:hidden) */}
          <div className="sm:hidden space-y-2.5">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-slate-300">
                Historial de Movimientos ({filteredExpenses.length})
              </span>
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 space-y-2">
                <p className="text-sm font-bold text-white">✨ Cartera limpia y lista para usar</p>
                <p className="text-xs text-slate-500">No hay movimientos registrados. Pulsa "+ Movimiento" para registrar tu primer ingreso o gasto.</p>
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
                            {isAbanca ? walletConfig.account_1_name : walletConfig.account_2_name}
                          </span>
                          <span className="text-[10px] text-slate-500">•</span>
                          <span className="text-[10px] text-slate-400">{item.category}</span>
                          <span className="text-[10px] text-slate-500">•</span>
                          <span className="text-[10px] text-slate-500">{item.transaction_date ? String(item.transaction_date).slice(5) : ''}</span>
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

          {/* TABLA DE MOVIMIENTOS EN ESCRITORIO (hidden sm:block) */}
          <div className="hidden sm:block glass-panel bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>Movimientos {selectedWallet === 'abanca' ? `• ${walletConfig.account_1_name}` : selectedWallet === 'ing' ? `• ${walletConfig.account_2_name}` : '• Todas las Cuentas'}</span>
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
                      <td colSpan={6} className="py-10 text-center text-slate-400 space-y-2">
                        <p className="text-sm font-bold text-white">✨ Cartera limpia y lista para usar</p>
                        <p className="text-xs text-slate-500">No hay movimientos registrados. Pulsa "+ Movimiento" para registrar tu primer ingreso o gasto.</p>
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
                                <span>🏦</span> {walletConfig.account_1_name}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-950/60 border border-orange-500/30 text-orange-300 text-xs font-bold">
                                <span>🤝</span> {walletConfig.account_2_name}
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

      {/* ========================================================================= */}
      {/* VISTA 2: ANÁLISIS & COMPARATIVA MES A MES */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* MÓDULO 1: COMPARATIVA MES A MES & KPIS */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                  Evolución Temporal
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-indigo-400" />
                  <span>Comparativa Mes a Mes</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Compara tus ingresos, gastos y ahorro neto de este mes respecto al anterior.
                </p>
              </div>

              {/* Badge de Resumen del Comportamiento */}
              <div className="bg-slate-950/80 px-3.5 py-2 rounded-2xl border border-slate-800 text-xs">
                {expenseDiff < 0 ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4" /> Has gastado un {Math.abs(expenseDiff).toFixed(1)}% MENOS este mes
                  </span>
                ) : expenseDiff > 0 ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" /> Gastos +{expenseDiff.toFixed(1)}% respecto al mes pasado
                  </span>
                ) : (
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" /> Seguimiento activo del mes
                  </span>
                )}
              </div>
            </div>

            {/* 3 Tarjetas Comparativas (Ingresos, Gastos, Ahorro Neto) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Gastos Comparados */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Gastos del Mes</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    expenseDiff <= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {expenseDiff > 0 ? `+${expenseDiff.toFixed(1)}%` : `${expenseDiff.toFixed(1)}%`}
                  </span>
                </div>
                <p className="text-xl font-black text-rose-400">
                  {currentMonthData.expenseTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </p>
                <p className="text-[10px] text-slate-500">
                  Mes anterior: <b className="text-slate-400">{previousMonthData.expenseTotal.toFixed(2)} €</b>
                </p>
              </div>

              {/* 2. Ingresos Comparados */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Ingresos del Mes</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    incomeDiff >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {incomeDiff > 0 ? `+${incomeDiff.toFixed(1)}%` : `${incomeDiff.toFixed(1)}%`}
                  </span>
                </div>
                <p className="text-xl font-black text-emerald-400">
                  {currentMonthData.incomeTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </p>
                <p className="text-[10px] text-slate-500">
                  Mes anterior: <b className="text-slate-400">{previousMonthData.incomeTotal.toFixed(2)} €</b>
                </p>
              </div>

              {/* 3. Ahorro Neto / Superávit */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Capacidad Ahorro</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                    {currentMonthData.savingsRate.toFixed(1)}% Tasa
                  </span>
                </div>
                <p className={`text-xl font-black ${currentMonthData.netSavings >= 0 ? 'text-indigo-300' : 'text-rose-400'}`}>
                  {currentMonthData.netSavings.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </p>
                <p className="text-[10px] text-slate-500">
                  Variación neta: <b className={savingsDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{savingsDiff >= 0 ? `+${savingsDiff.toFixed(2)}` : savingsDiff.toFixed(2)} €</b>
                </p>
              </div>
            </div>

            {/* Gráfico de Barras: Histórico de los Últimos 6 Meses */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Histórico de Evolución (Últimos 6 Meses)</span>
                </h3>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Ingresos
                  </span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Gastos
                  </span>
                </div>
              </div>

              {/* Grid de Barras por Mes */}
              <div className="grid grid-cols-6 gap-2 sm:gap-3 bg-slate-950/80 p-3.5 sm:p-5 rounded-2xl border border-slate-800/80 items-end min-h-[160px]">
                {last6Months.map((m, idx) => {
                  const expenseBarHeight = maxMonthlyBar > 0 ? (m.expenseTotal / maxMonthlyBar) * 100 : 0;
                  const incomeBarHeight = maxMonthlyBar > 0 ? (m.incomeTotal / maxMonthlyBar) * 100 : 0;

                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                      {/* Valores en hover o visibles */}
                      <div className="flex items-end gap-1 sm:gap-1.5 w-full justify-center h-28">
                        {/* Barra Ingresos */}
                        <div 
                          className="w-3 sm:w-4 bg-emerald-500/80 hover:bg-emerald-400 rounded-t-md transition-all duration-500 relative group-hover:scale-105"
                          style={{ height: `${Math.max(6, incomeBarHeight)}%` }}
                          title={`Ingresos ${m.label}: ${m.incomeTotal.toFixed(2)} €`}
                        />

                        {/* Barra Gastos */}
                        <div 
                          className="w-3 sm:w-4 bg-rose-500/80 hover:bg-rose-400 rounded-t-md transition-all duration-500 relative group-hover:scale-105"
                          style={{ height: `${Math.max(6, expenseBarHeight)}%` }}
                          title={`Gastos ${m.label}: ${m.expenseTotal.toFixed(2)} €`}
                        />
                      </div>

                      {/* Etiqueta del Mes */}
                      <div className="text-center">
                        <span className={`text-[10px] sm:text-xs font-bold block ${
                          m.isCurrent ? 'text-indigo-400 font-black' : 'text-slate-400'
                        }`}>
                          {m.label}
                        </span>
                        <span className="text-[9px] text-slate-500 block font-mono">
                          {m.expenseTotal.toFixed(0)}€
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MÓDULO 2: DISTRIBUCIÓN POR CATEGORÍA Y LÍMITES PRESUPUESTARIOS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Columna 1: Gráfico Visual de Donut (5 Cols) */}
            <div className="lg:col-span-5 glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider text-center flex items-center gap-2">
                <PieChart className="w-4 h-4 text-teal-400" />
                <span>Distribución del Mes</span>
              </h3>

              {totalExpense === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                  <PieChart className="w-12 h-12 mx-auto text-slate-700 animate-pulse" />
                  <p>Aún no hay gastos registrados este mes.</p>
                  <p className="text-[10px] text-slate-600">Añade movimientos para ver el gráfico circular.</p>
                </div>
              ) : (
                <div className="space-y-4 w-full flex flex-col items-center">
                  {/* SVG Donut Chart interactivo */}
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {(() => {
                        let accumulatedPercent = 0;
                        return categoryBreakdown.filter(c => c.total > 0).map((cat, i) => {
                          const strokeDasharray = `${cat.percentage} ${100 - cat.percentage}`;
                          const strokeDashoffset = -accumulatedPercent;
                          accumulatedPercent += cat.percentage;

                          return (
                            <circle
                              key={i}
                              cx="50"
                              cy="50"
                              r="38"
                              fill="transparent"
                              stroke={cat.color}
                              strokeWidth="16"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              pathLength="100"
                              className="transition-all duration-700 hover:opacity-80"
                            />
                          );
                        });
                      })()}
                    </svg>

                    {/* Centro del Donut */}
                    <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total Gastos</span>
                      <span className="text-base font-black text-white">{totalExpense.toFixed(0)} €</span>
                    </div>
                  </div>

                  {/* Leyenda rápida */}
                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    {categoryBreakdown.filter(c => c.total > 0).map((cat, i) => (
                      <span 
                        key={i}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800"
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-slate-300">{cat.icon} {cat.category}:</span>
                        <b className="text-white">{cat.percentage.toFixed(1)}%</b>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Columna 2: Límites por Categoría con Barras de Alerta (7 Cols) */}
            <div className="lg:col-span-7 glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Presupuestos & Alertas por Categoría</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold">Toca ✏️ para cambiar límite</span>
              </div>

              <div className="space-y-3">
                {categoryBreakdown.map((cat, idx) => {
                  const isOverLimit = cat.total > cat.monthlyLimit;
                  const isWarning = cat.budgetConsumedPct >= 75 && !isOverLimit;
                  const remaining = Math.max(0, cat.monthlyLimit - cat.total);

                  return (
                    <div 
                      key={idx}
                      className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                        isOverLimit 
                          ? 'bg-rose-950/30 border-rose-500/50 shadow-md shadow-rose-500/10' 
                          : isWarning 
                          ? 'bg-amber-950/20 border-amber-500/40' 
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {/* Cabecera de Categoría y Cifras */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cat.icon}</span>
                          <span className="text-xs sm:text-sm font-bold text-white">{cat.category}</span>

                          {/* Insignia de Alerta */}
                          {isOverLimit ? (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> ¡Límite Superado (+{(cat.total - cat.monthlyLimit).toFixed(0)}€)!
                            </span>
                          ) : isWarning ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              ⚠️ Alerta {cat.budgetConsumedPct.toFixed(0)}%
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              ✓ OK
                            </span>
                          )}
                        </div>

                        {/* Importes y botón de ajuste de límite */}
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="text-xs sm:text-sm font-black text-white">
                              {cat.total.toFixed(0)} €
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium"> / {cat.monthlyLimit} €</span>
                          </div>

                          {canEdit && (
                            <button
                              onClick={() => {
                                setEditingBudgetCategory(cat.category);
                                setBudgetLimitInput(cat.monthlyLimit);
                              }}
                              className="p-1 text-slate-500 hover:text-white rounded-lg transition-colors"
                              title="Ajustar límite mensual"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Input rápido si está editando límite */}
                      {editingBudgetCategory === cat.category ? (
                        <div className="flex items-center gap-2 pt-1 animate-fadeIn">
                          <span className="text-[11px] text-slate-400 font-bold">Nuevo tope mensual (€):</span>
                          <input
                            type="number"
                            step="10"
                            value={budgetLimitInput}
                            onChange={e => setBudgetLimitInput(e.target.value)}
                            className="w-24 bg-slate-800 border border-purple-500 rounded-lg px-2 py-1 text-white text-xs font-bold"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveBudgetLimit}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-lg flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Guardar
                          </button>
                          <button
                            onClick={() => setEditingBudgetCategory(null)}
                            className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        /* Barra de Consumo */
                        <div className="space-y-1">
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                isOverLimit 
                                  ? 'bg-rose-500' 
                                  : isWarning 
                                  ? 'bg-amber-400' 
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, cat.budgetConsumedPct))}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <span>Consumido: <b className="text-slate-200">{cat.budgetConsumedPct.toFixed(1)}%</b></span>
                            <span>
                              {isOverLimit 
                                ? <b className="text-rose-400">Excedido en {(cat.total - cat.monthlyLimit).toFixed(2)} €</b> 
                                : <span>Disponible: <b className="text-emerald-400">{remaining.toFixed(2)} €</b></span>}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: PANEL DE METAS Y OBJETIVOS DE AHORRO ("HUCHA DE METAS") */}
      {/* ========================================================================= */}
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

          {/* Grid de Tarjetas de Objetivos o Estado Vacío */}
          {goals.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-400 space-y-3 shadow-xl">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <PiggyBank className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No tienes metas de ahorro activas</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  La cartera de objetivos está 100% limpia. Pulsa el botón de abajo para definir tu propio objetivo (ej. Play, Viaje, Coche, Fondo).
                </p>
              </div>
              {canEdit && (
                <button
                  onClick={handleOpenCreateGoal}
                  className="mt-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/25 transition-all inline-flex items-center gap-2 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Crear Mi Primer Objetivo</span>
                </button>
              )}
            </div>
          ) : (
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
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditGoal(goal)}
                            className="text-slate-400 hover:text-purple-300 p-1.5 rounded-lg hover:bg-purple-500/10 transition-colors"
                            title="Modificar este objetivo"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                            title="Eliminar meta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditGoal(goal)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
                              >
                                Modificar
                              </button>
                              <button
                                onClick={() => { setContributeGoalId(goal.id); setContributionAmount(50); }}
                                className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95"
                              >
                                <Coins className="w-3.5 h-3.5" />
                                <span>+ Aportar</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NUEVA TRANSACCIÓN */}
      {/* ========================================================================= */}
      {showTransactionModal && (
        <div 
          onClick={() => setShowTransactionModal(false)}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-[#111622] border border-slate-700/80 rounded-2xl sm:rounded-3xl w-[92vw] sm:w-full max-w-md max-h-[88dvh] flex flex-col p-4 sm:p-6 shadow-2xl animate-fadeIn my-auto overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 flex-shrink-0">
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                <span>Registrar Movimiento</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowTransactionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="flex flex-col flex-1 overflow-hidden pt-2">
              <div className="space-y-3 overflow-y-auto pr-1 flex-1 py-1">
                {/* Cartera / Cuenta Asignada (Sólo si tiene más de 1 cuenta) */}
                {walletConfig.has_account_2 && (
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cartera / Cuenta</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setTransactionAccount('abanca')}
                        className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 truncate ${
                          transactionAccount === 'abanca'
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <span className="truncate">🏦 {walletConfig.account_1_name}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransactionAccount('ing')}
                        className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 truncate ${
                          transactionAccount === 'ing'
                            ? 'bg-orange-600 text-white border-orange-500 shadow-md'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <span className="truncate">🤝 {walletConfig.account_2_name}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Tipo: Gasto o Ingreso */}
                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tipo</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setType('expense')}
                      className={`py-1.5 sm:py-2 rounded-xl text-xs font-bold border transition-all ${
                        type === 'expense'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-400 font-black'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      Gasto (-)
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('income')}
                      className={`py-1.5 sm:py-2 rounded-xl text-xs font-bold border transition-all ${
                        type === 'income'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-black'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      Ingreso (+)
                    </button>
                  </div>
                </div>

                {/* Concepto */}
                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Concepto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Supermercado, Gasolina, Alquiler..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 sm:py-2 text-white focus:outline-none focus:border-emerald-500 text-xs sm:text-sm font-semibold"
                  />
                </div>

                {/* Importe y Categoría */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Importe (€)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 sm:py-2 text-white focus:outline-none focus:border-emerald-500 text-xs sm:text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Categoría</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 sm:py-2 text-white focus:outline-none focus:border-emerald-500 text-xs sm:text-sm"
                    >
                      <option value="Alimentación">Alimentación</option>
                      <option value="Hogar / Alquiler">Hogar / Alquiler</option>
                      <option value="Transporte / Gasolina">Transporte</option>
                      <option value="Ocio & Restaurantes">Ocio</option>
                      <option value="Servicios / Suministros">Servicios</option>
                      <option value="Tecnología">Tecnología</option>
                      <option value="Salud & Bienestar">Salud</option>
                      <option value="Ahorro/Común">Ahorro</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2.5 mt-1 border-t border-slate-800 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="w-full py-2 sm:py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700 text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full py-2 sm:py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-center"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREAR / MODIFICAR OBJETIVO DE AHORRO */}
      {/* ========================================================================= */}
      {showGoalModal && (
        <div 
          onClick={() => setShowGoalModal(false)}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-[#111622] border border-slate-700/80 rounded-2xl sm:rounded-3xl w-[92vw] sm:w-full max-w-md max-h-[88dvh] flex flex-col p-4 sm:p-6 shadow-2xl animate-fadeIn my-auto overflow-hidden"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                <h3 className="text-sm sm:text-base font-black text-white">
                  {editingGoal ? 'Modificar Objetivo' : 'Nuevo Objetivo'}
                </h3>
                {editingGoal && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Editando
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="flex flex-col flex-1 overflow-hidden pt-2">
              <div className="space-y-3 overflow-y-auto pr-1 flex-1 py-1">
                {/* Título del Objetivo */}
                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nombre del Objetivo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Play, Viaje Vacaciones, Coche, Fondo..."
                    value={goalTitle}
                    onChange={e => setGoalTitle(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 sm:py-2 text-white focus:outline-none focus:border-purple-500 text-xs sm:text-sm font-semibold"
                  />
                </div>

                {/* Precio / Meta Total (€) y Aportación Actual */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Precio / Meta (€)</label>
                    <input
                      type="number"
                      step="10"
                      required
                      placeholder="Ej. 3000"
                      value={goalTargetAmount}
                      onChange={e => setGoalTargetAmount(e.target.value)}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 sm:py-2 text-white focus:outline-none focus:border-purple-500 text-xs sm:text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ahorrado (€)</label>
                    <input
                      type="number"
                      step="10"
                      placeholder="0"
                      value={goalCurrentAmount}
                      onChange={e => setGoalCurrentAmount(e.target.value)}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 sm:py-2 text-white focus:outline-none focus:border-purple-500 text-xs sm:text-sm font-bold text-emerald-400"
                    />
                  </div>
                </div>

                {/* Cuenta Asignada (Sólo si tiene 2 cuentas) */}
                {walletConfig.has_account_2 && (
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cuenta Asociada</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setGoalAccount('ing')}
                        className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 truncate ${
                          goalAccount === 'ing'
                            ? 'bg-orange-600 text-white border-orange-500 shadow-md'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <span className="truncate">🤝 {walletConfig.account_2_name}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoalAccount('abanca')}
                        className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 truncate ${
                          goalAccount === 'abanca'
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <span className="truncate">🏦 {walletConfig.account_1_name}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Fecha Prevista */}
                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fecha Prevista (Opcional)</label>
                  <input
                    type="date"
                    value={goalDate}
                    onChange={e => setGoalDate(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 sm:py-2 text-white focus:outline-none focus:border-purple-500 text-xs sm:text-sm"
                  />
                </div>

                {/* Notas */}
                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Notas / Descripción (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej. Ahorro personal mensual..."
                    value={goalNotes}
                    onChange={e => setGoalNotes(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 sm:py-2 text-white focus:outline-none focus:border-purple-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2.5 mt-1 border-t border-slate-800 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="w-full py-2 sm:py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700 text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full py-2 sm:py-2.5 px-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/25 transition-all text-center"
                >
                  {editingGoal ? 'Guardar' : 'Crear Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIGURACIÓN / ONBOARDING DE CUENTAS & CARTERA */}
      {/* ========================================================================= */}
      {showSetupModal && (
        <div 
          onClick={() => setShowSetupModal(false)}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-[#111622] border border-white/10 rounded-2xl sm:rounded-3xl w-[92vw] sm:w-full max-w-md max-h-[88dvh] flex flex-col p-4 sm:p-6 shadow-2xl animate-fadeIn my-auto overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">Configura tus Cuentas</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400">Nombres y saldos de tus bancos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccountSetup} className="flex flex-col flex-1 overflow-hidden pt-2 text-xs">
              <div className="space-y-3 overflow-y-auto pr-1 flex-1 py-1">
                {/* Cuenta 1 Principal */}
                <div className="p-3 rounded-xl bg-[#090C15] border border-white/5 space-y-2">
                  <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs">
                    <span>🏦 Cuenta Principal (Habitual / Nómina)</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium block mb-1">Nombre del Banco o Cuenta</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. BBVA, Santander, Abanca..."
                      value={setupAcc1Name}
                      onChange={e => setSetupAcc1Name(e.target.value)}
                      className="w-full bg-[#111622] border border-white/10 rounded-xl px-3 py-1.5 text-white font-bold focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium block mb-1">Saldo Inicial (€) (Opcional)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={setupAcc1Balance}
                      onChange={e => setSetupAcc1Balance(e.target.value)}
                      className="w-full bg-[#111622] border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>

                {/* Toggle Opcional para Cuenta 2 */}
                <div 
                  onClick={() => setSetupHasAcc2(!setupHasAcc2)}
                  className="p-3 rounded-xl bg-[#090C15] border border-white/5 flex items-center justify-between cursor-pointer hover:border-white/15 transition-all select-none"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-xs">
                      🤝
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">¿Segunda cuenta?</p>
                      <p className="text-[10px] text-slate-400">Ahorro, conjunta o secundaria</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={setupHasAcc2}
                    onChange={e => setSetupHasAcc2(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer pointer-events-none"
                  />
                </div>

                {/* Campos Cuenta 2 (Sólo si el usuario la activa) */}
                {setupHasAcc2 && (
                  <div className="p-3 rounded-xl bg-[#090C15] border border-orange-500/20 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-orange-300 font-bold text-xs">
                      <span>🤝 Cuenta 2 (Ahorro / Secundaria)</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-medium block mb-1">Nombre de la 2ª Cuenta</label>
                      <input
                        type="text"
                        required={setupHasAcc2}
                        placeholder="Ej. Cuenta Ahorro, Revolut, ING..."
                        value={setupAcc2Name}
                        onChange={e => setSetupAcc2Name(e.target.value)}
                        className="w-full bg-[#111622] border border-white/10 rounded-xl px-3 py-1.5 text-white font-bold focus:outline-none focus:border-orange-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-medium block mb-1">Saldo Inicial (€) (Opcional)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={setupAcc2Balance}
                        onChange={e => setSetupAcc2Balance(e.target.value)}
                        className="w-full bg-[#111622] border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-orange-500 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2.5 mt-1 border-t border-white/5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  className="w-full py-2 sm:py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-all border border-slate-700 text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full py-2 sm:py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-black font-black rounded-xl shadow-lg transition-all text-xs text-center"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
