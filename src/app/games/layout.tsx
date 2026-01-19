import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Games | Kasrah Games',
  description: 'Browse and play thousands of free online games. HTML5, WebGL, and more. Find your favorite games with our advanced search and filters.',
  keywords: ['games', 'online games', 'free games', 'HTML5 games', 'WebGL games', 'browser games'],
  openGraph: {
    type: 'website',
    url: 'https://kasrah-games.onrender.com/games',
    title: 'Browse Games | Kasrah Games',
    description: 'Browse and play thousands of free online games.',
    images: [
      {
        url: 'https://kasrah-games.onrender.com/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kasrah Games',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Games | Kasrah Games',
    description: 'Browse and play thousands of free online games.',
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
  return children;
}
