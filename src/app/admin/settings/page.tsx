'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, AlertCircle, Globe, Users, Gamepad2, Shield, BarChart3, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  siteLogo?: string | null;
  siteFavicon?: string | null;
  siteUrl?: string | null;
  contactEmail?: string | null;
  socialFacebook?: string | null;
  socialTwitter?: string | null;
  socialInstagram?: string | null;
  socialYoutube?: string | null;
  maintenanceMode: boolean;
  maintenanceMessage?: string | null;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  gamesPerPage: number;
  enableRatings: boolean;
  enableComments: boolean;
  enableBookmarks: boolean;
  showStatistics: boolean;
  enableAnalytics: boolean;
  analyticsCode?: string | null;
  seoMetaTitle?: string | null;
  seoMetaDescription?: string | null;
  seoMetaKeywords?: string | null;
}

export default function AdminSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchSettings();
    }
  }, [user]);

  async function fetchSettings() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch settings');
      }
      
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load settings';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!settings) return;

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  function updateSetting<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    if (!settings) return;
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
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

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  if (!settings) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-red-800">Failed to load settings. Please refresh the page.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage site settings and preferences</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-green-800">Settings saved successfully!</p>
          </div>
        )}

        <div className="space-y-6">
          {/* General Settings */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="mb-6 flex items-center space-x-2">
              <Globe className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => updateSetting('siteName', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => updateSetting('siteDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    type="url"
                    value={settings.siteUrl || ''}
                    onChange={(e) => updateSetting('siteUrl', e.target.value || null)}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail || ''}
                    onChange={(e) => updateSetting('contactEmail', e.target.value || null)}
                    placeholder="contact@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="siteLogo">Site Logo URL</Label>
                  <Input
                    id="siteLogo"
                    type="url"
                    value={settings.siteLogo || ''}
                    onChange={(e) => updateSetting('siteLogo', e.target.value || null)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <Label htmlFor="siteFavicon">Favicon URL</Label>
                  <Input
                    id="siteFavicon"
                    type="url"
                    value={settings.siteFavicon || ''}
                    onChange={(e) => updateSetting('siteFavicon', e.target.value || null)}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="mb-6 flex items-center space-x-2">
              <Globe className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Social Media</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="socialFacebook">Facebook URL</Label>
                <Input
                  id="socialFacebook"
                  type="url"
                  value={settings.socialFacebook || ''}
                  onChange={(e) => updateSetting('socialFacebook', e.target.value || null)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div>
                <Label htmlFor="socialTwitter">Twitter URL</Label>
                <Input
                  id="socialTwitter"
                  type="url"
                  value={settings.socialTwitter || ''}
                  onChange={(e) => updateSetting('socialTwitter', e.target.value || null)}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>

              <div>
                <Label htmlFor="socialInstagram">Instagram URL</Label>
                <Input
                  id="socialInstagram"
                  type="url"
                  value={settings.socialInstagram || ''}
                  onChange={(e) => updateSetting('socialInstagram', e.target.value || null)}
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>

              <div>
                <Label htmlFor="socialYoutube">YouTube URL</Label>
                <Input
                  id="socialYoutube"
                  type="url"
                  value={settings.socialYoutube || ''}
                  onChange={(e) => updateSetting('socialYoutube', e.target.value || null)}
                  placeholder="https://youtube.com/yourchannel"
                />
              </div>
            </div>
          </div>

          {/* User Settings */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="mb-6 flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">User Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label>Allow Registration</Label>
                  <p className="text-sm text-gray-600">Allow new users to register</p>
                </div>
                <Switch
                  checked={settings.allowRegistration}
                  onCheckedChange={(checked) => updateSetting('allowRegistration', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-gray-600">Users must verify their email before using the site</p>
                </div>
                <Switch
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => updateSetting('requireEmailVerification', checked)}
                />
              </div>
            </div>
          </div>

          {/* Game Settings */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="mb-6 flex items-center space-x-2">
              <Gamepad2 className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Game Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="gamesPerPage">Games Per Page</Label>
                <Input
                  id="gamesPerPage"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.gamesPerPage}
                  onChange={(e) => updateSetting('gamesPerPage', parseInt(e.target.value) || 12)}
                />
                <p className="mt-1 text-xs text-gray-500">Number of games to display per page (1-100)</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label>Enable Ratings</Label>
                  <p className="text-sm text-gray-600">Allow users to rate games</p>
                </div>
                <Switch
                  checked={settings.enableRatings}
                  onCheckedChange={(checked) => updateSetting('enableRatings', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label>Enable Comments</Label>
                  <p className="text-sm text-gray-600">Allow users to comment on games</p>
                </div>
                <Switch
                  checked={settings.enableComments}
                  onCheckedChange={(checked) => updateSetting('enableComments', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label>Enable Bookmarks</Label>
                  <p className="text-sm text-gray-600">Allow users to bookmark games</p>
                </div>
                <Switch
                  checked={settings.enableBookmarks}
                  onCheckedChange={(checked) => updateSetting('enableBookmarks', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label>Show Statistics</Label>
                  <p className="text-sm text-gray-600">Display game statistics (ratings, online count, etc.)</p>
                </div>
                <Switch
                  checked={settings.showStatistics}
                  onCheckedChange={(checked) => updateSetting('showStatistics', checked)}
                />
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="mb-6 flex items-center space-x-2">
              <Search className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">SEO Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="seoMetaTitle">Meta Title</Label>
                <Input
                  id="seoMetaTitle"
                  value={settings.seoMetaTitle || ''}
                  onChange={(e) => updateSetting('seoMetaTitle', e.target.value || null)}
                  placeholder="Your Site Title"
                />
              </div>

              <div>
                <Label htmlFor="seoMetaDescription">Meta Description</Label>
                <Textarea
                  id="seoMetaDescription"
                  value={settings.seoMetaDescription || ''}
                  onChange={(e) => updateSetting('seoMetaDescription', e.target.value || null)}
                  rows={3}
                  placeholder="A brief description of your site"
                />
              </div>

              <div>
                <Label htmlFor="seoMetaKeywords">Meta Keywords</Label>
                <Input
                  id="seoMetaKeywords"
                  value={settings.seoMetaKeywords || ''}
                  onChange={(e) => updateSetting('seoMetaKeywords', e.target.value || null)}
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="mt-1 text-xs text-gray-500">Comma-separated keywords</p>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="mb-6 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label>Enable Analytics</Label>
                  <p className="text-sm text-gray-600">Enable analytics tracking code</p>
                </div>
                <Switch
                  checked={settings.enableAnalytics}
                  onCheckedChange={(checked) => updateSetting('enableAnalytics', checked)}
                />
              </div>

              {settings.enableAnalytics && (
                <div>
                  <Label htmlFor="analyticsCode">Analytics Code</Label>
                  <Textarea
                    id="analyticsCode"
                    value={settings.analyticsCode || ''}
                    onChange={(e) => updateSetting('analyticsCode', e.target.value || null)}
                    rows={4}
                    placeholder="Paste your analytics code here (e.g., Google Analytics)"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-6">
            <div className="mb-6 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900">Maintenance Mode</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">
                    Enable maintenance mode to temporarily disable the site for all non-admin users
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                />
              </div>

              {settings.maintenanceMode && (
                <div>
                  <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                  <Textarea
                    id="maintenanceMessage"
                    value={settings.maintenanceMessage || ''}
                    onChange={(e) => updateSetting('maintenanceMessage', e.target.value || null)}
                    rows={3}
                    placeholder="We'll be back soon! The site is currently under maintenance."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
