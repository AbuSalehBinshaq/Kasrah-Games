'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  if (!loading && (!games || games.length === 0)) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Continue</h2>
          <span className="text-primary-600 font-semibold text-lg">→</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square w-24 flex-shrink-0 animate-pulse rounded-2xl bg-gray-200"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Continue</h2>
        <span className="text-primary-600 font-semibold text-lg">→</span>
      </div>

      <div className="relative">
        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollBehavior: 'smooth' }}
        >
          {games.map((game) => (
            <div key={game.id} className="w-24 flex-shrink-0">
              <GameCard 
                game={game as any} 
                viewMode="grid" 
                hideDescription={true}
                aspectRatio="square"
                showOnlineCount={true}
              />
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-gray-900" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-gray-900" />
          </button>
        )}
      </div>
    </section>
  );
}
