"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { createBoard } from '@/lib/database';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showError, showSuccess } from '@/utils/toast';

interface CreateBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateBoardDialog: React.FC<CreateBoardDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createBoardMutation = useMutation({
    mutationFn: createBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', user?.id] });
      showSuccess('Quadro criado com sucesso!');
      setTitle('');
      setDescription('');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Erro ao criar quadro:', error);
      showError('Erro ao criar quadro. Tente novamente.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user?.id) {
      showError('Título do quadro e ID do usuário são obrigatórios.');
      return;
    }

    createBoardMutation.mutate({
      title: title.trim(),
      description: description.trim() || null,
      user_id: user.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Quadro</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título do Quadro *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Planejamento do Projeto X"
              required
              disabled={createBoardMutation.isPending}
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uma breve descrição do quadro"
              rows={3}
              disabled={createBoardMutation.isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createBoardMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createBoardMutation.isPending}>
              {createBoardMutation.isPending ? 'Criando...' : 'Criar Quadro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};