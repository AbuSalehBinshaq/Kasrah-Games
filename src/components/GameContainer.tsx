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
  const [isVoting, setIsVoting] = useState(false);
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

  const handleFullscreen = () => {
    if (isMobile) {
      setIsMobileFullscreen(true);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (!isIOS) enterFullscreen();
    } else {
      // For Desktop: Try to fullscreen the iframe directly for the best experience
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
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (!isIOS) exitFullscreen();
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
          isFullscreen ? 'fixed inset-0 z-[9999] w-screen h-screen' : 'rounded-xl border border-gray-200 aspect-video w-full'
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

        {/* Mobile Exit Button */}
        {isMobileFullscreen && (
          <button
            onClick={handleExitFullscreen}
            className="fixed top-4 right-4 z-[10000] bg-black/70 text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md border border-white/20"
          >
            Exit Game
          </button>
        )}
      </div>

      <style jsx global>{`
        .game-container iframe {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
          display: block !important;
        }
        
        /* Ensure iframe fills screen when requested directly */
        iframe:fullscreen {
          width: 100vw !important;
          height: 100vh !important;
          background: #000 !important;
        }
        
        :-webkit-full-screen iframe {
          width: 100vw !important;
          height: 100vh !important;
        }
      `}</style>
    </div>
  );
}
