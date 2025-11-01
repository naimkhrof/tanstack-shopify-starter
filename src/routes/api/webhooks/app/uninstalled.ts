import { createFileRoute } from '@tanstack/react-router'

import { getDbFromContext } from '@/lib/cloudflare/env'
import { deleteSession } from '@/lib/shopify/session'
import { verifyWebhook, ShopifyWebhookError } from '@/lib/shopify/webhooks'

export const Route = createFileRoute('/api/webhooks/app/uninstalled')({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        try {
          const { shop, topic } = await verifyWebhook(request)

          const { db } = getDbFromContext(context)

          await deleteSession(db, shop)

          console.info(`Processed ${topic} webhook for ${shop}`)

          return new Response(null, { status: 200 })
        } catch (error) {
          if (error instanceof ShopifyWebhookError) {
            console.warn(`Failed webhook validation: ${error.message}`)
            return new Response(error.message, { status: error.status })
          }

          console.error('Unexpected error while handling app/uninstalled webhook', error)
          return new Response('Unexpected error', { status: 500 })
        }
      },
    },
  },
})
