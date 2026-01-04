'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';
import GameForm from '@/components/admin/GameForm';

interface GameResponse {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  developer: string;
  publisher?: string | null;
  gameUrl: string;
  thumbnail: string;
  coverImage?: string | null;
  gameType: 'HTML5' | 'WebGL' | 'Unity' | 'Flash' | 'Other';
  technologies: string[];
  ageRating?: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  categories: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

export default function AdminEditGamePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchGame();
  }, [authLoading, user]);

  async function fetchGame() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/games/${params.id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch game');
      }
      const data: GameResponse = await res.json();
      setInitialData({
        ...data,
        categoryIds: data.categories?.map((c) => c.category.id) || [],
        technologies: Array.isArray(data.technologies) ? data.technologies : [],
        tags: Array.isArray((data as any).tags) ? (data as any).tags : [],
      });
    } catch (error) {
      console.error('Failed to load game:', error);
      alert('Failed to load game');
      router.push('/admin/games');
    } finally {
      setLoading(false);
    }
  }

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

  if (!initialData) return null;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-900 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Games</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Game</h1>
            <p className="text-gray-900">Update the details for this game.</p>
          </div>
        </div>

        <GameForm gameId={params.id} initialData={initialData} />
      </div>
    </div>
  );
}


