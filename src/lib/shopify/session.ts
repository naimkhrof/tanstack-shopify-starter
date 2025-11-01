import { eq } from 'drizzle-orm'

import type { DbClient } from '@/db/client'
import { shopifySessions } from '@/db/schema'

export type ShopifySession = {
  accessToken: string
  scope: string
  expiresAt?: string | null
}

export async function saveSession(db: DbClient, shop: string, session: ShopifySession) {
  const expiresAt = session.expiresAt ? new Date(session.expiresAt) : null

  await db
    .insert(shopifySessions)
    .values({
      shop,
      accessToken: session.accessToken,
      scope: session.scope,
      expiresAt,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: shopifySessions.shop,
      set: {
        accessToken: session.accessToken,
        scope: session.scope,
        expiresAt,
        updatedAt: new Date(),
      },
    })
}

export async function getSession(db: DbClient, shop: string) {
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

export async function deleteSession(db: DbClient, shop: string) {
  await db.delete(shopifySessions).where(eq(shopifySessions.shop, shop))
}

export async function listSessions(db: DbClient) {
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

export async function updateSessionScope(db: DbClient, shop: string, scope: string) {
  await db
    .update(shopifySessions)
    .set({ scope, updatedAt: new Date() })
    .where(eq(shopifySessions.shop, shop))
}
