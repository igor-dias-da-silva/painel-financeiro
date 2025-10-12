"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Board, updateBoard } from '@/lib/database';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from '@/hooks/useAuth';

interface EditBoardDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: Board | null;
}

export const EditBoardDetailsDialog: React.FC<EditBoardDetailsDialogProps> = ({
  open,
  onOpenChange,
  board,
}) => {
  const [title, setTitle] = useState(board?.title || '');
  const [description, setDescription] = useState(board?.description || '');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (board) {
      setTitle(board.title);
      setDescription(board.description || '');
    }
  }, [board]);

  const updateBoardMutation = useMutation({
    mutationFn: (updates: { id: string; data: Partial<Board> }) => updateBoard(updates.id, updates.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', user?.id] });
      showSuccess('Quadro atualizado com sucesso!');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Erro ao atualizar quadro:', error);
      showError('Erro ao atualizar quadro. Tente novamente.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !board?.id) {
      showError('Título do quadro e ID do quadro são obrigatórios.');
      return;
    }

    updateBoardMutation.mutate({
      id: board.id,
      data: {
        title: title.trim(),
        description: description.trim() || null,
        updated_at: new Date().toISOString(),
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Quadro</DialogTitle>
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
              disabled={updateBoardMutation.isPending}
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
              disabled={updateBoardMutation.isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateBoardMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateBoardMutation.isPending}>
              {updateBoardMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};