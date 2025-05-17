import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request, { params }) {
  console.log('API Key present:', !!TMDB_API_KEY);
  
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || 1;
  const genre = searchParams.get('genre') || 'all';
  const { category } = params;

  console.log('Movie API request:', {
    category,
    page,
    genre,
    url: request.url
  });

  if (!TMDB_API_KEY) {
    console.error('TMDB API key is missing');
    return NextResponse.json(
      { error: 'API key configuration error' },
      { status: 500 }
    );
  }

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
        console.warn(`Invalid category: ${category}, defaulting to popular`);
        url = `${BASE_URL}/movie/popular`;
    }

    const apiUrl = `${url}?api_key=${TMDB_API_KEY}&page=${page}${genre !== 'all' ? `&with_genres=${genre}` : ''}`;
    console.log('TMDB API request URL:', apiUrl.replace(TMDB_API_KEY, '[REDACTED]'));

    const response = await fetch(apiUrl);
    const contentType = response.headers.get('content-type');
    console.log('TMDB API response content type:', contentType);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TMDB API Error Response:', errorText);
      return NextResponse.json(
        { error: `TMDB API Error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('TMDB API response stats:', {
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
      results_count: data.results?.length
    });

    if (!data.results || !Array.isArray(data.results)) {
      console.error('Invalid TMDB API response format:', data);
      return NextResponse.json(
        { error: 'Invalid API response format' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in movie API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 