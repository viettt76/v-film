import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMoviesByCountry } from '@/api/movieApi';
import { movieKeys, STALE } from '@/api/queryKeys';
import { MovieSource } from '@/types/movie';
import { MovieGrid } from '@/components/movie/MovieGrid/MovieGrid';
import { Pagination } from '@/components/ui/Pagination';
import { Globe } from '@phosphor-icons/react';
import styles from '../Genre/ListPage.module.css';

export function CountryPage() {
  const { country } = useParams<{ country: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Number(searchParams.get('page')) || 1;

  const { data, isLoading } = useQuery({
    queryKey: movieKeys.byCountry(MovieSource.OPHIM, country ?? '', page),
    queryFn: () => getMoviesByCountry(country!, page, MovieSource.OPHIM),
    enabled: !!country,
    staleTime: STALE.list,
  });

  const onPageChange = (p: number) => {
    navigate(`/quoc-gia/${country}?page=${p}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Globe size={22} className={styles.icon} />
        <h1 className={styles.title}>{data?.titlePage ?? country}</h1>
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
