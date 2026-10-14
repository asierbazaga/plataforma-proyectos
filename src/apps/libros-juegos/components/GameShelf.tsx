import React, { useState, useEffect } from 'react';
import { LibraryItem, MediaStatus } from '../../../types';
import { Edit3, Trash2, Bookmark, Gamepad2, Star, Plus, CheckCircle2, Clock } from 'lucide-react';

interface GameShelfProps {
  items: LibraryItem[];
  canEdit: boolean;
  onEdit: (item: LibraryItem) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: MediaStatus) => void;
  onAdd?: () => void;
}

export const GameShelf: React.FC<GameShelfProps> = ({
  items,
  canEdit,
  onEdit,
  onDelete,
  onStatusChange,
  onAdd
}) => {
  const [gamesPerShelf, setGamesPerShelf] = useState(6);
  const [orderedItems, setOrderedItems] = useState<LibraryItem[]>(items);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setGamesPerShelf(3);
      else if (window.innerWidth < 1024) setGamesPerShelf(5);
      else setGamesPerShelf(7);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const shelves: LibraryItem[][] = [];
  for (let i = 0; i < orderedItems.length; i += gamesPerShelf) {
    shelves.push(orderedItems.slice(i, i + gamesPerShelf));
  }

  if (shelves.length === 0) {
    shelves.push([]);
  }

  const getStatusBadge = (status: MediaStatus) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completado',
          icon: CheckCircle2,
          ribbonColor: 'bg-emerald-500 text-white',
          glow: 'shadow-emerald-500/30'
        };
      case 'in_progress':
        return {
          label: 'Jugando',
          icon: Clock,
          ribbonColor: 'bg-cyan-500 text-white',
          glow: 'shadow-cyan-500/30'
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
    let targetIndex = shelfIndex * gamesPerShelf + shelfItemsCount;
    if (targetIndex > newOrdered.length) targetIndex = newOrdered.length;

    if (draggedIndex < targetIndex) targetIndex -= 1;

    const [draggedItem] = newOrdered.splice(draggedIndex, 1);
    newOrdered.splice(targetIndex, 0, draggedItem);

    setOrderedItems(newOrdered);
    setDraggedId(null);
  };

  return (
    <div className="max-w-6xl mx-auto mb-10 px-1 sm:px-0">
      {/* Modern Carbon & Neon Gaming Display */}
      <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-[#080d1a] rounded-3xl border border-cyan-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl overflow-visible relative p-4 sm:p-7">
        
        {/* Ambient Top Glow Cyan/Purple */}
        <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

        {/* Shelf Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 mb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Vitrina Gaming
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                  {orderedItems.length} {orderedItems.length === 1 ? 'juego' : 'juegos'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {canEdit ? 'Estilo caja física. Pasa el ratón para ver detalles o arrastra para ordenar.' : 'Colección de videojuegos en vitrina.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && onAdd && (
              <button
                onClick={onAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white border border-cyan-500/40 text-xs font-semibold transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir juego
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {orderedItems.length === 0 ? (
          <div className="py-14 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20">
              <Gamepad2 className="w-7 h-7 opacity-70" />
            </div>
            <h4 className="text-sm font-bold text-white">Tu vitrina gaming está vacía</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Añade tus videojuegos favoritos o partidas en curso para ver las cajas expuestas.
            </p>
            {canEdit && onAdd && (
              <button
                onClick={onAdd}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-lg shadow-cyan-600/20"
              >
                <Plus className="w-4 h-4" />
                Añadir Primer Juego
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-12 sm:gap-14 pt-4 pb-2">
            {shelves.map((shelf, shelfIdx) => (
              <div
                key={shelfIdx}
                onDragOver={handleDragOver}
                onDrop={(e) => handleShelfDrop(e, shelfIdx)}
                className="relative w-full flex items-end justify-center sm:justify-start gap-3 sm:gap-6 px-4 sm:px-8 min-h-[220px] sm:min-h-[250px] pb-[16px]"
              >
                {/* Modern Dark Metallic / Carbon Plank */}
                <div className="absolute bottom-0 left-2 right-2 h-3.5 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-md shadow-[0_12px_24px_rgba(0,0,0,0.8)] border-t border-slate-600/50 z-10">
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-cyan-400/30" />
                </div>

                {/* Cyberpunk LED Glow */}
                <div className="absolute bottom-[-18px] left-6 right-6 h-8 bg-gradient-to-b from-cyan-500/15 via-purple-500/5 to-transparent blur-md pointer-events-none z-0" />

                {shelf.map((item) => {
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
                      className={`relative group flex-shrink-0 z-20 transition-all duration-300 w-[100px] sm:w-[130px] h-[155px] sm:h-[195px] ${
                        canEdit ? 'cursor-grab active:cursor-grabbing hover:-translate-y-3.5 hover:z-40' : 'hover:-translate-y-2'
                      } ${isDragged ? 'opacity-30 scale-95' : 'opacity-100'}`}
                    >
                      {/* Game Case Box */}
                      <div className="relative w-full h-full rounded-md overflow-hidden shadow-[6px_10px_20px_rgba(0,0,0,0.7)] group-hover:shadow-[0_15px_30px_rgba(6,182,212,0.3)] transition-all border-l-[3px] border-white/20 border-y border-white/10 border-r border-black/40 bg-slate-900">
                        {item.cover_url ? (
                          <img
                            src={item.cover_url}
                            alt={item.title}
                            className="w-full h-full object-cover select-none"
                            draggable={false}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 p-2.5 flex flex-col justify-between text-left">
                            <span className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider line-clamp-1">
                              {item.genre}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-white line-clamp-3 leading-snug">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-400 line-clamp-1">
                              {item.author_creator || 'Estudio'}
                            </span>
                          </div>
                        )}

                        {/* Game Case Plastic Sheen Overlay */}
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-white/30 to-transparent pointer-events-none z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/10 pointer-events-none" />

                        {/* Status Ribbon Indicator on Top Right */}
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

                        {/* Direct Action Buttons on Game Cover */}
                        {canEdit && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-30 pointer-events-none group-hover:pointer-events-auto">
                            <button
                              onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                              title="Editar juego"
                              className="p-2.5 rounded-full bg-slate-900/90 hover:bg-cyan-600 text-white border border-white/25 shadow-xl transition-all hover:scale-110 active:scale-95"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                              title="Eliminar de la colección"
                              className="p-2.5 rounded-full bg-slate-900/90 hover:bg-rose-600 text-white border border-white/25 shadow-xl transition-all hover:scale-110 active:scale-95"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Popover Hover Card with continuous hover bridge */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-3 w-68 sm:w-72 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                        <div className="relative bg-[#0b101e]/95 backdrop-blur-2xl rounded-2xl border border-cyan-500/30 p-3.5 shadow-2xl shadow-cyan-500/20 before:absolute before:-bottom-4 before:inset-x-0 before:h-6 before:content-['']">
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
                              <p className="text-[11px] text-cyan-300 font-medium line-clamp-1">
                                {item.author_creator} {item.year ? `(${item.year})` : ''}
                              </p>
                            )}

                            {/* Quick Status Selection */}
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
                                    title="Marcar como Completado"
                                  >
                                    Hecho
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onStatusChange(item.id, 'in_progress'); }}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-all ${
                                      item.status === 'in_progress'
                                        ? 'bg-cyan-500 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                    title="Marcar como Jugando"
                                  >
                                    Jugando
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

                            {/* Quick Actions */}
                            {canEdit && (
                              <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-800/80">
                                <button
                                  onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white text-[10px] font-semibold transition-colors"
                                >
                                  <Edit3 className="w-3 h-3" /> Editar
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-600 text-rose-300 hover:text-white text-[10px] font-semibold transition-colors"
                                  title="Eliminar de la colección"
                                >
                                  <Trash2 className="w-3 h-3" /> Borrar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Ghost Card to easily add more games */}
                {canEdit && onAdd && shelfIdx === shelves.length - 1 && shelf.length < gamesPerShelf && (
                  <button
                    onClick={onAdd}
                    className="relative flex-shrink-0 w-[100px] sm:w-[130px] h-[155px] sm:h-[195px] rounded-md border-2 border-dashed border-slate-700/60 hover:border-cyan-500/60 bg-slate-900/30 hover:bg-cyan-500/5 transition-all flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-cyan-300 group z-20"
                    title="Añadir juego a esta balda"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-cyan-600/30 flex items-center justify-center transition-all">
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
