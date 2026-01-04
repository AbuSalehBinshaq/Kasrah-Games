import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kasrahgames.example';

  // Check if DATABASE_URL is available before attempting database queries
  // This prevents build failures when database is not connected during static generation
  const hasDatabase = !!process.env.DATABASE_URL;

  let games: Array<{ slug: string; updatedAt: Date }> = [];
  let categories: Array<{ slug: string; updatedAt: Date }> = [];

  if (hasDatabase) {
    try {
      // Fetch all published games
      games = await prisma.game.findMany({
        where: { isPublished: true },
        select: {
          slug: true,
          updatedAt: true,
        },
      });

      // Fetch all categories
      categories = await prisma.category.findMany({
        where: { isActive: true },
        select: {
          slug: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      // If database query fails, log error but continue with empty arrays
      // This allows sitemap generation to proceed with static pages only
      if (process.env.NODE_ENV === 'development') {
        console.warn('Sitemap: Failed to fetch games/categories from database:', error instanceof Error ? error.message : 'Unknown error');
      }
      // Continue with empty arrays - sitemap will only include static pages
    }
  }

    // Static pages
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: 'games', priority: '0.9', changefreq: 'daily' },
      { url: 'about', priority: '0.8', changefreq: 'monthly' },
      { url: 'contact', priority: '0.8', changefreq: 'monthly' },
      { url: 'auth/login', priority: '0.7', changefreq: 'monthly' },
      { url: 'auth/register', priority: '0.7', changefreq: 'monthly' },
    ];

    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
    <url>
      <loc>${baseUrl}/${page.url}</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>
  `).join('')}

  ${games.map(game => `
    <url>
      <loc>${baseUrl}/games/${game.slug}</loc>
      <lastmod>${new Date(game.updatedAt).toISOString().split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('')}

  ${categories.map(category => `
    <url>
      <loc>${baseUrl}/games?category=${category.slug}</loc>
      <lastmod>${new Date(category.updatedAt).toISOString().split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>
  `).join('')}
</urlset>`;

  try {
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    // Fallback minimal sitemap if XML generation fails
    console.error('Sitemap XML generation error:', error);

    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/games</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

    return new NextResponse(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}
