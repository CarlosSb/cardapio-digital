# Arquitetura de Personalização de Logo no QR Code

## Visão Geral

Este documento descreve a implementação da funcionalidade de personalização de logos no QR code do cardápio digital, permitindo que restaurantes usem logos personalizados baseados no plano de assinatura.

## Requisitos Funcionais

### 1. Logo Padrão para Planos Gratuitos
- Usar `/digital-menu-logo.svg` como logo padrão
- Aplicado automaticamente a todos os QR codes de planos gratuitos
- Logo centralizado mantendo escaneabilidade

### 2. Logo Personalizado para Planos Pagos
- Permitir upload de logo personalizado para assinantes pagos
- Suporte a formato SVG para escalabilidade
- Validação de tamanho e formato
- Armazenamento seguro dos arquivos

### 3. Integração com Sistema de Planos
- Verificação automática do plano do restaurante
- Aplicação condicional do logo baseado no plano
- Interface diferenciada para planos gratuitos vs pagos

### 4. Funcionalidades Técnicas
- Preview em tempo real do QR code
- Download em alta resolução (PNG)
- Redimensionamento automático do logo
- Manutenção da escaneabilidade

## Arquitetura Técnica

### Schema do Banco de Dados

```sql
-- Adicionar campo para logo personalizado no QR code
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS custom_qr_logo_url TEXT;
```

### Componentes Principais

#### 1. QRCodeGenerator (Atualizado)
- Recebe informações do plano do restaurante
- Aplica logo padrão ou personalizado baseado no plano
- Mantém escaneabilidade com tratamento adequado do logo

#### 2. API Endpoints
- `POST /api/upload/qr-logo` - Upload de logo personalizado
- `DELETE /api/upload/qr-logo` - Remoção de logo personalizado
- Validação de plano pago antes do upload

#### 3. Páginas Atualizadas
- `/dashboard/qr-code` - Interface condicional baseada no plano
- `/dashboard/plans` - Seção de gerenciamento de logo para assinantes

### Fluxo de Funcionamento

#### Para Planos Gratuitos:
1. QR code gerado com logo padrão `/digital-menu-logo.svg`
2. Interface mostra informação sobre upgrade para logo personalizado
3. Download funciona normalmente

#### Para Planos Pagos:
1. Verificação se restaurante tem logo personalizado
2. Se não tem: mostra interface de upload
3. Se tem: usa logo personalizado no QR code
4. Preview e download com logo aplicado

### Considerações de Segurança

- Validação de tipo de arquivo (apenas SVG)
- Limitação de tamanho de arquivo (máx. 2MB)
- Sanitização de conteúdo SVG
- Controle de acesso baseado no plano

### Performance

- Cache de logos processados
- Otimização de SVG para web
- Lazy loading de previews
- Compressão de imagens de download

## Implementação Passo a Passo

### Fase 1: Schema e API
1. Criar migration para adicionar campo `custom_qr_logo_url`
2. Implementar endpoints de upload/download
3. Adicionar validações de plano

### Fase 2: Componentes
1. Atualizar QRCodeGenerator para aceitar logos dinâmicos
2. Criar componente de upload de logo
3. Implementar preview em tempo real

### Fase 3: Interfaces
1. Atualizar página QR code com lógica condicional
2. Adicionar seção de logo na página de planos
3. Implementar feedback visual

### Fase 4: Testes e Otimização
1. Testes de escaneabilidade com diferentes logos
2. Validação de performance
3. Testes de segurança
4. Otimização de UX

## Benefícios

- **Personalização**: Restaurantes podem ter identidade visual no QR code
- **Monetização**: Funcionalidade premium incentiva upgrades
- **Escaneabilidade**: Logo não compromete a leitura do código
- **Flexibilidade**: Suporte a diferentes formatos e tamanhos
- **Performance**: Implementação otimizada e cacheada