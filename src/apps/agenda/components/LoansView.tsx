import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { storageService } from '../../../services/storageService';
import { AgendaLoan, AgendaLoanPayment } from '../../../types';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  TrendingDown, 
  CalendarClock, 
  Wallet, 
  History, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  X, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export const LoansView: React.FC = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const toast = useToast();

  const [loans, setLoans] = useState<AgendaLoan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState<AgendaLoan | null>(null);

  // Expanded history accordion by loan id
  const [expandedLoans, setExpandedLoans] = useState<Record<string, boolean>>({});

  // Payment modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [payingLoan, setPayingLoan] = useState<AgendaLoan | null>(null);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payAmount, setPayAmount] = useState<number | string>('');
  const [payNote, setPayNote] = useState('');
  const [payAlreadyIncluded, setPayAlreadyIncluded] = useState(false);

  // Delete payment modal state
  const [deletingPayment, setDeletingPayment] = useState<{ loan: AgendaLoan; payment: AgendaLoanPayment } | null>(null);

  // Form (Add / Edit loan)
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

  const toggleExpandHistory = (loanId: string) => {
    setExpandedLoans(prev => ({
      ...prev,
      [loanId]: !prev[loanId]
    }));
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
          user_id: currentUser.id,
          name,
          total_amount: t,
          paid_amount: p,
          installment_amount: i,
          start_date: new Date().toISOString().split('T')[0],
          payments: []
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

  // Open modal to pay installment or register past bank payment
  const handleOpenPay = (loan: AgendaLoan, isHistorical: boolean = false) => {
    const remaining = Math.max(0, loan.total_amount - loan.paid_amount);
    setPayingLoan(loan);
    setPayDate(new Date().toISOString().split('T')[0]);
    // Pre-fill with installment amount or remaining if less
    const defaultAmount = isHistorical 
      ? loan.installment_amount 
      : Math.min(loan.installment_amount, remaining > 0 ? remaining : loan.installment_amount);
    setPayAmount(defaultAmount);
    setPayNote('');
    setPayAlreadyIncluded(isHistorical);
    setShowPayModal(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !payingLoan) return;

    const amount = Number(String(payAmount).replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      toast.error('Por favor introduce un importe válido mayor que 0');
      return;
    }

    if (!payDate) {
      toast.error('Por favor selecciona la fecha del pago');
      return;
    }

    const newPayment: AgendaLoanPayment = {
      id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      date: payDate,
      amount: amount,
      notes: payNote.trim() || undefined,
      created_at: new Date().toISOString()
    };

    const currentPayments = payingLoan.payments || [];
    const updatedPayments = [newPayment, ...currentPayments].sort((a, b) => b.date.localeCompare(a.date));

    // If payAlreadyIncluded is true, the user is just logging a date for an amount already counted in paid_amount
    const updatedPaidAmount = payAlreadyIncluded
      ? payingLoan.paid_amount
      : Math.min(payingLoan.total_amount, payingLoan.paid_amount + amount);

    try {
      await storageService.updateAgendaLoan(payingLoan.id, {
        paid_amount: updatedPaidAmount,
        payments: updatedPayments
      }, currentUser.id);

      // Auto expand history so the user sees the new payment entry
      setExpandedLoans(prev => ({ ...prev, [payingLoan.id]: true }));
      toast.success(payAlreadyIncluded ? 'Fecha registrada en el historial' : `Cuota de ${amount.toLocaleString('es-ES')}€ pagada`);
      setShowPayModal(false);
      loadLoans();
    } catch (err) {
      toast.error('Error al registrar el pago');
    }
  };

  const promptDeletePayment = (loan: AgendaLoan, payment: AgendaLoanPayment) => {
    setDeletingPayment({ loan, payment });
  };

  const handleConfirmDeletePayment = async (deductFromPaid: boolean) => {
    if (!currentUser || !deletingPayment) return;
    const { loan, payment } = deletingPayment;

    const remainingPayments = (loan.payments || []).filter(p => p.id !== payment.id);
    const updatedPaidAmount = deductFromPaid
      ? Math.max(0, loan.paid_amount - payment.amount)
      : loan.paid_amount;

    try {
      await storageService.updateAgendaLoan(loan.id, {
        paid_amount: updatedPaidAmount,
        payments: remainingPayments
      }, currentUser.id);

      toast.success(deductFromPaid ? 'Pago eliminado y descontado del saldo' : 'Registro de pago eliminado del historial');
      setDeletingPayment(null);
      loadLoans();
    } catch (err) {
      toast.error('Error al eliminar el pago');
    }
  };

  const calculateEndDate = (remaining: number, installment: number) => {
    if (installment <= 0 || remaining <= 0) return 'Pagado';
    const months = Math.ceil(remaining / installment);
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);
  };

  const formatPaymentDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      if (year && month && day) {
        const d = new Date(Number(year), Number(month) - 1, Number(day));
        return new Intl.DateTimeFormat('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }).format(d);
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Control de Préstamos</h2>
          <p className="text-sm text-slate-500">Haz seguimiento de tus cuotas, fechas de pago y lo que te queda por pagar</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Añadir Préstamo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loans.map(loan => {
          const remaining = loan.total_amount - loan.paid_amount;
          const progress = Math.min(100, Math.max(0, (loan.paid_amount / loan.total_amount) * 100));
          const isPaid = remaining <= 0;
          const payments = (loan.payments || []).slice().sort((a, b) => b.date.localeCompare(a.date));
          const isExpanded = !!expandedLoans[loan.id];
          const lastPayment = payments[0];

          return (
            <div 
              key={loan.id} 
              className={`p-5 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'
              } relative overflow-hidden group shadow-sm flex flex-col justify-between`}
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isPaid ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'}`}>
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{loan.name}</h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {loan.installment_amount.toLocaleString('es-ES')}€ / mes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenEdit(loan)} 
                      className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50"
                      title="Editar préstamo"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(loan.id)} 
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50"
                      title="Eliminar préstamo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-emerald-500">
                        {loan.paid_amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ Pagado
                      </span>
                      <span className="font-semibold text-rose-500">
                        {remaining > 0 ? remaining.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 0}€ Restante
                      </span>
                    </div>
                    <div className={`h-2.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isPaid ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-center text-xs mt-1.5 text-slate-500 font-medium">
                      Total: {loan.total_amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ ({progress.toFixed(0)}%)
                    </p>
                  </div>

                  {/* End date & Pay button */}
                  <div className={`pt-3 border-t flex items-center justify-between ${isDark ? 'border-slate-700/70' : 'border-slate-100'}`}>
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
                        onClick={() => handleOpenPay(loan, false)}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg transition-colors border border-emerald-500/20 flex items-center gap-1.5 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Pagar Cuota</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment History Accordion */}
              <div className={`mt-4 pt-3 border-t ${isDark ? 'border-slate-700/60' : 'border-slate-100'}`}>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleExpandHistory(loan.id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold transition-colors py-1 px-2 -ml-2 rounded-lg ${
                      isDark 
                        ? 'text-slate-300 hover:text-white hover:bg-slate-700/40' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <History className="w-3.5 h-3.5 text-blue-500" />
                    <span>Historial de pagos</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      payments.length > 0 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {payments.length}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {/* Summary of last payment if any */}
                  {lastPayment ? (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                      Último: <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{formatPaymentDate(lastPayment.date)}</strong>
                    </span>
                  ) : loan.paid_amount > 0 ? (
                    <button
                      type="button"
                      onClick={() => handleOpenPay(loan, true)}
                      className="text-[11px] text-blue-500 hover:underline font-medium"
                      title="Registrar la fecha bancaria de cuotas pasadas"
                    >
                      + Añadir fecha bancaria
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">Sin pagos</span>
                  )}
                </div>

                {/* Expanded Payment List */}
                {isExpanded && (
                  <div className={`mt-2.5 p-3 rounded-xl border text-xs space-y-2 transition-all ${
                    isDark ? 'bg-slate-900/60 border-slate-700/70' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/30">
                      <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                        Cuotas registradas ({payments.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenPay(loan, false)}
                        className="text-[11px] font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Registrar cuota
                      </button>
                    </div>

                    {payments.length > 0 ? (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {payments.map(payment => (
                          <div
                            key={payment.id}
                            className={`p-2 rounded-lg flex items-center justify-between transition-colors ${
                              isDark ? 'bg-slate-800/80 hover:bg-slate-800' : 'bg-white hover:bg-slate-100 shadow-xs'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0">
                                ✓
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    {formatPaymentDate(payment.date)}
                                  </span>
                                  <span className="font-bold text-emerald-500 text-[11px]">
                                    +{payment.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                                  </span>
                                </div>
                                {payment.notes && (
                                  <p className="text-[10px] text-slate-400 truncate max-w-[190px]" title={payment.notes}>
                                    {payment.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => promptDeletePayment(loan, payment)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors ml-2"
                              title="Eliminar este pago"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-3 text-center">
                        <p className="text-slate-400 text-[11px]">Aún no has registrado pagos con fecha.</p>
                        {loan.paid_amount > 0 && (
                          <p className="text-[10px] text-slate-500 mt-1">
                            Tienes {loan.paid_amount.toLocaleString('es-ES')}€ pagados anteriormente sin fecha asociada.
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenPay(loan, loan.paid_amount > 0)}
                          className="mt-2 px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-[11px] font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Registrar fecha de pago del banco</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
            <p className="text-slate-500 max-w-sm mb-6">Añade tus préstamos o deudas para calcular cuándo terminarás de pagarlos y registrar cada cuota con su fecha bancaria.</p>
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Empezar a registrar
            </button>
          </div>
        )}
      </div>

      {/* Pay Installment Modal */}
      {showPayModal && payingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Registrar Pago de Cuota
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {payingLoan.name} • Cuota mensual habitual: {payingLoan.installment_amount.toLocaleString('es-ES')}€
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Fecha del Pago (según tu extracto bancario)
                </label>
                <input
                  type="date"
                  required
                  value={payDate}
                  onChange={e => setPayDate(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Importe de la Cuota (€)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  placeholder="0.00"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-emerald-400' 
                      : 'bg-slate-50 border-slate-200 text-emerald-600'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Concepto / Nota (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Recibo bancario mensual, Amortización..."
                  value={payNote}
                  onChange={e => setPayNote(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* Checkbox for already included payments */}
              <div 
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  payAlreadyIncluded 
                    ? 'bg-blue-500/10 border-blue-500/30' 
                    : isDark ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
                onClick={() => setPayAlreadyIncluded(!payAlreadyIncluded)}
              >
                <input
                  type="checkbox"
                  id="payAlreadyIncluded"
                  checked={payAlreadyIncluded}
                  onChange={e => setPayAlreadyIncluded(e.target.checked)}
                  className="mt-1 rounded text-blue-600 focus:ring-blue-500 h-4 w-4 pointer-events-none"
                />
                <div className="text-xs select-none">
                  <span className={`font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Este pago ya estaba incluido en el total pagado
                  </span>
                  <span className="text-slate-400 block mt-0.5 leading-relaxed">
                    Marca esto si estás registrando la fecha de una cuota pasada que ya habías sumado en el saldo de la tarjeta, para cotejarla con el banco sin sumar el dinero de nuevo.
                  </span>
                </div>
              </div>

              {/* Summary box */}
              <div className={`p-3 rounded-xl text-xs space-y-1.5 ${isDark ? 'bg-slate-800/60 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                <div className="flex justify-between items-center">
                  <span>Total pagado:</span>
                  <span className="font-bold text-emerald-500">
                    {payingLoan.paid_amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                    {!payAlreadyIncluded && Number(String(payAmount).replace(',', '.')) > 0 && (
                      <> → {Math.min(payingLoan.total_amount, payingLoan.paid_amount + Number(String(payAmount).replace(',', '.'))).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Restante por pagar:</span>
                  <span className="font-bold text-rose-500">
                    {Math.max(0, payingLoan.total_amount - payingLoan.paid_amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                    {!payAlreadyIncluded && Number(String(payAmount).replace(',', '.')) > 0 && (
                      <> → {Math.max(0, payingLoan.total_amount - (payingLoan.paid_amount + Number(String(payAmount).replace(',', '.')))).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
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
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Pago</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Payment Confirmation Modal */}
      {deletingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-sm p-6 rounded-3xl shadow-2xl ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              ¿Eliminar registro de pago?
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Pago de <strong className="text-emerald-500">+{deletingPayment.payment.amount.toLocaleString('es-ES')}€</strong> realizado el día <strong>{formatPaymentDate(deletingPayment.payment.date)}</strong>.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleConfirmDeletePayment(true)}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all"
              >
                Eliminar y restar {deletingPayment.payment.amount.toLocaleString('es-ES')}€ del pagado
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDeletePayment(false)}
                className={`w-full py-2.5 font-bold text-xs rounded-xl border transition-all ${
                  isDark 
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800' 
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Solo quitar del historial (conservar saldo pagado)
              </button>
              <button
                type="button"
                onClick={() => setDeletingPayment(null)}
                className="w-full py-2 font-semibold text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal (Add / Edit Loan) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
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
                  placeholder="Ej. Coche, Colchón, Universidad..."
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
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total a Pagar (€)</label>
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
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ya Pagado (€)</label>
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cuota Mensual (€)</label>
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
