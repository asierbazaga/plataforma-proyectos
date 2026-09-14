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
  for (let i = 0; i < items.length; i += booksPerShelf) {
    shelves.push(items.slice(i, i + booksPerShelf));
  }

  if (shelves.length === 0) {
    shelves.push([]); // Empty shelf
  }

  // A helper for status markers
  const getStatusMarker = (status: MediaStatus) => {
    switch (status) {
      case 'in_progress':
        return <Bookmark className="absolute -top-3 left-2 w-7 h-7 text-indigo-500 fill-indigo-500 drop-shadow-md z-10" />;
      case 'wishlist':
        return <Bookmark className="absolute -top-3 left-2 w-7 h-7 text-amber-500 fill-amber-500 drop-shadow-md z-10" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#601920] rounded-t-lg rounded-b-sm border-x-[8px] sm:border-x-[16px] border-t-[8px] sm:border-t-[16px] border-[#3D0C10] shadow-2xl max-w-5xl mx-auto overflow-hidden relative">
      {/* Top Banner inside shelf */}
      <div className="absolute top-2 left-2 sm:left-4 z-10 flex items-center gap-2">
         <span className="text-amber-500/80 font-bold text-xs sm:text-sm bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/5">
           {items.length} libros expuestos
         </span>
      </div>

      <div className="flex flex-col pt-8 sm:pt-12">
        {shelves.map((shelf, idx) => (
          <div 
            key={idx} 
            className="relative w-full min-h-[190px] sm:min-h-[240px] flex items-end justify-center sm:justify-start gap-3 sm:gap-8 px-3 sm:px-8 pb-[14px] sm:pb-[18px] border-b-[14px] sm:border-b-[20px] border-[#3D0C10]"
            style={{ 
              boxShadow: 'inset 0 -15px 30px rgba(0,0,0,0.6), 0 5px 15px rgba(0,0,0,0.7)',
            }}
          >
            {/* Shelf bottom ambient glow */}
            <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-orange-500/10 to-transparent pointer-events-none" />
            
            {shelf.map((item, itemIdx) => {
              // Add some slight random rotation and height variation for realism
              // using the item id as a seed so it's consistent
              const seed = item.id.charCodeAt(0) + item.id.charCodeAt(item.id.length - 1);
              const heightClass = ['h-[135px] sm:h-[170px]', 'h-[145px] sm:h-[185px]', 'h-[155px] sm:h-[195px]', 'h-[165px] sm:h-[205px]'][seed % 4];
              const rotateClass = ['rotate-0', 'rotate-[-1deg]', 'rotate-[1deg]', 'rotate-[2deg]'][seed % 4];
              const widthClass = ['w-[85px] sm:w-[110px]', 'w-[95px] sm:w-[125px]', 'w-[105px] sm:w-[135px]'][seed % 3];

              return (
                <div 
                  key={item.id} 
                  className={`relative group flex-shrink-0 cursor-pointer hover:-translate-y-4 transition-transform duration-300 z-10 ${widthClass} ${heightClass} ${rotateClass}`}
                >
                  {/* Spine effect / cover */}
                  {item.cover_url ? (
                    <img 
                      src={item.cover_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover rounded-r-md rounded-l-sm shadow-[8px_8px_15px_rgba(0,0,0,0.6)] border-l-[3px] border-white/30 border-y border-black/20" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-900 rounded-r-md rounded-l-sm shadow-[8px_8px_15px_rgba(0,0,0,0.6)] border-l-[3px] border-white/20 border-y border-black/20 flex flex-col items-center justify-center p-2 text-center">
                      <span className="text-white font-bold text-xs uppercase tracking-widest" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                        {item.title}
                      </span>
                    </div>
                  )}

                  {/* Glass glare effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                  
                  {getStatusMarker(item.status)}

                  {/* Actions overlay */}
                  {canEdit && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-2 rounded-full bg-black/80 text-white hover:bg-purple-600 transition-colors shadow-xl backdrop-blur-md">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-2 rounded-full bg-black/80 text-white hover:bg-rose-600 transition-colors shadow-xl backdrop-blur-md">
                        <Trash2 className="w-4 h-4" />
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
  );
};
