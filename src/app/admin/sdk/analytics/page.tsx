'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Play, DollarSign } from 'lucide-react';

interface AnalyticsData {
  game: {
    id: string;
    gameId: string;
    title: string;
    playCount: number;
    views: number;
    totalRevenue: number;
  };
  period: string;
  stats: {
    totalSessions: number;
    totalAdImpressions: number;
    completedAds: number;
    totalRevenue: number;
    avgSessionDuration: number;
    ctr: number;
    totalEvents: number;
    uniqueUsers: number;
  };
}

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId');

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [period, setPeriod] = useState('day');
  const [games, setGames] = useState<any[]>([]);

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
    if (gameId) {
      fetchAnalytics();
    }
  }, [gameId, period]);

  async function fetchGames() {
    try {
      const response = await fetch('/api/admin/games');
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }
  }

  async function fetchAnalytics() {
    try {
      setIsLoadingAnalytics(true);
      const response = await fetch(`/api/sdk/analytics/stats?gameId=${gameId}&period=${period}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }

  if (isLoading || isLoadingAnalytics) {
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
          <h1 className="text-3xl font-bold text-gray-900">التحليلات والإحصائيات</h1>
          <p className="text-gray-600">تحليلات شاملة لأداء الألعاب والإعلانات</p>
        </div>

        {/* اختيار اللعبة والفترة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              اختر اللعبة
            </label>
            <select
              value={gameId || ''}
              onChange={(e) => router.push(`/admin/sdk/analytics?gameId=${e.target.value}`)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">-- اختر لعبة --</option>
              {games.map(game => (
                <option key={game.id} value={game.id}>
                  {game.title}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              الفترة الزمنية
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="day">اليوم</option>
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
              <option value="year">هذا العام</option>
            </select>
          </div>
        </div>

        {analytics && (
          <>
            {/* بطاقات الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">إجمالي الجلسات</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.stats.totalSessions}</p>
                  </div>
                  <Play className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">المستخدمون الفريدون</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.stats.uniqueUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">الإيرادات</p>
                    <p className="text-2xl font-bold text-gray-900">${analytics.stats.totalRevenue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">معدل النقر (CTR)</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.stats.ctr.toFixed(2)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* الرسوم البيانية */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* رسم بياني للإعلانات */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">الإعلانات</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    {
                      name: 'الإعلانات',
                      'الانطباعات': analytics.stats.totalAdImpressions,
                      'المكتملة': analytics.stats.completedAds,
                    },
                  ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="الانطباعات" fill="#7c3aed" />
                    <Bar dataKey="المكتملة" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* رسم بياني للإيرادات */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">الإيرادات</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'الإيرادات', value: analytics.stats.totalRevenue },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* معلومات إضافية */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات إضافية</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">متوسط مدة الجلسة</p>
                  <p className="text-xl font-bold text-gray-900">{analytics.stats.avgSessionDuration}s</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">إجمالي الأحداث</p>
                  <p className="text-xl font-bold text-gray-900">{analytics.stats.totalEvents}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">إجمالي الانطباعات</p>
                  <p className="text-xl font-bold text-gray-900">{analytics.stats.totalAdImpressions}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {!gameId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-900">اختر لعبة لعرض التحليلات</p>
          </div>
        )}
      </div>
    </div>
  );
}
