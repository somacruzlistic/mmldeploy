'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import MovieCard from './MovieCard';

export default function InfiniteMovieScroll({ 
  sectionKey,
  movieSectionState,
  setMovieSectionState,
  userMovieLists,
  setUserMovieLists,
  session
}) {
  const scrollContainerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const [error, setError] = useState(null);

  const fetchMovies = useCallback(async () => {
    const currentState = movieSectionState[sectionKey];
    if (currentState.isFetching || !currentState.hasMore) {
      console.log(`Skipping fetch for ${sectionKey} - isFetching: ${currentState.isFetching}, hasMore: ${currentState.hasMore}`);
      return;
    }

    try {
      console.log(`Fetching ${sectionKey} movies, page: ${currentState.page}, genre: ${currentState.genre}`);
      setMovieSectionState(prev => ({
        ...prev,
        [sectionKey]: { ...prev[sectionKey], isFetching: true, error: null }
      }));

      let url;
      let data;

      if (sectionKey === 'bhutanese-movies') {
        url = `/api/youtube/search?pageToken=${currentState.pageToken}&genre=${currentState.genre}`;
        console.log('Fetching from YouTube API:', url);
        const response = await fetch(url);
        data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch YouTube videos');
        }

        console.log('YouTube API response:', data);
        
        setMovieSectionState(prev => ({
          ...prev,
          [sectionKey]: {
            ...prev[sectionKey],
            movies: [...prev[sectionKey].movies, ...data.items],
            pageToken: data.nextPageToken || '',
            hasMore: !!data.nextPageToken,
            isFetching: false
          }
        }));
      } else {
        const tmdbEndpoints = {
          'popular-movies': 'popular',
          'upcoming-movies': 'upcoming',
          'top-rated-movies': 'top_rated'
        };

        url = `/api/movies/${tmdbEndpoints[sectionKey]}?page=${currentState.page}&genre=${currentState.genre}`;
        console.log(`Fetching from TMDB API: ${url}`);
        
        const response = await fetch(url);
        const contentType = response.headers.get('content-type');
        console.log(`Response content type: ${contentType}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error response: ${errorText}`);
          throw new Error(`Failed to fetch movies: ${response.status} ${response.statusText}`);
        }

        data = await response.json();
        console.log(`TMDB API response for ${sectionKey}:`, {
          page: data.page,
          total_pages: data.total_pages,
          total_results: data.total_results,
          results_count: data.results?.length
        });

        if (!data.results || !Array.isArray(data.results)) {
          throw new Error('Invalid response format: missing results array');
        }

        setMovieSectionState(prev => ({
          ...prev,
          [sectionKey]: {
            ...prev[sectionKey],
            movies: [...prev[sectionKey].movies, ...data.results],
            page: prev[sectionKey].page + 1,
            hasMore: data.page < data.total_pages,
            isFetching: false,
            error: null
          }
        }));
      }
    } catch (error) {
      console.error(`Error fetching ${sectionKey}:`, error);
      setError(error.message);
      setMovieSectionState(prev => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          error: error.message,
          isFetching: false,
          hasMore: false
        }
      }));
    }
  }, [sectionKey, movieSectionState, setMovieSectionState]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      const container = scrollContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;

      if (scrollLeft + clientWidth >= scrollWidth * 0.8) {
        fetchMovies();
      }
    }, 150);
  }, [fetchMovies]);

  useEffect(() => {
    const currentState = movieSectionState[sectionKey];
    if (currentState.movies.length === 0 && currentState.hasMore && !currentState.isFetching) {
      console.log(`Initial fetch for ${sectionKey}`);
      fetchMovies();
    }
  }, [sectionKey, movieSectionState, fetchMovies]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [handleScroll]);

  const currentState = movieSectionState[sectionKey];

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-100/10 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {currentState.movies.map((movie, index) => (
        <div 
          key={`${movie.id}-${index}`} 
          className="flex-none w-64"
        >
          <MovieCard
            movie={movie}
            userMovieLists={userMovieLists}
            setUserMovieLists={setUserMovieLists}
            session={session}
            source={sectionKey === 'bhutanese-movies' ? 'youtube' : 'tmdb'}
          />
        </div>
      ))}
      {currentState.isFetching && (
        <div className="flex-none w-64 h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
} 