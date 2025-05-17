'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MovieCard from './MovieCard';
import GenreFilter from './GenreFilter';
import Footer from './Footer';
import InfiniteMovieScroll from './InfiniteMovieScroll';
import SearchBar from './SearchBar';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black">
      <div className="animate-pulse">
        <div className="h-16 bg-gray-900"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-800 rounded mb-8"></div>
          <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-800 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default function HomeContent({ searchParams }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [userMovieLists, setUserMovieLists] = useState({
    Watching: [],
    'Will Watch': [],
    'Already Watched': [],
  });

  const [userListsState, setUserListsState] = useState({
    Watching: { isFetching: false, error: null },
    'Will Watch': { isFetching: false, error: null },
    'Already Watched': { isFetching: false, error: null },
  });

  const [movieSectionState, setMovieSectionState] = useState({
    'popular-movies': { page: 1, genre: searchParams?.genre || 'all', isFetching: false, movies: [], error: null, hasMore: true },
    'upcoming-movies': { page: 1, genre: searchParams?.genre || 'all', isFetching: false, movies: [], error: null, hasMore: true },
    'top-rated-movies': { page: 1, genre: searchParams?.genre || 'all', isFetching: false, movies: [], error: null, hasMore: true },
    'bhutanese-movies': { pageToken: '', genre: searchParams?.genre || 'all', isFetching: false, searchQuery: '', movies: [], error: null, hasMore: true },
  });

  useEffect(() => {
    setMounted(true);
    if (session) {
      fetchUserLists();
    }
  }, [session]);

  const fetchUserLists = async () => {
    try {
      const response = await fetch('/api/user/lists');
      const data = await response.json();
      setUserMovieLists(data);
    } catch (error) {
      console.error('Error fetching user lists:', error);
    }
  };

  const handleSearch = async (query) => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/movies/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Error searching movies:', error);
    }
    setIsSearching(false);
  };

  const handleGenreChange = (genre) => {
    const params = new URLSearchParams(searchParams);
    if (genre === 'all') {
      params.delete('genre');
    } else {
      params.set('genre', genre);
    }
    router.push(`/?${params.toString()}`);
  };

  if (!mounted || status === 'loading') {
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <main className="flex-1">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                MyMovieList
              </h1>
              <div className="flex items-center gap-4">
                <div className="w-64">
                  <SearchBar onSearch={handleSearch} />
                </div>
                {session ? (
                  <button
                    onClick={() => signOut()}
                    className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => signIn()}
                    className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <GenreFilter 
            selectedGenre={searchParams?.genre || 'all'} 
            onGenreChange={handleGenreChange}
          />
          
          {/* Search Results */}
          {isSearching ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Search Results</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {searchResults.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    userMovieLists={userMovieLists}
                    setUserMovieLists={setUserMovieLists}
                    session={session}
                    source="tmdb"
                  />
                ))}
              </div>
            </section>
          ) : null}

          {/* Popular Movies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Popular Movies</h2>
            <InfiniteMovieScroll
              sectionKey="popular-movies"
              movieSectionState={movieSectionState}
              setMovieSectionState={setMovieSectionState}
              userMovieLists={userMovieLists}
              setUserMovieLists={setUserMovieLists}
              session={session}
            />
          </section>

          {/* Upcoming Movies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Upcoming Movies</h2>
            <InfiniteMovieScroll
              sectionKey="upcoming-movies"
              movieSectionState={movieSectionState}
              setMovieSectionState={setMovieSectionState}
              userMovieLists={userMovieLists}
              setUserMovieLists={setUserMovieLists}
              session={session}
            />
          </section>

          {/* Top Rated Movies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Top Rated Movies</h2>
            <InfiniteMovieScroll
              sectionKey="top-rated-movies"
              movieSectionState={movieSectionState}
              setMovieSectionState={setMovieSectionState}
              userMovieLists={userMovieLists}
              setUserMovieLists={setUserMovieLists}
              session={session}
            />
          </section>

          {/* Bhutanese Movies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Bhutanese Movies</h2>
            <InfiniteMovieScroll
              sectionKey="bhutanese-movies"
              movieSectionState={movieSectionState}
              setMovieSectionState={setMovieSectionState}
              userMovieLists={userMovieLists}
              setUserMovieLists={setUserMovieLists}
              session={session}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
} 