import { NextResponse } from 'next/server';

export async function GET() {
  const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  
  try {
    // Test TMDB API connectivity
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=1`
    );
    
    const data = await response.json();
    
    return NextResponse.json({
      apiKeyPresent: !!TMDB_API_KEY,
      tmdbResponse: response.ok,
      status: response.status,
      results: data.results ? data.results.length : 0
    });
  } catch (error) {
    return NextResponse.json({
      apiKeyPresent: !!TMDB_API_KEY,
      error: error.message
    }, { status: 500 });
  }
} 