import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { shopifySessions } from '@/db/schema'

export type ShopifySession = {
  accessToken: string
  scope: string
  expiresAt?: string | null
}

export async function saveSession(shop: string, session: ShopifySession) {
  await db
    .insert(shopifySessions)
    .values({
      shop,
      accessToken: session.accessToken,
      scope: session.scope,
      expiresAt: session.expiresAt ? new Date(session.expiresAt) : null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: shopifySessions.shop,
      set: {
        accessToken: session.accessToken,
        scope: session.scope,
        expiresAt: session.expiresAt ? new Date(session.expiresAt) : null,
        updatedAt: new Date(),
      },
    })
}

export async function getSession(shop: string) {
  const [record] = await db
    .select()
    .from(shopifySessions)
    .where(eq(shopifySessions.shop, shop))

  if (!record) {
    return null
  }

  return {
    accessToken: record.accessToken,
    scope: record.scope,
    expiresAt: record.expiresAt
      ? record.expiresAt instanceof Date
        ? record.expiresAt.toISOString()
        : record.expiresAt
      : null,
  } satisfies ShopifySession
}

export async function deleteSession(shop: string) {
  await db.delete(shopifySessions).where(eq(shopifySessions.shop, shop))
}

export async function listSessions() {
  const records = await db.select().from(shopifySessions)
  return records.map((record) => ({
    shop: record.shop,
    session: {
      accessToken: record.accessToken,
      scope: record.scope,
      expiresAt: record.expiresAt
        ? record.expiresAt instanceof Date
          ? record.expiresAt.toISOString()
          : record.expiresAt
        : null,
    } satisfies ShopifySession,
  }))
}

export async function updateSessionScope(shop: string, scope: string) {
  await db
    .update(shopifySessions)
    .set({ scope, updatedAt: new Date() })
    .where(eq(shopifySessions.shop, shop))
}
