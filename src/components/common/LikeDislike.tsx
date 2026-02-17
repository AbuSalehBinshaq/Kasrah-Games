'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface LikeDislikeProps {
  likes: number;
  dislikes: number;
  userVote?: 'like' | 'dislike' | null;
  onVote?: (vote: 'like' | 'dislike') => void;
  showCounts?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function LikeDislike({
  likes,
  dislikes,
  userVote,
  onVote,
  showCounts = true,
  size = 'md',
}: LikeDislikeProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const total = likes + dislikes;
  const likePercentage = total > 0 ? Math.round((likes / total) * 100) : 0;

  async function handleVote(vote: 'like' | 'dislike') {
    if (!onVote || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onVote(vote);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleVote('like')}
        disabled={isSubmitting || !onVote}
        className={`flex items-center space-x-1 rounded-lg border transition-colors ${
          userVote === 'like'
            ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        } ${buttonSizeClasses[size]} ${!onVote ? 'cursor-default' : ''} ${isSubmitting ? 'opacity-50' : ''}`}
      >
        <ThumbsUp className={sizeClasses[size]} />
        {showCounts && <span>{likes}</span>}
      </button>

      <button
        onClick={() => handleVote('dislike')}
        disabled={isSubmitting || !onVote}
        className={`flex items-center space-x-1 rounded-lg border transition-colors ${
          userVote === 'dislike'
            ? 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        } ${buttonSizeClasses[size]} ${!onVote ? 'cursor-default' : ''} ${isSubmitting ? 'opacity-50' : ''}`}
      >
        <ThumbsDown className={sizeClasses[size]} />
        {showCounts && <span>{dislikes}</span>}
      </button>

      {!showCounts && total > 0 && (
        <span className="text-sm text-gray-600">
          {likePercentage}%
        </span>
      )}
    </div>
  );
}

