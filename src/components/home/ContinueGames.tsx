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
  const [isDesktop, setIsDesktop] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const arrowTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchContinueGames();
    
    // Detect desktop
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

      const normalized = recentGames.map((game: any) => {
        const likes = game.likes || 0;
        const dislikes = game.dislikes || 0;
        const total = likes + dislikes;
        const likePercentage = total > 0 ? Math.round((likes / total) * 100) : 0;

        return {
          id: game.id,
          slug: game.slug,
          title: game.title,
          thumbnail: game.thumbnail || '/images/placeholder-game.svg',
          description: '',
          playCount: game.playCount || 0,
          lastPlayed: game.lastPlayed || game.startedAt || game.createdAt || null,
          likePercentage: game.likePercentage || likePercentage,
          likes: likes,
          dislikes: dislikes,
          totalRatings: game.totalRatings || total,
          onlineCount: game.onlineCount || 0,
          categoryNames: game.categoryNames || [],
        };
      });

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
      const scrollAmount = 120;
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

  const handleMouseEnter = () => {
    if (isDesktop) {
      setShowArrows(true);
      if (arrowTimeoutRef.current) clearTimeout(arrowTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (isDesktop) {
      arrowTimeoutRef.current = setTimeout(() => {
        setShowArrows(false);
      }, 2000);
    }
  };

  if (!loading && (!games || games.length === 0)) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-4">
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
    <section className="py-4">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Continue</h2>
        <span className="text-primary-600 font-semibold text-lg">→</span>
      </div>

      <div 
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Mobile Swipe */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto pb-2 scroll-smooth md:overflow-x-hidden"
          style={{ scrollBehavior: 'smooth' }}
        >
          {games.map((game) => (
            <div key={game.id} className="w-20 flex-shrink-0 md:hidden">
              <GameCard 
                game={game as any} 
                viewMode="grid" 
                hideDescription={true}
                aspectRatio="square"
                showOnlineCount={true}
                hideRatingText={false}
              />
            </div>
          ))}
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-4 gap-4">
          {games.map((game) => (
            <GameCard 
              key={game.id} 
              game={game as any} 
              viewMode="grid" 
              hideDescription={true}
              aspectRatio="square"
              showOnlineCount={true}
              hideRatingText={false}
            />
          ))}
        </div>

        {/* Navigation Buttons - Desktop Only */}
        {isDesktop && canScrollLeft && showArrows && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-gray-900" />
          </button>
        )}
        {isDesktop && canScrollRight && showArrows && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-gray-900" />
          </button>
        )}
      </div>
    </section>
  );
}
