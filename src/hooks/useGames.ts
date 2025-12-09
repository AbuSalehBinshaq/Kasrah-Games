'use client';

import { useState, useEffect, useCallback } from 'react';
import { gamesApi } from '@/lib/api';

interface Game {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  coverImage?: string;
  playCount: number;
  avgRating: number;
  categoryNames: string[];
  tags?: string[];
  developer: string;
  gameType: string;
  technologies: string[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UseGamesOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: string;
  featured?: boolean;
  autoFetch?: boolean;
}

export function useGames(options: UseGamesOptions = {}) {
  const {
    page = 1,
    limit = 12,
    search = '',
    category = '',
    sort = 'newest',
    featured = false,
    autoFetch = true,
  } = options;

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page,
    limit,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        search,
        category,
        sort,
        featured,
      };

      const data = await gamesApi.getAll(params) as any;
      setGames(Array.isArray(data?.games) ? data.games : []);
      setPagination(data?.pagination || {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch games');
      console.error('Failed to fetch games:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, category, sort, featured]);

  useEffect(() => {
    if (autoFetch) {
      fetchGames();
    }
  }, [fetchGames, autoFetch]);

  const refetch = useCallback(() => {
    fetchGames();
  }, [fetchGames]);

  const getGameById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const game = await gamesApi.getById(id);
      return game;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch game');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rateGame = useCallback(async (gameId: string, rating: number, review?: string) => {
    try {
      const result: any = await gamesApi.rate(gameId, rating, review);
      // Update the game in the local state if it exists
      setGames(prevGames =>
        prevGames.map(game =>
          game.id === gameId
            ? { ...game, avgRating: result?.newRating ?? game.avgRating }
            : game
        )
      );
      return result;
    } catch (err) {
      throw err;
    }
  }, []);

  const bookmarkGame = useCallback(async (gameId: string) => {
    try {
      // This would be implemented with a real API endpoint
      console.log('Bookmarking game:', gameId);
      // TODO: Implement actual bookmark API
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    games,
    loading,
    error,
    pagination,
    refetch,
    getGameById,
    rateGame,
    bookmarkGame,
  };
}
