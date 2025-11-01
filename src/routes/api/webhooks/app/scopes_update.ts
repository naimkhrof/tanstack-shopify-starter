import { createFileRoute } from '@tanstack/react-router'

import { getDbFromContext } from '@/lib/cloudflare/env'
import { updateSessionScope } from '@/lib/shopify/session'
import { ShopifyWebhookError, verifyWebhook } from '@/lib/shopify/webhooks'

type ScopesUpdatePayload = {
  current?: string[]
}

export const Route = createFileRoute('/api/webhooks/app/scopes_update')({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        try {
          const { shop, topic, payload } = await verifyWebhook<ScopesUpdatePayload>(request)

          const currentScopes = Array.isArray(payload.current)
            ? payload.current.join(',')
            : ''

          if (currentScopes) {
            const { db } = getDbFromContext(context)
            await updateSessionScope(db, shop, currentScopes)
          }

          console.info(`Processed ${topic} webhook for ${shop}`)

          return new Response(null, { status: 200 })
        } catch (error) {
          if (error instanceof ShopifyWebhookError) {
            console.warn(`Failed webhook validation: ${error.message}`)
            return new Response(error.message, { status: error.status })
          }

          console.error('Unexpected error while handling app/scopes_update webhook', error)
          return new Response('Unexpected error', { status: 500 })
        }
      },
    },
  },
})
