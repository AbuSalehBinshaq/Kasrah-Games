'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Copy, RefreshCw, TrendingUp } from 'lucide-react';

interface GameWithSDK {
  id: string;
  gameId: string;
  title: string;
  playCount: number;
  views: number;
  totalRevenue: number;
  sdkConfig?: {
    apiKey: string;
    isActive: boolean;
  };
}

export default function SDKGamesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [games, setGames] = useState<GameWithSDK[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [copiedId, setCopiedId] = useState<string>('');

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

  async function fetchGames() {
    try {
      setIsLoadingGames(true);
      const response = await fetch('/api/admin/games');
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Failed to fetch games:', error);
    } finally {
      setIsLoadingGames(false);
    }
  }

  async function handleGenerateSDK(gameId: string) {
    try {
      const response = await fetch('/api/sdk/games/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
      });

      if (response.ok) {
        const data = await response.json();
        setGames(games.map(g => 
          g.id === gameId 
            ? { ...g, sdkConfig: data.sdkConfig }
            : g
        ));
      }
    } catch (error) {
      console.error('Failed to generate SDK:', error);
    }
  }

  async function handleRegenerateKey(gameId: string) {
    try {
      const response = await fetch('/api/sdk/games/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, generateNewId: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setGames(games.map(g => 
          g.id === gameId 
            ? { ...g, sdkConfig: data.sdkConfig }
            : g
        ));
      }
    } catch (error) {
      console.error('Failed to regenerate key:', error);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  }

  if (isLoading || isLoadingGames) {
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
          <h1 className="text-3xl font-bold text-gray-900">إدارة SDK للألعاب</h1>
          <p className="text-gray-600">إدارة معرّفات الألعاب والإعدادات</p>
        </div>

        {/* جدول الألعاب */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">اسم اللعبة</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Game ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">API Key</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">الإحصائيات</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {games.map(game => (
                <tr key={game.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{game.title}</td>
                  <td className="px-6 py-4 text-sm">
                    {game.gameId ? (
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {game.gameId.substring(0, 12)}...
                        </code>
                        <button
                          onClick={() => copyToClipboard(game.gameId, `gameid-${game.id}`)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="نسخ"
                        >
                          <Copy className={`h-4 w-4 ${
                            copiedId === `gameid-${game.id}` ? 'text-green-600' : 'text-gray-600'
                          }`} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">لم يتم إنشاؤه</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {game.sdkConfig?.apiKey ? (
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {game.sdkConfig.apiKey.substring(0, 12)}...
                        </code>
                        <button
                          onClick={() => copyToClipboard(game.sdkConfig!.apiKey, `apikey-${game.id}`)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="نسخ"
                        >
                          <Copy className={`h-4 w-4 ${
                            copiedId === `apikey-${game.id}` ? 'text-green-600' : 'text-gray-600'
                          }`} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">لم يتم إنشاؤه</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-gray-600">التشغيلات:</span>
                        <span className="ml-2 font-medium">{game.playCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">الإيرادات:</span>
                        <span className="ml-2 font-medium">${game.totalRevenue.toFixed(2)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      {!game.sdkConfig ? (
                        <button
                          onClick={() => handleGenerateSDK(game.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                        >
                          إنشاء SDK
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRegenerateKey(game.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 transition-colors"
                          >
                            <RefreshCw className="h-3 w-3" />
                            تحديث
                          </button>
                          <button
                            onClick={() => router.push(`/admin/sdk/analytics?gameId=${game.id}`)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                          >
                            <TrendingUp className="h-3 w-3" />
                            إحصائيات
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {games.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              لا توجد ألعاب
            </div>
          )}
        </div>
      </div>
    </div>
  );
}