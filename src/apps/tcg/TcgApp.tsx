import React, { useState } from 'react';
import { ArrowLeft, Package, MapPin, Calendar, Rss } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { PortfolioTracker } from './components/PortfolioTracker';
import { StoreRadar } from './components/StoreRadar';
import { ReleaseCalendar } from './components/ReleaseCalendar';
import { NewsFeed } from './components/NewsFeed';

interface TcgAppProps {
  onBack: () => void;
}

export const TcgApp: React.FC<TcgAppProps> = ({ onBack }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'radar' | 'calendar' | 'news'>('portfolio');

  const tabs = [
    { id: 'portfolio', label: 'Portfolio Tracker', icon: Package },
    { id: 'radar', label: 'Tiendas & Radar', icon: MapPin },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'news', label: 'Noticias / Recursos', icon: Rss },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
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
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-400">
                Pokémon TCG Tracker
              </h1>
              <p className="text-sm font-medium text-slate-400">
                Gestiona tu colección, lanzamientos y mercado
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1 rounded-2xl bg-slate-900/50 border border-slate-800 w-full sm:w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-yellow-500/20 to-red-500/20 text-yellow-400 border border-yellow-500/30 shadow-lg shadow-yellow-500/10'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="min-h-[60vh]">
        {activeTab === 'portfolio' && <PortfolioTracker />}
        {activeTab === 'radar' && <StoreRadar />}
        {activeTab === 'calendar' && <ReleaseCalendar />}
        {activeTab === 'news' && <NewsFeed />}
      </div>
    </div>
  );
};
