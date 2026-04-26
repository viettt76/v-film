import type { MovieListItem } from '@/types/movie';
import { MovieCard } from '../MovieCard/MovieCard';
import { MovieCardSkeleton } from '@/components/ui/Skeleton';
import styles from './MovieGrid.module.css';

interface MovieGridProps {
  movies: MovieListItem[];
  isLoading?: boolean;
  skeletonCount?: number;
  emptyMessage?: string;
}

export function MovieGrid({
  movies,
  isLoading,
  skeletonCount = 24,
  emptyMessage = 'Không tìm thấy phim nào',
}: MovieGridProps) {
  if (!isLoading && movies.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>🎬</span>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {isLoading
        ? Array.from({ length: skeletonCount }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))
        : movies.map((m, idx) => (
            <MovieCard
              key={m._id}
              movie={m}
              isEdge={idx % 4 === 0 ? 'first' : (idx + 1) % 4 === 0 ? 'last' : 'none'}
            />
          ))}
    </div>
  );
}
