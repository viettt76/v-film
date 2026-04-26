import type { FavoriteEntry, MovieListItem } from '@/types/movie';

const FAV_KEY = 'v_favorites';

function getAll(): FavoriteEntry[] {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function getFavorites(): FavoriteEntry[] {
  return getAll().sort((a, b) => b.addedAt - a.addedAt);
}

export function isFavorite(slug: string): boolean {
  return getAll().some((f) => f.slug === slug);
}

export function addFavorite(movie: MovieListItem): boolean {
  const all = getAll();
  if (all.some((f) => f.slug === movie.slug)) return false; // already exists
  all.push({
    _id: movie._id,
    slug: movie.slug,
    name: movie.name,
    thumbUrl: movie.thumbUrl,
    type: movie.type,
    year: movie.year,
    quality: movie.quality,
    addedAt: Date.now(),
  });
  localStorage.setItem(FAV_KEY, JSON.stringify(all));
  return true;
}

export function removeFavorite(slug: string): void {
  const all = getAll().filter((f) => f.slug !== slug);
  localStorage.setItem(FAV_KEY, JSON.stringify(all));
}

export function toggleFavorite(movie: MovieListItem): 'added' | 'removed' {
  if (isFavorite(movie.slug)) {
    removeFavorite(movie.slug);
    return 'removed';
  }
  addFavorite(movie);
  return 'added';
}
