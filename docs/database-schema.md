# Banco de Dados - Schema e Estrutura

Documentação completa da estrutura do banco de dados PostgreSQL utilizado pelo sistema de Cardápio Digital.

## 🗄️ Visão Geral

O sistema utiliza **PostgreSQL** através do serviço **Neon** para armazenamento de dados. A estrutura é normalizada e otimizada para performance.

## 📊 Tabelas Principais

### users

Tabela de usuários do sistema (donos de restaurantes).

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

**Campos:**
- `id`: Identificador único (UUID)
- `email`: Email único do usuário
- `name`: Nome completo do usuário
- `password_hash`: Hash da senha (bcrypt)
- `created_at`: Data de criação
- `updated_at`: Última atualização
- `deleted_at`: Soft delete (opcional)

**Índices:**
- `idx_users_email`: Para busca rápida por email

### restaurants

Informações dos restaurantes.

```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  owner_email VARCHAR(255) NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único
- `name`: Nome do restaurante
- `description`: Descrição opcional
- `slug`: URL slug única (ex: meu-restaurante)
- `owner_email`: Email do dono (FK para users)
- `logo_url`: URL do logo
- `created_at`: Data de criação
- `updated_at`: Última atualização

**Índices:**
- `idx_restaurants_slug`: Para busca por slug
- `idx_restaurants_owner_email`: Para filtrar por dono

### categories

Categorias do cardápio (entradas, pratos principais, etc.).

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único
- `name`: Nome da categoria
- `description`: Descrição opcional
- `restaurant_id`: Restaurante proprietário (FK)
- `display_order`: Ordem de exibição
- `created_at`: Data de criação
- `updated_at`: Última atualização

**Índices:**
- `idx_categories_restaurant_id`: Para filtrar por restaurante
- `idx_categories_restaurant_order`: Para ordenação

### menu_items

Itens individuais do cardápio (pratos, bebidas, etc.).

```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único
- `name`: Nome do item
- `description`: Descrição detalhada
- `price`: Preço em reais (2 casas decimais)
- `image_url`: URL da imagem do prato
- `category_id`: Categoria (FK)
- `restaurant_id`: Restaurante proprietário (FK)
- `is_available`: Disponibilidade do item
- `display_order`: Ordem de exibição
- `created_at`: Data de criação
- `updated_at`: Última atualização

**Constraints:**
- `price >= 0`: Preços não podem ser negativos

**Índices:**
- `idx_menu_items_restaurant_id`: Para filtrar por restaurante
- `idx_menu_items_category_id`: Para filtrar por categoria
- `idx_menu_items_available`: Para filtrar itens disponíveis

## 🔗 Relacionamentos

### Relacionamento Usuário-Restaurante
```
users (1) ─── (N) restaurants
   ↑              ↑
   │              │
   └── owner_email FK
```

### Relacionamento Restaurante-Categoria
```
restaurants (1) ─── (N) categories
      ↑                   ↑
      │                   │
      └── restaurant_id FK
```

### Relacionamento Categoria-Item
```
categories (1) ─── (N) menu_items
    ↑                   ↑
    │                   │
    └── category_id FK
```

### Relacionamento Restaurante-Item
```
restaurants (1) ─── (N) menu_items
      ↑                   ↑
      │                   │
      └── restaurant_id FK
```

## 🗂️ Índices de Performance

### Índices Compostos
```sql
-- Para queries de menu público
CREATE INDEX idx_menu_items_public ON menu_items(restaurant_id, is_available, display_order);

-- Para dashboard do usuário
CREATE INDEX idx_restaurants_user ON restaurants(owner_email, created_at);

-- Para ordenação de categorias
CREATE INDEX idx_categories_order ON categories(restaurant_id, display_order);
```

### Índices Parciais
```sql
-- Apenas itens disponíveis
CREATE INDEX idx_menu_items_available ON menu_items(is_available) WHERE is_available = TRUE;

-- Restaurantes ativos (não deletados)
CREATE INDEX idx_restaurants_active ON restaurants(owner_email) WHERE deleted_at IS NULL;
```

## 🔧 Triggers e Funções

### Trigger de Updated At

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas as tabelas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 📈 Queries Otimizadas

