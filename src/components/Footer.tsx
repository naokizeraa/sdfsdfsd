import { productConfig } from '../config/productConfig';

export type LegalDocType = 'privacy' | 'terms';

interface FooterProps {
  onOpenLegal: (doc: LegalDocType) => void;
}

export function Footer({ onOpenLegal }: FooterProps) {
  return (
    <footer className="border-t border-white/10 bg-[#122E20] pt-12 pb-24 text-[#F5F0E6]/75 md:pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-8 md:flex-row md:items-center">
          <div>
            <p className="font-display text-lg font-semibold text-white">{productConfig.name}</p>
            <p className="mt-1 text-xs text-[#F5F0E6]/65">
              {productConfig.format} · Contato:{' '}
              <a
                href={`mailto:${productConfig.contact.email}`}
                className="underline decoration-white/30 underline-offset-4 hover:text-white"
              >
                {productConfig.contact.email}
              </a>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#F5F0E6]/80">
            <button
              type="button"
              onClick={() => onOpenLegal('privacy')}
              className="cursor-pointer transition-colors hover:text-white hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C7A66A]"
            >
              Política de Privacidade
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('terms')}
              className="cursor-pointer transition-colors hover:text-white hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C7A66A]"
            >
              Termos de Uso
            </button>
            <a
              href={`mailto:${productConfig.contact.email}`}
              className="transition-colors hover:text-white hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C7A66A]"
            >
              Contato
            </a>
          </div>
        </div>

        <div className="mt-8 space-y-3 text-xs leading-relaxed text-[#F5F0E6]/60">
          <p>
            <strong className="font-semibold text-[#F5F0E6]/80">Aviso Legal:</strong> O conteúdo
            do e-book &ldquo;{productConfig.name}&rdquo; possui caráter estritamente informativo e
            educativo sobre receitas naturais e preparações caseiras tradicionais. As informações
            apresentadas não constituem aconselhamento médico, diagnóstico, tratamento ou
            prescrição nutricional e não substituem a orientação de médicos, nutricionistas ou
            outros profissionais de saúde habilitados. Antes de utilizar qualquer ingrediente ou
            preparo, verifique possíveis alergias, sensibilidades ou contraindicações individuais.
          </p>
          <p>
            © {productConfig.legal.copyrightYear} {productConfig.legal.ownerName}. Todos os
            direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
