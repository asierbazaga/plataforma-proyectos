import React, { useState } from 'react';
import { Calendar as CalendarIcon, Globe, Flag, Clock, Store, Sparkles, ChevronRight, Image as ImageIcon } from 'lucide-react';

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
  imageUrl: string;
}

const futureReleases: ReleaseEvent[] = [
  {
    id: 'r1',
    name: 'Pokémon 30th Celebration (Japón)',
    date: '2026-09-16',
    type: 'Special Set',
    region: 'Japan',
    status: 'Released',
    description: 'Set especial conmemorativo del 30 aniversario con colección clásica de reprints y 30 Pikachu raros.',
    imageUrl: 'https://product-images.tcgplayer.com/fit-in/437x437/704143.jpg',
    iconColor: 'bg-rose-500'
  },
  {
    id: 'r2',
    name: '30th Celebration ETB (Inglés)',
    date: '2026-09-22',
    type: 'Store Event',
    region: 'West',
    status: 'Imminent',
    description: 'Llegada oficial de las cajas ETB del 30 Aniversario en su versión inglesa.',
    storeAvailability: 'Stock en Carrefour, El Corte Inglés y Game',
    imageUrl: 'https://product-images.tcgplayer.com/fit-in/437x437/704143.jpg',
    iconColor: 'bg-amber-500'
  },
  {
    id: 'r3',
    name: 'Delta Reign',
    date: '2026-11-06',
    type: 'Expansion',
    region: 'Global',
    status: 'Upcoming',
    description: 'Tercera gran expansión del bloque Legends Z-A protagonizada por Mega Rayquaza ex.',
    imageUrl: 'https://product-images.tcgplayer.com/fit-in/437x437/97435.jpg',
    iconColor: 'bg-emerald-500'
  },
  {
    id: 'r4',
    name: 'Ascended Heroes (Restock)',
    date: '2027-01-30',
    type: 'Store Event',
    region: 'Global',
    status: 'Upcoming',
    description: 'Segunda oleada masiva de reimpresión de las ETB y cajas de esta cotizada expansión original de Enero 2026.',
    storeAvailability: 'Bajo reserva en tiendas especializadas',
    imageUrl: 'https://product-images.tcgplayer.com/fit-in/437x437/242434.jpg',
    iconColor: 'bg-blue-500'
  },
  {
    id: 'r5',
    name: 'Aura Seeker (Occidente)',
    date: '2027-02-19',
    type: 'Expansion',
    region: 'West',
    status: 'Rumor',
    description: 'Llegada a occidente del set que introduce las "Z" Mega Evolutions. Rumores apuntan a Lucario Z.',
    imageUrl: 'https://product-images.tcgplayer.com/fit-in/437x437/268500.jpg',
    iconColor: 'bg-indigo-500'
  },
  {
    id: 'r6',
    name: 'MEGA x MEGA Parade',
    date: '2027-02-26',
    type: 'Special Set',
    region: 'Japan',
    status: 'Rumor',
    description: 'Set "High-Class" japonés que marcará el gran final del bloque Mega Evolution con cartas garantizadas Ultra Rare.',
    imageUrl: 'https://product-images.tcgplayer.com/fit-in/437x437/451457.jpg',
    iconColor: 'bg-rose-500'
  },
  {
    id: 'r7',
    name: 'Pokémon ex☆ (Nueva Era)',
    date: '2027-05-14',
    type: 'Expansion',
    region: 'Global',
    status: 'Rumor',
    description: 'Debut oficial del nuevo bloque ex☆ (ex-star) basado en los próximos juegos Pokémon Winds / Waves.',
    imageUrl: 'https://product-images.tcgplayer.com/fit-in/437x437/528040.jpg',
    iconColor: 'bg-purple-500'
  }
];

export const ReleaseCalendar: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'Global' | 'Japan' | 'West'>('All');
  const [selectedEventId, setSelectedEventId] = useState<string>(futureReleases[0].id);

  const filteredReleases = futureReleases
    .filter(r => filter === 'All' || r.region === filter || r.region === 'Global')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const selectedEvent = futureReleases.find(r => r.id === selectedEventId) || filteredReleases[0];

  const getDaysRemaining = (dateString: string) => {
    const diffTime = new Date(dateString).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Lanzado';
    if (diffDays === 0) return '¡Hoy!';
    return `Faltan ${diffDays} días`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
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

      <div className="flex flex-col lg:flex-row gap-8 mt-12">
        <div className="flex-1 relative">
          <div className="absolute left-[39px] md:left-[43px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-indigo-500/50 via-purple-500/20 to-transparent rounded-full" />
          
          <div className="space-y-6">
            {filteredReleases.map((release) => {
              const daysText = getDaysRemaining(release.date);
              const isReleased = daysText === 'Lanzado';
              const isSelected = selectedEventId === release.id;
              
              return (
                <div 
                  key={release.id} 
                  className="relative pl-24 md:pl-28 group cursor-pointer"
                  onClick={() => setSelectedEventId(release.id)}
                >
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-16 md:w-20 z-10">
                    <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center shadow-xl transition-all duration-300 ${isSelected ? 'border-white scale-125' : 'border-slate-950'} ${release.iconColor}`}>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>

                  <div className={`relative bg-slate-800/40 backdrop-blur-md border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${isSelected ? 'border-indigo-400 shadow-indigo-500/20 shadow-xl bg-slate-800/80' : isReleased ? 'border-slate-700/50 opacity-70' : 'border-slate-600 hover:border-indigo-500/50'}`}>
                    
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
                        <h3 className={`text-xl font-bold mb-2 transition-colors ${isSelected ? 'text-indigo-300' : 'text-white group-hover:text-indigo-300'}`}>
                          {release.name}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-slate-300 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800 w-fit text-sm">
                          <CalendarIcon className="w-4 h-4 text-slate-500" />
                          <span className="font-medium">{new Date(release.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                      </div>
                      
                      <div className={`hidden md:flex shrink-0 w-10 h-10 rounded-full items-center justify-center transition-all duration-300 ${isSelected ? 'bg-indigo-500/20 text-indigo-300 translate-x-0' : 'bg-slate-700/30 text-slate-500 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0'} mt-2`}>
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0">
          <div className="sticky top-8 bg-slate-900/80 border border-slate-700/50 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center p-8 group">
              {selectedEvent?.imageUrl ? (
                <img 
                  src={selectedEvent.imageUrl} 
                  alt={selectedEvent.name} 
                  className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div className="absolute inset-0 hidden flex-col items-center justify-center text-slate-600 bg-slate-900">
                <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-sm font-medium">Imagen no disponible</p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700/50">
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-3 h-3 rounded-full ${selectedEvent.iconColor} shadow-lg`} />
                <h3 className="text-xl font-bold text-white leading-tight">
                  {selectedEvent.name}
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {selectedEvent.description}
              </p>
              
              {selectedEvent.storeAvailability && (
                <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                  <Store className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Disponibilidad en tiendas</p>
                    <p className="text-sm text-amber-200/80 font-medium">{selectedEvent.storeAvailability}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
