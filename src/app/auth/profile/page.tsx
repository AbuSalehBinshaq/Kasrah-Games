'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';
import Image from 'next/image';
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
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatDate, timeAgo } from '@/lib/utils';

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
  }>;
  bookmarks: Array<{
    id: string;
    game: {
      id: string;
      slug: string;
      title: string;
      thumbnail: string;
      avgRating: number;
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
  const [editData, setEditData] = useState({
    name: '',
    bio: '',
  });
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Wait for auth check to complete
    if (authLoading) {
      return;
    }
    
    // If auth check is done and no user, redirect to login
    if (!user) {
      console.log('No user found, redirecting to login...');
      // Use window.location for reliable redirect
      window.location.href = '/auth/login';
      return;
    }
    
    // User is authenticated, fetch profile
    console.log('User authenticated:', user);
    fetchProfile();
  }, [user, authLoading]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/profile', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated, redirect to login
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
      // Show error message to user
      alert('فشل تحميل بيانات البروفايل. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setIsEditing(false);
      // Refresh profile data
      await fetchProfile();
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('فشل حفظ التغييرات. يرجى المحاولة مرة أخرى.');
    }
  }

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  // Show loading while checking auth or fetching profile
  if (authLoading || loading || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-600 p-8 text-white">
        <div className="flex flex-col items-center md:flex-row md:items-start">
          <div className="mb-6 md:mb-0 md:mr-8">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary-700">
                  <User className="h-16 w-16" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold">{profile.name || profile.username}</h1>
                <p className="text-xl text-primary-100">@{profile.username}</p>
              </div>

              <div className="mt-4 flex space-x-4 md:mt-0">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 rounded-lg bg-white/20 px-4 py-2 hover:bg-white/30"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center space-x-2 rounded-lg bg-white px-4 py-2 text-primary-600 hover:bg-gray-100"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditData({
                          name: profile.name || '',
                          bio: profile.bio || '',
                        });
                      }}
                      className="flex items-center space-x-2 rounded-lg bg-white/20 px-4 py-2 hover:bg-white/30"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 rounded-lg bg-red-500 px-4 py-2 hover:bg-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm">Full Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg bg-white/20 px-4 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm">Bio</label>
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full rounded-lg bg-white/20 px-4 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                    placeholder="Tell us about yourself"
                  />
                </div>
              </div>
            ) : (
              <>
                <p className="mb-6 text-lg">{profile.bio}</p>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Joined {formatDate(profile.createdAt)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow">
          <div className="flex items-center space-x-4">
            <div className="rounded-lg bg-primary-100 p-3">
              <Gamepad2 className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Games Played</p>
              <p className="text-2xl font-bold text-gray-900">{profile.stats.totalGamesPlayed}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <div className="flex items-center space-x-4">
            <div className="rounded-lg bg-secondary-100 p-3">
              <Clock className="h-6 w-6 text-secondary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Play Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {profile.stats.totalPlayTime.toLocaleString()} minutes
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <div className="flex items-center space-x-4">
            <div className="rounded-lg bg-yellow-100 p-3">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Rating</p>
              <p className="text-2xl font-bold text-gray-900">{profile.stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <div className="flex items-center space-x-4">
            <div className="rounded-lg bg-green-100 p-3">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Favorites</p>
              <p className="text-2xl font-bold text-gray-900">{profile.stats.bookmarksCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Games */}
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-bold text-gray-900">Recent Games</h2>
          <div className="space-y-4">
            {profile.recentGames.map((game) => (
              <a
                key={game.id}
                href={`/games/${game.slug}`}
                className="flex items-center space-x-4 rounded-lg p-3 hover:bg-gray-50"
              >
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                  {imageErrors.has(`recent-${game.id}`) ? (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                      <Gamepad2 className="h-8 w-8 text-gray-400" />
                    </div>
                  ) : (
                    <Image
                      src={game.thumbnail || '/images/placeholder-game.svg'}
                      alt={game.title}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={() => setImageErrors(prev => new Set(prev).add(`recent-${game.id}`))}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{game.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{game.playCount} plays</span>
                    <span>•</span>
                    <span>Last played: {timeAgo(game.lastPlayed)}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Favorites */}
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-bold text-gray-900">Favorites</h2>
          <div className="space-y-4">
            {profile.bookmarks.map((bookmark) => (
              <a
                key={bookmark.id}
                href={`/games/${bookmark.game.slug}`}
                className="flex items-center space-x-4 rounded-lg p-3 hover:bg-gray-50"
              >
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                  {imageErrors.has(`bookmark-${bookmark.id}`) ? (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                      <Star className="h-8 w-8 text-gray-400" />
                    </div>
                  ) : (
                    <Image
                      src={bookmark.game.thumbnail || '/images/placeholder-game.svg'}
                      alt={bookmark.game.title}
                      fill
                      className="object-cover"
                      quality={90}
                      sizes="64px"
                      onError={() => setImageErrors(prev => new Set(prev).add(`bookmark-${bookmark.id}`))}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{bookmark.game.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{bookmark.game.avgRating.toFixed(1)}</span>
                    <span>•</span>
                    <span>Favorited {timeAgo(bookmark.createdAt)}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
