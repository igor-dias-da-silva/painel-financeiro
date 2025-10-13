"use client";

import React from 'react';
import { Task } from '@/types/task';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onTaskMove: (taskId: string, newColumnId: string, newOrderIndex: number) => void; // Alterado newOrder para newOrderIndex
  onTaskReorder: (columnId: string, taskId: string, newOrderIndex: number) => void; // Alterado newOrder para newOrderIndex
  onDragStart: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  priorityColors: Record<string, string>;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onTaskMove,
  onTaskReorder,
  onDragStart,
  onTaskDelete,
  priorityColors,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    onDragStart(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedTaskId = e.dataTransfer.getData('text/plain');
    if (draggedTaskId !== task.id) {
      const tasks = Array.from(e.currentTarget.parentElement?.children || []);
      const draggedIndex = tasks.findIndex(child => child.getAttribute('data-task-id') === draggedTaskId);
      const targetIndex = tasks.findIndex(child => child.getAttribute('data-task-id') === task.id);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newOrderIndex = targetIndex; // Alterado newOrder para newOrderIndex
        onTaskReorder(task.columnId, draggedTaskId, newOrderIndex);
      }
    }
  };

  const priorityColor = priorityColors[task.priority] || 'bg-gray-500';

  return (
    <Card
      data-task-id={task.id}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="cursor-move hover:shadow-md transition-shadow dark:bg-card dark:border-border"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-sm line-clamp-2 dark:text-foreground">{task.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 dark:text-muted-foreground dark:hover:bg-accent">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-card dark:border-border">
              <DropdownMenuItem className="dark:text-foreground dark:hover:bg-accent">
                <Edit2 className="h-3 w-3 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600 dark:text-red-400 dark:hover:bg-destructive dark:hover:text-destructive-foreground" 
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                    onTaskDelete(task.id);
                  }
                }}
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {task.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-3 dark:text-muted-foreground">{task.description}</p>
        )}

        <div className="flex items-center justify-between">
          <Badge className={`${priorityColor} text-white text-xs`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
          
          {task.dueDate && (
            <span className="text-xs text-gray-500 dark:text-muted-foreground">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs dark:bg-secondary dark:text-secondary-foreground dark:border-border">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};