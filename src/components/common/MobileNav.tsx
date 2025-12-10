'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, Search, User } from 'lucide-react';

const links = [
  { href: '/', icon: Home, label: 'الرئيسية' },
  { href: '/games', icon: Gamepad2, label: 'الألعاب' },
  { href: '/games?search=', icon: Search, label: 'بحث' },
  { href: '/auth/profile', icon: User, label: 'البروفايل' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-1/2 bottom-4 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-2xl border border-white/50 bg-white/90 px-3 py-2 shadow-2xl backdrop-blur-md md:hidden">
      <div className="flex items-center justify-between text-gray-700">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href.split('?')[0]));
          return (
            <Link
              key={href}
              href={href}
              className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
                isActive ? 'bg-gray-100 text-primary-600 shadow-inner' : 'hover:bg-gray-100'
              }`}
              aria-label={label}
            >
              <Icon className="h-6 w-6" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

