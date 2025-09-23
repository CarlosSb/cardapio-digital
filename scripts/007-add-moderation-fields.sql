-- Adicionar campos de moderação (bloqueio/banimento) às tabelas existentes

-- Campos para usuários
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_reason TEXT;

-- Campos para restaurantes
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS blocked_by UUID REFERENCES users(id);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS blocked_reason TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES users(id);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS banned_reason TEXT;

-- Criar tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  performed_by UUID NOT NULL,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  details JSONB,
  ip_address INET,
  user_agent TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_at ON audit_logs(performed_at);

-- Atualizar queries das APIs para incluir os novos campos
-- Isso será feito automaticamente quando as APIs forem executadas