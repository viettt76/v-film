import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { X, Heart, CaretRight, Globe, Tag } from '@phosphor-icons/react';
import { getGenreList, getCountryList } from '@/api/movieApi';
import { movieKeys, STALE } from '@/api/queryKeys';
import { MovieSource } from '@/types/movie';
import styles from './SidebarDrawer.module.css';
import { useState } from 'react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type SubMenu = 'genre' | 'country' | null;

export function SidebarDrawer({ isOpen, onClose }: SidebarDrawerProps) {
  const navigate = useNavigate();
  const [openSub, setOpenSub] = useState<SubMenu>(null);

  const { data: genres } = useQuery({
    queryKey: movieKeys.genres(MovieSource.OPHIM),
    queryFn: () => getGenreList(MovieSource.OPHIM),
    staleTime: STALE.meta,
    enabled: isOpen,
  });

  const { data: countries } = useQuery({
    queryKey: movieKeys.countries(MovieSource.OPHIM),
    queryFn: () => getCountryList(MovieSource.OPHIM),
    staleTime: STALE.meta,
    enabled: isOpen,
  });

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
    setOpenSub(null);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <nav
        className={`${styles.drawer} ${isOpen ? styles.open : ''}`}
        aria-label="Menu điều hướng"
      >
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>Menu</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng menu">
            <X size={20} weight="bold" />
          </button>
        </div>

        <div className={styles.nav}>
          <button className={styles.navItem} onClick={() => handleNav('/yeu-thich')}>
            <Heart size={18} weight="bold" />
            Phim yêu thích
          </button>

          {/* Genre submenu */}
          <div className={styles.subGroup}>
            <button
              className={`${styles.navItem} ${openSub === 'genre' ? styles.navItemActive : ''}`}
              onClick={() => setOpenSub(openSub === 'genre' ? null : 'genre')}
              aria-expanded={openSub === 'genre'}
            >
              <Tag size={18} weight="bold" />
              Thể loại
              <CaretRight
                size={14}
                className={`${styles.caret} ${openSub === 'genre' ? styles.caretOpen : ''}`}
              />
            </button>
            {openSub === 'genre' && (
              <div className={styles.subList}>
                {genres?.map((g) => (
                  <button
                    key={g._id}
                    className={styles.subItem}
                    onClick={() => handleNav(`/the-loai/${g.slug}`)}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Country submenu */}
          <div className={styles.subGroup}>
            <button
              className={`${styles.navItem} ${openSub === 'country' ? styles.navItemActive : ''}`}
              onClick={() => setOpenSub(openSub === 'country' ? null : 'country')}
              aria-expanded={openSub === 'country'}
            >
              <Globe size={18} weight="bold" />
              Quốc gia
              <CaretRight
                size={14}
                className={`${styles.caret} ${openSub === 'country' ? styles.caretOpen : ''}`}
              />
            </button>
            {openSub === 'country' && (
              <div className={styles.subList}>
                {countries?.map((c) => (
                  <button
                    key={c._id}
                    className={styles.subItem}
                    onClick={() => handleNav(`/quoc-gia/${c.slug}`)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
