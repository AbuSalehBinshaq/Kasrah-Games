'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Tag, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
  gameCount: number;
}

export default function AdminCategoriesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchCategories();
    }
  }, [user]);

  async function fetchCategories() {
    setLoading(true);
    try {
      // Use admin endpoint so we also get inactive categories
      const response = await fetch('/api/admin/categories?includeCounts=true');
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm('Are you sure you want to delete this category? Games in this category will be unaffected.')) return;

    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  }

  async function toggleCategoryActive(id: string, currentlyActive: boolean) {
    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentlyActive }),
      });

      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Failed to toggle category:', error);
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

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(search.toLowerCase()) ||
    category.slug.toLowerCase().includes(search.toLowerCase()) ||
    category.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Categories</h1>
            <p className="text-gray-900">Organize games into categories for better discovery</p>
          </div>
          <button
            onClick={() => router.push('/admin/categories/new')}
            className="flex items-center space-x-2 rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white hover:bg-primary-700"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Category</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories by name or description..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.length === 0 ? (
            <div className="col-span-full rounded-xl bg-gray-50 p-12 text-center">
              <Tag className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">No categories found</h3>
              <p className="text-gray-900">
                {search ? 'Try a different search term' : 'Get started by creating your first category'}
              </p>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.id} className="rounded-xl bg-white p-6 shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="flex h-12 w-12 items-center justify-center rounded-lg"
                      style={{ backgroundColor: category.color || '#6b7280' }}
                    >
                      {category.icon ? (
                        <span className="text-lg">{category.icon}</span>
                      ) : (
                        <Tag className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-900">/{category.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/admin/categories/${category.id}/edit`)}
                      className="rounded-lg p-2 text-blue-400 hover:bg-blue-50 hover:text-blue-500"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {category.description && (
                  <p className="mt-4 text-sm text-gray-900">{category.description}</p>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      category.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-900">
                      <TrendingUp className="h-4 w-4" />
                      <span>{category.gameCount} games</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCategoryActive(category.id, category.isActive)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      category.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {category.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Total Categories</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <div className="rounded-lg bg-primary-100 p-3">
                <Tag className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Active Categories</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {categories.filter(c => c.isActive).length}
                </p>
              </div>
              <div className="rounded-lg bg-green-100 p-3">
                <Tag className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Total Games in Categories</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {categories.reduce((sum, c) => sum + c.gameCount, 0)}
                </p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Average Games per Category</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {categories.length > 0 
                    ? Math.round(categories.reduce((sum, c) => sum + c.gameCount, 0) / categories.length)
                    : 0
                  }
                </p>
              </div>
              <div className="rounded-lg bg-purple-100 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
