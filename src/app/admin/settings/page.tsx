'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, Globe, Shield, BarChart3 } from 'lucide-react';
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
  primaryColor?: string | null;
  primaryColorHover?: string | null;
  backgroundFrom?: string | null;
  backgroundTo?: string | null;
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
      setError(error instanceof Error ? error.message : 'Failed to load settings');
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

  if (!user || user.role !== 'ADMIN') return null;

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

        <div className="space-y-6 pb-20">
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
                    value={settings.siteUrl ?? ''}
                    onChange={(e) => updateSetting('siteUrl', e.target.value || null)}
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    value={settings.contactEmail ?? ''}
                    onChange={(e) => updateSetting('contactEmail', e.target.value || null)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="siteLogo">Logo URL</Label>
                  <Input
                    id="siteLogo"
                    value={settings.siteLogo ?? ''}
                    onChange={(e) => updateSetting('siteLogo', e.target.value || null)}
                  />
                </div>
                <div>
                  <Label htmlFor="siteFavicon">Favicon URL</Label>
                  <Input
                    id="siteFavicon"
                    value={settings.siteFavicon ?? ''}
                    onChange={(e) => updateSetting('siteFavicon', e.target.value || null)}
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
              {['Facebook', 'Twitter', 'Instagram', 'Youtube'].map((platform) => {
                const key = `social${platform}` as keyof SiteSettings;
                return (
                  <div key={platform}>
                    <Label htmlFor={key}>{platform} URL</Label>
                    <Input
                      id={key}
                      value={(settings[key] as string) ?? ''}
                      onChange={(e) => updateSetting(key, e.target.value || null)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Appearance */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="mb-6 flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="w-12 h-10 p-1"
                    value={settings.primaryColor ?? '#7c3aed'}
                    onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  />
                  <Input
                    value={settings.primaryColor ?? ''}
                    onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="gamesPerPage">Games Per Page</Label>
                <Input
                  type="number"
                  value={settings.gamesPerPage}
                  onChange={(e) => updateSetting('gamesPerPage', parseInt(e.target.value) || 12)}
                />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="mb-6 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">SEO Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="seoMetaTitle">Meta Title</Label>
                <Input
                  id="seoMetaTitle"
                  value={settings.seoMetaTitle ?? ''}
                  onChange={(e) => updateSetting('seoMetaTitle', e.target.value || null)}
                />
              </div>
              <div>
                <Label htmlFor="seoMetaDescription">Meta Description</Label>
                <Textarea
                  id="seoMetaDescription"
                  value={settings.seoMetaDescription ?? ''}
                  onChange={(e) => updateSetting('seoMetaDescription', e.target.value || null)}
                />
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="mb-6 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Analytics Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableAnalytics">Enable Google Analytics</Label>
                <Switch
                  id="enableAnalytics"
                  checked={settings.enableAnalytics}
                  onCheckedChange={(checked) => updateSetting('enableAnalytics', checked)}
                />
              </div>
              <div>
                <Label htmlFor="analyticsCode">Google Analytics ID (G-XXXXXXXXXX)</Label>
                <Input
                  id="analyticsCode"
                  placeholder="G-XXXXXXXXXX"
                  value={settings.analyticsCode ?? ''}
                  onChange={(e) => updateSetting('analyticsCode', e.target.value || null)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter your Google Analytics 4 Measurement ID to track site traffic.
                </p>
              </div>
            </div>
          </div>

          {/* Features & Registration */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="mb-6 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Features & Registration</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowRegistration">Allow User Registration</Label>
                  <Switch
                    id="allowRegistration"
                    checked={settings.allowRegistration}
                    onCheckedChange={(checked) => updateSetting('allowRegistration', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                  <Switch
                    id="requireEmailVerification"
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) => updateSetting('requireEmailVerification', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showStatistics">Show Public Statistics</Label>
                  <Switch
                    id="showStatistics"
                    checked={settings.showStatistics}
                    onCheckedChange={(checked) => updateSetting('showStatistics', checked)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableRatings">Enable Game Ratings</Label>
                  <Switch
                    id="enableRatings"
                    checked={settings.enableRatings}
                    onCheckedChange={(checked) => updateSetting('enableRatings', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="enableBookmarks">Enable Bookmarks/Favorites</Label>
                  <Switch
                    id="enableBookmarks"
                    checked={settings.enableBookmarks}
                    onCheckedChange={(checked) => updateSetting('enableBookmarks', checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance */}
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-6">
            <div className="mb-6 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900">Maintenance Mode</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenanceMode">Enable Maintenance Mode</Label>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                />
              </div>
              {settings.maintenanceMode && (
                <div>
                  <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                  <Textarea
                    id="maintenanceMessage"
                    value={settings.maintenanceMessage ?? ''}
                    onChange={(e) => updateSetting('maintenanceMessage', e.target.value || null)}
                    placeholder="Site is currently under maintenance. We will be back soon!"
                    rows={3}
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