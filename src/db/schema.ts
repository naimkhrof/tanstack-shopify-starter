import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const shopifySessions = pgTable('shopify_sessions', {
  shop: varchar('shop', { length: 255 }).primaryKey(),
  accessToken: text('access_token').notNull(),
  scope: text('scope').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
