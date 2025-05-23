import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ClientPage = dynamic(() => import('./components/ClientPage'), {
  loading: () => <LoadingFallback />
});

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

export const metadata = {
  title: 'MyMovieList',
  description: 'A movie listing website',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

// Enable static generation with dynamic params
export const dynamicParams = true;

export default function Home({ searchParams }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ClientPage searchParams={searchParams} />
    </Suspense>
  );
}