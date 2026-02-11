'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  X,
  Shield,
  Trash2,
  Lock,
  MailWarning
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
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
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', bio: '' });
  
  // Security States
  const [securityModal, setSecurityModal] = useState<{type: 'password' | 'email' | 'delete' | null}>({type: null});
  const [otp, setOtp] = useState('');
  const [newValue, setNewValue] = useState('');
  const [securityStep, setSecurityStep] = useState(1); // 1: request, 2: verify
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState('');

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
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      {/* Profile Header */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg">
            {profile.avatar ? (
              <Image src={profile.avatar} alt={profile.username} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-purple-700"><User className="h-16 w-16" /></div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold">{profile.name || profile.username}</h1>
            <p className="text-purple-100">@{profile.username}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>{profile.email}</span></div>
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>Joined {formatDate(profile.createdAt)}</span></div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsEditing(!isEditing)} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"><Edit className="h-5 w-5" /></button>
            <button onClick={logout} className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"><LogOut className="h-5 w-5" /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100 text-center">
              <Gamepad2 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-xs text-gray-500 uppercase">Games</p>
              <p className="text-xl font-bold">{profile.stats.totalGamesPlayed}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-xs text-gray-500 uppercase">Minutes</p>
              <p className="text-xl font-bold">{profile.stats.totalPlayTime}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100 text-center">
              <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-xs text-gray-500 uppercase">Rating</p>
              <p className="text-xl font-bold">{profile.stats.averageRating.toFixed(1)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100 text-center">
              <Star className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-xs text-gray-500 uppercase">Saved</p>
              <p className="text-xl font-bold">{profile.stats.bookmarksCount}</p>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="bg-white p-6 rounded-xl shadow border border-gray-100 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><Edit className="h-5 w-5" /> Edit Basic Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  value={editData.name} 
                  onChange={e => setEditData({...editData, name: e.target.value})}
                  placeholder="Full Name"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <textarea 
                value={editData.bio} 
                onChange={e => setEditData({...editData, bio: e.target.value})}
                placeholder="Short bio..."
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none h-24"
              />
              <button onClick={async () => {
                await fetch('/api/auth/profile', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(editData)
                });
                setIsEditing(false);
                fetchProfile();
              }} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">Save Changes</button>
            </div>
          )}
        </div>

        {/* Sidebar / Security */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800"><Shield className="h-5 w-5 text-purple-600" /> Account Security</h2>
            <div className="space-y-3">
              <button 
                onClick={() => {setSecurityModal({type: 'password'}); setSecurityStep(1); setSecurityError('');}}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3"><Lock className="h-4 w-4 text-gray-400" /> <span>Change Password</span></div>
                <Edit className="h-4 w-4 text-gray-300" />
              </button>
              <button 
                onClick={() => {setSecurityModal({type: 'email'}); setSecurityStep(1); setSecurityError('');}}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3"><MailWarning className="h-4 w-4 text-gray-400" /> <span>Change Email</span></div>
                <Edit className="h-4 w-4 text-gray-300" />
              </button>
              <div className="pt-4 mt-4 border-t border-gray-100">
                <button 
                  onClick={() => {setSecurityModal({type: 'delete'}); setSecurityStep(1); setSecurityError('');}}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" /> <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Modals */}
      {securityModal.type && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold capitalize">
                {securityModal.type === 'delete' ? 'Delete Account' : `Update ${securityModal.type}`}
              </h2>
              <p className="text-gray-500 mt-2">
                {securityStep === 1 
                  ? "For your security, we'll send a verification code to your email." 
                  : "Enter the 6-digit code sent to your email."}
              </p>
            </div>

            {securityError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">{securityError}</div>}

            {securityStep === 2 && (
              <div className="space-y-4">
                {securityModal.type !== 'delete' && (
                  <input 
                    type={securityModal.type === 'password' ? 'password' : 'email'}
                    placeholder={`New ${securityModal.type}`}
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                )}
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="Verification Code"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="w-full p-3 border rounded-xl text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setSecurityModal({type: null})}
                className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSecurityAction}
                disabled={securityLoading || (securityStep === 2 && otp.length !== 6)}
                className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 ${securityModal.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}
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
