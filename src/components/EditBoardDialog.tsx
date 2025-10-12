"use client";

import React, { useState, useEffect } from 'react';
import { Board, Column } from '@/lib/database'; // Use Board from database.ts
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import { showError } from '@/utils/toast';

interface EditBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: Board; // Board from database.ts
  columns: Column[]; // Columns from database.ts
  onBoardUpdate: (updatedBoard: Board) => void;
  onColumnUpdate: (updates: { id: string; data: Partial<Column> }) => void;
  onColumnDelete: (columnId: string) => void;
  onColumnCreate: (newColumn: Omit<Column, 'id'>) => void;
}

export const EditBoardDialog: React.FC<EditBoardDialogProps> = ({
  open,
  onOpenChange,
  board,
  columns,
  onBoardUpdate,
  onColumnUpdate,
  onColumnDelete,
  onColumnCreate,
}) => {
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description || '');
  const [localColumns, setLocalColumns] = useState<Column[]>([]);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  useEffect(() => {
    if (board) {
      setTitle(board.title);
      setDescription(board.description || '');
    }
  }, [board]);

  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      showError('Título do quadro é obrigatório.');
      return;
    }

    const updatedBoard: Board = {
      ...board,
      title: title.trim(),
      description: description.trim() || null,
      updated_at: new Date().toISOString(),
    };

    onBoardUpdate(updatedBoard);
    onOpenChange(false);
  };

  const addColumn = () => {
    if (newColumnTitle.trim()) {
      onColumnCreate({
        title: newColumnTitle.trim(),
        board_id: board.id,
        order: localColumns.length,
      });
      setNewColumnTitle('');
    }
  };

  const removeColumn = (columnId: string) => {
    if (confirm('Tem certeza que deseja excluir esta coluna? Todas as tarefas nela serão perdidas.')) {
      onColumnDelete(columnId);
    }
  };

  const updateColumnTitle = (columnId: string, newTitle: string) => {
    onColumnUpdate({ id: columnId, data: { title: newTitle } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Quadro</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título do Quadro</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do quadro"
              required
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
            />
          </div>

          <div>
            <Label>Colunas</Label>
            <div className="space-y-2 mt-2">
              {localColumns.map(column => (
                <div key={column.id} className="flex items-center space-x-2">
                  <Input
                    value={column.title}
                    onChange={(e) => updateColumnTitle(column.id, e.target.value)}
                    placeholder="Título da coluna"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeColumn(column.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex space-x-2">
                <Input
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Nova coluna"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColumn())}
                />
                <Button type="button" variant="outline" onClick={addColumn}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};