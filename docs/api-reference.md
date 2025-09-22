# API Reference - Cardápio Digital

Documentação completa das APIs REST do sistema de Cardápio Digital.

## 🔐 Autenticação

Todas as APIs (exceto autenticação) requerem autenticação via cookies de sessão.

### POST /api/auth/signin

Realiza o login do usuário.

**Request Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Usuário não encontrado"
}
```

### POST /api/auth/signup

Cria uma nova conta de usuário.

**Request Body:**
```json
{
  "email": "usuario@email.com",
  "name": "Nome do Usuário",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Usuário já existe"
}
```

### POST /api/auth/signout

Realiza o logout do usuário.

**Response (200):**
Redireciona para `/login`

## 🏪 Restaurantes

### GET /api/restaurants

Lista restaurantes do usuário autenticado.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Nome do Restaurante",
    "description": "Descrição do restaurante",
    "slug": "restaurante-slug",
    "owner_email": "dono@email.com",
    "logo_url": "https://...",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### POST /api/restaurants

Cria um novo restaurante.

**Request Body:**
```json
{
  "name": "Nome do Restaurante",
  "description": "Descrição opcional",
  "slug": "restaurante-unico",
  "logo_url": "https://..."
}
```

**Response (200):**
```json
{
  "success": true,
  "restaurant": {
    "id": "uuid",
    "name": "Nome do Restaurante",
    "description": "Descrição opcional",
    "slug": "restaurante-unico",
    "owner_email": "dono@email.com",
    "logo_url": "https://...",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Este slug já está em uso"
}
```

### PUT /api/restaurants

Atualiza um restaurante existente.

**Request Body:**
```json
{
  "id": "uuid",
  "name": "Novo Nome",
  "description": "Nova descrição",
  "slug": "novo-slug",
  "logo_url": "https://..."
}
```

**Response (200):**
```json
{
  "success": true,
  "restaurant": { /* dados atualizados */ }
}
```

## 🏷️ Categorias

### GET /api/categories

Lista todas as categorias de um restaurante.

**Query Parameters:**
- `restaurant_id` (opcional): Filtrar por restaurante

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Entradas",
    "description": "Deliciosas entradas",
    "restaurant_id": "uuid",
    "display_order": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### POST /api/categories

Cria uma nova categoria.

**Request Body:**
```json
{
  "name": "Sobremesas",
  "description": "Doces incríveis",
  "restaurant_id": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "category": {
    "id": "uuid",
    "name": "Sobremesas",
    "description": "Doces incríveis",
    "restaurant_id": "uuid",
    "display_order": 2,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /api/categories/[id]

Atualiza uma categoria específica.

**Request Body:**
```json
{
  "name": "Sobremesas Geladas",
  "description": "Sorvetes e doces frios",
  "display_order": 3
}
```

**Response (200):**
```json
{
  "success": true,
  "category": { /* dados atualizados */ }
}
```

### POST /api/categories/[id]/reorder

Reordena as categorias de um restaurante.

**Request Body:**
```json
{
  "categories": [
    {"id": "uuid1", "display_order": 1},
    {"id": "uuid2", "display_order": 2},
    {"id": "uuid3", "display_order": 3}
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Categorias reordenadas com sucesso"
}
```

## 🍽️ Itens do Cardápio

### GET /api/menu-items

Lista itens do cardápio.

**Query Parameters:**
- `restaurant_id` (opcional): Filtrar por restaurante
- `category_id` (opcional): Filtrar por categoria

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Pizza Margherita",
    "description": "Molho de tomate, muçarela e manjericão",
    "price": 35.90,
    "image_url": "https://...",
    "category_id": "uuid",
    "restaurant_id": "uuid",
    "is_available": true,
    "display_order": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### POST /api/menu-items

Cria um novo item do cardápio.

**Request Body:**
```json
{
  "name": "Pizza Margherita",
  "description": "Molho de tomate, muçarela e manjericão",
  "price": 35.90,
  "image_url": "https://...",
  "category_id": "uuid",
  "restaurant_id": "uuid",
  "is_available": true
}
```

**Response (200):**
```json
{
  "success": true,
  "menuItem": { /* dados do item criado */ }
}
```

### PUT /api/menu-items/[id]

Atualiza um item do cardápio.

**Request Body:**
```json
{
  "name": "Pizza Margherita Especial",
  "description": "Molho de tomate, muçarela fresca e manjericão orgânico",
  "price": 38.90,
  "image_url": "https://...",
  "is_available": true
}
```

**Response (200):**
```json
{
  "success": true,
  "menuItem": { /* dados atualizados */ }
}
```

### POST /api/menu-items/[id]/toggle

Alterna a disponibilidade de um item.

**Response (200):**
```json
{
  "success": true,
  "menuItem": {
    "id": "uuid",
    "is_available": false
  }
}
```

## 📤 Upload de Arquivos

### POST /api/upload

Faz upload de imagens para o sistema.

**Request:** FormData com campo `file`

**Response (200):**
```json
{
  "success": true,
  "url": "https://blob.vercel-storage.com/...",
  "filename": "image.jpg"
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Tipo de arquivo não suportado"
}
```

## 📋 Códigos de Status HTTP

### Sucesso
- `200` - OK: Operação realizada com sucesso
- `201` - Created: Recurso criado com sucesso

### Erros do Cliente
- `400` - Bad Request: Dados inválidos ou mal formatados
- `401` - Unauthorized: Não autenticado
- `403` - Forbidden: Acesso negado
- `404` - Not Found: Recurso não encontrado

### Erros do Servidor
- `500` - Internal Server Error: Erro interno do servidor

## 🔧 Tratamento de Erros

Todas as respostas de erro seguem o formato:

```json
{
  "success": false,
  "error": "Mensagem de erro descritiva"
}
```

## 📝 Validações

### Restaurantes
- `name`: Obrigatório, mínimo 2 caracteres
- `slug`: Obrigatório, apenas letras, números e hífens
- `slug`: Deve ser único por usuário

### Categorias
- `name`: Obrigatório, mínimo 2 caracteres
- `restaurant_id`: Obrigatório, deve existir

### Itens do Cardápio
- `name`: Obrigatório, mínimo 2 caracteres
- `price`: Obrigatório, deve ser número positivo
- `category_id`: Obrigatório, deve existir
- `restaurant_id`: Obrigatório, deve existir

### Upload
- Tipos suportados: `image/jpeg`, `image/png`, `image/webp`
- Tamanho máximo: 2MB
- Dimensões: Recomendado 800x600 ou superior

## 🔐 Segurança

- **Autenticação**: Cookies HTTP-only
- **SQL Injection**: Queries parametrizadas
- **XSS**: Sanitização de inputs
- **CSRF**: Proteção via SameSite cookies
- **Rate Limiting**: Implementado nas APIs críticas

## 📊 Limites e Quotas

- **Itens por categoria**: Sem limite
- **Categorias por restaurante**: Sem limite
- **Imagens por item**: 1 imagem
- **Tamanho de imagem**: Máximo 2MB
- **Requisições por minuto**: 100 por IP

## 🔄 Versionamento

A API é versionada através da URL:
- `/api/v1/` - Versão atual
- Futuras versões: `/api/v2/`, `/api/v3/`

## 📞 Suporte

Para dúvidas sobre a API:
- Consulte esta documentação
- Verifique os exemplos de uso
- Entre em contato com o suporte técnico