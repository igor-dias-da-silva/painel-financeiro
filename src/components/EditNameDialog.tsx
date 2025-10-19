"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';

interface EditNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFirstName: string;
  currentLastName: string;
  onSave: (newFirstName: string, newLastName: string) => void;
  isLoading: boolean;
}

export const EditNameDialog: React.FC<EditNameDialogProps> = ({
  open,
  onOpenChange,
  currentFirstName,
  currentLastName,
  onSave,
  isLoading,
}) => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState(currentFirstName);
  const [lastName, setLastName] = useState(currentLastName);

  useEffect(() => {
    setFirstName(currentFirstName);
    setLastName(currentLastName);
  }, [currentFirstName, currentLastName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      showError('O primeiro nome é obrigatório.');
      return;
    }
    onSave(firstName.trim(), lastName.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('dialogs.editNameTitle')}</DialogTitle>
          <DialogDescription>{t('dialogs.editNameDesc')}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="firstName">{t('dialogs.firstName')}</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Seu primeiro nome"
              className="mt-2 dark:bg-input dark:text-foreground dark:border-border"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="lastName">{t('dialogs.lastName')}</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Seu sobrenome"
              className="mt-2 dark:bg-input dark:text-foreground dark:border-border"
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('dialogs.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('dialogs.saving') : t('dialogs.saveName')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};