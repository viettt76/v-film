# 🎬 V-FILM — Project Skill File

## 1. Phân tích source cũ (Next.js)

### Vấn đề của source cũ
| Vấn đề | Mô tả |
|--------|-------|
| **Mọi trang đều là `'use client'`** | Không tận dụng được SSR của Next.js, hoàn toàn CSR — dùng Vite/React thuần sẽ nhẹ hơn |
| **Cache qua sessionStorage** | Thủ công, không có invalidation, dễ stale data |
| **Flowbite + Radix + Shadcn cùng lúc** | 3 UI lib gây bloat bundle không cần thiết |
| **Axios không có interceptor/error boundary** | Error chỉ `console.error`, không UX |
| **Không có loading skeleton** | Trải nghiệm tệ khi fetch chậm |
| **Movie player thiếu fallback server** | Nếu server 1 lỗi không auto switch |
| **Theme toggle không persist đúng cách** | Dùng next-themes nhưng layout bị flash |

### Tính năng hiện có (cần giữ lại & cải thiện)
- Trang chủ: phim mới + phim theo thể loại
- Trang chi tiết phim (slug): xem phim (m3u8 HLS)
- Trang xem theo tập (TV series): `[slug]/[episode]`
- Tìm kiếm (debounce + quick result + trang search riêng)
- Lọc theo thể loại (genre)
- Lọc theo quốc gia (country)
- Phim yêu thích (localStorage)
- Lịch sử xem (localStorage) + resume watching
- Dark/Light mode toggle

---

## 2. Công nghệ mới được chọn

### Stack chính
```
Vite 6 + React 19 + TypeScript 5
```

**Lý do chọn Vite thay Next.js:**
- Toàn bộ source cũ là CSR (`'use client'`) → Next.js không có lợi thế
- Vite cho DX nhanh hơn, bundle nhỏ hơn
- React Router v7 (loader-based routing) thay cho Next.js App Router
- Không cần server — deploy static lên Vercel/GitHub Pages/Cloudflare Pages

### Routing
```
React Router v7 (Data Router / createBrowserRouter)
```
- Hỗ trợ `loader` để prefetch data trước khi render → không bị loading flash
- File-based routing tự tổ chức trong `src/pages/`

### Data fetching & Cache
```
TanStack Query (React Query) v5
```
- Tự cache, stale-while-revalidate, background refetch
- Thay thế hoàn toàn sessionStorage thủ công
- Devtools built-in

### HTTP Client
```
ky (lightweight fetch wrapper) — thay Axios
```
- Bundle nhỏ hơn nhiều (2KB vs 13KB)
- Native fetch-based, hỗ trợ TypeScript tốt

### Video Player
```
HLS.js (native) + custom React wrapper
```
- Thay @vidstack/react (quá nặng ~300KB)
- HLS.js ~100KB, tự build player với controls HTML5 native
- Auto fallback: thử server 1 → server 2 → hiện lỗi

### UI & Styling
```
Vanilla CSS Modules + CSS Variables
```
- Không dùng Tailwind (giảm complexity)
- Design system với CSS variables (dark/light mode)
- CSS Modules cho scoped styles per component

### Icons
```
@phosphor-icons/react (đã có trong source cũ, giữ lại)
```

### Toast Notifications
```
react-hot-toast (nhẹ hơn sonner)
```

### State Management
```
React Context (chỉ cho theme + sidebar) + TanStack Query (server state)
```
Không cần Redux/Zustand — scope nhỏ.

---

## 3. Kiến trúc thư mục

