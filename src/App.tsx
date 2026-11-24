/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { BannerSection } from './components/BannerSection';
import { BenefitsSection } from './components/BenefitsSection';
import { BonusesSection } from './components/BonusesSection';
import { CategoriesSection } from './components/CategoriesSection';
import { CheckoutPage } from './components/CheckoutPage';
import { FaqSection } from './components/FaqSection';
import { FinalCtaSection } from './components/FinalCtaSection';
import { Footer, type LegalDocType } from './components/Footer';
import { GuaranteeSection } from './components/GuaranteeSection';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { LegalModal } from './components/LegalModal';
import { MobileFloatingCta } from './components/MobileFloatingCta';
import { OfferSection } from './components/OfferSection';
import { ProblemSection } from './components/ProblemSection';
import { ProductPreviewSection } from './components/ProductPreviewSection';
import { SolutionSection } from './components/SolutionSection';
import { TestimonialsSection } from './components/TestimonialsSection';

function isCheckoutPath(pathname: string): boolean {
  return pathname.replace(/\/+$/, '') === '/checkout';
}

export default function App() {
  const [legalDoc, setLegalDoc] = useState<LegalDocType | null>(null);
  const [isCheckoutView, setIsCheckoutView] = useState<boolean>(() =>
    typeof window !== 'undefined' ? isCheckoutPath(window.location.pathname) : false
  );

  useEffect(() => {
    const handlePopState = () => {
      setIsCheckoutView(isCheckoutPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToCheckout = () => {
    if (!isCheckoutPath(window.location.pathname)) {
      window.history.pushState({}, '', '/checkout');
    }
    setIsCheckoutView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    if (isCheckoutPath(window.location.pathname)) {
      window.history.pushState({}, '', '/');
    }
    setIsCheckoutView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isCheckoutView) {
    return (
      <MotionConfig reducedMotion="user">
        <CheckoutPage onBack={navigateToHome} />
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#F5F0E6] text-[#183D2B]">
        <Header onCheckoutFallback={navigateToCheckout} />

        <main>
          <HeroSection onCheckoutFallback={navigateToCheckout} />
          <BannerSection onCheckoutFallback={navigateToCheckout} />
          <ProblemSection />
          <SolutionSection />
          <CategoriesSection />
          <ProductPreviewSection />
          <BenefitsSection />
          <OfferSection onCheckoutFallback={navigateToCheckout} />
          <BonusesSection />
          <TestimonialsSection />
          <GuaranteeSection />
          <FaqSection />
          <FinalCtaSection onCheckoutFallback={navigateToCheckout} />
        </main>

        <Footer onOpenLegal={(doc) => setLegalDoc(doc)} />

        <MobileFloatingCta onCheckoutFallback={navigateToCheckout} />

        <LegalModal docType={legalDoc} onClose={() => setLegalDoc(null)} />
      </div>
    </MotionConfig>
  );
}
