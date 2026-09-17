import React, { useState } from 'react';
import { Calendar as CalendarIcon, Globe, Flag, Clock, Store, Sparkles, ChevronRight } from 'lucide-react';

interface ReleaseEvent {
  id: string;
  name: string;
  date: string;
  type: 'Expansion' | 'Special Set' | 'Store Event';
  region: 'Global' | 'Japan' | 'West';
  status: 'Released' | 'Imminent' | 'Upcoming' | 'Rumor';
  description: string;
  storeAvailability?: string;
  iconColor: string;
}

const futureReleases: ReleaseEvent[] = [
  {
    id: 'r1',
    name: 'Pokémon 30th Celebration (Japón)',
    date: '2026-09-16',
    type: 'Special Set',
    region: 'Japan',
    status: 'Released',
    description: 'Set especial conmemorativo del 30 aniversario con colección clásica de reprints.',
    iconColor: 'bg-rose-500'
  },
  {
    id: 'r2',
    name: '30th Celebration ETB (Edición Inglés)',
    date: '2026-09-22',
    type: 'Store Event',
    region: 'West',
    status: 'Imminent',
    description: 'Llegada oficial de las cajas ETB del 30 Aniversario en su versión inglesa.',
    storeAvailability: 'Stock en Carrefour, El Corte Inglés y Game',
    iconColor: 'bg-amber-500'
  },
  {
    id: 'r3',
    name: 'Delta Reign',
    date: '2026-11-06',
    type: 'Expansion',
    region: 'Global',
    status: 'Upcoming',
    description: 'Tercera gran expansión de Legends Z-A protagonizada por Mega Rayquaza ex.',
    iconColor: 'bg-emerald-500'
  },
  {
    id: 'r4',
    name: 'Ascended Heroes',
    date: '2027-01-30',
    type: 'Expansion',
    region: 'Global',
    status: 'Upcoming',
    description: 'Primera expansión del año 2027 continuando la era Mega Evolution y nuevas mecánicas.',
    iconColor: 'bg-blue-500'
  },
  {
    id: 'r5',
    name: 'Perfect Order',
    date: '2027-03-27',
    type: 'Expansion',
    region: 'Global',
    status: 'Rumor',
    description: 'Colección de primavera enfocada en Ciudad Luminalia (Lumiose City) con más de 120 cartas.',
    iconColor: 'bg-purple-500'
  },
  {
    id: 'r6',
    name: 'Chaos Rising',
    date: '2027-05-22',
    type: 'Expansion',
    region: 'Global',
    status: 'Rumor',
    description: 'Cuarta expansión del bloque base de Legends Z-A con nuevas rarezas Illustration.',
    iconColor: 'bg-slate-500'
  }
];

export const ReleaseCalendar: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'Global' | 'Japan' | 'West'>('All');

  const filteredReleases = futureReleases
    .filter(r => filter === 'All' || r.region === filter || r.region === 'Global')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getDaysRemaining = (dateString: string) => {
    const diffTime = new Date(dateString).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Lanzado';
    if (diffDays === 0) return '¡Hoy!';
    return `Faltan ${diffDays} días`;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/50 p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <CalendarIcon className="w-32 h-32 text-indigo-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3 h-3" /> Roadmap 2026 - 2027
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Calendario de Lanzamientos</h2>
            <p className="text-slate-400 mt-2 max-w-lg leading-relaxed">Sigue la pista a las próximas colecciones y mantente alerta sobre la llegada de stock a tiendas físicas.</p>
          </div>
          
          <div className="flex bg-slate-950/50 p-1.5 rounded-xl border border-slate-700/50 backdrop-blur-sm self-start md:self-auto">
            {['All', 'Japan', 'West'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === f ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
              >
                {f === 'All' ? 'Todos' : f === 'Japan' ? 'Japón' : 'Occidente'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-12">
        <div className="absolute left-[39px] md:left-[43px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-indigo-500/50 via-purple-500/20 to-transparent rounded-full" />
        
        <div className="space-y-6">
          {filteredReleases.map((release) => {
            const daysText = getDaysRemaining(release.date);
            const isReleased = daysText === 'Lanzado';
            
            return (
              <div key={release.id} className="relative pl-24 md:pl-28 group">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-16 md:w-20 z-10">
                  <div className={`w-8 h-8 rounded-full border-4 border-slate-950 flex items-center justify-center shadow-xl ${release.iconColor}`}>
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>

                <div className={`relative bg-slate-800/40 backdrop-blur-md border rounded-2xl p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 ${isReleased ? 'border-slate-700/50 opacity-70' : 'border-slate-600 hover:border-indigo-500/50'}`}>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-700">
                        {release.type}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                        release.region === 'Japan' ? 'bg-rose-950 text-rose-400 border border-rose-900' : 
                        release.region === 'West' ? 'bg-blue-950 text-blue-400 border border-blue-900' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-900'
                      }`}>
                        {release.region === 'Japan' ? <Flag className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                        {release.region}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${isReleased ? 'bg-slate-900/50 text-slate-500' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                      <Clock className="w-3.5 h-3.5" />
                      {daysText}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                        {release.name}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        {release.description}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-300 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800">
                          <CalendarIcon className="w-4 h-4 text-slate-500" />
                          <span className="font-medium">{new Date(release.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        
                        {release.storeAvailability && (
                          <div className="flex items-center gap-2 text-amber-200 bg-amber-950/30 px-3 py-2 rounded-lg border border-amber-900/50">
                            <Store className="w-4 h-4 text-amber-500" />
                            <span className="font-medium">{release.storeAvailability}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="hidden md:flex shrink-0 w-12 h-12 rounded-full bg-slate-700/30 items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 mt-2">
                      <ChevronRight className="w-6 h-6 text-indigo-400" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
