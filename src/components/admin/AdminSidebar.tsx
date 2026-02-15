'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Gamepad2,
  Users,
  Tag,
  Star,
  Settings,
  LogOut,
  Megaphone,
  ShieldAlert,
  Zap,
  BarChart3,
  Database,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isSdkOpen, setIsSdkOpen] = useState(false);

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/games', label: 'Games', icon: Gamepad2 },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/categories', label: 'Categories', icon: Tag },
    { href: '/admin/featured', label: 'Featured', icon: Star },
    { href: '/admin/ads', label: 'Ads', icon: Megaphone },
    { href: '/admin/logs', label: 'Activity Logs', icon: ShieldAlert },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const sdkMenuItems = [
    { href: '/admin/sdk/games', label: 'SDK Games', icon: Gamepad2 },
    { href: '/admin/sdk/ads', label: 'SDK Ads', icon: Zap },
    { href: '/admin/sdk/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/sdk/data', label: 'Cloud Data', icon: Database },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const isSdkActive = sdkMenuItems.some(item => isActive(item.href));

  return (
    <aside className="w-64 border-r border-gray-200 bg-white">
      <div className="sticky top-0 p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-600">Kasrah Games</p>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const itemIsActive = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  itemIsActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* SDK Section */}
          <div className="mt-4 border-t border-gray-200 pt-4">
            <button
              onClick={() => setIsSdkOpen(!isSdkOpen)}
              className={`w-full flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isSdkActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Zap className="h-5 w-5" />
              <span>SDK System</span>
              <ChevronDown
                className={`h-4 w-4 ml-auto transition-transform ${
                  isSdkOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isSdkOpen && (
              <div className="mt-2 space-y-1 pl-4">
                {sdkMenuItems.map((item) => {
                  const itemIsActive = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                        itemIsActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <button
            onClick={() => logout()}
            className="flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
