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
  
  // مرجع للعنصر الذي سنراقبه في نهاية القائمة
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

  // التحميل الأولي
  useEffect(() => {
    fetchPopularGames(1, true);
  }, [fetchPopularGames]);

  // إعداد Intersection Observer لمراقبة التمرير
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !loadingMore && !loading) {
          fetchPopularGames(page + 1);
        }
      },
      { threshold: 0.1, rootMargin: '100px' } // يبدأ التحميل قبل الوصول للنهاية بـ 100 بكسل
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
      <section className="py-8 md:py-12">
        <div className="mb-6 h-10 w-48 animate-pulse rounded bg-gray-200"></div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:gap-4 lg:grid-cols-4 lg:gap-5">
          {[...Array(limit)].map((_, i) => (
            <div
              key={i}
              className="h-36 sm:h-40 md:h-48 animate-pulse rounded-xl bg-gray-200"
            ></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
          <p className="text-sm text-gray-600">Based on what players love</p>
        </div>
        <Link
          href="/games?sort=popular"
          className="rounded-full border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50"
        >
          See all
        </Link>
      </div>

      {!games || games.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-12 text-center">
          <Play className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No games yet</h3>
          <p className="text-gray-600">Be the first to play!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:gap-4 lg:grid-cols-4 lg:gap-5">
            {games.map((game: any) => (
              <div key={game.id}>
                <GameCard game={game} viewMode="grid" compact hideDescription />
              </div>
            ))}
          </div>

          {/* العنصر المراقب للتحميل اللانهائي */}
          <div ref={observerTarget} className="mt-10 flex h-20 justify-center items-center">
            {loadingMore && (
              <div className="flex items-center gap-2 text-primary-600 font-medium">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading more games...</span>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
