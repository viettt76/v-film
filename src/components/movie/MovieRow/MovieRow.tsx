import type { MovieListItem } from '@/types/movie';
import { MovieCard } from '../MovieCard/MovieCard';
import { MovieCardSkeleton } from '@/components/ui/Skeleton';
import styles from './MovieRow.module.css';
import { ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

interface MovieRowProps {
  title: string;
  movies: MovieListItem[];
  isLoading?: boolean;
  viewAllHref?: string;
  skeletonCount?: number;
}

export function MovieRow({
  title,
  movies,
  isLoading,
  viewAllHref,
  skeletonCount = 6,
}: MovieRowProps) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {viewAllHref && (
          <Link to={viewAllHref} className={styles.viewAll}>
            Xem thêm <ArrowRight size={14} weight="bold" />
          </Link>
        )}
      </div>

      <div className={styles.grid}>
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))
          : movies.map((m, idx) => (
              <MovieCard
                key={m._id}
                movie={m}
                isEdge={idx === 0 ? 'first' : idx === movies.length - 1 ? 'last' : 'none'}
              />
            ))}
      </div>
    </section>
  );
}
