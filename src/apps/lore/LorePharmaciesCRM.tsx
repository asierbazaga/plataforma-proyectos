import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Filter, 
  Edit3, 
  Trash2, 
  Calendar, 
  Phone, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle2, 
  Download, 
  Upload, 
  Tag, 
  Eye, 
  X, 
  Sparkles, 
  ArrowUpDown,
  FileSpreadsheet,
  Clock,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type PurchaseTrend = 'En crecimiento' | 'Estable' | 'Dejando de comprar' | 'Potencial de subida';

export interface PharmacyCRMItem {
  id: string;
  provincia: string;
  ciudad: string;
  farmacia_nombre: string;
  contacto: string;
  decil: string; // D10, D09, D08, D07, D05, D03...
  ultima_visita: string;
  proxima_accion: string; // Llamar, Visitar, Enviar muestras...
  fecha_proxima_accion: string;
  le_interesa: string; // Colágeno marino, Sportlife...
  no_le_interesa: string; // Línea infantil, Cosmética...
  marcas_competencia: string; // Ana M. Lajusticia, Epaplus, Aquilea...
  detalles_competencia: string;
  estado: 'Activo' | 'Inactivo' | 'Pendiente';
  tendencia_compra: PurchaseTrend;
  notas: string;
  telefono?: string;
  email?: string;
  updated_at?: string;
}

const DEFAULT_PHARMACIES: PharmacyCRMItem[] = [
  {
    id: 'ph_1',
    provincia: 'Asturias',
    ciudad: 'Gijón',
    farmacia_nombre: 'Farmacia Ateneo',
    contacto: 'Marta',
    decil: 'D05',
    ultima_visita: '14/08/2026',
    proxima_accion: 'Llamar',
    fecha_proxima_accion: '28/08/2026',
    le_interesa: 'Colágeno marino, Vitamina C',
    no_le_interesa: 'Línea infantil',
    marcas_competencia: 'Ana M. Lajusticia, Epaplus',
    detalles_competencia: 'Tienen expositor de Epaplus en mostrador',
    estado: 'Activo',
    tendencia_compra: 'En crecimiento',
    notas: 'Muy interesados en promociones trimestrales y expositor Drasanvi.'
  },
  {
    id: 'ph_2',
    provincia: 'Asturias',
    ciudad: 'Gijón',
    farmacia_nombre: 'Farmacia La Paz',
    contacto: 'Javier',
    decil: 'D03',
    ultima_visita: '07/08/2026',
    proxima_accion: 'Cliente no contesta',
    fecha_proxima_accion: '22/08/2026',
    le_interesa: 'Sportlife, Proteínas',
    no_le_interesa: 'Cosmética',
    marcas_competencia: 'Aquilea',
    detalles_competencia: 'Hay que igualar su oferta de descuento 15%',
    estado: 'Activo',
    tendencia_compra: 'Dejando de comprar',
    notas: 'Mandar muestras nuevas de Sportlife para reenganchar al titular.'
  },
  {
    id: 'ph_3',
    provincia: 'Asturias',
    ciudad: 'Oviedo',
    farmacia_nombre: 'Farmacia Central Uría',
    contacto: 'Elena García',
    decil: 'D10',
    ultima_visita: '12/08/2026',
    proxima_accion: 'Visitar para pedido grande',
    fecha_proxima_accion: '25/08/2026',
    le_interesa: 'Colágeno marino, Línea CBD, Fitoterapia',
    no_le_interesa: 'Higiene bucal',
    marcas_competencia: 'Arkopharma, Pranarôm',
    detalles_competencia: 'Buen espacio, buscan margen del 35%',
    estado: 'Activo',
    tendencia_compra: 'En crecimiento',
    notas: 'Cliente VIP decil 10. Prioridad de visita presencial en cada ciclo.'
  },
  {
    id: 'ph_4',
    provincia: 'Cantabria',
    ciudad: 'Santander',
    farmacia_nombre: 'Herbolario & Farmacia Bahía',
    contacto: 'Carlos',
    decil: 'D08',
    ultima_visita: '02/08/2026',
    proxima_accion: 'Enviar catálogo nuevo',
    fecha_proxima_accion: '20/08/2026',
    le_interesa: 'Superalimentos, Jarabes naturales',
    no_le_interesa: 'Nutrición deportiva',
    marcas_competencia: 'Soria Natural',
    detalles_competencia: 'Gran fidelidad a Soria Natural pero abiertos a novedades',
    estado: 'Activo',
    tendencia_compra: 'Potencial de subida',
    notas: 'Le gusta la cartelería para escaparate.'
  }
];

