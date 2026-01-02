'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleLoginSuccess = () => {
    router.push('/');
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <LogIn className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your Kasrah Games account</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center space-x-2 rounded-lg bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <LoginForm onSuccess={handleLoginSuccess} onError={setError} />

        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">New to Kasrah Games?</span>
            </div>
          </div>

          <Link
            href="/auth/register"
            className="block w-full rounded-lg border-2 border-primary-600 bg-white px-4 py-3 text-center font-semibold text-primary-600 hover:bg-primary-50"
          >
            Create New Account
          </Link>

          <div className="text-center text-sm text-gray-600">
            <Link href="/auth/forgot-password" className="hover:text-primary-600">
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}