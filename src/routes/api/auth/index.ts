import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

import { createState } from '@/lib/shopify/state'
import { normalizeShopDomain } from '@/lib/shopify/shop'

const apiKey = process.env.SHOPIFY_API_KEY ?? process.env.VITE_SHOPIFY_API_KEY
const scopesEnv =
  process.env.SHOPIFY_SCOPES ??
  process.env.SHOPIFY_API_SCOPES ??
  process.env.SHOPIFY_ACCESS_SCOPES ??
  ''

export const Route = createFileRoute('/api/auth/')({
  server: {
    handlers: {
      GET: ({ request }) => {
        if (!apiKey) {
          return json({ error: 'SHOPIFY_API_KEY must be defined.' }, { status: 500 })
        }

        const url = new URL(request.url)
        const shop = normalizeShopDomain(url.searchParams.get('shop'))

        if (!shop) {
          return json(
            {
              error:
                'Missing or invalid shop parameter. Expected ?shop=example-shop or example-shop.myshopify.com',
            },
            { status: 400 },
          )
        }

        const redirectUri = `${url.origin}/api/auth/callback`
        const state = createState(shop)

        const authorizeUrl = new URL(`https://${shop}/admin/oauth/authorize`)
        authorizeUrl.searchParams.set('client_id', apiKey)
        authorizeUrl.searchParams.set('scope', scopesEnv)
        authorizeUrl.searchParams.set('redirect_uri', redirectUri)
        authorizeUrl.searchParams.set('state', state)

        return new Response(null, {
          status: 302,
          headers: {
            Location: authorizeUrl.toString(),
          },
        })
      },
    },
  },
})
