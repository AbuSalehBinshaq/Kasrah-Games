import HeroSection from '@/components/home/HeroSection';
import FeaturedGames from '@/components/home/FeaturedGames';
import PopularGames from '@/components/home/PopularGames';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import RecentReviews from '@/components/home/RecentReviews';

export default function HomePage() {
  return (
    <>
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

      <HeroSection />
      <FeaturedGames />
      <CategoryShowcase />
      <PopularGames />
      <RecentReviews />
    </>
  );
}