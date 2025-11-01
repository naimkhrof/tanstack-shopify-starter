import { env } from "cloudflare:workers";
import { createFileRoute } from '@tanstack/react-router'
import { getDb } from '@/db'

export const Route = createFileRoute('/demo/api/dun')({
  server: {
    handlers: {
      GET: () => getDb()
    },
  },
})
