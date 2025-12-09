'use client';

import Link from 'next/link';
import { Gamepad2, Home, Search, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8 inline-flex items-center justify-center rounded-full bg-red-100 p-6">
          <AlertCircle className="h-16 w-16 text-red-600" />
        </div>

        <h1 className="mb-4 text-5xl font-bold text-gray-900">404</h1>
        <h2 className="mb-6 text-2xl font-semibold text-gray-700">Page Not Found</h2>

        <p className="mx-auto mb-8 max-w-md text-gray-600">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>

        <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700"
          >
            <Home className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/games"
            className="inline-flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Search className="h-5 w-5" />
            <span>Browse Games</span>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/about"
            className="rounded-lg border border-gray-200 p-4 hover:border-primary-500 hover:bg-primary-50"
          >
            <h3 className="mb-2 font-semibold text-gray-900">About Us</h3>
            <p className="text-sm text-gray-600">Learn more about Kasrah Games</p>
          </Link>

          <Link
            href="/contact"
            className="rounded-lg border border-gray-200 p-4 hover:border-primary-500 hover:bg-primary-50"
          >
            <h3 className="mb-2 font-semibold text-gray-900">Contact Support</h3>
            <p className="text-sm text-gray-600">Need help? Get in touch</p>
          </Link>

          <Link
            href="/auth/register"
            className="rounded-lg border border-gray-200 p-4 hover:border-primary-500 hover:bg-primary-50"
          >
            <h3 className="mb-2 font-semibold text-gray-900">Join Free</h3>
            <p className="text-sm text-gray-600">Create an account and start playing</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
