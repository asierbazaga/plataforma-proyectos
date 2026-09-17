import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Image as ImageIcon, Trash2, Edit3, TrendingUp, DollarSign, ExternalLink, ChevronDown } from 'lucide-react';
import { storageService } from '../../../services/storageService';
import { TcgItem, TcgProductType, TcgLanguage, TcgCondition } from '../../../types';

const MOCK_ETBS = [
  { id: 'etb_151', name: 'Pokémon 151 Elite Trainer Box', set: '151', image: 'https://tcg.pokemon.com/assets/img/expansions/151/products/etb.png', marketPrice: 55 },
  { id: 'etb_paf', name: 'Paldean Fates Elite Trainer Box', set: 'Paldean Fates', image: 'https://tcg.pokemon.com/assets/img/expansions/paldean-fates/products/etb.png', marketPrice: 45 },
  { id: 'etb_obf', name: 'Obsidian Flames Elite Trainer Box', set: 'Obsidian Flames', image: 'https://tcg.pokemon.com/assets/img/expansions/obsidian-flames/products/etb.png', marketPrice: 40 },
  { id: 'etb_pev', name: 'Paldea Evolved Elite Trainer Box', set: 'Paldea Evolved', image: 'https://tcg.pokemon.com/assets/img/expansions/paldea-evolved/products/etb.png', marketPrice: 42 },
  { id: 'etb_sv1', name: 'Scarlet & Violet Base Elite Trainer Box', set: 'Scarlet & Violet Base', image: 'https://tcg.pokemon.com/assets/img/expansions/scarlet-violet/products/etb.png', marketPrice: 40 },
  { id: 'etb_crz', name: 'Crown Zenith Elite Trainer Box', set: 'Crown Zenith', image: 'https://tcg.pokemon.com/assets/img/expansions/crown-zenith/products/etb.png', marketPrice: 65 },
  { id: 'etb_sit', name: 'Silver Tempest Elite Trainer Box', set: 'Silver Tempest', image: 'https://tcg.pokemon.com/assets/img/expansions/silver-tempest/products/etb.png', marketPrice: 45 },
  { id: 'etb_lor', name: 'Lost Origin Elite Trainer Box', set: 'Lost Origin', image: 'https://tcg.pokemon.com/assets/img/expansions/lost-origin/products/etb.png', marketPrice: 50 },
  { id: 'etb_asr', name: 'Astral Radiance Elite Trainer Box', set: 'Astral Radiance', image: 'https://tcg.pokemon.com/assets/img/expansions/astral-radiance/products/etb.png', marketPrice: 40 },
  { id: 'etb_brs', name: 'Brilliant Stars Elite Trainer Box', set: 'Brilliant Stars', image: 'https://tcg.pokemon.com/assets/img/expansions/brilliant-stars/products/etb.png', marketPrice: 45 },
  { id: 'etb_fst', name: 'Fusion Strike Elite Trainer Box', set: 'Fusion Strike', image: 'https://tcg.pokemon.com/assets/img/expansions/fusion-strike/products/etb.png', marketPrice: 45 },
  { id: 'etb_cel', name: 'Celebrations Elite Trainer Box', set: 'Celebrations', image: 'https://tcg.pokemon.com/assets/img/expansions/celebrations/products/etb.png', marketPrice: 85 },
  { id: 'etb_evs', name: 'Evolving Skies Elite Trainer Box', set: 'Evolving Skies', image: 'https://tcg.pokemon.com/assets/img/expansions/evolving-skies/products/etb.png', marketPrice: 120 },
  { id: 'etb_cre', name: 'Chilling Reign Elite Trainer Box', set: 'Chilling Reign', image: 'https://tcg.pokemon.com/assets/img/expansions/chilling-reign/products/etb.png', marketPrice: 50 },
  { id: 'etb_bst', name: 'Battle Styles Elite Trainer Box', set: 'Battle Styles', image: 'https://tcg.pokemon.com/assets/img/expansions/battle-styles/products/etb.png', marketPrice: 40 },
  { id: 'etb_shf', name: 'Shining Fates Elite Trainer Box', set: 'Shining Fates', image: 'https://tcg.pokemon.com/assets/img/expansions/shining-fates/products/etb.png', marketPrice: 55 },
  { id: 'etb_viv', name: 'Vivid Voltage Elite Trainer Box', set: 'Vivid Voltage', image: 'https://tcg.pokemon.com/assets/img/expansions/vivid-voltage/products/etb.png', marketPrice: 45 },
  { id: 'etb_cpa', name: 'Champion\'s Path Elite Trainer Box', set: 'Champion\'s Path', image: 'https://tcg.pokemon.com/assets/img/expansions/champions-path/products/etb.png', marketPrice: 90 },
  { id: 'etb_daa', name: 'Darkness Ablaze Elite Trainer Box', set: 'Darkness Ablaze', image: 'https://tcg.pokemon.com/assets/img/expansions/darkness-ablaze/products/etb.png', marketPrice: 45 },
];

