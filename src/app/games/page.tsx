'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import GameCard from '@/components/common/GameCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

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

function GamesPageContent() {
  const [topTrending, setTopTrending] = useState<Game[]>([]);
  const [upAndComing, setUpAndComing] = useState<Game[]>([]);
  const [topPlayingNow, setTopPlayingNow] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllSections();
  }, []);

  async function fetchAllSections() {
    setIsLoading(true);
    try {
      // Fetch Top Trending (popular games with high ratings)
      const trendingResponse = await fetch('/api/games?sort=popular&limit=12');
      const trendingData = await trendingResponse.json();
      
      // Fetch Up-and-Coming (newest games)
      const upcomingResponse = await fetch('/api/games?sort=newest&limit=12');
      const upcomingData = await upcomingResponse.json();
      
      // Fetch Top Playing Now (games with most online players)
      const playingResponse = await fetch('/api/games?sort=trending&limit=12');
      const playingData = await playingResponse.json();

      const normalizeGames = (games: any[]) => 
        Array.isArray(games)
          ? games.map((g: any) => ({
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

      setTopTrending(normalizeGames(trendingData.games));
      setUpAndComing(normalizeGames(upcomingData.games));
      setTopPlayingNow(normalizeGames(playingData.games));
    } catch (error) {
      console.error('Failed to fetch games:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Top Trending Section */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Top Trending
            <ChevronRight className="h-8 w-8" />
          </h2>
          <button className="rounded-full bg-gray-100 p-3 hover:bg-gray-200 transition-colors">
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01"/>
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {topTrending.map((game) => (
            <GameCard 
              key={game.id} 
              game={game} 
              viewMode="grid"
              aspectRatio="square"
              hideRatingText={false}
            />
          ))}
        </div>
      </section>

      {/* Up-and-Coming Section */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Up-and-Coming
            <ChevronRight className="h-8 w-8" />
          </h2>
          <button className="rounded-full bg-gray-100 p-3 hover:bg-gray-200 transition-colors">
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01"/>
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {upAndComing.map((game) => (
            <GameCard 
              key={game.id} 
              game={game} 
              viewMode="grid"
              aspectRatio="square"
              hideRatingText={false}
            />
          ))}
        </div>
      </section>

      {/* Top Playing Now Section */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Top Playing Now
            <ChevronRight className="h-8 w-8" />
          </h2>
          <button className="rounded-full bg-gray-100 p-3 hover:bg-gray-200 transition-colors">
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01"/>
            </svg>
          </button>
        </div>
        <p className="mb-6 text-sm text-gray-600">Results for all devices and locations</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {topPlayingNow.map((game) => (
            <GameCard 
              key={game.id} 
              game={game} 
              viewMode="grid"
              aspectRatio="square"
              hideRatingText={false}
              showOnlineCount={true}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GamesPageContent />
    </Suspense>
  );
}
