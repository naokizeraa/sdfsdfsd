import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type Request, type Response } from 'express';

const MISTICPAY_BASE_URL = 'https://api.misticpay.com/api';

const BASE_PRICE_CENTS = 1990; // R$ 19,90
const BUMP_PRICE_CENTS = 990; // R$ 9,90 cada
const ALL_BUMPS_BUNDLE_CENTS = 2000; // Todos os 4 por R$ 20,00
const VALID_BUMP_IDS = new Set(['whatsapp', 'vigor', 'sono', 'energia']);
const PDF_FILENAME = '500_receitas_naturais_1dad9257.pdf';
const ORDER_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

type PixState = 'PENDENTE' | 'COMPLETO' | 'FALHA';

interface StoredOrder {
  referenceId: string;
  misticpayTransactionId: string;
  status: PixState;
}

interface SignedOrderTokenPayload {
  txId: string;
  refId: string;
  exp: number;
}

const ordersCacheByTxId = new Map<string, StoredOrder>();

function resolveProtectedPdfPath(): string | null {
  const currentDir =
    typeof __dirname !== 'undefined'
      ? __dirname
      : path.dirname(fileURLToPath(import.meta.url));

  const candidates = [
    path.resolve(process.cwd(), 'private'),
    path.resolve(currentDir, '..', 'private'),
    path.resolve(currentDir, 'private'),
  ];

  for (const privateDir of candidates) {
    const candidateFile = path.resolve(privateDir, PDF_FILENAME);
    if (
      candidateFile.startsWith(privateDir + path.sep) &&
      fs.existsSync(candidateFile)
    ) {
      return candidateFile;
    }
  }
  return null;
}

function getTokenSigningKey(): Buffer {
  const secretSeed =
    process.env.ORDER_TOKEN_SECRET?.trim() ||
    process.env.MISTICPAY_CLIENT_SECRET?.trim() ||
    crypto.randomBytes(32).toString('hex');
  return crypto.createHash('sha256').update(`floresta-order:${secretSeed}`).digest();
}

function signOrderToken(txId: string, refId: string): string {
  const payload: SignedOrderTokenPayload = {
    txId,
    refId,
    exp: Date.now() + ORDER_TOKEN_TTL_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', getTokenSigningKey())
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

function verifyOrderToken(
  token: string,
  expectedTxId: string
): SignedOrderTokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, providedSig] = parts;
  if (!encodedPayload || !providedSig) return null;

  const expectedSig = crypto
    .createHmac('sha256', getTokenSigningKey())
    .update(encodedPayload)
    .digest('base64url');

  const a = Buffer.from(expectedSig);
  const b = Buffer.from(providedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as Partial<SignedOrderTokenPayload>;
    if (
      typeof parsed.txId !== 'string' ||
      typeof parsed.refId !== 'string' ||
      typeof parsed.exp !== 'number'
    ) {
      return null;
    }
    if (parsed.exp < Date.now() || parsed.txId !== expectedTxId) {
      return null;
    }
    return parsed as SignedOrderTokenPayload;
  } catch {
    return null;
  }
}

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

