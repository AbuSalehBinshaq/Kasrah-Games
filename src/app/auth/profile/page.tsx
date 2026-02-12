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
  Edit3,
  LogOut,
  Shield,
  Heart,
  History,
  ChevronRight,
  Camera,
  LayoutGrid,
  Settings,
  X,
  Lock,
  Trash2,
  MailWarning,
  CheckCircle2
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
  const [activeTab, setActiveTab] = useState<'overview' | 'favorites' | 'history' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', bio: '' });

  // Security States
  const [securityModal, setSecurityModal] = useState<{type: 'password' | 'email' | 'delete' | null}>({type: null});
  const [otp, setOtp] = useState('');
  const [newValue, setNewValue] = useState('');
  const [securityStep, setSecurityStep] = useState(1);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState(false);

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
      const response = await fetch('/api/auth/profile', { cache: 'no-store' });
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
            setSecuritySuccess(true);
            setTimeout(() => {
              setSecurityModal({type: null});
              setSecurityStep(1);
              setOtp('');
              setNewValue('');
              setSecuritySuccess(false);
              fetchProfile();
            }, 2000);
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
    return <div className="flex min-h-[80vh] items-center justify-center"><LoadingSpinner /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans pb-20">
      {/* Enhanced Header Section */}
      <div className="relative bg-white border-b border-gray-100 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-50/50 to-transparent pointer-events-none"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-50/30 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto px-6 py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Avatar with Ring */}
            <div className="relative">
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary-500 to-indigo-500 rounded-[2.2rem] opacity-20 blur-sm"></div>
              <div className="relative h-32 w-32 rounded-[2rem] overflow-hidden bg-white border-2 border-white shadow-xl">
                {profile.avatar ? (
                  <Image src={profile.avatar} alt={profile.username} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-50 text-primary-600">
                    <User className="h-14 w-14" />
                  </div>
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 p-2.5 bg-primary-600 text-white rounded-2xl shadow-lg hover:bg-primary-700 transition-all border-4 border-white">
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Info with Badges */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h1 className="text-4xl font-black tracking-tight text-gray-900">{profile.name || profile.username}</h1>
                <div className="flex justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-primary-100">
                    {profile.username === 'admin' ? 'Admin' : 'Pro Player'}
                  </span>
                  {profile.stats.totalPlayTime > 100 && (
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                      Veteran
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-400 font-medium mt-2 flex items-center justify-center md:justify-start gap-2">
                <span className="text-primary-500">@</span>{profile.username}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6 text-sm font-medium text-gray-500">
                <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl"><Mail className="h-4 w-4 text-gray-400" /> {profile.email}</span>
                <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl"><Calendar className="h-4 w-4 text-gray-400" /> Joined {formatDate(profile.createdAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={logout}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-2xl font-bold border border-gray-100 shadow-sm transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-3">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutGrid },
              { id: 'favorites', label: 'Favorites', icon: Heart },
              { id: 'history', label: 'History', icon: History },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary-600 text-white shadow-xl shadow-primary-100 translate-x-2' 
                    : 'text-gray-400 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Section */}
          <div className="lg:col-span-9">
            
            {activeTab === 'overview' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Real Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {[
                    { label: 'Games', value: profile.stats.totalGamesPlayed, icon: Gamepad2, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Minutes', value: profile.stats.totalPlayTime, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Rating', value: profile.stats.averageRating.toFixed(1), icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { label: 'Saved', value: profile.stats.bookmarksCount, icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className={`h-12 w-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                      <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Bio Section */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="text-xl font-black text-gray-900">About Me</h3>
                    <button onClick={() => setIsEditing(!isEditing)} className="p-2 bg-gray-50 text-gray-400 hover:text-primary-600 rounded-xl transition-all">
                      <Edit3 className="h-5 w-5" />
                    </button>
                  </div>
                  {isEditing ? (
                    <div className="space-y-5 relative z-10">
                      <input 
                        type="text" 
                        value={editData.name} 
                        onChange={e => setEditData({...editData, name: e.target.value})}
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                        placeholder="Display Name"
                      />
                      <textarea 
                        value={editData.bio} 
                        onChange={e => setEditData({...editData, bio: e.target.value})}
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none h-32 resize-none font-medium"
                        placeholder="Tell the community about yourself..."
                      />
                      <div className="flex gap-3">
                        <button onClick={handleUpdateProfile} className="px-8 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-100 transition-all">Save Changes</button>
                        <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 leading-relaxed font-medium relative z-10">
                      {profile.bio || "You haven't added a bio yet. Share your gaming journey with others!"}
                    </p>
                  )}
                </div>

                {/* Recent Games Preview */}
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-gray-900">Recent Activity</h3>
                    <button onClick={() => setActiveTab('history')} className="text-sm font-bold text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-xl transition-all">View History</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {profile.recentGames.length > 0 ? (
                      profile.recentGames.slice(0, 4).map((game) => (
                        <Link key={game.id} href={`/games/${game.slug}`} className="group bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-5">
                          <div className="relative h-20 w-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
                            <Image src={game.thumbnail} alt={game.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-gray-900 truncate group-hover:text-primary-600 transition-colors">{game.title}</h4>
                            <p className="text-xs font-bold text-gray-400 mt-2 flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" /> {formatDate(game.lastPlayed || '')}
                            </p>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-primary-600 group-hover:text-white transition-all">
                            <ChevronRight className="h-5 w-5" />
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="col-span-2 py-16 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                        <Gamepad2 className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold">No games played yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 duration-300">
                {profile.bookmarks.map((bookmark) => (
                  <Link key={bookmark.id} href={`/games/${bookmark.game.slug}`} className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all">
                    <div className="relative aspect-[4/3]">
                      <Image src={bookmark.game.thumbnail} alt={bookmark.game.title} fill className="object-cover" />
                      <div className="absolute top-3 right-3 h-8 w-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 shadow-sm">
                        <Heart className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="font-black text-gray-900 truncate text-sm group-hover:text-primary-600 transition-colors">{bookmark.game.title}</h4>
                      <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">Saved {formatDate(bookmark.createdAt)}</p>
                    </div>
                  </Link>
                ))}
                {profile.bookmarks.length === 0 && (
                  <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                    <Heart className="h-16 w-16 text-gray-100 mx-auto mb-6" />
                    <h4 className="text-xl font-black text-gray-300">Your favorites list is empty</h4>
                    <Link href="/games" className="mt-6 inline-block px-8 py-3 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-100">Explore Games</Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                {profile.recentGames.map((game) => (
                  <div key={game.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-8 hover:shadow-md transition-all">
                    <div className="relative h-24 w-24 rounded-[1.5rem] overflow-hidden flex-shrink-0 shadow-sm">
                      <Image src={game.thumbnail} alt={game.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-black text-gray-900">{game.title}</h4>
                      <div className="flex flex-wrap gap-6 mt-3">
                        <p className="text-xs font-bold text-gray-400 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary-500" /> Last played {formatDate(game.lastPlayed || '')}
                        </p>
                        <p className="text-xs font-bold text-gray-400 flex items-center gap-2">
                          <Gamepad2 className="h-4 w-4 text-blue-500" /> {game.playCount || 1} Sessions
                        </p>
                      </div>
                    </div>
                    <Link href={`/games/${game.slug}`} className="px-8 py-3 bg-primary-600 text-white rounded-2xl font-black shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all">
                      Play Again
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-12 animate-in fade-in zoom-in-95 duration-300">
                <div className="max-w-md mx-auto space-y-10">
                  <div className="text-center">
                    <div className="h-20 w-20 bg-primary-50 text-primary-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                      <Shield className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">Account Security</h3>
                    <p className="text-gray-400 font-medium mt-2">Manage your credentials and account status</p>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={() => {setSecurityModal({type: 'password'}); setSecurityStep(1); setSecurityError('');}}
                      className="w-full flex items-center justify-between p-6 rounded-[2rem] hover:bg-gray-50 border border-gray-50 transition-all group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm text-gray-400 flex items-center justify-center group-hover:text-primary-600 transition-colors">
                          <Lock className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-black text-gray-900">Change Password</p>
                          <p className="text-xs font-bold text-gray-400 mt-0.5">Update your login security</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-300 group-hover:translate-x-1 transition-all" />
                    </button>

                    <button 
                      onClick={() => {setSecurityModal({type: 'email'}); setSecurityStep(1); setSecurityError('');}}
                      className="w-full flex items-center justify-between p-6 rounded-[2rem] hover:bg-gray-50 border border-gray-50 transition-all group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm text-gray-400 flex items-center justify-center group-hover:text-primary-600 transition-colors">
                          <MailWarning className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-black text-gray-900">Update Email</p>
                          <p className="text-xs font-bold text-gray-400 mt-0.5">{profile.email}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-300 group-hover:translate-x-1 transition-all" />
                    </button>

                    <div className="pt-8 mt-8 border-t border-gray-100">
                      <button 
                        onClick={() => {setSecurityModal({type: 'delete'}); setSecurityStep(1); setSecurityError('');}}
                        className="w-full flex items-center gap-5 p-6 rounded-[2rem] text-red-500 hover:bg-red-50 transition-all group"
                      >
                        <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center">
                          <Trash2 className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-black">Delete Account</p>
                          <p className="text-xs font-bold text-red-300 mt-0.5">Permanently remove your data</p>
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

      {/* Security Modals */}
      {securityModal.type && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] max-w-md w-full p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300 relative overflow-hidden">
            {securitySuccess ? (
              <div className="py-10 text-center animate-in zoom-in duration-500">
                <div className="h-24 w-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <h2 className="text-3xl font-black text-gray-900">Success!</h2>
                <p className="text-gray-500 font-medium mt-2">Your account has been updated.</p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className={`h-20 w-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ${securityModal.type === 'delete' ? 'bg-red-50 text-red-500' : 'bg-primary-50 text-primary-600'}`}>
                    {securityModal.type === 'delete' ? <Trash2 className="h-10 w-10" /> : <Shield className="h-10 w-10" />}
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">
                    {securityModal.type === 'delete' ? 'Delete Account' : `Update ${securityModal.type}`}
                  </h2>
                  <p className="text-gray-500 mt-3 font-medium">
                    {securityStep === 1 
                      ? "We'll send a verification code to your email for security." 
                      : "Enter the 6-digit code sent to your inbox."}
                  </p>
                </div>

                {securityError && <div className="bg-red-50 text-red-500 p-5 rounded-2xl text-sm text-center font-bold border border-red-100">{securityError}</div>}

                {securityStep === 2 && (
                  <div className="space-y-5">
                    {securityModal.type !== 'delete' && (
                      <input 
                        type={securityModal.type === 'password' ? 'password' : 'email'}
                        placeholder={securityModal.type === 'password' ? 'New Password' : 'New Email Address'}
                        value={newValue}
                        onChange={e => setNewValue(e.target.value)}
                        className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-lg"
                      />
                    )}
                    <input 
                      type="text" 
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-center text-4xl tracking-[0.4em] font-black focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={() => setSecurityModal({type: null})}
                    className="flex-1 py-5 text-gray-400 font-black hover:bg-gray-50 rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSecurityAction}
                    disabled={securityLoading || (securityStep === 2 && otp.length !== 6)}
                    className={`flex-1 py-5 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50 ${securityModal.type === 'delete' ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-100'}`}
                  >
                    {securityLoading ? '...' : securityStep === 1 ? 'Send Code' : 'Confirm'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
