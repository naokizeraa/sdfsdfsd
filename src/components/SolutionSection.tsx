import { BookOpen, CheckCircle2, FileText, Leaf, Search, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { PRODUCT_IMAGES, productConfig } from '../config/productConfig';
import { SafeImage } from './SafeImage';

const solutionFeatures = [
  {
    icon: BookOpen,
    title: '100 receitas naturais',
    detail: 'Acervo completo reunido em um único volume digital.',
  },
  {
    icon: Leaf,
    title: 'Preparações caseiras',
    detail: 'Passo a passo pensado para fazer na cozinha de casa.',
  },
  {
    icon: CheckCircle2,
    title: 'Ingredientes naturais',
    detail: 'Ervas, especiarias e itens acessíveis do cotidiano.',
  },
  {
    icon: FileText,
    title: 'Conteúdo organizado',
    detail: 'Capítulos estruturados por tipo de preparação e uso.',
  },
  {
    icon: Search,
    title: 'Consulta fácil e rápida',
    detail: 'Índice claro para encontrar qualquer receita em segundos.',
  },
  {
    icon: Smartphone,
    title: 'Acesso digital',
    detail: 'Arquivo PDF para abrir no celular, tablet ou computador.',
  },
];

export function SolutionSection() {
  return (
    <section id="solucao" className="botanical-surface bg-[#F5F0E6] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-between lg:col-span-5"
          >
            <div className="relative h-full overflow-hidden rounded-3xl border border-[#183D2B]/10 bg-white p-3.5 shadow-[0_22px_54px_-20px_rgba(24,61,43,0.2)]">
              <div className="overflow-hidden rounded-2xl bg-[#E8E1D3]">
                <SafeImage
                  src={PRODUCT_IMAGES.catErvasPlantas}
                  alt="Ramos frescos de alecrim, sálvia, hortelã e louro organizados com tigelas artesanais sobre madeira natural"
                  className="aspect-[4/3] w-full object-cover"
                  aspectClassName="aspect-[4/3]"
                />
              </div>

              <div className="mt-3.5 rounded-2xl border border-[#183D2B]/10 bg-[#183D2B] p-5 text-white">
                <div className="flex items-center justify-between text-xs text-[#C7A66A]">
                  <span className="font-semibold tracking-wider uppercase">
                    {productConfig.format}
                  </span>
                  <span className="tabular-nums">100 Receitas</span>
                </div>
                <p className="mt-2 font-display text-lg font-semibold text-white">
                  {productConfig.name}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#F5F0E6]/80">
                  Organizado com índice temático, medidas caseiras em colheres e xícaras, e modo
                  de preparo direto ao ponto.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center lg:col-span-7"
          >
            <p className="text-xs font-semibold tracking-[0.14em] text-[#527A50] uppercase">
              A Solução Prática
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight font-semibold tracking-tight text-[#183D2B] sm:text-4xl [text-wrap:balance]">
              Um guia pensado para facilitar a sua jornada com preparações naturais
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#183D2B]/80">
              O e-book <strong className="font-semibold text-[#183D2B]">{productConfig.name}</strong>{' '}
              ({productConfig.subtitle}) foi organizado como um manual prático de cozinha e cuidado
              cotidiano. Em vez de perder tempo procurando anotações dispersas, você passa a ter um
              material claro, bem diagramado e pronto para acompanhar sua rotina.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {solutionFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="flex items-start gap-3.5 rounded-2xl border border-[#183D2B]/8 bg-white p-4 shadow-[0_6px_20px_-10px_rgba(24,61,43,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#527A50]/35"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#183D2B]/8 text-[#183D2B]">
                      <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#183D2B]">{feature.title}</h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#183D2B]/70">
                        {feature.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
