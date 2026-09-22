import React, { useState } from 'react';
import { Package, MapPin, Calendar, Rss } from 'lucide-react';
import { PortfolioTracker } from './components/PortfolioTracker';
import { StoreRadar } from './components/StoreRadar';
import { ReleaseCalendar } from './components/ReleaseCalendar';
import { NewsFeed } from './components/NewsFeed';

export const ColeccionismoApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'radar' | 'calendar' | 'news'>('portfolio');

  const tabs = [
    { id: 'portfolio', label: 'Portfolio Tracker', icon: Package },
    { id: 'radar', label: 'Tiendas & Radar', icon: MapPin },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'news', label: 'Noticias / Recursos', icon: Rss },
  ];

  return (
    <div className="space-y-6">
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
