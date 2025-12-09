'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Filter } from 'lucide-react';

interface Category {
  id: string;
  slug: string;
  name: string;
  icon?: string;
}

export default function CategoryFilter({ selectedCategory = '' }: { selectedCategory?: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]); // Set empty array on error
    }
  }

  function handleCategoryChange(categorySlug: string) {
    const params = new URLSearchParams(window.location.search);
    if (categorySlug) {
      params.set('category', categorySlug);
    } else {
      params.delete('category');
    }
    router.push(`/games?${params.toString()}`);
  }

  return (
    <div className="relative">
      <select
        value={selectedCategory}
        onChange={(e) => handleCategoryChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
      >
        <option value="">All Categories</option>
        {categories && categories.length > 0 && categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
      <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
    </div>
  );
}
