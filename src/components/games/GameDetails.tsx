'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Gamepad2, Users, Clock, Cpu, Download, Globe, Shield } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface GameDetailsProps {
  game: {
    title: string;
    developer: string;
    publisher?: string;
    releaseDate?: string;
    gameType: string;
    technologies: string[];
    tags?: string[];
    requirements?: {
      min?: string;
      recommended?: string;
      browser?: string;
      controls?: string;
    };
    ageRating?: string;
    description: string;
  };
}

export default function GameDetails({ game }: GameDetailsProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'requirements' | 'controls'>('details');

  const formatRequirements = (req: string | undefined) => {
    if (!req) return 'Not specified';
    return req.split('\n').map((line, i) => (
      <p key={i} className="mb-1">{line}</p>
    ));
  };

  return (
    <div className="rounded-xl bg-white shadow-lg">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-6 py-4 text-sm font-medium ${
              activeTab === 'details'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Game Details
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`flex-1 px-6 py-4 text-sm font-medium ${
              activeTab === 'requirements'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Requirements
          </button>
          <button
            onClick={() => setActiveTab('controls')}
            className={`flex-1 px-6 py-4 text-sm font-medium ${
              activeTab === 'controls'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Controls & Tips
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Gamepad2 className="h-5 w-5 mt-0.5 text-primary-500" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Developer</h4>
                    <p className="text-gray-600">{game.developer}</p>
                  </div>
                </div>

                {game.publisher && (
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 mt-0.5 text-primary-500" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Publisher</h4>
                      <p className="text-gray-600">{game.publisher}</p>
                    </div>
                  </div>
                )}

                {game.releaseDate && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 mt-0.5 text-primary-500" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Release Date</h4>
                      <p className="text-gray-600">
                        {formatDate(game.releaseDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Globe className="h-5 w-5 mt-0.5 text-primary-500" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Game Type</h4>
                    <p className="text-gray-600">{game.gameType}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Cpu className="h-5 w-5 mt-0.5 text-primary-500" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Technologies</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {game.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {game.tags && game.tags.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <Cpu className="h-5 w-5 mt-0.5 text-primary-500" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Tags</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {game.tags.map((tag) => (
                          <Link
                            key={tag}
                            href={`/games?tag=${encodeURIComponent(tag)}`}
                            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                          >
                            #{tag}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {game.ageRating && (
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 mt-0.5 text-primary-500" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Age Rating</h4>
                      <p className="text-gray-600">{game.ageRating}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="mb-3 text-lg font-semibold text-gray-900">About This Game</h4>
              <div className="prose max-w-none text-gray-700">
                <p>{game.description}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="space-y-6">
            <div className="rounded-lg bg-gradient-to-r from-primary-50 to-secondary-50 p-6">
              <h4 className="mb-4 text-lg font-semibold text-gray-900">System Requirements</h4>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {game.requirements?.min && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="rounded-lg bg-white p-2 shadow">
                        <Cpu className="h-5 w-5 text-primary-600" />
                      </div>
                      <h5 className="font-semibold text-gray-900">Minimum Requirements</h5>
                    </div>
                    <div className="text-sm text-gray-600 bg-white rounded-lg p-4">
                      {formatRequirements(game.requirements.min)}
                    </div>
                  </div>
                )}

                {game.requirements?.recommended && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="rounded-lg bg-white p-2 shadow">
                        <Cpu className="h-5 w-5 text-secondary-600" />
                      </div>
                      <h5 className="font-semibold text-gray-900">Recommended Requirements</h5>
                    </div>
                    <div className="text-sm text-gray-600 bg-white rounded-lg p-4">
                      {formatRequirements(game.requirements.recommended)}
                    </div>
                  </div>
                )}
              </div>

              {game.requirements?.browser && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-green-600" />
                    <h5 className="font-semibold text-gray-900">Browser Requirements</h5>
                  </div>
                  <div className="text-sm text-gray-600 bg-white rounded-lg p-4">
                    {game.requirements.browser}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg bg-yellow-50 p-6">
              <h4 className="mb-3 flex items-center space-x-2 text-lg font-semibold text-gray-900">
                <Shield className="h-5 w-5 text-yellow-600" />
                <span>Important Notes</span>
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-yellow-500" />
                  <span>Game runs directly in your browser - no downloads required</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-yellow-500" />
                  <span>Make sure your browser is up to date for optimal performance</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-yellow-500" />
                  <span>Disable ad-blockers if the game doesn't load properly</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-yellow-500" />
                  <span>Allow browser permissions if prompted (like fullscreen access)</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'controls' && (
          <div className="space-y-6">
            {game.requirements?.controls ? (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Game Controls</h4>
                <div className="rounded-lg bg-gray-50 p-6">
                  <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                    {game.requirements.controls}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-gray-50 p-8 text-center">
                <Gamepad2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h4 className="mb-2 text-lg font-semibold text-gray-900">Standard Controls</h4>
                <p className="text-gray-600 mb-6">This game uses standard browser controls</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-primary-50 p-6">
                <h4 className="mb-4 flex items-center space-x-2 text-lg font-semibold text-gray-900">
                  <Clock className="h-5 w-5 text-primary-600" />
                  <span>Tips & Tricks</span>
                </h4>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-primary-500" />
                    <span>Use <strong>F11</strong> for fullscreen mode</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-primary-500" />
                    <span>Press <strong>ESC</strong> to exit fullscreen</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-primary-500" />
                    <span>Refresh the page if game freezes</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-primary-500" />
                    <span>Clear browser cache for better performance</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg bg-green-50 p-6">
                <h4 className="mb-4 flex items-center space-x-2 text-lg font-semibold text-gray-900">
                  <Download className="h-5 w-5 text-green-600" />
                  <span>Performance Tips</span>
                </h4>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-green-500" />
                    <span>Close other tabs to free up memory</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-green-500" />
                    <span>Use a wired connection for online games</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-green-500" />
                    <span>Update your graphics drivers</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-green-500" />
                    <span>Use Chrome or Firefox for best compatibility</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
