const { neon } = require('@neondatabase/serverless')
require('dotenv').config()

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not found in environment variables')
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    console.log('🚀 Executing database migration...')

    // Migration SQL
    const migrationSQL = `
      -- Add moderation fields to users table
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS blocked_by UUID,
      ADD COLUMN IF NOT EXISTS blocked_reason TEXT,
      ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS banned_by UUID,
      ADD COLUMN IF NOT EXISTS banned_reason TEXT;

      -- Add moderation fields to restaurants table
      ALTER TABLE restaurants
      ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS blocked_by UUID,
      ADD COLUMN IF NOT EXISTS blocked_reason TEXT,
      ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS banned_by UUID,
      ADD COLUMN IF NOT EXISTS banned_reason TEXT;

      -- Create audit_logs table if it doesn't exist
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID NOT NULL,
        performed_by UUID,
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_users_is_blocked ON users(is_blocked);
      CREATE INDEX IF NOT EXISTS idx_users_is_banned ON users(is_banned);
      CREATE INDEX IF NOT EXISTS idx_restaurants_is_blocked ON restaurants(is_blocked);
      CREATE INDEX IF NOT EXISTS idx_restaurants_is_banned ON restaurants(is_banned);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON audit_logs(performed_by);
    `

    await sql.unsafe(migrationSQL)

    console.log('✅ Migration completed successfully!')
    console.log('🎉 Moderation system is now fully functional!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()