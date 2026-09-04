import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Clock,
  UserCheck,
  UserPlus,
  ListTodo,
  Check,
  ArrowRight,
  RefreshCw,
  PhoneCall,
  Flame,
  ArrowUpRight,
  Target,
  Mic,
  MicOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import * as XLSX from 'xlsx';

export type PurchaseTrend = 'En crecimiento' | 'Estable' | 'Dejando de comprar' | 'Potencial de subida';
export type ProspectStatus = 'Sin contactar' | 'Contactado' | 'Visita realizada' | 'Interesado' | 'Cliente cerrado';
export type ClientCategory = 'cliente' | 'prospeccion';

export interface PharmacyCRMItem {
  id: string;
  category_type: ClientCategory; // 'cliente' (cartera activa) o 'prospeccion' (leads/nuevos)
  provincia: string;
  ciudad: string;
  direccion?: string;
  cp?: string;
  cif_nif?: string;
  codigo?: string;
  latitud?: number;
  longitud?: number;
  farmacia_nombre: string;
  contacto: string;
  telefono: string;
  decil: string; // D10, D09, D08, D07, D05, D03, D02...
  ventas_anuales: number;
  frecuencia_visita: string; // '15 días', '30 días', '45 días'
  ultima_visita: string;
  proxima_accion: string; // Llamar, Visitar, Seguimiento, Enviar catálogo...
  fecha_proxima_accion: string;
  le_interesa: string;
  no_le_interesa: string;
  marcas_competencia: string;
  detalles_competencia: string;
  estado_cliente: 'Activo' | 'Inactivo' | 'Pendiente';
  estado_prospeccion: ProspectStatus;
  tendencia_compra: PurchaseTrend;
  prioridad: 'Alta' | 'Media' | 'Baja';
  accion_completada: boolean;
  notas: string;
  updated_at?: string;
}



