import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { PRODUCT_IMAGES } from '../config/productConfig';
import { SafeImage } from './SafeImage';

interface CategoryItem {
  id: string;
  index: string;
  title: string;
  description: string;
  examples: string[];
  image: string;
  alt: string;
  featured: boolean;
}

const categories: CategoryItem[] = [
  {
    id: 'ervas-plantas',
    index: '01',
    title: 'Receitas com ervas e plantas',
    description:
      'Combinações clássicas com alecrim, camomila, hortelã, erva-cidreira, sálvia e outras folhas aromáticas fáceis de encontrar.',
    examples: ['Infusão de camomila com erva-doce', 'Mistura aromática de alecrim e hortelã', 'Guia de preparo com folhas frescas e secas'],
    image: PRODUCT_IMAGES.catErvasPlantas,
    alt: 'Ervas aromáticas frescas como alecrim, sálvia, hortelã e louro amarradas com fio natural sobre mesa de madeira',
    featured: true,
  },
  {
    id: 'tradicionais',
    index: '02',
    title: 'Preparações naturais tradicionais',
    description:
      'Métodos caseiros inspirados em costumes populares, como macerações simples, extratos suaves e misturas aromáticas.',
    examples: ['Xaropes caseiros tradicionais com mel e gengibre', 'Óleos aromáticos macerados a frio', 'Cuidados de preparo e envase em vidro limpo'],
    image: PRODUCT_IMAGES.catTradicionais,
    alt: 'Frascos de vidro âmbar, flores secas de lavanda e calêndula ao lado de pilão de pedra sobre linho claro',
    featured: true,
  },
  {
    id: 'bebidas-infusoes',
    index: '03',
    title: 'Bebidas e infusões',
    description:
      'Chás reconfortantes, águas aromatizadas e bebidas quentes ou refrescantes para diferentes momentos do dia.',
    examples: ['Chá noturno de mulungu e camomila', 'Água aromatizada cítrica com hortelã', 'Infusão matinal de gengibre e limão'],
    image: PRODUCT_IMAGES.catBebidasInfusoes,
    alt: 'Bule de vidro servindo infusão dourada de camomila e gengibre em xícara de cerâmica com folhas de hortelã e mel',
    featured: false,
  },
  {
    id: 'dia-a-dia',
    index: '04',
    title: 'Receitas com ingredientes encontrados no dia a dia',
    description:
      'Preparações práticas que aproveitam itens comuns da despensa, como aveia, mel, limão, gengibre, cúrcuma e azeite.',
    examples: ['Pasta cremosa de aveia e mel', 'Preparos rápidos com cúrcuma e pimenta-do-reino', 'Combinações simples com frutas e especiarias'],
    image: PRODUCT_IMAGES.catDiaADia,
    alt: 'Ingredientes cotidianos como aveia, mel, limão, cúrcuma, gengibre e azeite dispostos sobre bancada clara',
    featured: false,
  },
  {
    id: 'rotina-bem-estar',
    index: '05',
    title: 'Preparações caseiras para a rotina de bem-estar',
    description:
      'Sugestões acolhedoras de cuidados simples em casa para momentos de pausa, descanso e organização da sua rotina.',
    examples: ['Sais aromáticos com pétalas secas', 'Escaldas-pés com ervas para o fim do dia', 'Rituais noturnos sem ingredientes complexos'],
    image: PRODUCT_IMAGES.catRotinaBemEstar,
    alt: 'Tigela artesanal com sais e pétalas secas, óleo vegetal em frasco de vidro, toalha dobrada e ramo de eucalipto',
    featured: false,
  },
];

export function CategoriesSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const topCategories = categories.slice(0, 2);
  const bottomCategories = categories.slice(2);

  const renderCard = (cat: CategoryItem, idx: number, large: boolean) => {
    const isExpanded = expandedId === cat.id;

    return (
      <motion.article
        key={cat.id}
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.4, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
        className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#183D2B]/10 bg-[#F5F0E6]/45 transition-all duration-200 hover:border-[#527A50]/45 hover:bg-[#F5F0E6]/80"
      >
        <div>
          <div className="overflow-hidden bg-[#EAE3D4]">
            <SafeImage
              src={cat.image}
              alt={cat.alt}
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              aspectClassName="aspect-[4/3]"
            />
          </div>
          <div className={large ? 'p-6 sm:p-7' : 'p-6'}>
            <span className="text-xs font-semibold tracking-wider text-[#C7A66A] tabular-nums">
              CATEGORIA {cat.index}
            </span>
            <h3
              className={`mt-1.5 font-display font-semibold text-[#183D2B] ${
                large ? 'text-xl sm:text-2xl' : 'text-lg leading-snug'
              }`}
            >
              {cat.title}
            </h3>
            <p
              className={`mt-2.5 leading-relaxed text-[#183D2B]/75 ${
                large ? 'text-sm sm:text-base' : 'text-sm'
              }`}
            >
              {cat.description}
            </p>
          </div>
        </div>

        <div className={`border-t border-[#183D2B]/10 ${large ? 'px-6 py-4 sm:px-7' : 'px-6 py-3.5'}`}>
          <button
            type="button"
            aria-expanded={isExpanded}
            onClick={() => setExpandedId((prev) => (prev === cat.id ? null : cat.id))}
            className="flex w-full items-center justify-between text-xs font-semibold text-[#183D2B] transition-colors hover:text-[#527A50] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183D2B]"
          >
            <span>{isExpanded ? 'Ocultar exemplos' : 'Ver exemplos desta categoria'}</span>
            <ChevronDown
              className={`h-4 w-4 text-[#527A50] transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {isExpanded && (
            <ul className="mt-3 space-y-1.5 border-t border-[#183D2B]/8 pt-3 text-xs leading-relaxed text-[#183D2B]/80">
              {cat.examples.map((ex) => (
                <li key={ex}>· {ex}</li>
              ))}
            </ul>
          )}
        </div>
      </motion.article>
    );
  };

  return (
    <section id="categorias" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#527A50] uppercase">
            O Que Você Vai Encontrar
          </p>
          <h2 className="mt-3 font-display text-3xl leading-tight font-semibold tracking-tight text-[#183D2B] sm:text-4xl [text-wrap:balance]">
            Categorias organizadas para explorar no seu ritmo
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#183D2B]/75">
            Cada capítulo reúne preparações descritas de forma direta, com foco em ingredientes
            conhecidos e instruções acessíveis para o uso cotidiano.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {topCategories.map((cat, idx) => renderCard(cat, idx, true))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {bottomCategories.map((cat, idx) => renderCard(cat, idx + 2, false))}
        </div>
      </div>
    </section>
  );
}
