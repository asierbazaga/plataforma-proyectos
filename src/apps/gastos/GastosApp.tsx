import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Wallet, ShieldAlert, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ExpenseItem } from '../../types';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';

export const GastosApp: React.FC = () => {
  const { canEditApp } = useAuth();
  const canEdit = canEditApp('gastos');
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('Alimentación');

  const loadData = async () => {
    const list = await storageService.getExpenses();
    setExpenses(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    await storageService.addExpense({
      description,
      amount: Number(amount),
      type,
      category,
      transaction_date: new Date().toISOString().split('T')[0]
    });

    setDescription('');
    setAmount('');
    setShowModal(false);
    await loadData();
  };

  const totalIncome = expenses.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = expenses.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-6 rounded-2xl border border-emerald-500/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <DollarSign className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              APP GASTOS Y FINANZAS
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Módulo Activo</span>
            </h1>
            <p className="text-slate-400 text-sm">Control presupuestario, gestión de ingresos y egresos diarios.</p>
          </div>
        </div>

        {canEdit ? (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Nueva Transacción
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/20">
            <ShieldAlert className="w-4 h-4" />
            Modo Solo Lectura
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Ingresos Totales</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">+{totalIncome.toFixed(2)} €</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-rose-500">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Gastos Totales</p>
            <p className="text-2xl font-bold text-rose-400 mt-1">-{totalExpense.toFixed(2)} €</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-indigo-500">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Balance Neto</p>
            <p className={`text-2xl font-bold mt-1 ${netBalance >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
              {netBalance.toFixed(2)} €
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          Movimientos Recientes
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Concepto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4 text-right">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {expenses.map(item => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                    {item.type === 'income' ? (
                      <span className="p-1 rounded bg-emerald-500/20 text-emerald-400"><ArrowUpRight className="w-4 h-4" /></span>
                    ) : (
                      <span className="p-1 rounded bg-rose-500/20 text-rose-400"><ArrowDownRight className="w-4 h-4" /></span>
                    )}
                    {item.description}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs border border-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{item.transaction_date}</td>
                  <td className={`py-3 px-4 text-right font-bold ${item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.type === 'income' ? '+' : '-'}{item.amount.toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Transacción */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Nueva Transacción
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400">Tipo de Movimiento</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${type === 'expense' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    Gasto (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${type === 'income' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    Ingreso (+)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Concepto / Descripción</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Pago de Alquiler, Mercado..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Importe (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Categoría</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Alimentación">Alimentación</option>
                    <option value="Tecnología">Tecnología</option>
                    <option value="Servicios">Servicios</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Ocio">Ocio</option>
                    <option value="Ingresos">Ingresos</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600"
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
