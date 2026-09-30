import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { storageService } from '../../../services/storageService';
import { AgendaLoan } from '../../../types';
import { Plus, Trash2, Edit2, TrendingDown, CalendarClock, DollarSign, Wallet } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export const LoansView: React.FC = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const toast = useToast();

  const [loans, setLoans] = useState<AgendaLoan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState<AgendaLoan | null>(null);

  // Form
  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | string>('');
  const [paidAmount, setPaidAmount] = useState<number | string>('');
  const [installment, setInstallment] = useState<number | string>('');

  useEffect(() => {
    loadLoans();
    const unsub = storageService.onSync(() => {
      loadLoans();
    });
    return unsub;
  }, [currentUser?.id]);

  const loadLoans = async () => {
    if (!currentUser) return;
    const data = await storageService.getAgendaLoans(currentUser.id);
    setLoans(data);
  };

  const handleOpenAdd = () => {
    setEditingLoan(null);
    setName('');
    setTotalAmount('');
    setPaidAmount('0');
    setInstallment('');
    setShowModal(true);
  };

  const handleOpenEdit = (loan: AgendaLoan) => {
    setEditingLoan(loan);
    setName(loan.name);
    setTotalAmount(loan.total_amount);
    setPaidAmount(loan.paid_amount);
    setInstallment(loan.installment_amount);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const t = Number(String(totalAmount).replace(',', '.'));
    const p = Number(String(paidAmount).replace(',', '.'));
    const i = Number(String(installment).replace(',', '.'));

    if (isNaN(t) || isNaN(p) || isNaN(i) || t <= 0) {
      toast.error('Cantidades inválidas');
      return;
    }

    try {
      if (editingLoan) {
        await storageService.updateAgendaLoan(editingLoan.id, {
          name,
          total_amount: t,
          paid_amount: p,
          installment_amount: i
        }, currentUser.id);
        toast.success('Préstamo actualizado');
      } else {
        await storageService.addAgendaLoan({
          name,
          total_amount: t,
          paid_amount: p,
          installment_amount: i,
          start_date: new Date().toISOString().split('T')[0]
        }, currentUser.id);
        toast.success('Préstamo creado');
      }
      setShowModal(false);
      loadLoans();
    } catch (err) {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentUser) return;
    if (confirm('¿Eliminar este préstamo?')) {
      await storageService.deleteAgendaLoan(id, currentUser.id);
      toast.success('Préstamo eliminado');
      loadLoans();
    }
  };

  const handlePayInstallment = async (loan: AgendaLoan) => {
    if (!currentUser) return;
    if (loan.paid_amount >= loan.total_amount) {
      toast.error('Este préstamo ya está pagado');
      return;
    }

    const nextPaid = Math.min(loan.total_amount, loan.paid_amount + loan.installment_amount);
    try {
      await storageService.updateAgendaLoan(loan.id, { paid_amount: nextPaid }, currentUser.id);
      toast.success(`Cuota de ${loan.installment_amount}€ pagada`);
      loadLoans();
    } catch (err) {
      toast.error('Error al actualizar pago');
    }
  };

  const calculateEndDate = (remaining: number, installment: number) => {
    if (installment <= 0 || remaining <= 0) return 'Pagado';
    const months = Math.ceil(remaining / installment);
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Control de Préstamos</h2>
          <p className="text-sm text-slate-500">Haz seguimiento de lo que te queda por pagar</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Añadir Préstamo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loans.map(loan => {
          const remaining = loan.total_amount - loan.paid_amount;
          const progress = Math.min(100, Math.max(0, (loan.paid_amount / loan.total_amount) * 100));
          const isPaid = remaining <= 0;

          return (
            <div key={loan.id} className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} relative overflow-hidden group`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isPaid ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'}`}>
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{loan.name}</h3>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {loan.installment_amount}€ / mes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenEdit(loan)} className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(loan.id)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-semibold text-emerald-500">{loan.paid_amount.toLocaleString('es-ES')}€ Pagado</span>
                    <span className="font-semibold text-rose-500">{remaining > 0 ? remaining.toLocaleString('es-ES') : 0}€ Restante</span>
                  </div>
                  <div className={`h-2.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isPaid ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-center text-xs mt-1.5 text-slate-500 font-medium">
                    Total: {loan.total_amount.toLocaleString('es-ES')}€ ({progress.toFixed(0)}%)
                  </p>
                </div>

                <div className={`pt-4 border-t flex items-center justify-between ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <CalendarClock className={`w-4 h-4 ${isPaid ? 'text-emerald-500' : 'text-amber-500'}`} />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Fin estimado</p>
                      <p className={`text-sm font-bold capitalize ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {calculateEndDate(remaining, loan.installment_amount)}
                      </p>
                    </div>
                  </div>

                  {!isPaid && (
                    <button 
                      onClick={() => handlePayInstallment(loan)}
                      className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg transition-colors border border-emerald-500/20"
                    >
                      + Pagar Cuota
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {loans.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <TrendingDown className={`w-8 h-8 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
            </div>
            <p className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>No tienes préstamos</p>
            <p className="text-slate-500 max-w-sm mb-6">Añade tus préstamos o deudas para calcular cuándo terminarás de pagarlos según tus cuotas mensuales.</p>
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Empezar a registrar
            </button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-xl ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
            <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {editingLoan ? 'Editar Préstamo' : 'Nuevo Préstamo'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Concepto / Entidad</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Coche, Universidad..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total a Pagar</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={e => setTotalAmount(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ya Pagado</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    placeholder="0.00"
                    value={paidAmount}
                    onChange={e => setPaidAmount(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 text-emerald-400' 
                        : 'bg-slate-50 border-slate-200 text-emerald-600'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cuota Mensual</label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  placeholder="Ej. 150"
                  value={installment}
                  onChange={e => setInstallment(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-amber-400' 
                      : 'bg-slate-50 border-slate-200 text-amber-600'
                  }`}
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                    isDark 
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
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
