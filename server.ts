import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type NextFunction, type Request, type Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const MISTICPAY_BASE_URL = 'https://api.misticpay.com/api';

const BASE_PRICE_CENTS = 1990; // R$ 19,90
const BUMP_PRICE_CENTS = 990; // R$ 9,90 cada
const ALL_BUMPS_BUNDLE_CENTS = 2000; // Todos os 4 por R$ 20,00
const VALID_BUMP_IDS = new Set(['whatsapp', 'vigor', 'sono', 'energia']);

const PUBLIC_DIR = path.resolve(__dirname, 'public');
const PROTECTED_PDF_PATH = path.resolve(
  PUBLIC_DIR,
  'assets',
  'aistudio',
  '500_receitas_naturais_1dad9257.pdf'
);

type PixState = 'PENDENTE' | 'COMPLETO' | 'FALHA';

interface StoredOrder {
  referenceId: string;
  misticpayTransactionId: string;
  accessToken: string;
  payerName: string;
  payerEmail: string;
  payerWhatsapp: string | null;
  selectedBumps: string[];
  amountCents: number;
  status: PixState;
  createdAt: string;
}

const ordersByTxId = new Map<string, StoredOrder>();

function isValidCpf(rawCpf: string): boolean {
  const digits = rawCpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(digits[i]) * (10 - i);
  }
  let check1 = (sum * 10) % 11;
  if (check1 === 10) check1 = 0;
  if (check1 !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(digits[i]) * (11 - i);
  }
  let check2 = (sum * 10) % 11;
  if (check2 === 10) check2 = 0;
  return check2 === Number(digits[10]);
}

function generateValidCpf(): string {
  let digits: number[] = [];
  do {
    digits = Array.from({ length: 9 }, () => crypto.randomInt(0, 10));
  } while (digits.every((d) => d === digits[0]));

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  let check1 = (sum * 10) % 11;
  if (check1 === 10) check1 = 0;
  digits.push(check1);

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  let check2 = (sum * 10) % 11;
  if (check2 === 10) check2 = 0;
  digits.push(check2);

  return digits.join('');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 160;
}

function computeAuthoritativeAmountCents(selectedBumps: string[]): number {
  const bumpCount = selectedBumps.length;
  if (bumpCount === 0) return BASE_PRICE_CENTS;
  if (bumpCount >= VALID_BUMP_IDS.size) {
    return BASE_PRICE_CENTS + ALL_BUMPS_BUNDLE_CENTS;
  }
  return BASE_PRICE_CENTS + bumpCount * BUMP_PRICE_CENTS;
}

function sanitizeImageSrc(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (/^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return null;
  }
  return null;
}

