import { LibraryItem, MediaType } from '../../../types';
import { CatalogItem, MASTER_CATALOG } from '../data/defaultCatalog';

export interface RecommendationReason {
  item: CatalogItem;
  score: number; // 0-100
  reason: string;
  matchedAttributes: string[];
  basedOnItem?: LibraryItem;
}

export interface UserTasteProfile {
  totalItems: number;
  completedItems: number;
  averageRating: number;
  topGenres: { genre: string; count: number; avgRating: number }[];
  topCreators: { creator: string; count: number }[];
  favoriteTags: { tag: string; count: number }[];
  mediaCounts: Record<MediaType, number>;
}

export const recommendationEngine = {
  // 1. Calculate user taste profile
  getUserProfile(library: LibraryItem[]): UserTasteProfile {
    const mediaCounts: Record<MediaType, number> = {
      book: 0,
      game: 0,
      movie: 0,
      series: 0
    };

    const genreStats: Record<string, { totalScore: number; count: number }> = {};
    const creatorStats: Record<string, number> = {};
    const tagStats: Record<string, number> = {};

    let totalRatingSum = 0;
    let completedCount = 0;

    for (const item of library) {
      if (item.media_type) {
        mediaCounts[item.media_type] = (mediaCounts[item.media_type] || 0) + 1;
      }
      if (item.status === 'completed') completedCount++;
      totalRatingSum += (item.rating || 0);

      // Genre
      if (item.genre) {
        const parts = item.genre.split(/[\/,]/).map(g => g.trim()).filter(Boolean);
        for (const g of parts) {
          if (!genreStats[g]) genreStats[g] = { totalScore: 0, count: 0 };
          genreStats[g].count += 1;
          genreStats[g].totalScore += (item.rating || 3);
        }
      }

      // Creator
      if (item.author_creator) {
        creatorStats[item.author_creator] = (creatorStats[item.author_creator] || 0) + 1;
      }

      // Tags
      if (item.tags && Array.isArray(item.tags)) {
        for (const t of item.tags) {
          tagStats[t] = (tagStats[t] || 0) + 1;
        }
      }
    }

    const topGenres = Object.entries(genreStats)
      .map(([genre, data]) => ({
        genre,
        count: data.count,
        avgRating: Number((data.totalScore / data.count).toFixed(1))
      }))
      .sort((a, b) => b.avgRating * 2 + b.count - (a.avgRating * 2 + a.count));

    const topCreators = Object.entries(creatorStats)
      .map(([creator, count]) => ({ creator, count }))
      .sort((a, b) => b.count - a.count);

    const favoriteTags = Object.entries(tagStats)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    const avgRating = library.length > 0 ? Number((totalRatingSum / library.length).toFixed(1)) : 0;

    return {
      totalItems: library.length,
      completedItems: completedCount,
      averageRating: avgRating,
      topGenres,
      topCreators,
      favoriteTags,
      mediaCounts
    };
  },

  // 2. Generate personalized recommendations
  getPersonalizedRecommendations(
    library: LibraryItem[],
    selectedMediaType?: MediaType | 'all'
  ): {
    basedOnLiked: RecommendationReason[];
    genreFavorites: RecommendationReason[];
    criticsPicks: RecommendationReason[];
    tasteProfile: UserTasteProfile;
  } {
    const tasteProfile = this.getUserProfile(library);
    const userTitles = new Set(library.map(i => i.title.toLowerCase().trim()));

    // Candidates are catalog items not yet in user's library
    const candidates = MASTER_CATALOG.filter(item => {
      if (userTitles.has(item.title.toLowerCase().trim())) return false;
      if (selectedMediaType && selectedMediaType !== 'all' && item.media_type !== selectedMediaType) {
        return false;
      }
      return true;
    });

    // High rated user items (rating >= 4 or >= 7 if on 10 scale)
    const favoriteItems = library.filter(i => (i.rating >= 4 || i.rating >= 8));

    // A. Recommendations "Because you liked [X]"
    const basedOnLiked: RecommendationReason[] = [];
    for (const candidate of candidates) {
      for (const fav of favoriteItems) {
        let matchScore = 0;
        const matches: string[] = [];

        // Check genre overlap
        const favGenres = fav.genre.toLowerCase().split(/[\/,]/).map(s => s.trim());
        const candGenres = candidate.genre.toLowerCase().split(/[\/,]/).map(s => s.trim());
        const sharedGenre = favGenres.find(fg => candGenres.some(cg => cg.includes(fg) || fg.includes(cg)));

        if (sharedGenre) {
          matchScore += 45;
          matches.push(`Género afín (${sharedGenre})`);
        }

        // Check tags overlap
        if (fav.tags && Array.isArray(fav.tags)) {
          const sharedTags = fav.tags.filter(ft =>
            candidate.tags.some(ct => ct.toLowerCase().includes(ft.toLowerCase()))
          );
          if (sharedTags.length > 0) {
            matchScore += Math.min(30, sharedTags.length * 15);
            matches.push(...sharedTags);
          }
        }

        // Check creator
        if (fav.author_creator && candidate.author_creator.toLowerCase().includes(fav.author_creator.toLowerCase())) {
          matchScore += 35;
          matches.push(`Del mismo creador (${fav.author_creator})`);
        }

        // Same media type bonus
        if (fav.media_type === candidate.media_type) {
          matchScore += 10;
        }

        if (matchScore >= 40) {
          basedOnLiked.push({
            item: candidate,
            score: Math.min(99, Math.round(matchScore + candidate.rating_global * 2)),
            reason: `Porque te encantó "${fav.title}" (le diste ${fav.rating}⭐)`,
            matchedAttributes: matches,
            basedOnItem: fav
          });
          break; // Avoid duplicate recommendation for the same candidate
        }
      }
    }
    basedOnLiked.sort((a, b) => b.score - a.score);

    // B. Recommendations by favorite genres
    const topGenreNames = tasteProfile.topGenres.slice(0, 3).map(g => g.genre.toLowerCase());
    const genreFavorites: RecommendationReason[] = [];

    for (const candidate of candidates) {
      const candGenres = candidate.genre.toLowerCase();
      const matchedTopGenre = topGenreNames.find(tg => candGenres.includes(tg));

      if (matchedTopGenre) {
        genreFavorites.push({
          item: candidate,
          score: Math.round(candidate.rating_global * 10),
          reason: `Destacado en tu género más valorado: ${matchedTopGenre}`,
          matchedAttributes: [matchedTopGenre, ...candidate.tags.slice(0, 2)]
        });
      }
    }
    genreFavorites.sort((a, b) => b.score - a.score);

    // C. Critics Picks / Universally Acclaimed
    const criticsPicks: RecommendationReason[] = candidates
      .map(item => ({
        item,
        score: Math.round(item.rating_global * 10),
        reason: `Obra maestra aclamada por la crítica global (${item.rating_global}/10 ⭐)`,
        matchedAttributes: item.tags.slice(0, 3)
      }))
      .sort((a, b) => b.score - a.score);

    return {
      basedOnLiked: basedOnLiked.slice(0, 6),
      genreFavorites: genreFavorites.slice(0, 6),
      criticsPicks: criticsPicks.slice(0, 8),
      tasteProfile
    };
  },

  // 3. Pick random suggestion
  getRandomPick(library: LibraryItem[], mediaType?: MediaType | 'all'): CatalogItem | null {
    const userTitles = new Set(library.map(i => i.title.toLowerCase().trim()));
    const unconsumed = MASTER_CATALOG.filter(c => {
      if (userTitles.has(c.title.toLowerCase().trim())) return false;
      if (mediaType && mediaType !== 'all' && c.media_type !== mediaType) return false;
      return true;
    });

    if (unconsumed.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * unconsumed.length);
    return unconsumed[randomIndex];
  }
};
