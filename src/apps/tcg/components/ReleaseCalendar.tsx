import React, { useState } from 'react';
import { Calendar as CalendarIcon, Globe, MapPin, Flag } from 'lucide-react';

interface MockRelease {
  id: string;
  name: string;
  region: 'Japan' | 'West';
  date: string;
  status: 'Released' | 'Imminent' | 'Pre-order' | 'Rumor';
  setPrefix: string;
}

const mockReleases: MockRelease[] = [
  { id: '1', name: 'SV5a Crimson Haze', region: 'Japan', date: '2024-03-22', status: 'Released', setPrefix: 'SV5a' },
  { id: '2', name: 'SV6 Twilight Masquerade', region: 'West', date: '2024-05-24', status: 'Released', setPrefix: 'TWM' },
  { id: '3', name: 'SV6a Night Wanderer', region: 'Japan', date: '2024-06-07', status: 'Released', setPrefix: 'SV6a' },
  { id: '4', name: 'SV6.5 Shrouded Fable', region: 'West', date: '2024-08-02', status: 'Imminent', setPrefix: 'SFA' },
  { id: '5', name: 'SV7 Stellar Miracle', region: 'Japan', date: '2024-07-19', status: 'Released', setPrefix: 'SV7' },
  { id: '6', name: 'SV7 Stellar Crown', region: 'West', date: '2024-09-13', status: 'Pre-order', setPrefix: 'SCR' },
  { id: '7', name: 'SV7a Paradise Dragona', region: 'Japan', date: '2024-09-13', status: 'Pre-order', setPrefix: 'SV7a' },
  { id: '8', name: 'SV8 Surging Sparks', region: 'West', date: '2024-11-08', status: 'Rumor', setPrefix: 'SSP' },
];

export const ReleaseCalendar: React.FC = () => {
  const [regionFilter, setRegionFilter] = useState<'All' | 'Japan' | 'West'>('All');

  const filteredReleases = mockReleases
    .filter(r => regionFilter === 'All' || r.region === regionFilter)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Released': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Imminent': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Pre-order': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Rumor': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
            Roadmap TCG (Lanzamientos)
          </h2>
          <p className="text-sm text-slate-400 mt-1">Sigue la pista a las próximas colecciones y expansiones especiales.</p>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setRegionFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${regionFilter === 'All' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setRegionFilter('Japan')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${regionFilter === 'Japan' ? 'bg-rose-500/20 text-rose-400 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Japón
          </button>
          <button 
            onClick={() => setRegionFilter('West')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${regionFilter === 'West' ? 'bg-blue-500/20 text-blue-400 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Occidente
          </button>
        </div>
      </div>

      <div className="relative border-l-2 border-slate-800 ml-3 md:ml-6 space-y-8 py-4">
        {filteredReleases.map((release, i) => (
          <div key={release.id} className="relative pl-6 md:pl-8 group">
            {/* Timeline Dot */}
            <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-slate-900 ${
              release.status === 'Released' ? 'bg-emerald-500' :
              release.status === 'Imminent' ? 'bg-yellow-500' :
              release.status === 'Pre-order' ? 'bg-blue-500' : 'bg-purple-500'
            }`} />

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 hover:border-indigo-500/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-500">{release.setPrefix}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusColor(release.status)}`}>
                      {release.status}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                      release.region === 'Japan' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {release.region === 'Japan' ? <Flag className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                      {release.region}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{release.name}</h3>
                </div>
                
                <div className="text-left sm:text-right">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-0.5">Fecha de Salida</p>
                  <p className="font-mono text-sm font-bold text-indigo-300">
                    {new Date(release.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
