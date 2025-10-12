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
  onTaskMove: (taskId: string, newColumnId: string, newOrder: number) => void;
  onTaskReorder: (columnId: string, taskId: string, newOrder: number) => void;
  onDragStart: (task: Task) => void;
  priorityColors: Record<string, string>;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onTaskMove,
  onTaskReorder,
  onDragStart,
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
        const newOrder = targetIndex;
        onTaskReorder(task.columnId, draggedTaskId, newOrder);
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
      className="cursor-move hover:shadow-md transition-shadow"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-sm line-clamp-2">{task.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit2 className="h-3 w-3 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-3 w-3 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {task.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-3">{task.description}</p>
        )}

        <div className="flex items-center justify-between">
          <Badge className={`${priorityColor} text-white text-xs`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
          
          {task.dueDate && (
            <span className="text-xs text-gray-500">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};