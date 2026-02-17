'use client';

import { useState, useEffect, useRef } from 'react';
import { Fullscreen, Pause, Play, Volume2, VolumeX } from 'lucide-react';

interface GamePlayerProps {
  gameUrl: string;
  gameTitle: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
}

export default function GamePlayer({ gameUrl, gameTitle, onPlayStart, onPlayEnd }: GamePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handlePlay = () => {
    setIsPlaying(true);
    setError(null);
    onPlayStart?.();
  };

  const handlePause = () => {
    setIsPlaying(false);
    onPlayEnd?.();
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const element = iframeRef.current || containerRef.current;
        if (element) {
          const request = (element as any).requestFullscreen || 
                          (element as any).webkitRequestFullscreen || 
                          (element as any).mozRequestFullScreen || 
                          (element as any).msRequestFullscreen;
          
          if (request) {
            await request.call(element);
          } else {
            await containerRef.current?.requestFullscreen();
          }
        }
      } else {
        const exit = document.exitFullscreen || 
                     (document as any).webkitExitFullscreen || 
                     (document as any).mozCancelFullScreen || 
                     (document as any).msExitFullscreen;
        if (exit) await exit.call(document);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  return (
    <div ref={containerRef} className={`relative bg-black overflow-hidden ${isFullscreen ? 'w-screen h-screen' : 'w-full h-full rounded-xl'}`}>
      {!isPlaying ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <button
            onClick={handlePlay}
            className="group flex h-20 w-20 items-center justify-center rounded-full bg-primary-600 text-white shadow-xl hover:scale-110 transition-transform"
          >
            <Play className="h-10 w-10 ml-1" />
          </button>
        </div>
      ) : (
        <div className="w-full h-full">
          <iframe
            ref={iframeRef}
            src={gameUrl}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; gamepad; keyboard-map *"
            allowFullScreen
            title={gameTitle}
          />
          
          {/* Overlay Controls (Only visible when NOT in fullscreen) */}
          {!isFullscreen && (
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-black/50 text-white rounded-lg backdrop-blur-sm hover:bg-black/70"
              >
                <Fullscreen className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
