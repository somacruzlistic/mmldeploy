import './globals.css';
import ClientLayout from './ClientLayout';

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
    <html lang="en">
      <body className="bg-dark-bg text-light-text font-sans overflow-x-hidden">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}