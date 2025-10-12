"use client";

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KanbanBoard } from '@/components/KanbanBoard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBoards, updateBoard, deleteBoard, Board, getColumns, getCards, Column as SupabaseColumn, Card as SupabaseCard } from '@/lib/database';
import { useAuth } from '@/hooks/useAuth';
import { showError, showSuccess } from '@/utils/toast';
import { AuthGuard } from '@/components/AuthGuard';
import { Task } from '@/types/task';

const fetchFullBoardData = async (boardId: string, userId: string): Promise<Board & { columns: SupabaseColumn[]; tasks: Task[] }> => {
  console.log('Fetching full board data for boardId:', boardId, 'userId:', userId);

  if (!userId) {
    console.error('Error: userId is undefined in fetchFullBoardData');
    throw new Error('ID do usuário não disponível.');
  }
  if (!boardId) {
    console.error('Error: boardId is undefined in fetchFullBoardData');
    throw new Error('ID do quadro não disponível.');
  }

  try {
    const boardData = await getBoards(userId);
    console.log('Fetched boards:', boardData);
    const board = boardData.find(b => b.id === boardId);
    if (!board) {
      console.error('Error: Board not found for boardId:', boardId);
      throw new Error('Quadro não encontrado.');
    }
    console.log('Found board:', board);

    const columns = await getColumns(boardId);
    console.log('Fetched columns:', columns);

    const cards = await getCards(boardId);
    console.log('Fetched cards:', cards);

    const tasks: Task[] = cards.map(card => ({
      id: card.id,
      title: card.title,
      description: card.description || undefined,
      priority: card.priority || 'medium', 
      dueDate: card.due_date || undefined, 
      tags: card.tags || [], 
      columnId: card.column_id,
      order_index: card.order_index, // Alterado de 'order' para 'order_index'
    }));
    console.log('Mapped tasks:', tasks);

    return { ...board, columns, tasks };
  } catch (err: any) {
    console.error('Error fetching full board data:', err.message);
    throw new Error(`Erro ao carregar dados do quadro: ${err.message}`);
  }
};

const BoardView = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: board, isLoading, isError, error } = useQuery<Board & { columns: SupabaseColumn[]; tasks: Task[] }>({
    queryKey: ['fullBoard', boardId, user?.id],
    queryFn: () => fetchFullBoardData(boardId!, user!.id),
    enabled: !!boardId && !!user?.id,
  });

  const updateBoardMutation = useMutation({
    mutationFn: (updatedBoard: Board) => updateBoard(updatedBoard.id, updatedBoard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fullBoard', boardId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['boards', user?.id] }); // Invalidate board list too
      showSuccess('Quadro atualizado com sucesso!');
    },
    onError: (err) => {
      console.error('Erro ao atualizar quadro:', err);
      showError('Erro ao atualizar quadro. Tente novamente.');
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: deleteBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', user?.id] });
      showSuccess('Quadro excluído com sucesso!');
      navigate('/boards');
    },
    onError: (err) => {
      console.error('Erro ao excluir quadro:', err);
      showError('Erro ao excluir quadro. Tente novamente.');
    },
  });

  const handleBoardUpdate = (updatedBoard: Board) => {
    updateBoardMutation.mutate(updatedBoard);
  };

  const handleDeleteBoard = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este quadro? Todas as tarefas e colunas serão perdidas.')) {
      deleteBoardMutation.mutate(id);
    }
  };

  const handleBackToBoards = () => {
    navigate('/boards');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar quadro</h1>
          <p className="text-gray-600 mb-4">{error?.message || 'Quadro não encontrado ou inacessível.'}</p>
          <Button onClick={handleBackToBoards}>Voltar aos Quadros</Button>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="p-4">
        <Button 
          variant="outline" 
          onClick={handleBackToBoards}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar aos Quadros
        </Button>
        <KanbanBoard
          board={board}
          onBoardUpdate={handleBoardUpdate}
          onDeleteBoard={handleDeleteBoard}
        />
      </div>
    </AuthGuard>
  );
};

export default BoardView;