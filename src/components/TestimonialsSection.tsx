import { Quote, Star, UserCheck } from 'lucide-react';
import { productConfig } from '../config/productConfig';
import { SafeImage } from './SafeImage';

export function TestimonialsSection() {
  const { testimonials } = productConfig;

  if (testimonials.length === 0) {
    return (
      <section id="depoimentos" className="bg-[#F5F0E6]/65 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#183D2B]/10 bg-white p-8 sm:p-10">
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12">
              <div className="md:col-span-8">
                <p className="text-xs font-semibold tracking-[0.14em] text-[#527A50] uppercase">
                  Transparência Editorial
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-[#183D2B] sm:text-3xl [text-wrap:balance]">
                  Avaliações reais de leitores
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#183D2B]/75 sm:text-base">
                  Valorizamos a confiança acima de tudo. Este espaço é dedicado exclusivamente a
                  relatos reais e autorizados de pessoas que adquiriram o guia{' '}
                  <strong className="font-semibold text-[#183D2B]">100 Receitas Naturais</strong>.
                  Não exibimos avaliações fictícias ou depoimentos fabricados.
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 border-t border-[#183D2B]/10 pt-5 md:col-span-4 md:border-t-0 md:border-l md:pt-0 md:pl-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F0E6] text-[#527A50]">
                  <UserCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-[#183D2B]">
                  Conteúdo informativo e prático
                </p>
                <p className="text-xs leading-relaxed text-[#183D2B]/70">
                  Comunicação transparente sobre o formato em PDF, receitas caseiras e política de
                  reembolso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="depoimentos" className="bg-[#F5F0E6]/65 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#527A50] uppercase">
            Opinião de Quem Já Adquiriu
          </p>
          <h2 className="mt-3 font-display text-3xl leading-tight font-semibold tracking-tight text-[#183D2B] sm:text-4xl [text-wrap:balance]">
            Experiências reais com o guia
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-[#183D2B]/10 bg-white p-6 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#C7A66A]" aria-label={`Avaliação ${item.rating} de 5`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < item.rating ? 'fill-[#C7A66A]' : 'text-[#183D2B]/20'}`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <Quote className="h-4 w-4 text-[#183D2B]/25" aria-hidden="true" />
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[#183D2B]/85">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 border-t border-[#183D2B]/10 pt-4">
                {item.avatarUrl ? (
                  <SafeImage
                    src={item.avatarUrl}
                    alt={`Foto de ${item.name}`}
                    className="h-10 w-10 rounded-full object-cover"
                    aspectClassName="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#183D2B]/10 text-xs font-semibold text-[#183D2B]">
                    {item.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-[#183D2B]">{item.name}</p>
                  {item.location && (
                    <p className="text-xs text-[#183D2B]/65">{item.location}</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
