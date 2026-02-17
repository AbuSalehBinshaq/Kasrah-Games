'use client';

import { useState } from 'react';
import { Grid, List, Filter } from 'lucide-react';
import GameCard from '@/components/common/GameCard';

interface Game {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  playCount: number;
  likes: number;
  dislikes: number;
  likePercentage: number;
  totalRatings: number;
  onlineCount?: number;
  avgRating?: number; // kept for legacy sort
  categoryNames: string[];
}

interface GameListProps {
  games: Game[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function GameList({ games, loading = false, emptyMessage = 'No games found' }: GameListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rating'>('newest');

  const sortedGames = [...games].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.playCount - a.playCount;
      case 'rating':
        return (b.likePercentage ?? b.avgRating ?? 0) - (a.likePercentage ?? a.avgRating ?? 0);
      case 'newest':
      default:
        return 0; // In real app, sort by date
    }
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-48 rounded-lg bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="rounded-xl bg-gray-50 p-12 text-center">
        <Filter className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-xl font-semibold text-gray-900">{emptyMessage}</h3>
        <p className="text-gray-600">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{games.length}</span> games
          </div>

          <div className="flex w-full items-center space-x-4 sm:w-auto">
            {/* Sort Dropdown */}
            <div className="flex-1 sm:flex-none">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-1 rounded-lg border border-gray-300 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-md p-2 ${
                  viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                }`}
                aria-label="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-md p-2 ${
                  viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sort Labels */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSortBy('newest')}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              sortBy === 'newest'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              sortBy === 'popular'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Most Played
          </button>
          <button
            onClick={() => setSortBy('rating')}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              sortBy === 'rating'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Top Rated
          </button>
        </div>
      </div>

      {/* Games Grid/List */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3' 
        : 'space-y-4'
      }>
        {sortedGames.map((game) => (
          <GameCard
            key={game.id}
            game={{
              ...game,
              // normalize defaults for GameCard
              thumbnail: game.thumbnail || '/images/placeholder-game.svg',
              likes: game.likes ?? 0,
              dislikes: game.dislikes ?? 0,
              likePercentage: game.likePercentage ?? 0,
              totalRatings: game.totalRatings ?? 0,
              onlineCount: game.onlineCount ?? 0,
            }}
            viewMode={viewMode}
          />
        ))}
      </div>

      {/* Load More (if applicable) */}
      {games.length >= 12 && (
        <div className="text-center">
          <button className="rounded-lg border border-gray-300 bg-white px-8 py-3 font-semibold text-gray-700 hover:bg-gray-50">
            Load More Games
          </button>
        </div>
      )}
    </div>
  );
}
