import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, Package, Bitcoin } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ColeccionismoApp } from './ColeccionismoApp';
import { CriptosApp } from './CriptosApp';

interface InversionesAppProps {
  onBack: () => void;
}

export const InversionesApp: React.FC<InversionesAppProps> = ({ onBack }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'coleccionismo' | 'criptos'>('coleccionismo');

  return (
    <div className="space-y-6 pb-24">
      {/* Header General de Inversiones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className={`p-2.5 rounded-xl transition-colors ${
              isDark 
                ? 'hover:bg-slate-800 text-slate-400 hover:text-white' 
                : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
            }`}
            title="Volver al catálogo"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500 via-amber-500 to-red-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-400">
                Inversiones & Portfolio
              </h1>
              <p className="text-sm font-medium text-slate-400">
                Gestiona tus inversiones en Criptomonedas y Coleccionismo TCG
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs (Criptos vs Coleccionismo) */}
      <div className="flex gap-4 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('coleccionismo')}
          className={`flex items-center gap-2 px-4 py-2 font-bold transition-colors border-b-2 ${
            activeTab === 'coleccionismo'
              ? 'border-yellow-500 text-yellow-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Package className="w-5 h-5" />
          Coleccionismo TCG
        </button>
        <button
          onClick={() => setActiveTab('criptos')}
          className={`flex items-center gap-2 px-4 py-2 font-bold transition-colors border-b-2 ${
            activeTab === 'criptos'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Bitcoin className="w-5 h-5" />
          Criptomonedas
        </button>
      </div>

      {/* Render Active Module */}
      <div className="mt-6">
        {activeTab === 'coleccionismo' && <ColeccionismoApp />}
        {activeTab === 'criptos' && <CriptosApp />}
      </div>
    </div>
  );
};
