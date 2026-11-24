import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { productConfig } from '../config/productConfig';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    id: 'recebimento',
    question: 'Como vou receber meu livro?',
    answer:
      'Após a confirmação do pagamento pela plataforma de checkout, você receberá no e-mail informado na compra as instruções e o link para fazer o download do arquivo digital.',
  },
  {
    id: 'formato',
    question: 'O livro é físico ou digital?',
    answer:
      'O produto é 100% digital, entregue em formato PDF. Nenhum exemplar impresso é enviado pelos Correios, o que permite acesso imediato e sem custos de frete.',
  },
  {
    id: 'celular',
    question: 'Posso acessar pelo celular?',
    answer:
      'Sim. Como o guia está em formato PDF, você pode abrir e ler diretamente no celular, tablet, notebook ou computador, inclusive salvando o arquivo para consultar sem internet.',
  },
  {
    id: 'aplicativo',
    question: 'Preciso ter algum aplicativo específico?',
    answer:
      'Não. A maioria dos celulares e navegadores modernos já abre arquivos PDF nativamente. Caso prefira, também é possível utilizar qualquer leitor de PDF gratuito de sua preferência.',
  },
  {
    id: 'pagamento',
    question: 'Como faço o pagamento?',
    answer: `O investimento promocional atual é de ${productConfig.pricing.currentPrice} (de ${productConfig.pricing.previousPrice}), com pagamento exclusivo via Pix. Basta preencher seus dados, gerar o QR Code ou código Pix Copia e Cola e confirmar no aplicativo do seu banco.`,
  },
  {
    id: 'acesso-imediato',
    question: 'Receberei o acesso imediatamente?',
    answer:
      'Sim. Como o pagamento é realizado via Pix, a compensação acontece em poucos segundos e a confirmação de acesso é liberada logo após a aprovação da transação.',
  },
  {
    id: 'quantidade',
    question: 'O livro possui quantas receitas?',
    answer:
      'O e-book reúne 100 receitas naturais e caseiras, distribuídas por categorias temáticas para facilitar a busca e a consulta no dia a dia.',
  },
  {
    id: 'medico',
    question: 'As receitas substituem tratamentos médicos?',
    answer:
      'Não. O conteúdo do e-book tem caráter exclusivamente informativo, cultural e educativo. Ele não substitui consultas, diagnósticos, prescrições ou orientações de médicos, nutricionistas ou outros profissionais de saúde.',
  },
];

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(faqItems[0].id);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="bg-[#F5F0E6] py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#527A50] uppercase">
            Perguntas Frequentes
          </p>
          <h2 className="mt-3 font-display text-3xl leading-tight font-semibold tracking-tight text-[#183D2B] sm:text-4xl [text-wrap:balance]">
            Tire suas dúvidas antes de adquirir o guia
          </h2>
        </div>

        <div className="mt-12 divide-y divide-[#183D2B]/12 rounded-2xl border border-[#183D2B]/10 bg-white px-6 sm:px-8">
          {faqItems.map((item) => {
            const isOpen = openId === item.id;
            const panelId = `faq-panel-${item.id}`;
            const buttonId = `faq-btn-${item.id}`;

            return (
              <div key={item.id} className="py-5">
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleItem(item.id)}
                  className="flex w-full items-center justify-between gap-4 py-1 text-left font-display text-base font-semibold text-[#183D2B] transition-colors hover:text-[#527A50] cursor-pointer sm:text-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183D2B]"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#527A50] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="mt-3 pr-8 text-sm leading-relaxed text-[#183D2B]/75 sm:text-base"
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
