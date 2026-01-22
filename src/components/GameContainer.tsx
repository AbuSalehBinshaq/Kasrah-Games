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
  onExitFullscreen?: () => void;
  isPaused?: boolean;
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
  onExitFullscreen,
  isPaused = false,
}: GameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen(containerRef);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle body scroll lock
  useEffect(() => {
    if (isMobileFullscreen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  }, [isMobileFullscreen]);

  const handleFullscreen = async () => {
    if (isMobile) {
      setIsMobileFullscreen(true);
      // Try to lock orientation to landscape if supported
      if (typeof screen !== 'undefined' && (screen as any).orientation?.lock) {
        try {
          await (screen as any).orientation.lock('landscape');
        } catch (e) {
          console.log('Orientation lock not supported or requires fullscreen');
        }
      }
      // On mobile, we use the overlay approach but with better CSS
    } else {
      // Desktop: Target iframe directly
      const iframe = containerRef.current?.querySelector('iframe');
      if (iframe) {
        const element = iframe as any;
        const request = element.requestFullscreen || element.webkitRequestFullscreen || element.mozRequestFullScreen || element.msRequestFullscreen;
        if (request) {
          request.call(element).catch(() => enterFullscreen());
        } else {
          enterFullscreen();
        }
      } else {
        enterFullscreen();
      }
    }
  };

  const handleExitFullscreen = () => {
    if (isMobile) {
      setIsMobileFullscreen(false);
      if (onExitFullscreen) onExitFullscreen();
    } else {
      exitFullscreen();
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen || isMobileFullscreen) {
      handleExitFullscreen();
    } else {
      handleFullscreen();
    }
  };

  return (
    <div className="space-y-3">
      {/* Header with Fullscreen Button */}
      {!isFullscreen && !isMobileFullscreen && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-gray-50 transition-colors"
          >
            Fullscreen
          </button>
        </div>
      )}

      {/* Game Area */}
      <div
        ref={containerRef}
        className={`game-container relative overflow-hidden bg-black ${
          isFullscreen || isMobileFullscreen 
            ? 'fixed inset-0 z-[9999] w-screen h-screen' 
            : 'rounded-xl border border-gray-200 aspect-video w-full'
        }`}
      >
        <div className="w-full h-full">
          {children}
        </div>

        {/* Game Bar (Hidden in Fullscreen) */}
        {showBar && !isFullscreen && !isMobileFullscreen && (
          <div className="absolute bottom-0 inset-x-0 z-10 flex items-center justify-between gap-3 border-t border-white/10 bg-black/70 px-4 py-2 text-sm text-white backdrop-blur-sm">
            <div className="flex items-center gap-2">
              {siteLogoUrl && (
                <img src={siteLogoUrl} alt={siteName} className="h-7 w-7 rounded-full bg-white p-0.5" />
              )}
              <span className="text-xs font-semibold uppercase tracking-wide truncate max-w-[150px]">
                {title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {onFavorite && (
                <button
                  onClick={onFavorite}
                  disabled={isFavoriting}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    isFavorited ? 'bg-white/30 border-white/50' : 'bg-white/10 border-white/30 hover:bg-white/20'
                  }`}
                >
                  {isFavorited ? 'Favorited' : 'Favorite'}
                </button>
              )}
              {onVote && (
                <LikeDislike
                  likes={likes}
                  dislikes={dislikes}
                  userVote={userVote}
                  onVote={onVote}
                  showCounts
                  size="sm"
                />
              )}
              <button onClick={() => setShowBar(false)} className="text-[10px] opacity-70 hover:opacity-100 underline">
                Hide
              </button>
            </div>
          </div>
        )}

        {/* Mobile Exit Button - Floating and subtle like Poki */
        {isMobileFullscreen && (
          <button
            onClick={handleExitFullscreen}
            className="fixed top-[calc(1rem+env(safe-area-inset-top))] right-[calc(1rem+env(safe-area-inset-right))] z-[1000000] bg-black/20 text-white/60 w-8 h-8 flex items-center justify-center rounded-full text-2xl font-light backdrop-blur-sm border border-white/5 hover:bg-black/40 transition-all"
            aria-label="Exit Fullscreen"
          >
            ×
          </button>
        )}}
      </div>

      <style jsx global>{`
        .game-container iframe {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
          display: block !important;
        }
        
        /* Desktop Fullscreen API styles */
        iframe:fullscreen {
          width: 100vw !important;
          height: 100vh !important;
          background: #000 !important;
        }
        
        :-webkit-full-screen iframe {
          width: 100vw !important;
          height: 100vh !important;
        }

           /* Mobile Pseudo Fullscreen (Simulation) */
        @media (max-width: 768px) {
          .game-container.fixed {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            height: 100% !important;
            height: -webkit-fill-available !important; /* Fix for iOS Safari */
            z-index: 999999 !important;
            background: #000 !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 0 !important;
          }
          
          .game-container.fixed iframe {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            border: none !important;
            /* Handle safe areas for notched phones */
            padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left) !important;
          }
        }       }
      `}</style>
    </div>
  );
}
