export const movieKeys = {
  all: ['movies'] as const,
  newlyUpdated: (source: string, page: number) => [...movieKeys.all, 'newlyUpdated', source, page] as const,
  byGenre: (source: string, genre: string, page: number) => [...movieKeys.all, 'genre', source, genre, page] as const,
  byCountry: (source: string, country: string, page: number) => [...movieKeys.all, 'country', source, country, page] as const,
  search: (keyword: string, page: number) => [...movieKeys.all, 'search', keyword, page] as const,
  detail: (source: string, slug: string) => [...movieKeys.all, 'detail', source, slug] as const,
  detailById: (source: string, id: string) => [...movieKeys.all, 'detailById', source, id] as const,
  genres: (source: string) => [...movieKeys.all, 'genres', source] as const,
  countries: (source: string) => [...movieKeys.all, 'countries', source] as const,
};

export const STALE = {
  list: 5 * 60 * 1000,        // 5 min
  detail: 10 * 60 * 1000,     // 10 min
  meta: 30 * 60 * 1000,       // 30 min (genres, countries)
};
