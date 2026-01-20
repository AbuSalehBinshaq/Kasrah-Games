import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kasrah-games.onrender.com';

  try {
    const game = await prisma.game.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        shortDescription: true,
        thumbnail: true,
        coverImage: true,
        developer: true,
        playCount: true,
        tags: true,
      },
    });

    if (!game) {
      return {
        metadataBase: new URL(baseUrl),
        title: 'Game Not Found',
        description: 'The game you are looking for does not exist.',
      };
    }

    // Get ratings for this game
    const ratings = await prisma.rating.findMany({
      where: { gameId: game.id },
      select: { isLike: true },
    });

    const likes = ratings.filter((r) => r.isLike).length;
    const dislikes = ratings.filter((r) => !r.isLike).length;
    const total = likes + dislikes;
    const rating = total > 0 ? Math.round((likes / total) * 100) : 0;

    const gameUrl = `${baseUrl}/games/${id}`;
    const imageUrl = game.coverImage || game.thumbnail || `${baseUrl}/images/placeholder-game.svg`;
    const description = game.shortDescription || game.description.substring(0, 160);
    
    // Ensure imageUrl is absolute
    const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;

    return {
      metadataBase: new URL(baseUrl),
      title: `${game.title} - Play Online | Kasrah Games`,
      description: description,
      keywords: [game.title, 'online game', 'play game', 'free game', 'HTML5', 'WebGL', ...(game.tags || [])],
      authors: [{ name: game.developer }],
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
      openGraph: {
        type: 'website',
        url: gameUrl,
        title: `${game.title} - Play Online | Kasrah Games`,
        description: description,
        siteName: 'Kasrah Games',
        locale: 'en_US',
        images: [
          {
            url: absoluteImageUrl,
            width: 1200,
            height: 630,
            alt: game.title,
            type: 'image/jpeg',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${game.title} - Play Online | Kasrah Games`,
        description: description,
        images: [absoluteImageUrl],
        creator: '@kasrahgames',
      },
      alternates: {
        canonical: gameUrl,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for game:', error);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kasrah-games.onrender.com';
    return {
      metadataBase: new URL(baseUrl),
      title: 'Game | Kasrah Games',
      description: 'Play this game on Kasrah Games',
    };
  }
}

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
