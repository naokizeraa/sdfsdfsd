import { motion } from 'motion/react';

const painPoints = [
  {
    number: '01',
    title: 'Receitas soltas e difíceis de organizar',
    description:
      'Você já salvou várias ideias em mensagens, cadernos ou redes sociais, mas na hora de preparar não lembra onde guardou ou qual passo seguir.',
  },
  {
    number: '02',
    title: 'Dúvidas sobre ingredientes e medidas',
    description:
      'Muitas instruções encontradas pela internet são incompletas, deixam dúvidas sobre como combinar ingredientes simples ou usam itens difíceis de achar.',
  },
  {
    number: '03',
    title: 'Vontade de aprender preparações caseiras com praticidade',
    description:
      'Existe o desejo de incorporar preparações naturais na rotina, mas falta um roteiro claro, direto e pensado para quem cozinha ou cuida da casa no dia a dia.',
  },
  {
    number: '04',
    title: 'Curiosidade por conhecimentos tradicionais',
    description:
      'Saberes antigos sobre ervas, infusões e misturas caseiras muitas vezes se perdem por falta de um material prático para consultar sempre que precisar.',
  },
];

export function ProblemSection() {
  return (
    <section id="identificacao" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <p className="text-xs font-semibold tracking-[0.14em] text-[#527A50] uppercase">
              Identificação
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight font-semibold tracking-tight text-[#183D2B] sm:text-4xl [text-wrap:balance]">
              Você já quis incluir hábitos mais naturais na rotina, mas não sabia por onde começar?
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#183D2B]/75">
              Entre tantas informações soltas e receitas contraditórias, é comum sentir que falta um
              guia simples, bem estruturado e confiável para consultar no momento em que a vontade
              de preparar algo caseiro surge.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-7">
            {painPoints.map((item, idx) => (
              <motion.article
                key={item.number}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col justify-between rounded-2xl border border-[#183D2B]/10 bg-[#F5F0E6]/60 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#527A50]/45 hover:bg-[#F5F0E6]"
              >
                <div>
                  <span className="font-display text-sm font-semibold text-[#C7A66A] tabular-nums">
                    {item.number}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-[#183D2B]">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#183D2B]/75">
                    {item.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
