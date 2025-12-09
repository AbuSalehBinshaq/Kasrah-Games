'use client';

import { useRef, useState } from 'react';
import { Maximize2, Minimize2, Star } from 'lucide-react';
import { useFullscreen } from '@/hooks/useFullscreen';
import LikeDislike from '@/components/common/LikeDislike';

type GameContainerProps = {
  children?: React.ReactNode;
  title?: string;
  siteName?: string;
  siteLogoUrl?: string;
  likes?: number;
  dislikes?: number;
  userVote?: 'like' | 'dislike' | null;
  onVote?: (vote: 'like' | 'dislike') => Promise<void> | void;
  onFavorite?: () => Promise<void> | void;
  isFavorited?: boolean;
  isFavoriting?: boolean;
};

export default function GameContainer({
  children,
  title = 'Game',
  siteName = 'Kasrah Games',
  siteLogoUrl,
  likes = 0,
  dislikes = 0,
  userVote = null,
  onVote,
  onFavorite,
  isFavorited = false,
  isFavoriting = false,
}: GameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen(containerRef);
  const [showBar, setShowBar] = useState(true);
  const [isVoting, setIsVoting] = useState(false);

  const toggleFullscreen = () => {
    if (isFullscreen) exitFullscreen();
    else enterFullscreen();
  };

  const handleVote = async (vote: 'like' | 'dislike') => {
    if (!onVote || isVoting) return;
    try {
      setIsVoting(true);
      await onVote(vote);
    } finally {
      setIsVoting(false);
    }
  };

  const handleFavorite = async () => {
    if (!onFavorite || isFavoriting) return;
    try {
      await onFavorite();
    } finally {
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <button
          onClick={toggleFullscreen}
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm font-semibold text-slate-800 shadow-sm hover:bg-gray-50"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="h-4 w-4" />
              Exit Fullscreen
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4" />
              Fullscreen
            </>
          )}
        </button>
      </div>

      <div
        ref={containerRef}
        className="game-container relative overflow-hidden rounded-xl border border-gray-200 bg-black"
      >
        <div className="aspect-video w-full">
          {children ?? (
            <div className="flex h-full items-center justify-center text-white">
              Your game content here
            </div>
          )}
        </div>

        {/* Branding / control bar */}
        {showBar ? (
          <div
            className={`pointer-events-auto flex items-center justify-between gap-3 border-t border-white/10 bg-black/70 px-3 py-2 text-sm text-white ${
              isFullscreen ? 'absolute inset-x-0 bottom-0 z-10' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              {siteLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={siteLogoUrl}
                  alt={siteName}
                  className="h-7 w-7 rounded-full border border-white/20 object-cover bg-white"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[11px] font-bold uppercase">
                  {siteName.slice(0, 2)}
                </div>
              )}
              <span className="text-xs font-semibold uppercase tracking-wide opacity-90 line-clamp-1">
                {title}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onFavorite && (
                <button
                  onClick={handleFavorite}
                  disabled={isFavoriting}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                    isFavorited
                      ? 'border-white/50 bg-white/30 text-white'
                      : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Star className="h-4 w-4" />
                  {isFavoriting ? 'Saving...' : isFavorited ? 'Favorited' : 'Favorite'}
                </button>
              )}
              {onVote ? (
                <LikeDislike
                  likes={likes}
                  dislikes={dislikes}
                  userVote={userVote}
                  onVote={handleVote}
                  showCounts
                  size="sm"
                />
              ) : null}
              <button
                onClick={toggleFullscreen}
                className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-4 w-4" />
                    Exit
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4" />
                    Fullscreen
                  </>
                )}
              </button>
              <button
                onClick={() => setShowBar(false)}
                className="text-[11px] font-semibold text-white underline underline-offset-2 hover:text-gray-200"
              >
                Hide bar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowBar(true)}
            className={`absolute right-3 top-3 z-10 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-black/80 ${
              isFullscreen ? '' : 'mt-2'
            }`}
          >
            Show bar
          </button>
        )}
      </div>

      <style jsx global>{`
        .game-container:fullscreen,
        .game-container:-webkit-full-screen,
        .game-container:-moz-full-screen {
          width: 100%;
          height: 100%;
          background: black;
        }
        .game-container:fullscreen > * ,
        .game-container:-webkit-full-screen > * ,
        .game-container:-moz-full-screen > * {
          width: 100%;
          height: 100%;
        }
        .game-container iframe,
        .game-container canvas,
        .game-container video {
          width: 100%;
          height: 100%;
        }
        @media (orientation: portrait) {
          .game-container:fullscreen,
          .game-container:-webkit-full-screen,
          .game-container:-moz-full-screen {
            transform: rotate(0);
          }
        }
      `}</style>
    </div>
  );
}

