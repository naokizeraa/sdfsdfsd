import { BookMarked, Compass, FolderKanban, Layers, Smartphone } from 'lucide-react';

const benefits = [
  {
    icon: BookMarked,
    title: 'Tenha 100 receitas reunidas em um só lugar',
    description:
      'Sem precisar garimpar páginas diferentes na internet ou manter dezenas de anotações soltas.',
  },
  {
    icon: Compass,
    title: 'Explore diferentes ingredientes naturais',
    description:
      'Conheça novas formas de combinar ervas, especiarias, frutas e itens básicos da sua cozinha.',
  },
  {
    icon: Layers,
    title: 'Descubra novas preparações caseiras',
    description:
      'Aprenda preparos tradicionais e opções práticas para variar seus hábitos ao longo da semana.',
  },
  {
    icon: FolderKanban,
    title: 'Consulte as receitas sempre que precisar',
    description:
      'Com o índice organizado, você encontra exatamente o preparo desejado em poucos toques.',
  },
  {
    icon: Smartphone,
    title: 'Tenha um material digital organizado e acessível',
    description:
      'Salve o PDF no celular ou computador e acesse mesmo quando estiver offline.',
  },
];

export function BenefitsSection() {
  return (
    <section id="beneficios" className="bg-[#F5F0E6] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#527A50] uppercase">
              Benefícios do Guia
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight font-semibold tracking-tight text-[#183D2B] sm:text-4xl [text-wrap:balance]">
              Praticidade para consultar, clareza para preparar
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#183D2B]/75">
              Pensado para quem valoriza o cuidado com a rotina e prefere informações diretas,
              organizadas e fáceis de colocar em prática no dia a dia.
            </p>
          </div>

          <div className="divide-y divide-[#183D2B]/12 border-y border-[#183D2B]/12 lg:col-span-7">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="flex items-start gap-4 py-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#183D2B] shadow-xs">
                    <Icon className="h-5 w-5 text-[#527A50]" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-[#183D2B]">
                      {benefit.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#183D2B]/75">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
