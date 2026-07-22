'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SmartImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  imgClassName?: string;
  gradient?: string;
}

// Renders an image with a premium gradient fallback while loading or on error.
export function SmartImage({ src, alt, className, imgClassName, gradient = 'from-primary/30 via-chart-2/20 to-chart-3/20' }: SmartImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn('relative overflow-hidden bg-gradient-to-br', gradient, className)}>
      {/* Decorative pattern overlay for fallback */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      {!error && src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setError(true)}
          onLoad={() => setLoaded(true)}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-500',
            loaded ? 'opacity-100' : 'opacity-0',
            imgClassName
          )}
        />
      )}
    </div>
  );
}
