'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountSettingsPage() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: initial, 2: otp input
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRequestOTP = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/otp/request', { method: 'POST' });
      if (res.ok) {
        setStep(2);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete account');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-6">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        
        <button
          onClick={() => setShowDeleteModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Delete Account
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Confirm Account Deletion</h2>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}

            {step === 1 ? (
              <>
                <p className="text-gray-600 mb-6">
                  To protect your account, we need to verify your identity. We will send a 6-digit code to your email.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestOTP}
                    disabled={loading}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Code'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Enter the 6-digit code sent to your email to confirm deletion.
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  className="w-full text-center text-2xl tracking-widest border rounded-md py-3 mb-6 focus:ring-2 focus:ring-red-500 outline-none"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading || otp.length !== 6}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Deleting...' : 'Confirm Delete'}
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