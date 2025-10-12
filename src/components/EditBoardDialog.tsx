"use client";

import React, { useState } from 'react';
import { Board } from '@/types/task';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';

interface EditBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: Board;
  onBoardUpdate: (updatedBoard: Board) => void;
}

export const EditBoardDialog: React.FC<EditBoardDialogProps> = ({
  open,
  onOpenChange,
  board,
  onBoardUpdate,
}) => {
  const [title, setTitle] = useState(board.title);
  const [columns, setColumns] = useState(board.columns.map(col => ({ ...col })));
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const updatedBoard: Board = {
      ...board,
      title: title.trim(),
      columns,
      updatedAt: new Date().toISOString(),
    };

    onBoardUpdate(updatedBoard);
    onOpenChange(false);
  };

  const addColumn = () => {
    if (newColumnTitle.trim()) {
      setColumns([
        ...columns,
        {
          id: Date.now().toString(),
          title: newColumnTitle.trim(),
        }
      ]);
      setNewColumnTitle('');
    }
  };

  const removeColumn = (columnId: string) => {
    setColumns(columns.filter(col => col.id !== columnId));
  };

  const updateColumnTitle = (columnId: string, newTitle: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, title: newTitle } : col
    ));
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
            <Label>Colunas</Label>
            <div className="space-y-2 mt-2">
              {columns.map(column => (
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
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};