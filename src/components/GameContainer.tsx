'use client';

import { useRef, useState, useEffect } from 'react';
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
  const [showBar, setShowBar] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen(containerRef);

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto enter mobile fullscreen when component mounts (after Play button is clicked)
  useEffect(() => {
    if (isMobile && !isMobileFullscreen) {
      const timer = setTimeout(() => {
        setIsMobileFullscreen(true);
        // Don't call enterFullscreen() for iOS - just use CSS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        if (!isIOS) {
          enterFullscreen();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  useEffect(() => {
    if (isMobile && isMobileFullscreen) {
      // Hide header, footer, mobile nav, and other content
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      const mobileNav = document.querySelector('[data-mobile-nav]');
      const body = document.body;
      
      if (header) (header as HTMLElement).style.display = 'none';
      if (footer) (footer as HTMLElement).style.display = 'none';
      if (mobileNav) (mobileNav as HTMLElement).style.display = 'none';
      
      // Prevent scrolling and set body to black
      body.style.overflow = 'hidden';
      body.style.background = '#000';
      
      return () => {
        if (header) (header as HTMLElement).style.display = '';
        if (footer) (footer as HTMLElement).style.display = '';
        if (mobileNav) (mobileNav as HTMLElement).style.display = '';
        body.style.overflow = '';
        body.style.background = '';
      };
    }
  }, [isMobile, isMobileFullscreen]);

  const handleMobileFullscreen = () => {
    if (isMobile) {
      setIsMobileFullscreen(true);
      // Only use Fullscreen API on non-iOS devices
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (!isIOS) {
        enterFullscreen();
      }
    } else {
      enterFullscreen();
    }
  };

  const handleExitMobileFullscreen = () => {
    if (isMobile) {
      setIsMobileFullscreen(false);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (!isIOS) {
        exitFullscreen();
      }
    } else {
      exitFullscreen();
    }
  };

  const toggleFullscreen = () => {
    if (isMobileFullscreen || isFullscreen) {
      handleExitMobileFullscreen();
    } else {
      handleMobileFullscreen();
    }
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
    } catch (error) {
      console.error('Failed to favorite:', error);
    }
  };

  return (
    <>
      {/* Desktop view */}
      <div className="hidden md:block space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm font-semibold text-slate-800 shadow-sm hover:bg-gray-50"
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>

        <div
          ref={containerRef}
          className="game-container relative overflow-hidden rounded-xl border border-gray-200 bg-black"
        >
          <div className="aspect-video w-full">
            {children}
          </div>

          {showBar && (
            <div
              className={`pointer-events-auto flex items-center justify-between gap-3 border-t border-white/10 bg-black/70 px-3 py-2 text-sm text-white ${
                isFullscreen ? 'absolute inset-x-0 bottom-0 z-10' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                {siteLogoUrl ? (
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
                    <span>{isFavoriting ? 'Saving...' : isFavorited ? 'Favorited' : 'Favorite'}</span>
                  </button>
                )}
                {onVote && (
                  <LikeDislike
                    likes={likes}
                    dislikes={dislikes}
                    userVote={userVote}
                    onVote={handleVote}
                    showCounts
                    size="sm"
                  />
                )}
                <button
                  onClick={() => setShowBar(false)}
                  className="text-[11px] font-semibold text-white underline underline-offset-2 hover:text-gray-200"
                >
                  Hide bar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        {isMobileFullscreen ? (
          <div
            ref={containerRef}
            className="game-container-mobile-fullscreen"
          >
            {children}
            
            {/* Exit button */}
            <button
              onClick={handleExitMobileFullscreen}
              className="mobile-exit-button"
            >
              Exit
            </button>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="game-container-mobile relative bg-black rounded-xl border border-gray-200 aspect-video w-full overflow-hidden"
          >
            {children}
          </div>
        )}
      </div>

      <style jsx global>{`
        /* Desktop fullscreen styles */
        .game-container:fullscreen,
        .game-container:-webkit-full-screen,
        .game-container:-moz-full-screen {
          width: 100vw;
          height: 100vh;
          background: black;
        }
        .game-container:fullscreen > *,
        .game-container:-webkit-full-screen > *,
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
        
        /* Mobile fullscreen styles - CSS only, no Fullscreen API needed */
        .game-container-mobile-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          height: 100dvh; /* Dynamic viewport height for mobile browsers */
          background: #000;
          z-index: 9999;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        
        .game-container-mobile-fullscreen iframe,
        .game-container-mobile-fullscreen canvas,
        .game-container-mobile-fullscreen video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100% !important;
          height: 100% !important;
          border: none !important;
          display: block !important;
        }
        
        .mobile-exit-button {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10000;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          color: white;
          border: none;
          border-radius: 9999px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }
        
        .mobile-exit-button:hover {
          background: rgba(0, 0, 0, 0.8);
        }
        
        /* Regular mobile container */
        .game-container-mobile iframe,
        .game-container-mobile canvas,
        .game-container-mobile video {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
          display: block !important;
        }
      `}</style>
    </>
  );
}
