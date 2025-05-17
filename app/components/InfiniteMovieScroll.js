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

  const fetchMovies = useCallback(async () => {
    const currentState = movieSectionState[sectionKey];
    if (currentState.isFetching || !currentState.hasMore) return;

    try {
      setMovieSectionState(prev => ({
        ...prev,
        [sectionKey]: { ...prev[sectionKey], isFetching: true }
      }));

      let url;
      let data;

      if (sectionKey === 'bhutanese-movies') {
        url = `/api/youtube/search?pageToken=${currentState.pageToken}&genre=${currentState.genre}`;
        const response = await fetch(url);
        data = await response.json();
        
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
        const response = await fetch(url);
        data = await response.json();

        setMovieSectionState(prev => ({
          ...prev,
          [sectionKey]: {
            ...prev[sectionKey],
            movies: [...prev[sectionKey].movies, ...data.results],
            page: prev[sectionKey].page + 1,
            hasMore: data.page < data.total_pages,
            isFetching: false
          }
        }));
      }
    } catch (error) {
      console.error(`Error fetching ${sectionKey}:`, error);
      setMovieSectionState(prev => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          error: error.message,
          isFetching: false
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
    if (currentState.movies.length === 0 && currentState.hasMore) {
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