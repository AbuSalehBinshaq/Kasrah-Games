'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

interface SDKAd {
  id: string;
  gameId: string;
  adType: string;
  title: string;
  description?: string;
  impressions: number;
  clicks: number;
  revenue: number;
  isActive: boolean;
  createdAt: string;
}

export default function SDKAdsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [ads, setAds] = useState<SDKAd[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [games, setGames] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<SDKAd | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchGames();
    }
  }, [user]);

  useEffect(() => {
    if (selectedGame) {
      fetchAds();
    }
  }, [selectedGame]);

  async function fetchGames() {
    try {
      const response = await fetch('/api/admin/games');
      const data = await response.json();
      setGames(data);
      if (data.length > 0) {
        setSelectedGame(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }
  }

  async function fetchAds() {
    try {
      setIsLoadingAds(true);
      const response = await fetch(`/api/sdk/ads/manage?gameId=${selectedGame}`);
      const data = await response.json();
      setAds(data);
    } catch (error) {
      console.error('Failed to fetch ads:', error);
    } finally {
      setIsLoadingAds(false);
    }
  }

  async function handleDeleteAd(adId: string) {
    if (!confirm('هل تريد حذف هذا الإعلان؟')) return;

    try {
      const response = await fetch(`/api/sdk/ads/manage?id=${adId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAds(ads.filter(a => a.id !== adId));
      }
    } catch (error) {
      console.error('Failed to delete ad:', error);
    }
  }

  async function handleToggleActive(ad: SDKAd) {
    try {
      const response = await fetch('/api/sdk/ads/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ad.id,
          isActive: !ad.isActive,
        }),
      });

      if (response.ok) {
        setAds(ads.map(a => a.id === ad.id ? { ...a, isActive: !a.isActive } : a));
      }
    } catch (error) {
      console.error('Failed to toggle ad:', error);
    }
  }

  if (isLoading || isLoadingAds) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">إدارة الإعلانات</h1>
          <p className="text-gray-600">إدارة الإعلانات المتقدمة للألعاب</p>
        </div>

        {/* اختيار اللعبة */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            اختر اللعبة
          </label>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {games.map(game => (
              <option key={game.id} value={game.id}>
                {game.title}
              </option>
            ))}
          </select>
        </div>

        {/* زر إضافة إعلان */}
        <div className="mb-6">
          <button
            onClick={() => {
              setEditingAd(null);
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            إضافة إعلان جديد
          </button>
        </div>

        {/* جدول الإعلانات */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">العنوان</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">النوع</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">الانطباعات</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">النقرات</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">الإيرادات</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">الحالة</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {ads.map(ad => (
                <tr key={ad.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{ad.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ad.adType}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ad.impressions}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ad.clicks}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${ad.revenue.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleToggleActive(ad)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        ad.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {ad.isActive ? (
                        <>
                          <Eye className="h-3 w-3" />
                          نشط
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" />
                          معطل
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingAd(ad);
                          setShowForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {ads.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              لا توجد إعلانات لهذه اللعبة
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"
