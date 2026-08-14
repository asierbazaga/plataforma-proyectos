import React, { useState, useEffect } from 'react';
import { BookOpen, Gamepad2, Plus, Star, CheckCircle, Clock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { LibraryItem } from '../../types';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';

interface LibrosJuegosAppProps {
  onBack?: () => void;
}

export const LibrosJuegosApp: React.FC<LibrosJuegosAppProps> = ({ onBack }) => {
  const { canEditApp } = useAuth();
  const canEdit = canEditApp('libros-juegos');
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'book' | 'game'>('all');
  const [showModal, setShowModal] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState<'book' | 'game'>('book');
  const [genre, setGenre] = useState('Fantasía / Ciencia Ficción');
  const [status, setStatus] = useState<'in_progress' | 'completed' | 'wishlist'>('in_progress');
  const [rating, setRating] = useState(5);
  const [progress, setProgress] = useState(50);

  const loadData = async () => {
    const list = await storageService.getLibrary();
    setItems(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await storageService.addLibraryItem({
      title,
      media_type: mediaType,
      genre,
      status,
      rating: Number(rating),
      progress_percentage: Number(progress)
    });

    setTitle('');
    setShowModal(false);
    await loadData();
  };

  const filteredItems = items.filter(i => filter === 'all' || i.media_type === filter);
  const totalBooks = items.filter(i => i.media_type === 'book').length;
  const totalGames = items.filter(i => i.media_type === 'game').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent p-6 rounded-2xl border border-purple-500/20">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              title="Volver a la Plataforma"
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-purple-600 hover:text-white text-slate-300 border border-slate-700 hover:border-purple-400 transition-all flex items-center justify-center group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25 flex-shrink-0">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">APP LIBROS & JUEGOS</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">Módulo Activo</span>
            </div>
            <p className="text-slate-400 text-sm">Biblioteca personal, catálogo de lecturas y registros de videojuegos.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" /> Plataforma
            </button>
          )}
          {canEdit ? (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Añadir Elemento
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/20">
              <ShieldAlert className="w-4 h-4" />
              Modo Solo Lectura
            </div>
          )}
        </div>
      </div>

      {/* Tabs and Stats */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${filter === 'all' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Todos ({items.length})
          </button>
          <button
            onClick={() => setFilter('book')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${filter === 'book' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Libros ({totalBooks})
          </button>
          <button
            onClick={() => setFilter('game')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${filter === 'game' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Gamepad2 className="w-3.5 h-3.5" /> Juegos ({totalGames})
          </button>
        </div>
      </div>

      {/* Library Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {item.media_type === 'book' ? (
                  <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20"><BookOpen className="w-5 h-5" /></span>
                ) : (
                  <span className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20"><Gamepad2 className="w-5 h-5" /></span>
                )}
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{item.title}</h3>
                  <p className="text-xs text-slate-400">{item.genre}</p>
                </div>
              </div>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, idx) => (
                <Star key={idx} className={`w-4 h-4 ${idx < item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
              ))}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Progreso</span>
                <span className="font-semibold text-white">{item.progress_percentage}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${item.media_type === 'book' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-pink-500 to-rose-500'}`}
                  style={{ width: `${item.progress_percentage}%` }}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs text-slate-400 border-t border-slate-800/60">
              <span className="capitalize text-slate-300">
                {item.status === 'completed' ? 'Completado' : item.status === 'in_progress' ? 'En Progreso' : 'Deseados'}
              </span>
              {item.status === 'completed' && <span className="flex items-center gap-1 text-emerald-400"><CheckCircle className="w-3.5 h-3.5" /> Finalizado</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Agregar */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-400" />
              Nuevo Libro o Videojuego
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400">Tipo de Medio</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setMediaType('book')}
                    className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${mediaType === 'book' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    <BookOpen className="w-4 h-4" /> Libro
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('game')}
                    className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${mediaType === 'game' ? 'bg-pink-500/20 border-pink-500 text-pink-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    <Gamepad2 className="w-4 h-4" /> Videojuego
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Título</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. El Señor de los Anillos"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Género</label>
                  <input
                    type="text"
                    required
                    value={genre}
                    onChange={e => setGenre(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Estado</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="in_progress">En Progreso</option>
                    <option value="completed">Completado</option>
                    <option value="wishlist">Deseados</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Valoración (1 a 5 ⭐)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={e => setRating(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Progreso (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={e => setProgress(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-500 text-white font-semibold rounded-xl hover:bg-purple-600"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
