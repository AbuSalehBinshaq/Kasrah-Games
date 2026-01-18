'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GameCard from '@/components/common/GameCard';

type ContinueGame = {
  id: string;
  slug: string;
  title: string;
  thumbnail?: string;
  description: string;
  playCount?: number;
  lastPlayed?: string;
  likePercentage?: number;
  likes?: number;
  dislikes?: number;
  totalRatings?: number;
  onlineCount?: number;
  categoryNames?: string[];
};

export default function ContinueGames() {
  const [games, setGames] = useState<ContinueGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContinueGames();
  }, []);

  async function fetchContinueGames() {
    try {
      const response = await fetch('/api/auth/profile', { credentials: 'include' });
      if (!response.ok) {
        setGames([]);
        return;
      }
      const data = await response.json();
      const recentGames = Array.isArray(data?.recentGames) ? data.recentGames : [];

      const normalized = recentGames.map((game: any) => ({
        id: game.id,
        slug: game.slug,
        title: game.title,
        thumbnail: game.thumbnail || '/images/placeholder-game.svg',
        description: '',
        playCount: game.playCount || 0,
        lastPlayed: game.lastPlayed || game.startedAt || game.createdAt || null,
        likePercentage: game.likePercentage || 0,
        likes: game.likes || 0,
        dislikes: game.dislikes || 0,
        totalRatings: game.totalRatings || 0,
        onlineCount: game.onlineCount || 0,
        categoryNames: game.categoryNames || [],
      }));

      const sorted = normalized.sort((a: ContinueGame, b: ContinueGame) => {
        const aTime = a.lastPlayed ? new Date(a.lastPlayed).getTime() : 0;
        const bTime = b.lastPlayed ? new Date(b.lastPlayed).getTime() : 0;
        return bTime - aTime;
      });

      setGames(sorted);
    } catch (error) {
      console.error('Failed to fetch continue games:', error);
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
          <h2 className="text-3xl font-bold text-gray-900">Continue</h2>
          <span className="text-primary-600 font-semibold">→</span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-gray-200"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Continue</h2>
        <span className="text-primary-600 font-semibold">→</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {games.map((game) => (
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
