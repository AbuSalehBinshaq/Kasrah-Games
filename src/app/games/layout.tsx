import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse All Games | Kasrah Games',
  description: 'Discover and play hundreds of free HTML5 and WebGL games. Find your favorite games by category, rating, and popularity.',
  keywords: ['online games', 'free games', 'HTML5 games', 'WebGL games', 'browser games', 'play games online'],
  openGraph: {
    type: 'website',
    url: 'https://kasrah-games.onrender.com/games',
    title: 'Browse All Games | Kasrah Games',
    description: 'Discover and play hundreds of free HTML5 and WebGL games. Find your favorite games by category, rating, and popularity',
    siteName: 'Kasrah Games',
    locale: 'en_US',
    images: [
      {
        url: 'https://kasrah-games.onrender.com/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Kasrah Games',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse All Games | Kasrah Games',
    description: 'Discover and play hundreds of free HTML5 and WebGL games',
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
  const gameCollectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Browse All Games | Kasrah Games',
    description: 'Discover and play hundreds of free HTML5 and WebGL games. Find your favorite games by category, rating, and popularity.',
    url: 'https://kasrah-games.onrender.com/games',
    image: 'https://kasrah-games.onrender.com/images/og-image.jpg',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Kasrah Games',
      url: 'https://kasrah-games.onrender.com',
    },
    mainEntity: {
      '@type': 'GameCollection',
      name: 'Kasrah Games Collection',
      description: 'A collection of free HTML5 and WebGL games',
      url: 'https://kasrah-games.onrender.com/games',
      numberOfItems: 100, // Approximate number
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Action Games',
          url: 'https://kasrah-games.onrender.com/games?category=action',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Puzzle Games',
          url: 'https://kasrah-games.onrender.com/games?category=puzzle',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Strategy Games',
          url: 'https://kasrah-games.onrender.com/games?category=strategy',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Sports Games',
          url: 'https://kasrah-games.onrender.com/games?category=sports',
        },
      ],
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://kasrah-games.onrender.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Games',
          item: 'https://kasrah-games.onrender.com/games',
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(gameCollectionSchema),
        }}
      />
      {children}
    </>
  );
}
