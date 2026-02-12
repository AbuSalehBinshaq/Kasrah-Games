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
      {/* Simple Header Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="h-28 w-28 rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                {profile.avatar ? (
                  <Image src={profile.avatar} alt={profile.username} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-primary-600">
                    <User className="h-12 w-12" />
                  </div>
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-md border border-gray-50 text-gray-400 hover:text-primary-600 transition-all">
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight">{profile.name || profile.username}</h1>
              <p className="text-gray-500 mt-1">@{profile.username}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {profile.email}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Joined {formatDate(profile.createdAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={logout}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-2xl font-semibold transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutGrid },
              { id: 'favorites', label: 'Favorites', icon: Heart },
              { id: 'history', label: 'History', icon: History },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-100' 
                    : 'text-gray-500 hover:bg-white hover:text-gray-900'
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
              <div className="space-y-10 animate-in fade-in duration-500">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Games', value: profile.stats.totalGamesPlayed, icon: Gamepad2, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Minutes', value: profile.stats.totalPlayTime, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Rating', value: profile.stats.averageRating.toFixed(1), icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { label: 'Saved', value: profile.stats.bookmarksCount, icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                      <div className={`h-10 w-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Bio Section */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">About Me</h3>
                    <button onClick={() => setIsEditing(!isEditing)} className="text-primary-600 hover:text-primary-700">
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                  {isEditing ? (
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        value={editData.name} 
                        onChange={e => setEditData({...editData, name: e.target.value})}
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="Full Name"
                      />
                      <textarea 
                        value={editData.bio} 
                        onChange={e => setEditData({...editData, bio: e.target.value})}
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none h-24 resize-none"
                        placeholder="Tell us about yourself..."
                      />
                      <div className="flex gap-2">
                        <button onClick={handleUpdateProfile} className="px-6 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all">Save</button>
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 leading-relaxed">
                      {profile.bio || "No bio added yet. Click the edit icon to share something about yourself!"}
                    </p>
                  )}
                </div>

                {/* Recent Games Preview */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Recently Played</h3>
                    <button onClick={() => setActiveTab('history')} className="text-sm font-bold text-primary-600 hover:underline">View All</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.recentGames.slice(0, 4).map((game) => (
                      <Link key={game.id} href={`/games/${game.slug}`} className="group bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-2xl overflow-hidden flex-shrink-0">
                          <Image src={game.thumbnail} alt={game.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold truncate">{game.title}</h4>
                          <p className="text-xs text-gray-400 mt-1">Played {formatDate(game.lastPlayed || '')}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary-600 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-300">
                {profile.bookmarks.map((bookmark) => (
                  <Link key={bookmark.id} href={`/games/${bookmark.game.slug}`} className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                    <div className="relative aspect-[4/3]">
                      <Image src={bookmark.game.thumbnail} alt={bookmark.game.title} fill className="object-cover" />
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold truncate text-sm">{bookmark.game.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">Saved {formatDate(bookmark.createdAt)}</p>
                    </div>
                  </Link>
                ))}
                {profile.bookmarks.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                    <Heart className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">No favorites yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                {profile.recentGames.map((game) => (
                  <div key={game.id} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
                    <div className="relative h-20 w-20 rounded-2xl overflow-hidden flex-shrink-0">
                      <Image src={game.thumbnail} alt={game.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold">{game.title}</h4>
                      <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
                        <Clock className="h-4 w-4" /> Last played {formatDate(game.lastPlayed || '')}
                      </p>
                    </div>
                    <Link href={`/games/${game.slug}`} className="px-6 py-2.5 bg-primary-50 text-primary-600 rounded-2xl font-bold hover:bg-primary-600 hover:text-white transition-all">
                      Play
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-10 animate-in fade-in zoom-in-95 duration-300">
                <div className="max-w-md mx-auto space-y-8">
                  <div className="text-center">
                    <h3 className="text-xl font-bold">Account Settings</h3>
                    <p className="text-gray-400 text-sm mt-2">Manage your account security and preferences</p>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={() => {setSecurityModal({type: 'password'}); setSecurityStep(1); setSecurityError('');}}
                      className="w-full flex items-center justify-between p-5 rounded-2xl hover:bg-gray-50 border border-gray-50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:text-primary-600 transition-colors">
                          <Lock className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-gray-700">Change Password</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-300" />
                    </button>

                    <button 
                      onClick={() => {setSecurityModal({type: 'email'}); setSecurityStep(1); setSecurityError('');}}
                      className="w-full flex items-center justify-between p-5 rounded-2xl hover:bg-gray-50 border border-gray-50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:text-primary-600 transition-colors">
                          <Mail className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-gray-700">Update Email</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-300" />
                    </button>

                    <div className="pt-6 mt-6 border-t border-gray-100">
                      <button 
                        onClick={() => {setSecurityModal({type: 'delete'}); setSecurityStep(1); setSecurityError('');}}
                        className="w-full flex items-center gap-4 p-5 rounded-2xl text-red-500 hover:bg-red-50 transition-all group"
                      >
                        <div className="h-10 w-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center">
                          <Trash2 className="h-5 w-5" />
                        </div>
                        <span className="font-bold">Delete Account</span>
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
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300 relative overflow-hidden">
            {securitySuccess ? (
              <div className="py-10 text-center animate-in zoom-in duration-500">
                <div className="h-20 w-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Success!</h2>
                <p className="text-gray-500 font-medium mt-2">Your account has been updated.</p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${securityModal.type === 'delete' ? 'bg-red-50 text-red-500' : 'bg-primary-50 text-primary-600'}`}>
                    {securityModal.type === 'delete' ? <Trash2 className="h-8 w-8" /> : <Shield className="h-8 w-8" />}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {securityModal.type === 'delete' ? 'Delete Account' : `Update ${securityModal.type}`}
                  </h2>
                  <p className="text-gray-500 mt-3 font-medium text-sm">
                    {securityStep === 1 
                      ? "We'll send a verification code to your email for security." 
                      : "Enter the 6-digit code sent to your inbox."}
                  </p>
                </div>

                {securityError && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs text-center font-bold border border-red-100">{securityError}</div>}

                {securityStep === 2 && (
                  <div className="space-y-4">
                    {securityModal.type !== 'delete' && (
                      <input 
                        type={securityModal.type === 'password' ? 'password' : 'email'}
                        placeholder={securityModal.type === 'password' ? 'New Password' : 'New Email Address'}
                        value={newValue}
                        onChange={e => setNewValue(e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                      />
                    )}
                    <input 
                      type="text" 
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-center text-3xl tracking-[0.3em] font-black focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setSecurityModal({type: null})}
                    className="flex-1 py-4 text-gray-400 font-bold hover:bg-gray-50 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSecurityAction}
                    disabled={securityLoading || (securityStep === 2 && otp.length !== 6)}
                    className={`flex-1 py-4 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 ${securityModal.type === 'delete' ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-100'}`}
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
