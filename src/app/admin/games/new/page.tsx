'use client';

export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';
import GameForm from '@/components/admin/GameForm'; // Will create this next

export default function AdminNewGamePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  if (authLoading) {
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
    router.push('/');
    return null;
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Add New Game</h1>
            <p className="text-gray-900">Enter the details for the new game.</p>
          </div>
        </div>
        
        <GameForm />
      </div>
    </div>
  );
}
