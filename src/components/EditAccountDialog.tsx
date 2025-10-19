"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AccountForm from './AccountForm';
import { Account, AccountInsert } from '@/data/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAccount, deleteAccount } from '@/lib/data';
import { showError, showSuccess } from '@/utils/toast';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const userId = account.user_id;

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<AccountInsert>) => updateAccount(account.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] }); // Atualiza saldos no dashboard
      showSuccess(t('accounts.updateSuccess'));
      onOpenChange(false);
    },
    onError: () => showError(t('accounts.updateError')),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAccount(account.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      showSuccess(t('accounts.deleteSuccess'));
      onOpenChange(false);
    },
    onError: () => showError(t('accounts.deleteError')),
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
    if (confirm(t('accounts.confirmDelete', { name: account.name }))) {
      deleteMutation.mutate();
    }
  };

  const isMutating = updateMutation.isPending || deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('accounts.editTitle', { name: account.name })}</DialogTitle>
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
            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : t('accounts.delete')}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isMutating}
            className="w-full sm:w-auto"
          >
            {t('accounts.cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};