'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useRef } from 'react';
import { ChevronRight, Info, X } from 'lucide-react';
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

interface SectionProps {
  title: string;
  games: Game[];
  sort: string;
  infoText: string;
}

function GameSection({ title, games, sort, infoText }: SectionProps) {
  const [showInfo, setShowInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative">
      <div className="mb-4 flex items-center justify-between px-4 md:px-0">
        <Link 
          href={`/games/browse?sort=${sort}`}
          className="group flex items-center gap-2"
        >
          <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h2>
          <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </Link>
        
        <div className="relative">
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition-colors"
          >
            <Info className="h-5 w-5 text-gray-600" />
          </button>
          
          {showInfo && (
            <div className="absolute right-0 top-10 z-50 w-72 rounded-xl bg-white p-5 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-900 text-lg">{title}</span>
                <button onClick={() => setShowInfo(false)}>
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {infoText}
              </p>
            </div>
          )}
        </div>
      </div>

      {title === "Top Playing Now" && (
        <p className="mb-4 px-4 md:px-0 text-xs text-gray-500 font-medium uppercase tracking-wider">
          Results for all devices and locations
        </p>
      )}

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-6 px-4 md:px-0 no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {games.map((game) => (
          <div key={game.id} className="w-[140px] flex-shrink-0 sm:w-[160px] md:w-[180px]">
            <GameCard 
              game={game} 
              viewMode="grid"
              aspectRatio="square"
              hideRatingText={false}
              showOnlineCount={true}
            />
          </div>
        ))}
        {games.length >= 25 && (
          <Link 
            href={`/games/browse?sort=${sort}`}
            className="flex w-[140px] flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors border-2 border-dashed border-gray-200"
          >
            <div className="rounded-full bg-white p-3 shadow-sm mb-2">
              <ChevronRight className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-gray-900">See All</span>
          </Link>
        )}
      </div>
    </section>
  );
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
      const [trendingRes, upcomingRes, playingRes] = await Promise.all([
        fetch('/api/games?sort=popular&limit=25'),
        fetch('/api/games?sort=newest&limit=25'),
        fetch('/api/games?sort=trending&limit=25')
      ]);

      const [trendingData, upcomingData, playingData] = await Promise.all([
        trendingRes.json(),
        upcomingRes.json(),
        playingRes.json()
      ]);

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
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 py-8">
      <GameSection 
        title="Top Trending" 
        games={topTrending} 
        sort="popular"
        infoText="Experiences with the largest increase in time spent over the past two weeks, sorted by their number of daily users. These experiences have at least 5,000 daily users, are within the top 10% of daily active users, or are among the top 30 most played experiences."
      />

      <GameSection 
        title="Up-and-Coming" 
        games={upAndComing} 
        sort="newest"
        infoText="The newest experiences that are quickly gaining popularity and attracting a growing number of players on the platform."
      />

      <GameSection 
        title="Top Playing Now" 
        games={topPlayingNow} 
        sort="trending"
        infoText="The experiences with the highest number of active players at this very moment from all around the world."
      />
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