```
v-film/
├── public/
│   ├── favicon.ico
│   └── images/
│       └── logo.png
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Router setup
│   ├── index.css             # Global CSS + design tokens
│   │
│   ├── types/
│   │   └── movie.ts          # TypeScript types/interfaces
│   │
│   ├── api/
│   │   ├── client.ts         # ky instance + base config
│   │   └── movieApi.ts       # All API calls (typed)
│   │
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useClickOutside.ts
│   │   ├── useMoviesPerRow.ts
│   │   ├── useWatchHistory.ts   # localStorage abstraction
│   │   └── useFavorites.ts      # localStorage abstraction
│   │
│   ├── contexts/
│   │   └── ThemeContext.tsx   # dark/light + persist to localStorage
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Header.module.css
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   └── SidebarDrawer.tsx
│   │   │   └── Layout.tsx        # Root layout wrapper
│   │   │
│   │   ├── movie/
│   │   │   ├── MovieCard/
│   │   │   │   ├── MovieCard.tsx       # Thumbnail + hover preview
│   │   │   │   └── MovieCard.module.css
│   │   │   ├── MovieRow/
│   │   │   │   ├── MovieRow.tsx        # Horizontal scroll row
│   │   │   │   └── MovieRow.module.css
│   │   │   ├── MovieGrid/
│   │   │   │   ├── MovieGrid.tsx       # Grid for search/genre pages
│   │   │   │   └── MovieGrid.module.css
│   │   │   └── MovieDetailModal.tsx    # Quick detail popup
│   │   │
│   │   ├── player/
│   │   │   ├── VideoPlayer.tsx         # HLS.js wrapper
│   │   │   └── VideoPlayer.module.css
│   │   │
│   │   ├── ui/
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Spinner.tsx
│   │   │
│   │   └── common/
│   │       ├── ScrollToTop.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   └── pages/
│       ├── Home/
│       │   ├── HomePage.tsx
│       │   └── HomePage.module.css
│       ├── Watch/
│       │   ├── WatchMoviePage.tsx      # /phim/:slug
│       │   └── WatchEpisodePage.tsx    # /phim/:slug/:episode
│       ├── Search/
│       │   └── SearchPage.tsx          # /tim-kiem?keyword=...
│       ├── Genre/
│       │   └── GenrePage.tsx           # /the-loai/:genre
│       ├── Country/
│       │   └── CountryPage.tsx         # /quoc-gia/:country
│       └── Favorites/
│           └── FavoritesPage.tsx       # /yeu-thich
│
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. API (OPhim — không đổi)

**Base URL:** `https://ophim1.com` (từ env `VITE_OPHIM_API_URL`)
**Image CDN:** từ env `VITE_BASE_MOVIE_IMAGE`

| Function | Endpoint | Dùng ở |
|----------|----------|--------|
| `getNewlyUpdated(page?)` | `GET /danh-sach/phim-moi-cap-nhat` | HomePage |
| `getMovieByType(type, page?)` | `GET /v1/api/danh-sach/:type` | HomePage |
| `getGenreList()` | `GET /v1/api/the-loai` | Header sidebar |
| `getMovieByGenre(genre, page?)` | `GET /v1/api/the-loai/:genre` | GenrePage + HomePage |
| `getCountryList()` | `GET /v1/api/quoc-gia` | Header sidebar |
| `getMovieByCountry(country, page?)` | `GET /v1/api/quoc-gia/:country` | CountryPage |
| `searchMovie(keyword, page?)` | `GET /v1/api/tim-kiem` | SearchBar + SearchPage |
| `getMovieDetailBySlug(slug)` | `GET /phim/:slug` | WatchPage |
| `getMovieDetailById(id)` | `GET /phim/id/:id` | MovieCard hover |

---

## 5. Design System (CSS Variables)

- Sử dụng hệ thống CSS Variables mạnh mẽ để hỗ trợ Dark/Light mode.
- Phông chữ mặc định: `Be Vietnam Pro` cho nội dung và `Outfit` cho tiêu đề.

---

## 6. Ghi chú triển khai

1. **VideoPlayer**: Sử dụng HLS.js để hỗ trợ phát luồng m3u8. Tự động chuyển đổi máy chủ khi gặp lỗi.
2. **Infinite Scroll/Pagination**: Tận dụng TanStack Query để quản lý dữ liệu và phân trang.
3. **Lịch sử xem & Yêu thích**: Lưu trữ trực tiếp trong `localStorage` để đồng bộ nhanh chóng mà không cần backend.