### Menu Público (Por Slug)
```sql
SELECT r.*, c.*, m.*
FROM restaurants r
LEFT JOIN categories c ON r.id = c.restaurant_id
LEFT JOIN menu_items m ON c.id = m.category_id
WHERE r.slug = $1 AND m.is_available = TRUE
ORDER BY c.display_order, m.display_order;
```

### Dashboard do Usuário
```sql
-- Estatísticas
SELECT
  (SELECT COUNT(*) FROM restaurants WHERE owner_email = $1) as restaurants,
  (SELECT COUNT(*) FROM categories c JOIN restaurants r ON c.restaurant_id = r.id WHERE r.owner_email = $1) as categories,
  (SELECT COUNT(*) FROM menu_items m JOIN restaurants r ON m.restaurant_id = r.id WHERE r.owner_email = $1) as menu_items;
```

### Itens por Categoria
```sql
SELECT * FROM menu_items
WHERE category_id = $1 AND is_available = TRUE
ORDER BY display_order ASC, created_at ASC;
```

## 🔒 Segurança

### Row Level Security (RLS)

```sql
-- Usuários só veem seus próprios restaurantes
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY restaurant_owner_policy ON restaurants
  FOR ALL USING (owner_email = current_user_email());

-- Similar para outras tabelas...
```

### Função de Validação
```sql
CREATE OR REPLACE FUNCTION validate_restaurant_owner(restaurant_uuid UUID, user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM restaurants
    WHERE id = restaurant_uuid AND owner_email = user_email
  );
END;
$$ LANGUAGE plpgsql;
```

## 📊 Estatísticas e Monitoramento

### Views para Relatórios

```sql
-- Resumo por restaurante
CREATE VIEW restaurant_summary AS
SELECT
  r.id,
  r.name,
  r.owner_email,
  COUNT(DISTINCT c.id) as categories_count,
  COUNT(m.id) as menu_items_count,
  COUNT(CASE WHEN m.is_available THEN 1 END) as available_items
FROM restaurants r
LEFT JOIN categories c ON r.id = c.restaurant_id
LEFT JOIN menu_items m ON r.id = m.restaurant_id
GROUP BY r.id, r.name, r.owner_email;

-- Itens mais caros por categoria
CREATE VIEW expensive_items AS
SELECT
  r.name as restaurant_name,
  c.name as category_name,
  m.name as item_name,
  m.price,
  ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY m.price DESC) as rank_in_category
FROM menu_items m
JOIN categories c ON m.category_id = c.id
JOIN restaurants r ON m.restaurant_id = r.id
WHERE m.is_available = TRUE;
```

## 🔄 Backup e Recuperação

### Estratégia de Backup
- **Automático**: Neon cuida dos backups
- **Frequência**: Diária
- **Retenção**: 7 dias
- **Point-in-time**: Até 24h

### Scripts de Migração

```sql
-- Adicionar nova coluna
ALTER TABLE menu_items ADD COLUMN preparation_time INTEGER;

-- Criar nova tabela
CREATE TABLE menu_item_allergens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  allergen_name VARCHAR(100) NOT NULL
);
```

## 📈 Performance

### Queries Lentas Identificadas
```sql
-- Monitorar queries > 1 segundo
SELECT query, mean_time, calls
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC;
```

### Recomendações de Otimização
1. **Paginação**: Para listas grandes
2. **Índices compostos**: Para filtros múltiplos
3. **Materialized views**: Para relatórios
4. **Connection pooling**: Para alta concorrência

## 🛠️ Manutenção

### Scripts de Limpeza

```sql
-- Remover itens antigos indisponíveis
DELETE FROM menu_items
WHERE is_available = FALSE
  AND updated_at < NOW() - INTERVAL '1 year';

-- Otimizar tabelas
VACUUM ANALYZE;
```

### Monitoramento de Saúde

```sql
-- Espaço usado por tabela
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 📝 Logs e Auditoria

### Tabela de Auditoria (Opcional)

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  user_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Este schema foi projetado para ser:
- ✅ **Escalável**: Suporta múltiplos restaurantes
- ✅ **Performático**: Índices otimizados
- ✅ **Seguro**: RLS e validações
- ✅ **Flexível**: Estrutura normalizada
- ✅ **Monitorável**: Logs e métricas