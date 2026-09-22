import React, { useState, useEffect } from 'react';
import { Store, MapPin, Globe, ExternalLink, Plus, Trash2, Eye, ShoppingCart } from 'lucide-react';
import { storageService } from '../../../services/storageService';
import { TcgStore, TcgWatchlistItem, TcgStoreType } from '../../../types';

export const StoreRadar: React.FC = () => {
  const [stores, setStores] = useState<TcgStore[]>([]);
  const [watchlist, setWatchlist] = useState<TcgWatchlistItem[]>([]);
  
  // Modals / Forms
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [showWatchlistForm, setShowWatchlistForm] = useState(false);

  // Store Form State
  const [storeName, setStoreName] = useState('');
  const [storeType, setStoreType] = useState<TcgStoreType>('Online');
  const [storeLocation, setStoreLocation] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [storeNotes, setStoreNotes] = useState('');

  // Watchlist Form State
  const [watchName, setWatchName] = useState('');
  const [watchUrl, setWatchUrl] = useState('');
  const [watchTargetPrice, setWatchTargetPrice] = useState<number>(0);
  const [watchStatus, setWatchStatus] = useState<'In Stock' | 'Out of Stock' | 'Pre-order'>('Out of Stock');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const s = await storageService.getTcgStores();
    const w = await storageService.getTcgWatchlist();
    setStores(s);
    setWatchlist(w);
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    await storageService.addTcgStore({
      name: storeName,
      type: storeType,
      location: storeLocation,
      url: storeUrl,
      notes: storeNotes,
      created_at: new Date().toISOString()
    });
    setShowStoreForm(false);
    setStoreName(''); setStoreLocation(''); setStoreUrl(''); setStoreNotes('');
    loadData();
  };

  const handleAddWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    await storageService.addTcgWatchlistItem({
      item_name: watchName,
      url: watchUrl,
      target_price: watchTargetPrice,
      status: watchStatus,
      created_at: new Date().toISOString()
    });
    setShowWatchlistForm(false);
    setWatchName(''); setWatchUrl(''); setWatchTargetPrice(0); setWatchStatus('Out of Stock');
    loadData();
  };

  const deleteStore = async (id: string) => {
    if (window.confirm('¿Borrar esta tienda?')) {
      await storageService.deleteTcgStore(id);
      loadData();
    }
  };

  const deleteWatchlist = async (id: string) => {
    if (window.confirm('¿Borrar este ítem de seguimiento?')) {
      await storageService.deleteTcgWatchlistItem(id);
      loadData();
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* SECCIÓN: DIRECTORIO DE TIENDAS */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-400" />
            Directorio de Tiendas
          </h2>
          <button 
            onClick={() => setShowStoreForm(!showStoreForm)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {showStoreForm && (
          <form onSubmit={handleAddStore} className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nombre Tienda</label>
              <input required type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tipo</label>
                <select value={storeType} onChange={e => setStoreType(e.target.value as any)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="Local">Local (Física)</option>
                  <option value="Online">Online Nacional/Intl</option>
                  <option value="Third Party (Cardmarket, eBay)">Terceros (Cardmarket...)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Ciudad / Ubicación</label>
                <input type="text" value={storeLocation} onChange={e => setStoreLocation(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Sitio Web / URL</label>
              <input type="url" value={storeUrl} onChange={e => setStoreUrl(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Notas / Fiabilidad</label>
              <input type="text" value={storeNotes} onChange={e => setStoreNotes(e.target.value)} placeholder="Ej. Envían rápido, empaquetado seguro..." className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowStoreForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white">Añadir Tienda</button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {stores.map(store => (
            <div key={store.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between group">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white">{store.name}</h4>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {store.type}
                  </span>
                </div>
                {store.location && (
                  <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {store.location}</p>
                )}
                {store.notes && <p className="text-sm text-slate-500 italic mt-1">{store.notes}</p>}
                {store.url && (
                  <a href={store.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-2">
                    <Globe className="w-3 h-3" /> Visitar sitio web
                  </a>
                )}
              </div>
              <button onClick={() => deleteStore(store.id)} className="p-2 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {stores.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-8 border border-dashed border-slate-800 rounded-xl">No has añadido ninguna tienda.</p>
          )}
        </div>
      </div>

      {/* SECCIÓN: WATCHLIST DE PRODUCTOS */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-400" />
            Watchlist (Radar)
          </h2>
          <button 
            onClick={() => setShowWatchlistForm(!showWatchlistForm)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {showWatchlistForm && (
          <form onSubmit={handleAddWatchlist} className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nombre del Producto</label>
              <input required type="text" value={watchName} onChange={e => setWatchName(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Enlace de Compra (URL)</label>
              <input type="url" value={watchUrl} onChange={e => setWatchUrl(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Precio Objetivo (€)</label>
                <input type="number" step="0.01" value={watchTargetPrice} onChange={e => setWatchTargetPrice(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Estado Manual</label>
                <select value={watchStatus} onChange={e => setWatchStatus(e.target.value as any)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="In Stock">En Stock (Comprar!)</option>
                  <option value="Out of Stock">Agotado</option>
                  <option value="Pre-order">Preventa / Reserva</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowWatchlistForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold bg-emerald-600 text-white">Añadir al Radar</button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {watchlist.map(item => (
            <div key={item.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between group">
              <div className="space-y-1">
                <h4 className="font-bold text-white flex items-center gap-2">
                  {item.item_name}
                  {item.status === 'In Stock' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="En Stock"></span>}
                  {item.status === 'Out of Stock' && <span className="w-2 h-2 rounded-full bg-rose-500" title="Agotado"></span>}
                  {item.status === 'Pre-order' && <span className="w-2 h-2 rounded-full bg-blue-500" title="Preventa"></span>}
                </h4>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Objetivo: {Number(item.target_price).toFixed(2)}€
                  </span>
                  <span>{item.status}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {item.url && (
                  <a href={item.url} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
                    <ShoppingCart className="w-4 h-4" />
                  </a>
                )}
                <button onClick={() => deleteWatchlist(item.id)} className="p-2 text-slate-500 hover:text-rose-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {watchlist.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-8 border border-dashed border-slate-800 rounded-xl">Tu watchlist está vacía. Añade productos que quieras rastrear.</p>
          )}
        </div>
      </div>
    </div>
  );
};
