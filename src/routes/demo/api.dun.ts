import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/demo/api/dun')({
  server: {
    handlers: {
      GET: () => json([])
    },
  },
})
