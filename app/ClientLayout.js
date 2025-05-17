'use client';

import { SessionProvider } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Suspense } from 'react';

function LoadingFallback() {
  return <div className="min-h-screen bg-dark-bg"></div>;
}

export default function ClientLayout({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
        {children}
      </SessionProvider>
    </Suspense>
  );
}