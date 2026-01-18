'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';
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
  const [isPaused, setIsPaused] = useState(false);
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

  const [sessionId, setSessionId] = useState<string | null>(null);

  async function handlePlayGame() {
    if (!game) return;
    setIsPlaying(true);
    setIsPaused(false);
    try {
      const response = await fetch(`/api/games/${game.id}/play`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await response.json();
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }
    } catch (err) {
      console.error('Failed to track play session:', err);
    }
  }

  function handleContinuePlaying() {
    setIsPaused(false);
    setIsPlaying(true);
  }

  function handleExitFullscreen() {
    setIsPaused(true);
    setIsPlaying(false);
  }

  // Track session end when leaving or closing
  useEffect(() => {
    return () => {
      if (sessionId && game?.id) {
        const url = `/api/games/${game.id}/play/end`;
        const body = JSON.stringify({ sessionId });
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, body);
        } else {
          fetch(url, { method: 'POST', body, keepalive: true });
        }
      }
    };
  }, [sessionId, game?.id]);

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
                    <Image
                      src={game.thumbnail}
                      alt={game.title}
                      width={180}
                      height={180}
                      className="object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <h1 className="mb-3 text-3xl font-bold md:text-4xl lg:text-5xl">{game.title}</h1>
                    <div className="flex flex-wrap justify-center gap-3">
                      {game.categoryNames.map((cat) => (
                        <span key={cat} className="rounded-full bg-white/10 px-4 py-1 text-sm font-medium backdrop-blur-sm">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePlayGame}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-primary-600 px-10 py-5 text-xl font-bold text-white transition-all hover:bg-primary-500 hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] active:scale-95"
                >
                  <Play className="h-6 w-6 fill-current" />
                  <span>PLAY NOW</span>
                </button>

                {showStats && (
                  <div className="flex items-center gap-8 text-sm font-medium opacity-90">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary-400" />
                      <span>{game.views.toLocaleString()} Views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-5 w-5 text-green-400" />
                      <span>{game.likePercentage}% Likes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-400" />
                      <span>{game.onlineCount} Online</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isPlaying && (
          <div className="space-y-6">
            <GameContainer
              title={game.title}
              likes={game.likes}
              dislikes={game.dislikes}
              userVote={userVote}
              onVote={handleVote}
              onFavorite={handleFavorite}
              isFavorited={isFavorited}
              isFavoriting={isFavoriting}
            >
              <iframe
                src={game.gameUrl}
                className="h-full w-full border-0"
                allowFullScreen
                allow="autoplay; gamepad; fullscreen"
              />
            </GameContainer>
            
            <div className="flex justify-center">
              <button
                onClick={handleExitFullscreen}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                Exit Game
              </button>
            </div>
          </div>
        )}

        {isPaused && !isPlaying && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
            <h2 className="mb-4 text-2xl font-bold">Game Paused</h2>
            <button
              onClick={handleContinuePlaying}
              className="rounded-xl bg-primary-600 px-8 py-3 font-bold text-white hover:bg-primary-500"
            >
              Continue Playing
            </button>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <section className="rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">About {game.title}</h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p className="whitespace-pre-wrap leading-relaxed">{game.description}</p>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-6 border-t border-slate-100 pt-8 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Developer</p>
                  <p className="font-semibold text-slate-900">{game.developer}</p>
                </div>
                {game.releaseDate && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Released</p>
                    <p className="font-semibold text-slate-900">
                      {new Date(game.releaseDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Technology</p>
                  <p className="font-semibold text-slate-900">{game.gameType}</p>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Similar Games</h2>
                <Link href="/games" className="text-sm font-bold text-primary-600 hover:text-primary-700">
                  View All
                </Link>
              </div>
              {loadingSimilar ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-200" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {similarGames.map((g) => (
                    <GameCard key={g.id} game={g} viewMode="grid" compact hideDescription />
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-8">
            <AdDisplay position="SIDEBAR" />
            
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {game.tags?.map((tag) => (
                  <Link
                    key={tag}
                    href={`/games?tag=${tag}`}
                    className="rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
