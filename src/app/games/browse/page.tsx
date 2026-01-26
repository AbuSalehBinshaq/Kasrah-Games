'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import GameCard from '@/components/common/GameCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Link from 'next/link';

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
  views?: number;
  categoryNames: string[];
  tags?: string[];
}

function BrowsePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sort = searchParams.get('sort') || 'popular';
  
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const sortTitles: Record<string, string> = {
    popular: 'Top Trending',
    newest: 'Up-and-Coming',
    trending: 'Top Playing Now'
  };

  useEffect(() => {
    fetchGames();
  }, [sort]);

  async function fetchGames() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/games?sort=${sort}&limit=50`);
      const data = await response.json();
      
      const normalized = Array.isArray(data.games)
        ? data.games.map((g: any) => ({
            ...g,
            likes: g.likes ?? 0,
            dislikes: g.dislikes ?? 0,
            likePercentage: g.likePercentage ?? 0,
            totalRatings: g.totalRatings ?? 0,
            onlineCount: g.onlineCount ?? 0,
            playCount: g.playCount ?? 0,
            thumbnail: g.thumbnail ?? '/images/placeholder-game.svg',
            description: g.description ?? g.shortDescription ?? '',
          }))
        : [];
      setGames(normalized);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto py-6 md:py-8 px-4">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
          <Link 
            href="/games"
            className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
          </Link>
          <div className="flex-1">
            <select 
              value={sort}
              onChange={(e) => router.push(`/games/browse?sort=${e.target.value}`)}
              className="bg-gray-50 border border-gray-200 text-gray-900 text-xs md:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 md:p-2.5 font-bold"
            >
              <option value="popular">Top Trending</option>
              <option value="newest">Up-and-Coming</option>
              <option value="trending">Top Playing Now</option>
            </select>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {sortTitles[sort] || 'Browse Games'}
        </h1>
      </div>

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
          {games.map((game) => (
            <div key={game.id} className="w-full">
              <GameCard 
                game={game} 
                viewMode="grid"
                aspectRatio="square"
                showOnlineCount={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BrowsePageContent />
    </Suspense>
  );
}
