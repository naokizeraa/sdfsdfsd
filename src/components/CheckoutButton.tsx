import { ArrowRight } from 'lucide-react';
import { isConfiguredExternalCheckout, productConfig } from '../config/productConfig';

interface CheckoutButtonProps {
  label: string;
  variant?: 'primary' | 'gold' | 'header';
  fullWidth?: boolean;
  onFallbackTrigger: () => void;
  className?: string;
}

export function CheckoutButton({
  label,
  variant = 'primary',
  fullWidth = false,
  onFallbackTrigger,
  className = '',
}: CheckoutButtonProps) {
  const checkoutUrl = productConfig.checkoutUrl;
  const isExternal = isConfiguredExternalCheckout(checkoutUrl);

  const baseStyles =
    'inline-flex items-center justify-center gap-2.5 font-semibold tracking-tight whitespace-nowrap shrink-0 transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer';

  const variantStyles = {
    primary:
      'rounded-xl bg-[#183D2B] text-white px-7 py-4 text-sm sm:text-base shadow-[0_10px_28px_-8px_rgba(24,61,43,0.4)] hover:bg-[#22523B] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-[#183D2B]',
    gold:
      'rounded-xl bg-[#C7A66A] text-[#183D2B] px-7 py-4 text-sm sm:text-base shadow-[0_10px_28px_-8px_rgba(199,166,106,0.45)] hover:bg-[#D2B47C] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-[#C7A66A]',
    header:
      'rounded-lg bg-[#183D2B] text-white px-4 py-2.5 text-xs sm:text-sm hover:bg-[#22523B] focus-visible:outline-[#183D2B]',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  if (isExternal) {
    return (
      <a
        href={checkoutUrl}
        rel="noopener noreferrer"
        className={`${baseStyles} ${variantStyles[variant]} ${widthStyle} ${className}`}
      >
        <span>{label}</span>
        {variant !== 'header' && <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onFallbackTrigger}
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyle} ${className}`}
    >
      <span>{label}</span>
      {variant !== 'header' && <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
    </button>
  );
}
