import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

type Props = {
  params: Promise<{ id: string }>;
};

// Revalidate metadata every hour
export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kasrah-games.onrender.com';
  const siteUrl = new URL(baseUrl);

  try {
    // Try to find by slug first (since URL uses slug), then fall back to id
    let game = await prisma.game.findFirst({
      where: { slug: id },
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

    // If not found by slug, try by id
    if (!game) {
      game = await prisma.game.findUnique({
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
    }

    if (!game) {
      return {
        metadataBase: siteUrl,
        title: 'Game Not Found | Kasrah Games',
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

    const gameUrl = `${baseUrl}/games/${game.slug || id}`;
    const imageUrl = game.coverImage || game.thumbnail || `${baseUrl}/images/placeholder-game.svg`;
    const description = game.shortDescription || game.description.substring(0, 160);
    
    // Ensure imageUrl is absolute
    const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;

    return {
      metadataBase: siteUrl,
      title: `${game.title} - Play Online | Kasrah Games`,
      description: description,
      keywords: [game.title, 'online game', 'play game', 'free game', 'HTML5', 'WebGL', 'browser game', ...(game.tags || [])],
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
    return {
      metadataBase: siteUrl,
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
  return <>{children}</>;
}
