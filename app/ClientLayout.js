'use client';

import { SessionProvider } from 'next-auth/react';

export default function ClientLayout({ children }) {
  console.log('ClientLayout rendering with SessionProvider');
  return (
    <SessionProvider>
      <div suppressHydrationWarning>
        {children}
      </div>
    </SessionProvider>
  );
}