'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SearchParamsContent({ children }) {
  const searchParams = useSearchParams();
  return children(searchParams);
}

export default function SearchParamsHandler({ children }) {
  return (
    <Suspense fallback={null}>
      <SearchParamsContent>
        {(searchParams) => children(searchParams)}
      </SearchParamsContent>
    </Suspense>
  );
} 