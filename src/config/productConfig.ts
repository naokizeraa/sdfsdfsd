/**
 * Configuração centralizada do produto digital.
 * Edite este arquivo para atualizar o link único de checkout, valores,
 * order bumps, prazo de garantia, bônus opcionais, depoimentos e contato.
 */

export const CHECKOUT_URL = '/checkout';

export interface OrderBumpItem {
  id: 'whatsapp' | 'vigor' | 'sono' | 'energia';
  title: string;
  description: string;
  priceCents: number;
  priceLabel: string;
  requiresWhatsapp?: boolean;
}

export interface BonusItem {
  id: string;
  title: string;
  format: string;
  description: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  location?: string;
  avatarUrl?: string;
  quote: string;
  rating: number;
}

export interface ProductConfig {
  name: string;
  subtitle: string;
  format: string;
  checkoutUrl: string;
  pricing: {
    basePriceCents: number;
    previousPrice: string;
    currentPrice: string;
    savingsLabel: string;
    bumpPriceCents: number;
    allBumpsBundleCents: number;
    paymentNote: string;
  };
  orderBumps: OrderBumpItem[];
  guarantee: {
    daysLabel: string;
    description: string;
  };
  contact: {
    email: string;
    supportHours: string;
  };
  legal: {
    copyrightYear: string;
    ownerName: string;
  };
  bonuses: BonusItem[];
  testimonials: TestimonialItem[];
}

export const PRODUCT_IMAGES = {
  heroMockup: '/assets/aistudio/Book_mockup_of_natural_medicine_2974b5e2_63428f16.jpg',
  promotionalBanner: '/assets/aistudio/Forest_pharmacy_digital_advertis__567a2ebd_92decc9f.jpg',
  catErvasPlantas: '/src/assets/images/category_ervas_plantas_1795536516982.jpg',
  catTradicionais: '/src/assets/images/category_tradicionais_1795536518319.jpg',
  catBebidasInfusoes: '/src/assets/images/category_bebidas_infusoes_1795536518296.jpg',
  catDiaADia: '/src/assets/images/category_dia_a_dia_1795536518738.jpg',
  catRotinaBemEstar: '/src/assets/images/category_rotina_bem_estar_1795536519622.jpg',
} as const;

export const productConfig: ProductConfig = {
  name: 'A Farmácia da Floresta',
  subtitle: '100 Receitas Naturais',
  format: 'E-book Digital em PDF',
  checkoutUrl: CHECKOUT_URL,
  pricing: {
    basePriceCents: 1990,
    previousPrice: 'R$ 49,90',
    currentPrice: 'R$ 19,90',
    savingsLabel: 'Economia de R$ 30,00 nesta edição',
    bumpPriceCents: 990,
    allBumpsBundleCents: 2000,
    paymentNote: 'Pagamento único via Pix em ambiente seguro, com liberação imediata do PDF.',
  },
  orderBumps: [
    {
      id: 'whatsapp',
      title: 'Receba pelo WhatsApp',
      description: 'Receba imediatamente direto no seu whatsapp, totalmente automático',
      priceCents: 990,
      priceLabel: 'R$ 9,90',
      requiresWhatsapp: true,
    },
    {
      id: 'vigor',
      title: '9 Plantas para Recuperar o Vigor',
      description:
        'O que o interior brasileiro sempre soube sobre vigor, e que a ciência foi confirmar',
      priceCents: 990,
      priceLabel: 'R$ 9,90',
    },
    {
      id: 'sono',
      title: '5 Receitas da roça para dormir tranquilo',
      description:
        'O ritual noturno do homem do campo que garante sono profundo e recuperação real',
      priceCents: 990,
      priceLabel: 'R$ 9,90',
    },
    {
      id: 'energia',
      title: '7 Receitas para energia e disposição',
      description:
        'O que o homem do interior come antes do sol nascer pra ter energia o dia todo',
      priceCents: 990,
      priceLabel: 'R$ 9,90',
    },
  ],
  guarantee: {
    daysLabel: '14 dias',
    description:
      'Você tem 14 dias a partir da data da compra para explorar o guia com tranquilidade. Se perceber que o material não atende ao que procura dentro desse prazo, basta solicitar o reembolso integral pelo nosso e-mail de suporte.',
  },
  contact: {
    email: 'contato@100receitasnaturais.com.br',
    supportHours: 'Atendimento por e-mail em dias úteis',
  },
  legal: {
    copyrightYear: '2026',
    ownerName: 'A Farmácia da Floresta · 100 Receitas Naturais',
  },
  bonuses: [],
  testimonials: [],
};

export function formatBrlFromCents(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function isConfiguredExternalCheckout(url: string): boolean {
  return /^https?:\/\//i.test(url.trim());
}
