import { productConfig } from '../config/productConfig';

export function GuaranteeSection() {
  return (
    <section id="garantia" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 rounded-3xl border border-[#C7A66A]/35 bg-[#F5F0E6] p-8 sm:p-12 md:flex-row md:gap-12">
          <div className="shrink-0">
            <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-2 border-[#C7A66A] bg-[#183D2B] p-3 text-center text-white shadow-[0_18px_40px_-14px_rgba(24,61,43,0.45)]">
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-dashed border-[#C7A66A]/55 px-3">
                <span className="text-[10px] font-semibold tracking-[0.22em] text-[#C7A66A] uppercase">
                  Garantia
                </span>
                <span className="mt-1 font-display text-3xl font-semibold leading-none text-white tabular-nums">
                  {productConfig.guarantee.daysLabel}
                </span>
                <span className="mt-2 border-t border-[#C7A66A]/35 pt-1.5 text-[10px] tracking-wider text-[#F5F0E6]/85 uppercase">
                  Satisfação
                </span>
              </div>
            </div>
          </div>

          <div className="text-center md:text-left">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#527A50] uppercase">
              Política de Reembolso Clara
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-[#183D2B] sm:text-3xl [text-wrap:balance]">
              Garantia de {productConfig.guarantee.daysLabel} para avaliar o material com tranquilidade
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#183D2B]/80 sm:text-base">
              {productConfig.guarantee.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
