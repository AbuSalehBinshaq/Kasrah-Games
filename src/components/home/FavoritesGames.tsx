'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import GameCard from '@/components/common/GameCard';

type FavoriteGame = {
  id: string;
  slug: string;
  title: string;
  thumbnail?: string;
  description: string;
  playCount?: number;
  likePercentage?: number;
  likes?: number;
  dislikes?: number;
  totalRatings?: number;
  onlineCount?: number;
  categoryNames?: string[];
  createdAt?: string;
};

export default function FavoritesGames() {
  const [games, setGames] = useState<FavoriteGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  async function fetchFavorites() {
    try {
      const response = await fetch('/api/auth/profile', { credentials: 'include' });
      if (!response.ok) {
        setGames([]);
        return;
      }
      const data = await response.json();
      const bookmarks = Array.isArray(data?.bookmarks) ? data.bookmarks : [];

      const normalized = bookmarks.map((bookmark: any) => ({
        id: bookmark.game?.id,
        slug: bookmark.game?.slug,
        title: bookmark.game?.title,
        thumbnail: bookmark.game?.thumbnail || '/images/placeholder-game.svg',
        description: '',
        playCount: bookmark.game?.playCount || 0,
        likePercentage: bookmark.game?.likePercentage || bookmark.game?.avgRating || 0,
        likes: bookmark.game?.likes || 0,
        dislikes: bookmark.game?.dislikes || 0,
        totalRatings: bookmark.game?.totalRatings || 0,
        onlineCount: bookmark.game?.onlineCount || 0,
        categoryNames: bookmark.game?.categoryNames || [],
        createdAt: bookmark.createdAt,
      }));

      const sorted = normalized
        .filter((g: FavoriteGame) => g.id && g.slug)
        .sort((a: FavoriteGame, b: FavoriteGame) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });

      setGames(sorted);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }

  if (!loading && (!games || games.length === 0)) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Favorites</h2>
        </div>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-3 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-gray-200"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Favorites</h2>
        <Link
          href="/auth/profile"
          className="text-primary-600 font-semibold text-lg hover:text-primary-700"
        >
          →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 md:grid-cols-3 lg:grid-cols-3">
        {games.slice(0, 3).map((game) => (
          <GameCard 
            key={game.id} 
            game={game as any} 
            viewMode="grid" 
            hideDescription={true}
            aspectRatio="square"
          />
        ))}
      </div>
    </section>
  );
}
