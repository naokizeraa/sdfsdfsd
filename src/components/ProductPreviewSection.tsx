import { useState } from 'react';
import { BookOpen, List } from 'lucide-react';
import { motion } from 'motion/react';
import { PRODUCT_IMAGES, productConfig } from '../config/productConfig';
import { SafeImage } from './SafeImage';

type PreviewTabId = 'indice' | 'receita' | 'ingredientes';

interface PreviewTab {
  id: PreviewTabId;
  label: string;
  pageNumber: string;
  sectionTitle: string;
}

const previewTabs: PreviewTab[] = [
  {
    id: 'indice',
    label: 'Índice Organizado',
    pageNumber: 'Pág. 04',
    sectionTitle: 'Sumário por Categorias',
  },
  {
    id: 'receita',
    label: 'Modelo de Receita',
    pageNumber: 'Pág. 28',
    sectionTitle: 'Estrutura Passo a Passo',
  },
  {
    id: 'ingredientes',
    label: 'Notas de Uso',
    pageNumber: 'Pág. 12',
    sectionTitle: 'Orientações de Preparo',
  },
];

export function ProductPreviewSection() {
  const [activeTab, setActiveTab] = useState<PreviewTabId>('receita');

  const currentTab = previewTabs.find((t) => t.id === activeTab) ?? previewTabs[1];

  return (
    <section id="visualizacao" className="forest-depth bg-[#183D2B] py-20 text-white sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#C7A66A] uppercase">
              Visualização do Produto
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight font-semibold tracking-tight text-white sm:text-4xl [text-wrap:balance]">
              Conheça o padrão de organização e leitura do seu livro digital
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#F5F0E6]/80">
            Diagramação limpa, tipografia confortável para telas e fichas padronizadas para que você
            localize ingredientes e instruções sem esforço.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-between rounded-3xl border border-[#C7A66A]/25 bg-white/5 p-5 lg:col-span-4">
            <div className="overflow-hidden rounded-2xl bg-[#0F291C]">
              <SafeImage
                src={PRODUCT_IMAGES.heroMockup}
                alt="Capa em perspectiva 3D do livro A Farmácia da Floresta — 100 Receitas Naturais"
                className="aspect-square w-full object-cover"
                aspectClassName="aspect-square"
              />
            </div>
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="font-display text-lg font-medium text-white">{productConfig.name}</p>
              <p className="mt-1 text-xs text-[#F5F0E6]/70">
                {productConfig.subtitle} · Capa ilustrada e páginas internas estruturadas em PDF
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-3xl border border-white/12 bg-[#F5F0E6] p-5 text-[#183D2B] sm:p-7 lg:col-span-8">
            <div>
              <div className="flex flex-col justify-between gap-4 border-b border-[#183D2B]/12 pb-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-[#527A50] uppercase">
                    Exemplo ilustrativo de páginas internas
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold text-[#183D2B]">
                    {currentTab.sectionTitle}
                  </p>
                </div>

                <div
                  role="tablist"
                  aria-label="Visualização das páginas do e-book"
                  className="inline-flex flex-wrap gap-1 rounded-xl bg-[#183D2B]/8 p-1"
                >
                  {previewTabs.map((tab) => {
                    const isActive = tab.id === activeTab;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveTab(tab.id)}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#183D2B] ${
                          isActive
                            ? 'bg-[#183D2B] text-white shadow-sm'
                            : 'text-[#183D2B]/75 hover:text-[#183D2B]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 rounded-2xl border border-[#183D2B]/10 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="flex items-center justify-between border-b border-[#183D2B]/10 pb-3 text-xs text-[#183D2B]/55">
                  <span>
                    {productConfig.name} · {productConfig.subtitle}
                  </span>
                  <span className="font-medium tabular-nums">{currentTab.pageNumber}</span>
                </div>

                {activeTab === 'indice' && (
                  <div className="mt-6 space-y-5">
                    <div className="flex items-center gap-2.5 text-[#527A50]">
                      <List className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <h3 className="font-display text-lg font-semibold text-[#183D2B]">
                        Organização dos Capítulos
                      </h3>
                    </div>
                    <div className="divide-y divide-[#183D2B]/8 text-sm">
                      {[
                        {
                          cap: 'Capítulo 01',
                          name: 'Receitas com Ervas e Plantas',
                          range: 'Receitas 01 – 20',
                        },
                        {
                          cap: 'Capítulo 02',
                          name: 'Preparações Naturais Tradicionais',
                          range: 'Receitas 21 – 40',
                        },
                        {
                          cap: 'Capítulo 03',
                          name: 'Bebidas e Infusões Aromáticas',
                          range: 'Receitas 41 – 60',
                        },
                        {
                          cap: 'Capítulo 04',
                          name: 'Ingredientes do Dia a Dia',
                          range: 'Receitas 61 – 80',
                        },
                        {
                          cap: 'Capítulo 05',
                          name: 'Preparações para Rotina de Bem-Estar',
                          range: 'Receitas 81 – 100',
                        },
                      ].map((row) => (
                        <div
                          key={row.cap}
                          className="flex flex-wrap items-center justify-between gap-2 py-3"
                        >
                          <div>
                            <span className="text-xs font-semibold text-[#C7A66A]">{row.cap}</span>
                            <p className="font-medium text-[#183D2B]">{row.name}</p>
                          </div>
                          <span className="text-xs font-medium text-[#183D2B]/65 tabular-nums">
                            {row.range}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'receita' && (
                  <div className="mt-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold tracking-wider text-[#C7A66A] uppercase">
                        Modelo de Ficha · Exemplo Ilustrativo
                      </span>
                      <span className="text-xs text-[#183D2B]/60 tabular-nums">
                        Preparo estimado: 10 min
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-[#183D2B]">
                      Infusão Aromática de Camomila com Hortelã
                    </h3>
                    <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="rounded-xl bg-[#F5F0E6]/70 p-4">
                        <p className="text-xs font-semibold tracking-wider text-[#183D2B] uppercase">
                          Ingredientes
                        </p>
                        <ul className="mt-3 space-y-2 text-sm text-[#183D2B]/80">
                          <li>· 1 colher (chá) de flores secas de camomila</li>
                          <li>· 4 folhas frescas de hortelã higienizadas</li>
                          <li>· 250 ml de água filtrada aquecida</li>
                          <li>· 1 rodela fina de casca de limão (opcional)</li>
                        </ul>
                      </div>
                      <div className="rounded-xl bg-[#F5F0E6]/70 p-4">
                        <p className="text-xs font-semibold tracking-wider text-[#183D2B] uppercase">
                          Modo de Preparo
                        </p>
                        <ol className="mt-3 space-y-2 text-sm text-[#183D2B]/80">
                          <li>
                            1. Aqueça a água até iniciar pequenas bolhas, sem ferver em excesso.
                          </li>
                          <li>2. Coloque as ervas em uma xícara ou bule e despeje a água.</li>
                          <li>3. Tampe e aguarde de 5 a 7 minutos antes de coar e servir.</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'ingredientes' && (
                  <div className="mt-6 space-y-5">
                    <div className="flex items-center gap-2.5 text-[#527A50]">
                      <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <h3 className="font-display text-lg font-semibold text-[#183D2B]">
                        Padrão de Clareza nas Instruções
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-[#183D2B]/10 p-4">
                        <p className="text-sm font-semibold text-[#183D2B]">Medidas Caseiras</p>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#183D2B]/75">
                          Indicações em colheres, xícaras e unidades simples para dispensar balanças
                          ou equipamentos complexos.
                        </p>
                      </div>
                      <div className="rounded-xl border border-[#183D2B]/10 p-4">
                        <p className="text-sm font-semibold text-[#183D2B]">
                          Higiene e Armazenamento
                        </p>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#183D2B]/75">
                          Lembretes práticos sobre higienização de folhas frescas, recipientes limpos
                          e conservação adequada.
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#F5F0E6] p-4 text-xs leading-relaxed text-[#183D2B]/80">
                      <p>
                        <strong className="font-semibold text-[#183D2B]">Observação visual:</strong>{' '}
                        As páginas acima ilustram a forma de apresentação e a clareza editorial do
                        material digital.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            <p className="mt-4 text-xs text-[#183D2B]/65">
              Compatível com leitores de PDF em Android, iOS, Windows, macOS e tablets.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