export const LorePharmaciesCRM: React.FC = () => {
  const { canEditApp } = useAuth();
  const canEdit = canEditApp('lore');

  // Estado de lista de farmacias persistido
  const [pharmacies, setPharmacies] = useState<PharmacyCRMItem[]>(() => {
    const saved = localStorage.getItem('lore_crm_pharmacies');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_PHARMACIES;
  });

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem('lore_crm_pharmacies', JSON.stringify(pharmacies));
  }, [pharmacies]);

  // Filtros
  const [search, setSearch] = useState('');
  const [filterProvincia, setFilterProvincia] = useState('all');
  const [filterDecil, setFilterDecil] = useState('all');
  const [filterTendencia, setFilterTendencia] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal Crear/Editar Farmacia
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Formulario
  const [formData, setFormData] = useState<Omit<PharmacyCRMItem, 'id'>>({
    provincia: 'Asturias',
    ciudad: '',
    farmacia_nombre: '',
    contacto: '',
    decil: 'D05',
    ultima_visita: new Date().toLocaleDateString('es-ES'),
    proxima_accion: 'Llamar',
    fecha_proxima_accion: '',
    le_interesa: '',
    no_le_interesa: '',
    marcas_competencia: '',
    detalles_competencia: '',
    estado: 'Activo',
    tendencia_compra: 'En crecimiento',
    notas: ''
  });

  // Lista de provincias y deciles únicos
  const uniqueProvincias = useMemo(() => {
    const set = new Set(pharmacies.map(p => p.provincia).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [pharmacies]);

  const uniqueDeciles = ['all', 'D10', 'D09', 'D08', 'D07', 'D05', 'D03'];

  // Métricas rápidas
  const stats = useMemo(() => {
    const total = pharmacies.length;
    const enCrecimiento = pharmacies.filter(p => p.tendencia_compra === 'En crecimiento').length;
    const potencial = pharmacies.filter(p => p.tendencia_compra === 'Potencial de subida').length;
    const enRiesgo = pharmacies.filter(p => p.tendencia_compra === 'Dejando de comprar').length;
    return { total, enCrecimiento, potencial, enRiesgo };
  }, [pharmacies]);

  // Filtrado
  const filtered = useMemo(() => {
    return pharmacies.filter(item => {
      const matchSearch = 
        item.farmacia_nombre.toLowerCase().includes(search.toLowerCase()) ||
        item.contacto.toLowerCase().includes(search.toLowerCase()) ||
        item.ciudad.toLowerCase().includes(search.toLowerCase()) ||
        item.provincia.toLowerCase().includes(search.toLowerCase()) ||
        item.le_interesa.toLowerCase().includes(search.toLowerCase()) ||
        item.marcas_competencia.toLowerCase().includes(search.toLowerCase()) ||
        item.notas.toLowerCase().includes(search.toLowerCase());

      const matchProv = filterProvincia === 'all' || item.provincia === filterProvincia;
      const matchDecil = filterDecil === 'all' || item.decil === filterDecil;
      const matchTend = filterTendencia === 'all' || item.tendencia_compra === filterTendencia;

      return matchSearch && matchProv && matchDecil && matchTend;
    });
  }, [pharmacies, search, filterProvincia, filterDecil, filterTendencia]);

  // Abrir modal nuevo
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      provincia: 'Asturias',
      ciudad: '',
      farmacia_nombre: '',
      contacto: '',
      decil: 'D05',
      ultima_visita: new Date().toLocaleDateString('es-ES'),
      proxima_accion: 'Llamar',
      fecha_proxima_accion: '',
      le_interesa: '',
      no_le_interesa: '',
      marcas_competencia: '',
      detalles_competencia: '',
      estado: 'Activo',
      tendencia_compra: 'En crecimiento',
      notas: ''
    });
    setModalOpen(true);
  };

  // Abrir modal editar
  const handleOpenEdit = (item: PharmacyCRMItem) => {
    setEditingId(item.id);
    setFormData({
      provincia: item.provincia,
      ciudad: item.ciudad,
      farmacia_nombre: item.farmacia_nombre,
      contacto: item.contacto,
      decil: item.decil,
      ultima_visita: item.ultima_visita,
      proxima_accion: item.proxima_accion,
      fecha_proxima_accion: item.fecha_proxima_accion,
      le_interesa: item.le_interesa,
      no_le_interesa: item.no_le_interesa,
      marcas_competencia: item.marcas_competencia,
      detalles_competencia: item.detalles_competencia,
      estado: item.estado,
      tendencia_compra: item.tendencia_compra,
      notas: item.notas
    });
    setModalOpen(true);
  };

  // Guardar creación / edición
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.farmacia_nombre.trim()) return;

    if (editingId) {
      setPharmacies(prev => prev.map(p => p.id === editingId ? { ...formData, id: editingId, updated_at: new Date().toISOString() } : p));
    } else {
      const newItem: PharmacyCRMItem = {
        ...formData,
        id: `ph_${Date.now()}`,
        updated_at: new Date().toISOString()
      };
      setPharmacies(prev => [newItem, ...prev]);
    }

    setModalOpen(false);
  };

  // Eliminar farmacia
  const handleDelete = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar el registro de esta farmacia?')) {
      setPharmacies(prev => prev.filter(p => p.id !== id));
    }
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    const headers = [
      'Provincia', 'Ciudad', 'Farmacia / Herbolario', 'Persona Contacto', 'Categoria / Decil',
      'Ultima Visita', 'Proxima Accion', 'Fecha Proxima Accion', 'Le Interesa (Top Ventas)',
      'NO le Interesa (Descartado)', 'Marcas Competencia', 'Detalles Competencia', 'Estado',
      'Tendencia de Compra', 'Notas'
    ];

    const rows = pharmacies.map(p => [
      `"${p.provincia}"`, `"${p.ciudad}"`, `"${p.farmacia_nombre}"`, `"${p.contacto}"`, `"${p.decil}"`,
      `"${p.ultima_visita}"`, `"${p.proxima_accion}"`, `"${p.fecha_proxima_accion}"`, `"${p.le_interesa}"`,
      `"${p.no_le_interesa}"`, `"${p.marcas_competencia}"`, `"${p.detalles_competencia}"`, `"${p.estado}"`,
      `"${p.tendencia_compra}"`, `"${p.notas}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Seguimiento_Farmacias_Drasanvi_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render badge de tendencia
  const renderTrendBadge = (trend: PurchaseTrend) => {
    switch (trend) {
      case 'En crecimiento':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span>🚀</span> En crecimiento
          </span>
        );
      case 'Potencial de subida':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <span>💡</span> Potencial de subida
          </span>
        );
      case 'Estable':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-500/15 text-slate-300 border border-slate-500/30">
            <span>⚖️</span> Estable
          </span>
        );
      case 'Dejando de comprar':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <span>📉</span> Dejando de comprar
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Container CRM */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#131B2E] to-[#0B0F19] border border-emerald-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Glow ambient background spots */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Seguimiento General de Farmacias</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  CRM Comercial
                </span>
              </h1>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Control de visitas, competencia, intereses y tendencias de compra
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              title="Descargar tabla en formato Excel / CSV"
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Exportar Excel</span>
            </button>

            {canEdit && (
              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nueva Farmacia</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Metric Counter Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10 pt-2">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Farmacias</p>
            <p className="text-2xl font-black text-white mt-1">{stats.total}</p>
          </div>

          <div className="bg-slate-900/80 border border-emerald-500/30 p-4 rounded-2xl">
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <span>🚀</span> En Crecimiento
            </p>
            <p className="text-2xl font-black text-emerald-300 mt-1">{stats.enCrecimiento}</p>
          </div>

          <div className="bg-slate-900/80 border border-indigo-500/30 p-4 rounded-2xl">
            <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              <span>💡</span> Potencial Subida
            </p>
            <p className="text-2xl font-black text-indigo-300 mt-1">{stats.potencial}</p>
          </div>

          <div className="bg-slate-900/80 border border-rose-500/30 p-4 rounded-2xl">
            <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <span>📉</span> Dejando Comprar
            </p>
            <p className="text-2xl font-black text-rose-300 mt-1">{stats.enRiesgo}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, contacto, notas, competencia..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filter Provincia */}
          <select
            value={filterProvincia}
            onChange={e => setFilterProvincia(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todas las Provincias</option>
            {uniqueProvincias.filter(p => p !== 'all').map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Filter Decil */}
          <select
            value={filterDecil}
            onChange={e => setFilterDecil(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos los Deciles</option>
            {uniqueDeciles.filter(d => d !== 'all').map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Filter Tendencia */}
          <select
            value={filterTendencia}
            onChange={e => setFilterTendencia(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todas las Tendencias</option>
            <option value="En crecimiento">🚀 En crecimiento</option>
            <option value="Potencial de subida">💡 Potencial de subida</option>
            <option value="Estable">⚖️ Estable</option>
            <option value="Dejando de comprar">📉 Dejando de comprar</option>
          </select>

          {/* Switch View Mode */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'table' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tabla Excel
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'cards' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tarjetas
            </button>
          </div>
        </div>
      </div>

      {/* Main CRM Content: Table or Cards View */}
      {viewMode === 'table' ? (
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Farmacia / Herbolario</th>
                  <th className="py-3.5 px-3">Ubicación</th>
                  <th className="py-3.5 px-3">Contacto</th>
                  <th className="py-3.5 px-3">Decil</th>
                  <th className="py-3.5 px-3">Última Visita</th>
                  <th className="py-3.5 px-3">Próxima Acción</th>
                  <th className="py-3.5 px-3">Tendencia Compra</th>
                  <th className="py-3.5 px-3">Le Interesa (Top)</th>
                  <th className="py-3.5 px-3">Competencia</th>
                  <th className="py-3.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>{item.farmacia_nombre}</span>
                      </div>
                      {item.notas && (
                        <p className="text-[10px] font-normal text-slate-400 mt-0.5 line-clamp-1 max-w-xs">
                          {item.notas}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      <span>{item.ciudad}</span>
                      <span className="text-[10px] text-slate-500 block">{item.provincia}</span>
                    </td>

                    <td className="py-3 px-3 text-slate-200 font-medium whitespace-nowrap">
                      {item.contacto || '---'}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded font-black text-[10px] border ${
                        item.decil === 'D10' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        item.decil === 'D09' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                        item.decil === 'D08' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                        'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {item.decil}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {item.ultima_visita || '---'}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <p className="text-white font-semibold">{item.proxima_accion}</p>
                      {item.fecha_proxima_accion && (
                        <span className="text-[10px] text-indigo-400 font-medium flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {item.fecha_proxima_accion}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {renderTrendBadge(item.tendencia_compra)}
                    </td>

                    <td className="py-3 px-3 text-slate-300 max-w-[180px] truncate" title={item.le_interesa}>
                      {item.le_interesa || '---'}
                    </td>

                    <td className="py-3 px-3 text-slate-300 max-w-[180px] truncate" title={`${item.marcas_competencia} - ${item.detalles_competencia}`}>
                      <span className="text-rose-300 font-medium">{item.marcas_competencia}</span>
                      {item.detalles_competencia && (
                        <span className="text-[10px] text-slate-500 block truncate">{item.detalles_competencia}</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Editar Farmacia"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Eliminar registro"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs">
              No se encontraron farmacias con los filtros seleccionados.
            </div>
          )}
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div
              key={item.id}
              className="glass-panel p-5 rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition-all space-y-4 shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-white">{item.farmacia_nombre}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{item.ciudad} ({item.provincia})</span>
                    </p>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-lg font-black text-xs border ${
                    item.decil === 'D10' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    item.decil === 'D09' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                    'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {item.decil}
                  </span>
                </div>

                <div className="pt-1">
                  {renderTrendBadge(item.tendencia_compra)}
                </div>

                {/* Info Rows */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Persona Contacto:</span>
                    <span className="text-slate-200 font-semibold">{item.contacto || '---'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Última Visita:</span>
                    <span className="text-slate-300">{item.ultima_visita || '---'}</span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Próxima Acción</span>
                      <p className="text-white font-bold">{item.proxima_accion}</p>
                    </div>
                    {item.fecha_proxima_accion && (
                      <span className="text-xs font-bold text-indigo-300 bg-indigo-950/60 px-2 py-1 rounded-lg border border-indigo-500/30">
                        {item.fecha_proxima_accion}
                      </span>
                    )}
                  </div>

                  {item.le_interesa && (
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">Le Interesa:</span>
                      <p className="text-slate-300 text-xs">{item.le_interesa}</p>
                    </div>
                  )}

                  {item.marcas_competencia && (
                    <div>
                      <span className="text-[10px] font-bold text-rose-400 uppercase">Competencia:</span>
                      <p className="text-slate-300 text-xs">{item.marcas_competencia} {item.detalles_competencia && `(${item.detalles_competencia})`}</p>
                    </div>
                  )}

                  {item.notas && (
                    <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Notas:</span>
                      <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">{item.notas}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar
                </button>
                {canEdit && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white text-xs transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar Farmacia */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingId ? 'Editar Registro de Farmacia' : 'Añadir Nueva Farmacia / Herbolario'}
                  </h3>
                  <p className="text-xs text-slate-400">Rellena los campos correspondientes a la ficha comercial</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Farmacia / Herbolario *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Farmacia Ateneo"
                    value={formData.farmacia_nombre}
                    onChange={e => setFormData({ ...formData, farmacia_nombre: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Persona Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej. Marta / Titular"
                    value={formData.contacto}
                    onChange={e => setFormData({ ...formData, contacto: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Provincia</label>
                  <input
                    type="text"
                    placeholder="Ej. Asturias"
                    value={formData.provincia}
                    onChange={e => setFormData({ ...formData, provincia: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Ciudad</label>
                  <input
                    type="text"
                    placeholder="Ej. Gijón"
                    value={formData.ciudad}
                    onChange={e => setFormData({ ...formData, ciudad: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Categoría / Decil</label>
                  <select
                    value={formData.decil}
                    onChange={e => setFormData({ ...formData, decil: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="D10">D10 (Ventas VIP)</option>
                    <option value="D09">D09 (Ventas Altas)</option>
                    <option value="D08">D08 (Ventas Medias)</option>
                    <option value="D07">D07 (Ventas Estándar)</option>
                    <option value="D05">D05</option>
                    <option value="D03">D03</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Tendencia de Compra</label>
                  <select
                    value={formData.tendencia_compra}
                    onChange={e => setFormData({ ...formData, tendencia_compra: e.target.value as PurchaseTrend })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="En crecimiento">🚀 En crecimiento</option>
                    <option value="Potencial de subida">💡 Potencial de subida</option>
                    <option value="Estable">⚖️ Estable</option>
                    <option value="Dejando de comprar">📉 Dejando de comprar</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Última Visita</label>
                  <input
                    type="text"
                    placeholder="DD/MM/AAAA"
                    value={formData.ultima_visita}
                    onChange={e => setFormData({ ...formData, ultima_visita: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Fecha Próxima Acción</label>
                  <input
                    type="text"
                    placeholder="DD/MM/AAAA"
                    value={formData.fecha_proxima_accion}
                    onChange={e => setFormData({ ...formData, fecha_proxima_accion: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Próxima Acción</label>
                <input
                  type="text"
                  placeholder="Ej. Llamar para reposición / Mandar catálogo / Visitar"
                  value={formData.proxima_accion}
                  onChange={e => setFormData({ ...formData, proxima_accion: e.target.value })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-emerald-400">Le Interesa (Top Ventas)</label>
                  <input
                    type="text"
                    placeholder="Ej. Colágeno marino, Sportlife, Vitaminas"
                    value={formData.le_interesa}
                    onChange={e => setFormData({ ...formData, le_interesa: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">NO le Interesa (Descartado)</label>
                  <input
                    type="text"
                    placeholder="Ej. Línea infantil, Cosmética"
                    value={formData.no_le_interesa}
                    onChange={e => setFormData({ ...formData, no_le_interesa: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-rose-400">Marcas Competencia</label>
                  <input
                    type="text"
                    placeholder="Ej. Ana M. Lajusticia, Epaplus, Aquilea"
                    value={formData.marcas_competencia}
                    onChange={e => setFormData({ ...formData, marcas_competencia: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Detalles Competencia</label>
                  <input
                    type="text"
                    placeholder="Ej. Tienen expositor en mostrador / Oferta 15%"
                    value={formData.detalles_competencia}
                    onChange={e => setFormData({ ...formData, detalles_competencia: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Notas / Observaciones</label>
                <textarea
                  rows={2}
                  placeholder="Anotaciones clave de la farmacia..."
                  value={formData.notas}
                  onChange={e => setFormData({ ...formData, notas: e.target.value })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  {editingId ? 'Guardar Cambios' : 'Registrar Farmacia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
