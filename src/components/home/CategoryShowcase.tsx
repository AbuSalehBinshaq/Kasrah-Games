'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sword, Puzzle, Target, Trophy, Joystick } from 'lucide-react';

const categoryIcons: Record<string, any> = {
  action: Sword,
  puzzle: Puzzle,
  strategy: Target,
  sports: Trophy,
  arcade: Joystick,
};

const categoryColors: Record<string, string> = {
  action: 'from-red-500 to-pink-500',
  puzzle: 'from-blue-500 to-cyan-500',
  strategy: 'from-green-500 to-emerald-500',
  sports: 'from-yellow-500 to-orange-500',
  arcade: 'from-purple-500 to-pink-500',
};

interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  gameCount?: number;
}

export default function CategoryShowcase() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories?limit=6');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="py-12">
        <h2 className="mb-8 text-3xl font-bold text-gray-900">Browse Categories</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-200"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Browse Categories</h2>
        <p className="text-gray-600">Find games by category</p>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
        {(!categories || categories.length === 0) ? (
          <div className="col-span-full rounded-xl bg-gray-50 p-12 text-center">
            <p className="text-gray-600">No categories available</p>
          </div>
        ) : (
          categories.map((category) => {
          const IconComponent = categoryIcons[category.slug] || Puzzle;
          const colorClass = categoryColors[category.slug] || 'from-gray-500 to-gray-600';
          
          return (
            <Link
              key={category.id}
              href={`/games?category=${category.slug}`}
              className="group relative overflow-hidden rounded-xl bg-white p-6 shadow transition-all hover:shadow-xl"
            >
              <div className="relative z-10">
                <div className={`mb-4 inline-flex rounded-lg bg-gradient-to-r ${colorClass} p-3`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-primary-600">
                  {category.name}
                </h3>
                {category.gameCount !== undefined && (
                  <p className="text-sm text-gray-600">{category.gameCount} games</p>
                )}
              </div>
              <div
                className={`absolute inset-0 bg-gradient-to-r ${colorClass} opacity-0 transition-opacity group-hover:opacity-10`}
              />
            </Link>
          );
        })
        )}
      </div>
    </section>
  );
}
