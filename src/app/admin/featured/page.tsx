'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Search, Eye, X, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface Game {
  id: string;
  slug: string;
  title: string;
  developer: string;
  isFeatured: boolean;
  playCount: number;
  avgRating: number;
  thumbnail: string;
  categoryNames: string[];
}

export default function AdminFeaturedPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [allGames, setAllGames] = useState<Game[]>([]);
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchGames();
    }
  }, [user]);

  async function fetchGames() {
    setLoading(true);
    try {
      const [featuredResponse, allResponse] = await Promise.all([
        fetch('/api/admin/featured'),
        fetch('/api/admin/games?limit=100'),
      ]);

      const featuredData = await featuredResponse.json();
      const allData = await allResponse.json();

      setFeaturedGames(featuredData.games);
      setAllGames(allData.games.filter((g: Game) => !g.isFeatured));
    } catch (error) {
      console.error('Failed to fetch games:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addToFeatured(gameId: string) {
    try {
      const response = await fetch('/api/admin/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, featured: true }),
      });

      if (response.ok) {
        fetchGames();
      }
    } catch (error) {
      console.error('Failed to add to featured:', error);
    }
  }

  async function removeFromFeatured(gameId: string) {
    try {
      const response = await fetch('/api/admin/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, featured: false }),
      });

      if (response.ok) {
        fetchGames();
      }
    } catch (error) {
      console.error('Failed to remove from featured:', error);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const filteredGames = allGames.filter(game =>
    game.title.toLowerCase().includes(search.toLowerCase()) ||
    game.developer.toLowerCase().includes(search.toLowerCase()) ||
    (game.categoryNames || []).some(name => name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Featured Games Management</h1>
          <p className="text-gray-900">Select games to feature on the homepage and promotions</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Currently Featured Games */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Currently Featured</h2>
                <p className="text-sm text-gray-900">{featuredGames.length} games featured</p>
              </div>
              <div className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 p-2">
                <Star className="h-5 w-5 text-white" />
              </div>
            </div>

            {featuredGames.length === 0 ? (
              <div className="rounded-lg bg-gray-50 p-8 text-center">
                <Star className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">No featured games</h3>
                <p className="text-gray-900">Add games from the list on the right</p>
              </div>
            ) : (
              <div className="space-y-4">
                {featuredGames.map((game) => (
                  <div key={game.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={game.thumbnail || '/images/placeholder-game.svg'}
                        alt={game.title}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{game.title}</h4>
                        <p className="text-sm text-gray-900">{game.developer}</p>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{game.playCount || 0} plays</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="flex items-center text-xs text-yellow-600">
                            <Star className="mr-1 h-3 w-3" />
                            {game.avgRating != null ? game.avgRating.toFixed(1) : '0.0'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/games/${game.slug}`)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeFromFeatured(game.id)}
                        className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-500"
                        title="Remove from featured"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Games to Feature */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="mb-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search games to feature..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Available Games</h2>
              <p className="text-sm text-gray-900">{filteredGames.length} games available</p>
            </div>

            {filteredGames.length === 0 ? (
              <div className="rounded-lg bg-gray-50 p-8 text-center">
                <Filter className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {search ? 'No matching games found' : 'No games available'}
                </h3>
                <p className="text-gray-900">
                  {search ? 'Try a different search term' : 'All games are already featured'}
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {filteredGames.map((game) => (
                  <div key={game.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={game.thumbnail || '/images/placeholder-game.svg'}
                        alt={game.title}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{game.title}</h4>
                        <p className="text-sm text-gray-900">{game.developer}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {(game.categoryNames || []).slice(0, 2).map((category) => (
                            <span
                              key={category}
                              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-900"
                            >
                              {category}
                            </span>
                          ))}
                          <span className="text-xs text-gray-500">{game.playCount || 0} plays</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => addToFeatured(game.id)}
                      className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white hover:from-yellow-600 hover:to-orange-600"
                    >
                      <Star className="h-4 w-4" />
                      <span>Feature</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Featured Guidelines */}
        <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 p-6">
          <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
            <Star className="mr-2 h-5 w-5 text-yellow-600" />
            Featured Games Guidelines
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Quality Standards</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-yellow-500" />
                  <span>High user ratings (4.0+)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-yellow-500" />
                  <span>Good performance & stability</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-yellow-500" />
                  <span>Positive user reviews</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Diversity Goals</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-orange-500" />
                  <span>Mix of game genres</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-orange-500" />
                  <span>Balance new and classic games</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-orange-500" />
                  <span>Represent different developers</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Best Practices</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-red-500" />
                  <span>Rotate featured games monthly</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-red-500" />
                  <span>Limit to 6-8 featured games</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-red-500" />
                  <span>Monitor featured game performance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
