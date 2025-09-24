-- Safe Migration: Add moderation columns to users and restaurants tables
-- Production-safe: No data loss, can be run multiple times
-- Simulates production deployment scenario

-- Add moderation columns to users table
DO $$
BEGIN
    -- Add is_blocked column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'is_blocked'
    ) THEN
        ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_blocked column to users table';
    ELSE
        RAISE NOTICE 'is_blocked column already exists in users table';
    END IF;

    -- Add blocked_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'blocked_at'
    ) THEN
        ALTER TABLE users ADD COLUMN blocked_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added blocked_at column to users table';
    END IF;

    -- Add blocked_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'blocked_by'
    ) THEN
        ALTER TABLE users ADD COLUMN blocked_by UUID;
        RAISE NOTICE 'Added blocked_by column to users table';
    END IF;

    -- Add blocked_reason column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'blocked_reason'
    ) THEN
        ALTER TABLE users ADD COLUMN blocked_reason TEXT;
        RAISE NOTICE 'Added blocked_reason column to users table';
    END IF;

    -- Add is_banned column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'is_banned'
    ) THEN
        ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_banned column to users table';
    END IF;

    -- Add banned_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'banned_at'
    ) THEN
        ALTER TABLE users ADD COLUMN banned_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added banned_at column to users table';
    END IF;

    -- Add banned_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'banned_by'
    ) THEN
        ALTER TABLE users ADD COLUMN banned_by UUID;
        RAISE NOTICE 'Added banned_by column to users table';
    END IF;

    -- Add banned_reason column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'banned_reason'
    ) THEN
        ALTER TABLE users ADD COLUMN banned_reason TEXT;
        RAISE NOTICE 'Added banned_reason column to users table';
    END IF;
END $$;

-- Add moderation columns to restaurants table
DO $$
BEGIN
    -- Add is_blocked column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'restaurants' AND column_name = 'is_blocked'
    ) THEN
        ALTER TABLE restaurants ADD COLUMN is_blocked BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_blocked column to restaurants table';
    ELSE
        RAISE NOTICE 'is_blocked column already exists in restaurants table';
    END IF;

    -- Add blocked_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'restaurants' AND column_name = 'blocked_at'
    ) THEN
        ALTER TABLE restaurants ADD COLUMN blocked_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added blocked_at column to restaurants table';
    END IF;

    -- Add blocked_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'restaurants' AND column_name = 'blocked_by'
    ) THEN
        ALTER TABLE restaurants ADD COLUMN blocked_by UUID;
        RAISE NOTICE 'Added blocked_by column to restaurants table';
    END IF;

    -- Add blocked_reason column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'restaurants' AND column_name = 'blocked_reason'
    ) THEN
        ALTER TABLE restaurants ADD COLUMN blocked_reason TEXT;
        RAISE NOTICE 'Added blocked_reason column to restaurants table';
    END IF;

    -- Add is_banned column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'restaurants' AND column_name = 'is_banned'
    ) THEN
        ALTER TABLE restaurants ADD COLUMN is_banned BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_banned column to restaurants table';
    END IF;

    -- Add banned_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'restaurants' AND column_name = 'banned_at'
    ) THEN
        ALTER TABLE restaurants ADD COLUMN banned_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added banned_at column to restaurants table';
    END IF;

    -- Add banned_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'restaurants' AND column_name = 'banned_by'
    ) THEN
        ALTER TABLE restaurants ADD COLUMN banned_by UUID;
        RAISE NOTICE 'Added banned_by column to restaurants table';
    END IF;

    -- Add banned_reason column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'restaurants' AND column_name = 'banned_reason'
    ) THEN
        ALTER TABLE restaurants ADD COLUMN banned_reason TEXT;
        RAISE NOTICE 'Added banned_reason column to restaurants table';
    END IF;
END $$;

-- Create audit_logs table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'audit_logs'
    ) THEN
        CREATE TABLE audit_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            action VARCHAR(255) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id UUID NOT NULL,
            performed_by UUID,
            details JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        RAISE NOTICE 'Created audit_logs table';
    ELSE
        RAISE NOTICE 'audit_logs table already exists';
    END IF;
END $$;

-- Create indexes for better performance (safe to run multiple times)
DO $$
BEGIN
    -- Users table indexes
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'idx_users_is_blocked'
    ) THEN
        CREATE INDEX idx_users_is_blocked ON users(is_blocked);
        RAISE NOTICE 'Created index idx_users_is_blocked';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'idx_users_is_banned'
    ) THEN
        CREATE INDEX idx_users_is_banned ON users(is_banned);
        RAISE NOTICE 'Created index idx_users_is_banned';
    END IF;

    -- Restaurants table indexes
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE tablename = 'restaurants' AND indexname = 'idx_restaurants_is_blocked'
    ) THEN
        CREATE INDEX idx_restaurants_is_blocked ON restaurants(is_blocked);
        RAISE NOTICE 'Created index idx_restaurants_is_blocked';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE tablename = 'restaurants' AND indexname = 'idx_restaurants_is_banned'
    ) THEN
        CREATE INDEX idx_restaurants_is_banned ON restaurants(is_banned);
        RAISE NOTICE 'Created index idx_restaurants_is_banned';
    END IF;

    -- Audit logs indexes
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE tablename = 'audit_logs' AND indexname = 'idx_audit_logs_action'
    ) THEN
        CREATE INDEX idx_audit_logs_action ON audit_logs(action);
        RAISE NOTICE 'Created index idx_audit_logs_action';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE tablename = 'audit_logs' AND indexname = 'idx_audit_logs_entity'
    ) THEN
        CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
        RAISE NOTICE 'Created index idx_audit_logs_entity';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE tablename = 'audit_logs' AND indexname = 'idx_audit_logs_performed_by'
    ) THEN
        CREATE INDEX idx_audit_logs_performed_by ON audit_logs(performed_by);
        RAISE NOTICE 'Created index idx_audit_logs_performed_by';
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SAFE MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Migration Summary:';
    RAISE NOTICE '   ✅ Added moderation columns to users table:';
    RAISE NOTICE '      - is_blocked (BOOLEAN DEFAULT false)';
    RAISE NOTICE '      - blocked_at (TIMESTAMP)';
    RAISE NOTICE '      - blocked_by (UUID)';
    RAISE NOTICE '      - blocked_reason (TEXT)';
    RAISE NOTICE '      - is_banned (BOOLEAN DEFAULT false)';
    RAISE NOTICE '      - banned_at (TIMESTAMP)';
    RAISE NOTICE '      - banned_by (UUID)';
    RAISE NOTICE '      - banned_reason (TEXT)';
    RAISE NOTICE '';
    RAISE NOTICE '   ✅ Added moderation columns to restaurants table:';
    RAISE NOTICE '      - is_blocked (BOOLEAN DEFAULT false)';
    RAISE NOTICE '      - blocked_at (TIMESTAMP)';
    RAISE NOTICE '      - blocked_by (UUID)';
    RAISE NOTICE '      - blocked_reason (TEXT)';
    RAISE NOTICE '      - is_banned (BOOLEAN DEFAULT false)';
    RAISE NOTICE '      - banned_at (TIMESTAMP)';
    RAISE NOTICE '      - banned_by (UUID)';
    RAISE NOTICE '      - banned_reason (TEXT)';
    RAISE NOTICE '';
    RAISE NOTICE '   ✅ Created audit_logs table for moderation tracking';
    RAISE NOTICE '   ✅ Created performance indexes';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Production-safe: No data loss, can be run multiple times';
    RAISE NOTICE '🚀 Moderation system is now fully operational!';
END $$;