import React, { useState, useEffect } from 'react';
import { Bitcoin, LineChart, Wallet, Plus, Trash2, TrendingUp, TrendingDown, RefreshCcw, DollarSign, Euro } from 'lucide-react';
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

type Currency = 'USD' | 'EUR';

export const CriptosApp: React.FC = () => {
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [livePrices, setLivePrices] = useState<Record<string, { eur: number; usd: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewCurrency, setViewCurrency] = useState<Currency>('USD');
  
  // Add Form State
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(POPULAR_COINS[0]);
  const [amount, setAmount] = useState<number | ''>('');
  const [buyPriceInput, setBuyPriceInput] = useState<number | ''>('');
  const [buyCurrency, setBuyCurrency] = useState<Currency>('USD');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await storageService.getCryptoAssets();
    setAssets(data);
    
    // Si todos los activos fueron comprados en una moneda, mejor usar esa por defecto
    if (data.length > 0 && data.every(a => a.buy_currency === data[0].buy_currency)) {
      setViewCurrency(data[0].buy_currency);
    }
    
    await fetchLivePrices(data);
    setIsLoading(false);
  };

  const fetchLivePrices = async (currentAssets: CryptoAsset[]) => {
    setIsRefreshing(true);
    try {
      // Siempre incluimos bitcoin para calcular el tipo de cambio USD/EUR de forma indirecta
      const coinIds = new Set(currentAssets.map(a => a.coin_id));
      coinIds.add('bitcoin'); 
      const uniqueIds = Array.from(coinIds).join(',');
      
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${uniqueIds}&vs_currencies=eur,usd`);
      const data = await res.json();
      setLivePrices(data);
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !buyPriceInput) return;

    await storageService.addCryptoAsset({
      coin_id: selectedCoin.id,
      symbol: selectedCoin.symbol,
      name: selectedCoin.name,
      amount: Number(amount),
      buy_price: Number(buyPriceInput),
      buy_currency: buyCurrency,
      created_at: new Date().toISOString()
    });

    setIsAdding(false);
    setAmount('');
    setBuyPriceInput('');
    loadData(); // Reloads assets and updates prices
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar este activo?')) {
      await storageService.deleteCryptoAsset(id);
      loadData();
    }
  };

  // Utility to get current exchange rate if needed
  const getExchangeRate = (from: Currency, to: Currency) => {
    if (from === to) return 1;
    const btc = livePrices['bitcoin'];
    if (!btc || !btc.usd || !btc.eur) return 1; // Fallback
    return to === 'EUR' ? btc.eur / btc.usd : btc.usd / btc.eur;
  };

  const convertToViewCurrency = (value: number, fromCurrency: Currency) => {
    return value * getExchangeRate(fromCurrency, viewCurrency);
  };

  // Calculations
  const totalInvested = assets.reduce((acc, a) => acc + convertToViewCurrency(a.amount * a.buy_price, a.buy_currency), 0);
  
  const totalCurrent = assets.reduce((acc, a) => {
    const currentPrice = livePrices[a.coin_id]?.[viewCurrency.toLowerCase() as 'usd' | 'eur'] 
      || convertToViewCurrency(a.buy_price, a.buy_currency);
    return acc + (a.amount * currentPrice);
  }, 0);
  
  const totalProfit = totalCurrent - totalInvested;
  const totalProfitPct = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  let bestAsset = { symbol: '-', value: 0 };
  assets.forEach(a => {
    const currentPrice = livePrices[a.coin_id]?.[viewCurrency.toLowerCase() as 'usd' | 'eur'] || 0;
    const value = a.amount * currentPrice;
    if (value > bestAsset.value) {
      bestAsset = { symbol: a.symbol, value };
    }
  });

  const formatCurrency = (value: number, currency: Currency) => {
    return value.toLocaleString('es-ES', { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: value < 1 ? 4 : 2,
      maximumFractionDigits: value < 1 ? 4 : 2
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Currency Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Dashboard Cripto</h2>
          <p className="text-sm text-slate-400">Analiza tu portfolio en tiempo real</p>
        </div>
        <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700">
          <button
            onClick={() => setViewCurrency('USD')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewCurrency === 'USD' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <DollarSign className="w-4 h-4" /> USD
          </button>
          <button
            onClick={() => setViewCurrency('EUR')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewCurrency === 'EUR' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Euro className="w-4 h-4" /> EUR
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-3xl border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-400">Valor Actual</h3>
            </div>
            <button 
              onClick={() => fetchLivePrices(assets)}
              disabled={isRefreshing}
              className={`p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-3xl font-black text-white relative z-10">
            {formatCurrency(totalCurrent, viewCurrency)}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1 relative z-10">
            Capital Invertido: {formatCurrency(totalInvested, viewCurrency)}
          </p>
        </div>

        <div className={`glass-panel p-5 rounded-3xl border ${totalProfit >= 0 ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalProfit >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              <LineChart className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-400">Rendimiento (ROI)</h3>
          </div>
          <div className="flex items-end gap-2">
            <p className={`text-3xl font-black ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalProfit >= 0 ? '+' : ''}{totalProfitPct.toFixed(2)}%
            </p>
          </div>
          <p className={`text-xs font-bold mt-1 ${totalProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit, viewCurrency)}
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
            {formatCurrency(bestAsset.value, viewCurrency)}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <h2 className="text-xl font-bold text-white">Tus Activos</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Cancelar' : 'Añadir Compra'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddAsset} className="p-6 rounded-2xl bg-slate-900/80 border border-indigo-500/30 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" /> Registrar Inversión
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Criptomoneda</label>
              <select 
                value={selectedCoin.id} 
                onChange={e => setSelectedCoin(POPULAR_COINS.find(c => c.id === e.target.value) || POPULAR_COINS[0])}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-indigo-500"
              >
                {POPULAR_COINS.map(coin => (
                  <option key={coin.id} value={coin.id}>{coin.name} ({coin.symbol})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Cantidad de Monedas</label>
              <input 
                type="number" 
                step="any"
                required 
                value={amount} 
                onChange={e => setAmount(Number(e.target.value))} 
                placeholder="Ej. 0.05"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Moneda Usada</label>
              <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setBuyCurrency('USD')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${buyCurrency === 'USD' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
                >
                  USD
                </button>
                <button
                  type="button"
                  onClick={() => setBuyCurrency('EUR')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${buyCurrency === 'EUR' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
                >
                  EUR
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Precio de Compra por Unidad</label>
              <input 
                type="number" 
                step="any"
                required 
                value={buyPriceInput} 
                onChange={e => setBuyPriceInput(Number(e.target.value))} 
                placeholder="Ej. 60000"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button type="submit" className="px-8 py-3 rounded-xl font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20">
              Añadir Inversión
            </button>
          </div>
        </form>
      )}

      {/* Assets Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-black text-slate-400 uppercase tracking-wider bg-slate-900/80">
              <th className="py-4 px-6">Activo</th>
              <th className="py-4 px-6">Cantidad</th>
              <th className="py-4 px-6">Precio de Compra (Ud.)</th>
              <th className="py-4 px-6">Precio Actual (Ud.)</th>
              <th className="py-4 px-6 text-right">Beneficio / Pérdida</th>
              <th className="py-4 px-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {assets.map(asset => {
              const liveData = livePrices[asset.coin_id];
              const currentPriceView = liveData?.[viewCurrency.toLowerCase() as 'usd' | 'eur'] || convertToViewCurrency(asset.buy_price, asset.buy_currency);
              
              const investedView = convertToViewCurrency(asset.amount * asset.buy_price, asset.buy_currency);
              const currentValView = asset.amount * currentPriceView;
              
              const profitView = currentValView - investedView;
              const profitPct = investedView > 0 ? (profitView / investedView) * 100 : 0;
              const isProfitable = profitView >= 0;

              return (
                <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sm font-black text-white border border-slate-700 shadow-inner">
                        {asset.symbol.substring(0, 3)}
                      </div>
                      <div>
                        <p className="font-bold text-white text-base">{asset.name}</p>
                        <p className="text-xs font-medium text-slate-500">{asset.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <p className="font-bold text-white text-lg">{asset.amount}</p>
                    <p className="text-xs font-medium text-slate-500">Inversión original: {formatCurrency(asset.amount * asset.buy_price, asset.buy_currency)}</p>
                  </td>
                  <td className="py-5 px-6">
                    <p className="font-bold text-slate-300">
                      {formatCurrency(convertToViewCurrency(asset.buy_price, asset.buy_currency), viewCurrency)}
                    </p>
                  </td>
                  <td className="py-5 px-6">
                    {liveData ? (
                      <p className="font-bold text-white">
                        {formatCurrency(currentPriceView, viewCurrency)}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-slate-500 border-t-transparent animate-spin"></span>
                        <span className="text-xs font-medium text-slate-500">Cargando...</span>
                      </div>
                    )}
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-black ${isProfitable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {isProfitable ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span>{isProfitable ? '+' : ''}{formatCurrency(profitView, viewCurrency)}</span>
                    </div>
                    <p className={`text-xs font-bold mt-1.5 ${isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isProfitable ? '+' : ''}{profitPct.toFixed(2)}%
                    </p>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <button 
                      onClick={() => handleDelete(asset.id)}
                      className="p-2.5 rounded-xl text-slate-500 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                      title="Eliminar activo"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {assets.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-500">
                  <Wallet className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="font-bold text-lg text-slate-400">Sin inversiones</p>
                  <p className="text-sm mt-1">Registra tu primera compra para empezar el seguimiento.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assets Mobile Cards */}
      <div className="md:hidden space-y-4">
        {assets.map(asset => {
          const liveData = livePrices[asset.coin_id];
          const currentPriceView = liveData?.[viewCurrency.toLowerCase() as 'usd' | 'eur'] || convertToViewCurrency(asset.buy_price, asset.buy_currency);
          
          const investedView = convertToViewCurrency(asset.amount * asset.buy_price, asset.buy_currency);
          const currentValView = asset.amount * currentPriceView;
          
          const profitView = currentValView - investedView;
          const profitPct = investedView > 0 ? (profitView / investedView) * 100 : 0;
          const isProfitable = profitView >= 0;

          return (
            <div key={asset.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sm font-black text-white border border-slate-700 shadow-inner">
                    {asset.symbol.substring(0, 3)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-base">{asset.name}</p>
                    <p className="text-xs font-medium text-slate-500">{asset.amount} {asset.symbol}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(asset.id)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Compra</p>
                  <p className="font-bold text-slate-300">
                    {formatCurrency(convertToViewCurrency(asset.buy_price, asset.buy_currency), viewCurrency)}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Total: {formatCurrency(asset.amount * asset.buy_price, asset.buy_currency)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Actual</p>
                  {liveData ? (
                    <p className="font-bold text-white">
                      {formatCurrency(currentPriceView, viewCurrency)}
                    </p>
                  ) : (
                    <span className="text-xs text-slate-500">Cargando...</span>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-800/50 flex justify-between items-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Beneficio / Pérdida</p>
                <div className="text-right">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black ${isProfitable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {isProfitable ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{isProfitable ? '+' : ''}{formatCurrency(profitView, viewCurrency)}</span>
                  </div>
                  <p className={`text-[10px] font-bold mt-1 ${isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isProfitable ? '+' : ''}{profitPct.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {assets.length === 0 && !isLoading && (
          <div className="py-16 text-center text-slate-500 border border-slate-800 border-dashed rounded-2xl">
            <Wallet className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-bold text-lg text-slate-400">Sin inversiones</p>
            <p className="text-sm mt-1">Registra tu primera compra.</p>
          </div>
        )}
      </div>
    </div>
  );
};
