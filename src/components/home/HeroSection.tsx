'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, TrendingUp, Users, Star } from 'lucide-react';

const stats = [
  { label: 'Active Players', value: '10K+', icon: Users },
  { label: 'Games Available', value: '500+', icon: Play },
  { label: 'Average Rating', value: '4.8', icon: Star },
  { label: 'Play Sessions', value: '1M+', icon: TrendingUp },
];

export default function HeroSection() {
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const featuredGames = [
    {
      title: 'Space Adventure',
      description: 'Explore the universe in this epic space shooter',
      image: '/images/placeholder-game.svg',
      genre: 'Action',
    },
    {
      title: 'Puzzle Masters',
      description: 'Challenge your mind with hundreds of puzzles',
      image: '/images/placeholder-game.svg',
      genre: 'Puzzle',
    },
    {
      title: 'Racing Extreme',
      description: 'High-speed racing with realistic physics',
      image: '/images/placeholder-game.svg',
      genre: 'Sports',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGameIndex((prev) => (prev + 1) % featuredGames.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-900 via-primary-800 to-secondary-800 text-white">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative px-8 py-12 md:px-12 md:py-24">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Play Amazing
              <span className="block text-secondary-300">HTML5 & WebGL Games</span>
            </h1>
            <p className="text-xl text-gray-200">
              Discover the best collection of free online games. No downloads required.
              Play directly in your browser on any device.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/games"
                className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-lg font-semibold text-primary-900 hover:bg-gray-100"
              >
                <Play className="mr-2 h-5 w-5" />
                Browse Games
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center rounded-lg border-2 border-white px-6 py-3 text-lg font-semibold text-white hover:bg-white/10"
              >
                Join Free
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative h-64 overflow-hidden rounded-2xl md:h-96">
              {featuredGames.map((game, index) => (
                <div
                  key={game.title}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentGameIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${game.image})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className="mb-2 inline-block rounded-full bg-secondary-600 px-3 py-1 text-sm font-semibold">
                        {game.genre}
                      </span>
                      <h3 className="text-2xl font-bold">{game.title}</h3>
                      <p className="text-gray-200">{game.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center space-x-2">
              {featuredGames.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentGameIndex(index)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentGameIndex ? 'w-8 bg-white' : 'bg-white/50'
                  }`}
                  aria-label={`View game ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-white/10 p-4 backdrop-blur"
            >
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-white/20 p-2">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-gray-200">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
