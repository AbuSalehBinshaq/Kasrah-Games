'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, Info, Mail, User } from 'lucide-react';

interface NavigationProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export default function Navigation({ mobile = false, onNavigate }: NavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/games', label: 'Games', icon: Gamepad2 },
    { href: '/about', label: 'About', icon: Info },
    { href: '/contact', label: 'Contact', icon: Mail },
  ];

  const baseClasses = mobile
    ? 'block px-4 py-2 text-base font-medium'
    : 'px-3 py-2 text-sm font-medium rounded-lg';

  const activeClasses = 'text-primary-600 bg-primary-50';
  const inactiveClasses = 'text-gray-700 hover:bg-gray-100';

  return (
    <>
      {navItems.map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== '/' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} flex items-center space-x-2 transition-colors`}
            onClick={onNavigate}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}