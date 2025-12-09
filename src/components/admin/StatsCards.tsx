'use client';

import { Gamepad2, Users, Play, Star, TrendingUp, Clock } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalGames: number;
    totalUsers: number;
    totalPlays: number;
    avgRating: number;
    activeUsers: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Games',
      value: (stats?.totalGames || 0).toLocaleString(),
      icon: Gamepad2,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Total Users',
      value: (stats?.totalUsers || 0).toLocaleString(),
      icon: Users,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Total Plays',
      value: (stats?.totalPlays || 0).toLocaleString(),
      icon: Play,
      color: 'bg-purple-500',
      change: '+24%',
    },
    {
      title: 'Avg Rating',
      value: (stats?.avgRating || 0).toFixed(1),
      icon: Star,
      color: 'bg-yellow-500',
      change: '+0.3',
    },
    {
      title: 'Active Users',
      value: (stats?.activeUsers || 0).toLocaleString(),
      icon: TrendingUp,
      color: 'bg-red-500',
      change: '+15%',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div key={card.title} className="rounded-xl bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
              <div className="mt-2 flex items-center">
                <span className="text-sm font-medium text-green-600">{card.change}</span>
                <span className="ml-2 text-sm text-gray-600">from last month</span>
              </div>
            </div>
            <div className={`${card.color} rounded-lg p-3`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
