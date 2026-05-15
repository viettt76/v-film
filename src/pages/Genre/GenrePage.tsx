import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMoviesByGenre } from '@/api/movieApi';
import { movieKeys, STALE } from '@/api/queryKeys';
import { MovieSource } from '@/types/movie';
import { MovieGrid } from '@/components/movie/MovieGrid/MovieGrid';
import { Pagination } from '@/components/ui/Pagination';
import { Tag } from '@phosphor-icons/react';
import { Helmet } from 'react-helmet-async';
import styles from './ListPage.module.css';

export function GenrePage() {
  const { genre } = useParams<{ genre: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Number(searchParams.get('page')) || 1;

  const { data, isLoading } = useQuery({
    queryKey: movieKeys.byGenre(MovieSource.OPHIM, genre ?? '', page),
    queryFn: () => getMoviesByGenre(genre!, page, MovieSource.OPHIM),
    enabled: !!genre,
    staleTime: STALE.list,
  });

  const onPageChange = (p: number) => {
    navigate(`/the-loai/${genre}?page=${p}`);
  };

  return (
    <div className={styles.page}>
      <Helmet>
        <title>{data?.titlePage ?? (genre ? `Thể loại: ${genre}` : 'Thể loại')}</title>
      </Helmet>
      <div className={styles.header}>
        <Tag size={22} className={styles.icon} />
        <h1 className={styles.title}>{data?.titlePage ?? genre}</h1>
      </div>
      <MovieGrid movies={data?.items ?? []} isLoading={isLoading} />
      {data && (
        <Pagination
          currentPage={page}
          totalPages={data.pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
