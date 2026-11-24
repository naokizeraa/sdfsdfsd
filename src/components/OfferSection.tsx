import { Check, Lock, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { PRODUCT_IMAGES, productConfig } from '../config/productConfig';
import { CheckoutButton } from './CheckoutButton';
import { SafeImage } from './SafeImage';

interface OfferSectionProps {
  onCheckoutFallback: () => void;
}

const includedItems = [
  'E-book completo A Farmácia da Floresta — 100 Receitas Naturais em PDF',
  'Índice organizado por categorias para consulta rápida no dia a dia',
  'Preparações descritas com ingredientes acessíveis e passo a passo',
  'Arquivo compatível com celular, tablet, notebook e leitura offline',
  ...productConfig.bonuses.map((bonus) => `Bônus incluído: ${bonus.title}`),
];

export function OfferSection({ onCheckoutFallback }: OfferSectionProps) {
  return (
    <section id="oferta" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-3xl border border-[#C7A66A]/35 bg-[#F5F0E6] shadow-[0_28px_72px_-24px_rgba(24,61,43,0.25)]"
        >
          <div className="grid grid-cols-1 items-stretch lg:grid-cols-12">
            <div className="forest-depth flex flex-col justify-between bg-[#183D2B] p-8 text-white sm:p-10 lg:col-span-5">
              <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-[#C7A66A] uppercase">
                  Oferta Especial
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">
                  {productConfig.name}
                </h2>
                <p className="mt-1.5 text-sm font-medium text-[#C7A66A]">
                  {productConfig.subtitle} · {productConfig.format}
                </p>
              </div>

              <div className="my-7 overflow-hidden rounded-2xl border border-[#C7A66A]/30 bg-[#0F291C] p-2">
                <SafeImage
                  src={PRODUCT_IMAGES.heroMockup}
                  alt="Capa do livro A Farmácia da Floresta — 100 Receitas Naturais"
                  className="aspect-square w-full rounded-xl object-cover"
                  aspectClassName="aspect-square"
                />
              </div>

              <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6]/80">
                <Smartphone className="h-4 w-4 shrink-0 text-[#C7A66A]" aria-hidden="true" />
                <span>Acesso digital imediato após confirmação do pagamento</span>
              </div>
            </div>

            <div className="flex flex-col justify-between p-8 sm:p-10 lg:col-span-7">
              <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-[#527A50] uppercase">
                  O que está incluso nesta edição
                </p>

                <ul className="mt-5 space-y-3.5 border-b border-[#183D2B]/12 pb-7">
                  {includedItems.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-[#183D2B] sm:text-base"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#527A50]/15 text-[#183D2B]">
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 rounded-2xl border border-[#183D2B]/10 bg-white p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-[#183D2B]/65">
                      De{' '}
                      <span className="line-through tabular-nums">
                        {productConfig.pricing.previousPrice}
                      </span>{' '}
                      por
                    </span>
                    <span className="text-xs font-semibold text-[#527A50] tabular-nums">
                      {productConfig.pricing.savingsLabel}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-baseline gap-2.5">
                    <span className="font-display text-4xl font-semibold tracking-tight text-[#183D2B] tabular-nums sm:text-5xl">
                      {productConfig.pricing.currentPrice}
                    </span>
                    <span className="text-sm font-medium text-[#183D2B]/65">à vista</span>
                  </div>

                  <p className="mt-2.5 text-xs leading-relaxed text-[#183D2B]/70">
                    {productConfig.pricing.paymentNote}
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-4">
                <CheckoutButton
                  label="QUERO GARANTIR POR R$ 19,90"
                  variant="primary"
                  fullWidth
                  onFallbackTrigger={onCheckoutFallback}
                />

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#183D2B]/70">
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-[#527A50]" aria-hidden="true" />
                    Pagamento via Pix
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Envio digital por e-mail</span>
                  <span aria-hidden="true">·</span>
                  <span>Garantia de {productConfig.guarantee.daysLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
