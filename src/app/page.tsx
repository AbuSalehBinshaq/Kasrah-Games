import FeaturedGames from '@/components/home/FeaturedGames';
import ContinueGames from '@/components/home/ContinueGames';
import FavoritesGames from '@/components/home/FavoritesGames';
import PopularGames from '@/components/home/PopularGames';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import AdDisplay from '@/components/common/AdDisplay';

export const dynamic = 'force-dynamic';

import SEO from '@/components/common/SEO';

export default function HomePage() {
  return (
    <main className="space-y-6 pb-24">
      <SEO 
        title="Kasrah Games - Play Free Online Games"
        description="Play the best HTML5 and WebGL games online for free. Discover a wide variety of action, puzzle, strategy, and arcade games at Kasrah Games."
        canonicalUrl="https://kasrah-games.onrender.com"
      />
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
        <div className="py-8 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            Kasrah Games: Play Free Online Games
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Welcome to Kasrah Games, your ultimate destination for high-quality HTML5 and WebGL browser games. 
            Enjoy instant access to hundreds of free games across all genres without any downloads.
          </p>
        </div>
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