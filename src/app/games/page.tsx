'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, Grid, List, Search } from 'lucide-react';
import GameCard from '@/components/common/GameCard';
import SearchBar from '@/components/common/SearchBar';
import CategoryFilter from '@/components/common/CategoryFilter';
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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function GamesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommended, setRecommended] = useState<Game[]>([]);
  const [loadingReco, setLoadingReco] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchGames();
  }, [search, category, tag, sort, page]);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  async function fetchGames() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search,
        category,
        tag,
        sort,
      });

      const response = await fetch(`/api/games?${params}`);
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
      setPagination(data.pagination);
    } catch (error) {
      console.error('Games fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchRecommendations() {
    setLoadingReco(true);
    try {
      const response = await fetch(`/api/games/recommendations?limit=6`);
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
      setRecommended(normalized);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoadingReco(false);
    }
  }

  function updateSearchParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/games?${params.toString()}`);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Browse Games</h1>
        <p className="text-gray-600">
          Discover our collection of HTML5 and WebGL games. Filter by category or search for specific games.
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <SearchBar
          value={search}
          onChange={(value) => updateSearchParams('search', value)}
          placeholder="Search games..."
        />

        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <CategoryFilter
            value={category}
            onChange={(value) => updateSearchParams('category', value)}
          />

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : games.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No games found. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
                : 'mb-8 space-y-4'
            }
          >
            {games.map((game) => (
              <GameCard key={game.id} game={game} viewMode={viewMode} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 py-8">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => updateSearchParams('page', pageNum.toString())}
                  className={`px-4 py-2 rounded ${
                    pageNum === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
          )}
        </>
      )}
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
