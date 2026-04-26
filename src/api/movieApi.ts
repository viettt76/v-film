import { ophimClient, kkphimClient } from './client';
import type {
  CountryItem,
  EpisodeServer,
  GenreItem,
  Movie,
  MovieListItem,
  Pagination,
} from '@/types/movie';
import { MovieType, MovieSource } from '@/types/movie';

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildThumbUrl(thumbUrl: string, source: MovieSource): string {
  if (!thumbUrl) return '';
  if (thumbUrl.startsWith('http')) return thumbUrl;
  
  const base = source === MovieSource.OPHIM 
    ? import.meta.env.VITE_OPHIM_IMAGE_BASE 
    : import.meta.env.VITE_KKPHIM_IMAGE_BASE;
    
  return `${base}${thumbUrl}`;
}

function mapMovieType(raw: string): MovieType {
  const type = raw?.toLowerCase() ?? '';
  return type.includes('series') || type.includes('tập') ? MovieType.SERIES : MovieType.SINGLE;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapListItem(item: any, source: MovieSource): MovieListItem {
  return {
    _id: item._id,
    name: item.name,
    originName: item.origin_name ?? item.originName ?? '',
    slug: item.slug,
    thumbUrl: buildThumbUrl(item.thumb_url ?? item.thumbUrl ?? '', source),
    posterUrl: item.poster_url ? buildThumbUrl(item.poster_url, source) : undefined,
    type: mapMovieType(item.type ?? item.tmdb?.type ?? (item.time?.includes('Tập') ? 'series' : 'movie')),
    year: item.year ?? 0,
    quality: item.quality ?? '',
    lang: item.lang ?? '',
    currentEpisode: item.episode_current,
    totalEpisodes: item.episode_total,
    source,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMovie(raw: any, source: MovieSource): Movie {
  return {
    _id: raw._id,
    name: raw.name,
    originName: raw.origin_name ?? '',
    slug: raw.slug,
    thumbUrl: buildThumbUrl(raw.thumb_url ?? '', source),
    posterUrl: buildThumbUrl(raw.poster_url ?? '', source),
    type: mapMovieType(raw.type ?? raw.tmdb?.type ?? 'movie'),
    year: raw.year ?? 0,
    status: raw.status ?? '',
    content: raw.content ?? '',
    time: raw.time ?? '',
    quality: raw.quality ?? '',
    lang: raw.lang ?? '',
    actor: raw.actor ?? [],
    director: raw.director ?? [],
    category: (raw.category ?? []).map((c: { id: string; name: string; slug: string }) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    })),
    country: (raw.country ?? []).map((c: { id: string; name: string; slug: string }) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    })),
    tmdb: raw.tmdb ?? { type: '', vote_average: 0, vote_count: 0 },
    trailerUrl: raw.trailer_url ?? '',
    currentEpisode: raw.episode_current,
    totalEpisodes: raw.episode_total,
    chieurap: raw.chieurap ?? false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEpisodes(raw: any[]): EpisodeServer[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((server) => ({
    serverName: server.server_name ?? server.serverName ?? '',
    serverData: (server.server_data ?? server.serverData ?? []).map(
      (ep: { name: string; slug: string; filename: string; link_embed: string; link_m3u8: string }) => ({
        name: ep.name,
        slug: ep.slug,
        filename: ep.filename ?? '',
        linkEmbed: ep.link_embed ?? '',
        linkM3u8: ep.link_m3u8 ?? '',
      }),
    ),
  }));
}

// ─── API Functions ──────────────────────────────────────────────────────────

export async function getNewlyUpdated(
  page = 1, 
  source: MovieSource = MovieSource.OPHIM
): Promise<{ items: MovieListItem[]; pagination: Pagination }> {
  const client = source === MovieSource.OPHIM ? ophimClient : kkphimClient;
  const endpoint = source === MovieSource.OPHIM 
    ? 'danh-sach/phim-moi-cap-nhat' 
    : 'danh-sach/phim-moi-cap-nhat-v3';

  try {
    console.log(`[API] Fetching newly updated: source=${source}, page=${page}`);
    const data = await client
      .get(endpoint, { searchParams: { page } })
      .json<{ items: unknown[]; paginate: { current_page: number; total_page: number; total_items: number; items_per_page: number } }>();

    console.log(`[API] Newly updated data keys:`, Object.keys(data));
    const items = (data as any).items || (data as any).data?.items || [];
    console.log(`[API] Found ${items.length} items`);

    const rawPagination = (data as any).pagination || (data as any).paginate || (data as any).params?.pagination || (data as any).data?.params?.pagination;

    return {
      items: items.map((i: any) => mapListItem(i, source)),
      pagination: {
        currentPage: rawPagination?.currentPage || rawPagination?.current_page || page,
        totalPages: rawPagination?.totalPages || rawPagination?.total_page || 1,
        totalItems: rawPagination?.totalItems || rawPagination?.total_items || 0,
        totalItemsPerPage: rawPagination?.totalItemsPerPage || rawPagination?.items_per_page || 24,
      },
    };
  } catch (error) {
    console.error(`[API] Error fetching newly updated:`, error);
    return {
      items: [],
      pagination: { currentPage: page, totalPages: 1, totalItems: 0, totalItemsPerPage: 24 },
    };
  }
}

export async function getMoviesByGenre(
  genre: string,
  page = 1,
  source: MovieSource = MovieSource.OPHIM
): Promise<{ items: MovieListItem[]; pagination: Pagination; titlePage: string }> {
  const client = source === MovieSource.OPHIM ? ophimClient : kkphimClient;
  const data = await client
    .get(`v1/api/the-loai/${genre}`, { searchParams: { page } })
    .json<{ status: string; data: { items: unknown[]; params: { pagination: { totalItems: number; totalItemsPerPage: number; currentPage: number; totalPages: number }; filterCategory: { name: string }[] } } }>();

  const inner = data.data;
  const rawPagination = (inner as any).params?.pagination || (inner as any).pagination;

  return {
    items: (inner.items ?? []).map(i => mapListItem(i, source)),
    pagination: {
      currentPage: rawPagination?.currentPage || page,
      totalPages: rawPagination?.totalPages || 1,
      totalItems: rawPagination?.totalItems || 0,
      totalItemsPerPage: rawPagination?.totalItemsPerPage || 24,
    },
    titlePage: (inner as any).params?.filterCategory?.[0]?.name ?? (inner as any).titlePage ?? genre,
  };
}

export async function getMoviesByCountry(
  country: string,
  page = 1,
  source: MovieSource = MovieSource.OPHIM
): Promise<{ items: MovieListItem[]; pagination: Pagination; titlePage: string }> {
  const client = source === MovieSource.OPHIM ? ophimClient : kkphimClient;
  const data = await client
    .get(`v1/api/quoc-gia/${country}`, { searchParams: { page } })
    .json<{ status: string; data: { items: unknown[]; params: { pagination: { totalItems: number; totalItemsPerPage: number; currentPage: number; totalPages: number }; filterCountry: { name: string }[] } } }>();

  const inner = data.data;
  const rawPagination = (inner as any).params?.pagination || (inner as any).pagination;

  return {
    items: (inner.items ?? []).map(i => mapListItem(i, source)),
    pagination: {
      currentPage: rawPagination?.currentPage || page,
      totalPages: rawPagination?.totalPages || 1,
      totalItems: rawPagination?.totalItems || 0,
      totalItemsPerPage: rawPagination?.totalItemsPerPage || 24,
    },
    titlePage: (inner as any).params?.filterCountry?.[0]?.name ?? (inner as any).titlePage ?? country,
  };
}

/**
 * Concurrent Search from both sources
 */
export async function searchMovies(
  keyword: string,
  page = 1,
): Promise<{ items: MovieListItem[]; pagination: Pagination }> {
  console.log(`[API] Searching: keyword="${keyword}", page=${page}`);
  
  // Fetch from both sources in parallel
  const [ophimRes, kkphimRes] = await Promise.allSettled([
    ophimClient.get('v1/api/tim-kiem', { searchParams: { keyword, page } }).json<any>(),
    kkphimClient.get('v1/api/tim-kiem', { searchParams: { keyword, page } }).json<any>(),
  ]);

  const items: MovieListItem[] = [];
  let totalItems = 0;
  let totalPages = 1;

  if (ophimRes.status === 'fulfilled') {
    const data = ophimRes.value.data;
    console.log(`[API] OPhim search success: ${data.items?.length ?? 0} items`);
    items.push(...(data.items ?? []).map((i: any) => mapListItem(i, MovieSource.OPHIM)));
    
    // Check where pagination info is
    const pagination = data.pagination ?? data.params?.pagination;
    if (pagination) {
      totalItems += pagination.totalItems || 0;
      totalPages = Math.max(totalPages, pagination.totalPages || 1);
    }
  } else {
    console.error(`[API] OPhim search failed:`, ophimRes.reason);
  }

  if (kkphimRes.status === 'fulfilled') {
    const data = kkphimRes.value.data;
    console.log(`[API] KKPhim search success: ${data.items?.length ?? 0} items`);
    items.push(...(data.items ?? []).map((i: any) => mapListItem(i, MovieSource.KKPHIM)));
    
    const pagination = data.pagination ?? data.params?.pagination;
    if (pagination) {
      totalItems += pagination.totalItems || 0;
      totalPages = Math.max(totalPages, pagination.totalPages || 1);
    }
  } else {
    console.error(`[API] KKPhim search failed:`, kkphimRes.reason);
  }

  // Deduplicate by name if slug matches (heuristic)
  const seen = new Set<string>();
  const uniqueItems = items.filter(item => {
    const key = `${item.slug}-${item.name.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    items: uniqueItems,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      totalItemsPerPage: 24, // Combined is more, but we keep it simple
    },
  };
}

export async function getMovieDetailBySlug(
  slug: string, 
  source: MovieSource = MovieSource.OPHIM
): Promise<{ movie: Movie; episodes: EpisodeServer[] }> {
  const client = source === MovieSource.OPHIM ? ophimClient : kkphimClient;
  const data = await client
    .get(`phim/${slug}`)
    .json<{ movie: unknown; episodes: unknown[] }>();

  return {
    movie: mapMovie(data.movie, source),
    episodes: mapEpisodes(data.episodes),
  };
}

export async function getMovieDetailById(
  id: string, 
  source: MovieSource = MovieSource.OPHIM
): Promise<{ movie: Movie; episodes: EpisodeServer[] }> {
  const client = source === MovieSource.OPHIM ? ophimClient : kkphimClient;
  const data = await client
    .get(`phim/id/${id}`)
    .json<{ movie: unknown; episodes: unknown[] }>();

  return {
    movie: mapMovie(data.movie, source),
    episodes: mapEpisodes(data.episodes),
  };
}

export async function getGenreList(source: MovieSource = MovieSource.OPHIM): Promise<GenreItem[]> {
  const client = source === MovieSource.OPHIM ? ophimClient : kkphimClient;
  const endpoint = source === MovieSource.OPHIM ? 'v1/api/the-loai' : 'the-loai';
  const data = await client.get(endpoint).json<any>();
  
  const rawItems = source === MovieSource.OPHIM ? data.data.items : data;
  return (rawItems ?? []).map((g: any) => ({ _id: g._id, name: g.name, slug: g.slug }));
}

export async function getCountryList(source: MovieSource = MovieSource.OPHIM): Promise<CountryItem[]> {
  const client = source === MovieSource.OPHIM ? ophimClient : kkphimClient;
  const endpoint = source === MovieSource.OPHIM ? 'v1/api/quoc-gia' : 'quoc-gia';
  const data = await client.get(endpoint).json<any>();
  
  const rawItems = source === MovieSource.OPHIM ? data.data.items : data;
  return (rawItems ?? []).map((c: any) => ({ _id: c._id, name: c.name, slug: c.slug }));
}
