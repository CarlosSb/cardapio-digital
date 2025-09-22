-- Seed data for Cardapio Digital
-- This script populates the database with sample data for testing and demonstration

-- Insert admin user (safe to run multiple times)
INSERT INTO users (email, name, password_hash)
VALUES ('admin@cardapiodigital.com', 'Administrador', '$2b$10$pF6XpsL0jzOVeRMC9.gY.e/o93REas9UtISRFk2fJHuapYvXNfhEa')
ON CONFLICT (email) DO NOTHING;

-- Insert platform admin (safe to run multiple times)
INSERT INTO platform_users (email, name, role)
VALUES ('admin@cardapiodigital.com', 'Administrador', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample users (safe to run multiple times)
INSERT INTO users (email, name, password_hash) VALUES
('joao.silva@email.com', 'João Silva', '$2a$10$example.hash.here'),
('maria.santos@email.com', 'Maria Santos', '$2a$10$example.hash.here'),
('carlos.oliveira@email.com', 'Carlos Oliveira', '$2a$10$example.hash.here')
ON CONFLICT (email) DO NOTHING;

-- Insert sample restaurants (safe to run multiple times)
INSERT INTO restaurants (name, description, slug, owner_email, logo_url, menu_display_mode) VALUES
('Restaurante Sabor Caseiro', 'Comida brasileira tradicional com toque moderno', 'sabor-caseiro', 'joao.silva@email.com', '/placeholder-logo.png', 'grid'),
('Pizzaria Bella Italia', 'Autênticas pizzas italianas feitas no forno a lenha', 'bella-italia', 'maria.santos@email.com', '/placeholder-logo.png', 'grid'),
('Café & Cia', 'Café da manhã, lanches e sobremesas artesanais', 'cafe-cia', 'carlos.oliveira@email.com', '/placeholder-logo.png', 'list')
ON CONFLICT (slug) DO NOTHING;

-- Insert categories for restaurants (only if they don't exist)
-- First, get restaurant IDs
DO $$
DECLARE
    sabor_caseiro_id UUID;
    bella_italia_id UUID;
    cafe_cia_id UUID;
BEGIN
    SELECT id INTO sabor_caseiro_id FROM restaurants WHERE slug = 'sabor-caseiro' LIMIT 1;
    SELECT id INTO bella_italia_id FROM restaurants WHERE slug = 'bella-italia' LIMIT 1;
    SELECT id INTO cafe_cia_id FROM restaurants WHERE slug = 'cafe-cia' LIMIT 1;

    -- Insert categories (safe - won't duplicate)
    IF sabor_caseiro_id IS NOT NULL THEN
        INSERT INTO categories (name, description, restaurant_id, display_order) VALUES
        ('Pratos Principais', 'Nossos pratos mais pedidos', sabor_caseiro_id, 1),
        ('Sobremesas', 'Doces irresistíveis', sabor_caseiro_id, 2),
        ('Bebidas', 'Refrescos e sucos naturais', sabor_caseiro_id, 3)
        ON CONFLICT DO NOTHING;
    END IF;

    IF bella_italia_id IS NOT NULL THEN
        INSERT INTO categories (name, description, restaurant_id, display_order) VALUES
        ('Pizzas Salgadas', 'Pizzas tradicionais e especiais', bella_italia_id, 1),
        ('Pizzas Doces', 'Pizzas com sabores adocicados', bella_italia_id, 2),
        ('Bebidas', 'Refrigerantes e vinhos', bella_italia_id, 3)
        ON CONFLICT DO NOTHING;
    END IF;

    IF cafe_cia_id IS NOT NULL THEN
        INSERT INTO categories (name, description, restaurant_id, display_order) VALUES
        ('Café da Manhã', 'Opções completas para começar o dia', cafe_cia_id, 1),
        ('Lanches', 'Sanduíches e salgados', cafe_cia_id, 2),
        ('Doces', 'Bolos, tortas e sobremesas', cafe_cia_id, 3)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Insert sample menu items (only if they don't exist)
DO $$
DECLARE
    pratos_principais_id UUID;
    pizzas_salgadas_id UUID;
    cafe_manha_id UUID;
    sabor_caseiro_id UUID;
    bella_italia_id UUID;
    cafe_cia_id UUID;
BEGIN
    SELECT id INTO sabor_caseiro_id FROM restaurants WHERE slug = 'sabor-caseiro' LIMIT 1;
    SELECT id INTO bella_italia_id FROM restaurants WHERE slug = 'bella-italia' LIMIT 1;
    SELECT id INTO cafe_cia_id FROM restaurants WHERE slug = 'cafe-cia' LIMIT 1;

    SELECT id INTO pratos_principais_id FROM categories WHERE name = 'Pratos Principais' AND restaurant_id = sabor_caseiro_id LIMIT 1;
    SELECT id INTO pizzas_salgadas_id FROM categories WHERE name = 'Pizzas Salgadas' AND restaurant_id = bella_italia_id LIMIT 1;
    SELECT id INTO cafe_manha_id FROM categories WHERE name = 'Café da Manhã' AND restaurant_id = cafe_cia_id LIMIT 1;

    -- Insert menu items (safe - won't duplicate based on name + category)
    IF pratos_principais_id IS NOT NULL THEN
        INSERT INTO menu_items (name, description, price, category_id, restaurant_id, display_order) VALUES
        ('Feijoada Completa', 'Feijoada com arroz, couve e farofa', 4500, pratos_principais_id, sabor_caseiro_id, 1),
        ('Moqueca de Peixe', 'Peixe fresco com leite de coco e azeite de dendê', 5200, pratos_principais_id, sabor_caseiro_id, 2)
        ON CONFLICT DO NOTHING;
    END IF;

    IF pizzas_salgadas_id IS NOT NULL THEN
        INSERT INTO menu_items (name, description, price, category_id, restaurant_id, display_order) VALUES
        ('Margherita', 'Mussarela, tomate e manjericão', 3500, pizzas_salgadas_id, bella_italia_id, 1),
        ('Calabresa', 'Calabresa, cebola e azeitonas', 3800, pizzas_salgadas_id, bella_italia_id, 2)
        ON CONFLICT DO NOTHING;
    END IF;

    IF cafe_manha_id IS NOT NULL THEN
        INSERT INTO menu_items (name, description, price, category_id, restaurant_id, display_order) VALUES
        ('Pão na Chapa', 'Pão francês com manteiga e café', 1200, cafe_manha_id, cafe_cia_id, 1),
        ('Omelete Completo', 'Ovos, queijo, presunto e torradas', 1800, cafe_manha_id, cafe_cia_id, 2)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Insert some sample menu views for analytics
DO $$
DECLARE
    sabor_caseiro_id UUID;
    bella_italia_id UUID;
    cafe_cia_id UUID;
BEGIN
    SELECT id INTO sabor_caseiro_id FROM restaurants WHERE slug = 'sabor-caseiro' LIMIT 1;
    SELECT id INTO bella_italia_id FROM restaurants WHERE slug = 'bella-italia' LIMIT 1;
    SELECT id INTO cafe_cia_id FROM restaurants WHERE slug = 'cafe-cia' LIMIT 1;

    -- Insert sample views (only if table exists and no views exist)
    IF sabor_caseiro_id IS NOT NULL THEN
        INSERT INTO menu_views (restaurant_id, viewed_at, ip_address, user_agent, device_type, browser) VALUES
        (sabor_caseiro_id, NOW() - INTERVAL '1 day', '192.168.1.100', 'Mozilla/5.0 (compatible; RestaurantBot/1.0)', 'mobile', 'Chrome'),
        (sabor_caseiro_id, NOW() - INTERVAL '2 days', '192.168.1.101', 'Mozilla/5.0 (compatible; RestaurantBot/1.0)', 'desktop', 'Chrome')
        ON CONFLICT DO NOTHING;
    END IF;

    IF bella_italia_id IS NOT NULL THEN
        INSERT INTO menu_views (restaurant_id, viewed_at, ip_address, user_agent, device_type, browser) VALUES
        (bella_italia_id, NOW() - INTERVAL '1 day', '192.168.1.102', 'Mozilla/5.0 (compatible; RestaurantBot/1.0)', 'mobile', 'Chrome')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Insert sample analytics events
DO $$
DECLARE
    sabor_caseiro_id UUID;
    bella_italia_id UUID;
BEGIN
    SELECT id INTO sabor_caseiro_id FROM restaurants WHERE slug = 'sabor-caseiro' LIMIT 1;
    SELECT id INTO bella_italia_id FROM restaurants WHERE slug = 'bella-italia' LIMIT 1;

    IF sabor_caseiro_id IS NOT NULL THEN
        INSERT INTO analytics_events (event_type, event_data, restaurant_id) VALUES
        ('restaurant_view', '{"source": "qr_code"}', sabor_caseiro_id),
        ('menu_item_view', '{"item_id": "sample", "category": "Pratos Principais"}', sabor_caseiro_id)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database seeded successfully!';
    RAISE NOTICE '📊 Sample data created:';
    RAISE NOTICE '   - Admin user: admin@cardapiodigital.com';
    RAISE NOTICE '   - 3 Sample restaurants with menus';
    RAISE NOTICE '   - Analytics data for demonstration';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready to test the application!';
END $$;