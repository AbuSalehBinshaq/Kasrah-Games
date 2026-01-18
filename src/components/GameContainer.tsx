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
  onExit?: () => void;
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
  onExit,
}: GameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
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

  // Hide page elements when in desktop fullscreen
  useEffect(() => {
    if (!isMobile && isFullscreen) {
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      const mobileNav = document.querySelector('[data-mobile-nav]');
      const mainContent = document.querySelector('main');
      const body = document.body;
      
      if (header) (header as HTMLElement).style.display = 'none';
      if (footer) (footer as HTMLElement).style.display = 'none';
      if (mobileNav) (mobileNav as HTMLElement).style.display = 'none';
      if (mainContent && mainContent !== containerRef.current?.closest('main')) {
        const gamePageContent = containerRef.current?.closest('.bg-gray-50');
        if (gamePageContent && gamePageContent !== mainContent) {
          (gamePageContent as HTMLElement).style.display = 'none';
        }
      }
      
      body.style.overflow = 'hidden';
      body.style.background = '#000';
      
      return () => {
        if (header) (header as HTMLElement).style.display = '';
        if (footer) (footer as HTMLElement).style.display = '';
        if (mobileNav) (mobileNav as HTMLElement).style.display = '';
        if (mainContent && mainContent !== containerRef.current?.closest('main')) {
          const gamePageContent = containerRef.current?.closest('.bg-gray-50');
          if (gamePageContent) {
            (gamePageContent as HTMLElement).style.display = '';
          }
        }
        body.style.overflow = '';
        body.style.background = '';
      };
    }
  }, [isMobile, isFullscreen]);

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
    // Show exit dialog before exiting
    setShowExitDialog(true);
  };

  const handleConfirmExit = () => {
    if (isMobile) {
      setIsMobileFullscreen(false);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (!isIOS) {
        exitFullscreen();
      }
    } else {
      exitFullscreen();
    }
    setShowExitDialog(false);
    if (onExit) {
      onExit();
    }
  };

  const handleContinue = () => {
    setShowExitDialog(false);
  };

  const toggleFullscreen = () => {
    if (isMobileFullscreen || isFullscreen) {
      handleExitMobileFullscreen();
    } else {
      handleMobileFullscreen();
    }
  };

  // Handle ESC key to show exit dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Escape' || e.key === 'Esc') && (isFullscreen || isMobileFullscreen)) {
        e.preventDefault();
        setShowExitDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, isMobileFullscreen]);

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
      {/* Exit Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">الخروج من اللعبة</h3>
            <p className="text-gray-600 mb-6">هل تريد الخروج من اللعبة أم الاستمرار في اللعب؟</p>
            <div className="flex gap-3">
              <button
                onClick={handleContinue}
                className="flex-1 rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700 transition-colors"
              >
                الاستمرار
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                الخروج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop view */}
      <div className="hidden md:block space-y-3">
        {!isFullscreen && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm font-semibold text-slate-800 shadow-sm hover:bg-gray-50"
            >
              Fullscreen
            </button>
          </div>
        )}

        <div
          ref={containerRef}
          className={`game-container relative overflow-hidden bg-black ${
            isFullscreen ? '' : 'rounded-xl border border-gray-200'
          }`}
        >
          <div className="aspect-video w-full">
            {children}
          </div>

          {showBar && (
            <div
              className={`pointer-events-auto flex items-center justify-between gap-3 border-t border-white/10 bg-black/70 px-3 py-2 text-sm text-white ${
                isFullscreen ? 'absolute inset-x-0 bottom-0 z-10' : 'border-t'
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
                {isFullscreen && (
                  <button
                    onClick={handleExitMobileFullscreen}
                    className="text-[11px] font-semibold text-white underline underline-offset-2 hover:text-gray-200"
                  >
                    Exit
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Exit button in fullscreen mode */}
          {isFullscreen && (
            <button
              onClick={handleExitMobileFullscreen}
              className="absolute top-4 right-4 z-20 rounded-lg bg-black/70 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white hover:bg-black/90 transition-colors"
            >
              Exit
            </button>
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
          width: 100vw !important;
          height: 100vh !important;
          background: black !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          z-index: 99999 !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          border-radius: 0 !important;
        }
        .game-container:fullscreen > *,
        .game-container:-webkit-full-screen > *,
        .game-container:-moz-full-screen > * {
          width: 100% !important;
          height: 100% !important;
        }
        .game-container:fullscreen .aspect-video,
        .game-container:-webkit-full-screen .aspect-video,
        .game-container:-moz-full-screen .aspect-video {
          width: 100% !important;
          height: 100% !important;
          aspect-ratio: unset !important;
        }
        .game-container iframe,
        .game-container canvas,
        .game-container video {
          width: 100% !important;
          height: 100% !important;
        }
        .game-container:fullscreen iframe,
        .game-container:-webkit-full-screen iframe,
        .game-container:-moz-full-screen iframe {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
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
