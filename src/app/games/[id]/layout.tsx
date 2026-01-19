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
        likes: true,
        dislikes: true,
        totalRatings: true,
        tags: true,
      },
    });

    if (!game) {
      return {
        title: 'Game Not Found',
        description: 'The game you are looking for does not exist.',
      };
    }

    const gameUrl = `${baseUrl}/games/${game.slug}`;
    const imageUrl = game.coverImage || game.thumbnail || `${baseUrl}/images/placeholder-game.svg`;
    const description = game.shortDescription || game.description.substring(0, 160);
    const total = (game.likes || 0) + (game.dislikes || 0);
    const rating = total > 0 ? Math.round(((game.likes || 0) / total) * 100) : 0;

    return {
      title: `${game.title} - Play Online | Kasrah Games`,
      description: description,
      keywords: [game.title, 'online game', 'play game', 'free game', ...(game.tags || [])],
      authors: [{ name: game.developer }],
      openGraph: {
        type: 'website',
        url: gameUrl,
        title: game.title,
        description: description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: game.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: game.title,
        description: description,
        images: [imageUrl],
      },
      alternates: {
        canonical: gameUrl,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for game:', error);
    return {
      title: 'Game',
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
