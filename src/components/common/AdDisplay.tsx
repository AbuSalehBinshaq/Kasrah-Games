'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  type: 'CUSTOM' | 'CODE';
  position: string;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'FULL_WIDTH' | 'CUSTOM';
  imageUrl?: string | null;
  clickUrl?: string | null;
  code?: string | null;
  targetUrl?: string | null;
}

interface AdDisplayProps {
  position: 'HEADER' | 'SIDEBAR' | 'FOOTER' | 'IN_CONTENT' | 'POPUP';
  className?: string;
}

const sizeDimensions: Record<string, { width: number; height: number }> = {
  SMALL: { width: 300, height: 100 },
  MEDIUM: { width: 300, height: 250 },
  LARGE: { width: 728, height: 90 },
  FULL_WIDTH: { width: 1200, height: 300 },
  CUSTOM: { width: 300, height: 250 },
};

export default function AdDisplay({ position, className = '' }: AdDisplayProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupAd, setPopupAd] = useState<Ad | null>(null);

  useEffect(() => {
    fetchAds();
  }, [position]);

  useEffect(() => {
    // Show popup ads after page load
    if (position === 'POPUP' && ads.length > 0 && !showPopup) {
      const popupAds = ads.filter(ad => ad.position === 'POPUP');
      if (popupAds.length > 0) {
        // Check if popup was already shown (using localStorage)
        const popupShown = localStorage.getItem(`popup_${popupAds[0].id}`);
        if (!popupShown) {
          setTimeout(() => {
            setPopupAd(popupAds[0]);
            setShowPopup(true);
            localStorage.setItem(`popup_${popupAds[0].id}`, 'true');
          }, 2000); // Show after 2 seconds
        }
      }
    }
  }, [ads, position, showPopup]);

  async function fetchAds() {
    try {
      const response = await fetch(`/api/ads?position=${position}`);
      const data = await response.json();
      setAds(data.ads || []);
    } catch (error) {
      console.error('Failed to fetch ads:', error);
    } finally {
      setLoading(false);
    }
  }

  async function trackClick(adId: string, clickUrl: string) {
    try {
      await fetch('/api/ads/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId }),
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  }

  async function trackImpression(adId: string) {
    try {
      await fetch('/api/ads/impression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId }),
      });
    } catch (error) {
      console.error('Failed to track impression:', error);
    }
  }

  if (loading) {
    return null;
  }

  // Handle popup separately
  if (position === 'POPUP') {
    if (!showPopup || !popupAd) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="relative rounded-lg bg-white shadow-xl">
          <button
            onClick={() => setShowPopup(false)}
            className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1 text-gray-600 hover:bg-white"
          >
            <X className="h-5 w-5" />
          </button>
          {popupAd.type === 'CUSTOM' && popupAd.imageUrl && popupAd.clickUrl ? (
            <AdBanner
              ad={popupAd}
              onImpression={() => trackImpression(popupAd.id)}
              onClick={() => trackClick(popupAd.id, popupAd.clickUrl!)}
              size={popupAd.size || 'MEDIUM'}
            />
          ) : popupAd.type === 'CODE' && popupAd.code ? (
            <AdCode
              ad={popupAd}
              onImpression={() => trackImpression(popupAd.id)}
            />
          ) : null}
        </div>
      </div>
    );
  }

  if (ads.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {ads.map((ad) => {
        if (ad.type === 'CUSTOM' && ad.imageUrl && ad.clickUrl) {
          return (
            <AdBanner
              key={ad.id}
              ad={ad}
              onImpression={() => trackImpression(ad.id)}
              onClick={() => trackClick(ad.id, ad.clickUrl!)}
              size={ad.size || 'MEDIUM'}
            />
          );
        } else if (ad.type === 'CODE' && ad.code) {
          return (
            <AdCode
              key={ad.id}
              ad={ad}
              onImpression={() => trackImpression(ad.id)}
            />
          );
        }
        return null;
      })}
    </div>
  );
}

function AdBanner({
  ad,
  onImpression,
  onClick,
  size = 'MEDIUM',
}: {
  ad: Ad;
  onImpression: () => void;
  onClick: () => void;
  size?: string;
}) {
  useEffect(() => {
    onImpression();
  }, [onImpression]);

  const handleClick = () => {
    onClick();
    if (ad.targetUrl) {
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const dimensions = sizeDimensions[size] || sizeDimensions.MEDIUM;
  const isFullWidth = size === 'FULL_WIDTH';

  return (
    <div className={`mb-4 ${isFullWidth ? 'w-full' : ''}`}>
      <Link
        href={ad.clickUrl!}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-lg transition-transform hover:scale-105"
        style={isFullWidth ? {} : { width: dimensions.width, height: 'auto', maxWidth: '100%' }}
      >
        <Image
          src={ad.imageUrl!}
          alt={ad.title}
          width={dimensions.width}
          height={dimensions.height}
          className={`${isFullWidth ? 'w-full' : ''} h-auto object-cover`}
          unoptimized
        />
      </Link>
    </div>
  );
}

function AdCode({
  ad,
  onImpression,
}: {
  ad: Ad;
  onImpression: () => void;
}) {
  useEffect(() => {
    onImpression();
  }, [onImpression]);

  return (
    <div
      className="mb-4"
      dangerouslySetInnerHTML={{ __html: ad.code! }}
    />
  );
}
