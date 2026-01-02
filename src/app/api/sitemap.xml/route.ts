import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kasrahgames.example';

    // Fetch all published games
    const games = await prisma.game.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    // Fetch all categories
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

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

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);

    // Fallback minimal sitemap
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kasrahgames.example';
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
