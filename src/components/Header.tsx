import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { productConfig } from '../config/productConfig';
import { CheckoutButton } from './CheckoutButton';

interface HeaderProps {
  onCheckoutFallback: () => void;
}

const navLinks = [
  { href: '#solucao', label: 'O Guia' },
  { href: '#categorias', label: 'Categorias' },
  { href: '#visualizacao', label: 'Por Dentro' },
  { href: '#oferta', label: 'Oferta' },
  { href: '#faq', label: 'Dúvidas' },
];

export function Header({ onCheckoutFallback }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full border-b border-[#183D2B]/10 bg-[#F5F0E6]/95 backdrop-blur-md md:sticky md:top-0 md:z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        <a
          href="#topo"
          className="font-display text-lg font-semibold tracking-tight text-[#183D2B] whitespace-nowrap shrink-0 sm:text-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183D2B]"
        >
          {productConfig.name}
        </a>

        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#183D2B]/80"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#183D2B] hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183D2B]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:block">
            <CheckoutButton
              label="Quero meu guia"
              variant="header"
              onFallbackTrigger={onCheckoutFallback}
            />
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#183D2B]/15 bg-white text-[#183D2B] transition-colors hover:bg-[#183D2B]/5 cursor-pointer md:hidden focus-visible:outline-2 focus-visible:outline-[#183D2B]"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="border-t border-[#183D2B]/10 bg-white px-4 py-4 md:hidden"
        >
          <nav aria-label="Menu móvel" className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#183D2B] transition-colors hover:bg-[#F5F0E6]"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 border-t border-[#183D2B]/10 pt-3">
            <CheckoutButton
              label={`Garantir por ${productConfig.pricing.currentPrice}`}
              variant="primary"
              fullWidth
              onFallbackTrigger={() => {
                setMobileMenuOpen(false);
                onCheckoutFallback();
              }}
            />
          </div>
        </div>
      )}
    </header>
  );
}