function buildGatewayHeaders(): Record<string, string> | null {
  const clientId = process.env.MISTICPAY_CLIENT_ID?.trim();
  const clientSecret = process.env.MISTICPAY_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return null;
  }

  const basicToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Basic ${basicToken}`,
    ci: clientId,
    cs: clientSecret,
  };
}

function normalizePixState(raw: unknown): PixState {
  if (typeof raw !== 'string') return 'PENDENTE';
  const upper = raw.trim().toUpperCase();
  if (upper === 'COMPLETO' || upper === 'PAGO' || upper === 'CONFIRMED' || upper === 'PAID') {
    return 'COMPLETO';
  }
  if (upper === 'FALHA' || upper === 'FAILED' || upper === 'CANCELADO' || upper === 'EXPIRADO') {
    return 'FALHA';
  }
  return 'PENDENTE';
}

function safeTokenEquals(expected: string, provided: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

async function checkGatewayTransaction(
  transactionId: string,
  headers: Record<string, string>
): Promise<{ status: PixState; raw: Record<string, unknown> } | null> {
  const response = await fetch(`${MISTICPAY_BASE_URL}/transactions/check`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ transactionId }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const txObj =
    (payload.transaction as Record<string, unknown> | undefined) ??
    (payload.data as Record<string, unknown> | undefined) ??
    payload;

  const status = normalizePixState(txObj.transactionState ?? txObj.status);
  return { status, raw: payload };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  // Impede download público direto do PDF sem confirmação de pagamento
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.toLowerCase().endsWith('.pdf')) {
      res.status(403).json({ error: 'Acesso ao arquivo disponível apenas após confirmação do pagamento.' });
      return;
    }
    next();
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    const hasCredentials = Boolean(
      process.env.MISTICPAY_CLIENT_ID?.trim() && process.env.MISTICPAY_CLIENT_SECRET?.trim()
    );
    res.json({ ok: true, pixConfigured: hasCredentials });
  });

  app.post('/api/pix/create', async (req: Request, res: Response) => {
    const headers = buildGatewayHeaders();
    if (!headers) {
      res.status(503).json({
        configured: false,
        error:
          'O pagamento Pix ainda não foi ativado nas configurações do servidor. Adicione as chaves de pagamento em Settings → Secrets.',
      });
      return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const payerName = typeof body.name === 'string' ? body.name.trim() : '';
    const payerEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const rawCpf = typeof body.cpf === 'string' ? body.cpf : '';
    const cpfDigits = isValidCpf(rawCpf) ? rawCpf.replace(/\D/g, '') : generateValidCpf();
    const rawWhatsapp = typeof body.whatsapp === 'string' ? body.whatsapp : '';
    const whatsappDigits = rawWhatsapp.replace(/\D/g, '');

    const rawBumps = Array.isArray(body.selectedBumps) ? body.selectedBumps : [];
    const selectedBumps = Array.from(
      new Set(
        rawBumps.filter(
          (id): id is string => typeof id === 'string' && VALID_BUMP_IDS.has(id)
        )
      )
    );

    if (payerName.length < 2 || payerName.length > 120) {
      res.status(400).json({ error: 'Informe seu nome completo (mínimo de 2 caracteres).' });
      return;
    }

    if (!isValidEmail(payerEmail)) {
      res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
      return;
    }

    if (selectedBumps.includes('whatsapp') && (whatsappDigits.length < 10 || whatsappDigits.length > 11)) {
      res.status(400).json({
        error: 'Informe um número de WhatsApp válido com DDD para o envio automático.',
      });
      return;
    }

    const amountCents = computeAuthoritativeAmountCents(selectedBumps);
    const amountReais = Number((amountCents / 100).toFixed(2));
    const description =
      selectedBumps.length > 0
        ? `A Farmácia da Floresta + ${selectedBumps.length} adicional(is)`
        : 'A Farmácia da Floresta — E-book Digital';

    const referenceId = `floresta-${crypto.randomUUID()}`;
    const accessToken = crypto.randomBytes(24).toString('hex');
    const appUrl = process.env.APP_URL?.trim();
    let projectWebhook: string | undefined;
    if (appUrl && /^https:\/\//i.test(appUrl)) {
      projectWebhook = `${appUrl.replace(/\/+$/, '')}/api/pix/webhook`;
    }

    const requestPayload: Record<string, unknown> = {
      amount: amountReais,
      payerName,
      payerDocument: cpfDigits,
      transactionId: referenceId,
      description,
    };

    if (projectWebhook) {
      requestPayload.projectWebhook = projectWebhook;
    }

    try {
      const gatewayResponse = await fetch(`${MISTICPAY_BASE_URL}/transactions/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestPayload),
      });

      const responseData = (await gatewayResponse.json().catch(() => ({}))) as Record<
        string,
        unknown
      >;

      if (!gatewayResponse.ok) {
        const apiMessage =
          typeof responseData.message === 'string'
            ? responseData.message
            : 'Não foi possível gerar a cobrança Pix no momento.';
        res.status(gatewayResponse.status >= 400 && gatewayResponse.status < 500 ? 400 : 502).json({
          error: apiMessage,
        });
        return;
      }

      const txData = (responseData.data as Record<string, unknown> | undefined) ?? responseData;
      const misticTxId = String(txData.transactionId ?? referenceId);
      const copyPaste =
        typeof txData.copyPaste === 'string'
          ? txData.copyPaste
          : typeof txData.qrCode === 'string'
            ? txData.qrCode
            : '';
      const qrCodeImage =
        sanitizeImageSrc(txData.qrCodeBase64) ?? sanitizeImageSrc(txData.qrcodeUrl);
      const status = normalizePixState(txData.transactionState);

      const orderRecord: StoredOrder = {
        referenceId,
        misticpayTransactionId: misticTxId,
        accessToken,
        payerName,
        payerEmail,
        payerWhatsapp: selectedBumps.includes('whatsapp') ? whatsappDigits : null,
        selectedBumps,
        amountCents,
        status,
        createdAt: new Date().toISOString(),
      };

      ordersByTxId.set(misticTxId, orderRecord);
      ordersByTxId.set(referenceId, orderRecord);

      res.status(201).json({
        transactionId: misticTxId,
        accessToken,
        status,
        amount: amountReais,
        copyPaste,
        qrCodeImage,
        downloadUrl:
          status === 'COMPLETO'
            ? `/api/pix/download/${encodeURIComponent(misticTxId)}?token=${encodeURIComponent(accessToken)}`
            : null,
      });
    } catch {
      res.status(502).json({
        error: 'Falha de comunicação ao gerar o Pix. Tente novamente em instantes.',
      });
    }
  });

  app.get('/api/pix/check/:transactionId', async (req: Request, res: Response) => {
    const rawId = req.params.transactionId;
    const transactionId = typeof rawId === 'string' ? rawId.trim() : '';
    const tokenHeader = req.get('x-order-token') ?? '';

    if (!transactionId || !/^[A-Za-z0-9._-]{4,80}$/.test(transactionId)) {
      res.status(400).json({ error: 'Identificador de pedido inválido.' });
      return;
    }

    const storedOrder = ordersByTxId.get(transactionId);
    if (!storedOrder) {
      res.status(404).json({ error: 'Pedido não encontrado nesta sessão.' });
      return;
    }

    if (!tokenHeader || !safeTokenEquals(storedOrder.accessToken, tokenHeader)) {
      res.status(403).json({ error: 'Token de acesso do pedido inválido.' });
      return;
    }

    if (storedOrder.status === 'COMPLETO') {
      res.json({
        transactionId,
        status: 'COMPLETO' as PixState,
        downloadUrl: `/api/pix/download/${encodeURIComponent(transactionId)}?token=${encodeURIComponent(storedOrder.accessToken)}`,
      });
      return;
    }

    const headers = buildGatewayHeaders();
    if (!headers) {
      res.status(503).json({ error: 'Serviço de pagamento indisponível no momento.' });
      return;
    }

    try {
      let result = await checkGatewayTransaction(storedOrder.misticpayTransactionId, headers);
      if (!result && storedOrder.referenceId !== storedOrder.misticpayTransactionId) {
        result = await checkGatewayTransaction(storedOrder.referenceId, headers);
      }
      if (result) {
        storedOrder.status = result.status;
      }

      res.json({
        transactionId,
        status: storedOrder.status,
        verified: Boolean(result),
        downloadUrl:
          storedOrder.status === 'COMPLETO'
            ? `/api/pix/download/${encodeURIComponent(transactionId)}?token=${encodeURIComponent(storedOrder.accessToken)}`
            : null,
      });
    } catch {
      res.status(502).json({ error: 'Não foi possível consultar o status do Pix agora.' });
    }
  });

  app.get('/api/pix/download/:transactionId', (req: Request, res: Response) => {
    const rawId = req.params.transactionId;
    const transactionId = typeof rawId === 'string' ? rawId.trim() : '';
    const tokenQuery = typeof req.query.token === 'string' ? req.query.token.trim() : '';

    if (!transactionId || !/^[A-Za-z0-9._-]{4,80}$/.test(transactionId)) {
      res.status(400).json({ error: 'Pedido inválido.' });
      return;
    }

    const storedOrder = ordersByTxId.get(transactionId);
    if (!storedOrder || !tokenQuery || !safeTokenEquals(storedOrder.accessToken, tokenQuery)) {
      res.status(403).json({ error: 'Acesso não autorizado ao arquivo.' });
      return;
    }

    if (storedOrder.status !== 'COMPLETO') {
      res.status(402).json({ error: 'Aguardando confirmação do pagamento Pix.' });
      return;
    }

    if (
      !PROTECTED_PDF_PATH.startsWith(PUBLIC_DIR + path.sep) ||
      !fs.existsSync(PROTECTED_PDF_PATH)
    ) {
      res.status(404).json({ error: 'Arquivo PDF não encontrado no servidor.' });
      return;
    }

    res.setHeader('Cache-Control', 'no-store');
    res.download(PROTECTED_PDF_PATH, '500-Receitas-Naturais-A-Farmacia-da-Floresta.pdf');
  });

  app.post('/api/pix/webhook', async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const rawId =
      body.transactionId ?? (body.data as Record<string, unknown> | undefined)?.transactionId;
    const transactionId =
      typeof rawId === 'string' || typeof rawId === 'number' ? String(rawId).trim() : '';

    if (!transactionId || !/^[A-Za-z0-9._-]{4,80}$/.test(transactionId)) {
      res.status(400).json({ received: false });
      return;
    }

    const headers = buildGatewayHeaders();
    const storedOrder = ordersByTxId.get(transactionId);
    if (headers && storedOrder) {
      try {
        const verified = await checkGatewayTransaction(storedOrder.misticpayTransactionId, headers);
        if (verified) {
          storedOrder.status = verified.status;
        }
      } catch {
        // Mantém estado atual em caso de falha temporária
      }
    }

    res.status(200).json({ received: true });
  });

  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build não encontrado.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
