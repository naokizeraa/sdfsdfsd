import { BookPlus } from 'lucide-react';
import { productConfig } from '../config/productConfig';

/**
 * Seção opcional e configurável para materiais extras.
 * Renderiza automaticamente apenas quando itens reais forem adicionados
 * em `productConfig.bonuses`, garantindo que nenhum bônus fictício seja exibido.
 */
export function BonusesSection() {
  if (productConfig.bonuses.length === 0) {
    return null;
  }

  return (
    <section id="bonus" className="bg-[#F5F0E6] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#527A50] uppercase">
            Materiais Adicionais
          </p>
          <h2 className="mt-3 font-display text-3xl leading-tight font-semibold tracking-tight text-[#183D2B] sm:text-4xl [text-wrap:balance]">
            Conteúdos extras incluídos nesta edição
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {productConfig.bonuses.map((bonus, idx) => (
            <article
              key={bonus.id}
              className="flex flex-col justify-between rounded-2xl border border-[#183D2B]/10 bg-white p-6 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#527A50]">
                  <span className="font-semibold tracking-wider uppercase tabular-nums">
                    Bônus {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span>{bonus.format}</span>
                </div>
                <div className="mt-4 flex items-center gap-2.5">
                  <BookPlus className="h-5 w-5 shrink-0 text-[#C7A66A]" aria-hidden="true" />
                  <h3 className="font-display text-lg font-semibold text-[#183D2B]">
                    {bonus.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#183D2B]/75">
                  {bonus.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
