export enum MovieSource {
  OPHIM = 'ophim',
  KKPHIM = 'kkphim',
}

export enum MovieType {
  SINGLE = 'movie',
  SERIES = 'series',
}

export interface MovieListItem {
  _id: string;
  name: string;
  originName: string;
  slug: string;
  thumbUrl: string;
  posterUrl?: string;
  type: MovieType;
  year: number;
  quality: string;
  lang: string;
  currentEpisode?: string;
  totalEpisodes?: string;
  source: MovieSource;
}

export interface MovieCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Movie {
  _id: string;
  name: string;
  originName: string;
  slug: string;
  thumbUrl: string;
  posterUrl: string;
  type: MovieType;
  year: number;
  status: string;
  content: string;
  time: string;
  quality: string;
  lang: string;
  actor: string[];
  director: string[];
  category: MovieCategory[];
  country: MovieCategory[];
  tmdb: {
    type: string;
    vote_average: number;
    vote_count: number;
  };
  trailerUrl: string;
  currentEpisode?: string;
  totalEpisodes?: string;
  chieurap?: boolean;
}

export interface EpisodeData {
  name: string;
  slug: string;
  filename: string;
  linkEmbed: string;
  linkM3u8: string;
}

export interface EpisodeServer {
  serverName: string;
  serverData: EpisodeData[];
}

export interface MovieDetail {
  movie: Movie;
  episodes: EpisodeServer[];
}

export interface Pagination {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface MovieListResponse {
  items: MovieListItem[];
  pagination: Pagination;
  titlePage?: string;
}

export interface GenreItem {
  _id: string;
  name: string;
  slug: string;
}

export interface CountryItem {
  _id: string;
  name: string;
  slug: string;
}

// Watch History
export interface WatchHistoryEntry {
  slug: string;
  name: string;
  thumbUrl: string;
  type: MovieType;
  updatedAt: number;
  progress?: number;
  duration?: number;
  currentEpisode?: number;
  episodes?: Record<number, { progress: number; duration?: number }>;
}

// Favorites
export interface FavoriteEntry {
  _id: string;
  slug: string;
  name: string;
  thumbUrl: string;
  type: MovieType;
  year?: number;
  quality?: string;
  addedAt: number;
}
