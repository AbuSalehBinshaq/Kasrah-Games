'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import GameCard from '@/components/common/GameCard';

export default function FeaturedGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedGames();
  }, []);

  async function fetchFeaturedGames() {
    try {
      const response = await fetch('/api/games?featured=true&limit=8');
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      const data = await response.json();
      setGames(data.games || []);
    } catch (error) {
      console.error('Failed to fetch featured games:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Featured</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-xl bg-gray-200"
            ></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Featured</h2>
        <Link
          href="/games?featured=true"
          className="text-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          See all →
        </Link>
      </div>

      {!games || games.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-12 text-center">
          <Star className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No featured games yet</h3>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-2">
          {games.map((game: any, index: number) => (
            <GameCard 
              key={game.id}
              game={game} 
              viewMode="grid" 
              hideDescription={true}
              priority={index < 2}
            />
          ))}
        </div>
      )}
    </section>
  );
}
