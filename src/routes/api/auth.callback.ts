import { createHmac, timingSafeEqual } from 'node:crypto'
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

import { saveSession, type ShopifySession } from '../../lib/shopify/session'
import { normalizeShopDomain } from '../../lib/shopify/shop'
import { consumeState } from '../../lib/shopify/state'

const apiKey = process.env.SHOPIFY_API_KEY ?? process.env.VITE_SHOPIFY_API_KEY
const apiSecret = process.env.SHOPIFY_API_SECRET
const sessionSecret = process.env.SHOPIFY_SESSION_SECRET ?? apiSecret

function createSignedSessionCookie(shop: string) {
  if (!sessionSecret) {
    return null
  }

  const issuedAt = Date.now()
  const payload = `${shop}|${issuedAt}`
  const signature = createHmac('sha256', sessionSecret).update(payload).digest('hex')
  const value = `${Buffer.from(payload, 'utf8').toString('base64')}.${signature}`

  return `shopify_session=${value}; Path=/; HttpOnly; Secure; SameSite=None`
}

function verifyHmac(searchParams: URLSearchParams) {
  if (!apiSecret) {
    throw new Error('SHOPIFY_API_SECRET is not configured')
  }

  const hmac = searchParams.get('hmac')

  if (!hmac) {
    return false
  }

  const message = [...searchParams.entries()]
    .filter(([key]) => key !== 'hmac' && key !== 'signature')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  const digest = createHmac('sha256', apiSecret)
    .update(message)
    .digest('hex')

  const digestBuffer = Buffer.from(digest, 'hex')
  const hmacBuffer = Buffer.from(hmac, 'hex')

  return (
    digestBuffer.length === hmacBuffer.length &&
    timingSafeEqual(digestBuffer, hmacBuffer)
  )
}

export const Route = createFileRoute('/api/auth/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!apiKey || !apiSecret) {
          return json(
            {
              error:
                'SHOPIFY_API_KEY and SHOPIFY_API_SECRET must be configured before handling callbacks.',
            },
            { status: 500 },
          )
        }

        const url = new URL(request.url)
        const params = url.searchParams

        const requiredParams = ['code', 'host', 'shop', 'state', 'timestamp']

        for (const param of requiredParams) {
          if (!params.get(param)) {
            return json({ error: `Missing required parameter: ${param}` }, { status: 400 })
          }
        }

        if (!verifyHmac(params)) {
          return json({ error: 'Invalid HMAC signature' }, { status: 401 })
        }

        const shop = normalizeShopDomain(params.get('shop'))
        const code = params.get('code')

        if (!shop || !code) {
          return json({ error: 'Missing or invalid shop/code in callback URL.' }, { status: 400 })
        }

        const state = params.get('state')

        if (!state || !consumeState(state, shop)) {
          return json({ error: 'Invalid OAuth state. Please try installing the app again.' }, { status: 400 })
        }

        const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: apiKey,
            client_secret: apiSecret,
            code,
          }),
        })

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text()
          return json({ error: 'Failed to exchange auth code', details: errorText }, { status: 502 })
        }

        const tokenPayload = (await tokenResponse.json()) as {
          access_token: string
          scope: string
          expires_in?: number
          expires_at?: string
        }

        const session: ShopifySession = {
          accessToken: tokenPayload.access_token,
          scope: tokenPayload.scope,
          expiresAt: tokenPayload.expires_at ??
            (tokenPayload.expires_in
              ? new Date(Date.now() + tokenPayload.expires_in * 1000).toISOString()
              : null),
        }

        await saveSession(shop, session)

        const redirectUrl = new URL('/', url.origin)
        redirectUrl.searchParams.set('shop', shop)
        const host = params.get('host')
        if (host) {
          redirectUrl.searchParams.set('host', host)
        }

        const headers = new Headers({
          Location: redirectUrl.toString(),
        })

        const sessionCookie = createSignedSessionCookie(shop)
        if (sessionCookie) {
          headers.append('Set-Cookie', sessionCookie)
        }

        return new Response(null, {
          status: 302,
          headers,
        })
      },
    },
  },
})
