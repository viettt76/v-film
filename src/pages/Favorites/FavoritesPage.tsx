import { useState, useEffect } from 'react';
import { Heart } from '@phosphor-icons/react';
import { getFavorites } from '@/hooks/useFavorites';
import { MovieGrid } from '@/components/movie/MovieGrid/MovieGrid';
import type { FavoriteEntry } from '@/types/movie';
import styles from '../Search/SearchPage.module.css';

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Heart size={22} weight="fill" className={styles.icon} />
        <h1 className={styles.title}>Phim đã yêu thích</h1>
      </div>

      <MovieGrid
        movies={favorites as any}
        emptyMessage="Bạn chưa có phim yêu thích nào. Hãy nhấn vào biểu tượng trái tim ở phim bạn thích!"
      />
    </div>
  );
}
