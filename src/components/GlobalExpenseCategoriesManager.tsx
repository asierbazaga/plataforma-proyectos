import React, { useState, useEffect } from 'react';
import { ExpenseCategory } from '../types';
import { storageService } from '../services/storageService';
import { useToast } from '../context/ToastContext';
import { Tag, Plus, Trash2, Edit2, X } from 'lucide-react';

export const GlobalExpenseCategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const toast = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('??');
  const [newColor, setNewColor] = useState('#64748B');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editColor, setEditColor] = useState('');

  const loadCategories = async () => {
    const list = await storageService.getGlobalExpenseCategories();
    setCategories(list);
  };

  useEffect(() => {
    loadCategories();
    const unsubscribe = storageService.onSync(() => loadCategories());
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await storageService.addGlobalExpenseCategory({
        name: newName.trim(),
        icon: newIcon,
        color: newColor
      });
      setIsAdding(false);
      setNewName('');
      setNewIcon('??');
      setNewColor('#64748B');
      toast.success('Categoría creada');
      await loadCategories();
    } catch (e: any) {
      toast.error('Error al crear categoría');
    }
  };

  const handleUpdate = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    try {
      await storageService.updateGlobalExpenseCategory(id, {
        name: editName.trim(),
        icon: editIcon,
        color: editColor
      });
      setEditingId(null);
      toast.success('Categoría actualizada');
      await loadCategories();
    } catch (e: any) {
      toast.error('Error al actualizar categoría');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría? Si hay gastos asociados, aparecerán sin categoría.')) {
      try {
        await storageService.deleteGlobalExpenseCategory(id);
        toast.success('Categoría eliminada');
        await loadCategories();
      } catch (e: any) {
        toast.error('Error al eliminar categoría');
      }
    }
  };

  return (
    <div className="bg-[#111622] rounded-3xl p-6 border border-white/5 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <Tag className="w-5 h-5 text-emerald-400" />
          Categorías Globales (Gastos & Finanzas)
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl transition-all border border-emerald-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          Nueva
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-end gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="w-full sm:flex-1 space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Nombre</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-[#090C15] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="Ej. Comida..." required />
          </div>
          <div className="w-1/2 sm:w-20 space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Icono</label>
            <input type="text" value={newIcon} onChange={e => setNewIcon(e.target.value)} className="w-full bg-[#090C15] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 text-center" maxLength={2} required />
          </div>
          <div className="w-1/2 sm:w-24 space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Color (Hex)</label>
            <input type="text" value={newColor} onChange={e => setNewColor(e.target.value)} className="w-full bg-[#090C15] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="#10B981" required />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button type="submit" className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/25">
              Guardar
            </button>
            <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map(cat => (
          <div key={cat.id} className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 flex flex-col gap-3 group">
            {editingId === cat.id ? (
              <form onSubmit={(e) => handleUpdate(cat.id, e)} className="flex flex-col gap-2">
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="bg-[#090C15] border border-white/10 rounded-lg px-2 py-1 text-xs text-white" required />
                <div className="flex gap-2">
                   <input type="text" value={editIcon} onChange={e => setEditIcon(e.target.value)} className="w-10 bg-[#090C15] border border-white/10 rounded-lg px-1 py-1 text-xs text-white text-center" maxLength={2} required />
                   <input type="text" value={editColor} onChange={e => setEditColor(e.target.value)} className="flex-1 bg-[#090C15] border border-white/10 rounded-lg px-2 py-1 text-xs text-white" required />
                </div>
                <div className="flex gap-1 mt-1">
                  <button type="submit" className="flex-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold py-1 rounded-md border border-emerald-500/30">Guardar</button>
                  <button type="button" onClick={() => setEditingId(null)} className="flex-1 bg-slate-800 text-slate-400 text-[10px] font-bold py-1 rounded-md border border-slate-700">Cancelar</button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner" style={{ backgroundColor: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}40` }}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{cat.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{cat.color}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); setEditIcon(cat.icon); setEditColor(cat.color); }} className="p-1.5 text-slate-400 hover:text-emerald-400 bg-white/5 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-slate-400 hover:text-rose-400 bg-white/5 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </>
            )}
          </div>
        ))}
        {categories.length === 0 && !isAdding && (
          <p className="text-xs text-slate-500 col-span-full py-4 text-center">No hay categorías configuradas.</p>
        )}
      </div>
    </div>
  );
};
