import FeaturedGames from '@/components/home/FeaturedGames';
import ContinueGames from '@/components/home/ContinueGames';
import FavoritesGames from '@/components/home/FavoritesGames';
import PopularGames from '@/components/home/PopularGames';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import AdDisplay from '@/components/common/AdDisplay';

export const dynamic = 'force-dynamic';

import SEO from '@/components/common/SEO';

import { getSettings } from '@/lib/settings';

export default async function HomePage() {
  const settings = await getSettings();
  const siteUrl = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://kasrah-games.onrender.com';

  return (
    <main className="space-y-6 pb-24">
      <SEO 
        title={settings.seoMetaTitle || "Kasrah Games - Play Free Online Games"}
        description={settings.seoMetaDescription || settings.siteDescription || "العب أفضل الألعاب أونلاين مجاناً على كسرة جيمز."}
        canonicalUrl={siteUrl}
      />
      
      {/* Visually hidden H1 for SEO - following Poki/CrazyGames best practices */}
      <h1 className="sr-only">Kasrah Games - Play Free Online Games</h1>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Kasrah Games',
            url: 'https://kasrah-games.onrender.com',
            logo: 'https://kasrah-games.onrender.com/images/logo.svg',
            sameAs: [],
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'info@kasrah-games.onrender.com',
              contactType: 'customer service',
            },
          }),
        }}
      />

      <div className="space-y-4 px-4 md:px-8">
        {/* In-Content Ad */}
        <div className="flex justify-center">
          <AdDisplay position="IN_CONTENT" />
        </div>
        
        <FeaturedGames />
        <ContinueGames />
        <PopularGames />
        
        {/* In-Content Ad */}
        <div className="flex justify-center">
          <AdDisplay position="IN_CONTENT" />
        </div>
        
        <CategoryShowcase />
        <FavoritesGames />
      </div>
    </main>
  );
}
