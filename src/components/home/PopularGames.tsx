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
      <section className="py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-200"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 p-3">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Popular Games</h2>
            <p className="text-gray-600">Most played games this week</p>
          </div>
        </div>
        <Link
          href="/games?sort=popular"
          className="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2 font-semibold text-white hover:from-orange-600 hover:to-red-600"
        >
          View All
        </Link>
      </div>

      {!games || games.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-12 text-center">
          <Play className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No games yet</h3>
          <p className="text-gray-600">Be the first to play!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game: any) => (
            <GameCard key={game.id} game={game} viewMode="grid" />
          ))}
        </div>
      )}
    </section>
  );
}
