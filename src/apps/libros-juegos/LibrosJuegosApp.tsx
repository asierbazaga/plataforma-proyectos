import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Gamepad2,
  Film,
  Tv,
  Plus,
  Star,
  CheckCircle,
  Clock,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  Search,
  BarChart3,
  Compass,
  Trash2,
  Edit3,
  Shuffle,
  Bookmark,
  Check,
  Calendar,
  X,
  ExternalLink,
  Layers,
  Award,
  Filter,
  Eye,
  ThumbsUp
} from 'lucide-react';
import { LibraryItem, MediaType, MediaStatus } from '../../types';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { mediaSearchService, SearchResultItem } from './services/mediaSearchService';
import { recommendationEngine, RecommendationReason, UserTasteProfile } from './services/recommendationEngine';
import { CatalogItem } from './data/defaultCatalog';
import { useToast } from '../../context/ToastContext';

interface LibrosJuegosAppProps {
  onBack?: () => void;
}

type ActiveTab = 'history' | 'explore' | 'recommendations' | 'stats';

export const LibrosJuegosApp: React.FC<LibrosJuegosAppProps> = ({ onBack }) => {
  const { canEditApp, currentUser } = useAuth();
  const canEdit = canEditApp('libros-juegos');
  const toast = useToast();

  // State
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('history');
  const [mediaFilter, setMediaFilter] = useState<MediaType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<MediaStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating_desc' | 'recent' | 'title'>('recent');

  // Explore & Live Search State
  const [exploreQuery, setExploreQuery] = useState('');
  const [exploreType, setExploreType] = useState<MediaType | 'all'>('all');
  const [exploreResults, setExploreResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formMediaType, setFormMediaType] = useState<MediaType>('book');
  const [formGenre, setFormGenre] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formYear, setFormYear] = useState<number | ''>('');
  const [formCoverUrl, setFormCoverUrl] = useState('');
  const [formStatus, setFormStatus] = useState<MediaStatus>('completed');
  const [formRating, setFormRating] = useState<number>(8); // 1-10
  const [formProgress, setFormProgress] = useState<number>(100);
  const [formReview, setFormReview] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formCompletedDate, setFormCompletedDate] = useState('');

  // Random Pick State (Roulette)
  const [randomPick, setRandomPick] = useState<CatalogItem | null>(null);
  const [showRandomModal, setShowRandomModal] = useState(false);

  // Auto-fill suggestions in form
  const [liveSuggestions, setLiveSuggestions] = useState<SearchResultItem[]>([]);

  const loadData = async () => {
    const list = await storageService.getLibrary(currentUser?.id);
    setItems(list);
  };

  useEffect(() => {
    loadData();
    storageService.syncFromCloud().then(() => {
      loadData();
    });

    const unsubscribe = storageService.onSync(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  // Initial load of explore results
  useEffect(() => {
    handleExploreSearch(exploreQuery, exploreType);
  }, [exploreType]);

  const handleExploreSearch = async (query: string, type: MediaType | 'all') => {
    setIsSearching(true);
    try {
      const results = await mediaSearchService.search(query, type);
      setExploreResults(results);
    } catch (e) {
      toast.error('Error buscando medios: ' + (e as Error).message);
    } finally {
      setIsSearching(false);
    }
  };

  // Form Auto-suggestions
  useEffect(() => {
    if (!formTitle.trim() || formTitle.length < 2) {
      setLiveSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await mediaSearchService.search(formTitle, formMediaType);
      setLiveSuggestions(results.slice(0, 4));
    }, 300);
    return () => clearTimeout(timer);
  }, [formTitle, formMediaType]);

  const openAddModal = (prefill?: Partial<LibraryItem>) => {
    setEditingItem(null);
    setFormTitle(prefill?.title || '');
    setFormMediaType(prefill?.media_type || 'book');
    setFormGenre(prefill?.genre || 'Fantasía');
    setFormAuthor(prefill?.author_creator || '');
    setFormYear(prefill?.year || new Date().getFullYear());
    setFormCoverUrl(prefill?.cover_url || '');
    setFormStatus(prefill?.status || 'completed');
    setFormRating(prefill?.rating || 8);
    setFormProgress(prefill?.progress_percentage ?? 100);
    setFormReview(prefill?.user_review || '');
    setFormTags(prefill?.tags?.join(', ') || '');
    setFormCompletedDate(prefill?.completed_date || new Date().toISOString().substring(0, 10));
    setShowModal(true);
  };

  const openEditModal = (item: LibraryItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormMediaType(item.media_type);
    setFormGenre(item.genre);
    setFormAuthor(item.author_creator || '');
    setFormYear(item.year || '');
    setFormCoverUrl(item.cover_url || '');
    setFormStatus(item.status);
    setFormRating(item.rating);
    setFormProgress(item.progress_percentage);
    setFormReview(item.user_review || '');
    setFormTags(item.tags?.join(', ') || '');
    setFormCompletedDate(item.completed_date || '');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const tagsArray = formTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const itemData: Omit<LibraryItem, 'id'> = {
      title: formTitle.trim(),
      media_type: formMediaType,
      genre: formGenre.trim() || 'General',
      author_creator: formAuthor.trim() || undefined,
      year: formYear ? Number(formYear) : undefined,
      cover_url: formCoverUrl.trim() || undefined,
      status: formStatus,
      rating: Number(formRating),
      progress_percentage: Number(formProgress),
      user_review: formReview.trim() || undefined,
      tags: tagsArray,
      completed_date: formStatus === 'completed' ? (formCompletedDate || new Date().toISOString().substring(0, 10)) : undefined
    };

    if (editingItem) {
      await storageService.updateLibraryItem(editingItem.id, itemData);
      toast.success('Registro actualizado exitosamente');
    } else {
      await storageService.addLibraryItem(itemData, currentUser?.id);
      toast.success('Añadido exitosamente al histórico');
    }

    setShowModal(false);
    await loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este registro de tu histórico?')) {
      await storageService.deleteLibraryItem(id);
      toast.success('Registro eliminado');
      await loadData();
    }
  };

  const handleQuickAddFromCatalog = async (item: SearchResultItem | CatalogItem, status: MediaStatus = 'completed') => {
    const existing = items.find(i => i.title.toLowerCase() === item.title.toLowerCase());
    if (existing) {
      toast.warning(`"${item.title}" ya está en tu histórico.`);
      return;
    }

    await storageService.addLibraryItem({
      title: item.title,
      media_type: item.media_type,
      genre: item.genre || 'Desconocido',
      author_creator: item.author_creator,
      year: item.year,
      cover_url: item.cover_url,
      status: status,
      rating: item.rating_global ? Math.round(item.rating_global) : 8,
      progress_percentage: status === 'completed' ? 100 : status === 'in_progress' ? 50 : 0,
      tags: item.tags || [],
      completed_date: status === 'completed' ? new Date().toISOString().substring(0, 10) : undefined
    }, currentUser?.id);

    toast.success(`Añadido "${item.title}" a tu lista`);
    await loadData();
  };

  const handleSpinRoulette = () => {
    const pick = recommendationEngine.getRandomPick(items, mediaFilter);
    setRandomPick(pick);
    setShowRandomModal(true);
  };

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchMedia = mediaFilter === 'all' || item.media_type === mediaFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.author_creator && item.author_creator.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchMedia && matchStatus && matchSearch;
    }).sort((a, b) => {
      if (sortBy === 'rating_desc') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      // recent default
      return (new Date(b.created_at || '').getTime()) - (new Date(a.created_at || '').getTime());
    });
  }, [items, mediaFilter, statusFilter, searchQuery, sortBy]);

  // Recommendations Data
  const recommendationsData = useMemo(() => {
    return recommendationEngine.getPersonalizedRecommendations(items, mediaFilter);
  }, [items, mediaFilter]);

  const tasteProfile: UserTasteProfile = useMemo(() => {
    return recommendationEngine.getUserProfile(items);
  }, [items]);

  // Helper styles
  const getMediaBadge = (type: MediaType) => {
    switch (type) {
      case 'book':
        return { label: 'Libro', icon: BookOpen, bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
      case 'game':
        return { label: 'Juego', icon: Gamepad2, bg: 'bg-pink-500/10 text-pink-400 border-pink-500/30' };
      case 'movie':
        return { label: 'Película', icon: Film, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'series':
        return { label: 'Serie TV', icon: Tv, bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
    }
  };

  const getStatusBadge = (status: MediaStatus) => {
    switch (status) {
      case 'completed':
        return { label: 'Completado', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
      case 'in_progress':
        return { label: 'En Progreso', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' };
      case 'wishlist':
        return { label: 'Pendiente / Deseado', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' };
      case 'abandoned':
        return { label: 'Abandonado', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-purple-900/40 via-indigo-950/30 to-slate-900/50 p-6 rounded-3xl border border-purple-500/20 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              title="Volver a la Plataforma"
              className="p-3 rounded-2xl bg-slate-800/90 hover:bg-purple-600 hover:text-white text-slate-300 border border-slate-700 hover:border-purple-400 transition-all flex items-center justify-center group shadow-md"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
            <Sparkles className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                CENTRO MULTIMEDIA & RECOMENDACIONES
              </h1>
              <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 font-medium">
                Libros • Juegos • Cine • Series
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Tu diario personal de entretenimiento, puntuaciones y motor inteligente de recomendaciones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          <button
            onClick={handleSpinRoulette}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold rounded-2xl border border-purple-500/30 hover:border-purple-400 transition-all shadow-md text-sm"
          >
            <Shuffle className="w-4 h-4 text-purple-400" />
            ¿Qué disfrutar hoy?
          </button>
          {canEdit ? (
            <button
              onClick={() => openAddModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-105 active:scale-95 text-sm"
            >
              <Plus className="w-5 h-5" />
              Registrar Obra
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/20">
              <ShieldAlert className="w-4 h-4" /> Modo Lectura
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Mi Historial ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'explore'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            Explorar Catálogo
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'recommendations'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Para Ti (Recomendaciones)
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Estadísticas
          </button>
        </div>

        {/* Media Type Quick Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setMediaFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              mediaFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setMediaFilter('book')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              mediaFilter === 'book' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Libros
          </button>
          <button
            onClick={() => setMediaFilter('game')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              mediaFilter === 'game' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" /> Juegos
          </button>
          <button
            onClick={() => setMediaFilter('movie')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              mediaFilter === 'movie' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" /> Películas
          </button>
          <button
            onClick={() => setMediaFilter('series')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              mediaFilter === 'series' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" /> Series
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MI HISTORIAL (PERSONAL LIBRARY) */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Sub-filters & Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
            {/* Search in History */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por título, autor, género o etiqueta..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === 'all'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                Cualquier Estado
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                Completados
              </button>
              <button
                onClick={() => setStatusFilter('in_progress')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === 'in_progress'
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                En Progreso
              </button>
              <button
                onClick={() => setStatusFilter('wishlist')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === 'wishlist'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                Pendientes
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 whitespace-nowrap">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="recent">Añadidos recientemente</option>
                <option value="rating_desc">Mayor Puntuación (10 ⭐)</option>
                <option value="title">Título (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Grid of Items */}
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
                <Bookmark className="w-8 h-8 opacity-70" />
              </div>
              <h3 className="text-lg font-bold text-white">No hay registros con los filtros seleccionados</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                {items.length === 0
                  ? 'Aún no has registrado ninguna obra. ¡Añade tu primer libro, juego, peli o serie para empezar a generar recomendaciones!'
                  : 'Prueba a cambiar los filtros o la búsqueda para encontrar lo que buscas.'}
              </p>
              {items.length === 0 && canEdit && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => openAddModal()}
                    className="px-5 py-2.5 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-500 transition-all text-sm"
                  >
                    + Añadir Manualmente
                  </button>
                  <button
                    onClick={() => setActiveTab('explore')}
                    className="px-5 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-2xl hover:bg-slate-700 transition-all text-sm border border-slate-700"
                  >
                    Explorar Catálogo Masivo
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredItems.map(item => {
                const badge = getMediaBadge(item.media_type);
                const statusBadge = getStatusBadge(item.status);
                const Icon = badge.icon;

                return (
                  <div
                    key={item.id}
                    className="group glass-panel rounded-3xl border border-slate-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 flex flex-col justify-between overflow-hidden bg-slate-900/80"
                  >
                    {/* Top Cover / Header */}
                    <div className="relative h-44 w-full bg-slate-800 overflow-hidden">
                      {item.cover_url ? (
                        <img
                          src={item.cover_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={e => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                          <Icon className="w-16 h-16 text-slate-700 group-hover:text-purple-500/40 transition-colors" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                      {/* Badges on top of cover */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border backdrop-blur-md ${badge.bg}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {badge.label}
                        </span>
                        {item.year && (
                          <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-black/60 text-slate-300 border border-white/10 backdrop-blur-md">
                            {item.year}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      {canEdit && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(item)}
                            title="Editar"
                            className="p-1.5 rounded-xl bg-black/60 hover:bg-purple-600 text-slate-300 hover:text-white transition-all backdrop-blur-md"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Eliminar"
                            className="p-1.5 rounded-xl bg-black/60 hover:bg-rose-600 text-slate-300 hover:text-white transition-all backdrop-blur-md"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Rating Banner over cover */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl border border-amber-400/30">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-extrabold text-amber-300">{item.rating}/10</span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold text-white text-base leading-snug line-clamp-2" title={item.title}>
                          {item.title}
                        </h3>
                        {item.author_creator && (
                          <p className="text-xs font-medium text-purple-300 line-clamp-1">
                            {item.author_creator}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 line-clamp-1">{item.genre}</p>
                      </div>

                      {/* Review / Note snippet */}
                      {item.user_review && (
                        <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50 text-xs text-slate-300 italic line-clamp-2">
                          "{item.user_review}"
                        </div>
                      )}

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Progress Bar (if in progress) */}
                      {item.status === 'in_progress' && (
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                            <span>Progreso</span>
                            <span className="text-indigo-300 font-bold">{item.progress_percentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              style={{ width: `${item.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Status Bottom Bar */}
                      <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-800/80">
                        <span className={`px-2.5 py-0.5 rounded-lg font-medium border text-[11px] ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                        {item.completed_date && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.completed_date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EXPLORAR & CATÁLOGO MASIVO (DISCOVERY / SEARCH APIS) */}
      {/* ========================================================================= */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* Search Header */}
          <div className="bg-gradient-to-r from-purple-950/50 to-slate-900 p-6 rounded-3xl border border-purple-500/20 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Compass className="w-6 h-6 text-purple-400" />
                  Buscador Universal y Catálogo Extenso
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Encuentra millones de libros (Open Library), series de televisión (TVMaze) y obras maestras del cine y videojuegos.
                </p>
              </div>
              {/* Type toggle */}
              <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
                <button
                  onClick={() => {
                    setExploreType('all');
                    handleExploreSearch(exploreQuery, 'all');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    exploreType === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todo
                </button>
                <button
                  onClick={() => {
                    setExploreType('book');
                    handleExploreSearch(exploreQuery, 'book');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    exploreType === 'book' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Libros
                </button>
                <button
                  onClick={() => {
                    setExploreType('game');
                    handleExploreSearch(exploreQuery, 'game');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    exploreType === 'game' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Juegos
                </button>
                <button
                  onClick={() => {
                    setExploreType('movie');
                    handleExploreSearch(exploreQuery, 'movie');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    exploreType === 'movie' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Películas
                </button>
                <button
                  onClick={() => {
                    setExploreType('series');
                    handleExploreSearch(exploreQuery, 'series');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    exploreType === 'series' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Series
                </button>
              </div>
            </div>

            {/* Input Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Escribe el nombre de cualquier libro, película, serie o juego..."
                  value={exploreQuery}
                  onChange={e => {
                    setExploreQuery(e.target.value);
                    handleExploreSearch(e.target.value, exploreType);
                  }}
                  className="w-full bg-slate-900 border border-purple-500/30 focus:border-purple-400 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none shadow-inner"
                />
                {exploreQuery && (
                  <button
                    onClick={() => {
                      setExploreQuery('');
                      handleExploreSearch('', exploreType);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => handleExploreSearch(exploreQuery, exploreType)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl hover:brightness-110 transition-all text-sm flex items-center gap-2 flex-shrink-0"
              >
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Buscar
              </button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {exploreResults.map(item => {
              const badge = getMediaBadge(item.media_type);
              const Icon = badge.icon;
              const isAlreadyInLibrary = items.some(i => i.title.toLowerCase() === item.title.toLowerCase());

              return (
                <div
                  key={item.id}
                  className="glass-panel rounded-3xl border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between overflow-hidden bg-slate-900/80 group"
                >
                  <div className="relative h-44 w-full bg-slate-800 overflow-hidden">
                    {item.cover_url ? (
                      <img
                        src={item.cover_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                        <Icon className="w-16 h-16 text-slate-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border backdrop-blur-md ${badge.bg}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {badge.label}
                      </span>
                    </div>

                    {item.rating_global && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl border border-amber-400/30">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-extrabold text-amber-300">{item.rating_global}/10</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-base leading-snug line-clamp-2">{item.title}</h3>
                      <p className="text-xs font-medium text-purple-300 line-clamp-1">{item.author_creator}</p>
                      <p className="text-xs text-slate-400 line-clamp-1">{item.genre}</p>
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{item.description}</p>
                    )}

                    <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                      {isAlreadyInLibrary ? (
                        <div className="w-full py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4" /> En tu Historial
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleQuickAddFromCatalog(item, 'completed')}
                            className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> + Visto / Leído
                          </button>
                          <button
                            onClick={() => handleQuickAddFromCatalog(item, 'wishlist')}
                            title="Añadir a Deseados / Pendientes"
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-slate-700 hover:border-amber-400/40 transition-all"
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RECOMENDACIONES PERSONALIZADAS (RECOMMENDER ENGINE) */}
      {/* ========================================================================= */}
      {activeTab === 'recommendations' && (
        <div className="space-y-8">
          {/* Taste summary banner */}
          <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-pink-900/20 p-6 rounded-3xl border border-purple-500/30 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-amber-300" />
                  <h2 className="text-xl font-bold text-white">Tu Perfil de Gustos Personalizado</h2>
                </div>
                <p className="text-slate-300 text-sm">
                  Basado en tus <span className="text-purple-300 font-bold">{items.length} obras registradas</span> y
                  tus valoraciones medias de{' '}
                  <span className="text-amber-400 font-bold">{tasteProfile.averageRating} ⭐</span>.
                </p>
              </div>

              <button
                onClick={handleSpinRoulette}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-pink-500 text-white font-bold rounded-2xl hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-amber-500/20 text-sm self-start md:self-auto"
              >
                <Shuffle className="w-4 h-4" /> Elegir Sorpresa Aleatoria
              </button>
            </div>

            {/* Top Genres Pills */}
            {tasteProfile.topGenres.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-2">
                <span className="text-xs font-semibold text-slate-400">Tus géneros favoritos:</span>
                {tasteProfile.topGenres.slice(0, 4).map((g, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    {g.genre} ({g.avgRating}⭐ media)
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Section A: Porque te gustó [X] */}
          {recommendationsData.basedOnLiked.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Porque te encantaron tus favoritos</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {recommendationsData.basedOnLiked.map((rec, idx) => {
                  const badge = getMediaBadge(rec.item.media_type);
                  const Icon = badge.icon;
                  return (
                    <div
                      key={idx}
                      className="glass-panel rounded-3xl border border-purple-500/30 hover:border-purple-400 transition-all p-5 flex flex-col justify-between bg-slate-900/90 shadow-lg space-y-4"
                    >
                      <div className="flex gap-4">
                        <img
                          src={rec.item.cover_url}
                          alt={rec.item.title}
                          className="w-20 h-28 object-cover rounded-xl flex-shrink-0 shadow-md border border-slate-700"
                        />
                        <div className="space-y-1 flex-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${badge.bg}`}
                          >
                            <Icon className="w-3 h-3" />
                            {badge.label}
                          </span>
                          <h4 className="font-bold text-white text-sm line-clamp-2 leading-tight">{rec.item.title}</h4>
                          <p className="text-xs text-purple-300 line-clamp-1">{rec.item.author_creator}</p>
                          <p className="text-[11px] text-slate-400">{rec.item.genre}</p>
                        </div>
                      </div>

                      <div className="bg-purple-950/40 p-3 rounded-2xl border border-purple-500/20 space-y-1 text-xs">
                        <span className="font-bold text-purple-300 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {rec.score}% Afinidad
                        </span>
                        <p className="text-slate-300 text-[11px]">{rec.reason}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleQuickAddFromCatalog(rec.item, 'completed')}
                          className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all"
                        >
                          + Marcar Visto
                        </button>
                        <button
                          onClick={() => handleQuickAddFromCatalog(rec.item, 'wishlist')}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold border border-slate-700"
                        >
                          Pendiente
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section B: Joyas de la Crítica Global */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Obras Maestras Universales que no deberías perderte</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recommendationsData.criticsPicks.map((rec, idx) => {
                const badge = getMediaBadge(rec.item.media_type);
                const Icon = badge.icon;
                return (
                  <div
                    key={idx}
                    className="glass-panel rounded-3xl border border-slate-800 hover:border-amber-500/40 transition-all p-4 flex flex-col justify-between bg-slate-900/80 group space-y-3"
                  >
                    <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-800">
                      <img src={rec.item.cover_url} alt={rec.item.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2">
                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border backdrop-blur-md ${badge.bg}`}
                        >
                          <Icon className="w-3 h-3" /> {badge.label}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded-lg border border-amber-400/40 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-extrabold text-amber-300">{rec.item.rating_global}/10</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-sm line-clamp-1">{rec.item.title}</h4>
                      <p className="text-xs text-purple-300 line-clamp-1">{rec.item.author_creator}</p>
                      <p className="text-[11px] text-slate-400">{rec.item.genre}</p>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleQuickAddFromCatalog(rec.item, 'completed')}
                        className="flex-1 py-1.5 bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700"
                      >
                        + Visto / Leído
                      </button>
                      <button
                        onClick={() => handleQuickAddFromCatalog(rec.item, 'wishlist')}
                        title="Añadir a Lista de Deseos"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl border border-slate-700"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ESTADÍSTICAS & ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Top 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-3xl border border-purple-500/20 bg-slate-900/80 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold">Total Libros Leídos</p>
                <h4 className="text-3xl font-extrabold text-white">{tasteProfile.mediaCounts.book}</h4>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-pink-500/20 bg-slate-900/80 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold">Total Videojuegos</p>
                <h4 className="text-3xl font-extrabold text-white">{tasteProfile.mediaCounts.game}</h4>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/30">
                <Gamepad2 className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-amber-500/20 bg-slate-900/80 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold">Películas Vistas</p>
                <h4 className="text-3xl font-extrabold text-white">{tasteProfile.mediaCounts.movie}</h4>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Film className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-cyan-500/20 bg-slate-900/80 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold">Series Completadas</p>
                <h4 className="text-3xl font-extrabold text-white">{tasteProfile.mediaCounts.series}</h4>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Tv className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Genres Breakdown */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                Desglose por Géneros
              </h3>
              {tasteProfile.topGenres.length === 0 ? (
                <p className="text-slate-400 text-xs">Aún no hay datos suficientes de géneros.</p>
              ) : (
                <div className="space-y-3">
                  {tasteProfile.topGenres.slice(0, 6).map((g, idx) => {
                    const pct = Math.min(100, Math.round((g.count / Math.max(1, items.length)) * 100));
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">{g.genre}</span>
                          <span className="text-purple-400">
                            {g.count} obras ({g.avgRating} ⭐)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Satisfaction and Highlights */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                Índice de Satisfacción Global
              </h3>
              <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <div className="text-center">
                  <div className="text-4xl font-extrabold text-amber-300">{tasteProfile.averageRating}</div>
                  <div className="text-[11px] text-slate-400">Puntuación Media</div>
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  <p>
                    • <strong className="text-white">{tasteProfile.completedItems}</strong> obras completadas al 100%.
                  </p>
                  <p>
                    • <strong className="text-white">{items.filter(i => i.rating >= 8).length}</strong> obras
                    calificadas como sobresalientes (8-10 ⭐).
                  </p>
                  <p>
                    • <strong className="text-white">{items.filter(i => i.status === 'wishlist').length}</strong> en
                    lista de pendientes / deseados.
                  </p>
                </div>
              </div>

              {/* Annual Goal Progress */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/20 space-y-2">
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>Reto Anual 2026</span>
                  <span className="text-purple-300">{tasteProfile.completedItems} / 50 Obras</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 rounded-full"
                    style={{ width: `${Math.min(100, (tasteProfile.completedItems / 50) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 text-right">
                  {Math.round((tasteProfile.completedItems / 50) * 100)}% del objetivo completado
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AÑADIR / EDITAR REGISTRO */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel bg-slate-900 border border-purple-500/30 rounded-3xl w-full max-w-xl p-6 space-y-5 my-8 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                {editingItem ? 'Editar Obra en el Histórico' : 'Registrar Nueva Obra Multimedia'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Media Type Selector */}
              <div>
                <label className="text-xs font-bold text-slate-400">Tipo de Medio</label>
                <div className="grid grid-cols-4 gap-2 mt-1.5">
                  {(['book', 'game', 'movie', 'series'] as MediaType[]).map(type => {
                    const badge = getMediaBadge(type);
                    const Icon = badge.icon;
                    const isSelected = formMediaType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormMediaType(type)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {badge.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title with live suggestions */}
              <div className="relative">
                <label className="text-xs font-bold text-slate-400">Título de la Obra</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Dune, The Witcher 3, Interstellar..."
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />

                {/* Suggestions drop */}
                {liveSuggestions.length > 0 && !editingItem && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-slate-900 border border-purple-500/40 rounded-2xl p-2 shadow-2xl space-y-1">
                    <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider px-2 py-1">
                      Sugerencias de autocompletado:
                    </p>
                    {liveSuggestions.map(sug => (
                      <button
                        key={sug.id}
                        type="button"
                        onClick={() => {
                          setFormTitle(sug.title);
                          if (sug.author_creator) setFormAuthor(sug.author_creator);
                          if (sug.genre) setFormGenre(sug.genre);
                          if (sug.year) setFormYear(sug.year);
                          if (sug.cover_url) setFormCoverUrl(sug.cover_url);
                          if (sug.tags) setFormTags(sug.tags.join(', '));
                          setLiveSuggestions([]);
                        }}
                        className="w-full text-left p-2 hover:bg-slate-800 rounded-xl flex items-center gap-3 transition-colors group"
                      >
                        {sug.cover_url && (
                          <img src={sug.cover_url} alt="" className="w-8 h-10 object-cover rounded-md flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                            {sug.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {sug.author_creator} {sug.year ? `(${sug.year})` : ''} • {sug.genre}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Creator & Genre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400">Autor / Director / Estudio</label>
                  <input
                    type="text"
                    placeholder="Ej. Frank Herbert / Christopher Nolan"
                    value={formAuthor}
                    onChange={e => setFormAuthor(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400">Género</label>
                  <input
                    type="text"
                    placeholder="Ej. Ciencia Ficción / Thriller"
                    value={formGenre}
                    onChange={e => setFormGenre(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Year & Cover URL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400">Año de Estreno / Publicación</label>
                  <input
                    type="number"
                    placeholder="Ej. 2023"
                    value={formYear}
                    onChange={e => setFormYear(e.target.value ? Number(e.target.value) : '')}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-400">URL de la Portada / Carátula</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formCoverUrl}
                    onChange={e => setFormCoverUrl(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Status & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400">Estado de Consumo</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as MediaStatus)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="completed">Completado / Terminado</option>
                    <option value="in_progress">En Progreso / Viendo / Jugando</option>
                    <option value="wishlist">Pendientes / Deseados</option>
                    <option value="abandoned">Abandonado</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 flex justify-between">
                    <span>Puntuación Personal (1 a 10 ⭐)</span>
                    <span className="text-amber-400 font-extrabold">{formRating} / 10</span>
                  </label>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFormRating(val)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                          val <= formRating
                            ? 'bg-amber-400 text-black font-extrabold shadow'
                            : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress & Completed Date */}
              {formStatus === 'in_progress' ? (
                <div>
                  <label className="text-xs font-bold text-slate-400 flex justify-between">
                    <span>Progreso (%)</span>
                    <span className="text-indigo-400 font-bold">{formProgress}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formProgress}
                    onChange={e => setFormProgress(Number(e.target.value))}
                    className="w-full mt-1 accent-purple-500"
                  />
                </div>
              ) : formStatus === 'completed' ? (
                <div>
                  <label className="text-xs font-bold text-slate-400">Fecha de Finalización</label>
                  <input
                    type="date"
                    value={formCompletedDate}
                    onChange={e => setFormCompletedDate(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              ) : null}

              {/* Review / Personal Notes */}
              <div>
                <label className="text-xs font-bold text-slate-400">Opinión / Reseña Personal</label>
                <textarea
                  rows={3}
                  placeholder="¿Qué te pareció la historia, personajes, banda sonora o final?..."
                  value={formReview}
                  onChange={e => setFormReview(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-bold text-slate-400">Etiquetas (separadas por comas)</label>
                <input
                  type="text"
                  placeholder="Obra Maestra, Trama Épica, Final Inesperado..."
                  value={formTags}
                  onChange={e => setFormTags(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm"
                >
                  {editingItem ? 'Guardar Cambios' : 'Registrar en Mi Histórico'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RULETA / SUGERENCIA ALEATORIA "¿QUÉ DISFRUTAR HOY?" */}
      {/* ========================================================================= */}
      {showRandomModal && randomPick && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-amber-400/40 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-lg">
                <Sparkles className="w-5 h-5" />
                Tu Elección del Destino
              </div>
              <button onClick={() => setShowRandomModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4">
              <img
                src={randomPick.cover_url}
                alt={randomPick.title}
                className="w-28 h-40 object-cover rounded-2xl border border-slate-700 shadow-xl flex-shrink-0"
              />
              <div className="space-y-1.5 flex-1">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {getMediaBadge(randomPick.media_type).label} • {randomPick.year}
                </span>
                <h4 className="text-lg font-bold text-white leading-tight">{randomPick.title}</h4>
                <p className="text-xs font-medium text-purple-300">{randomPick.author_creator}</p>
                <p className="text-xs text-slate-400">{randomPick.genre}</p>
                <div className="flex items-center gap-1 text-amber-400 font-bold text-xs pt-1">
                  <Star className="w-4 h-4 fill-amber-400" /> {randomPick.rating_global}/10 Crítica Global
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
              {randomPick.description}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSpinRoulette}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700"
              >
                <Shuffle className="w-4 h-4" /> Otra Opción
              </button>
              <button
                onClick={() => {
                  handleQuickAddFromCatalog(randomPick, 'wishlist');
                  setShowRandomModal(false);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-pink-500 text-white font-bold rounded-xl text-xs hover:brightness-110 transition-all shadow-lg"
              >
                + Añadir a Mis Pendientes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
