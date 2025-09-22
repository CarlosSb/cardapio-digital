# Guia de Instalação e Configuração

Este guia explica como instalar e configurar o sistema de Cardápio Digital em seu ambiente de desenvolvimento.

## 📋 Pré-requisitos

Antes de começar, certifique-se de que você tem os seguintes requisitos instalados:

- **Node.js** 18.x ou superior
- **npm** ou **pnpm** (recomendado)
- **Git**
- **Conta no Neon** (PostgreSQL) - [neon.tech](https://neon.tech)
- **Conta no Vercel** (opcional, para deploy) - [vercel.com](https://vercel.com)

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd cardapio-digital
```

### 2. Instale as Dependências

```bash
# Com pnpm (recomendado)
pnpm install

# Ou com npm
npm install
```

### 3. Configure as Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Banco de dados Neon
DATABASE_URL=postgresql://username:password@hostname/database

# URL base da aplicação (para produção)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Vercel Blob Storage (opcional)
BLOB_READ_WRITE_TOKEN=your_vercel_token
```

### 4. Configure o Banco de Dados

Execute os scripts SQL para criar as tabelas necessárias:

```bash
# Conecte-se ao seu banco Neon e execute os scripts em ordem:
# 1. scripts/create-users-table.sql
# 2. Crie as tabelas restaurants, categories e menu_items manualmente ou através de migrations
```

### 5. Execute a Aplicação

```bash
# Desenvolvimento
pnpm dev

# Build para produção
pnpm build
pnpm start
```

A aplicação estará disponível em `http://localhost:3000`

## 🗄️ Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas principais:

- **users**: Usuários do sistema
- **restaurants**: Informações dos restaurantes
- **categories**: Categorias do cardápio
- **menu_items**: Itens individuais do menu

## 🔧 Configuração de Produção

### Deploy no Vercel

1. **Conecte o repositório ao Vercel**
2. **Configure as variáveis de ambiente** no dashboard do Vercel
3. **Deploy automático** a cada push na branch main

### Variáveis de Ambiente para Produção

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
BLOB_READ_WRITE_TOKEN=your_vercel_token
NODE_ENV=production
```

## 🔐 Segurança

- As senhas são armazenadas com hash usando bcryptjs
- Cookies HTTP-only para autenticação
- Validação de dados em todas as APIs
- Sanitização de inputs

## 🐛 Solução de Problemas

### Erro de Conexão com Banco
- Verifique se a `DATABASE_URL` está correta
- Confirme se o IP está liberado no Neon
- Teste a conexão com um client PostgreSQL

### Erro de Upload de Imagens
- Configure o `BLOB_READ_WRITE_TOKEN` do Vercel
- Verifique as permissões do storage

### Erro de Build
- Limpe o cache: `rm -rf .next`
- Reinstale dependências: `pnpm install`
- Verifique se todas as variáveis de ambiente estão definidas

## 📞 Suporte

Para suporte técnico ou dúvidas sobre a instalação, consulte a [documentação técnica](technical-guide.md) ou abra uma issue no repositório.