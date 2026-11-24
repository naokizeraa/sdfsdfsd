import { Lock, Mail, Smartphone } from 'lucide-react';
import { productConfig } from '../config/productConfig';
import { CheckoutButton } from './CheckoutButton';

interface FinalCtaSectionProps {
  onCheckoutFallback: () => void;
}

export function FinalCtaSection({ onCheckoutFallback }: FinalCtaSectionProps) {
  return (
    <section id="cta-final" className="forest-depth bg-[#183D2B] py-20 text-white sm:py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#C7A66A] uppercase">
          {productConfig.name} · {productConfig.subtitle}
        </p>

        <h2 className="mx-auto mt-4 max-w-3xl font-display text-3xl leading-tight font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl [text-wrap:balance]">
          Comece Hoje a Explorar o Universo das Receitas Naturais!
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#F5F0E6]/85 sm:text-lg">
          Tenha acesso a um guia digital com 100 receitas naturais e descubra novas possibilidades
          para sua rotina por apenas{' '}
          <strong className="font-semibold text-[#C7A66A] tabular-nums">
            {productConfig.pricing.currentPrice}
          </strong>{' '}
          (antes{' '}
          <span className="line-through opacity-75 tabular-nums">
            {productConfig.pricing.previousPrice}
          </span>
          ).
        </p>

        <div className="mt-9 flex justify-center">
          <CheckoutButton
            label="QUERO GARANTIR MEU E-BOOK"
            variant="gold"
            onFallbackTrigger={onCheckoutFallback}
            className="w-full sm:w-auto"
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 border-t border-white/12 pt-8 text-xs text-[#F5F0E6]/80 sm:grid-cols-3 sm:text-sm">
          <div className="flex items-center justify-center gap-2">
            <Lock className="h-4 w-4 shrink-0 text-[#C7A66A]" aria-hidden="true" />
            <span>Pagamento instantâneo via Pix</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Mail className="h-4 w-4 shrink-0 text-[#C7A66A]" aria-hidden="true" />
            <span>Envio do PDF por e-mail após confirmação</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Smartphone className="h-4 w-4 shrink-0 text-[#C7A66A]" aria-hidden="true" />
            <span>Garantia de {productConfig.guarantee.daysLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
