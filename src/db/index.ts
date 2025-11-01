import { config } from 'dotenv'

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL must be defined to initialize the database connection.')
}

const pool = new Pool({
  connectionString,
  ssl:
    process.env.DATABASE_SSL_MODE === 'require'
      ? {
          rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
        }
      : undefined,
})

export const db = drizzle(pool, { schema })
