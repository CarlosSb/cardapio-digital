import { migrate } from 'drizzle-orm/neon-http/migrator'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../lib/db/schema.ts'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config()

async function runDrizzleMigration() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not found in environment variables')
    process.exit(1)
  }

  try {
    console.log('🚀 Executing Drizzle migration...')

    const sql = neon(process.env.DATABASE_URL)
    const db = drizzle(sql, { schema })

    // Run migration
    await migrate(db, { migrationsFolder: './lib/db/migrations' })

    console.log('✅ Drizzle migration completed successfully!')
    console.log('🎉 Moderation system columns added to database!')

  } catch (error) {
    console.error('❌ Drizzle migration failed:', error)
    process.exit(1)
  }
}

runDrizzleMigration()