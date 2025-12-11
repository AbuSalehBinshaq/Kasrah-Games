'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Gamepad2, Mail, Shield, Heart, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import AdDisplay from './AdDisplay';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings } = useSettings();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      {/* Footer Ad */}
      <div className="w-full bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <AdDisplay position="FOOTER" className="flex justify-center" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              {settings.siteLogo ? (
                <Image
                  src={settings.siteLogo}
                  alt={settings.siteName}
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                  unoptimized
                />
              ) : (
                <Gamepad2 className="h-8 w-8 text-primary-600" />
              )}
              <span className="text-xl font-bold text-gray-900">{settings.siteName}</span>
            </Link>
            <p className="text-sm text-gray-600">
              {settings.siteDescription || 'The ultimate platform for HTML5 and WebGL games. Play for free, no downloads required.'}
            </p>
            {/* Social Media Links */}
            {(settings.socialFacebook || settings.socialTwitter || settings.socialInstagram || settings.socialYoutube) && (
              <div className="flex items-center space-x-3">
                {settings.socialFacebook && (
                  <a
                    href={settings.socialFacebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-primary-600"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {settings.socialTwitter && (
                  <a
                    href={settings.socialTwitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-primary-600"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {settings.socialInstagram && (
                  <a
                    href={settings.socialInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-primary-600"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {settings.socialYoutube && (
                  <a
                    href={settings.socialYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-primary-600"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/games" className="text-gray-600 hover:text-primary-600">
                  All Games
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-primary-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-primary-600">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-primary-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-primary-600">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/games?category=action" className="text-gray-600 hover:text-primary-600">
                  Action Games
                </Link>
              </li>
              <li>
                <Link href="/games?category=puzzle" className="text-gray-600 hover:text-primary-600">
                  Puzzle Games
                </Link>
              </li>
              <li>
                <Link href="/games?category=strategy" className="text-gray-600 hover:text-primary-600">
                  Strategy Games
                </Link>
              </li>
              <li>
                <Link href="/games?category=sports" className="text-gray-600 hover:text-primary-600">
                  Sports Games
                </Link>
              </li>
              <li>
                <Link href="/games?category=arcade" className="text-gray-600 hover:text-primary-600">
                  Arcade Games
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Contact Us</h3>
            <div className="space-y-3">
              {settings.contactEmail && (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600"
                >
                  <Mail className="h-5 w-5" />
                  <span>{settings.contactEmail}</span>
                </a>
              )}
              <div className="flex items-center space-x-2 text-gray-600">
                <Shield className="h-5 w-5" />
                <span>Safe & Secure Gaming</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="text-sm text-gray-600">
              © {currentYear} {settings.siteName}. All rights reserved.
            </p>
            <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600 md:mt-0">
              <Heart className="h-4 w-4" />
              <span>Made with love for gamers worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}