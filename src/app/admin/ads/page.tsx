'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Code,
  Calendar,
  MousePointerClick,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface Ad {
  id: string;
  title: string;
  type: 'CUSTOM' | 'CODE';
  position: 'HEADER' | 'SIDEBAR' | 'FOOTER' | 'IN_CONTENT' | 'POPUP';
  isActive: boolean;
  imageUrl?: string | null;
  clickUrl?: string | null;
  code?: string | null;
  impressions: number;
  clicks: number;
  startDate?: string | null;
  endDate?: string | null;
  targetUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminAdsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'CUSTOM' as 'CUSTOM' | 'CODE',
    position: 'SIDEBAR' as Ad['position'],
    imageUrl: '',
    clickUrl: '',
    code: '',
    startDate: '',
    endDate: '',
    targetUrl: '',
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAds();
    }
  }, [user]);

  async function fetchAds() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/ads');
      const data = await response.json();
      setAds(data.ads || []);
    } catch (error) {
      console.error('Failed to fetch ads:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addDemoAds() {
    if (!confirm('This will add 3 demo ads. Continue?')) return;

    setLoading(true);
    try {
      const demoAds = [
        {
          title: 'Demo Ad - Sidebar Banner',
          type: 'CUSTOM',
          position: 'SIDEBAR',
          imageUrl: 'https://via.placeholder.com/300x250/4F46E5/FFFFFF?text=Demo+Ad+1',
          clickUrl: 'https://example.com',
          isActive: true,
        },
        {
          title: 'Demo Ad - Header Banner',
          type: 'CUSTOM',
          position: 'HEADER',
          imageUrl: 'https://via.placeholder.com/728x90/10B981/FFFFFF?text=Demo+Ad+2',
          clickUrl: 'https://example.com',
          isActive: true,
        },
        {
          title: 'Demo Ad - Custom Code',
          type: 'CODE',
          position: 'SIDEBAR',
          code: '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; color: white; text-align: center;"><h3 style="margin: 0 0 10px 0;">Special Offer!</h3><p style="margin: 0;">Get 50% off today</p><a href="https://example.com" style="display: inline-block; margin-top: 10px; padding: 8px 16px; background: white; color: #667eea; text-decoration: none; border-radius: 4px; font-weight: bold;">Learn More</a></div>',
          isActive: true,
        },
      ];

      for (const ad of demoAds) {
        await fetch('/api/admin/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ad),
        });
      }

      alert('Demo ads added successfully!');
      fetchAds();
    } catch (error) {
      console.error('Failed to add demo ads:', error);
      alert('Failed to add demo ads');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const url = editingAd
        ? `/api/admin/ads/${editingAd.id}`
        : '/api/admin/ads';
      const method = editingAd ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingAd(null);
        resetForm();
        fetchAds();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save ad');
      }
    } catch (error) {
      console.error('Failed to save ad:', error);
      alert('Failed to save ad');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    try {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAds();
      } else {
        alert('Failed to delete ad');
      }
    } catch (error) {
      console.error('Failed to delete ad:', error);
      alert('Failed to delete ad');
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchAds();
      }
    } catch (error) {
      console.error('Failed to toggle ad status:', error);
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      type: 'CUSTOM',
      position: 'SIDEBAR',
      imageUrl: '',
      clickUrl: '',
      code: '',
      startDate: '',
      endDate: '',
      targetUrl: '',
      isActive: true,
    });
    setEditingAd(null);
  }

  function openEditModal(ad: Ad) {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      type: ad.type,
      position: ad.position,
      imageUrl: ad.imageUrl || '',
      clickUrl: ad.clickUrl || '',
      code: ad.code || '',
      startDate: ad.startDate ? ad.startDate.split('T')[0] : '',
      endDate: ad.endDate ? ad.endDate.split('T')[0] : '',
      targetUrl: ad.targetUrl || '',
      isActive: ad.isActive,
    });
    setShowModal(true);
  }

  function openNewModal() {
    resetForm();
    setShowModal(true);
  }

  const positionLabels: Record<Ad['position'], string> = {
    HEADER: 'Header',
    SIDEBAR: 'Sidebar',
    FOOTER: 'Footer',
    IN_CONTENT: 'In Content',
    POPUP: 'Popup',
  };

  const ctr = (ad: Ad) => {
    if (ad.impressions === 0) return 0;
    return ((ad.clicks / ad.impressions) * 100).toFixed(2);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <LoadingSpinner />
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
            <h1 className="text-3xl font-bold text-gray-900">Ads Management</h1>
            <p className="text-gray-600">Manage advertisements and promotional content</p>
          </div>
          <div className="flex items-center space-x-3">
            {ads.length === 0 && (
              <button
                onClick={addDemoAds}
                className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Megaphone className="h-5 w-5" />
                <span>Add Demo Ads</span>
              </button>
            )}
            <button
              onClick={openNewModal}
              className="flex items-center space-x-2 rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white hover:bg-primary-700"
            >
              <Plus className="h-5 w-5" />
              <span>New Ad</span>
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Total Ads</div>
            <div className="text-2xl font-bold text-gray-900">{ads.length}</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Active Ads</div>
            <div className="text-2xl font-bold text-green-600">
              {ads.filter((a) => a.isActive).length}
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Total Impressions</div>
            <div className="text-2xl font-bold text-blue-600">
              {ads.reduce((sum, a) => sum + a.impressions, 0).toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Total Clicks</div>
            <div className="text-2xl font-bold text-purple-600">
              {ads.reduce((sum, a) => sum + a.clicks, 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Ads List */}
        <div className="rounded-xl bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Ad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No ads yet. Create your first ad to get started.
                    </td>
                  </tr>
                ) : (
                  ads.map((ad) => (
                    <tr key={ad.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{ad.title}</div>
                        {ad.startDate || ad.endDate ? (
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <Calendar className="mr-1 h-3 w-3" />
                            {ad.startDate
                              ? new Date(ad.startDate).toLocaleDateString()
                              : 'No start'}
                            {' - '}
                            {ad.endDate
                              ? new Date(ad.endDate).toLocaleDateString()
                              : 'No end'}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium ${
                            ad.type === 'CUSTOM'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {ad.type === 'CUSTOM' ? (
                            <>
                              <ImageIcon className="h-3 w-3" />
                              <span>Custom</span>
                            </>
                          ) : (
                            <>
                              <Code className="h-3 w-3" />
                              <span>Code</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {positionLabels[ad.position]}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center text-gray-600">
                            <TrendingUp className="mr-1 h-4 w-4" />
                            {ad.impressions.toLocaleString()} views
                          </div>
                          <div className="mt-1 flex items-center text-gray-600">
                            <MousePointerClick className="mr-1 h-4 w-4" />
                            {ad.clicks.toLocaleString()} clicks
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            CTR: {ctr(ad)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(ad.id, ad.isActive)}
                          className={`inline-flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium ${
                            ad.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {ad.isActive ? (
                            <>
                              <Eye className="h-3 w-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(ad)}
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ad.id)}
                            className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
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
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl" style={{ color: '#111827' }}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingAd ? 'Edit Ad' : 'Create New Ad'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    style={{ color: '#111827' }}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as 'CUSTOM' | 'CODE',
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      style={{ color: '#111827' }}
                      required
                    >
                      <option value="CUSTOM" style={{ color: '#111827' }}>Custom (Image + Link)</option>
                      <option value="CODE" style={{ color: '#111827' }}>Code (JS/HTML)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Position *
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          position: e.target.value as Ad['position'],
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      style={{ color: '#111827' }}
                      required
                    >
                      <option value="HEADER" style={{ color: '#111827' }}>Header</option>
                      <option value="SIDEBAR" style={{ color: '#111827' }}>Sidebar</option>
                      <option value="FOOTER" style={{ color: '#111827' }}>Footer</option>
                      <option value="IN_CONTENT" style={{ color: '#111827' }}>In Content</option>
                      <option value="POPUP" style={{ color: '#111827' }}>Popup</option>
                    </select>
                  </div>
                </div>

                {formData.type === 'CUSTOM' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Image URL *
                      </label>
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, imageUrl: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        style={{ color: '#111827' }}
                        required={formData.type === 'CUSTOM'}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Click URL *
                      </label>
                      <input
                        type="url"
                        value={formData.clickUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, clickUrl: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        style={{ color: '#111827' }}
                        required={formData.type === 'CUSTOM'}
                        placeholder="https://example.com"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Code (JS/HTML) *
                    </label>
                    <textarea
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      rows={8}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      style={{ color: '#111827' }}
                      required={formData.type === 'CODE'}
                      placeholder="<script>...</script> or <div>...</div>"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      style={{ color: '#111827' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      style={{ color: '#111827' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Target URL (for tracking)
                  </label>
                  <input
                    type="url"
                    value={formData.targetUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, targetUrl: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    style={{ color: '#111827' }}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
                  >
                    {editingAd ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

