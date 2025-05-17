import { NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pageToken = searchParams.get('pageToken') || '';
  const genre = searchParams.get('genre') || 'all';

  try {
    const searchQuery = 'Bhutanese movie';
    const maxResults = 10;
    
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch videos');
    }

    // Transform the response to match our movie format
    const transformedItems = data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      overview: item.snippet.description,
      poster_path: item.snippet.thumbnails.high.url,
      release_date: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      source: 'youtube'
    }));

    return NextResponse.json({
      items: transformedItems,
      nextPageToken: data.nextPageToken,
      prevPageToken: data.prevPageToken
    });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 