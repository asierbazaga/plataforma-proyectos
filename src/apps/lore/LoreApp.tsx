import React, { useState, useEffect } from 'react';
import { BookMarked, Search, Plus, Tag, Folder, ShieldAlert, FileText, Calendar } from 'lucide-react';
import { LoreEntry } from '../../types';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';

export const LoreApp: React.FC = () => {
  const { canEditApp } = useAuth();
  const canEdit = canEditApp('lore');
  const [entries, setEntries] = useState<LoreEntry[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LoreEntry | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Procedimientos');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const loadData = async () => {
    const list = await storageService.getLoreEntries();
    setEntries(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    await storageService.addLoreEntry({
      title,
      category,
      content,
      tags
    });

    setTitle('');
    setContent('');
    setTagsInput('');
    setShowModal(false);
    await loadData();
  };

  const categories = Array.from(new Set(entries.map(e => e.category)));

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                          e.content.toLowerCase().includes(search.toLowerCase()) ||
                          e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-transparent p-6 rounded-2xl border border-blue-500/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <BookMarked className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              APP LORE & CONOCIMIENTO
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Módulo Activo</span>
            </h1>
            <p className="text-slate-400 text-sm">Directorio de documentación, guías técnicas y artículos de conocimiento.</p>
          </div>
        </div>

        {canEdit ? (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Nueva Entrada Lore
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/20">
            <ShieldAlert className="w-4 h-4" />
            Modo Solo Lectura
          </div>
        )}
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por título, contenido o etiqueta (#tags)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
          >
            Todas las Categorías
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Entries List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEntries.map(entry => (
          <div
            key={entry.id}
            onClick={() => setSelectedEntry(entry)}
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                {entry.category}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {entry.updated_at.split('T')[0]}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
              {entry.title}
            </h3>

            <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
              {entry.content}
            </p>

            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
                {entry.tags.map(tag => (
                  <span key={tag} className="text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                    <Tag className="w-3 h-3 text-cyan-400" /> #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Detalle Entrada */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                  {selectedEntry.category}
                </span>
                <h2 className="text-2xl font-bold text-white mt-2">{selectedEntry.title}</h2>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-slate-400 hover:text-white text-sm bg-slate-800 px-3 py-1.5 rounded-lg"
              >
                Cerrar
              </button>
            </div>

            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap py-2">
              {selectedEntry.content}
            </div>

            {selectedEntry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800">
                {selectedEntry.tags.map(t => (
                  <span key={t} className="text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Nueva Entrada */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              Nueva Entrada de Lore
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400">Título del Artículo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Procedimiento de Seguridad"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Categoría</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Procedimientos, Arquitectura, Clientes"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Contenido</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Escribe la información o procedimiento detallado..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Etiquetas (separadas por coma)</label>
                <input
                  type="text"
                  placeholder="ej. vercel, supabase, deploy"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
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
                  className="px-5 py-2 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600"
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