export function createApiRouter(): express.Router {
  const router = express.Router();

  router.get('/api/health', (_req: Request, res: Response) => {
    const hasCredentials = Boolean(
      process.env.MISTICPAY_CLIENT_ID?.trim() && process.env.MISTICPAY_CLIENT_SECRET?.trim()
    );
    res.json({ ok: true, pixConfigured: hasCredentials });
  });

  router.post('/api/pix/create', async (req: Request, res: Response) => {
    const headers = buildGatewayHeaders();
    if (!headers) {
      res.status(503).json({
        configured: false,
        error:
          'O pagamento Pix ainda não foi ativado nas configurações do servidor. Adicione as credenciais nas variáveis de ambiente.',
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
    const appUrl =
      process.env.APP_URL?.trim() ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.trim()}` : undefined);

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
      const accessToken = signOrderToken(misticTxId, referenceId);

      const orderRecord: StoredOrder = {
        referenceId,
        misticpayTransactionId: misticTxId,
        status,
      };
      ordersCacheByTxId.set(misticTxId, orderRecord);
      ordersCacheByTxId.set(referenceId, orderRecord);

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

  router.get('/api/pix/check/:transactionId', async (req: Request, res: Response) => {
    const rawId = req.params.transactionId;
    const transactionId = typeof rawId === 'string' ? rawId.trim() : '';
    const tokenHeader = req.get('x-order-token') ?? '';

    if (!transactionId || !/^[A-Za-z0-9._-]{4,80}$/.test(transactionId)) {
      res.status(400).json({ error: 'Identificador de pedido inválido.' });
      return;
    }

    const tokenData = verifyOrderToken(tokenHeader, transactionId);
    if (!tokenData) {
      res.status(403).json({ error: 'Token de acesso do pedido inválido.' });
      return;
    }

    const cachedOrder = ordersCacheByTxId.get(transactionId);
    if (cachedOrder?.status === 'COMPLETO') {
      res.json({
        transactionId,
        status: 'COMPLETO' as PixState,
        verified: true,
        downloadUrl: `/api/pix/download/${encodeURIComponent(transactionId)}?token=${encodeURIComponent(tokenHeader)}`,
      });
      return;
    }

    const headers = buildGatewayHeaders();
    if (!headers) {
      res.status(503).json({ error: 'Serviço de pagamento indisponível no momento.' });
      return;
    }

    try {
      let result = await checkGatewayTransaction(tokenData.txId, headers);
      if (!result && tokenData.refId !== tokenData.txId) {
        result = await checkGatewayTransaction(tokenData.refId, headers);
      }

      const currentStatus: PixState = result?.status ?? cachedOrder?.status ?? 'PENDENTE';
      ordersCacheByTxId.set(transactionId, {
        referenceId: tokenData.refId,
        misticpayTransactionId: tokenData.txId,
        status: currentStatus,
      });

      res.json({
        transactionId,
        status: currentStatus,
        verified: Boolean(result),
        downloadUrl:
          currentStatus === 'COMPLETO'
            ? `/api/pix/download/${encodeURIComponent(transactionId)}?token=${encodeURIComponent(tokenHeader)}`
            : null,
      });
    } catch {
      res.status(502).json({ error: 'Não foi possível consultar o status do Pix agora.' });
    }
  });

  router.get('/api/pix/download/:transactionId', async (req: Request, res: Response) => {
    const rawId = req.params.transactionId;
    const transactionId = typeof rawId === 'string' ? rawId.trim() : '';
    const tokenQuery = typeof req.query.token === 'string' ? req.query.token.trim() : '';

    if (!transactionId || !/^[A-Za-z0-9._-]{4,80}$/.test(transactionId)) {
      res.status(400).json({ error: 'Pedido inválido.' });
      return;
    }

    const tokenData = verifyOrderToken(tokenQuery, transactionId);
    if (!tokenData) {
      res.status(403).json({ error: 'Acesso não autorizado ao arquivo.' });
      return;
    }

    let isPaid = ordersCacheByTxId.get(transactionId)?.status === 'COMPLETO';

    if (!isPaid) {
      const headers = buildGatewayHeaders();
      if (!headers) {
        res.status(503).json({ error: 'Serviço indisponível para validar o pagamento.' });
        return;
      }

      try {
        let result = await checkGatewayTransaction(tokenData.txId, headers);
        if (!result && tokenData.refId !== tokenData.txId) {
          result = await checkGatewayTransaction(tokenData.refId, headers);
        }
        if (result?.status === 'COMPLETO') {
          isPaid = true;
          ordersCacheByTxId.set(transactionId, {
            referenceId: tokenData.refId,
            misticpayTransactionId: tokenData.txId,
            status: 'COMPLETO',
          });
        }
      } catch {
        res.status(502).json({ error: 'Não foi possível validar o pagamento agora.' });
        return;
      }
    }

    if (!isPaid) {
      res.status(402).json({ error: 'Aguardando confirmação do pagamento Pix.' });
      return;
    }

    const pdfPath = resolveProtectedPdfPath();
    if (!pdfPath) {
      res.status(404).json({ error: 'Arquivo PDF não encontrado no servidor.' });
      return;
    }

    res.setHeader('Cache-Control', 'no-store');
    res.download(pdfPath, '500-Receitas-Naturais-A-Farmacia-da-Floresta.pdf');
  });

  router.post('/api/pix/webhook', async (req: Request, res: Response) => {
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
    const cachedOrder = ordersCacheByTxId.get(transactionId);
    if (headers && cachedOrder) {
      try {
        const verified = await checkGatewayTransaction(cachedOrder.misticpayTransactionId, headers);
        if (verified) {
          cachedOrder.status = verified.status;
        }
      } catch {
        // Mantém estado atual em caso de falha temporária
      }
    }

    res.status(200).json({ received: true });
  });

  return router;
}

const app = express();
app.use(express.json({ limit: '64kb' }));
app.use(createApiRouter());

export default app;
