import React, { useState, useEffect } from 'react';
import { Home, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export const RentView: React.FC = () => {
  const { isDark } = useTheme();
  
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const contractEndDate = new Date('2027-03-05T00:00:00');
  // 30 days before the contract ends
  const noticeDeadlineDate = new Date(contractEndDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  const calculateRemaining = (targetDate: Date) => {
    const diff = targetDate.getTime() - now.getTime();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, expired: false };
  };

  const contractRemaining = calculateRemaining(contractEndDate);
  const noticeRemaining = calculateRemaining(noticeDeadlineDate);

  const renderTimer = (remaining: ReturnType<typeof calculateRemaining>, title: string, subtitle: string, icon: React.ReactNode, isWarning: boolean = false) => {
    return (
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-3 rounded-xl ${isWarning ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
            {icon}
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>
          </div>
        </div>

        {remaining.expired ? (
          <div className="text-center py-8">
            <span className={`text-2xl font-bold ${isWarning ? 'text-amber-500' : 'text-blue-500'}`}>¡El plazo ha expirado!</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Días', value: remaining.days },
              { label: 'Horas', value: remaining.hours },
              { label: 'Minutos', value: remaining.minutes },
              { label: 'Segundos', value: remaining.seconds },
            ].map((unit, idx) => (
              <div key={idx} className={`flex flex-col items-center justify-center p-4 rounded-xl ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {unit.value}
                </span>
                <span className={`text-xs uppercase tracking-wider mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Home className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Gestión de Alquiler
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderTimer(
          contractRemaining,
          "Fin de Contrato",
          "5 de Marzo de 2027",
          <Calendar className="w-6 h-6" />
        )}
        
        {renderTimer(
          noticeRemaining,
          "Límite de Preaviso",
          "30 días antes del fin de contrato",
          <AlertCircle className="w-6 h-6" />,
          true
        )}
      </div>
      
      <div className={`p-4 rounded-xl text-sm flex gap-3 items-start ${isDark ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
        <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p>
          Recuerda que si decides no renovar o quieres dejar el piso, debes notificarlo al propietario al menos 30 días antes de que finalice el contrato.
        </p>
      </div>
    </div>
  );
};
