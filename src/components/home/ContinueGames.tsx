'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchContinueGames();
  }, []);

  async function fetchContinueGames() {
    try {
      // جلب آخر الألعاب التي لعبها المستخدم من ملفه الشخصي
      const response = await fetch('/api/auth/profile', { credentials: 'include' });
      if (!response.ok) {
        // إذا كان غير مسجّل دخول أو أي خطأ، نخفي القسم
        setGames([]);
        return;
      }
      const data = await response.json();
      const recentGames = Array.isArray(data?.recentGames) ? data.recentGames : [];

      // تحويل البيانات لتناسب GameCard مع قيم افتراضية عند غياب بعض الحقول
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

      // ترتيب من الأحدث إلى الأقدم حسب آخر لعب
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

  // تحديث حالة الأسهم حسب موضع السلايدر
  const updateScrollState = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  // أزرار التمرير لليسار/اليمين
  const scrollByAmount = (direction: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    const next = direction === 'left' ? el.scrollLeft - amount : el.scrollLeft + amount;
    el.scrollTo({ left: next, behavior: 'smooth' });
  };

  useEffect(() => {
    updateScrollState();
  }, [games, updateScrollState]);


  // إخفاء القسم إذا لا توجد نتائج (أو غير مسجل/لا تاريخ لعب)
  if (!loading && (!games || games.length === 0)) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-8 md:py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Continue</h2>
          <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-200"></div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:gap-4 lg:grid-cols-4 lg:gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-36 sm:h-40 md:h-48 animate-pulse rounded-xl bg-gray-200"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-8 md:py-12 group">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Continue</h2>
        <Link
          href="/games?sort=recent"
          className="flex items-center space-x-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          <span>See all</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* سلايدر أفقي مع سحب في الجوال وأسهم في الديسكتوب */}
      <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
        <div
          ref={sliderRef}
          onScroll={updateScrollState}
          className="flex gap-2 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory md:gap-3 hide-scrollbar"
        >
          {games.map((game) => (
            <div
              key={game.id}
              className="snap-start flex-shrink-0 w-[calc(25%-0.375rem)] min-w-[calc(25%-0.375rem)] sm:w-[calc(25%-0.5rem)] sm:min-w-[calc(25%-0.5rem)] md:w-auto md:min-w-[280px] md:max-w-[320px]"
            >
              <GameCard game={game as any} viewMode="grid" compact hideDescription />
            </div>
          ))}
        </div>

        {/* أسهم فقط لسطح المكتب - تظهر عند hover */}
        <div className="pointer-events-none absolute inset-y-0 hidden items-center justify-between md:flex">
          <button
            onClick={() => scrollByAmount('left')}
            disabled={!canScrollLeft}
            className="pointer-events-auto ml-[-14px] rounded-full bg-white/90 p-2 shadow-lg ring-1 ring-black/5 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
          >
            <ArrowRight className="h-5 w-5 rotate-180 text-slate-800" />
          </button>
        </div>
        
        {/* السهم الأيمن في آخر السلايدر */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center md:flex">
          <button
            onClick={() => scrollByAmount('right')}
            disabled={!canScrollRight}
            className="pointer-events-auto mr-[-14px] rounded-full bg-white/90 p-2 shadow-lg ring-1 ring-black/5 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
          >
            <ArrowRight className="h-5 w-5 text-slate-800" />
          </button>
        </div>
      </div>
    </section>
  );
}

