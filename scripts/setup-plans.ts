import { config } from "dotenv"
config({ path: "../.env" })
import { sql } from "../lib/db"

async function setupPlans() {
  try {
    console.log("🚀 Iniciando configuração das tabelas de planos...")

    // Create plans table
    await sql`
      CREATE TABLE IF NOT EXISTS public.plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        price_cents INTEGER NOT NULL,
        currency VARCHAR(3) DEFAULT 'BRL',
        interval VARCHAR(20) DEFAULT 'month',
        features JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create subscriptions table
    await sql`
      CREATE TABLE IF NOT EXISTS public.subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id UUID NOT NULL,
        plan_id UUID NOT NULL,
        stripe_subscription_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        current_period_start TIMESTAMP WITH TIME ZONE,
        current_period_end TIMESTAMP WITH TIME ZONE,
        cancel_at_period_end BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create payments table
    await sql`
      CREATE TABLE IF NOT EXISTS public.payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subscription_id UUID,
        restaurant_id UUID NOT NULL,
        stripe_payment_intent_id VARCHAR(255),
        amount_cents INTEGER NOT NULL,
        currency VARCHAR(3) DEFAULT 'BRL',
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(100),
        description TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create usage_metrics table
    await sql`
      CREATE TABLE IF NOT EXISTS public.usage_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id UUID NOT NULL,
        metric_key VARCHAR(100) NOT NULL,
        metric_value INTEGER DEFAULT 0,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_plans_active ON public.plans(is_active)`
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_restaurant_id ON public.subscriptions(restaurant_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON public.payments(subscription_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_payments_restaurant_id ON public.payments(restaurant_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_usage_metrics_restaurant_id ON public.usage_metrics(restaurant_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_usage_metrics_period ON public.usage_metrics(period_start, period_end)`

    // Insert default plans
    await sql`
      INSERT INTO public.plans (name, slug, description, price_cents, features, display_order) VALUES
      ('Básico', 'basic', 'Perfeito para restaurantes pequenos', 2900,
       '{"menu_items_limit": 50, "analytics": false, "api_access": false, "multiple_units": false}',
       1),
      ('Profissional', 'professional', 'Para restaurantes em crescimento', 5900,
       '{"menu_items_limit": -1, "analytics": true, "api_access": false, "multiple_units": false}',
       2),
      ('Empresarial', 'enterprise', 'Para redes e grandes operações', 9900,
       '{"menu_items_limit": -1, "analytics": true, "api_access": true, "multiple_units": true}',
       3)
      ON CONFLICT (slug) DO NOTHING
    `

    // Create helper functions
    await sql`
      CREATE OR REPLACE FUNCTION get_restaurant_plan(restaurant_uuid UUID)
      RETURNS TABLE (
        plan_id UUID,
        plan_name VARCHAR(100),
        plan_slug VARCHAR(100),
        status VARCHAR(50),
        features JSONB
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT
          p.id,
          p.name,
          p.slug,
          s.status,
          p.features
        FROM public.plans p
        JOIN public.subscriptions s ON p.id = s.plan_id
        WHERE s.restaurant_id = restaurant_uuid
        AND s.status = 'active'
        LIMIT 1;
      END;
      $$ LANGUAGE plpgsql;
    `

    await sql`
      CREATE OR REPLACE FUNCTION can_add_menu_item(restaurant_uuid UUID)
      RETURNS BOOLEAN AS $$
      DECLARE
        plan_features JSONB;
        current_count INTEGER;
        limit_value INTEGER;
      BEGIN
        SELECT features INTO plan_features
        FROM get_restaurant_plan(restaurant_uuid);

        IF plan_features IS NULL THEN
          limit_value := 50;
        ELSE
          limit_value := (plan_features->>'menu_items_limit')::INTEGER;
          IF limit_value = -1 THEN
            RETURN TRUE;
          END IF;
        END IF;

        SELECT COUNT(*) INTO current_count
        FROM public.menu_items
        WHERE restaurant_id = restaurant_uuid;

        RETURN current_count < limit_value;
      END;
      $$ LANGUAGE plpgsql;
    `

    console.log("✅ Tabelas de planos criadas com sucesso!")
    console.log("📊 Planos padrão inseridos:")
    console.log("   - Básico: R$ 29/mês, até 50 itens")
    console.log("   - Profissional: R$ 59/mês, ilimitado")
    console.log("   - Empresarial: R$ 99/mês, recursos completos")

  } catch (error) {
    console.error("❌ Erro ao configurar tabelas de planos:", error)
    process.exit(1)
  }
}

setupPlans()