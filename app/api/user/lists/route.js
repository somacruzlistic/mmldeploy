import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        Watching: [],
        'Will Watch': [],
        'Already Watched': [],
      });
    }

    const lists = await prisma.movieList.findMany({
      where: {
        userId: session.user.id,
      },
    });

    // Group movies by category
    const groupedLists = {
      'Watching': lists.filter(item => item.category === 'Watching'),
      'Will Watch': lists.filter(item => item.category === 'Will Watch'),
      'Already Watched': lists.filter(item => item.category === 'Already Watched'),
    };

    return NextResponse.json(groupedLists);
  } catch (error) {
    console.error('Error fetching user lists:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { movieId, title, poster, category, overview, releaseDate, rating, votes, genreIds, description, source } = data;

    const existingMovie = await prisma.movieList.findFirst({
      where: {
        userId: session.user.id,
        movieId: movieId,
      },
    });

    if (existingMovie) {
      // Update existing movie
      const updatedMovie = await prisma.movieList.update({
        where: {
          id: existingMovie.id,
        },
        data: {
          category,
        },
      });
      return NextResponse.json(updatedMovie);
    }

    // Create new movie entry
    const movie = await prisma.movieList.create({
      data: {
        userId: session.user.id,
        movieId,
        title,
        poster,
        category,
        overview,
        releaseDate,
        rating,
        votes,
        genreIds,
        description,
        source,
      },
    });

    return NextResponse.json(movie);
  } catch (error) {
    console.error('Error updating user list:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');

    if (!movieId) {
      return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 });
    }

    await prisma.movieList.deleteMany({
      where: {
        userId: session.user.id,
        movieId: movieId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting from user list:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 