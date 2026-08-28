import React, { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, Search, Plus, Award, CheckCircle, ShieldAlert, Footprints, RefreshCw, Phone, Calendar, Save, Trash2, Route, ArrowLeft, Target, Sparkles } from 'lucide-react';
import { LoreClient, LoreSavedRoute } from '../../types';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { LoreGoalsCalculator } from './LoreGoalsCalculator';
import { LorePharmaciesCRM } from './LorePharmaciesCRM';

interface LoreAppProps {
  onBack?: () => void;
}

const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // km
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};

export const LoreApp: React.FC<LoreAppProps> = ({ onBack }) => {
  const { canEditApp } = useAuth();
  const canEdit = canEditApp('lore');

  // Sub-pestañas: Objetivos Drasanvi vs Seguimiento CRM vs Rutas Mapa
  const [activeSubTab, setActiveSubTab] = useState<'goals' | 'crm' | 'routes'>('goals');

  const [clientes, setClientes] = useState<LoreClient[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDecil, setSelectedDecil] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<LoreClient | null>(null);

  // Ruta seleccionada actualmente (lista de IDs de clientes en orden)
  const [routeClientIds, setRouteClientIds] = useState<string[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<LoreSavedRoute[]>([]);
  const [routeNameInput, setRouteNameInput] = useState('');

  // Coordenadas iniciales (Madrid Centro)
  const [userCoords, setUserCoords] = useState({ lat: 40.4168, lng: -3.7038 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const polylineRef = useRef<any>(null);

  const loadData = async () => {
    const list = await storageService.getLoreClients();
    const routes = await storageService.getSavedRoutes();
    setClientes(list);
    setSavedRoutes(routes);

    if (list.length > 0 && !selectedClient) {
      setSelectedClient(list[0]);
    }
  };

  useEffect(() => {
    loadData();
    storageService.syncFromCloud().then(() => {
      loadData();
    });

    const unsubscribe = storageService.onSync(() => {
      loadData();
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }

    return () => unsubscribe();
  }, []);

  const [mapReady, setMapReady] = useState(false);

  // Inicializar mapa de Leaflet dinámicamente
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current || activeSubTab !== 'routes') return;

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;
      LRef.current = L;

      if (!mapRef.current) {
        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
          attributionControl: false
        }).setView([userCoords.lat, userCoords.lng], 10);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        mapRef.current = map;
        setMapReady(true);
      }
    };

    if (!(window as any).L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = {};
        polylineRef.current = null;
        setMapReady(false);
      }
    };
  }, [activeSubTab, userCoords.lat, userCoords.lng]);

  // Actualizar marcadores y polilínea de ruta en el mapa
  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !L || activeSubTab !== 'routes') return;

    // Limpiar marcadores viejos
    Object.values(markersRef.current).forEach((m: any) => map.removeLayer(m));
    markersRef.current = {};
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    // Dibujar marcadores de clientes
    clientes.forEach(c => {
      const isInRoute = routeClientIds.includes(c.id);
      const isSelected = selectedClient?.id === c.id;

      const decilColor = c.decil === 'D10' ? '#10B981' : c.decil === 'D09' ? '#6366F1' : c.decil === 'D08' ? '#A855F7' : '#F59E0B';

      const customHtml = `
        <div style="
          background: ${isSelected ? '#EC4899' : isInRoute ? '#3B82F6' : decilColor};
          width: ${isSelected ? '28px' : '22px'};
          height: ${isSelected ? '28px' : '22px'};
          border-radius: 50%;
          border: 3px solid #0B0F19;
          box-shadow: 0 0 12px ${decilColor};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 10px;
        ">
          ${c.decil || 'D'}
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: 'custom-leaflet-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([c.latitud, c.longitud], { icon: customIcon }).addTo(map);
      marker.bindPopup(`<b>${c.nombre}</b><br/>${c.direccion}<br/>Decil: <b>${c.decil}</b>`);
      marker.on('click', () => setSelectedClient(c));

      markersRef.current[c.id] = marker;
    });

    // Dibujar línea de la ruta activa
    if (routeClientIds.length > 1) {
      const points = routeClientIds
        .map(id => clientes.find(c => c.id === id))
        .filter(Boolean)
        .map(c => [c!.latitud, c!.longitud]);

      polylineRef.current = L.polyline(points, {
        color: '#6366F1',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 8'
      }).addTo(map);

      map.fitBounds(polylineRef.current.getBounds(), { padding: [40, 40] });
    }
  }, [clientes, routeClientIds, selectedClient, activeSubTab, mapReady]);

  // Alternar inclusión de cliente en la ruta activa
  const toggleClientInRoute = (clientId: string) => {
    if (routeClientIds.includes(clientId)) {
      setRouteClientIds(routeClientIds.filter(id => id !== clientId));
    } else {
      setRouteClientIds([...routeClientIds, clientId]);
    }
  };

  // Generador de Ruta Inteligente Recomendada (Prioridad por Deciles D10 -> D09)
  const generateRecommendedRoute = () => {
    const sorted = [...clientes].sort((a, b) => {
      const decilScore: { [key: string]: number } = { D10: 4, D09: 3, D08: 2, D07: 1 };
      const scoreA = decilScore[a.decil || 'D07'] || 0;
      const scoreB = decilScore[b.decil || 'D07'] || 0;
      return scoreB - scoreA;
    });

    const recommendedIds = sorted.slice(0, 4).map(c => c.id);
    setRouteClientIds(recommendedIds);
  };

  // Guardar Ruta
  const handleSaveRoute = async () => {
    if (routeClientIds.length === 0) return;
    const name = routeNameInput.trim() || `Ruta ${new Date().toLocaleDateString()}`;
    const totalKm = calculateRouteDistance();

    await storageService.saveRoute(name, routeClientIds, totalKm);
    setRouteNameInput('');
    await loadData();
  };

  // Calcular distancia total de la ruta actual
  const calculateRouteDistance = () => {
    if (routeClientIds.length < 2) return 0;
    let dist = 0;
    for (let i = 0; i < routeClientIds.length - 1; i++) {
      const c1 = clientes.find(c => c.id === routeClientIds[i]);
      const c2 = clientes.find(c => c.id === routeClientIds[i + 1]);
      if (c1 && c2) {
        dist += getDistanceInKm(c1.latitud, c1.longitud, c2.latitud, c2.longitud);
      }
    }
    return Number(dist.toFixed(1));
  };

  const filteredClientes = clientes.filter(c => {
    const matchesSearch = (c.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
   (c.direccion || '').toLowerCase().includes(search.toLowerCase()) ||
   ((c.ciudad || '') && (c.ciudad || '').toLowerCase().includes(search.toLowerCase()));
    const matchesDecil = selectedDecil === 'all' || c.decil === selectedDecil;
    return matchesSearch && matchesDecil;
  });

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs Bar (Cuadro de Mandos Drasanvi vs Mapa Rutas) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              title="Volver a la Plataforma"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center justify-center group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 p-1 rounded-xl bg-slate-950/60 border border-slate-800/80 w-full sm:w-auto">
            <button
              onClick={() => setActiveSubTab('goals')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'goals'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>🌸</span>
              <span>Cuadro de Mandos (Drasanvi)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('crm')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'crm'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>🏥</span>
              <span>Seguimiento Farmacias (CRM)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('routes')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'routes'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Mapa & Rutas Comerciales</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 px-3 hidden lg:flex">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Módulo Lore Activo</span>
        </div>
      </div>

      {/* Conditionally Render: Cuadro de Mandos (Goals) vs CRM vs Map & Routes */}
      {activeSubTab === 'goals' ? (
        <LoreGoalsCalculator />
      ) : activeSubTab === 'crm' ? (
        <LorePharmaciesCRM />
      ) : (
        <div className="space-y-6">
          {/* Header Banner for Routes */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-600/10 via-cyan-600/10 to-transparent p-6 rounded-2xl border border-blue-500/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
                <Navigation className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">GESTOR DE RUTAS Y MAPA COMERCIAL</h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Módulo Activo</span>
                </div>
                <p className="text-slate-400 text-sm">Optimización de itinerarios por Deciles (D07-D10), mapa GPS y recomendaciones de visita.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={generateRecommendedRoute}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
              >
                <Award className="w-4 h-4 text-amber-400" />
                Generar Ruta Recomendada
              </button>
            </div>
          </div>

      {/* Main Grid Layout: Interactive Map + Route Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-2 rounded-2xl border border-slate-800 relative overflow-hidden h-[480px]">
            <div ref={mapContainerRef} className="w-full h-full rounded-xl z-10" />
            <div className="absolute top-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs space-y-1.5 shadow-xl">
              <p className="font-bold text-white mb-1">Leyenda de Deciles</p>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold"><span className="w-3 h-3 rounded-full bg-emerald-500" /> D10 (Ventas VIP)</div>
              <div className="flex items-center gap-2 text-indigo-400 font-semibold"><span className="w-3 h-3 rounded-full bg-indigo-500" /> D09 (Ventas Altas)</div>
              <div className="flex items-center gap-2 text-purple-400 font-semibold"><span className="w-3 h-3 rounded-full bg-purple-500" /> D08 (Ventas Medias)</div>
              <div className="flex items-center gap-2 text-amber-400 font-semibold"><span className="w-3 h-3 rounded-full bg-amber-500" /> D07 (Ventas Estándar)</div>
            </div>
          </div>

          {/* Active Route Summary Bar */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-indigo-500">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Route className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Ruta Activa Seleccionada</p>
                <p className="text-lg font-bold text-white mt-0.5">
                  {routeClientIds.length} Paradas ({calculateRouteDistance()} km totales)
                </p>
              </div>
            </div>

            {canEdit && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Nombre de la Ruta..."
                  value={routeNameInput}
                  onChange={e => setRouteNameInput(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSaveRoute}
                  disabled={routeClientIds.length === 0}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Save className="w-4 h-4" /> Guardar Ruta
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Directory & Client Selection Sidebar (1 col) */}
        <div className="space-y-4">
          <div className="glass-panel p-5 rounded-2xl space-y-4 h-[580px] flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                Directorio de Farmacias & Clientes
              </h2>

              {/* Search & Decil filter */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar cliente, ciudad..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {['all', 'D10', 'D09', 'D08', 'D07'].map(decil => (
                    <button
                      key={decil}
                      onClick={() => setSelectedDecil(decil)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                        selectedDecil === decil 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {decil === 'all' ? 'Todos' : decil}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clients List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
              {filteredClientes.map(client => {
                const isInRoute = routeClientIds.includes(client.id);
                const isSelected = selectedClient?.id === client.id;

                return (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-slate-800/90 border-blue-500'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white text-xs leading-tight">{client.nombre}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        client.decil === 'D10' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        client.decil === 'D09' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                        'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {client.decil}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" /> {client.direccion}
                    </p>

                    <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                      <span className="text-[10px] text-slate-500">Ventas 2026: {(client.total_2026 || 0).toLocaleString()} €</span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleClientInRoute(client.id);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                          isInRoute 
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {isInRoute ? '- Quitar' : '+ Añadir a Ruta'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
);
};
