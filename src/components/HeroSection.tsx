import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { PRODUCT_IMAGES, productConfig } from '../config/productConfig';
import { CheckoutButton } from './CheckoutButton';
import { SafeImage } from './SafeImage';

interface HeroSectionProps {
  onCheckoutFallback: () => void;
}

const heroHighlights = [
  '100 preparações naturais e caseiras organizadas por tema para consulta prática',
  'Ingredientes simples e acessíveis para explorar no dia a dia sem complicação',
  'Formato digital em PDF compatível com celular, tablet e computador',
];

const heroStats = [
  { label: 'Acervo completo', value: '100 Receitas' },
  { label: 'Entrega imediata', value: 'PDF Digital' },
  { label: 'Garantia de reembolso', value: productConfig.guarantee.daysLabel },
  { label: 'Valor promocional', value: productConfig.pricing.currentPrice },
];

export function HeroSection({ onCheckoutFallback }: HeroSectionProps) {
  return (
    <section
      id="topo"
      className="botanical-surface relative overflow-hidden bg-[#F5F0E6] pt-8 pb-14 sm:pt-12 sm:pb-18 lg:pt-14 lg:pb-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center lg:col-span-7"
          >
            <p className="mb-3.5 text-xs font-semibold tracking-[0.16em] text-[#527A50] uppercase sm:text-sm">
              Guia Digital · {productConfig.subtitle}
            </p>

            <h1 className="font-display text-[clamp(2.15rem,4vw,3.45rem)] leading-[1.1] font-semibold tracking-tight text-[#183D2B] [text-wrap:balance]">
              Descubra 100 Receitas Naturais Para Conhecer Novas Maneiras de Cuidar de Você!
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#183D2B]/80 sm:text-lg">
              Um guia digital com 100 receitas caseiras, ingredientes naturais e preparações práticas
              para você explorar e incluir na sua rotina com{' '}
              <strong className="font-semibold text-[#183D2B]">{productConfig.name}</strong>.
            </p>

            <ul className="mt-6 space-y-3 border-t border-[#183D2B]/12 pt-5">
              {heroHighlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-relaxed text-[#183D2B] sm:text-base"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#527A50]/15 text-[#183D2B]">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <CheckoutButton
                label="QUERO MEU LIVRO DIGITAL"
                variant="primary"
                onFallbackTrigger={onCheckoutFallback}
                className="w-full sm:w-auto"
              />
              <div className="flex flex-col">
                <span className="text-xs text-[#183D2B]/65">
                  De{' '}
                  <span className="line-through tabular-nums">
                    {productConfig.pricing.previousPrice}
                  </span>{' '}
                  por apenas
                </span>
                <span className="font-display text-2xl font-semibold text-[#183D2B] tabular-nums">
                  {productConfig.pricing.currentPrice}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center lg:col-span-5"
          >
            <div className="relative w-full overflow-hidden rounded-3xl border border-[#C7A66A]/35 bg-white p-3.5 shadow-[0_28px_70px_-22px_rgba(24,61,43,0.28)]">
              <div className="overflow-hidden rounded-2xl bg-[#EAE4D7]">
                <SafeImage
                  src={PRODUCT_IMAGES.heroMockup}
                  alt="Capa em perspectiva 3D do livro A Farmácia da Floresta — conhecimentos ancestrais, plantas e receitas naturais para cuidar do corpo"
                  className="aspect-square w-full object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
                  aspectClassName="aspect-square"
                  priority
                />
              </div>
              <div className="mt-3.5 flex items-center justify-between px-2 pb-1 text-xs font-medium text-[#183D2B]/75">
                <span>{productConfig.name}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{productConfig.subtitle}</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 grid grid-cols-2 divide-y divide-[#183D2B]/10 rounded-2xl border border-[#183D2B]/10 bg-white/80 backdrop-blur-xs sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {heroStats.map((stat) => (
            <div key={stat.label} className="px-5 py-4 text-center sm:text-left">
              <p className="text-xs font-medium text-[#527A50]">{stat.label}</p>
              <p className="mt-0.5 font-display text-lg font-semibold text-[#183D2B] tabular-nums">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
