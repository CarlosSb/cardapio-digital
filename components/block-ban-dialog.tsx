"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, Ban } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BlockBanDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (action: 'block' | 'ban', reason: string) => void
  entityType: 'user' | 'restaurant'
  entityName: string
  currentStatus: {
    isBlocked: boolean
    isBanned: boolean
  }
  isLoading?: boolean
}

export function BlockBanDialog({
  isOpen,
  onClose,
  onConfirm,
  entityType,
  entityName,
  currentStatus,
  isLoading = false
}: BlockBanDialogProps) {
  const [reason, setReason] = useState("")
  const [selectedAction, setSelectedAction] = useState<'block' | 'ban' | null>(null)

  const handleConfirm = () => {
    if (selectedAction && reason.trim()) {
      onConfirm(selectedAction, reason.trim())
      setReason("")
      setSelectedAction(null)
    }
  }

  const handleClose = () => {
    setReason("")
    setSelectedAction(null)
    onClose()
  }

  const entityLabel = entityType === 'user' ? 'usuário' : 'restaurante'

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Moderação de {entityLabel}
          </DialogTitle>
          <DialogDescription>
            Gerenciar status de {entityLabel}: <strong>{entityName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status atual */}
          <div className="space-y-2">
            <Label>Status atual:</Label>
            <div className="flex gap-2">
              {currentStatus.isBanned ? (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Ban className="h-3 w-3" />
                  Banido
                </Badge>
              ) : currentStatus.isBlocked ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Bloqueado
                </Badge>
              ) : (
                <Badge variant="default">Ativo</Badge>
              )}
            </div>
          </div>

          {/* Ações disponíveis */}
          <div className="space-y-2">
            <Label>Ação:</Label>
            <div className="grid grid-cols-1 gap-2">
              {!currentStatus.isBanned && (
                <Button
                  variant={selectedAction === 'block' ? 'default' : 'outline'}
                  onClick={() => setSelectedAction('block')}
                  className="justify-start"
                  disabled={isLoading}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {currentStatus.isBlocked ? 'Desbloquear' : 'Bloquear'} {entityLabel}
                </Button>
              )}

              {!currentStatus.isBanned && !currentStatus.isBlocked && (
                <Button
                  variant={selectedAction === 'ban' ? 'destructive' : 'outline'}
                  onClick={() => setSelectedAction('ban')}
                  className="justify-start"
                  disabled={isLoading}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Banir Permanentemente
                </Button>
              )}
            </div>
          </div>

          {/* Motivo */}
          {selectedAction && (
            <div className="space-y-2">
              <Label htmlFor="reason">
                Motivo {selectedAction === 'ban' ? '(obrigatório)' : '(obrigatório)'}:
              </Label>
              <Textarea
                id="reason"
                placeholder={`Digite o motivo para ${selectedAction === 'block' ? 'bloquear' : 'banir'} este ${entityLabel}...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>
          )}

          {/* Avisos importantes */}
          {selectedAction === 'ban' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> O banimento é <strong>permanente e irreversível</strong>.
                Esta ação só pode ser realizada por super administradores.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedAction || !reason.trim() || isLoading}
            variant={selectedAction === 'ban' ? 'destructive' : 'default'}
          >
            {isLoading ? 'Processando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}