import FeaturedGames from '@/components/home/FeaturedGames';
import ContinueGames from '@/components/home/ContinueGames';
import FavoritesGames from '@/components/home/FavoritesGames';
import PopularGames from '@/components/home/PopularGames';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import AdDisplay from '@/components/common/AdDisplay';

export default function HomePage() {
  return (
    <main className="space-y-12 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Kasrah Games',
            url: 'https://kasrahgames.example',
            logo: 'https://kasrahgames.example/images/logo.svg',
            sameAs: [],
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'info@kasrahgames.example',
              contactType: 'customer service',
            },
          }),
        }}
      />

      <div className="space-y-10 px-4 md:px-8">
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