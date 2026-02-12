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
  Shield,
  Trash2,
  Lock,
  MailWarning,
  Heart,
  History,
  Settings as SettingsIcon,
  ChevronRight,
  Camera,
  Trophy,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatDate } from '@/lib/utils';

interface GameItem {
  id: string;
  slug: string;
  title: string;
  thumbnail: string;
  lastPlayed?: string;
  playCount?: number;
  likePercentage?: number;
  onlineCount?: number;
}

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
  recentGames: GameItem[];
  bookmarks: { id: string; game: GameItem; createdAt: string }[];
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', bio: '' });
  const [activeTab, setActiveTab] = useState<'overview' | 'favorites' | 'history' | 'security'>('overview');
  
  // Security States
  const [securityModal, setSecurityModal] = useState<{type: 'password' | 'email' | 'delete' | null}>({type: null});
  const [otp, setOtp] = useState('');
  const [newValue, setNewValue] = useState('');
  const [securityStep, setSecurityStep] = useState(1);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchProfile();
  }, [user, authLoading]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/profile', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const profileData = await response.json();
      setProfile(profileData);
      setEditData({ name: profileData.name || '', bio: profileData.bio || '' });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        setIsEditing(false);
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSecurityAction = async () => {
    setSecurityLoading(true);
    setSecurityError('');
    try {
      if (securityStep === 1) {
        const res = await fetch('/api/auth/otp/request', { method: 'POST' });
        if (res.ok) setSecurityStep(2);
        else setSecurityError((await res.json()).error || 'Failed to send code');
      } else {
        const endpoint = securityModal.type === 'delete' ? '/api/auth/account/delete' : '/api/auth/profile/security';
        const body = securityModal.type === 'delete' ? { otp } : { type: securityModal.type, otp, newValue };
        
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          if (securityModal.type === 'delete') {
            window.location.href = '/';
          } else {
            setSecurityModal({type: null});
            setSecurityStep(1);
            setOtp('');
            setNewValue('');
            fetchProfile();
            alert('Updated successfully!');
          }
        } else {
          setSecurityError((await res.json()).error || 'Operation failed');
        }
      }
    } catch (err) {
      setSecurityError('Something went wrong');
    } finally {
      setSecurityLoading(false);
    }
  };

  if (authLoading || loading || !profile) {
    return <div className="flex min-h-[60vh] items-center justify-center"><LoadingSpinner /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12" dir="ltr">
      {/* Hero Header */}
      <div className="relative h-64 w-full bg-gradient-to-r from-primary-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        <div className="container mx-auto px-4 h-full flex items-end pb-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full">
            <div className="relative group">
              <div className="h-32 w-32 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-white">
                {profile.avatar ? (
                  <Image src={profile.avatar} alt={profile.username} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary-100 text-primary-600">
                    <User className="h-16 w-16" />
                  </div>
                )}
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-white rounded-lg shadow-lg text-gray-600 hover:text-primary-600 transition-colors opacity-0 group-hover:opacity-100">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left mb-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-3xl font-bold text-white">{profile.name || profile.username}</h1>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/30 self-center md:self-auto">
                  {profile.username === 'admin' ? 'Administrator' : 'Pro Gamer'}
                </span>
              </div>
              <p className="text-primary-100 mt-1 flex items-center justify-center md:justify-start gap-2">
                <Mail className="h-4 w-4" /> {profile.email}
              </p>
            </div>

            <div className="flex gap-3 mb-2">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl border border-white/20 transition-all"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button 
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-xl transition-all"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Gamer Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-primary-50 border border-primary-100">
                  <Gamepad2 className="h-5 w-5 text-primary-600 mb-2" />
                  <p className="text-2xl font-black text-primary-700">{profile.stats.totalGamesPlayed}</p>
                  <p className="text-xs text-primary-600/70 font-medium uppercase tracking-wider">Games</p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <Clock className="h-5 w-5 text-blue-600 mb-2" />
                  <p className="text-2xl font-black text-blue-700">{profile.stats.totalPlayTime}</p>
                  <p className="text-xs text-blue-600/70 font-medium uppercase tracking-wider">Minutes</p>
                </div>
                <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-100">
                  <Star className="h-5 w-5 text-yellow-600 mb-2" />
                  <p className="text-2xl font-black text-yellow-700">{profile.stats.averageRating.toFixed(1)}</p>
                  <p className="text-xs text-yellow-600/70 font-medium uppercase tracking-wider">Rating</p>
                </div>
                <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
                  <Heart className="h-5 w-5 text-green-600 mb-2" />
                  <p className="text-2xl font-black text-green-700">{profile.stats.bookmarksCount}</p>
                  <p className="text-xs text-green-600/70 font-medium uppercase tracking-wider">Saved</p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Member since</span>
                  <span className="font-medium text-gray-900">{formatDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Bio Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary-600" />
                About Me
              </h3>
              {isEditing ? (
                <div className="space-y-4">
                  <input 
                    type="text" 
                    value={editData.name} 
                    onChange={e => setEditData({...editData, name: e.target.value})}
                    placeholder="Full Name"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                  <textarea 
                    value={editData.bio} 
                    onChange={e => setEditData({...editData, bio: e.target.value})}
                    placeholder="Write something about yourself..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none h-32 resize-none transition-all"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleUpdateProfile} className="flex-1 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors">
                      Save
                    </button>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 leading-relaxed italic">
                  {profile.bio || 'No bio yet...'}
                </p>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tabs */}
            <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto hide-scrollbar">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'favorites', label: 'Favorites', icon: Heart },
                { id: 'history', label: 'History', icon: History },
                { id: 'security', label: 'Security', icon: Shield },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Recent Activity Section */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Recently Played</h3>
                      <button onClick={() => setActiveTab('history')} className="text-sm font-bold text-primary-600 hover:underline flex items-center gap-1">
                        View All <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.recentGames.length > 0 ? (
                        profile.recentGames.slice(0, 4).map((game) => (
                          <Link key={game.id} href={`/games/${game.slug}`} className="group bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                            <div className="relative h-16 w-16 rounded-xl overflow-hidden flex-shrink-0">
                              <Image src={game.thumbnail} alt={game.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 truncate">{game.title}</h4>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" /> Played {formatDate(game.lastPlayed || '')}
                              </p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="col-span-2 py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                          <Gamepad2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No games played yet</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Favorites Preview */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">My Favorites</h3>
                      <button onClick={() => setActiveTab('favorites')} className="text-sm font-bold text-primary-600 hover:underline flex items-center gap-1">
                        View All <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {profile.bookmarks.slice(0, 4).map((bookmark) => (
                        <Link key={bookmark.id} href={`/games/${bookmark.game.slug}`} className="group space-y-2">
                          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                            <Image src={bookmark.game.thumbnail} alt={bookmark.game.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                              <span className="text-white text-xs font-bold truncate">{bookmark.game.title}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                      {profile.bookmarks.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">Your favorites list is empty</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-300">
                  {profile.bookmarks.map((bookmark) => (
                    <Link key={bookmark.id} href={`/games/${bookmark.game.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                      <div className="relative aspect-video">
                        <Image src={bookmark.game.thumbnail} alt={bookmark.game.title} fill className="object-cover" />
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-gray-900 truncate text-sm">{bookmark.game.title}</h4>
                        <p className="text-[10px] text-gray-400 mt-1">Added on {formatDate(bookmark.createdAt)}</p>
                      </div>
                    </Link>
                  ))}
                  {profile.bookmarks.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                      <Heart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-gray-400">No favorites yet</h4>
                      <Link href="/games" className="mt-4 inline-block text-primary-600 font-bold hover:underline">Browse games now</Link>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  {profile.recentGames.map((game) => (
                    <div key={game.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6">
                      <div className="relative h-20 w-20 rounded-xl overflow-hidden flex-shrink-0">
                        <Image src={game.thumbnail} alt={game.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900">{game.title}</h4>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(game.lastPlayed || '')}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Gamepad2 className="h-3 w-3" /> {game.playCount} Plays</span>
                          <span className="text-xs text-green-600 font-bold flex items-center gap-1"><Star className="h-3 w-3" /> {game.likePercentage}% Likes</span>
                        </div>
                      </div>
                      <Link href={`/games/${game.slug}`} className="px-6 py-2 bg-primary-50 text-primary-600 rounded-xl font-bold hover:bg-primary-600 hover:text-white transition-all">
                        Play
                      </Link>
                    </div>
                  ))}
                  {profile.recentGames.length === 0 && (
                    <div className="py-20 text-center">
                      <History className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-gray-400">No play history</h4>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in fade-in zoom-in-95 duration-300">
                  <div className="max-w-md mx-auto space-y-6">
                    <div className="text-center mb-8">
                      <div className="h-16 w-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Security Settings</h3>
                      <p className="text-gray-500 text-sm mt-2">Protect your account and update login info</p>
                    </div>

                    <div className="space-y-3">
                      <button 
                        onClick={() => {setSecurityModal({type: 'password'}); setSecurityStep(1); setSecurityError('');}}
                        className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 border border-gray-100 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Lock className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-gray-900">Change Password</p>
                            <p className="text-xs text-gray-500">Update your login password</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary-600 transition-colors" />
                      </button>

                      <button 
                        onClick={() => {setSecurityModal({type: 'email'}); setSecurityStep(1); setSecurityError('');}}
                        className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 border border-gray-100 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <MailWarning className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-gray-900">Change Email</p>
                            <p className="text-xs text-gray-500">{profile.email}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary-600 transition-colors" />
                      </button>

                      <div className="pt-6 mt-6 border-t border-gray-100">
                        <button 
                          onClick={() => {setSecurityModal({type: 'delete'}); setSecurityStep(1); setSecurityError('');}}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-600 hover:bg-red-50 transition-all group"
                        >
                          <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Trash2 className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold">Delete Account</p>
                            <p className="text-xs text-red-400">This action cannot be undone</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Modals */}
      {securityModal.type && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${securityModal.type === 'delete' ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'}`}>
                {securityModal.type === 'delete' ? <Trash2 className="h-8 w-8" /> : <Shield className="h-8 w-8" />}
              </div>
              <h2 className="text-2xl font-bold">
                {securityModal.type === 'delete' ? 'Delete Account' : `Update ${securityModal.type}`}
              </h2>
              <p className="text-gray-500 mt-2 text-sm">
                {securityStep === 1 
                  ? "For your security, we'll send a verification code to your email." 
                  : "Enter the 6-digit code sent to your email."}
              </p>
            </div>

            {securityError && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center font-medium">{securityError}</div>}

            {securityStep === 2 && (
              <div className="space-y-4">
                {securityModal.type !== 'delete' && (
                  <input 
                    type={securityModal.type === 'password' ? 'password' : 'email'}
                    placeholder={securityModal.type === 'password' ? 'New Password' : 'New Email'}
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                )}
                <div className="relative">
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center text-3xl tracking-[0.5em] font-black focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setSecurityModal({type: null})}
                className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSecurityAction}
                disabled={securityLoading || (securityStep === 2 && otp.length !== 6)}
                className={`flex-1 py-4 text-white font-bold rounded-2xl shadow-lg shadow-primary-200 transition-all active:scale-95 disabled:opacity-50 ${securityModal.type === 'delete' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-primary-600 hover:bg-primary-700'}`}
              >
                {securityLoading ? 'Processing...' : securityStep === 1 ? 'Send Code' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
