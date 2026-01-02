'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, Mail, User, Shield, Calendar, Edit, Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface UserData {
  id: string;
  email: string;
  username: string;
  name?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  stats: {
    ratingsCount: number;
    playSessionsCount: number;
    bookmarksCount: number;
    playMinutes?: number;
  };
}

export default function AdminUsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'USER' | 'ADMIN'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [user, currentPage, roleFilter, search]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(search && { search }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(id: string) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. They may be the last admin.');
    }
  }

  async function updateUserRole(id: string, currentRole: 'USER' | 'ADMIN') {
    const newRole = currentRole === 'USER' ? 'ADMIN' : 'USER';

    if (!confirm(`Are you sure you want to ${newRole === 'ADMIN' ? 'promote' : 'demote'} this user?`)) return;

    try {
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
            <p className="text-gray-900">View and manage user accounts and permissions</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users by email, username, or name..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>
            </div>
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 px-4 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                <option value="all">All Roles</option>
                <option value="USER">Users</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setRoleFilter('all')}
              className={`rounded-full px-3 py-1 text-sm ${
                roleFilter === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setRoleFilter('USER')}
              className={`rounded-full px-3 py-1 text-sm ${
                roleFilter === 'USER'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Regular Users
            </button>
            <button
              onClick={() => setRoleFilter('ADMIN')}
              className={`rounded-full px-3 py-1 text-sm ${
                roleFilter === 'ADMIN'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Administrators
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="mx-auto max-w-md">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">No users found</h3>
                        <p className="text-gray-600">
                          {search ? 'Try a different search term' : 'No users in the system yet'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {user.avatar ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.avatar}
                                alt={user.username}
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                                <User className="h-5 w-5 text-primary-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || user.username}
                            </div>
                            <div className="text-sm text-gray-900">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="mr-2 h-4 w-4 text-gray-400" />
                          {user.email}
                        </div>
                        <div className="mt-1 text-sm text-gray-900">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="text-gray-900">{user.stats.ratingsCount} ratings</div>
                          <div className="text-gray-900">{user.stats.playSessionsCount} play sessions</div>
                          <div className="text-gray-900">
                            {user.stats.playMinutes !== undefined
                              ? `${user.stats.playMinutes.toLocaleString()} mins played`
                              : '0 mins played'}
                          </div>
                          <div className="text-gray-900">
                            Last login: {user.lastLoginAt 
                              ? new Date(user.lastLoginAt).toLocaleDateString() 
                              : 'Never'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                              user.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            <Shield className="mr-1 h-3 w-3" />
                            {user.role}
                          </span>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              user.isVerified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                            className="rounded-lg p-2 text-blue-400 hover:bg-blue-50 hover:text-blue-500"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateUserRole(user.id, user.role)}
                            className={`rounded-lg p-2 ${
                              user.role === 'ADMIN'
                                ? 'text-purple-400 hover:bg-purple-50 hover:text-purple-500'
                                : 'text-blue-400 hover:bg-blue-50 hover:text-blue-500'
                            }`}
                            title={user.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-500"
                            title="Delete"
                            disabled={user.id === user.id} // Prevent self-deletion
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Total Users</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="rounded-lg bg-primary-100 p-3">
                <User className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Administrators</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'ADMIN').length}
                </p>
              </div>
              <div className="rounded-lg bg-purple-100 p-3">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Verified Users</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {users.filter(u => u.isVerified).length}
                </p>
              </div>
              <div className="rounded-lg bg-green-100 p-3">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Active Today</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {users.filter(u => {
                    if (!u.lastLoginAt) return false;
                    const lastLogin = new Date(u.lastLoginAt);
                    const today = new Date();
                    return lastLogin.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
