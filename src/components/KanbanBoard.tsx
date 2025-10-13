"use client";

import React, { useState, useEffect } from 'react';
import { Board, Column as SupabaseColumn, Card as SupabaseCard, updateCard, createCard, deleteCard, updateColumn, createColumn, deleteColumn, getColumns, getCards } from '@/lib/database';
import { Task, Column } from '@/types/task';
import { Card as ShadcnCard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Search, Filter, Loader2 } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { CreateTaskDialog } from './CreateTaskDialog';
import { CreateColumnDialog } from './CreateColumnDialog';
import { EditBoardDialog } from './EditBoardDialog';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showError, showSuccess } from '@/utils/toast';

interface KanbanBoardProps {
  board: Board & { columns: SupabaseColumn[]; tasks: Task[] };
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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch columns and cards for the current board
  const { data: columns, isLoading: columnsLoading, isError: columnsError } = useQuery<SupabaseColumn[]>({
    queryKey: ['columns', board.id],
    queryFn: () => getColumns(board.id),
    enabled: !!board.id,
  });

  const { data: tasks, isLoading: tasksLoading, isError: tasksError } = useQuery<Task[]>({
    queryKey: ['cards', board.id],
    queryFn: async () => {
      const cards = await getCards(board.id);
      return cards.map(card => ({
        id: card.id,
        title: card.title,
        description: card.description || undefined,
        priority: card.priority || 'medium', 
        dueDate: card.due_date || undefined, 
        tags: card.tags || [], 
        columnId: card.column_id,
        order_index: card.order_index, // Alterado de 'order' para 'order_index'
      }));
    },
    enabled: !!board.id,
  });

  const updateCardMutation = useMutation({
    mutationFn: (updates: { id: string; data: Partial<Task> }) => updateCard(updates.id, {
      title: updates.data.title,
      description: updates.data.description,
      column_id: updates.data.columnId,
      order_index: updates.data.order_index, // Alterado de 'order' para 'order_index'
      user_id: user!.id, 
      priority: updates.data.priority,
      due_date: updates.data.dueDate,
      tags: updates.data.tags,
      updated_at: new Date().toISOString(),
    } as SupabaseCard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', board.id] });
      queryClient.invalidateQueries({ queryKey: ['totalTasks', user?.id] });
      showSuccess('Tarefa atualizada!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar tarefa:', error);
      showError('Erro ao atualizar tarefa.');
    },
  });

  const createCardMutation = useMutation({
    mutationFn: (newTask: Omit<Task, 'id'>) => createCard({
      title: newTask.title,
      description: newTask.description || null,
      column_id: newTask.columnId,
      order_index: newTask.order_index, // Alterado de 'order' para 'order_index'
      user_id: user!.id,
      priority: newTask.priority,
      due_date: newTask.dueDate,
      tags: newTask.tags,
    } as Omit<SupabaseCard, 'id' | 'created_at' | 'updated_at'>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', board.id] });
      queryClient.invalidateQueries({ queryKey: ['totalTasks', user?.id] });
      showSuccess('Tarefa criada!');
    },
    onError: (error) => {
      console.error('Erro ao criar tarefa:', error);
      showError('Erro ao criar tarefa.');
    },
  });

  const deleteCardMutation = useMutation<void, Error, string>({ // Explicitly type TVariables as string
    mutationFn: deleteCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', board.id] });
      queryClient.invalidateQueries({ queryKey: ['totalTasks', user?.id] });
      showSuccess('Tarefa excluída!');
    },
    onError: (error) => {
      console.error('Erro ao excluir tarefa:', error);
      showError('Erro ao excluir tarefa.');
    },
  });

  const createColumnMutation = useMutation({
    mutationFn: (newColumn: Omit<SupabaseColumn, 'id' | 'created_at' | 'updated_at'>) => createColumn({
      title: newColumn.title,
      board_id: board.id,
      order_index: columns ? columns.length : 0, // Alterado de 'order' para 'order_index'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', board.id] });
      showSuccess('Coluna criada!');
    },
    onError: (error) => {
      console.error('Erro ao criar coluna:', error);
      showError('Erro ao criar coluna.');
    },
  });

  const updateColumnMutation = useMutation({
    mutationFn: (updates: { id: string; data: Partial<SupabaseColumn> }) => updateColumn(updates.id, updates.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', board.id] });
      showSuccess('Coluna atualizada!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar coluna:', error);
      showError('Erro ao atualizar coluna.');
    },
  });

  const deleteColumnMutation = useMutation({
    mutationFn: deleteColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', board.id] });
      showSuccess('Coluna excluída!');
    },
    onError: (error) => {
      console.error('Erro ao excluir coluna:', error);
      showError('Erro ao excluir coluna.');
    },
  });

  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(task.priority);
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => task.tags.includes(tag));
    
    return matchesSearch && matchesPriority && matchesTags;
  }) || [];

  const getTasksByColumn = (columnId: string) => {
    return filteredTasks
      .filter(task => task.columnId === columnId)
      .sort((a, b) => a.order_index - b.order_index); // Alterado de 'order' para 'order_index'
  };

  const handleTaskCreate = (newTask: Omit<Task, 'id'>) => {
    createCardMutation.mutate(newTask);
  };

  const handleColumnCreate = (newColumn: Omit<SupabaseColumn, 'id' | 'created_at' | 'updated_at'>) => {
    createColumnMutation.mutate(newColumn);
  };

  const handleTaskMove = (taskId: string, newColumnId: string, newOrderIndex: number) => {
    updateCardMutation.mutate({ id: taskId, data: { columnId: newColumnId, order_index: newOrderIndex } }); // Alterado de 'order' para 'order_index'
  };

  const handleTaskReorder = (columnId: string, taskId: string, newOrderIndex: number) => {
    updateCardMutation.mutate({ id: taskId, data: { order_index: newOrderIndex } }); // Alterado de 'order' para 'order_index'
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
      const newOrderIndex = tasksInColumn.length; // Coloca no final da coluna
      handleTaskMove(draggedTask.id, columnId, newOrderIndex);
      setDraggedTask(null);
    }
  };

  const getAllTags = () => {
    const tagSet = new Set<string>();
    tasks?.forEach(task => {
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

  if (columnsLoading || tasksLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (columnsError || tasksError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erro:</strong>
        <span className="block sm:inline"> Não foi possível carregar os dados do quadro.</span>
      </div>
    );
  }

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
        {columns?.map(column => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 bg-white rounded-lg shadow-sm border"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <ShadcnCard className="h-full">
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
                      onTaskDelete={deleteCardMutation.mutate}
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
            </ShadcnCard>
          </div>
        ))}
      </div>

      {/* Dialogs */}
      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        boardId={board.id}
        columns={columns || []}
        onTaskCreate={handleTaskCreate}
      />

      <CreateColumnDialog
        open={showCreateColumn}
        onOpenChange={setShowCreateColumn}
        boardId={board.id}
        onColumnCreate={handleColumnCreate}
      />

      <EditBoardDialog
        open={showEditBoard}
        onOpenChange={setShowEditBoard}
        board={board}
        columns={columns || []}
        onBoardUpdate={onBoardUpdate}
        onColumnUpdate={updateColumnMutation.mutate}
        onColumnDelete={deleteColumnMutation.mutate}
        onColumnCreate={createColumnMutation.mutate}
      />
    </div>
  );
};