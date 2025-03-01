'use client';

import { MovieItem } from '@/components/MovieItem';
import { BaseMovieData } from '@/app/dataType';
import { getMovieListByCountryService } from '@/lib/services/movieService';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactPaginate from 'react-paginate';
import useMoviesPerSlide from '@/hooks/useMoviesPerSlide';

interface DataType {
    title: string;
    movies: BaseMovieData[];
    totalMovies: number;
    totalPages: number;
}

export default function MoviesByCountry() {
    const { country } = useParams();
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page'));
    const router = useRouter();

    const moviesPerSlide = useMoviesPerSlide();

    const [data, setData] = useState<DataType>({
        title: '',
        movies: [],
        totalMovies: 0,
        totalPages: 0,
    });

    useEffect(() => {
        (async () => {
            try {
                if (typeof country === 'string') {
                    const { data } = await getMovieListByCountryService(country, page);
                    setData({
                        title: data.data.titlePage,
                        movies: data.data.items.map((m: any) => ({
                            movieId: m._id,
                            name: m.name,
                            slug: m.slug,
                            thumbUrl: `${process.env.NEXT_PUBLIC_BASE_MOVIE_IMAGE}${m.thumb_url}`,
                            type: m.tmdb.type,
                        })),
                        totalMovies: data.data.params.pagination.totalItems,
                        totalPages: Math.ceil(
                            data.data.params.pagination.totalItems / data.data.params.pagination.totalItemsPerPage,
                        ),
                    });
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, [country, page]);

    return (
        <div className="px-10 pt-6">
            <div className="text-orange-400 text-2xl">Phim quốc gia {data.title}</div>
            <div className={`grid grid-cols-${moviesPerSlide} gap-x-2 gap-y-4 mt-2`}>
                {data.movies.map((m, index) => {
                    return (
                        <MovieItem
                            movieId={m.movieId}
                            name={m.name}
                            slug={m.slug}
                            thumbUrl={m.thumbUrl}
                            type={m.type}
                            isFirst={index % moviesPerSlide === 0}
                            isLast={(index + 1) % moviesPerSlide === 0}
                            key={`movie-${m.movieId}`}
                        />
                    );
                })}
            </div>
            <ReactPaginate
                breakLabel="..."
                nextLabel=">"
                onPageChange={(p) => router.push(`/country/${country}?page=${p.selected + 1}`)}
                pageRangeDisplayed={5}
                pageCount={data.totalPages}
                previousLabel="<"
                renderOnZeroPageCount={null}
                containerClassName="mt-4 mb-4 flex justify-center text-white gap-x-2"
                breakClassName="w-8 h-8 flex items-center justify-center bg-gray/40"
                pageClassName="w-8 h-8 flex items-center justify-center bg-gray/40"
                previousClassName="w-8 h-8 flex items-center justify-center bg-gray/40"
                nextClassName="w-8 h-8 flex items-center justify-center bg-gray/40"
                activeClassName="text-primary"
                disabledClassName="hidden"
            />
        </div>
    );
}
