import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((msg: string) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg: string) => addToast(msg, 'error'), [addToast]);
  const warning = useCallback((msg: string) => addToast(msg, 'warning'), [addToast]);
  const info = useCallback((msg: string) => addToast(msg, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, error, warning, info }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-xl backdrop-blur-md border animate-in fade-in slide-in-from-bottom-5 duration-300 min-w-[280px] max-w-sm
              ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''}
              ${toast.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : ''}
              ${toast.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : ''}
              ${toast.type === 'info' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : ''}
            `}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
              {toast.type === 'info' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
              
              <span className="text-sm font-semibold text-white">{toast.message}</span>
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors focus:outline-none"
            >
              <X className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
