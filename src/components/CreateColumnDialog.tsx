"use client";

import React, { useState } from 'react';
import { Column as SupabaseColumn } from '@/lib/database'; // Import SupabaseColumn
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showError } from '@/utils/toast';

interface CreateColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  onColumnCreate: (column: Omit<SupabaseColumn, 'id' | 'created_at' | 'updated_at'>) => void;
}

export const CreateColumnDialog: React.FC<CreateColumnDialogProps> = ({
  open,
  onOpenChange,
  boardId,
  onColumnCreate,
}) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      showError('Título da coluna é obrigatório.');
      return;
    }

    const newColumn: Omit<SupabaseColumn, 'id' | 'created_at' | 'updated_at'> = {
      title: title.trim(),
      board_id: boardId,
      order: 0, // Order will be determined by the backend or reordered after creation
    };

    onColumnCreate(newColumn);
    
    // Reset form
    setTitle('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Coluna</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Coluna</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da coluna"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar Coluna</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};