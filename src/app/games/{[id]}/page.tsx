'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Play, 
  Star, 
  Eye, 
  Clock, 
  Calendar, 
  Gamepad2, 
  Share2, 
  Bookmark,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import RatingStars from '@/components/common/RatingStars';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';

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
  requirements?: any;
  ageRating?: string;
  views: number;
  playCount: number;
  avgRating: number;
  categoryNames: string[];
  ratings?: Array<{
    id: string;
    rating: number;
    review?: string;
    createdAt: string;
    user: {
      username: string;
      avatar?: string;
    };
  }>;
}

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchGameDetails();
    }
  }, [params.id]);

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
      setGame(data);

      // Check if user has already rated this game
      if (user && data.ratings) {
        const userRating = data.ratings.find((r: any) => r.user.id === user.id);
        if (userRating) {
          setUserRating(userRating.rating);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load game');
    } finally {
      setLoading(false);
    }
  }

  async function handlePlayGame() {
    if (!game) return;

    // Allow playing without authentication
    setIsPlaying(true);

    // Track play session (optional - doesn't block playing)
    try {
      await fetch(`/api/games/${game.id}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      // Silently fail - don't prevent playing
      console.error('Failed to track play session:', error);
    }
  }

  async function handleRateGame(rating: number) {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!game) return;

    setIsSubmittingReview(true);

    try {
      const response = await fetch(`/api/games/${game.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rating, 
          review: reviewText || undefined 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      const data = await response.json();
      setUserRating(rating);

      // Update game rating
      setGame(prev => prev ? {
        ...prev,
        avgRating: data.newRating,
      } : null);

      // Clear review text
      setReviewText('');

      // Refresh game details
      fetchGameDetails();
    } catch (error) {
      console.error('Failed to rate game:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  }

  async function handleBookmark() {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game?.id }),
      });

      if (response.ok) {
        alert('Game bookmarked!');
      }
    } catch (error) {
      console.error('Failed to bookmark:', error);
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
            The game with slug <span className="font-mono font-semibold text-gray-900">"{params.id}"</span> {error && error.includes('not published') ? 'is not published yet' : 'does not exist'}.
          </p>
          <p className="mb-8 text-sm text-gray-500">
            {error || 'The game might have been removed or the URL is incorrect.'}
          </p>
          
          {error && error.includes('not published') && (
            <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-sm text-yellow-800">
                <strong>Tip:</strong> Go to <Link href="/admin/games" className="underline font-semibold">Admin Panel → Games</Link> and make sure the game is marked as "Published".
              </p>
            </div>
          )}

          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link
              href="/games"
              className="inline-flex items-center space-x-2 rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Browse All Games</span>
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              <span>Go to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Game Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden">
        {game.coverImage && (
          <Image
            src={game.coverImage}
            alt={game.title}
            fill
            className="object-cover opacity-30"
            priority
            unoptimized
          />
        )}
        <div className="relative p-8">
          <div className="mb-4">
            <Link
              href="/games"
              className="inline-flex items-center space-x-2 text-gray-300 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Games</span>
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src={game.thumbnail}
                  alt={game.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="mb-4 flex flex-wrap items-center gap-4">
                {game.categoryNames.map((category) => (
                  <span
                    key={category}
                    className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur"
                  >
                    {category}
                  </span>
                ))}
                {game.ageRating && (
                  <span className="rounded-full bg-yellow-500 px-3 py-1 text-sm font-medium">
                    {game.ageRating}
                  </span>
                )}
              </div>

              <h1 className="mb-4 text-4xl font-bold">{game.title}</h1>
              <p className="mb-6 text-xl text-gray-300">{game.shortDescription}</p>

              <div className="mb-8 flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-2">
                  <div className="rounded-lg bg-white/20 p-2">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{game.avgRating.toFixed(1)}</div>
                    <div className="text-sm text-gray-300">Rating</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="rounded-lg bg-white/20 p-2">
                    <Play className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{game.playCount.toLocaleString()}</div>
                    <div className="text-sm text-gray-300">Plays</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="rounded-lg bg-white/20 p-2">
                    <Eye className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{game.views.toLocaleString()}</div>
                    <div className="text-sm text-gray-300">Views</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handlePlayGame}
                  className="flex items-center space-x-2 rounded-lg bg-white px-6 py-3 font-semibold text-gray-900 hover:bg-gray-100"
                >
                  <Play className="h-5 w-5" />
                  <span>Play Now</span>
                </button>

                <button
                  onClick={handleBookmark}
                  className="flex items-center space-x-2 rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-white/10"
                >
                  <Bookmark className="h-5 w-5" />
                  <span>Bookmark</span>
                </button>

                <button
                  onClick={() => alert('Share feature coming soon!')}
                  className="flex items-center space-x-2 rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-white/10"
                >
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">About This Game</h2>
            <div className="prose max-w-none text-gray-700">
              <p>{game.description}</p>
            </div>
          </div>

          {/* Game Player */}
          {isPlaying && (
            <div className="rounded-xl bg-white p-6 shadow">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Playing: {game.title}</h2>
              <div className="aspect-video rounded-lg bg-gray-900">
                <iframe
                  src={game.gameUrl}
                  className="h-full w-full rounded-lg"
                  title={game.title}
                  allowFullScreen
                />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Game controls: Use keyboard and mouse to play. Press F11 for fullscreen.</p>
              </div>
            </div>
          )}

          {/* Rate & Review */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Rate This Game</h2>

            {user ? (
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block font-medium text-gray-700">Your Rating</label>
                  <RatingStars
                    rating={userRating}
                    interactive
                    onRate={handleRateGame}
                    size="lg"
                  />
                </div>

                <div>
                  <label htmlFor="review" className="mb-2 block font-medium text-gray-700">
                    Your Review (Optional)
                  </label>
                  <textarea
                    id="review"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    placeholder="Share your thoughts about this game..."
                    disabled={isSubmittingReview}
                  />
                </div>

                <button
                  onClick={() => handleRateGame(userRating || 5)}
                  disabled={isSubmittingReview || userRating === 0}
                  className="rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting...' : userRating ? 'Update Rating' : 'Submit Rating'}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="mb-4 text-gray-600">Please login to rate and review this game.</p>
                <Link
                  href="/auth/login"
                  className="inline-block rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700"
                >
                  Login to Rate
                </Link>
              </div>
            )}
          </div>

          {/* Reviews */}
          {game.ratings && game.ratings.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Player Reviews</h2>
              <div className="space-y-6">
                {game.ratings.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="font-semibold text-gray-700">
                            {review.user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{review.user.username}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <RatingStars rating={review.rating} size="sm" />
                    </div>
                    {review.review && (
                      <p className="text-gray-700">{review.review}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Game Info */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Game Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Gamepad2 className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Developer</p>
                  <p className="font-medium text-gray-900">{game.developer}</p>
                </div>
              </div>

              {game.publisher && (
                <div className="flex items-center space-x-3">
                  <Gamepad2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Publisher</p>
                    <p className="font-medium text-gray-900">{game.publisher}</p>
                  </div>
                </div>
              )}

              {game.releaseDate && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Release Date</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(game.releaseDate)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Gamepad2 className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Game Type</p>
                  <p className="font-medium text-gray-900">{game.gameType}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technologies */}
          {game.technologies && game.technologies.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {game.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {game.requirements && (
            <div className="rounded-xl bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Requirements</h3>
              <div className="space-y-3 text-sm text-gray-700">
                {game.requirements.browser && (
                  <p><strong>Browser:</strong> {game.requirements.browser}</p>
                )}
                {game.requirements.controls && (
                  <p><strong>Controls:</strong> {game.requirements.controls}</p>
                )}
                {game.requirements.min && (
                  <p><strong>Minimum:</strong> {game.requirements.min}</p>
                )}
                {game.requirements.recommended && (
                  <p><strong>Recommended:</strong> {game.requirements.recommended}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
