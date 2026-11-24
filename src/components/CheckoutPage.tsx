import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Lock,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  QrCode,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Star,
  User,
  Wallet,
} from 'lucide-react';
import {
  PRODUCT_IMAGES,
  formatBrlFromCents,
  productConfig,
  type OrderBumpItem,
} from '../config/productConfig';
import { SafeImage } from './SafeImage';

interface CheckoutPageProps {
  onBack: () => void;
}

type CheckoutStep = 'form' | 'pix' | 'paid';
type BumpId = OrderBumpItem['id'];

interface PixOrderSession {
  transactionId: string;
  accessToken: string;
  amount: number;
  copyPaste: string;
  qrCodeImage: string | null;
}

const BUMP_THUMBNAILS: Record<Exclude<BumpId, 'whatsapp'>, string> = {
  vigor: PRODUCT_IMAGES.catErvasPlantas,
  sono: PRODUCT_IMAGES.catRotinaBemEstar,
  energia: PRODUCT_IMAGES.catBebidasInfusoes,
};

function formatWhatsappMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function CheckoutPage({ onBack }: CheckoutPageProps) {
  const [step, setStep] = useState<CheckoutStep>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedBumps, setSelectedBumps] = useState<BumpId[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  const [pixSession, setPixSession] = useState<PixOrderSession | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const autoDownloadedRef = useRef(false);
  const whatsappInputRef = useRef<HTMLInputElement | null>(null);

  const allBumpIds = useMemo(
    () => productConfig.orderBumps.map((bump) => bump.id),
    []
  );
  const allBumpsSelected = selectedBumps.length === allBumpIds.length;
  const whatsappSelected = selectedBumps.includes('whatsapp');

  const pricingBreakdown = useMemo(() => {
    const baseCents = productConfig.pricing.basePriceCents;
    const count = selectedBumps.length;
    const rawBumpsCents = count * productConfig.pricing.bumpPriceCents;
    const finalBumpsCents =
      count >= allBumpIds.length ? productConfig.pricing.allBumpsBundleCents : rawBumpsCents;
    const bundleApplied = count >= allBumpIds.length;
    const totalCents = baseCents + finalBumpsCents;

    return {
      baseCents,
      rawBumpsCents,
      finalBumpsCents,
      bundleApplied,
      totalCents,
      bundleSavingsCents: bundleApplied ? rawBumpsCents - finalBumpsCents : 0,
    };
  }, [selectedBumps, allBumpIds.length]);

  const toggleBump = (id: BumpId) => {
    setErrorMessage(null);
    setSelectedBumps((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllBumps = () => {
    setErrorMessage(null);
    if (allBumpsSelected) {
      setSelectedBumps([]);
    } else {
      setSelectedBumps([...allBumpIds]);
    }
  };

  const triggerAutomaticDownload = useCallback((url: string) => {
    if (autoDownloadedRef.current) return;
    autoDownloadedRef.current = true;
    const link = document.createElement('a');
    link.href = url;
    link.download = '500-Receitas-Naturais-A-Farmacia-da-Floresta.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const verifyPaymentStatus = useCallback(
    async (session: PixOrderSession, manual = false) => {
      if (manual) setIsCheckingStatus(true);
      try {
        const res = await fetch(
          `/api/pix/check/${encodeURIComponent(session.transactionId)}`,
          {
            headers: {
              'x-order-token': session.accessToken,
            },
          }
        );
        const data = (await res.json().catch(() => ({}))) as {
          status?: string;
          downloadUrl?: string | null;
          error?: string;
        };

        if (!res.ok) {
          if (manual && data.error) setErrorMessage(data.error);
          return;
        }

        if (data.status === 'COMPLETO' && data.downloadUrl) {
          setDownloadUrl(data.downloadUrl);
          setStep('paid');
          setErrorMessage(null);
          triggerAutomaticDownload(data.downloadUrl);
        } else if (data.status === 'FALHA') {
          setErrorMessage('Esta cobrança Pix expirou ou foi cancelada. Gere um novo código.');
        } else if (manual) {
          setErrorMessage(
            'Pagamento ainda não compensado. Se você já concluiu o Pix, aguarde alguns segundos e tente novamente.'
          );
        }
      } catch {
        if (manual) {
          setErrorMessage('Não foi possível verificar o status agora. Tente novamente.');
        }
      } finally {
        if (manual) setIsCheckingStatus(false);
      }
    },
    [triggerAutomaticDownload]
  );

  useEffect(() => {
    if (step !== 'pix' || !pixSession) return;
    const intervalId = window.setInterval(() => {
      void verifyPaymentStatus(pixSession, false);
    }, 3000);
    return () => window.clearInterval(intervalId);
  }, [step, pixSession, verifyPaymentStatus]);

  const handleGeneratePix = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const whatsappDigits = whatsapp.replace(/\D/g, '');

    if (trimmedName.length < 2) {
      setErrorMessage('Informe seu nome completo para continuar.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage('Informe um endereço de e-mail válido para receber seu acesso.');
      return;
    }

    if (whatsappSelected && (whatsappDigits.length < 10 || whatsappDigits.length > 11)) {
      setErrorMessage(
        'Preencha seu Celular (WhatsApp) com DDD em Dados Pessoais para receber o envio automático.'
      );
      whatsappInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/pix/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          whatsapp: whatsappSelected ? whatsappDigits : undefined,
          selectedBumps,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        transactionId?: string;
        accessToken?: string;
        status?: string;
        amount?: number;
        copyPaste?: string;
        qrCodeImage?: string | null;
        downloadUrl?: string | null;
        error?: string;
      };

      if (!response.ok || !payload.transactionId || !payload.accessToken) {
        setErrorMessage(
          payload.error ?? 'Não foi possível gerar o código Pix neste momento. Tente novamente.'
        );
        return;
      }

      autoDownloadedRef.current = false;
      setPixSession({
        transactionId: payload.transactionId,
        accessToken: payload.accessToken,
        amount: payload.amount ?? pricingBreakdown.totalCents / 100,
        copyPaste: payload.copyPaste ?? '',
        qrCodeImage: payload.qrCodeImage ?? null,
      });

      if (payload.status === 'COMPLETO' && payload.downloadUrl) {
        setDownloadUrl(payload.downloadUrl);
        setStep('paid');
        triggerAutomaticDownload(payload.downloadUrl);
      } else {
        setStep('pix');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrorMessage('Falha de conexão ao gerar seu Pix. Verifique sua internet e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPix = async () => {
    if (!pixSession?.copyPaste) return;
    try {
      await navigator.clipboard.writeText(pixSession.copyPaste);
      setCopiedPix(true);
      window.setTimeout(() => setCopiedPix(false), 3000);
    } catch {
      setErrorMessage('Selecione e copie o código Pix manualmente.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] text-[#0F2A33]">
      {/* Faixa superior discreta */}
      <div className="relative h-12 w-full overflow-hidden bg-[#183D2B] sm:h-14">
        <SafeImage
          src={PRODUCT_IMAGES.promotionalBanner}
          alt={productConfig.name}
          className="h-full w-full object-cover opacity-35"
          priority
        />
        <div className="absolute inset-0 mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25 cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Voltar</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-white/95 sm:text-sm">
            <Lock className="h-3.5 w-3.5 text-[#C7A66A]" aria-hidden="true" />
            <span className="whitespace-nowrap">Compra 100% Segura</span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          {/* Coluna Esquerda: Formulário / Pix / Download */}
          <div className="lg:col-span-8">
            {step === 'form' && (
              <form
                onSubmit={handleGeneratePix}
                noValidate
                className="rounded-2xl border border-[#DCE5EA] bg-white p-5 shadow-[0_10px_30px_-15px_rgba(15,42,51,0.12)] sm:p-8"
              >
                {/* Bloco Dados Pessoais */}
                <div>
                  <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#0F2A33]">
                    <User className="h-4 w-4 text-[#183D2B]" aria-hidden="true" />
                    <h1>DADOS PESSOAIS</h1>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="checkout-name"
                        className="mb-1.5 block text-xs font-bold text-[#0F2A33]"
                      >
                        Nome Completo
                      </label>
                      <div className="relative">
                        <User
                          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A8F99]"
                          aria-hidden="true"
                        />
                        <input
                          id="checkout-name"
                          type="text"
                          required
                          autoComplete="name"
                          placeholder="Sem abreviações"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-xl border border-[#DCE5EA] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[#0F2A33] placeholder:text-[#98A8B0] focus:border-[#183D2B] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-email"
                        className="mb-1.5 block text-xs font-bold text-[#0F2A33]"
                      >
                        E-Mail
                      </label>
                      <div className="relative">
                        <Mail
                          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A8F99]"
                          aria-hidden="true"
                        />
                        <input
                          id="checkout-email"
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="Principal E-Mail"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-[#DCE5EA] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[#0F2A33] placeholder:text-[#98A8B0] focus:border-[#183D2B] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-whatsapp"
                        className="mb-1.5 block text-xs font-bold text-[#0F2A33]"
                      >
                        Celular (WhatsApp){whatsappSelected ? ' *' : ''}
                      </label>
                      <div className="relative">
                        <Phone
                          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A8F99]"
                          aria-hidden="true"
                        />
                        <input
                          ref={whatsappInputRef}
                          id="checkout-whatsapp"
                          type="tel"
                          inputMode="tel"
                          required={whatsappSelected}
                          placeholder="WhatsApp"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(formatWhatsappMask(e.target.value))}
                          className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-sm tabular-nums text-[#0F2A33] placeholder:text-[#98A8B0] focus:border-[#183D2B] focus:outline-none ${
                            whatsappSelected && whatsapp.replace(/\D/g, '').length < 10
                              ? 'border-[#16A34A]'
                              : 'border-[#DCE5EA]'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divisor */}
                <div className="my-7 border-t border-[#E6EDF1]" />

                {/* Bloco Pagamento (Somente Pix) */}
                <div>
                  <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#0F2A33]">
                    <Wallet className="h-4 w-4 text-[#183D2B]" aria-hidden="true" />
                    <h2>PAGAMENTO</h2>
                  </div>

                  <div className="mb-4 inline-flex min-w-[180px] flex-col items-center justify-center rounded-xl border-2 border-[#0F2A33] bg-white px-6 py-4 text-center shadow-xs">
                    <QrCode className="mb-1.5 h-5 w-5 text-[#183D2B]" aria-hidden="true" />
                    <span className="text-xs font-bold text-[#0F2A33]">Pix</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5 rounded-xl border border-[#E6EDF1] bg-white p-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00C853] text-xs font-bold text-white">
                        1
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#0F2A33] sm:text-sm">
                          Copie os dados de pagamento
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-[#5C707A]">
                          Após clicar no botão verde &ldquo;FINALIZAR PAGAMENTO&rdquo;, você poderá
                          escanear o QR Code ou copiar a chave PIX &ldquo;copia e cola&rdquo;.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 rounded-xl border border-[#E6EDF1] bg-white p-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00C853] text-xs font-bold text-white">
                        2
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#0F2A33] sm:text-sm">
                          Realize o pagamento no seu banco de preferência
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-[#5C707A]">
                          Com o QR Code e a chave PIX em mãos, basta abrir o aplicativo do seu
                          banco, escolher a opção PIX, escanear o QR Code ou colar a chave
                          &ldquo;copia e cola&rdquo;.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 rounded-xl border border-[#E6EDF1] bg-white p-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00C853] text-xs font-bold text-white">
                        3
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#0F2A33] sm:text-sm">Pronto!</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-[#5C707A]">
                          Após realizar o pagamento, nosso sistema liberará o download do seu PDF em
                          instantes nesta mesma tela.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Título Destacado dos Order Bumps */}
                <div className="mt-8 mb-5 text-center">
                  <h2 className="text-lg font-black uppercase tracking-wide text-[#0B3BFF] sm:text-2xl">
                    APROVEITE E LEVE JUNTO COM 90% DE DESCONTO
                  </h2>
                </div>

                {/* Lista dos 4 Order Bumps Individuais */}
                <div className="space-y-4">
                  {productConfig.orderBumps.map((bump) => {
                    const isChecked = selectedBumps.includes(bump.id);

                    return (
                      <div
                        key={bump.id}
                        className={`rounded-2xl border p-4 transition-all sm:p-5 ${
                          isChecked
                            ? 'border-[#00C853] bg-white ring-1 ring-[#00C853]/30'
                            : 'border-[#DCE5EA] bg-white hover:border-[#B5C6D1]'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Coluna esquerda: checkbox + miniatura */}
                          <div className="flex shrink-0 flex-col items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => toggleBump(bump.id)}
                              aria-label={`Selecionar ${bump.title}`}
                              aria-pressed={isChecked}
                              className={`flex h-5 w-5 items-center justify-center rounded border transition-colors cursor-pointer ${
                                isChecked
                                  ? 'border-[#00C853] bg-[#00C853] text-white'
                                  : 'border-[#CBD5E1] bg-white text-transparent'
                              }`}
                            >
                              <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden="true" />
                            </button>

                            {bump.id === 'whatsapp' ? (
                              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-xs">
                                <MessageCircle className="h-9 w-9 fill-white/15" aria-hidden="true" />
                              </div>
                            ) : (
                              <div className="h-16 w-16 overflow-hidden rounded-xl border border-[#DCE5EA] bg-[#F5F0E6]">
                                <SafeImage
                                  src={BUMP_THUMBNAILS[bump.id]}
                                  alt={bump.title}
                                  className="h-full w-full object-cover"
                                  aspectClassName="aspect-square"
                                />
                              </div>
                            )}
                          </div>

                          {/* Conteúdo do card */}
                          <div className="min-w-0 flex-1 pt-0.5">
                            <h3 className="text-sm font-extrabold text-[#0B3BFF] sm:text-base">
                              {bump.title}
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-[#475569] sm:text-sm">
                              {bump.description}
                            </p>
                            <p className="mt-2.5 flex flex-wrap items-baseline gap-2 text-xs sm:text-sm">
                              <span className="font-bold text-[#0F2A33]">Por apenas</span>
                              <span className="font-extrabold tabular-nums text-[#0F6E3D]">
                                {bump.priceLabel}
                              </span>
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleBump(bump.id)}
                          aria-pressed={isChecked}
                          className={`mt-4 w-full rounded-full py-2.5 text-xs font-bold transition-all cursor-pointer sm:text-sm whitespace-nowrap ${
                            isChecked
                              ? 'bg-[#00C853] text-white hover:bg-[#00B248]'
                              : 'border border-[#DCE5EA] bg-white text-[#475569] hover:border-[#0F2A33]/40 hover:text-[#0F2A33]'
                          }`}
                        >
                          {isChecked ? 'Remover oferta' : 'Adicionar oferta'}
                        </button>
                      </div>
                    );
                  })}

                  {/* ÚLTIMO ORDER BUMP: Leve todos por R$ 20,00 */}
                  <div
                    className={`rounded-2xl border p-4 transition-all sm:p-5 ${
                      allBumpsSelected
                        ? 'border-[#00C853] bg-white ring-1 ring-[#00C853]/30'
                        : 'border-[#DCE5EA] bg-white hover:border-[#B5C6D1]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex shrink-0 flex-col items-center gap-2.5">
                        <button
                          type="button"
                          onClick={toggleAllBumps}
                          aria-label="Levar todos os adicionais por R$ 20,00"
                          aria-pressed={allBumpsSelected}
                          className={`flex h-5 w-5 items-center justify-center rounded border transition-colors cursor-pointer ${
                            allBumpsSelected
                              ? 'border-[#00C853] bg-[#00C853] text-white'
                              : 'border-[#CBD5E1] bg-white text-transparent'
                          }`}
                        >
                          <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden="true" />
                        </button>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D1FAE5] text-[#059669]">
                          <Star className="h-5 w-5 fill-[#059669]" aria-hidden="true" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 pt-0.5">
                        <h3 className="text-sm font-extrabold text-[#0B3BFF] sm:text-base">
                          Leve todos por R$ 20,00
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-[#475569] sm:text-sm">
                          Levar todos os 4 produtos acima juntos por apenas R$ 20,00
                        </p>
                        <p className="mt-2.5 flex flex-wrap items-baseline gap-2 text-xs sm:text-sm">
                          <span className="text-[#EF4444] line-through tabular-nums">
                            De R$ 39,60
                          </span>
                          <span className="font-bold text-[#0F2A33]">Por apenas</span>
                          <span className="font-extrabold tabular-nums text-[#0F6E3D]">
                            R$ 20,00
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={toggleAllBumps}
                      aria-pressed={allBumpsSelected}
                      className={`mt-4 w-full rounded-full py-2.5 text-xs font-bold transition-all cursor-pointer sm:text-sm whitespace-nowrap ${
                        allBumpsSelected
                          ? 'bg-[#00C853] text-white hover:bg-[#00B248]'
                          : 'border border-[#DCE5EA] bg-white text-[#475569] hover:border-[#0F2A33]/40 hover:text-[#0F2A33]'
                      }`}
                    >
                      {allBumpsSelected ? 'Remover oferta' : 'Adicionar oferta'}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div
                    role="alert"
                    className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 sm:text-sm"
                  >
                    {errorMessage}
                  </div>
                )}

                {/* Botão Principal Finalizar Pagamento */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-[#007B3D] px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-white shadow-[0_12px_24px_-8px_rgba(0,123,61,0.5)] transition-all hover:bg-[#006833] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer sm:text-base whitespace-nowrap"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                      <span>GERANDO PIX...</span>
                    </>
                  ) : (
                    <span>FINALIZAR PAGAMENTO</span>
                  )}
                </button>

                <p className="mt-4 text-center text-[11px] leading-relaxed text-[#64748B]">
                  Ao clicar em &ldquo;Finalizar Pagamento&rdquo;, seu código Pix será gerado com
                  total segurança para liberação imediata do conteúdo digital.
                </p>
              </form>
            )}

            {step === 'pix' && pixSession && (
              <section className="rounded-2xl border border-[#DCE5EA] bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#E6EDF1] pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#007B3D]">
                      Aguardando pagamento Pix
                    </p>
                    <h1 className="mt-1 text-xl font-extrabold text-[#0F2A33] sm:text-2xl">
                      Escaneie o QR Code ou copie o código
                    </h1>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-[#64748B]">Valor total</p>
                    <p className="text-2xl font-extrabold tabular-nums text-[#0F6E3D]">
                      {formatBrlFromCents(Math.round(pixSession.amount * 100))}
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-12 sm:items-center">
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-[#DCE5EA] bg-[#F8FAFC] p-5 sm:col-span-5">
                    {pixSession.qrCodeImage ? (
                      <img
                        src={pixSession.qrCodeImage}
                        alt="QR Code Pix para pagamento"
                        className="h-52 w-52 rounded-xl bg-white p-2 object-contain shadow-xs"
                      />
                    ) : (
                      <div className="flex h-48 w-48 flex-col items-center justify-center rounded-xl border border-dashed border-[#CBD5E1] bg-white p-4 text-center">
                        <QrCode className="mb-2 h-10 w-10 text-[#007B3D]" aria-hidden="true" />
                        <p className="text-xs text-[#64748B]">
                          Use o código Copia e Cola ao lado no aplicativo do seu banco.
                        </p>
                      </div>
                    )}
                    <p className="mt-3 text-center text-xs font-medium text-[#64748B]">
                      Escaneie com a câmera do seu banco
                    </p>
                  </div>

                  <div className="space-y-4 sm:col-span-7">
                    <div>
                      <label
                        htmlFor="pix-copia-cola"
                        className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#0F2A33]"
                      >
                        Pix Copia e Cola
                      </label>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          id="pix-copia-cola"
                          type="text"
                          readOnly
                          value={pixSession.copyPaste}
                          onFocus={(e) => e.currentTarget.select()}
                          className="w-full rounded-xl border border-[#DCE5EA] bg-[#F8FAFC] px-3.5 py-3 text-xs font-mono text-[#0F2A33] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#007B3D] px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-[#006833] cursor-pointer sm:text-sm whitespace-nowrap"
                        >
                          {copiedPix ? (
                            <>
                              <Check className="h-4 w-4" aria-hidden="true" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" aria-hidden="true" />
                              <span>Copiar Código</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#D1FAE5] bg-[#ECFDF5] p-4 text-xs leading-relaxed text-[#065F46]">
                      <p className="font-bold">Download automático após o pagamento</p>
                      <p className="mt-1">
                        Assim que o Pix for compensado, o seu PDF será liberado automaticamente
                        nesta tela.
                      </p>
                    </div>

                    {errorMessage && (
                      <div
                        role="alert"
                        className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900"
                      >
                        {errorMessage}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        disabled={isCheckingStatus}
                        onClick={() => void verifyPaymentStatus(pixSession, true)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[#007B3D] bg-white px-5 py-2.5 text-xs font-bold text-[#007B3D] transition-colors hover:bg-[#ECFDF5] disabled:opacity-60 cursor-pointer sm:text-sm whitespace-nowrap"
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${isCheckingStatus ? 'animate-spin' : ''}`}
                          aria-hidden="true"
                        />
                        <span>Já paguei · Verificar agora</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setStep('form');
                          setErrorMessage(null);
                        }}
                        className="text-xs font-semibold text-[#64748B] underline underline-offset-4 hover:text-[#0F2A33] cursor-pointer"
                      >
                        Alterar dados ou adicionais
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {step === 'paid' && downloadUrl && (
              <section className="rounded-2xl border border-[#00C853]/40 bg-white p-6 shadow-sm sm:p-10">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#00C853] text-white">
                    <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#007B3D]">
                      Pagamento Pix confirmado
                    </p>
                    <h1 className="mt-1 text-2xl font-extrabold text-[#0F2A33] sm:text-3xl">
                      Seu e-book já está liberado para download
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                      Obrigado pela sua compra, <strong>{name}</strong>. O download automático do
                      arquivo em PDF já foi iniciado. Caso não tenha começado, clique no botão
                      abaixo.
                    </p>
                  </div>
                </div>

                <div className="mt-7 rounded-2xl border border-[#DCE5EA] bg-[#F8FAFC] p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 shrink-0 text-[#007B3D]" aria-hidden="true" />
                      <div>
                        <p className="text-base font-bold text-[#0F2A33]">
                          {productConfig.name} — {productConfig.subtitle}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          Arquivo digital em PDF · Leitura em celular, tablet ou computador
                        </p>
                      </div>
                    </div>

                    <a
                      href={downloadUrl}
                      download="500-Receitas-Naturais-A-Farmacia-da-Floresta.pdf"
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#007B3D] px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#006833] whitespace-nowrap"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      <span>BAIXAR MEU E-BOOK EM PDF</span>
                    </a>
                  </div>
                </div>

                {selectedBumps.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-[#E6EDF1] bg-[#F8FAFC] p-5">
                    <p className="text-sm font-bold text-[#0F2A33]">
                      Adicionais incluídos no seu pedido:
                    </p>
                    <ul className="mt-2.5 space-y-2 text-sm text-[#475569]">
                      {productConfig.orderBumps
                        .filter((b) => selectedBumps.includes(b.id))
                        .map((b) => (
                          <li key={b.id} className="flex items-center gap-2">
                            <Check className="h-4 w-4 shrink-0 text-[#00C853]" aria-hidden="true" />
                            <span>
                              {b.title}
                              {b.id === 'whatsapp' && whatsapp ? ` (${whatsapp})` : ''}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                <p className="mt-6 text-xs text-[#64748B]">
                  Precisa de ajuda? Escreva para{' '}
                  <span className="font-semibold text-[#0F2A33]">{productConfig.contact.email}</span>.
                </p>
              </section>
            )}
          </div>

          {/* Coluna Direita: Resumo do Pedido */}
          <aside className="lg:col-span-4 lg:sticky lg:top-6">
            <div className="rounded-2xl border border-[#DCE5EA] bg-white p-5 shadow-[0_10px_30px_-15px_rgba(15,42,51,0.12)] sm:p-6">
              <div className="flex items-center gap-2 border-b border-[#E6EDF1] pb-4">
                <ShoppingCart className="h-4 w-4 text-[#0F2A33]" aria-hidden="true" />
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#0F2A33]">
                  RESUMO DO PEDIDO
                </h2>
              </div>

              {/* Produto Principal */}
              <div className="mt-4 space-y-4 border-b border-[#E6EDF1] pb-5">
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#DCE5EA] bg-[#F5F0E6]">
                    <SafeImage
                      src={PRODUCT_IMAGES.heroMockup}
                      alt={productConfig.name}
                      className="h-full w-full object-cover"
                      aspectClassName="aspect-square"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#0F2A33]">{productConfig.name}</p>
                    <p className="mt-0.5 text-xs leading-snug text-[#64748B]">
                      Guia completo com 100 receitas naturais em PDF
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-bold tabular-nums text-[#0F6E3D]">
                    {formatBrlFromCents(pricingBreakdown.baseCents)}
                  </span>
                </div>

                {/* Order Bumps selecionados */}
                {productConfig.orderBumps
                  .filter((bump) => selectedBumps.includes(bump.id))
                  .map((bump) => (
                    <div key={bump.id} className="flex items-start gap-3">
                      {bump.id === 'whatsapp' ? (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-white">
                          <MessageCircle className="h-6 w-6 fill-white/15" aria-hidden="true" />
                        </div>
                      ) : (
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[#DCE5EA] bg-[#F5F0E6]">
                          <SafeImage
                            src={BUMP_THUMBNAILS[bump.id]}
                            alt={bump.title}
                            className="h-full w-full object-cover"
                            aspectClassName="aspect-square"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold leading-snug text-[#0F2A33]">
                          {bump.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#64748B]">Adicional</p>
                      </div>
                      <span
                        className={`shrink-0 text-xs font-bold tabular-nums ${
                          pricingBreakdown.bundleApplied
                            ? 'text-[#94A3B8] line-through'
                            : 'text-[#0F6E3D]'
                        }`}
                      >
                        {bump.priceLabel}
                      </span>
                    </div>
                  ))}

                {pricingBreakdown.bundleApplied && (
                  <div className="flex items-center justify-between rounded-xl bg-[#ECFDF5] px-3 py-2 text-xs font-bold text-[#065F46]">
                    <span>Leve todos os 4 adicionais</span>
                    <span className="tabular-nums text-[#0F6E3D]">
                      {formatBrlFromCents(pricingBreakdown.finalBumpsCents)}
                    </span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="mt-4 flex items-baseline justify-end gap-2">
                <span className="text-sm font-bold text-[#0F2A33]">Total</span>
                <span className="text-xl font-extrabold tabular-nums text-[#0F6E3D]">
                  {formatBrlFromCents(pricingBreakdown.totalCents)}
                </span>
                <span className="text-sm font-bold text-[#0F2A33]">à vista</span>
              </div>
            </div>

            {/* Selo discreto de segurança e garantia */}
            <div className="mt-4 flex flex-col items-center gap-1.5 text-center text-xs text-[#64748B]">
              <p className="inline-flex items-center gap-1.5 font-medium text-[#0F2A33]">
                <ShieldCheck className="h-4 w-4 text-[#007B3D]" aria-hidden="true" />
                <span>Você está em uma conexão segura com dados protegidos</span>
              </p>
              <p>Garantia de {productConfig.guarantee.daysLabel} · Liberação imediata após o Pix</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
