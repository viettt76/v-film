import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/Home/HomePage';
import { SearchPage } from '@/pages/Search/SearchPage';
import { GenrePage } from '@/pages/Genre/GenrePage';
import { CountryPage } from '@/pages/Country/CountryPage';
import { WatchMoviePage } from '@/pages/Watch/WatchMoviePage';
import { WatchEpisodePage } from '@/pages/Watch/WatchEpisodePage';
import { FavoritesPage } from '@/pages/Favorites/FavoritesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/tim-kiem', element: <SearchPage /> },
      { path: '/the-loai/:genre', element: <GenrePage /> },
      { path: '/quoc-gia/:country', element: <CountryPage /> },
      { path: '/yeu-thich', element: <FavoritesPage /> },
      { path: '/phim/:source/:slug', element: <WatchMoviePage /> },
      { path: '/phim/:source/:slug/:episode', element: <WatchEpisodePage /> },
      {
        path: '*',
        element: (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <h2>404 - Không tìm thấy trang</h2>
          </div>
        ),
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            },
          }}
        />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
