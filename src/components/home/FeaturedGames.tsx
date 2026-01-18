'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import GameCard from '@/components/common/GameCard';

export default function FeaturedGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const arrowTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchFeaturedGames();
    
    // Detect desktop
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function fetchFeaturedGames() {
    try {
      const response = await fetch('/api/games?featured=true&limit=20');
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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
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

  if (loading) {
    return (
      <section className="py-8">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="aspect-video w-48 flex-shrink-0 md:w-auto animate-pulse rounded-2xl bg-gray-200"
            ></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured</h2>
      </div>

      {!games || games.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-12 text-center">
          <Star className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No featured games yet</h3>
        </div>
      ) : (
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
            {games.map((game: any, index: number) => (
              <div key={game.id} className="w-48 flex-shrink-0 md:hidden">
                <GameCard 
                  game={game} 
                  viewMode="grid" 
                  hideDescription={true}
                  aspectRatio="video"
                  priority={index < 2}
                />
              </div>
            ))}
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {games.map((game: any, index: number) => (
              <GameCard 
                key={game.id}
                game={game} 
                viewMode="grid" 
                hideDescription={true}
                aspectRatio="video"
                priority={index < 4}
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
              <ChevronLeft className="h-6 w-6 text-gray-900" />
            </button>
          )}
          {isDesktop && canScrollRight && showArrows && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all opacity-100"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6 text-gray-900" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
