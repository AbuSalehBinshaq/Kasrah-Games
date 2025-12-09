'use client';

import { useState, useEffect } from 'react';
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

export default function GamesPage() {
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
      console.error('Failed to fetch games:', error);
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
    params.set('page', '1'); // Reset to first page when filters change
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

      {/* Filters and Search */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <SearchBar initialValue={search} />
          </div>
          <div className="flex items-center space-x-4">
            <CategoryFilter selectedCategory={category} />
            <select
              value={sort}
              onChange={(e) => updateSearchParams('sort', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="newest">Newest First</option>
              <option value="trending">Trending</option>
              <option value="relevance">Best Match</option>
              <option value="popular">Most Played</option>
              <option value="views">Most Viewed</option>
              <option value="likes">Most Liked</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {games.length} of {pagination.total} games
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-2 ${
                viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg p-2 ${
                viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recommended for you</h2>
          {loadingReco && <span className="text-sm text-gray-500">Loading...</span>}
        </div>
        {recommended.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommended.map((game) => (
              <GameCard key={`reco-${game.id}`} game={game} viewMode="grid" />
            ))}
          </div>
        )}
      </div>

      {/* Games Grid/List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : games.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-12 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No games found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-6'}>
            {games.map((game) => (
              <GameCard key={game.id} game={game} viewMode={viewMode} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-2">
              <button
                onClick={() => updateSearchParams('page', (page - 1).toString())}
                disabled={!pagination.hasPrevPage}
                className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-50"
              >
                Previous
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, page - 2)) + i;
                  if (pageNum > pagination.totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => updateSearchParams('page', pageNum.toString())}
                      className={`h-10 w-10 rounded-lg ${
                        pageNum === page
                          ? 'bg-primary-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => updateSearchParams('page', (page + 1).toString())}
                disabled={!pagination.hasNextPage}
                className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}