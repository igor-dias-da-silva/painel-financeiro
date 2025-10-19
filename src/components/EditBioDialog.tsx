"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { showError, showSuccess } from '@/utils/toast';
import { useTranslation } from 'react-i18next';

interface EditBioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBio: string;
  onSave: (newBio: string) => void;
  isLoading: boolean;
}

export const EditBioDialog: React.FC<EditBioDialogProps> = ({
  open,
  onOpenChange,
  currentBio,
  onSave,
  isLoading,
}) => {
  const { t } = useTranslation();
  const [bio, setBio] = useState(currentBio);

  useEffect(() => {
    setBio(currentBio);
  }, [currentBio]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(bio);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('dialogs.editBioTitle')}</DialogTitle>
          <DialogDescription>{t('dialogs.editBioDesc')}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="bio">{t('dialogs.yourBio')}</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Conte um pouco sobre você..."
              className="mt-2 dark:bg-input dark:text-foreground dark:border-border"
              rows={5}
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
              {isLoading ? t('dialogs.saving') : t('dialogs.saveBio')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};