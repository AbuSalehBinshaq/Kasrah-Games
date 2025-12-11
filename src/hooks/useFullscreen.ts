import { useEffect, useState, RefObject } from 'react';

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  mozCancelFullScreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
};

export function useFullscreen(targetRef: RefObject<HTMLElement>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getDoc = () => document as FullscreenDocument;

  const getFullscreenElement = () => {
    const doc = getDoc();
    return (
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );
  };

  const enterFullscreen = async () => {
    const element = targetRef.current as FullscreenElement | null;
    if (!element) return;

    const request =
      element.requestFullscreen ||
      element.webkitRequestFullscreen ||
      element.mozRequestFullScreen ||
      element.msRequestFullscreen;

    if (request) {
      try {
        await request.call(element);
        // Try to lock orientation to landscape when supported (mobile).
        if (typeof screen !== 'undefined' && (screen as any).orientation?.lock) {
          try {
            await (screen as any).orientation.lock('landscape');
          } catch {
            /* ignore if not allowed */
          }
        }
      } catch (error) {
        console.error('Fullscreen request failed:', error);
      }
    }
  };

  const exitFullscreen = async () => {
    const doc = getDoc();
    const exit =
      doc.exitFullscreen ||
      doc.webkitExitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.msExitFullscreen;
    if (exit) {
      try {
        await exit.call(doc);
      } catch (error) {
        console.error('Exit fullscreen failed:', error);
      }
    }
  };

  useEffect(() => {
    const handleChange = () => {
      const active = getFullscreenElement() === targetRef.current;
      setIsFullscreen(active);
    };

    document.addEventListener('fullscreenchange', handleChange);
    document.addEventListener('webkitfullscreenchange', handleChange as EventListener);
    document.addEventListener('mozfullscreenchange', handleChange as EventListener);
    document.addEventListener('MSFullscreenChange', handleChange as EventListener);

    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
      document.removeEventListener('webkitfullscreenchange', handleChange as EventListener);
      document.removeEventListener('mozfullscreenchange', handleChange as EventListener);
      document.removeEventListener('MSFullscreenChange', handleChange as EventListener);
    };
  }, [targetRef]);

  return { isFullscreen, enterFullscreen, exitFullscreen };
}
