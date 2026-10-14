import React, { useState, useEffect } from 'react';
import { LibraryItem, MediaStatus } from '../../../types';
import { Edit3, Trash2, Bookmark, Star, BookOpen, Plus, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface BookshelfProps {
  items: LibraryItem[];
  canEdit: boolean;
  onEdit: (item: LibraryItem) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: MediaStatus) => void;
  onAdd?: () => void;
}

export const Bookshelf: React.FC<BookshelfProps> = ({
  items,
  canEdit,
  onEdit,
  onDelete,
  onStatusChange,
  onAdd
}) => {
  const [booksPerShelf, setBooksPerShelf] = useState(5);
  const [orderedItems, setOrderedItems] = useState<LibraryItem[]>(items);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<LibraryItem | null>(null);

  // Sync when parent filters/sorts change
  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setBooksPerShelf(3);
      else if (window.innerWidth < 1024) setBooksPerShelf(4);
      else setBooksPerShelf(6);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const shelves: LibraryItem[][] = [];
  for (let i = 0; i < orderedItems.length; i += booksPerShelf) {
    shelves.push(orderedItems.slice(i, i + booksPerShelf));
  }

  if (shelves.length === 0) {
    shelves.push([]); // Empty shelf placeholder
  }

  const getStatusBadge = (status: MediaStatus) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Leído',
          icon: CheckCircle2,
          ribbonColor: 'bg-emerald-500 text-white',
          glow: 'shadow-emerald-500/30'
        };
      case 'in_progress':
        return {
          label: 'Leyendo',
          icon: Clock,
          ribbonColor: 'bg-indigo-500 text-white',
          glow: 'shadow-indigo-500/30'
        };
      case 'wishlist':
        return {
          label: 'Pendiente',
          icon: Bookmark,
          ribbonColor: 'bg-amber-500 text-white',
          glow: 'shadow-amber-500/30'
        };
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!canEdit) return;
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!canEdit) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (!canEdit) return;
    e.preventDefault();
    e.stopPropagation();
    if (!draggedId || draggedId === targetId) return;

    const newOrdered = [...orderedItems];
    const draggedIndex = newOrdered.findIndex(i => i.id === draggedId);
    const targetIndex = newOrdered.findIndex(i => i.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [draggedItem] = newOrdered.splice(draggedIndex, 1);
    newOrdered.splice(targetIndex, 0, draggedItem);

    setOrderedItems(newOrdered);
    setDraggedId(null);
  };

  const handleShelfDrop = (e: React.DragEvent, shelfIndex: number) => {
    if (!canEdit) return;
    e.preventDefault();
    if (!draggedId) return;

    const newOrdered = [...orderedItems];
    const draggedIndex = newOrdered.findIndex(i => i.id === draggedId);
    if (draggedIndex === -1) return;

    const shelfItemsCount = shelves[shelfIndex].length;
    let targetIndex = shelfIndex * booksPerShelf + shelfItemsCount;
    if (targetIndex > newOrdered.length) targetIndex = newOrdered.length;

    if (draggedIndex < targetIndex) targetIndex -= 1;

    const [draggedItem] = newOrdered.splice(draggedIndex, 1);
    newOrdered.splice(targetIndex, 0, draggedItem);

    setOrderedItems(newOrdered);
    setDraggedId(null);
  };

  return (
    <div className="max-w-6xl mx-auto mb-10 px-1 sm:px-0">
      {/* Modern Glass Showcase Frame */}
      <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-[#0b0f19] rounded-3xl border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl overflow-visible relative p-4 sm:p-7">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent pointer-events-none" />

        {/* Shelf Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 mb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Estantería de Lectura
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  {orderedItems.length} {orderedItems.length === 1 ? 'libro' : 'libros'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {canEdit ? 'Pasa el ratón para ver detalles o arrastra para reorganizar tu vitrina.' : 'Colección literaria en vista vitrina.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && onAdd && (
              <button
                onClick={onAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 text-xs font-semibold transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir libro
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {orderedItems.length === 0 ? (
          <div className="py-14 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/20">
              <BookOpen className="w-7 h-7 opacity-70" />
            </div>
            <h4 className="text-sm font-bold text-white">Tu estantería está despejada</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Añade tus libros leídos o en curso para verlos colocados en esta vitrina moderna.
            </p>
            {canEdit && onAdd && (
              <button
                onClick={onAdd}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/20"
              >
                <Plus className="w-4 h-4" />
                Añadir Primer Libro
              </button>
            )}
          </div>
        ) : (
          /* Shelves stack */
          <div className="flex flex-col gap-12 sm:gap-14 pt-4 pb-2">
            {shelves.map((shelf, shelfIdx) => (
              <div
                key={shelfIdx}
                onDragOver={handleDragOver}
                onDrop={(e) => handleShelfDrop(e, shelfIdx)}
                className="relative w-full flex items-end justify-center sm:justify-start gap-4 sm:gap-8 px-4 sm:px-8 min-h-[220px] sm:min-h-[250px] pb-[16px]"
              >
                {/* Modern Floating Acrylic Shelf Ledge */}
                <div className="absolute bottom-0 left-2 right-2 h-3.5 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-md shadow-[0_12px_24px_rgba(0,0,0,0.8)] border-t border-white/20 z-10">
                  {/* Subtle top edge light line */}
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />
                </div>

                {/* Soft ambient LED underglow under shelf */}
                <div className="absolute bottom-[-18px] left-6 right-6 h-8 bg-gradient-to-b from-purple-500/15 via-indigo-500/5 to-transparent blur-md pointer-events-none z-0" />

                {/* Book Items */}
                {shelf.map((item) => {
                  const seed = item.id.charCodeAt(0) + item.id.charCodeAt(item.id.length - 1);
                  const heightClass = ['h-[160px] sm:h-[200px]', 'h-[170px] sm:h-[210px]', 'h-[180px] sm:h-[220px]', 'h-[165px] sm:h-[205px]'][seed % 4];
                  const widthClass = ['w-[105px] sm:w-[130px]', 'w-[115px] sm:w-[140px]', 'w-[110px] sm:w-[135px]'][seed % 3];
                  const isDragged = draggedId === item.id;
                  const statusInfo = getStatusBadge(item.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={item.id}
                      draggable={canEdit}
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, item.id)}
                      onMouseEnter={() => setHoveredItem(item)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`relative group flex-shrink-0 z-20 transition-all duration-300 ${
                        canEdit ? 'cursor-grab active:cursor-grabbing hover:-translate-y-3.5 hover:z-40' : 'hover:-translate-y-2'
                      } ${widthClass} ${heightClass} ${isDragged ? 'opacity-30 scale-95' : 'opacity-100'}`}
                    >
                      {/* 3D Book Object */}
                      <div className="relative w-full h-full rounded-r-md rounded-l-sm overflow-hidden shadow-[6px_10px_20px_rgba(0,0,0,0.7)] group-hover:shadow-[0_15px_30px_rgba(168,85,247,0.3)] transition-all border-l-[4px] border-white/30 border-y border-black/40 bg-slate-900">
                        {item.cover_url ? (
                          <img
                            src={item.cover_url}
                            alt={item.title}
                            className="w-full h-full object-cover select-none"
                            draggable={false}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-3 flex flex-col justify-between text-left border-l-2 border-indigo-400/40">
                            <span className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider line-clamp-1">
                              {item.genre}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-white line-clamp-3 leading-snug">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-400 line-clamp-1">
                              {item.author_creator || 'Autor'}
                            </span>
                          </div>
                        )}

                        {/* Spine lighting & book page edges highlight */}
                        <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 via-white/10 to-transparent pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/5 pointer-events-none" />

                        {/* Status Ribbon Indicator on Top Left */}
                        <div
                          title={statusInfo.label}
                          className={`absolute top-0 right-2 px-1.5 py-0.5 rounded-b-md text-[9px] font-extrabold shadow-md flex items-center gap-1 ${statusInfo.ribbonColor} z-20`}
                        >
                          <StatusIcon className="w-2.5 h-2.5" />
                        </div>

                        {/* Rating chip on cover bottom */}
                        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-amber-400/30 text-amber-300 text-[10px] font-bold">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span>{item.rating}</span>
                        </div>
                      </div>

                      {/* Rich Popover Hover Card */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-3.5 shadow-2xl shadow-purple-500/20 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50 transform group-hover:translate-y-0 translate-y-1">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-white leading-tight line-clamp-2">
                              {item.title}
                            </h4>
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 flex-shrink-0">
                              <Star className="w-2.5 h-2.5 fill-amber-400" />
                              {item.rating}/10
                            </span>
                          </div>

                          {item.author_creator && (
                            <p className="text-[11px] text-purple-300 font-medium line-clamp-1">
                              {item.author_creator} {item.year ? `(${item.year})` : ''}
                            </p>
                          )}

                          {/* Status selector / indicator */}
                          <div className="pt-1 flex items-center justify-between border-t border-slate-800 text-[10px]">
                            <span className="text-slate-400">Estado:</span>
                            {canEdit && onStatusChange ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); onStatusChange(item.id, 'completed'); }}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-all ${
                                    item.status === 'completed'
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                  title="Marcar como Leído"
                                >
                                  Leído
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); onStatusChange(item.id, 'in_progress'); }}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-all ${
                                    item.status === 'in_progress'
                                      ? 'bg-indigo-500 text-white'
                                      : 'bg-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                  title="Marcar como Leyendo"
                                >
                                  Leyendo
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); onStatusChange(item.id, 'wishlist'); }}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-all ${
                                    item.status === 'wishlist'
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                  title="Marcar como Pendiente"
                                >
                                  Pendiente
                                </button>
                              </div>
                            ) : (
                              <span className={`px-2 py-0.5 rounded font-bold ${statusInfo.ribbonColor}`}>
                                {statusInfo.label}
                              </span>
                            )}
                          </div>

                          {/* Quick Actions (Edit/Delete) */}
                          {canEdit && (
                            <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-800/80">
                              <button
                                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white text-[10px] font-semibold transition-colors"
                              >
                                <Edit3 className="w-3 h-3" /> Editar
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
                                title="Eliminar de la colección"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Optional Ghost Card to easily add more books */}
                {canEdit && onAdd && shelfIdx === shelves.length - 1 && shelf.length < booksPerShelf && (
                  <button
                    onClick={onAdd}
                    className="relative flex-shrink-0 w-[100px] sm:w-[125px] h-[155px] sm:h-[195px] rounded-r-md rounded-l-sm border-2 border-dashed border-slate-700/60 hover:border-purple-500/60 bg-slate-900/30 hover:bg-purple-500/5 transition-all flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-purple-300 group z-20"
                    title="Añadir libro a esta balda"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-purple-600/30 flex items-center justify-center transition-all">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold">Añadir</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
