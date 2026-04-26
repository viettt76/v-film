import type { WatchHistoryEntry } from '@/types/movie';
import { MovieType } from '@/types/movie';

const HISTORY_KEY = 'v_watchHistory';

function getAll(): Record<string, WatchHistoryEntry> {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, WatchHistoryEntry>): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(data));
}

export function getWatchHistory(): WatchHistoryEntry[] {
  const all = getAll();
  return Object.values(all).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getMovieHistory(slug: string): WatchHistoryEntry | null {
  return getAll()[slug] ?? null;
}

export function updateWatchProgress(
  entry: Omit<WatchHistoryEntry, 'updatedAt'> & { currentTime: number; duration?: number },
): void {
  const all = getAll();
  const existing = all[entry.slug] ?? { ...entry, updatedAt: Date.now() };

  if (entry.type === MovieType.SINGLE) {
    all[entry.slug] = {
      ...existing,
      slug: entry.slug,
      name: entry.name,
      thumbUrl: entry.thumbUrl,
      type: entry.type,
      updatedAt: Date.now(),
      progress: entry.currentTime,
      duration: entry.duration,
    };
  } else {
    const ep = entry.currentEpisode ?? 1;
    all[entry.slug] = {
      ...existing,
      slug: entry.slug,
      name: entry.name,
      thumbUrl: entry.thumbUrl,
      type: entry.type,
      updatedAt: Date.now(),
      currentEpisode: ep,
      episodes: {
        ...existing.episodes,
        [ep]: { progress: entry.currentTime, duration: entry.duration },
      },
    };
  }

  saveAll(all);
}

export function clearMovieHistory(slug: string, episode?: number): void {
  const all = getAll();
  if (!all[slug]) return;

  if (episode !== undefined && all[slug].episodes) {
    delete all[slug].episodes![episode];
    all[slug].updatedAt = Date.now();
  } else {
    delete all[slug];
  }
  saveAll(all);
}
