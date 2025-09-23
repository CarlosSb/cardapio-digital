-- Create plans, subscriptions and payments tables for billing system

-- Plans table
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL, -- Price in cents
    currency VARCHAR(3) DEFAULT 'BRL',
    interval VARCHAR(20) DEFAULT 'month', -- month, year
    features JSONB DEFAULT '{}', -- Plan features and limits
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
    stripe_subscription_id VARCHAR(255), -- Stripe subscription ID (nullable for mock)
    status VARCHAR(50) DEFAULT 'active', -- active, canceled, past_due, incomplete
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id) -- One subscription per restaurant
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255), -- Stripe payment intent ID
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(50) DEFAULT 'pending', -- pending, succeeded, failed, canceled
    payment_method VARCHAR(100), -- card, boleto, etc.
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Usage metrics table for plan limits tracking
CREATE TABLE IF NOT EXISTS public.usage_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    metric_key VARCHAR(100) NOT NULL, -- menu_items_count, views_count, etc.
    metric_value INTEGER DEFAULT 0,
    period_start DATE NOT NULL, -- Start of billing period
    period_end DATE NOT NULL, -- End of billing period
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, metric_key, period_start, period_end)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_plans_active ON public.plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_restaurant_id ON public.subscriptions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON public.payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_restaurant_id ON public.payments(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_restaurant_id ON public.usage_metrics(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_period ON public.usage_metrics(period_start, period_end);

-- Insert default plans
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
ON CONFLICT (slug) DO NOTHING;

-- Function to get current plan for a restaurant
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

-- Function to check if restaurant can add menu item based on plan
CREATE OR REPLACE FUNCTION can_add_menu_item(restaurant_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    plan_features JSONB;
    current_count INTEGER;
    limit_value INTEGER;
BEGIN
    -- Get plan features
    SELECT features INTO plan_features
    FROM get_restaurant_plan(restaurant_uuid);

    IF plan_features IS NULL THEN
        -- No active plan, allow basic limit
        limit_value := 50;
    ELSE
        limit_value := (plan_features->>'menu_items_limit')::INTEGER;
        -- -1 means unlimited
        IF limit_value = -1 THEN
            RETURN TRUE;
        END IF;
    END IF;

    -- Count current menu items
    SELECT COUNT(*) INTO current_count
    FROM public.menu_items
    WHERE restaurant_id = restaurant_uuid;

    RETURN current_count < limit_value;
END;
$$ LANGUAGE plpgsql;

-- Function to update usage metrics
CREATE OR REPLACE FUNCTION update_usage_metric(
    restaurant_uuid UUID,
    metric_key_param VARCHAR(100),
    increment_value INTEGER DEFAULT 1
)
RETURNS void AS $$
DECLARE
    current_period_start DATE;
    current_period_end DATE;
BEGIN
    -- Get current billing period (monthly)
    current_period_start := date_trunc('month', CURRENT_DATE);
    current_period_end := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

    INSERT INTO public.usage_metrics (restaurant_id, metric_key, metric_value, period_start, period_end)
    VALUES (restaurant_uuid, metric_key_param, increment_value, current_period_start, current_period_end)
    ON CONFLICT (restaurant_id, metric_key, period_start, period_end)
    DO UPDATE SET
        metric_value = usage_metrics.metric_value + increment_value,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE public.plans IS 'Available subscription plans';
COMMENT ON TABLE public.subscriptions IS 'Restaurant subscriptions to plans';
COMMENT ON TABLE public.payments IS 'Payment records for subscriptions';
COMMENT ON TABLE public.usage_metrics IS 'Usage tracking for plan limits';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ PLANS AND SUBSCRIPTIONS TABLES CREATED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Created tables:';
    RAISE NOTICE '   ✅ plans - Subscription plan definitions';
    RAISE NOTICE '   ✅ subscriptions - Restaurant plan subscriptions';
    RAISE NOTICE '   ✅ payments - Payment transaction records';
    RAISE NOTICE '   ✅ usage_metrics - Plan usage tracking';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Default plans inserted: Basic, Professional, Enterprise';
    RAISE NOTICE '🔧 Helper functions created for plan management';
    RAISE NOTICE '';
END $$;