import React, { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Check } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { MovieListItem } from '@/types/movie';
import { MovieType } from '@/types/movie';
import { getMovieDetailById } from '@/api/movieApi';
import { movieKeys, STALE } from '@/api/queryKeys';
import { toggleFavorite, isFavorite } from '@/hooks/useFavorites';
import { Badge } from '@/components/ui/Badge';
import styles from './MovieCard.module.css';

interface MovieCardProps {
  movie: MovieListItem;
  isEdge?: 'first' | 'last' | 'none';
}

export function MovieCard({ movie, isEdge = 'none' }: MovieCardProps) {
  const [hovered, setHovered] = useState(false);
  const [fav, setFav] = useState(() => isFavorite(movie.slug));
  const [imgError, setImgError] = useState(false);
  const hoverTimeout = useRef<any>(null);

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => {
      setHovered(true);
    }, 500); // 500ms delay for premium feel
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setHovered(false);
  };

  const watchUrl = movie.type === MovieType.SERIES
    ? `/phim/${movie.source}/${movie.slug}/1`
    : `/phim/${movie.source}/${movie.slug}`;

  // Fetch detail only on hover
  const { data: detail } = useQuery({
    queryKey: movieKeys.detailById(movie.source, movie._id),
    queryFn: () => getMovieDetailById(movie._id, movie.source),
    enabled: hovered,
    staleTime: STALE.detail,
  });

  const handleFav = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleFavorite(movie);
    setFav(result === 'added');
    toast[result === 'added' ? 'success' : 'error'](
      result === 'added' ? 'Đã thêm vào yêu thích' : 'Đã xoá khỏi yêu thích',
      { duration: 2000 }
    );
  }, [movie]);

  return (
    <div
      className={styles.card}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail */}
      <Link to={watchUrl} className={styles.thumbWrap} tabIndex={-1} aria-label={movie.name}>
        <img
          src={imgError ? '/placeholder.svg' : movie.thumbUrl}
          alt={movie.name}
          className={styles.thumb}
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <div className={styles.overlay} aria-hidden="true" />

        {/* Badges */}
        <div className={styles.badges}>
          {movie.quality && (
            <Badge variant="quality" size="sm">{movie.quality}</Badge>
          )}
          {movie.type === MovieType.SERIES && movie.currentEpisode && (
            <Badge variant="default" size="sm">Tập {movie.currentEpisode}</Badge>
          )}
        </div>

        {/* Play button always visible on mobile */}
        <div className={styles.playOverlay} aria-hidden="true">
          <Play size={28} weight="fill" />
        </div>
      </Link>

      {/* Info below */}
      <div className={styles.info}>
        <Link to={watchUrl} className={styles.name} title={movie.name}>
          <span className="line-clamp-2">{movie.name}</span>
        </Link>
        <span className={styles.meta}>{movie.year}</span>
      </div>

      {/* Hover Preview Card */}
      {hovered && (
        <div
          className={`${styles.preview} ${isEdge === 'first' ? styles.previewRight : isEdge === 'last' ? styles.previewLeft : styles.previewCenter}`}
          onMouseEnter={() => {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
            setHovered(true);
          }}
        >
          {/* Poster */}
          <div className={styles.previewPoster}>
            <img
              src={detail?.movie.posterUrl || movie.thumbUrl}
              alt={movie.name}
              className={styles.previewImg}
            />
            <div className={styles.previewGradient} aria-hidden="true" />
            <div className={styles.previewActions}>
              <Link
                to={watchUrl}
                className={styles.previewPlayBtn}
                aria-label={`Xem ${movie.name}`}
              >
                <Play size={20} weight="fill" />
                Xem ngay
              </Link>
              <button
                className={`${styles.previewIconBtn} ${fav ? styles.favActive : ''}`}
                onClick={handleFav}
                aria-label={fav ? 'Xoá khỏi yêu thích' : 'Thêm vào yêu thích'}
              >
                {fav ? <Check size={18} weight="bold" /> : <Plus size={18} weight="bold" />}
              </button>
            </div>
          </div>

          {/* Detail info */}
          <div className={styles.previewInfo}>
            <div className={styles.previewTitle}>{movie.name}</div>
            {detail?.movie && (
              <>
                <div className={styles.previewMeta}>
                  {detail.movie.tmdb.vote_average > 0 && (
                    <span className={styles.imdb}>★ {detail.movie.tmdb.vote_average.toFixed(1)}</span>
                  )}
                  <span>{detail.movie.year}</span>
                  <span>{detail.movie.time}</span>
                  <span>{detail.movie.quality}</span>
                </div>
                {detail.movie.category.length > 0 && (
                  <div className={styles.previewGenres}>
                    {detail.movie.category.slice(0, 3).map((c) => c.name).join(' · ')}
                  </div>
                )}
                {detail.movie.content && (
                  <p
                    className={`${styles.previewDesc} line-clamp-3`}
                    dangerouslySetInnerHTML={{ __html: detail.movie.content }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
