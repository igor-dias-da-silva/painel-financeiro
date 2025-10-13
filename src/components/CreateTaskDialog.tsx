"use client";

import React, { useState, useEffect } from 'react';
import { Task, Column } from '@/types/task';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { showError } from '@/utils/toast';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  columns: Column[];
  onTaskCreate: (task: Omit<Task, 'id'>) => void;
}

export const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  open,
  onOpenChange,
  boardId,
  columns,
  onTaskCreate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedColumnId, setSelectedColumnId] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!open) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setTags([]);
      setNewTag('');
      setSelectedColumnId('');
    } else if (columns.length > 0) {
      setSelectedColumnId(columns[0].id);
    }
  }, [open, columns]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !user?.id || !selectedColumnId) {
      showError('Título da tarefa e coluna são obrigatórios.');
      return;
    }

    const newTask: Omit<Task, 'id'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      tags,
      columnId: selectedColumnId,
      order_index: 0,
    };

    onTaskCreate(newTask);
    onOpenChange(false);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-visible">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da tarefa"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite a descrição da tarefa"
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="column">Coluna</Label>
            <Select 
              modal={false}
              value={selectedColumnId} 
              onValueChange={setSelectedColumnId} 
              disabled={columns.length === 0}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={columns.length === 0 ? "Nenhuma coluna disponível" : "Selecione uma coluna"} />
              </SelectTrigger>
              <SelectContent position="popper">
                {columns.map(column => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {columns.length === 0 && (
              <p className="text-sm text-red-500 mt-1">Crie uma coluna no quadro antes de adicionar tarefas.</p>
            )}
          </div>

          <div>
            <Label htmlFor="priority">Prioridade</Label>
            <Select 
              modal={false}
              value={priority} 
              onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setPriority(value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dueDate">Data de Vencimento</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Adicionar tag"
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-1 rounded-full hover:bg-gray-300">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar Tarefa</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};