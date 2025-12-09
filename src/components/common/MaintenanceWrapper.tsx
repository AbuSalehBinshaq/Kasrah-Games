'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import Header from './Header';
import Footer from './Footer';

interface MaintenanceWrapperProps {
  children: React.ReactNode;
}

export default function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { settings } = useSettings();

  // Check if current route should be accessible during maintenance
  const isAuthRoute = pathname?.startsWith('/auth');
  const isAdminRoute = pathname?.startsWith('/admin');
  const isApiRoute = pathname?.startsWith('/api');
  const isAdmin = user?.role === 'ADMIN';

  // Allow access if:
  // 1. User is admin
  // 2. Route is auth (login/register)
  // 3. Route is admin panel
  // 4. Route is API
  // 5. Maintenance mode is off
  const shouldShowMaintenance = 
    settings.maintenanceMode && 
    !isAdmin && 
    !isAuthRoute && 
    !isAdminRoute && 
    !isApiRoute;

  if (shouldShowMaintenance) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Maintenance Mode</h1>
          <p className="text-lg text-gray-600">
            {settings.maintenanceMessage || 'We are currently performing maintenance. Please check back soon.'}
          </p>
          <div className="mt-6">
            <a
              href="/auth/login"
              className="inline-block rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700"
            >
              Admin Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Don't show Header/Footer on auth pages
  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

