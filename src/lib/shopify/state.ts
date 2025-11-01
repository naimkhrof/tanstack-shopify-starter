import { randomBytes } from 'node:crypto'

const STATE_TTL_MS = 5 * 60 * 1000

type StateEntry = {
  shop: string
  createdAt: number
}

declare global {
  // eslint-disable-next-line no-var
  var __shopifyStateStore__: Map<string, StateEntry> | undefined
}

const store =
  globalThis.__shopifyStateStore__ ?? new Map<string, StateEntry>()

if (!globalThis.__shopifyStateStore__) {
  globalThis.__shopifyStateStore__ = store
}

function pruneExpired() {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now - entry.createdAt > STATE_TTL_MS) {
      store.delete(key)
    }
  }
}

export function createState(shop: string) {
  pruneExpired()
  const value = randomBytes(16).toString('hex')
  store.set(value, { shop, createdAt: Date.now() })
  return value
}

export function consumeState(value: string, shop?: string) {
  pruneExpired()
  const entry = store.get(value)
  if (!entry) {
    return null
  }

  store.delete(value)

  if (shop && entry.shop !== shop) {
    return null
  }

  return entry
}
