"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AccountForm from './AccountForm';
import { Account, AccountInsert } from '@/data/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAccount, deleteAccount } from '@/lib/data';
import { showError, showSuccess } from '@/utils/toast';
import { Loader2 } from 'lucide-react';

interface EditAccountDialogProps {
  account: Account;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AccountFormValues {
  name: string;
  balance: number;
  type: 'checking' | 'savings' | 'cash';
}

export const EditAccountDialog: React.FC<EditAccountDialogProps> = ({ account, open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const userId = account.user_id;

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<AccountInsert>) => updateAccount(account.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] }); // Atualiza saldos no dashboard
      showSuccess('Conta atualizada com sucesso!');
      onOpenChange(false);
    },
    onError: () => showError('Erro ao atualizar conta.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAccount(account.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      showSuccess('Conta excluída com sucesso!');
      onOpenChange(false);
    },
    onError: () => showError('Erro ao excluir conta. Verifique se há transações associadas.'),
  });

  const handleUpdateAccount = (data: AccountFormValues) => {
    const payload: Partial<AccountInsert> = {
      name: data.name,
      balance: data.balance,
      type: data.type,
    };
    updateMutation.mutate(payload);
  };

  const handleDelete = () => {
    if (confirm(`Tem certeza que deseja excluir a conta "${account.name}"?`)) {
      deleteMutation.mutate();
    }
  };

  const isMutating = updateMutation.isPending || deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{`Editar Conta: ${account.name}`}</DialogTitle>
          <DialogDescription>
            Altere os detalhes desta conta financeira.
          </DialogDescription>
        </DialogHeader>
        
        <AccountForm 
          initialData={account}
          onSubmit={handleUpdateAccount} 
          isSubmitting={isMutating} 
        />

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between pt-4">
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isMutating}
            className="w-full sm:w-auto mb-2 sm:mb-0"
          >
            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Excluir Conta'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isMutating}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};