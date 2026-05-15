import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { lazy, Suspense, useCallback } from 'react';
import { searchMovies, getMovieDetailBySlug } from '@/api/movieApi';
import { movieKeys, STALE } from '@/api/queryKeys';
import { MovieType } from '@/types/movie';
import { updateWatchProgress, getMovieHistory } from '@/hooks/useWatchHistory';
import { Badge } from '@/components/ui/Badge';
import { Star, Clock, Calendar, Globe, Tag, ArrowsLeftRight } from '@phosphor-icons/react';
import { Helmet } from 'react-helmet-async';
import styles from './WatchPage.module.css';
import { useState, useEffect } from 'react';

// Helper to extract base title (e.g. "John Wick 4" -> "John Wick")
function getBaseTitle(title: string): string {
  return title
    .split(/:|-| phần | chapter | \d+$/i)[0]
    .trim();
}

const VideoPlayer = lazy(() =>
  import('@/components/player/VideoPlayer').then((m) => ({ default: m.VideoPlayer })),
);

export function WatchMoviePage() {
  const { source, slug } = useParams<{ source: string; slug: string }>();
  const history = slug ? getMovieHistory(slug) : null;
  const initialTime = history?.progress ?? 0;

  const { data, isLoading, error } = useQuery({
    queryKey: movieKeys.detail(source ?? 'ophim', slug ?? ''),
    queryFn: () => getMovieDetailBySlug(slug!, source as any),
    enabled: !!slug && !!source,
    staleTime: STALE.detail,
  });

  const [sequels, setSequels] = useState<any[]>([]);

  useEffect(() => {
    if (data?.movie.name) {
      const baseTitle = getBaseTitle(data.movie.name);
      if (baseTitle.length > 2) {
        searchMovies(baseTitle, 1).then(res => {
          const filtered = res.items.filter(item => 
            item.slug !== slug && 
            (item.name.toLowerCase().includes('phần') || 
            item.name.toLowerCase().includes('chapter') || 
            /\d+$/.test(item.name))
          );
          setSequels(filtered);
        });
      }
    }
  }, [data?.movie.name, slug]);

  const handleTimeUpdate = useCallback(
    (currentTime: number, duration: number) => {
      if (!slug || !data) return;
      updateWatchProgress({
        slug,
        name: data.movie.name,
        thumbUrl: data.movie.thumbUrl,
        type: MovieType.SINGLE,
        currentTime,
        duration,
      });
    },
    [slug, data],
  );

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.playerSkeleton + ' skeleton'} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p>Không tìm thấy phim này.</p>
          <Link to="/" className={styles.backBtn}>← Về trang chủ</Link>
        </div>
      </div>
    );
  }

  const { movie, episodes } = data;

  const sources = episodes.flatMap((server) =>
    server.serverData
      .filter((ep) => ep.linkM3u8)
      .map((ep) => ({ m3u8: ep.linkM3u8, serverName: server.serverName })),
  );

  return (
    <div className={styles.page}>
      <Helmet>
        <title>{movie.name}</title>
        <meta name="description" content={movie.content?.replace(/<[^>]*>/g, '').slice(0, 160)} />
      </Helmet>

      <div className={styles.inner}>
        {/* Player */}
        <div className={styles.playerWrap}>
          <Suspense fallback={<div className={`${styles.playerSkeleton} skeleton`} />}>
            {sources.length > 0 ? (
              <VideoPlayer
                sources={sources}
                poster={movie.posterUrl}
                title={movie.name}
                initialTime={initialTime}
                onTimeUpdate={handleTimeUpdate}
              />
            ) : (
              <div className={styles.noSource}>Không có nguồn phim</div>
            )}
          </Suspense>
        </div>

        {/* Movie info */}
        <div className={styles.info}>
          <h1 className={styles.title}>{movie.name}</h1>
          
          {sequels.length > 0 && (
            <div className={styles.sequelSection}>
              <div className={styles.sequelLabel}>
                <ArrowsLeftRight size={16} weight="bold" />
                Các phần phim khác:
              </div>
              <div className={styles.sequelList}>
                {sequels.map((s) => (
                  <Link 
                    key={s._id} 
                    to={`/phim/${s.source}/${s.slug}${s.type === MovieType.SERIES ? '/1' : ''}`}
                    className={styles.sequelItem}
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {movie.originName && (
            <p className={styles.originName}>{movie.originName}</p>
          )}

          <div className={styles.metaRow}>
            {movie.tmdb.vote_average > 0 && (
              <span className={styles.imdb}>
                <Star size={14} weight="fill" /> {movie.tmdb.vote_average.toFixed(1)}
              </span>
            )}
            {movie.year && (
              <span className={styles.metaItem}><Calendar size={13} /> {movie.year}</span>
            )}
            {movie.time && (
              <span className={styles.metaItem}><Clock size={13} /> {movie.time}</span>
            )}
            {movie.quality && <Badge variant="quality">{movie.quality}</Badge>}
            {movie.lang && <Badge variant="default">{movie.lang}</Badge>}
          </div>

          {movie.category.length > 0 && (
            <div className={styles.tagRow}>
              <Tag size={14} className={styles.tagIcon} />
              {movie.category.map((c) => (
                <Link key={c.id} to={`/the-loai/${c.slug}`} className={styles.tag}>
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {movie.country.length > 0 && (
            <div className={styles.tagRow}>
              <Globe size={14} className={styles.tagIcon} />
              {movie.country.map((c) => (
                <Link key={c.id} to={`/quoc-gia/${c.slug}`} className={styles.tag}>
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {movie.content && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Nội dung phim</h2>
              <div
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: movie.content }}
              />
            </div>
          )}

          {movie.actor.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Diễn viên</h2>
              <p className={styles.textSecondary}>{movie.actor.slice(0, 10).join(', ')}</p>
            </div>
          )}

          {movie.director.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Đạo diễn</h2>
              <p className={styles.textSecondary}>{movie.director.join(', ')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
