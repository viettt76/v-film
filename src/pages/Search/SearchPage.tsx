import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchMovies } from '@/api/movieApi';
import { movieKeys, STALE } from '@/api/queryKeys';
import { MovieGrid } from '@/components/movie/MovieGrid/MovieGrid';
import { Pagination } from '@/components/ui/Pagination';
import { MagnifyingGlass } from '@phosphor-icons/react';
import styles from './SearchPage.module.css';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get('keyword') ?? '';
  const page = Number(searchParams.get('page')) || 1;

  const { data, isLoading } = useQuery({
    queryKey: movieKeys.search(keyword, page),
    queryFn: () => searchMovies(keyword, page),
    enabled: keyword.trim().length > 0,
    staleTime: STALE.list,
  });

  const onPageChange = (p: number) => {
    navigate(`/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${p}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <MagnifyingGlass size={22} className={styles.icon} />
        <div>
          <h1 className={styles.title}>
            {keyword ? `Kết quả cho "${keyword}"` : 'Tìm kiếm phim'}
          </h1>
          {data && (
            <p className={styles.count}>{data.pagination.totalItems.toLocaleString()} kết quả</p>
          )}
        </div>
      </div>

      <MovieGrid
        movies={data?.items ?? []}
        isLoading={isLoading && keyword.length > 0}
        emptyMessage={keyword ? `Không tìm thấy phim nào cho "${keyword}"` : 'Nhập từ khoá để tìm kiếm'}
      />

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