export const LorePharmaciesCRM: React.FC = () => {
  const { canEditApp } = useAuth();
  const canEdit = canEditApp('lore');
  const toast = useToast();

  // Sub-secciones guiadas por el Excel
  const [activeSection, setActiveSection] = useState<'clientes' | 'prospeccion' | 'pendientes'>('clientes');

  // Base de datos de farmacias persistente sincronizada
  const [items, setItems] = useState<PharmacyCRMItem[]>([]);

  useEffect(() => {
    storageService.getLoreCRMItems().then(data => {
      if (data) setItems(data);
    });

    const unsubscribe = storageService.onSync(() => {
      storageService.getLoreCRMItems().then(data => {
        if (data) setItems(data);
      });
    });

    return () => unsubscribe();
  }, []);

  const persistItems = (newItems: PharmacyCRMItem[]) => {
    setItems(newItems);
    storageService.setLoreCRMItems(newItems);
  };

  // Filtros
  const [search, setSearch] = useState('');
  const [filterProvincia, setFilterProvincia] = useState('all');
  const [filterDecil, setFilterDecil] = useState('all');
  const [filterTendencia, setFilterTendencia] = useState('all');

  // Edición Inline rápida por ID
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);

  // Barra de Alta Rápida de 1 línea (Quick Row Creator)
  const [quickNombre, setQuickNombre] = useState('');
  const [quickCiudad, setQuickCiudad] = useState('');
  const [quickContacto, setQuickContacto] = useState('');
  const [quickTelefono, setQuickTelefono] = useState('');
  const [quickDecil, setQuickDecil] = useState('D05');
  const [quickAccion, setQuickAccion] = useState('Llamar');
  const [quickFecha, setQuickFecha] = useState(new Date().toLocaleDateString('es-ES'));

  // Modal para edición completa
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PharmacyCRMItem | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Actualización de campo directo inline
  const handleUpdateField = (id: string, field: keyof PharmacyCRMItem, value: any) => {
    const updated = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          [field]: value,
          updated_at: new Date().toISOString()
        };
      }
      return item;
    });
    persistItems(updated);
  };

  // Convertir Prospección en Cliente Activo en 1 clic
  const handlePromoteToClient = (id: string) => {
    const updated = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          category_type: 'cliente' as ClientCategory,
          estado_cliente: 'Activo' as const,
          estado_prospeccion: 'Cliente cerrado' as ProspectStatus,
          updated_at: new Date().toISOString()
        };
      }
      return item;
    });
    persistItems(updated);
    toast.success('Promovido a Cliente con éxito');
  };

  // Alternar acción completada en Pendientes
  const handleToggleTaskDone = (id: string) => {
    const updated = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          accion_completada: !item.accion_completada,
          updated_at: new Date().toISOString()
        };
      }
      return item;
    });
    persistItems(updated);
  };

  // Agregar farmacia rápida de 1 línea
  const handleAddQuickRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNombre.trim()) {
      toast.warning('El nombre es obligatorio');
      return;
    }

    const newItem: PharmacyCRMItem = {
      id: `pharm_${Date.now()}`,
      category_type: activeSection === 'prospeccion' ? 'prospeccion' : 'cliente',
      provincia: 'Asturias',
      ciudad: quickCiudad.trim() || 'Gijón',
      farmacia_nombre: quickNombre.trim(),
      contacto: quickContacto.trim(),
      telefono: quickTelefono.trim(),
      decil: quickDecil,
      ventas_anuales: 0,
      frecuencia_visita: '15 días',
      ultima_visita: new Date().toLocaleDateString('es-ES'),
      proxima_accion: quickAccion,
      fecha_proxima_accion: quickFecha,
      le_interesa: '',
      no_le_interesa: '',
      marcas_competencia: '',
      detalles_competencia: '',
      estado_cliente: activeSection === 'prospeccion' ? 'Pendiente' : 'Activo',
      estado_prospeccion: activeSection === 'prospeccion' ? 'Sin contactar' : 'Cliente cerrado',
      tendencia_compra: 'Potencial de subida',
      prioridad: 'Media',
      accion_completada: false,
      notas: ''
    };

    persistItems([newItem, ...items]);
    toast.success('Registro añadido exitosamente');

    // Limpiar inputs rápidos
    setQuickNombre('');
    setQuickCiudad('');
    setQuickContacto('');
    setQuickTelefono('');
  };

  // Eliminar farmacia
  const handleDelete = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta farmacia?')) {
      persistItems(items.filter(item => item.id !== id));
      toast.success('Farmacia eliminada');
    }
  };

  // Abrir Modal de Edición Completa
  const handleOpenEditModal = (item: PharmacyCRMItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  // Guardar Modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updated = items.map(p => p.id === editingItem.id ? { ...editingItem, updated_at: new Date().toISOString() } : p);
    persistItems(updated);
    setModalOpen(false);
    setEditingItem(null);
    toast.success('Datos de la farmacia actualizados');
  };

  // Dictado por Voz (Web Speech API)
  const handleDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Tu navegador no soporta dictado por voz (prueba Chrome, Edge o Safari).');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('🎙️ Escuchando... Empieza a hablar.');
    };

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      if (editingItem) {
        setEditingItem(prev => ({
          ...prev!,
          notas: prev?.notas ? `${prev.notas}\n\n[Reporte de voz]: ${speechResult}` : `[Reporte de voz]: ${speechResult}`
        }));
        toast.success('Dictado transcrito correctamente.');
      }
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      toast.error('Error en el dictado: ' + event.error);
    };

    recognition.start();
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    const list = items.filter(p => activeSection === 'pendientes' ? true : p.category_type === activeSection);
    const headers = [
      'Sección', 'Código', 'Provincia', 'Ciudad', 'Dirección', 'CP', 'CIF/NIF', 'Farmacia', 'Contacto', 'Teléfono', 'Decil', 'Ventas Anuales (€)',
      'Última Visita', 'Próxima Acción', 'Fecha Próxima Acción', 'Frecuencia', 'Estado', 'Tendencia', 'Notas'
    ];

    const rows = list.map(p => [
      `"${p.category_type}"`, `"${p.codigo || ''}"`, `"${p.provincia}"`, `"${p.ciudad}"`, `"${p.direccion || ''}"`, `"${p.cp || ''}"`, `"${p.cif_nif || ''}"`, `"${p.farmacia_nombre}"`, `"${p.contacto}"`,
      `"${p.telefono}"`, `"${p.decil}"`, `"${p.ventas_anuales}"`, `"${p.ultima_visita}"`, `"${p.proxima_accion}"`,
      `"${p.fecha_proxima_accion}"`, `"${p.frecuencia_visita}"`, `"${p.category_type === 'cliente' ? p.estado_cliente : p.estado_prospeccion}"`,
      `"${p.tendencia_compra}"`, `"${p.notas}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Drasanvi_${activeSection}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Archivo CSV exportado');
  };

  // Importar desde Excel / CSV
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (rows.length < 2) {
        toast.warning('El archivo está vacío o no tiene el formato correcto');
        return;
      }

      // 1. Deducir la fila de cabeceras (puede no ser la primera si hay título en el Excel)
      let headerRowIdx = 0;
      for (let i = 0; i < Math.min(rows.length, 10); i++) {
        const rowStr = (rows[i] || []).join(' ').toLowerCase();
        if (rowStr.includes('customer') || rowStr.includes('nombre') || rowStr.includes('decil') || rowStr.includes('ciudad') || rowStr.includes('provincia')) {
          headerRowIdx = i;
          break;
        }
      }

      const headers = (rows[headerRowIdx] || []).map(h => h?.toString().toLowerCase().trim() || '');
      
      // Buscar Código (Customer ID)
      const idxCodigo = headers.findIndex(h => 
        h.includes('customer id') || h.includes('codigo') || h.includes('código') || 
        h.includes('customer no') || h.includes('código cliente') || 
        h === 'code' || h === 'id' || h === 'nº' || h === 'no' || h === 'no.' || h === 'customer'
      );
      
      // Buscar Farmacia/Nombre, priorizando coincidencias exactas
      let idxFarmacia = headers.findIndex((h, i) => i !== idxCodigo && (
        h.includes('cliente - nombre') || h.includes('customer name') || 
        h.includes('nombre') || h.includes('farmacia') || h.includes('razon social')
      ));
      
      // Fallback si no encontró el nombre
      if (idxFarmacia === -1) {
        idxFarmacia = headers.findIndex((h, i) => i !== idxCodigo && (h.includes('cliente') || h === 'name'));
      }

      const idxProvincia = headers.findIndex(h => h.includes('provincia') || h === 'prov' || h.includes('state') || h.includes('region'));
      const idxCiudad = headers.findIndex(h => h.includes('ciudad') || h.includes('poblacion') || h.includes('población') || h.includes('localidad') || h.includes('city'));
      const idxDecil = headers.findIndex(h => h.includes('decil') || h.includes('clasificacion') || h.includes('clasificación') || h.includes('segmentacion'));
      const idxDireccion = headers.findIndex(h => h.includes('direccion') || h.includes('dirección') || h.includes('calle') || h.includes('domicilio') || h.includes('address'));
      const idxCP = headers.findIndex(h => h === 'cp' || h.includes('codigo postal') || h.includes('código postal') || h.includes('zip'));
      const idxCIF = headers.findIndex(h => h.includes('cif') || h.includes('nif') || h.includes('cif/nif') || h.includes('vat'));
      const idxTelefono = headers.findIndex(h => h.includes('telefono') || h.includes('teléfono') || h.includes('movil') || h.includes('móvil') || h.includes('phone'));
      const idxContacto = headers.findIndex(h => h.includes('contacto') || h.includes('persona') || h.includes('encargado') || h.includes('contact'));

      // Fallback a posiciones si no se encuentra en cabecera
      const pIdx = idxProvincia >= 0 ? idxProvincia : 0;
      const cIdx = idxCiudad >= 0 ? idxCiudad : 1;
      
      // Posición lógica para el nombre si todo falla
      let fIdx = idxFarmacia;
      if (fIdx === -1) {
        fIdx = (idxCodigo >= 0 && idxCodigo <= 3) ? (idxCodigo + 1) : 3;
      }
      
      // Heurística salvavidas para el Código:
      // Si no detectamos el encabezado del código, pero sabemos dónde está el Nombre,
      // casi siempre el código es la columna inmediatamente anterior.
      let finalIdxCodigo = idxCodigo;
      if (finalIdxCodigo === -1 && fIdx > 0) {
        const prevCol = fIdx - 1;
        if (prevCol !== pIdx && prevCol !== cIdx) {
          finalIdxCodigo = prevCol;
        }
      }

      const dIdx = idxDecil >= 0 ? idxDecil : (finalIdxCodigo !== 4 && fIdx !== 4 ? 4 : 5);

      const newItems: PharmacyCRMItem[] = [];
      let lastProvincia = '';
      let lastCiudad = '';

      for (let i = headerRowIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const colProvincia = row[pIdx]?.toString().trim();
        const colCiudad = row[cIdx]?.toString().trim();
        const colFarmacia = row[fIdx]?.toString().trim();
        const colDecil = row[dIdx]?.toString().trim();
        
        // Columnas opcionales extraídas dinámicamente si existen
        const colCodigo = finalIdxCodigo >= 0 ? row[finalIdxCodigo]?.toString().trim() : '';
        const colDireccion = idxDireccion >= 0 ? row[idxDireccion]?.toString().trim() : '';
        const colCP = idxCP >= 0 ? row[idxCP]?.toString().trim() : '';
        const colCIF = idxCIF >= 0 ? row[idxCIF]?.toString().trim() : '';
        const colTelefono = idxTelefono >= 0 ? row[idxTelefono]?.toString().trim() : '';
        const colContacto = idxContacto >= 0 ? row[idxContacto]?.toString().trim() : '';

        if (colProvincia) lastProvincia = colProvincia;
        if (colCiudad) lastCiudad = colCiudad;

        if (!colFarmacia) continue;

        // Asignar a la pestaña actual (clientes o prospección)
        const itemCategory = activeSection === 'prospeccion' ? 'prospeccion' : 'cliente';

        newItems.push({
          id: `imported_${Date.now()}_${i}`,
          category_type: itemCategory,
          provincia: lastProvincia,
          ciudad: lastCiudad,
          direccion: colDireccion || '',
          codigo: colCodigo || '',
          cp: colCP || '',
          cif_nif: colCIF || '',
          farmacia_nombre: colFarmacia,
          contacto: colContacto || '',
          telefono: colTelefono || '',
          decil: colDecil || (itemCategory === 'prospeccion' ? 'D01' : 'D05'),
          ventas_anuales: 0,
          ultima_visita: '',
          proxima_accion: '',
          fecha_proxima_accion: '',
          frecuencia_visita: itemCategory === 'prospeccion' ? '30 días' : '15 días',
          estado_cliente: 'Activo',
          estado_prospeccion: itemCategory === 'prospeccion' ? 'Sin contactar' : 'Cliente cerrado',
          tendencia_compra: 'Estable',
          notas: '',
          le_interesa: '',
          no_le_interesa: '',
          marcas_competencia: '',
          detalles_competencia: '',
          prioridad: 'Media',
          accion_completada: false
        });
      }

      if (newItems.length > 0) {
        persistItems([...items, ...newItems]);
        toast.success(`Se importaron ${newItems.length} farmacias correctamente`);
      } else {
        toast.warning('No se encontraron registros válidos para importar');
      }
    } catch (error) {
      toast.error('Error al procesar el archivo Excel');
      console.error(error);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteAllData = async () => {
    const pwd = window.prompt('Introduce la clave de seguridad (2222) para borrar todos los datos:');
    if (pwd === '2222') {
      await storageService.deleteAllLoreCRMItems();
      setItems([]);
      toast.success('Todos los datos han sido borrados correctamente.');
    } else if (pwd !== null) {
      toast.error('Clave incorrecta. Operación cancelada.');
    }
  };

  // Filtrado de la sección activa
  const displayItems = useMemo(() => {
    const filtered = items.filter(item => {
      // Filtro por sección
      if (activeSection === 'clientes' && item.category_type !== 'cliente') return false;
      if (activeSection === 'prospeccion' && item.category_type !== 'prospeccion') return false;
      if (activeSection === 'pendientes' && !item.proxima_accion) return false;

      // Filtro por búsqueda
      const matchSearch = 
        (item.farmacia_nombre || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.contacto || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.ciudad || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.telefono || '').includes(search) ||
        (item.notas || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.le_interesa || '').toLowerCase().includes(search.toLowerCase());

      const matchProv = filterProvincia === 'all' || (item.provincia || '').toLowerCase() === filterProvincia.toLowerCase();
      const matchDecil = filterDecil === 'all' || item.decil === filterDecil;
      const matchTend = filterTendencia === 'all' || item.tendencia_compra === filterTendencia;

      return matchSearch && matchProv && matchDecil && matchTend;
    });

    // Ordenar por Comunidad (Provincia) > Ciudad > Nombre
    return filtered.sort((a, b) => {
      const provA = (a.provincia || '').toLowerCase();
      const provB = (b.provincia || '').toLowerCase();
      if (provA < provB) return -1;
      if (provA > provB) return 1;

      const ciudA = (a.ciudad || '').toLowerCase();
      const ciudB = (b.ciudad || '').toLowerCase();
      if (ciudA < ciudB) return -1;
      if (ciudA > ciudB) return 1;

      const nomA = (a.farmacia_nombre || '').toLowerCase();
      const nomB = (b.farmacia_nombre || '').toLowerCase();
      if (nomA < nomB) return -1;
      if (nomA > nomB) return 1;
      return 0;
    });
  }, [items, activeSection, search, filterProvincia, filterDecil, filterTendencia]);

  // Contadores de cabecera
  const counts = useMemo(() => {
    const totalClientes = items.filter(i => i.category_type === 'cliente').length;
    const totalProspeccion = items.filter(i => i.category_type === 'prospeccion').length;
    const totalPendientes = items.filter(i => !i.accion_completada && i.proxima_accion).length;
    const enCrecimiento = items.filter(i => i.tendencia_compra === 'En crecimiento').length;
    return { totalClientes, totalProspeccion, totalPendientes, enCrecimiento };
  }, [items]);

  // Datos para gráficos
  const chartData = useMemo(() => {
    const tendencias = items.reduce((acc, item) => {
      acc[item.tendencia_compra] = (acc[item.tendencia_compra] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tendenciasData = Object.keys(tendencias).map(key => ({
      name: key,
      value: tendencias[key],
      color: key === 'En crecimiento' ? '#10B981' : 
             key === 'Potencial de subida' ? '#3B82F6' : 
             key === 'Estable' ? '#F59E0B' : '#EF4444'
    }));

    const estadosProspeccion = items.filter(i => i.category_type === 'prospeccion').reduce((acc, item) => {
      acc[item.estado_prospeccion] = (acc[item.estado_prospeccion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const prospeccionData = Object.keys(estadosProspeccion).map(key => ({
      name: key,
      value: estadosProspeccion[key]
    }));

    return { tendenciasData, prospeccionData };
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Header Container CRM con Secciones del Excel */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#131B2E] to-[#0B0F19] border border-emerald-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Glow ambient background spots */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Gestión de Farmacias & CRM</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  Edición Rápida
                </span>
              </h1>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Cartera de Clientes, Prospección y Tareas Pendientes
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input 
              type="file" 
              accept=".csv, .xlsx, .xls" 
              ref={fileInputRef} 
              onChange={handleImportExcel} 
              className="hidden" 
              id="import-excel-input"
            />
            <button
              onClick={() => document.getElementById('import-excel-input')?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/10 transition-all shadow-sm backdrop-blur-sm"
              title="Importar datos desde Excel"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Importar Excel</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/10 transition-all shadow-sm backdrop-blur-sm"
              title="Descargar datos actuales en CSV / Excel"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Exportar Excel</span>
            </button>
            <button
              onClick={handleDeleteAllData}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-bold rounded-xl border border-rose-500/20 transition-all shadow-sm backdrop-blur-sm"
              title="Borrar todos los datos actuales"
            >
              <Trash2 className="w-4 h-4" />
              <span>Borrar Datos</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs de Secciones (Clientes vs Prospección vs Pendientes) */}
        <div className="relative z-10 flex flex-wrap gap-2 pt-2 border-t border-white/10">
          <button
            onClick={() => setActiveSection('clientes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeSection === 'clientes'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-white/5 text-white/70 hover:text-white border border-white/10 backdrop-blur-sm hover:bg-white/10'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-300" />
            <span>1. CLIENTES ACTIVOS</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950/60 text-[10px] text-emerald-300 font-bold">
              {counts.totalClientes}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('prospeccion')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeSection === 'prospeccion'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/5 text-white/70 hover:text-white border border-white/10 backdrop-blur-sm hover:bg-white/10'
            }`}
          >
            <UserPlus className="w-4 h-4 text-purple-300" />
            <span>2. PROSPECCIÓN (NUEVOS LEADS)</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950/60 text-[10px] text-purple-300 font-bold">
              {counts.totalProspeccion}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('pendientes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeSection === 'pendientes'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-white/5 text-white/70 hover:text-white border border-white/10 backdrop-blur-sm hover:bg-white/10'
            }`}
          >
            <ListTodo className="w-4 h-4 text-amber-300" />
            <span>3. PENDIENTES & ACCIONES</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950/60 text-[10px] text-amber-300 font-bold">
              {counts.totalPendientes}
            </span>
          </button>
        </div>
      </div>

      {/* Dashboard Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 flex flex-col h-64">
          <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Tendencias de Compra (General)
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.tendenciasData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.tendenciasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 flex flex-col h-64">
          <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            Estado de Prospecciones
          </h3>
          <div className="flex-1 w-full min-h-0">
            {chartData.prospeccionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.prospeccionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.prospeccionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-500">
                No hay datos de prospección
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de Alta Rápida de 1 Línea (Quick Add Row) */}
      <form onSubmit={handleAddQuickRow} className="glass-panel p-3.5 rounded-2xl border border-emerald-500/30 bg-slate-900/90 flex flex-wrap items-center gap-2.5 shadow-lg">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 pl-1 pr-2 whitespace-nowrap">
          <Plus className="w-4 h-4" />
          <span>Añadir {activeSection === 'prospeccion' ? 'Posible Cliente' : 'Farmacia'}:</span>
        </div>

        <input
          type="text"
          required
          placeholder="Nombre Farmacia *"
          value={quickNombre}
          onChange={e => setQuickNombre(e.target.value)}
          className="flex-1 min-w-[160px] bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-bold"
        />

        <input
          type="text"
          placeholder="Ciudad (Ej. Gijón)"
          value={quickCiudad}
          onChange={e => setQuickCiudad(e.target.value)}
          className="w-28 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />

        <input
          type="text"
          placeholder="Contacto (Ej. Marta)"
          value={quickContacto}
          onChange={e => setQuickContacto(e.target.value)}
          className="w-28 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />

        {activeSection === 'prospeccion' && (
          <input
            type="text"
            placeholder="Teléfono"
            value={quickTelefono}
            onChange={e => setQuickTelefono(e.target.value)}
            className="w-28 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        )}

        <select
          value={quickDecil}
          onChange={e => setQuickDecil(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500"
        >
          <option value="D10">D10 (VIP)</option>
          <option value="D09">D09</option>
          <option value="D08">D08</option>
          <option value="D07">D07</option>
          <option value="D05">D05</option>
          <option value="D04">D04</option>
          <option value="D03">D03</option>
          <option value="D02">D02</option>
          <option value="D01">D01</option>
        </select>

        <select
          value={quickAccion}
          onChange={e => setQuickAccion(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500"
        >
          <option value="Llamar">📞 Llamar</option>
          <option value="Visita">🚗 Visita</option>
          <option value="Seguimiento">⏱️ Seguimiento</option>
          <option value="Enviar info">📄 Enviar info</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all whitespace-nowrap"
        >
          + Insertar
        </button>
      </form>

      {/* Buscador y Filtros */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por farmacia, contacto, teléfono, notas..."
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
            <option value="all">Todas las Zonas</option>
            <option value="Asturias">Asturias</option>
            <option value="Cantabria">Cantabria</option>
          </select>

          {/* Filter Decil */}
          <select
            value={filterDecil}
            onChange={e => setFilterDecil(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos los Deciles</option>
            <option value="D10">D10 (VIP)</option>
            <option value="D09">D09</option>
            <option value="D08">D08</option>
            <option value="D07">D07</option>
            <option value="D05">D05</option>
            <option value="D04">D04</option>
            <option value="D03">D03</option>
            <option value="D02">D02</option>
            <option value="D01">D01</option>
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
        </div>
      </div>

      {/* Tabla Interactiva con Edición en Línea */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl h-[500px] flex flex-col">
        <div className="overflow-x-auto flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs relative">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-900/95 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px] shadow-sm backdrop-blur-md">
                {activeSection === 'pendientes' && <th className="py-3.5 px-3 text-center">Hecho</th>}
                <th className="py-3.5 px-3 hidden sm:table-cell">Código</th>
                <th className="py-3.5 px-4">Farmacia</th>
                <th className="py-3.5 px-3 hidden lg:table-cell">Dirección</th>
                <th className="py-3.5 px-3 hidden sm:table-cell">Ciudad</th>
                <th className="py-3.5 px-3 hidden md:table-cell">Contacto</th>
                {activeSection === 'prospeccion' && <th className="py-3.5 px-3 hidden sm:table-cell">Teléfono</th>}
                <th className="py-3.5 px-3">Decil</th>
                {activeSection === 'clientes' && <th className="py-3.5 px-3 hidden lg:table-cell">Ventas</th>}
                {activeSection === 'clientes' && <th className="py-3.5 px-3 hidden xl:table-cell">Frecuencia</th>}
                <th className="py-3.5 px-3 hidden xl:table-cell">Última Visita</th>
                <th className="py-3.5 px-3 hidden lg:table-cell">Próxima Acción</th>
                <th className="py-3.5 px-3 hidden md:table-cell">Fecha Acción</th>
                <th className="py-3.5 px-3 hidden xl:table-cell">Tendencia Compra</th>
                <th className="py-3.5 px-3 hidden lg:table-cell">Notas / Interés</th>
                <th className="py-3.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                  {/* Checkbox para Pendientes */}
                  {activeSection === 'pendientes' && (
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleTaskDone(item.id)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                          item.accion_completada 
                            ? 'bg-emerald-500 border-emerald-400 text-white' 
                            : 'border-slate-700 bg-slate-800 hover:border-emerald-500'
                        }`}
                      >
                        {item.accion_completada && <Check className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  )}

                  {/* Código */}
                  <td className="py-3 px-3 whitespace-nowrap hidden sm:table-cell">
                    <input
                      type="text"
                      value={item.codigo || ''}
                      placeholder="Cod."
                      onChange={e => handleUpdateField(item.id, 'codigo', e.target.value)}
                      className="bg-transparent hover:bg-slate-800/80 focus:bg-slate-800 px-2 py-1 rounded-lg text-slate-400 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-16 transition-colors"
                    />
                  </td>

                  {/* Nombre Farmacia (Editable directo) */}
                  <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                    <input
                      type="text"
                      value={item.farmacia_nombre}
                      onChange={e => handleUpdateField(item.id, 'farmacia_nombre', e.target.value)}
                      className="bg-transparent hover:bg-slate-800/80 focus:bg-slate-800 px-2 py-1 rounded-lg text-white font-bold text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full min-w-[140px] transition-colors"
                    />
                  </td>

                  {/* Dirección */}
                  <td className="py-3 px-3 whitespace-nowrap hidden lg:table-cell">
                    <input
                      type="text"
                      value={item.direccion || ''}
                      placeholder="Dirección..."
                      onChange={e => handleUpdateField(item.id, 'direccion', e.target.value)}
                      className="bg-transparent hover:bg-slate-800/80 focus:bg-slate-800 px-2 py-1 rounded-lg text-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-32 transition-colors truncate"
                    />
                  </td>

                  {/* Ciudad */}
                  <td className="py-3 px-3 whitespace-nowrap hidden sm:table-cell">
                    <input
                      type="text"
                      value={item.ciudad || ''}
                      onChange={e => handleUpdateField(item.id, 'ciudad', e.target.value)}
                      className="bg-transparent hover:bg-slate-800/80 focus:bg-slate-800 px-2 py-1 rounded-lg text-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-24 transition-colors"
                    />
                  </td>

                  {/* Contacto */}
                  <td className="py-3 px-3 whitespace-nowrap hidden md:table-cell">
                    <input
                      type="text"
                      value={item.contacto}
                      placeholder="---"
                      onChange={e => handleUpdateField(item.id, 'contacto', e.target.value)}
                      className="bg-transparent hover:bg-slate-800/80 focus:bg-slate-800 px-2 py-1 rounded-lg text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-24 transition-colors"
                    />
                  </td>

                  {/* Teléfono con botón llamar si es prospección */}
                  {activeSection === 'prospeccion' && (
                    <td className="py-3 px-3 whitespace-nowrap hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={item.telefono}
                          placeholder="600..."
                          onChange={e => handleUpdateField(item.id, 'telefono', e.target.value)}
                          className="bg-transparent hover:bg-slate-800/80 focus:bg-slate-800 px-2 py-1 rounded-lg text-slate-300 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-24 transition-colors"
                        />
                        {item.telefono && (
                          <a
                            href={`tel:${item.telefono}`}
                            title="Llamar"
                            className="p-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white transition-all"
                          >
                            <PhoneCall className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                  )}

                  {/* Decil (Dropdown directo) */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <select
                      value={item.decil}
                      onChange={e => handleUpdateField(item.id, 'decil', e.target.value)}
                      className="bg-slate-800/90 border border-slate-700/80 text-emerald-400 font-extrabold text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="D10">D10</option>
                      <option value="D09">D09</option>
                      <option value="D08">D08</option>
                      <option value="D07">D07</option>
                      <option value="D05">D05</option>
                      <option value="D04">D04</option>
                      <option value="D03">D03</option>
                      <option value="D02">D02</option>
                      <option value="D01">D01</option>
                    </select>
                  </td>

                  {/* Ventas Anuales */}
                  {activeSection === 'clientes' && (
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-200 hidden lg:table-cell">
                      <input
                        type="number"
                        step="10"
                        value={item.ventas_anuales || 0}
                        onChange={e => handleUpdateField(item.id, 'ventas_anuales', Number(e.target.value) || 0)}
                        className="bg-transparent hover:bg-slate-800/80 focus:bg-slate-800 px-2 py-1 rounded-lg text-slate-200 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-24 text-right transition-colors"
                      /> €
                    </td>
                  )}

                  {/* Frecuencia de Visita */}
                  {activeSection === 'clientes' && (
                    <td className="py-3 px-3 whitespace-nowrap hidden xl:table-cell">
                      <select
                        value={item.frecuencia_visita}
                        onChange={e => handleUpdateField(item.id, 'frecuencia_visita', e.target.value)}
                        className="bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="15 días">15 días</option>
                        <option value="30 días">30 días</option>
                        <option value="45 días">45 días</option>
                        <option value="60 días">60 días</option>
                      </select>
                    </td>
                  )}

                  {/* Última Visita */}
                  <td className="py-3 px-3 whitespace-nowrap hidden xl:table-cell">
                    <input
                      type="text"
                      placeholder="DD/MM/AAAA"
                      value={item.ultima_visita}
                      onChange={e => handleUpdateField(item.id, 'ultima_visita', e.target.value)}
                      className="bg-transparent hover:bg-slate-800/80 focus:bg-slate-800 px-2 py-1 rounded-lg text-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-24 transition-colors"
                    />
                  </td>

                  {/* Próxima Acción (Dropdown directo) */}
                  <td className="py-3 px-3 whitespace-nowrap hidden lg:table-cell">
                    <select
                      value={item.proxima_accion}
                      onChange={e => handleUpdateField(item.id, 'proxima_accion', e.target.value)}
                      className="bg-slate-800/90 border border-slate-700 text-white font-semibold text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Llamar">📞 Llamar</option>
                      <option value="Visita">🚗 Visita</option>
                      <option value="Seguimiento">⏱️ Seguimiento</option>
                      <option value="Enviar info">📄 Enviar info</option>
                      <option value="Cliente no contesta">⚠️ No contesta</option>
                    </select>
                  </td>

                  {/* Fecha Próxima Acción */}
                  <td className="py-3 px-3 whitespace-nowrap hidden md:table-cell">
                    <input
                      type="text"
                      placeholder="DD/MM/AAAA"
                      value={item.fecha_proxima_accion}
                      onChange={e => handleUpdateField(item.id, 'fecha_proxima_accion', e.target.value)}
                      className="bg-transparent hover:bg-slate-800/80 focus:bg-slate-800 px-2 py-1 rounded-lg text-indigo-300 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-24 transition-colors"
                    />
                  </td>

                  {/* Tendencia de Compra (Dropdown interactivo con iconos) */}
                  <td className="py-3 px-3 whitespace-nowrap hidden xl:table-cell">
                    <select
                      value={item.tendencia_compra}
                      onChange={e => handleUpdateField(item.id, 'tendencia_compra', e.target.value as PurchaseTrend)}
                      className={`text-[11px] font-bold rounded-lg px-2.5 py-1 border focus:outline-none ${
                        item.tendencia_compra === 'En crecimiento' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                        item.tendencia_compra === 'Potencial de subida' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' :
                        item.tendencia_compra === 'Dejando de comprar' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <option value="En crecimiento">🚀 En crecimiento</option>
                      <option value="Potencial de subida">💡 Potencial de subida</option>
                      <option value="Estable">⚖️ Estable</option>
                      <option value="Dejando de comprar">📉 Dejando de comprar</option>
                    </select>
                  </td>

                  {/* Notas / Interés directo editable */}
                  <td className="py-3 px-3 max-w-[200px] hidden lg:table-cell">
                    <input
                      type="text"
                      placeholder="Añadir notas..."
                      value={item.notas}
                      onChange={e => handleUpdateField(item.id, 'notas', e.target.value)}
                      className="bg-transparent hover:bg-slate-800/80 focus:bg-slate-800 px-2 py-1 rounded-lg text-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full truncate transition-colors"
                    />
                  </td>

                  {/* Botones de acción */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Promover prospección a cliente */}
                      {item.category_type === 'prospeccion' && (
                        <button
                          onClick={() => handlePromoteToClient(item.id)}
                          title="Cerrar como Cliente Activo"
                          className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white text-[10px] font-bold transition-all flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Convertir a Cliente
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEditModal(item)}
                        title="Ver / Editar Detalles Completos"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {canEdit && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Eliminar registro"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-all"
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

        {displayItems.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-xs">
            No hay registros en esta sección con los filtros actuales.
          </div>
        )}
      </div>

      {/* Modal Detalles / Edición Completa */}
      {modalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Ficha Completa: {editingItem.farmacia_nombre}</h3>
                  <p className="text-xs text-slate-400">Edición detallada de datos comerciales y competencia</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Tipo de Ficha</label>
                  <select
                    value={editingItem.category_type}
                    onChange={e => setEditingItem({ ...editingItem, category_type: e.target.value as ClientCategory })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="cliente">📋 Cartera de Clientes (Activo)</option>
                    <option value="prospeccion">🎯 Prospección (Lead / Posible Cliente)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Farmacia / Herbolario *</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Cod."
                      value={editingItem.codigo || ''}
                      onChange={e => setEditingItem({ ...editingItem, codigo: e.target.value })}
                      className="w-1/4 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Nombre..."
                      value={editingItem.farmacia_nombre}
                      onChange={e => setEditingItem({ ...editingItem, farmacia_nombre: e.target.value })}
                      className="w-3/4 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Contacto</label>
                  <input
                    type="text"
                    value={editingItem.contacto}
                    onChange={e => setEditingItem({ ...editingItem, contacto: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Teléfono</label>
                  <input
                    type="text"
                    value={editingItem.telefono}
                    onChange={e => setEditingItem({ ...editingItem, telefono: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Ciudad / Provincia / Dirección</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Ciudad"
                      value={editingItem.ciudad}
                      onChange={e => setEditingItem({ ...editingItem, ciudad: e.target.value })}
                      className="w-1/3 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Provincia"
                      value={editingItem.provincia}
                      onChange={e => setEditingItem({ ...editingItem, provincia: e.target.value })}
                      className="w-1/3 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Dirección exacta (Opcional)"
                      value={editingItem.direccion || ''}
                      onChange={e => setEditingItem({ ...editingItem, direccion: e.target.value })}
                      className="w-1/3 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Categoría / Decil</label>
                  <select
                    value={editingItem.decil}
                    onChange={e => setEditingItem({ ...editingItem, decil: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="D10">D10 (Ventas VIP)</option>
                    <option value="D09">D09</option>
                    <option value="D08">D08</option>
                    <option value="D07">D07</option>
                    <option value="D05">D05</option>
                    <option value="D04">D04</option>
                    <option value="D03">D03</option>
                    <option value="D02">D02</option>
                    <option value="D01">D01</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-emerald-400">Le Interesa (Top Ventas)</label>
                  <input
                    type="text"
                    placeholder="Colágeno marino, Sportlife..."
                    value={editingItem.le_interesa}
                    onChange={e => setEditingItem({ ...editingItem, le_interesa: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-rose-400">Marcas Competencia</label>
                  <input
                    type="text"
                    placeholder="Ana M. Lajusticia, Epaplus..."
                    value={editingItem.marcas_competencia}
                    onChange={e => setEditingItem({ ...editingItem, marcas_competencia: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Detalles Competencia</label>
                <input
                  type="text"
                  placeholder="Ej. Tienen expositor en mostrador / descuento agresivo"
                  value={editingItem.detalles_competencia}
                  onChange={e => setEditingItem({ ...editingItem, detalles_competencia: e.target.value })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-400">Notas / Observaciones</label>
                  <button
                    type="button"
                    onClick={handleDictation}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                      isListening 
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' 
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3 h-3" /> Detener
                      </>
                    ) : (
                      <>
                        <Mic className="w-3 h-3" /> Dictar nota por voz
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={4}
                  placeholder="Detalles sobre acuerdos, promociones, citas o reportes dictados..."
                  value={editingItem.notas}
                  onChange={e => setEditingItem({ ...editingItem, notas: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none"
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
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
