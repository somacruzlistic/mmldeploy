import './globals.css';
import { headers } from 'next/headers';
import ClientLayout from './ClientLayout';
import { Suspense } from 'react';

export const metadata = {
  title: 'MyMovieList',
  description: 'A movie listing website',
  charset: 'utf-8',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getSession() {
  const headersList = headers();
  const timestamp = Date.now();
  return { timestamp };
}

export default async function RootLayout({ children }) {
  await getSession();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-dark-bg text-light-text font-sans overflow-x-hidden" suppressHydrationWarning>
        <Suspense fallback={<div className="min-h-screen bg-dark-bg"></div>}>
          <ClientLayout>{children}</ClientLayout>
        </Suspense>
      </body>
    </html>
  );
}