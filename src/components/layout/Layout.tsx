import { Outlet } from 'react-router-dom';
import { Header } from './Header/Header';
import { ScrollToTop } from '@/components/common/ScrollToTop';

export function Layout() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <footer style={{
        padding: '2rem var(--content-px)',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '0.8rem',
        borderTop: '1px solid var(--color-border-subtle)',
      }}>
        © {new Date().getFullYear()} V-Film — Xem phim online miễn phí
      </footer>
    </>
  );
}
