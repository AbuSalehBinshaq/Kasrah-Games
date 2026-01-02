import { Gamepad2, Users, Shield, Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
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
              <Gamepad2 className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">Curated Collection</h3>
            <p className="text-sm text-gray-600">
              Hand-picked games across various genres and categories.
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
            <h3 className="mb-3 font-semibold text-gray-900">Cross-Platform</h3>
            <p className="text-sm text-gray-600">
              Play on desktop, laptop, tablet, or smartphone - all from the same link.
            </p>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="rounded-2xl border border-gray-200 p-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Our Team</h2>
        <p className="mb-8 text-gray-700">
          Kasrah Games is built by a passionate team of gamers, developers, and designers
          who are dedicated to creating the best browser gaming experience.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400"></div>
            <h4 className="font-semibold text-gray-900">Alex Chen</h4>
            <p className="text-sm text-gray-600">Lead Developer</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-r from-green-400 to-blue-400"></div>
            <h4 className="font-semibold text-gray-900">Maria Rodriguez</h4>
            <p className="text-sm text-gray-600">Game Curator</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
            <h4 className="font-semibold text-gray-900">David Kim</h4>
            <p className="text-sm text-gray-600">UI/UX Designer</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-r from-yellow-400 to-red-400"></div>
            <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
            <p className="text-sm text-gray-600">Community Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}