import React, { useState, useEffect } from 'react';
import { Bitcoin, LineChart, Wallet, Plus, Trash2, TrendingUp, TrendingDown, RefreshCcw, Search } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { CryptoAsset } from '../../types';

const POPULAR_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'matic-network', symbol: 'MATIC', name: 'Polygon' },
  { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos' }
];

export const CriptosApp: React.FC = () => {
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Add Form State
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(POPULAR_COINS[0]);
  const [amount, setAmount] = useState<number | ''>('');
  const [buyPrice, setBuyPrice] = useState<number | ''>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await storageService.getCryptoAssets();
    setAssets(data);
    if (data.length > 0) {
      await fetchLivePrices(data);
    }
    setIsLoading(false);
  };

  const fetchLivePrices = async (currentAssets: CryptoAsset[]) => {
    setIsRefreshing(true);
    try {
      const uniqueIds = Array.from(new Set(currentAssets.map(a => a.coin_id))).join(',');
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${uniqueIds}&vs_currencies=eur`);
      const data = await res.json();
      
      const newPrices: Record<string, number> = {};
      Object.keys(data).forEach(id => {
        newPrices[id] = data[id].eur;
      });
      setLivePrices(newPrices);
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !buyPrice) return;

    await storageService.addCryptoAsset({
      coin_id: selectedCoin.id,
      symbol: selectedCoin.symbol,
      name: selectedCoin.name,
      amount: Number(amount),
      buy_price_eur: Number(buyPrice),
      created_at: new Date().toISOString()
    });

    setIsAdding(false);
    setAmount('');
    setBuyPrice('');
    loadData(); // Reloads assets and updates prices
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar este activo?')) {
      await storageService.deleteCryptoAsset(id);
      loadData();
    }
  };

  const totalInvested = assets.reduce((acc, a) => acc + (a.amount * a.buy_price_eur), 0);
  const totalCurrent = assets.reduce((acc, a) => {
    const currentPrice = livePrices[a.coin_id] || a.buy_price_eur; // fallback to buy price if API fails
    return acc + (a.amount * currentPrice);
  }, 0);
  const totalProfit = totalCurrent - totalInvested;
  const totalProfitPct = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  // Encontrar la mayor posición
  let bestAsset = { symbol: '-', value: 0 };
  assets.forEach(a => {
    const value = a.amount * (livePrices[a.coin_id] || a.buy_price_eur);
    if (value > bestAsset.value) {
      bestAsset = { symbol: a.symbol, value };
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-3xl border-slate-800">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-400">Portfolio Total</h3>
            </div>
            <button 
              onClick={() => fetchLivePrices(assets)}
              disabled={isRefreshing}
              className={`p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 transition-colors text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-3xl font-black text-white">
            {totalCurrent.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Invertido: {totalInvested.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>

        <div className={`glass-panel p-5 rounded-3xl border ${totalProfit >= 0 ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalProfit >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              <LineChart className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-400">Rendimiento Total (ROI)</h3>
          </div>
          <div className="flex items-end gap-2">
            <p className={`text-3xl font-black ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalProfit >= 0 ? '+' : ''}{totalProfitPct.toFixed(2)}%
            </p>
          </div>
          <p className={`text-xs font-bold mt-1 ${totalProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
        
        <div className="glass-panel p-5 rounded-3xl border-blue-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Bitcoin className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-400">Mayor Posición</h3>
          </div>
          <p className="text-3xl font-black text-white">
            {bestAsset.symbol}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {bestAsset.value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Tus Activos</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Cancelar' : 'Añadir Activo'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddAsset} className="p-6 rounded-2xl bg-slate-900/80 border border-indigo-500/30 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Nueva Inversión</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Criptomoneda</label>
              <select 
                value={selectedCoin.id} 
                onChange={e => setSelectedCoin(POPULAR_COINS.find(c => c.id === e.target.value) || POPULAR_COINS[0])}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {POPULAR_COINS.map(coin => (
                  <option key={coin.id} value={coin.id}>{coin.name} ({coin.symbol})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Cantidad Comprada</label>
              <input 
                type="number" 
                step="any"
                required 
                value={amount} 
                onChange={e => setAmount(Number(e.target.value))} 
                placeholder="Ej. 0.05"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Precio Compra (€) por Unidad</label>
              <input 
                type="number" 
                step="any"
                required 
                value={buyPrice} 
                onChange={e => setBuyPrice(Number(e.target.value))} 
                placeholder="Ej. 42000"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
              Guardar Inversión
            </button>
          </div>
        </form>
      )}

      {/* Assets Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Activo</th>
              <th className="py-3 px-4">Cantidad</th>
              <th className="py-3 px-4">Precio Compra</th>
              <th className="py-3 px-4">Precio Actual</th>
              <th className="py-3 px-4 text-right">Beneficio / Pérdida</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {assets.map(asset => {
              const currentPrice = livePrices[asset.coin_id] || asset.buy_price_eur;
              const invested = asset.amount * asset.buy_price_eur;
              const current = asset.amount * currentPrice;
              const profit = current - invested;
              const profitPct = (profit / invested) * 100;
              const isProfitable = profit >= 0;

              return (
                <tr key={asset.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-slate-700">
                        {asset.symbol.substring(0, 3)}
                      </div>
                      <div>
                        <p className="font-bold text-white">{asset.name}</p>
                        <p className="text-[10px] text-slate-500">{asset.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-white">{asset.amount}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-slate-400">
                      {asset.buy_price_eur.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    {livePrices[asset.coin_id] ? (
                      <p className="font-bold text-white">
                        {currentPrice.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full border-2 border-slate-500 border-t-transparent animate-spin"></span>
                        <span className="text-xs text-slate-500">Cargando...</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-bold ${isProfitable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {isProfitable ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{isProfitable ? '+' : ''}{profit.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <p className={`text-[10px] font-medium mt-1 ${isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isProfitable ? '+' : ''}{profitPct.toFixed(2)}%
                    </p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={() => handleDelete(asset.id)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                      title="Eliminar activo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {assets.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No tienes criptomonedas en tu portfolio.</p>
                  <p className="text-xs mt-1">Añade tu primera inversión usando el botón superior.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
