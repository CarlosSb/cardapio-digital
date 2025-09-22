-- COMPLETE DATABASE RESET AND SEED
-- This script recreates the entire database from scratch with sample data

-- Drop all existing tables (if they exist)
DROP TABLE IF EXISTS menu_views CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS platform_metrics CASCADE;
DROP TABLE IF EXISTS platform_users CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create restaurants table
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    owner_email VARCHAR(255) NOT NULL,
    logo_url TEXT,
    menu_display_mode VARCHAR(10) DEFAULT 'grid' CHECK (menu_display_mode IN ('grid', 'list')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create menu_items table
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- Stored in cents
    image_url TEXT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create platform_users table (admin users)
CREATE TABLE platform_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create analytics_events table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(255) NOT NULL,
    event_data JSONB,
    user_id UUID,
    restaurant_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create menu_views table
CREATE TABLE menu_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(50)
);

-- Create platform_metrics table
CREATE TABLE platform_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_key VARCHAR(255) NOT NULL UNIQUE,
    metric_value JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_restaurants_owner_email ON restaurants(owner_email);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_categories_restaurant_id ON categories(restaurant_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_platform_users_email ON platform_users(email);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_menu_views_restaurant_id ON menu_views(restaurant_id);
CREATE INDEX idx_menu_views_viewed_at ON menu_views(viewed_at);
CREATE INDEX idx_platform_metrics_key ON platform_metrics(metric_key);

-- Insert sample users
INSERT INTO users (email, name, password_hash) VALUES
('admin@cardapiodigital.com', 'Administrador', '$2a$10$example.hash.here'),
('joao.silva@email.com', 'João Silva', '$2a$10$example.hash.here'),
('maria.santos@email.com', 'Maria Santos', '$2a$10$example.hash.here'),
('carlos.oliveira@email.com', 'Carlos Oliveira', '$2a$10$example.hash.here');

-- Insert platform admin
INSERT INTO platform_users (email, name, role) VALUES
('admin@cardapiodigital.com', 'Administrador', 'super_admin');

-- Insert sample restaurants
INSERT INTO restaurants (name, description, slug, owner_email, logo_url, menu_display_mode) VALUES
('Restaurante Sabor Caseiro', 'Comida brasileira tradicional com toque moderno', 'sabor-caseiro', 'joao.silva@email.com', '/placeholder-logo.png', 'grid'),
('Pizzaria Bella Italia', 'Autênticas pizzas italianas feitas no forno a lenha', 'bella-italia', 'maria.santos@email.com', '/placeholder-logo.png', 'grid'),
('Café & Cia', 'Café da manhã, lanches e sobremesas artesanais', 'cafe-cia', 'carlos.oliveira@email.com', '/placeholder-logo.png', 'list');

-- Insert categories
INSERT INTO categories (name, description, restaurant_id, display_order) VALUES
-- Sabor Caseiro categories
('Pratos Principais', 'Nossos pratos mais pedidos', (SELECT id FROM restaurants WHERE slug = 'sabor-caseiro'), 1),
('Sobremesas', 'Doces irresistíveis', (SELECT id FROM restaurants WHERE slug = 'sabor-caseiro'), 2),
('Bebidas', 'Refrescos e sucos naturais', (SELECT id FROM restaurants WHERE slug = 'sabor-caseiro'), 3),
-- Bella Italia categories
('Pizzas Salgadas', 'Pizzas tradicionais e especiais', (SELECT id FROM restaurants WHERE slug = 'bella-italia'), 1),
('Pizzas Doces', 'Pizzas com sabores adocicados', (SELECT id FROM restaurants WHERE slug = 'bella-italia'), 2),
('Bebidas', 'Refrigerantes e vinhos', (SELECT id FROM restaurants WHERE slug = 'bella-italia'), 3),
-- Café & Cia categories
('Café da Manhã', 'Opções completas para começar o dia', (SELECT id FROM restaurants WHERE slug = 'cafe-cia'), 1),
('Lanches', 'Sanduíches e salgados', (SELECT id FROM restaurants WHERE slug = 'cafe-cia'), 2),
('Doces', 'Bolos, tortas e sobremesas', (SELECT id FROM restaurants WHERE slug = 'cafe-cia'), 3);

-- Insert menu items
INSERT INTO menu_items (name, description, price, category_id, restaurant_id, display_order) VALUES
-- Sabor Caseiro items
('Feijoada Completa', 'Feijoada com arroz, couve e farofa', 4500, (SELECT id FROM categories WHERE name = 'Pratos Principais' AND restaurant_id = (SELECT id FROM restaurants WHERE slug = 'sabor-caseiro')), (SELECT id FROM restaurants WHERE slug = 'sabor-caseiro'), 1),
('Moqueca de Peixe', 'Peixe fresco com leite de coco e azeite de dendê', 5200, (SELECT id FROM categories WHERE name = 'Pratos Principais' AND restaurant_id = (SELECT id FROM restaurants WHERE slug = 'sabor-caseiro')), (SELECT id FROM restaurants WHERE slug = 'sabor-caseiro'), 2),
('Churrasco Misto', 'Carne, linguiça e acompanhamentos', 6800, (SELECT id FROM categories WHERE name = 'Pratos Principais' AND restaurant_id = (SELECT id FROM restaurants WHERE slug = 'sabor-caseiro')), (SELECT id FROM restaurants WHERE slug = 'sabor-caseiro'), 3),
('Brigadeiro Gourmet', 'Brigadeiro tradicional com chocolate belga', 800, (SELECT id FROM categories WHERE name = 'Sobremesas' AND restaurant_id = (SELECT id FROM restaurants WHERE slug = 'sabor-caseiro')), (SELECT id FROM restaurants WHERE slug = 'sabor-caseiro'), 1),
('Suco Natural de Laranja', 'Suco fresco espremido na hora', 1200, (SELECT id FROM categories WHERE name = 'Bebidas' AND restaurant_id = (SELECT id FROM restaurants WHERE slug = 'sabor-caseiro')), (SELECT id FROM restaurants WHERE slug = 'sabor-caseiro'), 1),

-- Bella Italia items
('Margherita', 'Mussarela, tomate e manjericão', 3500, (SELECT id FROM categories WHERE name = 'Pizzas Salgadas' AND restaurant_id = (SELECT id FROM restaurants WHERE slug = 'bella-italia')), (SELECT id FROM restaurants WHERE slug = 'bella-italia'), 1),
('Calabresa', 'Calabresa, cebola e azeitonas', 3800, (SELECT id FROM categories WHERE name = 'Pizzas Salgadas' AND restaurant_id = (SELECT id FROM restaurants WHERE slug = 'bella-italia')), (SELECT id FROM restaurants WHERE slug = 'bella-italia'), 2),
('Quatro Queijos', 'Mussarela, provolone, parmesão e gorgonzola', 4200, (SELECT id FROM categories WHERE name = 'Pizzas Salgadas' AND restaurant_id = (SELECT id FROM restaurants WHERE slug = 'bella-italia')), (SELECT id FROM restaurants WHERE slug = 'bella-italia'), 3),
('Romeu e Julieta', 'Goiabada com queijo minas', 3200, (SELECT id FROM categories WHERE name = 'Pizzas Doces' AND restaurant_id = (SELECT id FROM restaurants WHERE slug = 'bella-italia')), (SELECT id FROM restaurants WHERE slug = 'bella-italia'), 1),
('Coca-Cola', 'Refrigerante 350ml', 600, (SELECT id FROM categories WHERE name = 'Bebidas' AND restaurant_id = (SELECT id FROM restaurants WHERE slug = 'bella-italia')), (SELECT id FROM restaurants WHERE slug = 'bella-italia'), 1),

-- Café & Cia items
('Pão na Chapa', 'Pão francês com manteiga e café', 1200, (SELECT id FROM categories WHERE name = 'Café da Manhã' AND restaurant_id = (SELECT id FROM restaurants WHERE slug = 'cafe-cia')), (SELECT id FROM restaurants WHERE slug = 'cafe-cia'), 1),
('Omelete Completo', 'Ovos, queijo, presunto e torradas', 1800, (SELECT id FROM categories WHERE name = 'Café da Manhã' AND restaurant_id = (SELECT id FROM restaurants WHERE slug = 'cafe-cia')), (SELECT id FROM restaurants WHERE slug = 'cafe-cia'), 2),
('Waffle com Frutas', 'Waffle quentinho com frutas da estação', 2200, (SELECT id FROM categories WHERE name = 'Café da Manhã' AND restaurant_id = (SELECT id FROM restaurants WHERE slug = 'cafe-cia')), (SELECT id FROM restaurants WHERE slug = 'cafe-cia'), 3),
('Sanduíche Natural', 'Pão integral com salada e queijo branco', 1500, (SELECT id FROM categories WHERE name = 'Lanches' AND restaurant_id = (SELECT id FROM restaurants WHERE slug = 'cafe-cia')), (SELECT id FROM restaurants WHERE slug = 'cafe-cia'), 1),
('Bolo de Chocolate', 'Bolo caseiro com cobertura de chocolate', 600, (SELECT id FROM categories WHERE name = 'Doces' AND restaurant_id = (SELECT id FROM restaurants WHERE slug = 'cafe-cia')), (SELECT id FROM restaurants WHERE slug = 'cafe-cia'), 1);

-- Insert sample analytics events
INSERT INTO analytics_events (event_type, event_data, restaurant_id) VALUES
('platform_launch', '{"version": "1.0.0", "features": ["landing_page", "admin_panel", "qr_codes"]}', NULL),
('admin_login', '{"source": "web_app"}', NULL),
('restaurant_view', '{"source": "direct"}', (SELECT id FROM restaurants WHERE slug = 'sabor-caseiro')),
('menu_item_view', '{"item_name": "Feijoada Completa"}', (SELECT id FROM restaurants WHERE slug = 'sabor-caseiro'));

-- Insert sample menu views
INSERT INTO menu_views (restaurant_id, viewed_at, ip_address, user_agent, device_type, browser) VALUES
((SELECT id FROM restaurants WHERE slug = 'sabor-caseiro'), NOW() - INTERVAL '1 day', '192.168.1.100', 'Mozilla/5.0 (compatible; RestaurantBot/1.0)', 'mobile', 'Chrome'),
((SELECT id FROM restaurants WHERE slug = 'bella-italia'), NOW() - INTERVAL '2 days', '192.168.1.101', 'Mozilla/5.0 (compatible; RestaurantBot/1.0)', 'desktop', 'Chrome'),
((SELECT id FROM restaurants WHERE slug = 'cafe-cia'), NOW() - INTERVAL '3 days', '192.168.1.102', 'Mozilla/5.0 (compatible; RestaurantBot/1.0)', 'mobile', 'Safari');

-- Insert platform metrics
INSERT INTO platform_metrics (metric_key, metric_value) VALUES
('total_restaurants', '3'),
('total_users', '4'),
('total_menu_items', '13'),
('platform_version', '"1.0.0"');

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_users_updated_at BEFORE UPDATE ON platform_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 DATABASE RESET AND SEED COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Data created:';
    RAISE NOTICE '   ✅ 4 Users (including admin)';
    RAISE NOTICE '   ✅ 3 Restaurants with complete menus';
    RAISE NOTICE '   ✅ 13 Menu items across all categories';
    RAISE NOTICE '   ✅ Analytics events and menu views';
    RAISE NOTICE '   ✅ Platform admin user: admin@cardapiodigital.com';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready to test the application!';
    RAISE NOTICE '   - Landing: /';
    RAISE NOTICE '   - Login: /login';
    RAISE NOTICE '   - Admin: /admin (use admin@cardapiodigital.com)';
    RAISE NOTICE '   - Restaurant menus: /menu/sabor-caseiro, /menu/bella-italia, /menu/cafe-cia';
END $$;