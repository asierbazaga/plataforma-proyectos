import React, { useState, useEffect } from 'react';
import { LibraryItem, MediaStatus } from '../../../types';
import { Edit3, Trash2, Bookmark } from 'lucide-react';

interface BookshelfProps {
  items: LibraryItem[];
  canEdit: boolean;
  onEdit: (item: LibraryItem) => void;
  onDelete: (id: string) => void;
}

export const Bookshelf: React.FC<BookshelfProps> = ({ items, canEdit, onEdit, onDelete }) => {
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
      else setBooksPerShelf(5);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const shelves = [];
  for (let i = 0; i < orderedItems.length; i += booksPerShelf) {
    shelves.push(orderedItems.slice(i, i + booksPerShelf));
  }

  if (shelves.length === 0) {
    shelves.push([]); // Empty shelf
  }

  const getStatusMarker = (status: MediaStatus) => {
    switch (status) {
      case 'in_progress':
        return <Bookmark className="absolute -top-3 left-2 w-7 h-7 text-indigo-500 fill-indigo-500 drop-shadow-md z-30" />;
      case 'wishlist':
        return <Bookmark className="absolute -top-3 left-2 w-7 h-7 text-amber-500 fill-amber-500 drop-shadow-md z-30" />;
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
    e.preventDefault(); // Necessary to allow dropping
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
    <div className="max-w-5xl mx-auto mb-12 mt-4 px-2 sm:px-0">
      {/* Outer wood frame */}
      <div className="bg-[#411218] p-2 sm:p-4 rounded-t-2xl rounded-b-lg shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative border-x-4 border-b-[24px] border-[#290a0e]">
        
        {/* Top Cornice (Moldura superior) */}
        <div className="absolute top-0 left-[-4px] right-[-4px] h-4 sm:h-6 bg-gradient-to-b from-[#6e2229] to-[#3b0f14] rounded-t-xl shadow-lg border-b border-[#24090c] z-30" />
        
        {/* Inner backdrop (the dark wall behind the shelves) */}
        <div className="bg-[#1a0507] rounded-md shadow-[inset_0_20px_50px_rgba(0,0,0,1)] relative mt-2 sm:mt-4 border-x-[12px] sm:border-x-[24px] border-t-[12px] sm:border-t-[24px] border-[#340e13]">
          
          <div className="absolute top-2 left-2 sm:left-4 z-40 flex items-center gap-2">
            <span className="text-amber-500/90 font-bold text-xs sm:text-sm bg-black/70 px-3 py-1 rounded-md backdrop-blur-md border border-white/10 shadow-lg">
              {orderedItems.length} libros expuestos
            </span>
          </div>

          <div className="flex flex-col pt-10 sm:pt-16">
            {shelves.map((shelf, idx) => (
              <div 
                key={idx}
                onDragOver={handleDragOver}
                onDrop={(e) => handleShelfDrop(e, idx)} 
                className="relative w-full min-h-[190px] sm:min-h-[250px] flex items-end justify-center sm:justify-start gap-2 sm:gap-6 px-4 sm:px-8 pb-[16px] sm:pb-[20px]"
              >
                {/* The actual horizontal wood plank */}
                <div className="absolute bottom-0 left-0 right-0 h-[16px] sm:h-[20px] bg-gradient-to-b from-[#5c1a21] to-[#290a0e] shadow-[0_10px_20px_rgba(0,0,0,0.9)] border-t border-[#802a33]/40 z-20" />
                
                {/* Under-shelf shadow drop */}
                <div className="absolute bottom-[-30px] left-0 right-0 h-[30px] bg-gradient-to-b from-black/90 to-transparent z-10 pointer-events-none" />
                
                {/* Warm LED back-glow effect */}
                <div className="absolute bottom-[16px] sm:bottom-[20px] left-0 right-0 h-16 sm:h-28 bg-gradient-to-t from-orange-500/15 via-orange-500/5 to-transparent pointer-events-none z-10" />
                
                {shelf.map((item) => {
                  const seed = item.id.charCodeAt(0) + item.id.charCodeAt(item.id.length - 1);
                  const heightClass = ['h-[135px] sm:h-[180px]', 'h-[145px] sm:h-[195px]', 'h-[155px] sm:h-[205px]', 'h-[165px] sm:h-[215px]'][seed % 4];
                  const rotateClass = ['rotate-0', 'rotate-[-2deg]', 'rotate-[1deg]', 'rotate-[3deg]', 'rotate-[-1deg]'][seed % 5];
                  const widthClass = ['w-[85px] sm:w-[120px]', 'w-[95px] sm:w-[130px]', 'w-[100px] sm:w-[140px]'][seed % 3];
                  
                  const isDragged = draggedId === item.id;

                  return (
                    <div 
                      key={item.id}
                      draggable={canEdit}
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, item.id)}
                      className={`relative group flex-shrink-0 z-30 transition-all duration-300 ${
                        canEdit ? 'cursor-grab active:cursor-grabbing hover:-translate-y-6 hover:z-40' : ''
                      } ${widthClass} ${heightClass} ${rotateClass} ${isDragged ? 'opacity-40 scale-95' : 'opacity-100'}`}
                    >
                      {item.cover_url ? (
                        <img 
                          src={item.cover_url} 
                          alt={item.title} 
                          className="w-full h-full object-cover rounded-r-md rounded-l-sm shadow-[10px_10px_20px_rgba(0,0,0,0.8)] border-l-[4px] border-white/20 border-y border-black/30 bg-[#290a0e]" 
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-900 rounded-r-md rounded-l-sm shadow-[10px_10px_20px_rgba(0,0,0,0.8)] border-l-[4px] border-white/20 border-y border-black/30 flex flex-col items-center justify-center p-2 text-center">
                          <span className="text-white font-bold text-xs sm:text-sm uppercase tracking-widest" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                            {item.title}
                          </span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-black/20 pointer-events-none rounded-r-md" />
                      
                      {getStatusMarker(item.status)}

                      {canEdit && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none group-hover:pointer-events-auto">
                          <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-2 sm:p-2.5 rounded-full bg-black/90 text-white hover:bg-purple-600 transition-colors shadow-xl backdrop-blur-md">
                            <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-2 sm:p-2.5 rounded-full bg-black/90 text-white hover:bg-rose-600 transition-colors shadow-xl backdrop-blur-md">
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
