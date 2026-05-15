import { useQuery } from '@tanstack/react-query';
import { getNewlyUpdated, getMoviesByGenre, getGenreList } from '@/api/movieApi';
import { movieKeys, STALE } from '@/api/queryKeys';
import { MovieRow } from '@/components/movie/MovieRow/MovieRow';
import { MovieRowSkeleton } from '@/components/ui/Skeleton';
import { Helmet } from 'react-helmet-async';
import styles from './HomePage.module.css';

import { MovieSource } from '@/types/movie';

const GENRE_ROWS = ['hanh-dong', 'tinh-cam', 'hoat-hinh'];

export function HomePage() {
  const { data: newMovies, isLoading: loadingNew } = useQuery({
    queryKey: movieKeys.newlyUpdated(MovieSource.OPHIM, 1),
    queryFn: () => getNewlyUpdated(1, MovieSource.OPHIM),
    staleTime: STALE.list,
  });

  const { data: kkNew, isLoading: loadingKK } = useQuery({
    queryKey: movieKeys.newlyUpdated(MovieSource.KKPHIM, 1),
    queryFn: () => getNewlyUpdated(1, MovieSource.KKPHIM),
    staleTime: STALE.list,
  });

  const { data: genreList } = useQuery({
    queryKey: movieKeys.genres(MovieSource.OPHIM),
    queryFn: () => getGenreList(MovieSource.OPHIM),
    staleTime: STALE.meta,
  });

  // Fetch top 3 genres
  const genreSlugs = genreList
    ? genreList.slice(0, 4).map((g) => g.slug)
    : GENRE_ROWS;

  const g0 = useQuery({
    queryKey: movieKeys.byGenre(MovieSource.OPHIM, genreSlugs[0] ?? '', 1),
    queryFn: () => getMoviesByGenre(genreSlugs[0], 1, MovieSource.OPHIM),
    enabled: !!genreSlugs[0],
    staleTime: STALE.list,
  });
  const g1 = useQuery({
    queryKey: movieKeys.byGenre(MovieSource.OPHIM, genreSlugs[1] ?? '', 1),
    queryFn: () => getMoviesByGenre(genreSlugs[1], 1, MovieSource.OPHIM),
    enabled: !!genreSlugs[1],
    staleTime: STALE.list,
  });
  const g2 = useQuery({
    queryKey: movieKeys.byGenre(MovieSource.OPHIM, genreSlugs[2] ?? '', 1),
    queryFn: () => getMoviesByGenre(genreSlugs[2], 1, MovieSource.OPHIM),
    enabled: !!genreSlugs[2],
    staleTime: STALE.list,
  });
  const g3 = useQuery({
    queryKey: movieKeys.byGenre(MovieSource.OPHIM, genreSlugs[3] ?? '', 1),
    queryFn: () => getMoviesByGenre(genreSlugs[3], 1, MovieSource.OPHIM),
    enabled: !!genreSlugs[3],
    staleTime: STALE.list,
  });

  const genreRows = [g0, g1, g2, g3];

  return (
    <div className={styles.page}>
      <Helmet>
        <title>V-Film - Xem phim trực tuyến miễn phí</title>
        <meta name="description" content="Trang web xem phim trực tuyến miễn phí, cập nhật phim mới nhất từ OPhim và KKPhim." />
      </Helmet>
      <div className={styles.content}>
        {/* Newly updated OPhim */}
        {loadingNew ? (
          <MovieRowSkeleton count={7} />
        ) : (
          <MovieRow
            title="Phim Mới OPhim"
            movies={newMovies?.items ?? []}
            viewAllHref="/tim-kiem"
          />
        )}

        {/* Newly updated KKPhim */}
        {loadingKK ? (
          <MovieRowSkeleton count={7} />
        ) : (
          <MovieRow
            title="Phim Mới KKPhim"
            movies={kkNew?.items ?? []}
            viewAllHref="/tim-kiem"
          />
        )}

        {/* Genre rows */}
        {genreRows.map((q, i) => {
          if (!genreSlugs[i]) return null;
          if (q.isLoading) return <MovieRowSkeleton key={i} count={7} />;
          if (!q.data) return null;
          return (
            <MovieRow
              key={genreSlugs[i]}
              title={q.data.titlePage || genreSlugs[i]}
              movies={q.data.items.slice(0, 14)}
              viewAllHref={`/the-loai/${genreSlugs[i]}`}
            />
          );
        })}
      </div>
    </div>
  );
}
