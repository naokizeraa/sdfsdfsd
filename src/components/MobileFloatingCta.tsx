import { useEffect, useState } from 'react';
import { productConfig } from '../config/productConfig';
import { CheckoutButton } from './CheckoutButton';

interface MobileFloatingCtaProps {
  onCheckoutFallback: () => void;
}

export function MobileFloatingCta({ onCheckoutFallback }: MobileFloatingCtaProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 480);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#183D2B]/12 bg-white/95 px-4 py-2.5 backdrop-blur-md shadow-[0_-8px_24px_-12px_rgba(24,61,43,0.22)] md:hidden"
      role="region"
      aria-label="Atalho de compra móvel"
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-[#183D2B]">{productConfig.name}</p>
          <div className="flex items-baseline gap-1.5 text-xs tabular-nums">
            <span className="text-[#183D2B]/55 line-through">
              {productConfig.pricing.previousPrice}
            </span>
            <span className="font-semibold text-[#183D2B]">
              {productConfig.pricing.currentPrice}
            </span>
          </div>
        </div>
        <CheckoutButton
          label="QUERO MEU GUIA"
          variant="header"
          onFallbackTrigger={onCheckoutFallback}
          className="px-4 py-2.5 text-xs font-semibold"
        />
      </div>
    </div>
  );
}
