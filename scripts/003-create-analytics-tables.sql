-- Create analytics and platform management tables

-- Platform users table (for admin users)
CREATE TABLE IF NOT EXISTS public.platform_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Menu views analytics
CREATE TABLE IF NOT EXISTS public.menu_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(100)
);

-- Platform metrics cache table (for faster dashboard queries)
CREATE TABLE IF NOT EXISTS public.platform_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_key VARCHAR(100) UNIQUE NOT NULL,
    metric_value JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_menu_views_restaurant_id ON public.menu_views(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_views_viewed_at ON public.menu_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_key ON public.platform_metrics(metric_key);

-- Insert default admin user (you should change this email)
-- Note: This is just for initial setup. In production, use proper user management.
INSERT INTO public.platform_users (email, name, role)
VALUES ('admin@cardapiodigital.com', 'Administrador', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Also create a regular user account for the admin
INSERT INTO public.users (email, name, password_hash)
VALUES ('admin@cardapiodigital.com', 'Administrador', '$2a$10$example.hash.here')
ON CONFLICT (email) DO NOTHING;

-- Function to update platform metrics
CREATE OR REPLACE FUNCTION update_platform_metrics()
RETURNS void AS $$
BEGIN
    -- Update total restaurants
    INSERT INTO public.platform_metrics (metric_key, metric_value, expires_at)
    VALUES ('total_restaurants', jsonb_build_object('count', (SELECT COUNT(*) FROM public.restaurants)), NOW() + INTERVAL '1 hour')
    ON CONFLICT (metric_key) DO UPDATE SET
        metric_value = jsonb_build_object('count', (SELECT COUNT(*) FROM public.restaurants)),
        last_updated = NOW(),
        expires_at = NOW() + INTERVAL '1 hour';

    -- Update new restaurants this month
    INSERT INTO public.platform_metrics (metric_key, metric_value, expires_at)
    VALUES ('new_restaurants_month', jsonb_build_object('count', (
        SELECT COUNT(*) FROM public.restaurants
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    )), NOW() + INTERVAL '1 hour')
    ON CONFLICT (metric_key) DO UPDATE SET
        metric_value = jsonb_build_object('count', (
            SELECT COUNT(*) FROM public.restaurants
            WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
        )),
        last_updated = NOW(),
        expires_at = NOW() + INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE public.platform_users IS 'Users with administrative access to the platform';
COMMENT ON TABLE public.analytics_events IS 'General analytics events for platform tracking';
COMMENT ON TABLE public.menu_views IS 'Tracks when restaurant menus are viewed by customers';
COMMENT ON TABLE public.platform_metrics IS 'Cached metrics for faster dashboard loading';