'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Calendar, 
  Gamepad2, 
  Star, 
  Clock, 
  Edit,
  LogOut,
  Save,
  X,
  History,
  Bookmark,
  LayoutDashboard,
  Play
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import GameCard from '@/components/common/GameCard';
import { formatDate } from '@/lib/utils';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  stats: {
    totalGamesPlayed: number;
    totalPlayTime: number;
    averageRating: number;
    bookmarksCount: number;
  };
  recentGames: Array<{
    id: string;
    slug: string;
    title: string;
    thumbnail: string;
    lastPlayed: string;
    playCount: number;
    onlineCount?: number;
    likePercentage?: number;
  }>;
  bookmarks: Array<{
    id: string;
    game: {
      id: string;
      slug: string;
      title: string;
      thumbnail: string;
      onlineCount?: number;
      likePercentage?: number;
    };
    createdAt: string;
  }>;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'library' | 'history'>('overview');
  const [editData, setEditData] = useState({
    name: '',
    bio: '',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }
    fetchProfile();
  }, [user, authLoading]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/profile', { credentials: 'include' });
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/auth/login';
          return;
        }
        throw new Error('Failed to fetch profile');
      }
      const profileData: UserProfile = await response.json();
      setProfile(profileData);
      setEditData({
        name: profileData.name || '',
        bio: profileData.bio || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editData),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      setIsEditing(false);
      await fetchProfile();
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save changes. Please try again.');
    }
  }

  if (authLoading || loading || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const lastPlayedGame = profile.recentGames[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100">
        <div className="h-32 bg-gradient-to-r from-primary-500 to-secondary-500 md:h-48"></div>
        <div className="px-6 pb-6 md:px-10">
          <div className="relative flex flex-col items-center md:flex-row md:items-end md:space-x-6">
            <div className="-mt-16 relative h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg md:-mt-20 md:h-40 md:w-40">
              {profile.avatar ? (
                <Image src={profile.avatar} alt={profile.username} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-300">
                  <User className="h-16 w-16 md:h-20 md:w-20" />
                </div>
              )}
              <div className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-white bg-green-500"></div>
            </div>

            <div className="mt-4 flex-1 text-center md:mt-0 md:pb-2 md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{profile.name || profile.username}</h1>
                  <p className="text-gray-500">@{profile.username}</p>
                </div>
                <div className="mt-4 flex justify-center space-x-3 md:mt-0">
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors">
                      <Edit className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button onClick={handleSaveProfile} className="flex items-center space-x-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors">
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </button>
                      <button onClick={() => setIsEditing(false)} className="flex items-center space-x-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors">
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                  <button onClick={() => logout()} className="flex items-center space-x-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-500">Full Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-500">Bio</label>
                <input
                  type="text"
                  value={editData.bio}
                  onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <p className="max-w-2xl text-gray-600">{profile.bio || "No bio yet. Add one to tell people about yourself!"}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8 flex space-x-1 rounded-2xl bg-gray-100 p-1">
        <button onClick={() => setActiveTab('overview')} className={`flex flex-1 items-center justify-center space-x-2 rounded-xl py-3 text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <LayoutDashboard className="h-4 w-4" />
          <span>Overview</span>
        </button>
        <button onClick={() => setActiveTab('library')} className={`flex flex-1 items-center justify-center space-x-2 rounded-xl py-3 text-sm font-bold transition-all ${activeTab === 'library' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <Bookmark className="h-4 w-4" />
          <span>My Library</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-1 items-center justify-center space-x-2 rounded-xl py-3 text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <History className="h-4 w-4" />
          <span>History</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          <>
            {/* Continue Playing Section */}
            {lastPlayedGame && (
              <section>
                <h2 className="mb-4 text-xl font-bold text-gray-900">Continue Playing</h2>
                <div className="group relative overflow-hidden rounded-3xl bg-gray-900 text-white shadow-xl transition-transform hover:scale-[1.01]">
                  <div className="absolute inset-0 opacity-40">
                    <Image src={lastPlayedGame.thumbnail} alt={lastPlayedGame.title} fill className="object-cover blur-sm" />
                  </div>
                  <div className="relative flex flex-col items-center p-8 md:flex-row md:justify-between">
                    <div className="flex flex-col items-center space-y-4 md:flex-row md:space-x-6 md:space-y-0">
                      <div className="relative h-24 w-24 overflow-hidden rounded-2xl shadow-2xl md:h-32 md:w-32">
                        <Image src={lastPlayedGame.thumbnail} alt={lastPlayedGame.title} fill className="object-cover" />
                      </div>
                      <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold md:text-3xl">{lastPlayedGame.title}</h3>
                        <p className="text-gray-300">Last played {new Date(lastPlayedGame.lastPlayed).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Link href={`/games/${lastPlayedGame.slug}`} className="mt-6 flex items-center space-x-2 rounded-2xl bg-white px-8 py-4 font-bold text-gray-900 transition-transform hover:scale-105 active:scale-95 md:mt-0">
                      <Play className="h-5 w-5 fill-current" />
                      <span>Play Now</span>
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Gamepad2 className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-gray-500">Games Played</p>
                <p className="text-2xl font-bold text-gray-900">{profile.stats.totalGamesPlayed}</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Clock className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-gray-500">Play Time</p>
                <p className="text-2xl font-bold text-gray-900">{profile.stats.totalPlayTime}m</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                  <Star className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-gray-500">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">{profile.stats.averageRating.toFixed(1)}</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Bookmark className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-gray-500">Bookmarks</p>
                <p className="text-2xl font-bold text-gray-900">{profile.stats.bookmarksCount}</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'library' && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">My Bookmarks</h2>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">{profile.bookmarks.length} Games</span>
            </div>
            {profile.bookmarks.length > 0 ? (
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {profile.bookmarks.map((bookmark) => (
                  <GameCard 
                    key={bookmark.id} 
                    game={{
                      ...bookmark.game,
                      playCount: 0, // Placeholder
                    }} 
                    viewMode="grid"
                    showOnlineCount={true}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl bg-gray-50 py-16 text-center">
                <Bookmark className="mb-4 h-12 w-12 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-900">Your library is empty</h3>
                <p className="text-gray-500">Bookmark games you love to find them here easily.</p>
                <Link href="/games" className="mt-6 rounded-xl bg-primary-600 px-6 py-2 text-sm font-bold text-white hover:bg-primary-700">Browse Games</Link>
              </div>
            )}
          </section>
        )}

        {activeTab === 'history' && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recently Played</h2>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">{profile.recentGames.length} Games</span>
            </div>
            {profile.recentGames.length > 0 ? (
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {profile.recentGames.map((game) => (
                  <GameCard 
                    key={game.id} 
                    game={game} 
                    viewMode="grid"
                    showOnlineCount={true}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl bg-gray-50 py-16 text-center">
                <History className="mb-4 h-12 w-12 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-900">No history yet</h3>
                <p className="text-gray-500">Games you play will appear here.</p>
                <Link href="/games" className="mt-6 rounded-xl bg-primary-600 px-6 py-2 text-sm font-bold text-white hover:bg-primary-700">Start Playing</Link>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
