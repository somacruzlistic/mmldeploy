import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const url = `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.status_message || 'Failed to search movies');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error searching movies:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 