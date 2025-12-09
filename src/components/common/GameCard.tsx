'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Eye, Star, Users } from 'lucide-react';
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
}

export default function GameCard({ game, viewMode }: GameCardProps) {
  const [imageError, setImageError] = useState(false);
  const { settings, loading: settingsLoading } = useSettings();
  
  // Default to showing statistics if settings are still loading or if showStatistics is true/undefined
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
                quality={90}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">{game.likePercentage}%</span>
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

  // Grid View
  return (
    <Link href={`/games/${game.slug}`}>
      <div className="group rounded-xl bg-white shadow transition-all hover:shadow-xl">
        <div className="relative aspect-video overflow-hidden rounded-t-xl">
          {imageError ? (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <Play className="h-16 w-16 text-gray-400" />
            </div>
          ) : (
            <Image
              src={game.thumbnail || '/images/placeholder-game.svg'}
              alt={game.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              quality={90}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
            <div className="rounded-lg bg-white/95 px-4 py-2 backdrop-blur">
              <div className="flex items-center justify-center font-semibold text-gray-900">
                <Play className="mr-2 h-4 w-4" />
                Play Now
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2">
            <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 group-hover:text-primary-600">
              {game.title}
            </h3>
          </div>

          <p className="mb-3 line-clamp-2 text-sm text-gray-600">{game.description}</p>

          {showStats && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">{game.likePercentage}%</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Users className="h-4 w-4 text-gray-400" />
                <span>{game.onlineCount || 0}</span>
              </div>
            </div>
          )}

          <div className="mt-2 flex flex-wrap gap-1">
            {game.categoryNames.slice(0, 2).map((category) => (
              <span
                key={category}
                className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}