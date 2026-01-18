'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Play, Loader2 } from 'lucide-react';
import GameCard from '@/components/common/GameCard';

export default function PopularGames() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const limit = 12;
  
  const observerTarget = useRef(null);

  const fetchPopularGames = useCallback(async (pageNum: number, isInitial: boolean = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await fetch(`/api/games?sort=popular&limit=${limit}&page=${pageNum}`);
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      const data = await response.json();
      
      if (isInitial) {
        setGames(data.games || []);
      } else {
        setGames(prev => [...prev, ...(data.games || [])]);
      }
      
      setHasNextPage(data.pagination?.hasNextPage || false);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch popular games:', error);
      if (isInitial) setGames([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPopularGames(1, true);
  }, [fetchPopularGames]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !loadingMore && !loading) {
          fetchPopularGames(page + 1);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasNextPage, loadingMore, loading, page, fetchPopularGames]);

  if (loading) {
    return (
      <section className="py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
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
        <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
        <Link
          href="/games?sort=popular"
          className="text-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          See all →
        </Link>
      </div>

      {!games || games.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-12 text-center">
          <Play className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No games yet</h3>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-2">
            {games.map((game: any) => (
              <GameCard key={game.id} game={game} viewMode="grid" hideDescription={true} />
            ))}
          </div>

          <div ref={observerTarget} className="mt-8 flex justify-center">
            {loadingMore && (
              <div className="flex items-center gap-2 text-primary-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading more...</span>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
