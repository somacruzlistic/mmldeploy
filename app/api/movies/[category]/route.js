import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request, { params }) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || 1;
  const genre = searchParams.get('genre') || 'all';
  const { category } = params;

  try {
    let url;
    switch (category) {
      case 'popular':
        url = `${BASE_URL}/movie/popular`;
        break;
      case 'upcoming':
        url = `${BASE_URL}/movie/upcoming`;
        break;
      case 'top_rated':
        url = `${BASE_URL}/movie/top_rated`;
        break;
      default:
        url = `${BASE_URL}/movie/popular`;
    }

    const response = await fetch(`${url}?api_key=${TMDB_API_KEY}&page=${page}${genre !== 'all' ? `&with_genres=${genre}` : ''}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.status_message || 'Failed to fetch movies');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 