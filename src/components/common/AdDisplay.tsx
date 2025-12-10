'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Ad {
  id: string;
  title: string;
  type: 'CUSTOM' | 'CODE';
  position: string;
  imageUrl?: string | null;
  clickUrl?: string | null;
  code?: string | null;
  targetUrl?: string | null;
}

interface AdDisplayProps {
  position: 'HEADER' | 'SIDEBAR' | 'FOOTER' | 'IN_CONTENT' | 'POPUP';
  className?: string;
}

export default function AdDisplay({ position, className = '' }: AdDisplayProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, [position]);

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

  if (loading || ads.length === 0) {
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
}: {
  ad: Ad;
  onImpression: () => void;
  onClick: () => void;
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

  return (
    <div className="mb-4">
      <Link
        href={ad.clickUrl!}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-lg transition-transform hover:scale-105"
      >
        <Image
          src={ad.imageUrl!}
          alt={ad.title}
          width={300}
          height={250}
          className="h-auto w-full object-cover"
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

