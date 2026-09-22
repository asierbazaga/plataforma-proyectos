import React from 'react';
import { Bitcoin, LineChart, Wallet } from 'lucide-react';

export const CriptosApp: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border-orange-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Portfolio Total</h3>
          </div>
          <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
            $0.00
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border-emerald-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <LineChart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Rendimiento (24h)</h3>
          </div>
          <p className="text-2xl font-black text-emerald-400">
            +0.00%
          </p>
        </div>
        
        <div className="glass-panel p-6 rounded-3xl border-blue-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Bitcoin className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Mayor Posición</h3>
          </div>
          <p className="text-2xl font-black text-blue-400">
            BTC
          </p>
        </div>
      </div>

      <div className="glass-panel p-12 rounded-3xl text-center border-slate-700/50">
        <Bitcoin className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Módulo en Construcción</h2>
        <p className="text-slate-400">
          Próximamente podrás añadir tus wallets, hacer seguimiento de tus criptomonedas favoritas y ver análisis del mercado.
        </p>
      </div>
    </div>
  );
};
