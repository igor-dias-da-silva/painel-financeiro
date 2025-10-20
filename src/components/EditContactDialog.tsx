"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showError } from '@/utils/toast';
import { Loader2, Phone } from 'lucide-react';

interface EditContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPhoneNumber: string | null;
  onSave: (newPhoneNumber: string) => void;
  isLoading: boolean;
}

export const EditContactDialog: React.FC<EditContactDialogProps> = ({
  open,
  onOpenChange,
  currentPhoneNumber,
  onSave,
  isLoading,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(currentPhoneNumber || '');

  useEffect(() => {
    setPhoneNumber(currentPhoneNumber || '');
  }, [currentPhoneNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNumber = phoneNumber.trim();
    
    // Validação básica: permite vazio (para limpar) ou um número com pelo menos 8 dígitos
    if (trimmedNumber && trimmedNumber.length < 8) {
      showError('O número de contato deve ter pelo menos 8 dígitos.');
      return;
    }
    
    onSave(trimmedNumber);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Contato</DialogTitle>
          <DialogDescription>Atualize seu número de telefone para contato.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="phoneNumber">Número de Contato</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(XX) XXXXX-XXXX"
                className="pl-10 mt-2 dark:bg-input dark:text-foreground dark:border-border"
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Salvando...</> : 'Salvar Contato'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};