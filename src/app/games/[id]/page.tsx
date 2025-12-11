'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertCircle,
  Eye,
  Play,
  ThumbsUp,
  Users,
} from 'lucide-react';
import LikeDislike from '@/components/common/LikeDislike';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AdDisplay from '@/components/common/AdDisplay';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import GameCard from '@/components/common/GameCard';
import GameContainer from '@/components/GameContainer';
import type { Game } from '@/types';

type CardGame = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  playCount: number;
  onlineCount?: number;
  likes: number;
  dislikes: number;
  likePercentage: number;
  totalRatings: number;
  categoryNames: string[];
};

interface GameDetails {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  developer: string;
  publisher?: string;
  releaseDate?: string;
  thumbnail: string;
  coverImage?: string;
  gameUrl: string;
  gameType: string;
  technologies: string[];
  tags?: string[];
  requirements?: any;
  ageRating?: string;
  views: number;
  playCount: number;
  onlineCount: number;
  likes: number;
  dislikes: number;
  likePercentage: number;
  totalRatings: number;
  categoryNames: string[];
  userVote?: 'like' | 'dislike' | null;
}

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();
  const showStats = settingsLoading ? true : settings?.showStatistics !== false;

  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [similarGames, setSimilarGames] = useState<CardGame[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchGameDetails();
    }
  }, [params.id]);

  useEffect(() => {
    if (game?.id) {
      fetchSimilarGames(game.id);
    }
  }, [game?.id]);

  async function fetchGameDetails() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/games/${params.id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Game not found');
      }
      const data = await response.json();
      setGame({ ...data, tags: Array.isArray(data.tags) ? data.tags : [] });
      setUserVote(data.userVote ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game');
    } finally {
      setLoading(false);
    }
  }

  async function handlePlayGame() {
    if (!game) return;
    setIsPlaying(true);
    try {
      await fetch(`/api/games/${game.id}/play`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
      console.error('Failed to track play session:', err);
    }
  }

  async function handleVote(vote: 'like' | 'dislike') {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!game) return;
    setIsSubmittingVote(true);
    try {
      const response = await fetch(`/api/games/${game.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLike: vote === 'like' }),
      });
      if (!response.ok) throw new Error('Failed to submit vote');
      const data = await response.json();
      setUserVote(data.userVote);
      setGame((prev) =>
        prev
          ? {
              ...prev,
              likes: data.newLikes ?? prev.likes,
              dislikes: data.newDislikes ?? prev.dislikes,
              likePercentage: data.newLikePercentage ?? prev.likePercentage,
              totalRatings: data.newTotalRatings ?? prev.totalRatings,
            }
          : null
      );
    } catch (err) {
      console.error('Failed to vote:', err);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setIsSubmittingVote(false);
    }
  }

  async function handleFavorite() {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    try {
      setIsFavoriting(true);
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game?.id }),
      });
      if (response.ok) {
        setIsFavorited(true);
        alert('Game added to favorites!');
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to favorite');
      }
    } catch (err) {
      console.error('Failed to favorite:', err);
      alert('Failed to add to favorites. Please try again.');
    } finally {
      setIsFavoriting(false);
    }
  }

  async function fetchSimilarGames(id: string) {
    setLoadingSimilar(true);
    try {
      const res = await fetch(`/api/games/${id}/similar?limit=6`);
      const data = await res.json();
      const normalized: CardGame[] = Array.isArray(data.games)
        ? data.games.map((g: any) => ({
            id: g.id,
            slug: g.slug ?? g.id,
            title: g.title ?? 'Untitled',
            description: g.shortDescription ?? g.description ?? '',
            thumbnail: g.thumbnail ?? '/images/placeholder-game.svg',
            playCount: g.playCount ?? 0,
            onlineCount: g.onlineCount ?? 0,
            likes: g.likes ?? 0,
            dislikes: g.dislikes ?? 0,
            likePercentage: g.likePercentage ?? 0,
            totalRatings: g.totalRatings ?? 0,
            categoryNames: g.categoryNames ?? [],
          }))
        : [];
      setSimilarGames(normalized);
    } catch (err) {
      console.error('Failed to load similar games:', err);
      setSimilarGames([]);
    } finally {
      setLoadingSimilar(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-full bg-red-100 p-6">
            <AlertCircle className="h-16 w-16 text-red-600" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">404</h1>
          <h2 className="mb-4 text-2xl font-semibold text-gray-700">Game Not Found</h2>
          <p className="mb-2 text-gray-600">
            The game with slug <span className="font-mono font-semibold text-gray-900">"{params.id}"</span>{' '}
            {error && error.includes('not published') ? 'is not published yet' : 'does not exist'}.
          </p>
          <p className="mb-8 text-sm text-gray-500">{error || 'The game might have been removed or the URL is incorrect.'}</p>
          {error && error.includes('not published') && (
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                <strong>Tip:</strong> Go to{' '}
                <Link href="/admin/games" className="font-semibold underline">
                  Admin Panel → Games
                </Link>{' '}
                and make sure the game is marked as "Published".
              </p>
            </div>
          )}
          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link href="/games" className="inline-flex items-center space-x-2 rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700">
              <span>Browse All Games</span>
            </Link>
            <Link href="/" className="inline-flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50">
              <span>Go to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pb-12 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-8 px-4">
        <div className="flex items-center gap-2 pt-4 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <span className="opacity-50">/</span>
          <Link href="/games" className="hover:text-slate-900">Games</Link>
          <span className="opacity-50">/</span>
          <span className="font-semibold text-slate-900">{game.title}</span>
        </div>

        {!isPlaying && (
          <div className="space-y-8">
            {/* Hero aligned with reference design */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
              <div className="absolute inset-0">
                <Image
                  src={game.coverImage || game.thumbnail}
                  alt={game.title}
                  fill
                  className="object-cover blur-[2px] opacity-60"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-slate-900/90" />
              </div>

              <div className="relative flex flex-col items-center gap-6 px-6 py-10 md:px-10 lg:px-14">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-2xl">
                    <div className="relative h-40 w-64 md:h-48 md:w-80">
                      <Image
                        src={game.thumbnail}
                        alt={game.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <h1 className="text-3xl font-bold md:text-4xl">{game.title}</h1>
                  </div>

                  <button
                    onClick={handlePlayGame}
                    className="rounded-full bg-[var(--color-primary)] px-10 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-[var(--color-primary-hover)] md:block"
                  >
                    Play Now
                  </button>
                </div>

                <div className="flex w-full items-center justify-between gap-2 rounded-2xl bg-black/40 px-4 py-3 text-sm md:px-6">
                  <div className="flex items-center gap-2 text-white/90">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold">
                      {game.title.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="font-semibold">{game.title}</span>
                  </div>

                  <div className="flex flex-1 flex-wrap items-center justify-end gap-3 text-white/90">
                    <div className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span className="font-semibold">{(game.likes ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                      <Eye className="h-4 w-4" />
                      <span className="font-semibold">{(game.views ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                      <Users className="h-4 w-4" />
                      <span className="font-semibold">{(game.onlineCount ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description + stats below hero */}
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-3 text-xl font-bold text-slate-900">About this game</h2>
                  <p className="leading-relaxed text-slate-700">{game.description || game.shortDescription}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-bold text-slate-900">Stats</h3>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
                    <span className="flex items-center gap-2 text-slate-600">
                      <ThumbsUp className="h-4 w-4 text-slate-500" />
                      Likes
                    </span>
                    <span className="font-semibold text-slate-900">{(game.likes ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
                    <span className="flex items-center gap-2 text-slate-600">
                      <Users className="h-4 w-4 text-slate-500" />
                      Online
                    </span>
                    <span className="font-semibold text-slate-900">{(game.onlineCount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
                    <span className="flex items-center gap-2 text-slate-600">
                      <Eye className="h-4 w-4 text-slate-500" />
                      Visits
                    </span>
                    <span className="font-semibold text-slate-900">{(game.views ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isPlaying && (
          <GameContainer
            title={game.title}
            siteName={settings?.siteName || 'Kasrah Games'}
            siteLogoUrl={settings?.siteLogo || undefined}
            likes={game.likes}
            dislikes={game.dislikes}
            userVote={userVote}
            onVote={handleVote}
            onFavorite={handleFavorite}
            isFavorited={isFavorited}
            isFavoriting={isFavoriting}
          >
            <iframe src={game.gameUrl} className="h-full w-full" title={game.title} allowFullScreen />
          </GameContainer>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-bold text-slate-900">About This Game</h2>
              <p className="leading-relaxed text-slate-700">{game.description}</p>
            </div>

            {game.tags && game.tags.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-slate-900">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {game.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/games?tag=${encodeURIComponent(tag)}`}
                      className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-100"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-bold text-slate-900">Rate This Game</h2>
              {user ? (
                <div className="space-y-3">
                  <LikeDislike
                    likes={game.likes}
                    dislikes={game.dislikes}
                    userVote={userVote}
                    onVote={handleVote}
                    showCounts
                    size="lg"
                  />
                  <p className="text-sm text-slate-600">
                    {game.totalRatings > 0 ? `Rating: ${game.likePercentage}% (${game.totalRatings} votes)` : 'Be the first to rate this game!'}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="mb-3 text-slate-600">Please login to rate this game.</p>
                  <Link href="/auth/login" className="inline-block rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700">
                    Login to Rate
                  </Link>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Similar Games</h2>
                {loadingSimilar && <span className="text-sm text-slate-500">Loading...</span>}
              </div>
              {similarGames.length === 0 && !loadingSimilar ? (
                <p className="text-sm text-slate-600">No similar games found.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {similarGames.map((g) => (
                    <GameCard key={`similar-${g.id}`} game={g} viewMode="grid" />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Sidebar Ad */}
            <AdDisplay position="SIDEBAR" />
            
            {game.requirements && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-slate-900">Requirements</h3>
                <div className="space-y-2 text-sm text-slate-700">
                  {game.requirements.browser && (
                    <p>
                      <strong>Browser:</strong> {game.requirements.browser}
                    </p>
                  )}
                  {game.requirements.controls && (
                    <p>
                      <strong>Controls:</strong> {game.requirements.controls}
                    </p>
                  )}
                  {game.requirements.min && (
                    <p>
                      <strong>Minimum:</strong> {game.requirements.min}
                    </p>
                  )}
                  {game.requirements.recommended && (
                    <p>
                      <strong>Recommended:</strong> {game.requirements.recommended}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

