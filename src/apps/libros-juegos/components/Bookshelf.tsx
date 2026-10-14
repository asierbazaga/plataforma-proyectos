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
    shelves.push([]);
  }

  const getStatusBadge = (status: MediaStatus) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Leído',
          icon: CheckCircle2,
          ribbonColor: 'bg-emerald-500 text-white',
          textColor: 'text-emerald-400'
        };
      case 'in_progress':
        return {
          label: 'Leyendo',
          icon: Clock,
          ribbonColor: 'bg-indigo-500 text-white',
          textColor: 'text-indigo-400'
        };
      case 'wishlist':
        return {
          label: 'Pendiente',
          icon: Bookmark,
          ribbonColor: 'bg-amber-500 text-white',
          textColor: 'text-amber-400'
        };
    }
  };

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
    <div className="max-w-6xl mx-auto mb-12 px-1 sm:px-0">
      {/* Vitrina Flotante de Cristal Templado */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#0f1422]/95 via-[#0a0d18]/95 to-[#060810] border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-5 sm:p-8 overflow-visible">
        
        {/* Glow ambiental superior */}
        <div className="absolute top-0 inset-x-16 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent pointer-events-none" />
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-24 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cabecera de la vitrina */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-6 mb-4 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide flex items-center gap-2">
                  Estantería de Cristal
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold uppercase tracking-wider">
                    Cristal Flotante
                  </span>
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  {orderedItems.length} {orderedItems.length === 1 ? 'libro' : 'libros'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Repisa de vidrio templado translúcido con iluminación LED. Pasa el ratón para ver detalles o arrastra para reordenar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && onAdd && (
              <button
                onClick={onAdd}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/30 text-xs font-bold transition-all shadow-lg shadow-purple-600/25 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir a la balda
              </button>
            )}
          </div>
        </div>

        {/* Estado Vacío */}
        {orderedItems.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/20">
              <BookOpen className="w-7 h-7 opacity-70" />
            </div>
            <h4 className="text-sm font-bold text-white">Tu estantería de cristal está despejada</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Añade tus libros para verlos colocados sobre las baldas de cristal iluminado.
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
          /* Pila de baldas de cristal */
          <div className="flex flex-col gap-16 sm:gap-20 pt-6 pb-6">
            {shelves.map((shelf, shelfIdx) => (
              <div
                key={shelfIdx}
                onDragOver={handleDragOver}
                onDrop={(e) => handleShelfDrop(e, shelfIdx)}
                className="relative w-full flex items-end justify-center sm:justify-start gap-5 sm:gap-9 px-4 sm:px-10 min-h-[250px] sm:min-h-[280px] pb-[28px]"
              >
                {/* 1. Soportes metálicos de pared cromados (extremos) */}
                <div className="absolute bottom-[8px] left-1 sm:left-2 w-3 sm:w-4 h-8 bg-gradient-to-r from-slate-400 via-slate-100 to-slate-400 rounded-sm shadow-md border border-white/50 z-20" />
                <div className="absolute bottom-[8px] right-1 sm:right-2 w-3 sm:w-4 h-8 bg-gradient-to-r from-slate-400 via-slate-100 to-slate-400 rounded-sm shadow-md border border-white/50 z-20" />

                {/* 2. LED Glow Strip ambiental detrás del cristal (tira púrpura/cian de neón) */}
                <div className="absolute bottom-[24px] left-6 right-6 h-12 bg-gradient-to-t from-purple-500/30 via-cyan-400/10 to-transparent blur-md pointer-events-none z-0" />

                {/* 3. REPISA DE CRISTAL FLOTANTE (3D Glass Slab) */}
                <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
                  {/* Superficie superior de cristal translúcido (donde apoyan los libros) */}
                  <div className="h-5 bg-gradient-to-b from-white/25 via-white/10 to-white/5 backdrop-blur-md border-t border-x border-white/40 rounded-t-sm shadow-[inset_0_1px_3px_rgba(255,255,255,0.7)]" />
                  
                  {/* Canto frontal biselado de cristal templado grueso con refracción */}
                  <div className="h-4 bg-gradient-to-r from-cyan-200/25 via-white/35 to-cyan-200/25 backdrop-blur-xl border-b border-white/40 shadow-[0_15px_35px_rgba(0,0,0,0.9)] relative">
                    {/* Brillo especular nítido sobre el borde de cristal */}
                    <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90 shadow-[0_0_8px_rgba(255,255,255,1)]" />
                    <div className="absolute bottom-0 inset-x-0 h-[1px] bg-cyan-300/30" />
                  </div>

                  {/* Sombra de contacto suave proyectada en la pared bajo el cristal */}
                  <div className="h-6 bg-gradient-to-b from-black/80 to-transparent blur-sm" />
                </div>

                {/* 4. Libros situados sobre el cristal */}
                {shelf.map((item) => {
                  const seed = item.id.charCodeAt(0) + item.id.charCodeAt(item.id.length - 1);
                  const heightClass = ['h-[180px] sm:h-[220px]', 'h-[190px] sm:h-[235px]', 'h-[200px] sm:h-[245px]', 'h-[185px] sm:h-[225px]'][seed % 4];
                  const widthClass = ['w-[120px] sm:w-[150px]', 'w-[125px] sm:w-[155px]', 'w-[130px] sm:w-[160px]'][seed % 3];
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
                      className={`relative group flex-shrink-0 z-20 transition-all duration-300 ${
                        canEdit ? 'cursor-grab active:cursor-grabbing hover:-translate-y-4 hover:z-40' : 'hover:-translate-y-2'
                      } ${widthClass} ${heightClass} ${isDragged ? 'opacity-30 scale-95' : 'opacity-100'}`}
                    >
                      {/* Sombra de contacto del libro sobre el cristal */}
                      <div className="absolute -bottom-1 left-2 right-2 h-2.5 bg-black/90 rounded-full blur-[2px] z-10" />

                      {/* Reflejo invertido sobre el cristal brillante */}
                      {item.cover_url && (
                        <div className="absolute -bottom-7 left-1 right-1 h-7 overflow-hidden opacity-25 scale-y-[-1] pointer-events-none blur-[0.5px] rounded-b-sm z-0">
                          <img src={item.cover_url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
                        </div>
                      )}

                      {/* OBJETO 3D DEL LIBRO */}
                      <div className="relative w-full h-full rounded-r-lg rounded-l-sm overflow-hidden shadow-[8px_12px_24px_rgba(0,0,0,0.85)] group-hover:shadow-[0_20px_40px_rgba(168,85,247,0.4)] transition-all border-l-[5px] border-white/35 border-y border-white/10 border-r border-black/40 bg-slate-900">
                        {item.cover_url ? (
                          <img
                            src={item.cover_url}
                            alt={item.title}
                            className="w-full h-full object-cover select-none"
                            draggable={false}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-3.5 flex flex-col justify-between text-left border-l-2 border-indigo-400/40">
                            <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider line-clamp-1">
                              {item.genre}
                            </span>
                            <span className="text-xs sm:text-sm font-extrabold text-white line-clamp-3 leading-snug">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-slate-400 line-clamp-1 font-medium">
                              {item.author_creator || 'Autor'}
                            </span>
                          </div>
                        )}

                        {/* Iluminación de lomo y textura de encuadernación */}
                        <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/60 via-white/15 to-transparent pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-white/10 pointer-events-none" />

                        {/* Cinta de estado en la esquina superior derecha */}
                        <div
                          title={statusInfo.label}
                          className={`absolute top-0 right-2 px-2 py-0.5 rounded-b-md text-[9px] font-extrabold shadow-lg flex items-center gap-1 ${statusInfo.ribbonColor} z-20`}
                        >
                          <StatusIcon className="w-2.5 h-2.5" />
                          <span>{statusInfo.label}</span>
                        </div>

                        {/* Chip de puntuación dorada sobre la carátula */}
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded-lg border border-amber-400/40 text-amber-300 text-[11px] font-extrabold shadow-lg">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{item.rating}/10</span>
                        </div>
                      </div>

                      {/* Tarjeta flotante interactiva (Popover con cristal translúcido) */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 w-72 bg-[#0d1322]/95 backdrop-blur-2xl rounded-2xl border border-white/20 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50 transform group-hover:translate-y-0 translate-y-1">
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-white leading-tight line-clamp-2">
                              {item.title}
                            </h4>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 flex-shrink-0">
                              <Star className="w-2.5 h-2.5 fill-amber-400" />
                              {item.rating}/10
                            </span>
                          </div>

                          {item.author_creator && (
                            <p className="text-[11px] text-purple-300 font-medium line-clamp-1">
                              {item.author_creator} {item.year ? `(${item.year})` : ''}
                            </p>
                          )}

                          {item.user_review && (
                            <p className="text-[10px] text-slate-300 italic line-clamp-2 bg-slate-800/60 p-2 rounded-lg border border-white/5">
                              "{item.user_review}"
                            </p>
                          )}

                          {/* Selector rápido de estado */}
                          <div className="pt-2 flex items-center justify-between border-t border-white/10 text-[11px]">
                            <span className="text-slate-400">Estado:</span>
                            {canEdit && onStatusChange ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); onStatusChange(item.id, 'completed'); }}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                                    item.status === 'completed'
                                      ? 'bg-emerald-500 text-white shadow-sm'
                                      : 'bg-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                  title="Marcar como Leído"
                                >
                                  Leído
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); onStatusChange(item.id, 'in_progress'); }}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                                    item.status === 'in_progress'
                                      ? 'bg-indigo-500 text-white shadow-sm'
                                      : 'bg-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                  title="Marcar como Leyendo"
                                >
                                  Leyendo
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); onStatusChange(item.id, 'wishlist'); }}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                                    item.status === 'wishlist'
                                      ? 'bg-amber-500 text-white shadow-sm'
                                      : 'bg-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                  title="Marcar como Pendiente"
                                >
                                  Pendiente
                                </button>
                              </div>
                            ) : (
                              <span className={`px-2 py-0.5 rounded font-bold ${statusInfo.textColor}`}>
                                {statusInfo.label}
                              </span>
                            )}
                          </div>

                          {/* Acciones Editar/Eliminar */}
                          {canEdit && (
                            <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-white/10">
                              <button
                                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white text-[10px] font-semibold transition-colors"
                              >
                                <Edit3 className="w-3 h-3" /> Editar
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
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

                {/* Hueco punteado para añadir más libros */}
                {canEdit && onAdd && shelfIdx === shelves.length - 1 && shelf.length < booksPerShelf && (
                  <button
                    onClick={onAdd}
                    className="relative flex-shrink-0 w-[115px] sm:w-[145px] h-[175px] sm:h-[215px] rounded-r-lg rounded-l-sm border-2 border-dashed border-white/20 hover:border-purple-400/60 bg-white/5 hover:bg-purple-500/10 transition-all flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-purple-300 group z-20 backdrop-blur-sm"
                    title="Añadir libro a esta balda de cristal"
                  >
                    <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-purple-600/40 flex items-center justify-center transition-all border border-white/20">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[11px] font-bold">Añadir a la balda</span>
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
