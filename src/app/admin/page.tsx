'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Gamepad2, 
  Users, 
  Star, 
  Play, 
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import StatsCards from '@/components/admin/StatsCards';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface Stats {
  totalGames: number;
  totalUsers: number;
  totalPlays: number;
  avgRating: number;
  recentGames: any[];
  activeUsers: number;
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchStats();
    }
  }, [user]);

  async function fetchStats() {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }

  if (isLoading || isLoadingStats) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-900">Welcome back, {user.name || user.username}!</p>
        </div>

        {stats && <StatsCards stats={stats} />}

        {/* Recent Activity */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Games */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Games</h2>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats?.recentGames?.map(game => (
                <div key={game.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                      <Gamepad2 className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{game.title}</h3>
                      <p className="text-sm text-gray-900">{game.developer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{game.playCount} plays</span>
                    <div className="flex items-center text-sm text-gray-900">
                      <Star className="h-3 w-3 mr-1" />
                      {game.avgRating.toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/admin/games/new')}
                className="flex flex-col items-center justify-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <Gamepad2 className="h-8 w-8 text-primary-600 mb-2" />
                <span className="font-medium text-gray-900">Add Game</span>
              </button>
              <button
                onClick={() => router.push('/admin/categories')}
                className="flex flex-col items-center justify-center p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
              >
                <TrendingUp className="h-8 w-8 text-secondary-600 mb-2" />
                <span className="font-medium text-gray-900">Categories</span>
              </button>
              <button
                onClick={() => router.push('/admin/users')}
                className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Users className="h-8 w-8 text-green-600 mb-2" />
                <span className="font-medium text-gray-900">Users</span>
              </button>
              <button
                onClick={() => router.push('/admin/featured')}
                className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Star className="h-8 w-8 text-purple-600 mb-2" />
                <span className="font-medium text-gray-900">Featured</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
