'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Eye, Star, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface Game {
  id: string;
  title: string;
  slug: string;
  developer: string;
  isFeatured: boolean;
  isPublished: boolean;
  playCount: number;
  onlineCount?: number;
  views: number;
  likes: number;
  dislikes: number;
  totalRatings: number;
  thumbnail: string;
  createdAt: string;
  categories: Array<{
    category: {
      name: string;
    };
  }>;
}

export default function AdminGamesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'unpublished' | 'featured'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'plays' | 'views' | 'likes' | 'online' | 'votes'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchGames();
    }
  }, [user, currentPage, filter, search, sort]);

  async function fetchGames() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(search && { search }),
        ...(filter !== 'all' && { filter }),
        sort,
      });

      const response = await fetch(`/api/admin/games?${params}`);
      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data.error || 'Failed to fetch games');
        setGames([]);
        setTotalPages(1);
        return;
      }

      if (data.error) {
        console.error('API returned error:', data.error);
      }

      setGames(Array.isArray(data.games) ? data.games : []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch games:', error);
      setGames([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  async function deleteGame(id: string) {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      const response = await fetch(`/api/admin/games/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchGames();
      }
    } catch (error) {
      console.error('Failed to delete game:', error);
    }
  }

  async function toggleFeatured(id: string, currentlyFeatured: boolean) {
    try {
      const response = await fetch('/api/admin/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: id, featured: !currentlyFeatured }),
      });

      if (response.ok) {
        fetchGames();
      }
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  }

  async function togglePublished(id: string, currentlyPublished: boolean) {
    try {
      const response = await fetch(`/api/admin/games/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentlyPublished }),
      });

      if (response.ok) {
        fetchGames();
      }
    } catch (error) {
      console.error('Failed to toggle published:', error);
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

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Games</h1>
            <p className="text-gray-900">Add, edit, or remove games from the platform</p>
          </div>
          <button
            onClick={() => router.push('/admin/games/new')}
            className="flex items-center space-x-2 rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white hover:bg-primary-700"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Game</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search games by title, developer, or description..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>
            </div>
            <div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 px-4 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                <option value="all">All Games</option>
                <option value="published">Published Only</option>
                <option value="unpublished">Unpublished Only</option>
                <option value="featured">Featured Only</option>
              </select>
            </div>
            <div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 px-4 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="plays">Most Played</option>
                <option value="views">Most Viewed</option>
                <option value="likes">Most Liked</option>
                <option value="online">Most Online</option>
                <option value="votes">Most Votes</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-full px-3 py-1 text-sm ${
                filter === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({games?.length || 0})
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`rounded-full px-3 py-1 text-sm ${
                filter === 'published'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setFilter('unpublished')}
              className={`rounded-full px-3 py-1 text-sm ${
                filter === 'unpublished'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Unpublished
            </button>
            <button
              onClick={() => setFilter('featured')}
              className={`rounded-full px-3 py-1 text-sm ${
                filter === 'featured'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Featured
            </button>
          </div>
        </div>

        {/* Games Table */}
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
                    Game
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
                    Developer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
                Status
                  </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
                <button onClick={() => setSort('online')} className="flex items-center gap-1 hover:text-primary-700">
                  Online
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
                <button onClick={() => setSort('views')} className="flex items-center gap-1 hover:text-primary-700">
                  Views
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
                <button onClick={() => setSort('votes')} className="flex items-center gap-1 hover:text-primary-700">
                  Votes
                </button>
              </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {!games || games.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="mx-auto max-w-md">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                          <Filter className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">No games found</h3>
                        <p className="text-gray-900">
                          {search ? 'Try a different search term' : 'Get started by adding your first game'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  games.map((game) => (
                    <tr key={game.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={game.thumbnail || '/images/placeholder-game.svg'}
                              alt={game.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{game.title}</div>
                            <div className="text-sm text-gray-500">
                              {game.categories?.slice(0, 2).map((c) => c.category.name).join(', ')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{game.developer}</div>
                        <div className="text-sm text-gray-500">{game.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="mb-2 text-sm text-gray-900">{game.playCount || 0} plays</div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 rounded-lg bg-green-50 px-2 py-1">
                            <span className="text-lg">👍</span>
                            <span className="text-sm font-semibold text-green-700">{game.likes || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1 rounded-lg bg-red-50 px-2 py-1">
                            <span className="text-lg">👎</span>
                            <span className="text-sm font-semibold text-red-700">{game.dislikes || 0}</span>
                          </div>
                        </div>
                        {game.totalRatings > 0 && (
                          <div className="mt-1 text-xs text-gray-500">
                            Total: {game.totalRatings} votes
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              game.isPublished
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {game.isPublished ? 'Published' : 'Draft'}
                          </span>
                          {game.isFeatured && (
                            <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{game.onlineCount?.toLocaleString() || 0}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{game.views?.toLocaleString() || 0}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{game.totalRatings?.toLocaleString() || 0}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/games/${game.slug}`)}
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/games/${game.id}/edit`)}
                            className="rounded-lg p-2 text-blue-400 hover:bg-blue-50 hover:text-blue-500"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleFeatured(game.id, game.isFeatured)}
                            className={`rounded-lg p-2 ${
                              game.isFeatured
                                ? 'text-yellow-500 hover:bg-yellow-50'
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            title={game.isFeatured ? 'Remove from featured' : 'Add to featured'}
                          >
                            <Star className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteGame(game.id)}
                            className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
