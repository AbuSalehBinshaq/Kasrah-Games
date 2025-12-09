'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Play } from 'lucide-react';
import GameCard from '@/components/common/GameCard';

export default function FeaturedGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedGames();
  }, []);

  async function fetchFeaturedGames() {
    try {
      const response = await fetch('/api/games?featured=true&limit=6');
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      const data = await response.json();
      setGames(data.games || []);
    } catch (error) {
      console.error('Failed to fetch featured games:', error);
      setGames([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Featured Games</h2>
          <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200"></div>
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
        <h2 className="text-3xl font-bold text-gray-900">Featured Games</h2>
        <Link
          href="/games?featured=true"
          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
        >
          <span>View All Featured</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      {!games || games.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-12 text-center">
          <Star className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No featured games yet</h3>
          <p className="text-gray-600">Check back soon for featured games!</p>
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
