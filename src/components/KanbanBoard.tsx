"use client";

import React, { useState, useEffect } from 'react';
import { Board, Task, Column } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { CreateTaskDialog } from './CreateTaskDialog';
import { CreateColumnDialog } from './CreateColumnDialog';
import { EditBoardDialog } from './EditBoardDialog';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface KanbanBoardProps {
  board: Board;
  onBoardUpdate: (updatedBoard: Board) => void;
  onDeleteBoard: (boardId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  board,
  onBoardUpdate,
  onDeleteBoard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateColumn, setShowCreateColumn] = useState(false);
  const [showEditBoard, setShowEditBoard] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const filteredTasks = board.tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(task.priority);
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => task.tags.includes(tag));
    
    return matchesSearch && matchesPriority && matchesTags;
  });

  const getTasksByColumn = (columnId: string) => {
    return filteredTasks
      .filter(task => task.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  };

  const handleTaskMove = (taskId: string, newColumnId: string, newOrder: number) => {
    const updatedTasks = board.tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, columnId: newColumnId, order: newOrder };
      }
      return task;
    });

    const updatedBoard = { ...board, tasks: updatedTasks, updatedAt: new Date().toISOString() };
    onBoardUpdate(updatedBoard);
  };

  const handleTaskReorder = (columnId: string, taskId: string, newOrder: number) => {
    const updatedTasks = board.tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, order: newOrder };
      }
      return task;
    });

    const updatedBoard = { ...board, tasks: updatedTasks, updatedAt: new Date().toISOString() };
    onBoardUpdate(updatedBoard);
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedTask) {
      const tasksInColumn = getTasksByColumn(columnId);
      const newOrder = tasksInColumn.length;
      handleTaskMove(draggedTask.id, columnId, newOrder);
      setDraggedTask(null);
    }
  };

  const getAllTags = () => {
    const tagSet = new Set<string>();
    board.tasks.forEach(task => {
      task.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  };

  const priorityColors = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-800">{board.title}</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditBoard(true)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Editar Quadro
          </Button>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDeleteBoard(board.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir Quadro
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Prioridade:</span>
          {Object.entries(priorityColors).map(([priority, color]) => (
            <Badge
              key={priority}
              variant={selectedPriorities.includes(priority) ? "default" : "outline"}
              className={`cursor-pointer ${color} text-white`}
              onClick={() => {
                if (selectedPriorities.includes(priority)) {
                  setSelectedPriorities(selectedPriorities.filter(p => p !== priority));
                } else {
                  setSelectedPriorities([...selectedPriorities, priority]);
                }
              }}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Badge>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Tags:</span>
          {getAllTags().map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                if (selectedTags.includes(tag)) {
                  setSelectedTags(selectedTags.filter(t => t !== tag));
                } else {
                  setSelectedTags([...selectedTags, tag]);
                }
              }}
            >
              {tag}
            </Badge>
          ))}
        </div>

        <Button onClick={() => setShowCreateTask(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>

        <Button variant="outline" onClick={() => setShowCreateColumn(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Coluna
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {board.columns.map(column => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 bg-white rounded-lg shadow-sm border"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                  {column.title}
                  <span className="text-sm text-gray-500">
                    {getTasksByColumn(column.id).length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 min-h-[200px]">
                  {getTasksByColumn(column.id).map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onTaskMove={handleTaskMove}
                      onTaskReorder={handleTaskReorder}
                      onDragStart={handleDragStart}
                      priorityColors={priorityColors}
                    />
                  ))}
                  {getTasksByColumn(column.id).length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      Nenhuma tarefa nesta coluna
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Dialogs */}
      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        board={board}
        onTaskCreate={(task) => {
          const updatedBoard = { ...board, tasks: [...board.tasks, task], updatedAt: new Date().toISOString() };
          onBoardUpdate(updatedBoard);
        }}
      />

      <CreateColumnDialog
        open={showCreateColumn}
        onOpenChange={setShowCreateColumn}
        board={board}
        onColumnCreate={(column) => {
          const updatedBoard = { ...board, columns: [...board.columns, column], updatedAt: new Date().toISOString() };
          onBoardUpdate(updatedBoard);
        }}
      />

      <EditBoardDialog
        open={showEditBoard}
        onOpenChange={setShowEditBoard}
        board={board}
        onBoardUpdate={onBoardUpdate}
      />
    </div>
  );
};