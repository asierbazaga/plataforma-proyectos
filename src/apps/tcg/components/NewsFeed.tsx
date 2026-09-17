import React from 'react';
import { Rss, ExternalLink, MessageCircle, Twitter, Globe, BookOpen } from 'lucide-react';

export const NewsFeed: React.FC = () => {
  const resources = [
    {
      title: 'PokéBeach',
      description: 'La principal fuente de noticias, filtraciones y rumores del mundo Pokémon TCG.',
      url: 'https://www.pokebeach.com',
      icon: Globe,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'JustinBasil',
      description: 'Guías de construcción de mazos, análisis de sets y recursos para jugadores y coleccionistas.',
      url: 'https://www.justinbasil.com/',
      icon: BookOpen,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Cardmarket (Pokémon)',
      description: 'El mercado europeo más grande para comprar y vender cartas sueltas y productos sellados.',
      url: 'https://www.cardmarket.com/es/Pokemon',
      icon: ExternalLink,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10'
    },
    {
      title: 'TCGPlayer',
      description: 'Mercado americano, excelente referencia para comprobar precios de mercado (Market Price).',
      url: 'https://www.tcgplayer.com/',
      icon: ExternalLink,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10'
    },
    {
      title: 'Alertas Restock (Telegram)',
      description: 'Canal de comunidad para enterarse rápido de preventas y reposiciones en tiendas españolas/europeas.',
      url: 'https://t.me/s/PokemonTCG_ES',
      icon: MessageCircle,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10'
    },
    {
      title: 'Pokémon TCG (Oficial X)',
      description: 'Cuenta oficial de Twitter / X con anuncios formales de la franquicia.',
      url: 'https://twitter.com/PokemonTCG',
      icon: Twitter,
      color: 'text-slate-300',
      bgColor: 'bg-slate-700/50'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Rss className="w-5 h-5 text-indigo-400" />
          Feed de Noticias y Recursos Externos
        </h2>
        <p className="text-sm text-slate-400 mt-1">Acceso rápido a las principales comunidades y portales de TCG.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((res, i) => {
          const Icon = res.icon;
          return (
            <a 
              key={i} 
              href={res.url} 
              target="_blank" 
              rel="noreferrer"
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-600 transition-all group flex flex-col h-full"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-xl ${res.bgColor} ${res.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">{res.title}</h3>
              </div>
              <p className="text-sm text-slate-400 flex-1">{res.description}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                <span>Visitar recurso</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
