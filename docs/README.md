
# Cardápio Digital - Documentação

Sistema completo de cardápio digital com QR Code para restaurantes, desenvolvido com Next.js e PostgreSQL.

## 📋 Visão Geral

Este projeto é uma aplicação web moderna que permite aos restaurantes criar e gerenciar seus cardápios digitais de forma fácil e intuitiva. Os clientes podem acessar o cardápio através de um QR Code, visualizando todos os pratos, preços e descrições de forma elegante e responsiva.

## 🎯 Funcionalidades Principais

- **Dashboard Administrativo**: Interface completa para gerenciar restaurantes, categorias e itens do cardápio
- **Sistema de Autenticação**: Login seguro com controle de acesso
- **Gerenciamento de Restaurantes**: Cadastro e edição de informações do restaurante
- **Categorias do Cardápio**: Organização hierárquica dos itens do menu
- **Itens do Cardápio**: Cadastro completo com preços, descrições e imagens
- **Upload de Imagens**: Suporte para logos e fotos dos pratos
- **Geração de QR Code**: Criação automática de códigos QR para acesso ao cardápio
- **Interface Pública**: Visualização elegante e responsiva do cardápio
- **Controle de Disponibilidade**: Ativação/desativação de itens do menu

## 📁 Estrutura da Documentação

- [📖 Manual do Usuário](user-guide.md) - Guia completo para uso da aplicação
- [🔧 Guia Técnico](technical-guide.md) - Documentação técnica e arquitetura
- [📚 API Reference](api-reference.md) - Documentação das APIs
- [🗄️ Banco de Dados](database-schema.md) - Estrutura do banco de dados
- [⚙️ Instalação](installation.md) - Guia de instalação e configuração
- [❓ FAQ](faq.md) - Perguntas frequentes e soluções
- [🚀 Plano de Melhorias](improvement-plan.md) - Análise completa e roadmap de melhorias

## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL (Neon) + Drizzle ORM
- **Autenticação**: Cookies-based authentication
- **Upload**: Vercel Blob Storage
- **QR Code**: QRCode library
- **ORM**: Drizzle (TypeScript-native)

## 🗄️ Configuração do Banco de Dados

### Reset Completo (Recomendado)
Para começar do zero com dados de exemplo:

```bash
# Reset completo do banco com dados fictícios
npm run db:reset
```

Este comando:
- ✅ Remove todas as tabelas existentes
- ✅ Cria todas as tabelas do zero
- ✅ Popula com dados de exemplo
- ✅ Cria usuário admin e restaurantes

### Migração Gradual (Avançado)
Se preferir manter dados existentes:

```bash
# Scripts individuais (executar nesta ordem)
psql $DATABASE_URL -f scripts/002-add-menu-display-mode.sql
psql $DATABASE_URL -f scripts/003-create-analytics-tables.sql
psql $DATABASE_URL -f scripts/004-seed-data.sql

# Seed adicional via Drizzle
npm run db:seed
```

### Usuário Admin
- **Email**: admin@cardapiodigital.com
- **Acesso**: /admin (painel administrativo da plataforma)
- **Senha**: Qualquer senha (sistema de exemplo)