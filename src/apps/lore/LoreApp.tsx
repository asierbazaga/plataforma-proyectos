import React, { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, Search, Plus, Award, CheckCircle, ShieldAlert, Footprints, RefreshCw, Phone, Calendar, Save, Trash2, Route, ArrowLeft, Target, Sparkles, ArrowUp, ArrowDown, Share2, Zap, Map } from 'lucide-react';
import { LoreClient, LoreSavedRoute } from '../../types';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoreGoalsCalculator } from './LoreGoalsCalculator';
import { LorePharmaciesCRM } from './LorePharmaciesCRM';
import { useTheme } from '../../context/ThemeContext';

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
  const toast = useToast();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Sub-pestañas: Objetivos Drasanvi vs Seguimiento CRM vs Rutas Mapa
  const [activeSubTab, setActiveSubTab] = useState<'goals' | 'crm' | 'routes'>('goals');

  const [clientes, setClientes] = useState<LoreClient[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDecil, setSelectedDecil] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<LoreClient | null>(null);

  // Ruta seleccionada actualmente (lista de IDs de clientes en orden)
  const [routeClientIds, setRouteClientIds] = useState<string[]>([]);
  const [rejectedSubstitutes, setRejectedSubstitutes] = useState<string[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<LoreSavedRoute[]>([]);
  const [routeNameInput, setRouteNameInput] = useState('');

  // Coordenadas iniciales (Madrid Centro)
  const [userCoords, setUserCoords] = useState({ lat: 40.4168, lng: -3.7038 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const polylineRef = useRef<any>(null);

  const CITY_COORDS: Record<string, [number, number]> = {
    'gijon': [43.5322, -5.6611],
    'gijón': [43.5322, -5.6611],
    'oviedo': [43.3614, -5.8593],
    'santander': [43.4623, -3.8099],
    'aviles': [43.5562, -5.9248],
    'avilés': [43.5562, -5.9248],
    'torrelavega': [43.3499, -4.0479],
    'mieres': [43.2505, -5.7744],
    'siero': [43.3917, -5.6611],
    'langreo': [43.2965, -5.6833],
    'castropol': [43.5431, -7.0272],
    'candas': [43.5900, -5.7651],
    'bimenes': [43.3323, -5.5670]
  };

  const hashString = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return Math.abs(h);
  };

  const getCityBaseCoords = (city: string): [number, number] => {
    const cityKey = (city || '').toLowerCase().trim();
    if (CITY_COORDS[cityKey]) return CITY_COORDS[cityKey];
    
    // Coordenadas basadas en hash
    const h = hashString(cityKey);
    const lat = 43.1 + ((h % 500) / 1000);
    const lng = -6.5 + (((h >> 4) % 300) / 100);
    return [lat, lng];
  };

  const loadData = async () => {
    const crmItems = await storageService.getLoreCRMItems();
    
    // Contador para hacer la espiral determinista por ciudad
    const cityCounts: Record<string, number> = {};

    const mappedClients: LoreClient[] = crmItems
      .filter(item => item.category_type === 'cliente' || item.category_type === 'prospeccion')
      .map(item => {
        const cityKey = (item.ciudad || '').toLowerCase().trim();
        const baseCoords = getCityBaseCoords(item.ciudad);
        
        if (!cityCounts[cityKey]) cityCounts[cityKey] = 0;
        const index = cityCounts[cityKey]++;
        
        // Espiral de Fermat (Golden Angle) para distribuir marcadores estéticamente sin solaparse
        const angle = index * 137.5 * (Math.PI / 180);
        const radius = 0.0006 * Math.sqrt(index);
        
        const jitterLat = radius * Math.cos(angle);
        const jitterLng = radius * Math.sin(angle) * 1.5; // * 1.5 por compensación de aspecto del mapa

        // Usar coordenadas reales si existen en la BD, si no, generar espiral
        let finalLat = Number(item.latitud);
        let finalLng = Number(item.longitud);

        if (!finalLat || !finalLng || isNaN(finalLat) || isNaN(finalLng)) {
          finalLat = isNaN(baseCoords[0] + jitterLat) ? 43.3614 : baseCoords[0] + jitterLat;
          finalLng = isNaN(baseCoords[1] + jitterLng) ? -5.8593 : baseCoords[1] + jitterLng;
        }

        return {
          id: item.id,
          nombre: item.farmacia_nombre,
          tipo: item.category_type === 'prospeccion' ? 'Prospección' : 'Farmacia',
          contacto_nombre: item.contacto || '---',
          direccion: item.direccion ? `${item.direccion}, ${item.ciudad}` : item.ciudad + (item.provincia ? ` (${item.provincia})` : ''),
          latitud: finalLat,
          longitud: finalLng,
          ultima_visita_at: item.ultima_visita || null,
          decil: item.decil,
          ciudad: item.ciudad,
          provincia: item.provincia
        };
      });

    const routes = await storageService.getSavedRoutes();
    setClientes(mappedClients);
    setSavedRoutes(routes);

    if (mappedClients.length > 0 && !selectedClient) {
      setSelectedClient(mappedClients[0]);
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

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
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

      const decilColor = c.decil === 'D10' || c.decil === 'D010' ? '#10B981' : c.decil === 'D09' ? '#6366F1' : c.decil === 'D08' ? '#A855F7' : '#F59E0B';

      const routeIndex = routeClientIds.indexOf(c.id);
      const displayText = routeIndex !== -1 ? (routeIndex + 1).toString() : (c.decil || 'D');

      const customHtml = `
        <div style="
          background: ${isSelected ? '#EC4899' : decilColor};
          width: ${isSelected || isInRoute ? '28px' : '22px'};
          height: ${isSelected || isInRoute ? '28px' : '22px'};
          border-radius: 50%;
          border: ${isInRoute ? '3px solid #FFFFFF' : '3px solid #0B0F19'};
          box-shadow: ${isInRoute ? '0 0 0 3px #3B82F6, 0 0 12px ' + decilColor : '0 0 12px ' + decilColor};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 11px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        ">
          ${displayText}
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

  const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // metros
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Generador de Ruta Inteligente (Prioridad: D10 más cercano + 7 más cercanos a él)
  const generateRecommendedRoute = async () => {
    if (clientes.length === 0) return;

    toast.info('Calculando posición GPS exacta...');

    const getCoords = (): Promise<{ lat: number; lng: number }> => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(userCoords);
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(userCoords),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      });
    };

    let currentPos = userCoords;
    try {
      currentPos = await getCoords();
      setUserCoords(currentPos);
      if (currentPos.lat !== 40.4168) {
        toast.success('¡Ruta trazada desde tu posición actual!');
      } else {
        toast.error('Usando ubicación por defecto (GPS denegado).');
      }
    } catch (e) {
      toast.error('Error al obtener GPS.');
    }

    const validClients = clientes.filter(c => c.latitud && c.longitud);
    if (validClients.length === 0) return;

    // 1. Encontrar el D10 (o D010) más cercano al comercial
    const d10Clients = validClients.filter(c => c.decil === 'D10' || c.decil === 'D010');
    const vipCandidates = d10Clients.length > 0 ? d10Clients : validClients;

    const closestD10 = [...vipCandidates].sort((a, b) => {
      return getDistanceInMeters(currentPos.lat, currentPos.lng, a.latitud, a.longitud) - 
             getDistanceInMeters(currentPos.lat, currentPos.lng, b.latitud, b.longitud);
    })[0];

    if (!closestD10) return;

    // 2. Coger las 7 farmacias más cercanas absolutamente a ese D10
    const others = validClients.filter(c => c.id !== closestD10.id);
    others.sort((a, b) => {
      return getDistanceInMeters(closestD10.latitud, closestD10.longitud, a.latitud, a.longitud) - 
             getDistanceInMeters(closestD10.latitud, closestD10.longitud, b.latitud, b.longitud);
    });

    const closest7 = others.slice(0, 7);
    const chosenSubset = [closestD10, ...closest7];

    // 3. Ordenarlas con Nearest Neighbor para que el recorrido visual (la línea) sea lógico
    const unvisited = [...chosenSubset];
    const firstNode = unvisited.shift()!;
    const finalRoute = [firstNode];
    
    let currentMarker = { lat: firstNode.latitud, lng: firstNode.longitud };

    while (unvisited.length > 0) {
      let nearestIdx = -1;
      let minDist = Infinity;
      for (let i = 0; i < unvisited.length; i++) {
        const dist = getDistanceInMeters(currentMarker.lat, currentMarker.lng, unvisited[i].latitud, unvisited[i].longitud);
        if (dist < minDist) {
          minDist = dist;
          nearestIdx = i;
        }
      }
      if (nearestIdx !== -1) {
        const nextNode = unvisited.splice(nearestIdx, 1)[0];
        finalRoute.push(nextNode);
        currentMarker = { lat: nextNode.latitud, lng: nextNode.longitud };
      }
    }

    setRouteClientIds(finalRoute.map(c => c.id));
  };

  // Optimizar ruta manual (Nearest Neighbor TSP)
  const handleOptimizeCustomRoute = () => {
    if (routeClientIds.length < 2) return;

    // Obtener los clientes actuales de la ruta
    const routeClients = routeClientIds.map(id => clientes.find(c => c.id === id)).filter(Boolean) as LoreClient[];
    if (routeClients.length < 2) return;

    // Buscar el más cercano a la posición actual para usarlo como punto de partida
    const currentPos = userCoords.lat !== 0 ? userCoords : { lat: 43.3614, lng: -5.8593 };
    const unvisited = [...routeClients];
    
    // El punto de partida será el más cercano a la ubicación del comercial
    unvisited.sort((a, b) => {
      return getDistanceInMeters(currentPos.lat, currentPos.lng, a.latitud, a.longitud) - 
             getDistanceInMeters(currentPos.lat, currentPos.lng, b.latitud, b.longitud);
    });

    const firstNode = unvisited.shift()!;
    const finalRoute = [firstNode];
    
    let currentMarker = { lat: firstNode.latitud, lng: firstNode.longitud };

    while (unvisited.length > 0) {
      let nearestIdx = -1;
      let minDist = Infinity;
      for (let i = 0; i < unvisited.length; i++) {
        const dist = getDistanceInMeters(currentMarker.lat, currentMarker.lng, unvisited[i].latitud, unvisited[i].longitud);
        if (dist < minDist) {
          minDist = dist;
          nearestIdx = i;
        }
      }
      if (nearestIdx !== -1) {
        const nextNode = unvisited.splice(nearestIdx, 1)[0];
        finalRoute.push(nextNode);
        currentMarker = { lat: nextNode.latitud, lng: nextNode.longitud };
      }
    }

    setRouteClientIds(finalRoute.map(c => c.id));
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

  const moveClientInRoute = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === routeClientIds.length - 1)) return;
    const newRoute = [...routeClientIds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newRoute[index], newRoute[targetIndex]] = [newRoute[targetIndex], newRoute[index]];
    setRouteClientIds(newRoute);
  };

  // Sustituir una farmacia por la más cercana disponible
  const handleSubstituteClient = (index: number) => {
    const currentClientId = routeClientIds[index];
    const currentClient = clientes.find(c => c.id === currentClientId);
    if (!currentClient) return;

    // Buscar clientes que NO estén ya en la ruta Y que no hayan sido rechazados previamente en esta sesión de sustitución
    const availableClients = clientes.filter(c => !routeClientIds.includes(c.id) && !rejectedSubstitutes.includes(c.id) && c.id !== currentClientId);
    
    if (availableClients.length === 0) {
      alert("No hay más farmacias nuevas disponibles cerca para sustituir.");
      return;
    }

    // Ordenar los disponibles por cercanía al cliente que vamos a sustituir
    availableClients.sort((a, b) => {
      return getDistanceInMeters(currentClient.latitud, currentClient.longitud, a.latitud, a.longitud) - 
             getDistanceInMeters(currentClient.latitud, currentClient.longitud, b.latitud, b.longitud);
    });

    const closestSubstitute = availableClients[0];

    // Marcar el actual como rechazado para que no vuelva a aparecer en siguientes sustituciones
    setRejectedSubstitutes(prev => [...prev, currentClientId]);

    // Reemplazar en la ruta manteniendo la misma posición
    const newRoute = [...routeClientIds];
    newRoute[index] = closestSubstitute.id;
    setRouteClientIds(newRoute);
  };

  const handleExportRoute = () => {
    if (routeClientIds.length === 0) return;
    let exportText = `Ruta Comercial - ${new Date().toLocaleDateString()}\n`;
    exportText += `Distancia total: ${calculateRouteDistance()} km\n\n`;
    routeClientIds.forEach((id, index) => {
      const c = clientes.find(c => c.id === id);
      if (c) {
        exportText += `${index + 1}. ${c.nombre} (${c.decil})\n   📍 ${c.direccion}\n`;
      }
    });
    
    navigator.clipboard.writeText(exportText).then(() => {
      alert('Ruta copiada al portapapeles. ¡Lista para pegar en WhatsApp o Email!');
    });
  };

  const handleOpenInGoogleMaps = () => {
    if (routeClientIds.length === 0) return;
    
    const stops = routeClientIds.map(id => clientes.find(c => c.id === id)).filter(Boolean) as LoreClient[];
    if (stops.length === 0) return;

    let origin = '';
    let waypoints = '';
    let destination = '';

    // Considerar origen la ubicación actual del usuario si no es la por defecto de Madrid
    const hasRealLocation = userCoords.lat !== 0 && userCoords.lat !== 40.4168;

    if (hasRealLocation) {
      origin = `${userCoords.lat},${userCoords.lng}`;
      destination = `${stops[stops.length - 1].latitud},${stops[stops.length - 1].longitud}`;
      const wpStops = stops.slice(0, -1);
      if (wpStops.length > 0) {
        waypoints = '&waypoints=' + wpStops.map(s => `${s.latitud},${s.longitud}`).join('|');
      }
    } else {
      origin = `${stops[0].latitud},${stops[0].longitud}`;
      if (stops.length === 1) {
        destination = origin;
      } else {
        destination = `${stops[stops.length - 1].latitud},${stops[stops.length - 1].longitud}`;
        const wpStops = stops.slice(1, -1);
        if (wpStops.length > 0) {
          waypoints = '&waypoints=' + wpStops.map(s => `${s.latitud},${s.longitud}`).join('|');
        }
      }
    }

    const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints}`;
    window.open(mapUrl, '_blank');
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
      <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-2xl border backdrop-blur-md ${isLight ? 'bg-white border-pink-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'}`}>
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              title="Volver a la Plataforma"
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center group ${isLight ? 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'}`}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}

          <div className={`flex flex-wrap sm:flex-nowrap items-center gap-1.5 p-1 rounded-xl border w-full sm:w-auto ${isLight ? 'bg-pink-50/50 border-pink-100' : 'bg-slate-950/60 border-slate-800/80'}`}>
            <button
              onClick={() => setActiveSubTab('goals')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'goals'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                  : isLight ? 'text-pink-700 hover:text-pink-900 hover:bg-pink-100/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
                  : isLight ? 'text-pink-700 hover:text-pink-900 hover:bg-pink-100/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
                  : isLight ? 'text-pink-700 hover:text-pink-900 hover:bg-pink-100/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
              <button
                onClick={() => { setRouteClientIds([]); setRejectedSubstitutes([]); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all"
                title="Vaciar ruta actual para empezar de cero"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                Limpiar Ruta
              </button>
              
              <button
                onClick={handleOptimizeCustomRoute}
                disabled={routeClientIds.length < 2}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white text-xs font-bold rounded-xl hover:shadow-lg transition-all"
                title="Calcula el camino más corto entre las farmacias que has seleccionado manualmente"
              >
                <Zap className="w-4 h-4 text-yellow-400" />
                Optimizar mi Ruta
              </button>

              <button
                onClick={() => { generateRecommendedRoute(); setRejectedSubstitutes([]); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                title="Generar automáticamente una ruta con farmacias top (D10)"
              >
                <Award className="w-4 h-4 text-amber-400" />
                Ruta Automática D10
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
                <button
                  onClick={handleExportRoute}
                  disabled={routeClientIds.length === 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap"
                  title="Copiar texto con la ruta"
                >
                  <Share2 className="w-4 h-4" /> Exportar / Copiar
                </button>
                <button
                  onClick={handleOpenInGoogleMaps}
                  disabled={routeClientIds.length === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap"
                  title="Abrir esta ruta en Google Maps"
                >
                  <Map className="w-4 h-4" /> Enviar a Google Maps
                </button>
              </div>
            )}
          </div>

          {/* Route Order List (Drag & Drop alternative with Arrows) */}
          {routeClientIds.length > 0 && (
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Route className="w-4 h-4 text-emerald-400" />
                Orden de Visita
              </h3>
              <div className="flex flex-col gap-2">
                {routeClientIds.map((id, index) => {
                  const client = clientes.find(c => c.id === id);
                  if (!client) return null;
                  return (
                    <div key={id} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/50 border border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[11px] border border-indigo-500/30">
                          {index + 1}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="text-xs font-bold text-white mr-1">{client.nombre}</p>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border whitespace-nowrap ${
                              client.tipo === 'Prospección' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }`}>
                              {client.tipo === 'Prospección' ? 'Prospección' : 'Cliente'}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border whitespace-nowrap ${
                              client.decil === 'D10' || client.decil === 'D010' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                              client.decil === 'D09' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                              client.decil === 'D08' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                              'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            }`}>
                              {client.decil || 'D07'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{client.direccion}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSubstituteClient(index)}
                          className="p-1.5 mr-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 transition-all"
                          title="Sustituir por la farmacia más cercana"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveClientInRoute(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveClientInRoute(index, 'down')}
                          disabled={index === routeClientIds.length - 1}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
                    <div className="flex flex-col gap-1.5">
                      <h4 className="font-bold text-white text-xs leading-tight">{client.nombre}</h4>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${
                          client.tipo === 'Prospección' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {client.tipo === 'Prospección' ? 'Prospección' : 'Cliente'}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${
                          client.decil === 'D10' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          client.decil === 'D09' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                          client.decil === 'D08' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                          'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {client.decil}
                        </span>
                      </div>
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
