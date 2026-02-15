'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Trash2, Download, Eye, EyeOff } from 'lucide-react';

interface GameData {
  id: string;
  userId: string;
  gameId: string;
  key: string;
  value: any;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export default function DataManagementPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [gameData, setGameData] = useState<GameData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [games, setGames] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState<string>('');
  const [totalSize, setTotalSize] = useState(0);

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
      fetchGameData();
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

  async function fetchGameData() {
    try {
      setIsLoadingData(true);
      const response = await fetch(`/api/admin/game-data?gameId=${selectedGame}`);
      const data = await response.json();
      setGameData(data);
      const total = data.reduce((sum: number, item: GameData) => sum + item.size, 0);
      setTotalSize(total);
    } catch (error) {
      console.error('Failed to fetch game data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }

  async function handleDeleteData(id: string) {
    if (!confirm('هل تريد حذف هذه البيانات؟')) return;

    try {
      const response = await fetch(`/api/sdk/data/save-advanced?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGameData(gameData.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete data:', error);
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  if (isLoading || isLoadingData) {
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
          <h1 className="text-3xl font-bold text-gray-900">إدارة البيانات السحابية</h1>
          <p className="text-gray-600">إدارة بيانات اللاعبين المحفوظة سحابياً</p>
        </div>

        {/* اختيار اللعبة */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            اختر اللعبة
          </label>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {games.map(game => (
              <option key={game.id} value={game.id}>
                {game.title}
              </option>
            ))}
          </select>
        </div>

        {/* إحصائيات البيانات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">إجمالي السجلات</p>
            <p className="text-2xl font-bold text-gray-900">{gameData.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">إجمالي الحجم</p>
            <p className="text-2xl font-bold text-gray-900">{formatBytes(totalSize)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">متوسط حجم السجل</p>
            <p className="text-2xl font-bold text-gray-900">
              {gameData.length > 0 ? formatBytes(totalSize / gameData.length) : '0 B'}
            </p>
          </div>
        </div>

        {/* جدول البيانات */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">معرّف المستخدم</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">المفتاح</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">الحجم</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">آخر تحديث</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {gameData.map(data => (
                <tr key={data.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {data.userId.substring(0, 12)}...
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{data.key}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatBytes(data.size)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(data.updatedAt).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDetails(showDetails === data.id ? '' : data.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="عرض التفاصيل"
                      >
                        {showDetails === data.id ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteData(data.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {gameData.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              لا توجد بيانات لهذه اللعبة
            </div>
          )}
        </div>

        {/* تفاصيل البيانات */}
        {showDetails && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل البيانات</h3>
            <div className="bg-gray-50 p-4 rounded overflow-auto max-h-96">
              <pre className="text-xs text-gray-900">
                {JSON.stringify(
                  gameData.find(d => d.id === showDetails)?.value,
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
