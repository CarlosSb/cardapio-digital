import { sql } from '../lib/db/index.js';

async function createPlansTable() {
  try {
    console.log('🚀 Criando tabela plans...');

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
    `;

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
    `;

    console.log('✅ Tabela plans criada com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar tabela plans:', error);
    process.exit(1);
  }
}

createPlansTable();