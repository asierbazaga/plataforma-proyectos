import { MediaType } from '../../../types';
import { CatalogItem, MASTER_CATALOG } from '../data/defaultCatalog';

export interface SearchResultItem {
  id: string;
  title: string;
  media_type: MediaType;
  genre: string;
  author_creator: string;
  year?: number;
  cover_url?: string;
  description?: string;
  rating_global?: number;
  tags?: string[];
  source?: 'openlibrary' | 'tvmaze' | 'catalog' | 'custom';
}

// 1. Search Open Library (Books) - Free, Open API, no key required
async function searchOpenLibrary(query: string): Promise<SearchResultItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10&fields=key,title,author_name,first_publish_year,cover_i,subject`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();
    if (!data.docs || !Array.isArray(data.docs)) return [];

    return data.docs.map((doc: any) => {
      const coverUrl = doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80';
      const authors = Array.isArray(doc.author_name) ? doc.author_name.join(', ') : 'Autor Desconocido';
      const subjects = Array.isArray(doc.subject) ? doc.subject.slice(0, 3) : ['Literatura'];

      return {
        id: `ol_${doc.key?.replace('/works/', '') || Math.random().toString(36)}`,
        title: doc.title || query,
        media_type: 'book' as MediaType,
        genre: subjects[0] || 'Ficción / General',
        author_creator: authors,
        year: doc.first_publish_year,
        cover_url: coverUrl,
        description: `Obra literaria de ${authors}${doc.first_publish_year ? ` (${doc.first_publish_year})` : ''}.`,
        tags: subjects,
        source: 'openlibrary'
      };
    });
  } catch (err) {
    return [];
  }
}

// 2. Search TVMaze (Series & Shows) - Free, Open API, no key required
async function searchTVMaze(query: string): Promise<SearchResultItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.slice(0, 8).map((item: any) => {
      const show = item.show || {};
      const cleanSummary = show.summary ? show.summary.replace(/<[^>]*>?/gm, '') : '';
      const year = show.premiered ? parseInt(show.premiered.substring(0, 4), 10) : undefined;
      const coverUrl = show.image?.medium || show.image?.original || 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&q=80';
      const genres = Array.isArray(show.genres) && show.genres.length > 0 ? show.genres.join(' / ') : 'Drama / Televisión';

      return {
        id: `tvmaze_${show.id || Math.random().toString(36)}`,
        title: show.name || query,
        media_type: 'series' as MediaType,
        genre: genres,
        author_creator: show.network?.name || show.webChannel?.name || 'Producción TV',
        year: year,
        cover_url: coverUrl,
        description: cleanSummary,
        rating_global: show.rating?.average ? Number((show.rating.average).toFixed(1)) : undefined,
        tags: Array.isArray(show.genres) ? show.genres : ['Serie'],
        source: 'tvmaze'
      };
    });
  } catch (err) {
    return [];
  }
}

// 3. Search Master Local Catalog
function searchCatalog(query: string, mediaType?: MediaType | 'all'): SearchResultItem[] {
  const q = query.toLowerCase().trim();
  return MASTER_CATALOG.filter(item => {
    const matchesType = !mediaType || mediaType === 'all' || item.media_type === mediaType;
    if (!matchesType) return false;
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.genre.toLowerCase().includes(q) ||
      item.author_creator.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    );
  }).map(item => ({
    id: item.id,
    title: item.title,
    media_type: item.media_type,
    genre: item.genre,
    author_creator: item.author_creator,
    year: item.year,
    cover_url: item.cover_url,
    description: item.description,
    rating_global: item.rating_global,
    tags: item.tags,
    source: 'catalog'
  }));
}

export const mediaSearchService = {
  async search(query: string, mediaType: MediaType | 'all' = 'all'): Promise<SearchResultItem[]> {
    const trimmed = query.trim();

    // 1. Always fetch matching items from our curated master catalog
    const localResults = searchCatalog(trimmed, mediaType);

    if (!trimmed) {
      return localResults;
    }

    // 2. Query external APIs in parallel based on selected mediaType
    const promises: Promise<SearchResultItem[]>[] = [];

    if (mediaType === 'all' || mediaType === 'book') {
      promises.push(searchOpenLibrary(trimmed));
    }
    if (mediaType === 'all' || mediaType === 'series') {
      promises.push(searchTVMaze(trimmed));
    }

    const apiResultsArrays = await Promise.all(promises);
    const apiResults = apiResultsArrays.flat();

    // Deduplicate by normalized title
    const seenTitles = new Set<string>();
    const unified: SearchResultItem[] = [];

    // Prioritize curated catalog results
    for (const item of localResults) {
      const norm = item.title.toLowerCase().trim();
      if (!seenTitles.has(norm)) {
        seenTitles.add(norm);
        unified.push(item);
      }
    }

    for (const item of apiResults) {
      const norm = item.title.toLowerCase().trim();
      if (!seenTitles.has(norm)) {
        seenTitles.add(norm);
        unified.push(item);
      }
    }

    return unified;
  },

  getCatalog(): CatalogItem[] {
    return MASTER_CATALOG;
  },

  getCatalogByType(type: MediaType): CatalogItem[] {
    return MASTER_CATALOG.filter(c => c.media_type === type);
  }
};
