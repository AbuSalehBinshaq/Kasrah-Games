'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Play } from 'lucide-react';
import GameCard from '@/components/common/GameCard';

export default function PopularGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularGames();
  }, []);

  async function fetchPopularGames() {
    try {
      const response = await fetch('/api/games?sort=popular&limit=6');
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      const data = await response.json();
      setGames(data.games || []);
    } catch (error) {
      console.error('Failed to fetch popular games:', error);
      setGames([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="py-8 md:py-12">
        <div className="mb-6 h-10 w-48 animate-pulse rounded bg-gray-200"></div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:gap-4 lg:grid-cols-4 lg:gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-36 sm:h-40 md:h-48 animate-pulse rounded-xl bg-gray-200"
            ></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
          <p className="text-sm text-gray-600">Based on what players love</p>
        </div>
        <Link
          href="/games?sort=popular"
          className="rounded-full border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50"
        >
          See all
        </Link>
      </div>

      {!games || games.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-12 text-center">
          <Play className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No games yet</h3>
          <p className="text-gray-600">Be the first to play!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:gap-4 lg:grid-cols-4 lg:gap-5">
          {games.map((game: any) => (
            <div
              key={game.id}
              className=""
            >
              <GameCard game={game} viewMode="grid" compact hideDescription />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
