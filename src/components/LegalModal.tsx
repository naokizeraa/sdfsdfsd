import { useEffect } from 'react';
import { X } from 'lucide-react';
import { productConfig } from '../config/productConfig';
import type { LegalDocType } from './Footer';

interface LegalModalProps {
  docType: LegalDocType | null;
  onClose: () => void;
}

export function LegalModal({ docType, onClose }: LegalModalProps) {
  useEffect(() => {
    if (!docType) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [docType, onClose]);

  if (!docType) return null;

  const isPrivacy = docType === 'privacy';
  const title = isPrivacy ? 'Política de Privacidade' : 'Termos de Uso';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2419]/65 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 text-[#183D2B] shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#183D2B]/10 pb-4">
          <h2 id="legal-modal-title" className="font-display text-2xl font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#183D2B]/70 transition-colors hover:bg-[#F5F0E6] hover:text-[#183D2B] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm leading-relaxed text-[#183D2B]/80">
          {isPrivacy ? (
            <>
              <p>
                Esta página respeita a privacidade dos visitantes e coleta apenas os dados
                estritamente necessários durante o processo de compra realizado na plataforma de
                checkout parceira.
              </p>
              <p>
                O endereço de e-mail informado no momento do pagamento é utilizado exclusivamente para
                o envio do link de acesso ao e-book <strong>{productConfig.name}</strong> e para
                comunicações relacionadas ao suporte ao comprador.
              </p>
              <p>
                Para dúvidas ou solicitações referentes a dados pessoais, entre em contato pelo
                e-mail <strong>{productConfig.contact.email}</strong>.
              </p>
            </>
          ) : (
            <>
              <p>
                Ao adquirir o e-book digital <strong>{productConfig.name}</strong>, o comprador
                recebe uma licença individual e intransferível de uso pessoal para leitura e
                consulta do arquivo em PDF.
              </p>
              <p>
                É proibida a reprodução integral, redistribuição comercial ou revenda não autorizada
                deste material digital.
              </p>
              <p>
                O conteúdo tem finalidade exclusivamente informativa e educativa, não substituindo
                acompanhamento médico ou nutricional profissional.
              </p>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end border-t border-[#183D2B]/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#183D2B] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#22523B] cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
