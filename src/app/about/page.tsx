import { Gamepad2, Users, Shield, Zap, Globe } from 'lucide-react';
import SEO from '@/components/common/SEO';

export const dynamic = 'force-dynamic';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SEO 
        title="About Us | Kasrah Games"
        description="تعرف على كسرة جيمز، المنصة الرائدة لألعاب المتصفح. مهمتنا توفير وصول فوري لألعاب عالية الجودة بدون تحميل. Learn more about Kasrah Games, the premier platform for browser gaming. Our mission is to provide instant access to high-quality games."
        canonicalUrl="https://kasrah-games.onrender.com/about"
      />
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">About Kasrah Games</h1>
        <p className="text-xl text-gray-600">
          The premier platform for HTML5 and WebGL gaming experiences
        </p>
      </div>

      {/* Mission */}
      <div className="mb-12 rounded-2xl bg-gradient-to-r from-primary-50 to-secondary-50 p-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Our Mission</h2>
            <p className="mb-4 text-gray-700">
              To provide gamers worldwide with instant access to high-quality browser-based games
              without the need for downloads or installations.
            </p>
            <p className="text-gray-700">
              We believe gaming should be accessible, convenient, and enjoyable for everyone,
              regardless of their device or technical expertise.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <Gamepad2 className="h-32 w-32 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mb-12">
        <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">Why Choose Kasrah Games?</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-6 text-center shadow">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <Zap className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">Instant Play</h3>
            <p className="text-sm text-gray-600">
              No downloads required. Play directly in your browser.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 text-center shadow">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-100">
              <Users className="h-8 w-8 text-secondary-600" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">Community Driven</h3>
            <p className="text-sm text-gray-600">
              Rate, review, and share games with fellow gamers.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 text-center shadow">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">Safe & Secure</h3>
            <p className="text-sm text-gray-600">
              All games are verified and safe to play.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 text-center shadow">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
              <Globe className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">Cross-Platform</h3>
            <p className="text-sm text-gray-600">
              Play on desktop, tablet, or smartphone seamlessly.
            </p>
          </div>
        </div>
      </div>

      {/* Technology */}
      <div className="mb-12 rounded-2xl bg-gray-50 p-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Technology Stack</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6">
            <h3 className="mb-3 font-semibold text-gray-900">HTML5 Games</h3>
            <p className="text-sm text-gray-600">
              Lightweight games that run smoothly on any modern browser without plugins.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6">
            <h3 className="mb-3 font-semibold text-gray-900">WebGL Games</h3>
            <p className="text-sm text-gray-600">
              High-performance 3D games with stunning graphics powered by WebGL technology.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6">
            <h3 className="mb-3 font-semibold text-gray-900">Global Access</h3>
            <p className="text-sm text-gray-600">
              Our servers are optimized to provide low-latency gaming experiences worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* About the Platform */}
      <div className="rounded-2xl border border-gray-200 p-8 text-center">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Our Commitment</h2>
        <p className="text-gray-700 leading-relaxed">
          Kasrah Games is dedicated to building the best browser gaming destination. We constantly update our library with the latest and most popular titles, ensuring there's always something new to discover. Our team works tirelessly to maintain a safe, fast, and enjoyable environment for gamers of all ages.
        </p>
      </div>
    </div>
  );
}