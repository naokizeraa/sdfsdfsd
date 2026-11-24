import { motion } from 'motion/react';
import { PRODUCT_IMAGES, productConfig } from '../config/productConfig';
import { CheckoutButton } from './CheckoutButton';
import { SafeImage } from './SafeImage';

interface BannerSectionProps {
  onCheckoutFallback: () => void;
}

export function BannerSection({ onCheckoutFallback }: BannerSectionProps) {
  return (
    <section
      aria-label="Banner de apresentação do guia A Farmácia da Floresta"
      className="forest-depth border-y border-[#C7A66A]/25 bg-[#0F291C] py-12 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-3xl border border-[#C7A66A]/35 bg-[#183D2B] p-2 shadow-[0_28px_72px_-20px_rgba(0,0,0,0.55)] sm:p-3"
        >
          <div className="overflow-hidden rounded-2xl bg-[#0B1E14]">
            <SafeImage
              src={PRODUCT_IMAGES.promotionalBanner}
              alt="Banner oficial A Farmácia da Floresta: conhecimentos ancestrais, plantas e mais de 100 receitas naturais em formato 100% digital com acesso imediato"
              className="aspect-video w-full object-cover"
              aspectClassName="aspect-video"
              priority
            />
          </div>
        </motion.div>

        <div className="mt-7 flex flex-col items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="font-display text-lg font-semibold text-white">
              {productConfig.name} · {productConfig.subtitle}
            </p>
            <p className="mt-1 text-sm text-[#F5F0E6]/80">
              De{' '}
              <span className="line-through tabular-nums">
                {productConfig.pricing.previousPrice}
              </span>{' '}
              por apenas{' '}
              <strong className="font-semibold text-[#C7A66A] tabular-nums">
                {productConfig.pricing.currentPrice}
              </strong>{' '}
              · Acesso digital em PDF
            </p>
          </div>
          <CheckoutButton
            label="QUERO GARANTIR MEU GUIA"
            variant="gold"
            onFallbackTrigger={onCheckoutFallback}
            className="w-full sm:w-auto"
          />
        </div>
      </div>
    </section>
  );
}
