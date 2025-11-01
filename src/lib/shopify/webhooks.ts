import { createHmac, timingSafeEqual } from 'node:crypto'

const SHOPIFY_HMAC_HEADER = 'x-shopify-hmac-sha256'
const SHOPIFY_TOPIC_HEADER = 'x-shopify-topic'
const SHOPIFY_SHOP_HEADER = 'x-shopify-shop-domain'

export class ShopifyWebhookError extends Error {
  constructor(message: string, readonly status: number = 400) {
    super(message)
    this.name = 'ShopifyWebhookError'
  }
}

export type VerifiedWebhook<TPayload = unknown> = {
  topic: string
  shop: string
  payload: TPayload
}

export async function verifyWebhook<T = unknown>(request: Request) {
  const secret = process.env.SHOPIFY_API_SECRET

  if (!secret) {
    throw new ShopifyWebhookError('SHOPIFY_API_SECRET must be configured.', 500)
  }

  const hmacHeader = request.headers.get(SHOPIFY_HMAC_HEADER)
  const topic = request.headers.get(SHOPIFY_TOPIC_HEADER)
  const shop = request.headers.get(SHOPIFY_SHOP_HEADER)

  if (!hmacHeader || !topic || !shop) {
    throw new ShopifyWebhookError('Missing required Shopify webhook headers.', 400)
  }

  const rawBody = Buffer.from(await request.arrayBuffer())

  const expected = createHmac('sha256', secret).update(rawBody).digest('base64')
  const safe = safeCompare(expected, hmacHeader)

  if (!safe) {
    throw new ShopifyWebhookError('Invalid webhook signature.', 401)
  }

  const payload = parsePayload<T>(rawBody)

  return { topic, shop, payload } satisfies VerifiedWebhook<T>
}

function safeCompare(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected)
  const receivedBuffer = Buffer.from(received)

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer)
}

function parsePayload<T>(buffer: Buffer) {
  if (buffer.byteLength === 0) {
    return {} as T
  }

  try {
    return JSON.parse(buffer.toString('utf8')) as T
  } catch (_error) {
    throw new ShopifyWebhookError('Unable to parse webhook payload as JSON.', 400)
  }
}
