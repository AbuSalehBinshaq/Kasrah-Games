'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Gamepad2, 
  History, 
  Bookmark, 
  Settings, 
  Play, 
  Clock, 
  Star, 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import GameCard from '@/components/common/GameCard';
import { toast } from 'react-hot-toast';

interface Game {
  id: string;
  slug: string;
  title: string;
  thumbnail: string;
  onlineCount?: number;
  likePercentage?: number;
  playCount: number;
  description: string;
  likes: number;
  dislikes: number;
  totalRatings: number;
  categoryNames: string[];
}

interface ProfileData {
  id: string;
  username: string;
  email: string;
  name: string | null;
  bio: string | null;
  avatar: string | null;
  createdAt: string;
  stats: {
    gamesPlayed: number;
    totalPlayTime: number;
    totalRatings: number;
  };
  recentGames: Game[];
  bookmarks: {
    id: string;
    game: Game;
  }[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'library' | 'history' | 'security'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    bio: ''
  });

  // Security states
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newEmail: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [securityLoading, setSecurityLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditData({
          name: data.name || '',
          bio: data.bio || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (res.ok) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        fetchProfile();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.newPassword && securityData.newPassword !== securityData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSecurityLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          email: securityData.newEmail || undefined,
          password: securityData.newPassword || undefined
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Security settings updated successfully');
        setSecurityData({
          currentPassword: '',
          newEmail: '',
          newPassword: '',
          confirmPassword: ''
        });
        fetchProfile();
      } else {
        toast.error(data.error || 'Failed to update security settings');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSecurityLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Please sign in to view your profile</h1>
        <Link href="/auth/login" className="rounded-xl bg-primary-600 px-8 py-3 font-bold text-white hover:bg-primary-700">
          Sign In
        </Link>
      </div>
    );
  }

  const lastPlayed = profile.recentGames[0];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Banner */}
      <div className="relative h-48 w-full bg-gradient-to-r from-primary-600 to-primary-800 md:h-64">
        <div className="absolute -bottom-16 left-4 flex items-end space-x-4 md:left-8 md:space-x-6">
          <div className="relative">
            <div className="h-32 w-32 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-lg md:h-40 md:w-40">
              <Image
                src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}&background=random`}
                alt={profile.username}
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full border-4 border-white bg-green-500 shadow-sm"></div>
          </div>
          <div className="mb-4 pb-2">
            <h1 className="text-2xl font-black text-gray-900 md:text-4xl">{profile.name || profile.username}</h1>
            <p className="text-sm font-medium text-gray-500 md:text-base">@{profile.username} • Joined {new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto mt-24 max-w-7xl px-4 md:px-8">
        {/* Navigation Tabs */}
        <div className="mb-8 flex space-x-1 overflow-x-auto rounded-2xl bg-white p-1 shadow-sm border border-gray-100">
          {[
            { id: 'overview', label: 'Overview', icon: Gamepad2 },
            { id: 'library', label: 'My Library', icon: Bookmark },
            { id: 'history', label: 'History', icon: History },
            { id: 'security', label: 'Security', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 rounded-xl px-6 py-3 text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column: Stats & Bio */}
            <div className="space-y-8 lg:col-span-1">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Gamepad2 className="h-5 w-5" />
                  </div>
                  <div className="text-2xl font-black text-gray-900">{profile.stats.gamesPlayed}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Games Played</div>
                </div>
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="text-2xl font-black text-gray-900">{Math.round(profile.stats.totalPlayTime / 60)}h</div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Play Time</div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">About Me</h2>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                </div>
                
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-bold text-gray-500 uppercase">Display Name</label>
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold text-gray-500 uppercase">Bio</label>
                      <textarea
                        value={editData.bio}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary-500 focus:ring-primary-500"
                        rows={4}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button type="submit" className="flex-1 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700">Save Changes</button>
                      <button type="button" onClick={() => setIsEditing(false)} className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-600 hover:bg-gray-200">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <p className="text-sm leading-relaxed text-gray-600">
                    {profile.bio || "No bio yet. Tell the world who you are!"}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Continue Playing & Recent */}
            <div className="space-y-8 lg:col-span-2">
              {/* Continue Playing Card */}
              {lastPlayed && (
                <div className="group relative overflow-hidden rounded-[2.5rem] bg-gray-900 p-8 shadow-2xl md:p-12">
                  <div className="absolute inset-0 opacity-40 transition-transform duration-700 group-hover:scale-110">
                    <Image
                      src={lastPlayed.thumbnail}
                      alt={lastPlayed.title}
                      fill
                      className="object-cover blur-sm"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-start md:flex-row md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                      <div className="mb-4 inline-flex items-center space-x-2 rounded-full bg-primary-600/20 px-4 py-1 text-xs font-bold text-primary-400 backdrop-blur-md">
                        <Play className="h-3 w-3 fill-current" />
                        <span>CONTINUE PLAYING</span>
                      </div>
                      <h2 className="mb-2 text-3xl font-black text-white md:text-5xl">{lastPlayed.title}</h2>
                      <p className="text-gray-400">You last played this {new Date().toLocaleDateString()}</p>
                    </div>
                    <Link 
                      href={`/games/${lastPlayed.slug}`}
                      className="flex items-center space-x-3 rounded-2xl bg-white px-8 py-4 font-black text-gray-900 shadow-xl transition-all hover:scale-105 hover:bg-primary-50 active:scale-95"
                    >
                      <Play className="h-5 w-5 fill-current" />
                      <span>PLAY NOW</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                  <button onClick={() => setActiveTab('history')} className="text-sm font-bold text-primary-600 hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  {profile.recentGames.slice(0, 4).map((game) => (
                    <div key={game.id} className="flex items-center justify-between rounded-2xl bg-gray-50 p-4 transition-colors hover:bg-gray-100">
                      <div className="flex items-center space-x-4">
                        <div className="relative h-12 w-12 overflow-hidden rounded-xl">
                          <Image src={game.thumbnail} alt={game.title} fill className="object-cover" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">{game.title}</h3>
                          <p className="text-xs text-gray-500">Played recently</p>
                        </div>
                      </div>
                      <Link href={`/games/${game.slug}`} className="rounded-lg bg-white p-2 text-gray-400 shadow-sm hover:text-primary-600">
                        <Play className="h-4 w-4 fill-current" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
                      description: '',
                      likes: 0,
                      dislikes: 0,
                      totalRatings: 0,
                      categoryNames: [],
                      ...bookmark.game,
                      playCount: 0,
                      likePercentage: bookmark.game.likePercentage ?? 0,
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
                    game={{
                      description: '',
                      likes: 0,
                      dislikes: 0,
                      totalRatings: 0,
                      categoryNames: [],
                      ...game,
                      likePercentage: game.likePercentage ?? 0,
                    }} 
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

        {activeTab === 'security' && (
          <section className="max-w-2xl mx-auto">
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
              <div className="mb-8 flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                  <p className="text-sm text-gray-500">Manage your email and password</p>
                </div>
              </div>

              <form onSubmit={handleUpdateSecurity} className="space-y-6">
                {/* Current Password - Required for any change */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      required
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                      className="w-full rounded-2xl border-gray-200 bg-gray-50 pl-11 pr-12 py-3.5 text-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Enter current password to confirm changes"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="h-px bg-gray-100 my-8"></div>

                {/* New Email */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      value={securityData.newEmail}
                      onChange={(e) => setSecurityData({ ...securityData, newEmail: e.target.value })}
                      className="w-full rounded-2xl border-gray-200 bg-gray-50 pl-11 py-3.5 text-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder={profile.email}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400">Leave blank if you don't want to change your email</p>
                </div>

                {/* New Password */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                        className="w-full rounded-2xl border-gray-200 bg-gray-50 pl-11 pr-12 py-3.5 text-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="New password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                        className="w-full rounded-2xl border-gray-200 bg-gray-50 pl-11 pr-12 py-3.5 text-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400">Leave blank if you don't want to change your password</p>

                <button
                  type="submit"
                  disabled={securityLoading || (!securityData.newEmail && !securityData.newPassword)}
                  className="mt-4 w-full rounded-2xl bg-primary-600 py-4 text-sm font-black text-white shadow-lg shadow-primary-200 transition-all hover:bg-primary-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {securityLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    "Update Security Settings"
                  )}
                </button>
              </form>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
