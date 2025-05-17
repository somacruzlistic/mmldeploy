import './globals.css';
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

export default function RootLayout({ children }) {
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