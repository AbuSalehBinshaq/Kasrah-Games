'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, ThumbsUp, ThumbsDown, User } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

interface Review {
  id: string;
  isLike: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    username: string;
    avatar?: string;
  };
  game: {
    id: string;
    slug: string;
    title: string;
    thumbnail: string;
  };
}

export default function RecentReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentReviews();
  }, []);

  async function fetchRecentReviews() {
    try {
      const response = await fetch('/api/games/reviews?limit=4');
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      setReviews([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="py-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-200"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 p-3">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Recent Reviews</h2>
            <p className="text-gray-600">What players are saying</p>
          </div>
        </div>
        <Link
          href="/games?sort=rating"
          className="rounded-lg border-2 border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:border-gray-400"
        >
          View All
        </Link>
      </div>

      {!reviews || reviews.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-12 text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No reviews yet</h3>
          <p className="text-gray-600">Be the first to review a game!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl bg-white p-6 shadow">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {review.user.avatar ? (
                    <img
                      src={review.user.avatar}
                      alt={review.user.username}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.user.username}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {review.isLike ? (
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    {review.isLike ? 'Liked' : 'Disliked'}
                  </span>
                </div>
              </div>
              
              <Link
                href={`/games/${review.game.slug}`}
                className="mb-3 inline-block font-medium text-gray-900 hover:text-primary-600"
              >
                {review.game.title}
              </Link>
              
              <p className="text-sm text-gray-600">
                {timeAgo(new Date(review.createdAt))}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
