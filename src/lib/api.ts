/**
 * API utility functions
 */

const API_BASE = '/api';

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export async function api<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build URL with query params
  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    url += `?${queryParams.toString()}`;
  }

  // Add default headers
  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'An error occurred',
      }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData: {
    username: string;
    email: string;
    password: string;
    name?: string;
  }) =>
    api<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  logout: () => api('/auth/logout', { method: 'POST' }),

  verify: () => api<{ user: any }>('/auth/verify'),
};

// Games API
export const gamesApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sort?: string;
    featured?: boolean;
  }) => api('/games', { params }),

  getById: (id: string) => api(`/games/${id}`),

  create: (gameData: any) =>
    api('/admin/games', {
      method: 'POST',
      body: JSON.stringify(gameData),
    }),

  update: (id: string, gameData: any) =>
    api(`/admin/games/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gameData),
    }),

  delete: (id: string) =>
    api(`/admin/games/${id}`, { method: 'DELETE' }),

  rate: (gameId: string, rating: number, review?: string) =>
    api(`/games/${gameId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    }),
};

// Categories API
export const categoriesApi = {
  getAll: () => api('/categories'),

  create: (categoryData: any) =>
    api('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    }),

  update: (id: string, categoryData: any) =>
    api(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    }),

  delete: (id: string) =>
    api(`/admin/categories/${id}`, { method: 'DELETE' }),
};

// Users API
export const usersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api('/admin/users', { params }),

  getById: (id: string) => api(`/admin/users/${id}`),

  update: (id: string, userData: any) =>
    api(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  delete: (id: string) =>
    api(`/admin/users/${id}`, { method: 'DELETE' }),
};

// Stats API
export const statsApi = {
  getDashboard: () => api('/admin/stats'),
};

// Contact API
export const contactApi = {
  send: (data: { name: string; email: string; subject: string; message: string }) =>
    api('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
