'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Users, ThumbsUp } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

interface GameCardProps {
  game: {
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
  viewMode: 'grid' | 'list';
  compact?: boolean;
  hideDescription?: boolean;
  priority?: boolean;
  aspectRatio?: 'video' | 'square';
  showOnlineCount?: boolean;
}

export default function GameCard({ 
  game, 
  viewMode, 
  compact = false, 
  hideDescription = false, 
  priority = false,
  aspectRatio = 'video',
  showOnlineCount = false
}: GameCardProps) {
  const [imageError, setImageError] = useState(false);
  const { settings, loading: settingsLoading } = useSettings();
  
  const showStats = settingsLoading ? true : (settings?.showStatistics !== false);

  if (viewMode === 'list') {
    return (
      <Link href={`/games/${game.slug}`}>
        <div className="flex items-center space-x-4 rounded-xl bg-white p-4 shadow transition-all hover:shadow-lg">
          <div className="relative h-32 w-48 flex-shrink-0 overflow-hidden rounded-lg">
            {imageError ? (
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <Play className="h-12 w-12 text-gray-400" />
              </div>
            ) : (
              <Image
                src={game.thumbnail || '/images/placeholder-game.svg'}
                alt={game.title}
                fill
                className="object-cover"
                quality={75}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={priority}
                onError={() => setImageError(true)}
              />
            )}
          </div>

          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">{game.title}</h3>
            <p className="mb-3 line-clamp-2 text-sm text-gray-600">{game.description}</p>

            {showStats && (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{game.likePercentage}% Rating</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{game.onlineCount || 0}</span>
                </div>
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {game.categoryNames.slice(0, 3).map((category) => (
                <span
                  key={category}
                  className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="rounded-lg bg-primary-600 px-6 py-2 font-semibold text-white hover:bg-primary-700">
              Play Now
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid View - Minimal design (image only + text)
  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-video';

  return (
    <Link href={`/games/${game.slug}`}>
      <div className="group flex flex-col">
        {/* Image Container - No background, no shadow, no border */}
        <div className={`relative w-full ${aspectClass} overflow-hidden rounded-2xl`}>
          {imageError ? (
            <div className="flex h-full w-full items-center justify-center bg-gray-200 rounded-2xl">
              <Play className="h-12 w-12 text-gray-400" />
            </div>
          ) : (
            <Image
              src={game.thumbnail || '/images/placeholder-game.svg'}
              alt={game.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-2xl"
              quality={85}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              onError={() => setImageError(true)}
            />
          )}
        </div>

        {/* Text Content - Below image */}
        <div className="mt-2">
          <h3 className="font-bold text-gray-900 line-clamp-2 text-sm">
            {game.title}
          </h3>
          
          {showStats && (
            <div className="flex items-center gap-1 mt-1">
              <ThumbsUp className="h-4 w-4 text-gray-600" />
              <span className="text-xs font-semibold text-gray-700">{game.likePercentage}% Rating</span>
              
              {showOnlineCount && (
                <>
                  <span className="text-xs text-gray-600 ml-auto">{game.onlineCount || 0}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