export const PortfolioTracker: React.FC = () => {
  const [items, setItems] = useState<TcgItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Search Type State
  const [searchType, setSearchType] = useState<'card' | 'etb'>('card');
  const [etbFilter, setEtbFilter] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [setNameInput, setSetNameInput] = useState('');
  const [productType, setProductType] = useState<TcgProductType>('Single Card (Raw)');
  const [language, setLanguage] = useState<TcgLanguage>('English');
  const [condition, setCondition] = useState<TcgCondition>('Mint/Near Mint');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [marketPrice, setMarketPrice] = useState<number>(0);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [storeName, setStoreName] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');

  // API Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const data = await storageService.getTcgItems();
    setItems(data);
  };

  const handleSearchApi = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      // Using Pokemon TCG API
      const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:"${searchQuery}"&pageSize=10`);
      const data = await res.json();
      setSearchResults(data.data || []);
    } catch (error) {
      console.error('Error fetching cards', error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectCardFromApi = (card: any) => {
    setName(card.name);
    setSetNameInput(card.set?.name || '');
    setImageUrl(card.images?.large || card.images?.small || '');
    if (card.tcgplayer?.prices?.holofoil?.market) {
      setMarketPrice(card.tcgplayer.prices.holofoil.market);
    } else if (card.tcgplayer?.prices?.normal?.market) {
      setMarketPrice(card.tcgplayer.prices.normal.market);
    }
    setSearchResults([]);
    setSearchQuery('');
  };

  const selectEtbFromMock = (etb: typeof MOCK_ETBS[0]) => {
    setName(etb.name);
    setSetNameInput(etb.set);
    setImageUrl(etb.image);
    setMarketPrice(etb.marketPrice);
    setProductType('ETB');
    setEtbFilter('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await storageService.addTcgItem({
      name,
      set_name: setNameInput,
      product_type: productType,
      language,
      condition,
      purchase_date: purchaseDate,
      store_name: storeName,
      purchase_price: purchasePrice,
      market_price: marketPrice,
      storage_location: storageLocation,
      image_url: imageUrl,
      notes,
      created_at: new Date().toISOString()
    });
    setIsAdding(false);
    resetForm();
    loadItems();
  };

  const resetForm = () => {
    setName('');
    setSetNameInput('');
    setProductType('Single Card (Raw)');
    setLanguage('English');
    setCondition('Mint/Near Mint');
    setPurchasePrice(0);
    setMarketPrice(0);
    setStoreName('');
    setStorageLocation('');
    setImageUrl('');
    setNotes('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar este ítem?')) {
      await storageService.deleteTcgItem(id);
      loadItems();
    }
  };

  const totalInvested = items.reduce((acc, item) => acc + (Number(item.purchase_price) || 0), 0);
  const totalMarket = items.reduce((acc, item) => acc + (Number(item.market_price) || 0), 0);
  const totalProfit = totalMarket - totalInvested;
  const roiPct = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-slate-400">Total Ítems</h3>
          </div>
          <p className="text-2xl font-black text-white">{items.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-slate-400">Inversión Total</h3>
          </div>
          <p className="text-2xl font-black text-white">{totalInvested.toFixed(2)} €</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${totalProfit >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-slate-400">Valor Mercado (ROI)</h3>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-black text-white">{totalMarket.toFixed(2)} €</p>
            <span className={`text-sm font-bold mb-1 ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} € ({roiPct.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Tu Colección</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Cancelar' : 'Añadir Ítem'}
        </button>
      </div>

      {isAdding && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-indigo-500/30 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            Nuevo Ítem
          </h3>

          {/* Search/Autofill Box */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-4 mb-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo de búsqueda:</label>
              <div className="flex bg-slate-900 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setSearchType('card')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${searchType === 'card' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Cartas (API)
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('etb')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${searchType === 'etb' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Cajas (ETBs)
                </button>
              </div>
            </div>

            {searchType === 'card' ? (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej. Charizard, Pikachu, Umbreon VMAX..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchApi()}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleSearchApi}
                    disabled={isSearching}
                    className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    {isSearching ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 max-h-60 overflow-y-auto hide-scrollbar">
                    {searchResults.map(card => (
                      <div 
                        key={card.id} 
                        onClick={() => selectCardFromApi(card)}
                        className="cursor-pointer group relative rounded-xl overflow-hidden border border-slate-700 hover:border-indigo-500"
                      >
                        <img src={card.images?.small} alt={card.name} className="w-full h-auto object-contain bg-black/50" />
                        <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/20 transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrar cajas ETB..."
                    value={etbFilter}
                    onChange={(e) => setEtbFilter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto hide-scrollbar">
                  {MOCK_ETBS.filter(etb => etb.name.toLowerCase().includes(etbFilter.toLowerCase())).map(etb => (
                    <div
                      key={etb.id}
                      onClick={() => selectEtbFromMock(etb)}
                      className="cursor-pointer group flex items-center gap-3 p-2 rounded-xl border border-slate-700 hover:border-indigo-500 bg-slate-900/50"
                    >
                      <div className="w-12 h-12 flex-shrink-0 bg-white/5 rounded-lg overflow-hidden flex items-center justify-center p-1">
                        <img src={etb.image} alt={etb.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{etb.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{etb.set}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nombre / Título</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Set / Expansión</label>
              <input type="text" value={setNameInput} onChange={e => setSetNameInput(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Producto</label>
              <select value={productType} onChange={e => setProductType(e.target.value as any)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white">
                <option value="Single Card (Raw)">Carta Suelta (Raw)</option>
                <option value="Single Card (Graded)">Carta Suelta (Graded)</option>
                <option value="ETB">Elite Trainer Box (ETB)</option>
                <option value="Booster Box">Booster Box</option>
                <option value="UPC">Ultra Premium Collection</option>
                <option value="Blister">Blister / Pack</option>
                <option value="Tin">Tin / Lata</option>
                <option value="Other">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Idioma</label>
              <select value={language} onChange={e => setLanguage(e.target.value as any)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white">
                <option value="English">Inglés</option>
                <option value="Spanish">Español</option>
                <option value="Japanese">Japonés</option>
                <option value="Other">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Precio Compra (€)</label>
              <input type="number" step="0.01" value={purchasePrice} onChange={e => setPurchasePrice(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Precio Mercado (€)</label>
              <input type="number" step="0.01" value={marketPrice} onChange={e => setMarketPrice(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tienda / Origen</label>
              <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">URL Imagen</label>
              <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white" />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white">Cancelar</button>
              <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white">Guardar en Portfolio</button>
            </div>
          </form>
        </div>
      )}

      {/* Grid de Ítems */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(item => {
          const profit = (Number(item.market_price) || 0) - (Number(item.purchase_price) || 0);
          const isProfitable = profit >= 0;

          return (
            <div key={item.id} className="group relative rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden flex flex-col hover:border-indigo-500/50 transition-colors">
              <div className="aspect-[3/4] w-full bg-slate-800/50 relative overflow-hidden flex items-center justify-center p-4">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-slate-600" />
                )}
                
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-rose-500 text-white shadow-lg hover:bg-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-white leading-tight">{item.name}</h4>
                    <p className="text-xs text-slate-400">{item.set_name} • {item.language}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-800 text-slate-300">
                    {item.product_type}
                  </span>
                </div>

                <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-800/80">
                  <div>
                    <p className="text-[10px] font-medium text-slate-500">Valor Mercado</p>
                    <p className="font-black text-white">{Number(item.market_price).toFixed(2)} €</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-medium text-slate-500">Beneficio</p>
                    <p className={`text-sm font-bold ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isProfitable ? '+' : ''}{profit.toFixed(2)} €
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-3xl">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Tu colección está vacía</p>
            <p className="text-sm text-slate-500 mt-1">Añade tu primera carta o caja sellada para empezar a trackear su valor.</p>
          </div>
        )}
      </div>
    </div>
  );
};
