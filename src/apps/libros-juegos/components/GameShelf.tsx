import React, { useState, useEffect } from 'react';
import { LibraryItem, MediaStatus } from '../../../types';
import { Edit3, Trash2, Bookmark, Gamepad2 } from 'lucide-react';

interface GameShelfProps {
  items: LibraryItem[];
  canEdit: boolean;
  onEdit: (item: LibraryItem) => void;
  onDelete: (id: string) => void;
}

export const GameShelf: React.FC<GameShelfProps> = ({ items, canEdit, onEdit, onDelete }) => {
  const [gamesPerShelf, setGamesPerShelf] = useState(6);
  const [orderedItems, setOrderedItems] = useState<LibraryItem[]>(items);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Sync when parent filters/sorts change
  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setGamesPerShelf(3);
      else if (window.innerWidth < 1024) setGamesPerShelf(5);
      else setGamesPerShelf(7); // Game cases are generally thinner than randomized books
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const shelves = [];
  for (let i = 0; i < orderedItems.length; i += gamesPerShelf) {
    shelves.push(orderedItems.slice(i, i + gamesPerShelf));
  }

  if (shelves.length === 0) {
    shelves.push([]); // Empty shelf
  }

  const getStatusMarker = (status: MediaStatus) => {
    switch (status) {
      case 'in_progress':
        return <Bookmark className="absolute -top-3 right-2 w-7 h-7 text-cyan-500 fill-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] z-30" />;
      case 'wishlist':
        return <Bookmark className="absolute -top-3 right-2 w-7 h-7 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] z-30" />;
      default:
        return null;
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
    let targetIndex = shelfIndex * gamesPerShelf + shelfItemsCount;
    if (targetIndex > newOrdered.length) targetIndex = newOrdered.length;

    if (draggedIndex < targetIndex) targetIndex -= 1;

    const [draggedItem] = newOrdered.splice(draggedIndex, 1);
    newOrdered.splice(targetIndex, 0, draggedItem);

    setOrderedItems(newOrdered);
    setDraggedId(null);
  };

  return (
    <div className="max-w-5xl mx-auto mb-12 mt-4 px-2 sm:px-0">
      {/* Outer sleek dark frame */}
      <div className="bg-slate-900 p-2 sm:p-4 rounded-t-xl rounded-b-lg shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative border-x-4 border-b-[24px] border-slate-950">
        
        {/* Top Metallic Cornice with RGB trim */}
        <div className="absolute top-0 left-[-4px] right-[-4px] h-4 sm:h-5 bg-gradient-to-b from-slate-700 to-slate-900 rounded-t-xl shadow-lg border-b border-slate-950 z-30">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 opacity-70" />
        </div>
        
        {/* Inner backdrop (dark carbon/metallic wall) */}
        <div className="bg-[#0b0f19] rounded-md shadow-[inset_0_20px_50px_rgba(0,0,0,1)] relative mt-2 sm:mt-3 border-x-[12px] sm:border-x-[20px] border-t-[12px] sm:border-t-[20px] border-slate-950">
          
          <div className="absolute top-2 left-2 sm:left-4 z-40 flex items-center gap-2">
            <span className="text-cyan-400 font-bold text-xs sm:text-sm bg-black/80 px-3 py-1 rounded-md backdrop-blur-md border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)] flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              {orderedItems.length} juegos en colección
            </span>
          </div>

          <div className="flex flex-col pt-12 sm:pt-16">
            {shelves.map((shelf, idx) => (
              <div 
                key={idx}
                onDragOver={handleDragOver}
                onDrop={(e) => handleShelfDrop(e, idx)} 
                className="relative w-full min-h-[190px] sm:min-h-[240px] flex items-end justify-center sm:justify-start gap-2 sm:gap-4 px-4 sm:px-8 pb-[14px] sm:pb-[18px]"
              >
                {/* The horizontal dark metal plank */}
                <div className="absolute bottom-0 left-0 right-0 h-[14px] sm:h-[18px] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 shadow-[0_10px_20px_rgba(0,0,0,0.9)] border-t border-slate-600/50 z-20">
                  {/* Front LED strip */}
                  <div className="absolute top-[2px] left-0 right-0 h-[1px] bg-cyan-400/30 shadow-[0_0_5px_rgba(6,182,212,0.5)]" />
                </div>
                
                {/* Under-shelf shadow drop */}
                <div className="absolute bottom-[-30px] left-0 right-0 h-[30px] bg-gradient-to-b from-black/90 to-transparent z-10 pointer-events-none" />
                
                {/* RGB LED back-glow effect (cyan/purple mix) */}
                <div className="absolute bottom-[14px] sm:bottom-[18px] left-0 right-0 h-20 sm:h-32 bg-gradient-to-t from-cyan-500/20 via-purple-500/5 to-transparent pointer-events-none z-10" />
                
                {shelf.map((item) => {
                  const seed = item.id.charCodeAt(0) + item.id.charCodeAt(item.id.length - 1);
                  // Game cases are generally uniform. Small variations in rotation for realism.
                  const heightClass = 'h-[140px] sm:h-[190px]';
                  const widthClass = 'w-[100px] sm:w-[135px]'; // Standard game case ratio (approx 1:1.4)
                  const rotateClass = ['rotate-0', 'rotate-[-1deg]', 'rotate-[1deg]', 'rotate-0', 'rotate-[0.5deg]'][seed % 5];
                  
                  const isDragged = draggedId === item.id;

                  return (
                    <div 
                      key={item.id}
                      draggable={canEdit}
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, item.id)}
                      className={`relative group flex-shrink-0 z-30 transition-all duration-300 ${
                        canEdit ? 'cursor-grab active:cursor-grabbing hover:-translate-y-4 hover:z-40' : ''
                      } ${widthClass} ${heightClass} ${rotateClass} ${isDragged ? 'opacity-40 scale-95' : 'opacity-100'}`}
                    >
                      {item.cover_url ? (
                        <div className="relative w-full h-full rounded-md shadow-[10px_10px_20px_rgba(0,0,0,0.7)] border-l-[3px] border-white/20 border-y border-white/10 border-r border-black/40 overflow-hidden bg-slate-900 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
                          {/* Case plastic rim simulation */}
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-white/30 to-transparent z-10" />
                          <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-blue-600/40 to-transparent z-10 mix-blend-overlay" /> {/* PS5/Blu-ray style top header hint */}
                          
                          <img 
                            src={item.cover_url} 
                            alt={item.title} 
                            className="w-full h-full object-cover relative z-0" 
                            draggable={false}
                          />
                        </div>
                      ) : (
                        <div className="relative w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 rounded-md shadow-[10px_10px_20px_rgba(0,0,0,0.7)] border-l-[3px] border-white/20 border-y border-white/10 border-r border-black/40 flex flex-col items-center justify-center p-3 text-center group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
                           <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-slate-600 to-transparent z-10" />
                          <Gamepad2 className="w-6 h-6 text-slate-600 mb-2" />
                          <span className="text-white font-bold text-xs leading-tight line-clamp-3">
                            {item.title}
                          </span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-black/30 pointer-events-none rounded-md" />
                      
                      {getStatusMarker(item.status)}

                      {canEdit && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none group-hover:pointer-events-auto">
                          <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-2 sm:p-2.5 rounded-xl bg-black/90 text-white hover:bg-cyan-500 transition-colors shadow-xl backdrop-blur-md">
                            <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-2 sm:p-2.5 rounded-xl bg-black/90 text-white hover:bg-rose-600 transition-colors shadow-xl backdrop-blur-md">
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
