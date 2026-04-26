import React, { useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlass, Sun, Moon, List, FilmSlate } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useTheme } from '@/contexts/ThemeContext';
import { searchMovies, getGenreList, getCountryList } from '@/api/movieApi';
import { movieKeys, STALE } from '@/api/queryKeys';
import { MovieSource, MovieType } from '@/types/movie';
import { SidebarDrawer } from './SidebarDrawer';
import { CaretDown } from '@phosphor-icons/react';
import styles from './Header.module.css';

export function Header() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [searchValue, setSearchValue] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const keyword = useDebounce(searchValue, 400);

  const hideResults = useCallback(() => setShowResults(false), []);
  useClickOutside(searchRef, hideResults);

  const { data: searchData } = useQuery({
    queryKey: movieKeys.search(keyword, 1),
    queryFn: () => searchMovies(keyword, 1),
    enabled: keyword.trim().length >= 2,
    staleTime: STALE.list,
  });

  const { data: genreList } = useQuery({
    queryKey: movieKeys.genres(MovieSource.OPHIM),
    queryFn: () => getGenreList(MovieSource.OPHIM),
    staleTime: STALE.meta,
  });

  const { data: countryList } = useQuery({
    queryKey: movieKeys.countries(MovieSource.OPHIM),
    queryFn: () => getCountryList(MovieSource.OPHIM),
    staleTime: STALE.meta,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/tim-kiem?keyword=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
      setShowResults(false);
    }
  };

  const hasResults = (searchData?.items?.length ?? 0) > 0 && showResults && keyword.trim().length >= 2;

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          {/* Left: Logo + Hamburger */}
          <div className={styles.left}>
            <button
              className={styles.hamburger}
              onClick={() => setSidebarOpen(true)}
              aria-label="Mở menu"
            >
              <List size={22} weight="bold" />
            </button>
            <Link to="/" className={styles.logo} aria-label="V-Film trang chủ">
              <FilmSlate size={28} weight="fill" className={styles.logoIcon} />
              <span className={styles.logoText}>V-Film</span>
            </Link>

            <nav className={styles.nav}>
              <Link to="/yeu-thich" className={styles.navLink}>
                Yêu thích
              </Link>
              
              <div className={styles.dropdownWrap}>
                <div className={styles.navLink}>
                  Thể loại <CaretDown size={14} weight="bold" />
                </div>
                <div className={styles.dropdown}>
                  {genreList?.map((g) => (
                    <Link key={g._id} to={`/the-loai/${g.slug}`} className={styles.dropdownItem}>
                      {g.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className={styles.dropdownWrap}>
                <div className={styles.navLink}>
                  Quốc gia <CaretDown size={14} weight="bold" />
                </div>
                <div className={styles.dropdown}>
                  {countryList?.map((c) => (
                    <Link key={c._id} to={`/quoc-gia/${c.slug}`} className={styles.dropdownItem}>
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>

          {/* Center: Search */}
          <div ref={searchRef} className={styles.searchWrap}>
            <div className={styles.searchBox}>
              <MagnifyingGlass size={18} className={styles.searchIcon} />
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Tìm kiếm phim..."
                value={searchValue}
                onChange={(e) => { setSearchValue(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                onKeyDown={handleKeyDown}
                aria-label="Tìm kiếm phim"
                autoComplete="off"
              />
            </div>

            {hasResults && (
              <div className={styles.searchDropdown} role="listbox">
                <Link
                  to={`/tim-kiem?keyword=${encodeURIComponent(searchValue.trim())}`}
                  className={styles.searchSeeAll}
                  onClick={() => { setShowResults(false); setSearchValue(''); }}
                >
                  Xem tất cả {searchData!.pagination.totalItems} kết quả
                </Link>
                {searchData!.items.slice(0, 8).map((m) => (
                  <Link
                    key={m._id}
                    to={m.type === MovieType.SERIES ? `/phim/${m.source}/${m.slug}/1` : `/phim/${m.source}/${m.slug}`}
                    className={styles.searchResultItem}
                    onClick={() => { setShowResults(false); setSearchValue(''); }}
                    role="option"
                  >
                    <img
                      src={m.thumbUrl}
                      alt={m.name}
                      className={styles.resultThumb}
                      loading="lazy"
                    />
                    <div className={styles.resultInfo}>
                      <span className={styles.resultName}>{m.name}</span>
                      <span className={styles.resultMeta}>{m.year} · {m.quality}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right: Theme toggle */}
          <div className={styles.right}>
            <button
              className={styles.themeBtn}
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
            >
              {theme === 'dark'
                ? <Sun size={20} weight="bold" />
                : <Moon size={20} weight="bold" />}
            </button>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div style={{ height: 'var(--header-height)' }} aria-hidden="true" />

      <SidebarDrawer isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
