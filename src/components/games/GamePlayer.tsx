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
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handlePlay = () => {
    setIsPlaying(true);
    setError(null);
    onPlayStart?.();

    // Track play session start
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('game_start_time', Date.now().toString());
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    onPlayEnd?.();

    // Track play duration
    if (typeof window !== 'undefined') {
      const startTime = sessionStorage.getItem('game_start_time');
      if (startTime) {
        const duration = Date.now() - parseInt(startTime);
        console.log(`Play duration: ${Math.round(duration / 1000)} seconds`);
        sessionStorage.removeItem('game_start_time');
      }
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In a real implementation, you would mute/unmute the iframe
    // This requires communication with the iframe content
  };

  const handleIframeError = () => {
    setError('Failed to load the game. Please check the game URL or try again later.');
    setIsPlaying(false);
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-900 shadow-2xl">
      {/* Game Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4">
        <h3 className="text-lg font-semibold text-white truncate">{gameTitle}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="rounded-lg bg-white/20 p-2 text-white hover:bg-white/30"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="rounded-lg bg-white/20 p-2 text-white hover:bg-white/30"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            <Fullscreen className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Game Container */}
      <div
        ref={containerRef}
        className="relative aspect-video w-full bg-black"
      >
        {!isPlaying ? (
          // Play Button Overlay
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
            <div className="text-center">
              <button
                onClick={handlePlay}
                className="group relative mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg hover:shadow-xl"
              >
                <div className="absolute inset-0 rounded-full bg-white/20 group-hover:animate-ping-slow" />
                <Play className="h-12 w-12 text-white ml-2" />
              </button>
              <h3 className="mb-2 text-2xl font-bold text-white">Ready to Play?</h3>
              <p className="text-gray-300">Click the play button to start the game</p>
              <div className="mt-6 text-sm text-gray-400">
                <p>• Game will load in fullscreen mode</p>
                <p>• Use keyboard/mouse to play</p>
                <p>• Press F11 for fullscreen</p>
              </div>
            </div>
          </div>
        ) : error ? (
          // Error State
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900/20 to-black">
            <div className="text-center p-8">
              <div className="mb-4 inline-flex rounded-full bg-red-500/20 p-4">
                <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center">
                  <Play className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">Game Loading Failed</h3>
              <p className="mb-4 text-gray-300">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  handlePlay();
                }}
                className="rounded-lg bg-primary-600 px-6 py-2 font-semibold text-white hover:bg-primary-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          // Game Iframe
          <>
            <iframe
              ref={iframeRef}
              src={gameUrl}
              className="h-full w-full"
              title={gameTitle}
              allow="fullscreen; gamepad; accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onError={handleIframeError}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
            />
            {/* Loading Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-300 opacity-0 hover:opacity-100">
              <div className="text-center">
                <button
                  onClick={handlePause}
                  className="rounded-full bg-white/20 p-4 text-white backdrop-blur hover:bg-white/30"
                >
                  <Pause className="h-8 w-8" />
                </button>
                <p className="mt-2 text-sm text-white">Click to pause</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Game Controls Footer */}
      <div className="bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">
            {isPlaying ? 'Game is running' : 'Click play to start'}
          </div>
          <div className="flex items-center space-x-4">
            {isPlaying && (
              <button
                onClick={handlePause}
                className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                <Pause className="h-4 w-4" />
                <span>End Game</span>
              </button>
            )}
            <div className="text-xs text-gray-400">
              Press <kbd className="px-1 py-0.5 bg-gray-800 rounded">ESC</kbd> to exit fullscreen
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
