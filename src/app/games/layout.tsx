import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse All Games | Kasrah Games - Play Free Online Games',
  description: 'Discover and play hundreds of free HTML5 and WebGL games. Find your favorite games by category, rating, and popularity. No downloads required.',
  keywords: ['online games', 'free games', 'HTML5 games', 'WebGL games', 'browser games', 'play games online', 'game collection', 'game categories'],
  openGraph: {
    type: 'website',
    url: 'https://kasrah-games.onrender.com/games',
    title: 'Browse All Games | Kasrah Games',
    description: 'Discover and play hundreds of free HTML5 and WebGL games. Find your favorite games by category, rating, and popularity.',
    siteName: 'Kasrah Games',
    locale: 'en_US',
    images: [
      {
        url: 'https://kasrah-games.onrender.com/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Kasrah Games - Play Free Online Games',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse All Games | Kasrah Games',
    description: 'Discover and play hundreds of free HTML5 and WebGL games.',
    images: ['https://kasrah-games.onrender.com/images/og-image.jpg'],
    creator: '@kasrahgames',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://kasrah-games.onrender.com/games',
  },
};

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
