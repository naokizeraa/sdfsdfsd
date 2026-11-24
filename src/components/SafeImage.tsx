import { useState } from 'react';
import { Sprout } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClassName?: string;
  priority?: boolean;
}

export function SafeImage({
  src,
  alt,
  className = '',
  aspectClassName = '',
  priority = false,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#F5F0E6] via-[#E8E2D4] to-[#DCE2D7] p-6 text-center text-[#183D2B] ${aspectClassName} ${className}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#527A50]/25 bg-white/70">
          <Sprout className="h-5 w-5 text-[#527A50]" aria-hidden="true" />
        </div>
        <p className="max-w-xs text-xs font-medium text-[#183D2B]/80">{alt}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
