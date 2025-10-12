"use client";

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KanbanBoard } from '@/components/KanbanBoard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBoards, updateBoard, deleteBoard, Board, getColumns, getCards, Column, Card } from '@/lib/database';
import { useAuth } from '@/hooks/useAuth';
import { showError, showSuccess } from '@/utils/toast';
import { AuthGuard } from '@/components/AuthGuard';

const fetchFullBoardData = async (boardId: string, userId: string): Promise<Board & { columns: Column[]; tasks: Card[] }> => {
  const { data: boardData, error: boardError } = await getBoards(userId); // Fetch all boards to find the specific one
  if (boardError) throw boardError;
  const board = boardData.find(b => b.id === boardId);
  if (!board) throw new Error('Quadro não encontrado');

  const { data: columns, error: columnsError } = await getColumns(boardId);
  if (columnsError) throw columnsError;

  const { data: cards, error: cardsError } = await getCards(boardId); // Assuming getCards can filter by boardId
  if (cardsError) throw cardsError;

  // Map Supabase Card to local Task type
  const tasks: Task[] = cards.map(card => ({
    id: card.id,
    title: card.title,
    description: card.description || undefined,
    priority: 'medium', // Default or fetch from card metadata if available
    dueDate: undefined, // Default or fetch from card metadata if available
    tags: [], // Default or fetch from card metadata if available
    columnId: card.column_id,
    order: card.order,
  }));

  return { ...board, columns, tasks };
};

const BoardView = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: board, isLoading, isError, error } = useQuery<Board & { columns: Column[]; tasks: Card[] }>({
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