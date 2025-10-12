"use client";

import React, { useState } from 'react';
import { Board } from '@/types/task';
import { BoardList } from '@/components/BoardList';
import { KanbanBoard } from '@/components/KanbanBoard';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Index = () => {
  const [boards, setBoards] = useLocalStorage<Board[]>('kanban-boards', []);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);

  const handleCreateBoard = () => {
    const newBoard: Board = {
      id: Date.now().toString(),
      title: `Quadro ${boards.length + 1}`,
      columns: [
        { id: 'todo', title: 'A Fazer' },
        { id: 'in-progress', title: 'Em Progresso' },
        { id: 'done', title: 'Concluído' },
      ],
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBoards([...boards, newBoard]);
  };

  const handleEditBoard = (board: Board) => {
    setCurrentBoard(board);
  };

  const handleBoardUpdate = (updatedBoard: Board) => {
    setBoards(boards.map(board => 
      board.id === updatedBoard.id ? updatedBoard : board
    ));
  };

  const handleDeleteBoard = (boardId: string) => {
    if (confirm('Tem certeza que deseja excluir este quadro? Todas as tarefas serão perdidas.')) {
      setBoards(boards.filter(board => board.id !== boardId));
      if (currentBoard?.id === boardId) {
        setCurrentBoard(null);
      }
    }
  };

  const handleBackToBoards = () => {
    setCurrentBoard(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentBoard ? (
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
            board={currentBoard}
            onBoardUpdate={handleBoardUpdate}
            onDeleteBoard={handleDeleteBoard}
          />
        </div>
      ) : (
        <BoardList
          boards={boards}
          onCreateBoard={handleCreateBoard}
          onEditBoard={handleEditBoard}
          onDeleteBoard={handleDeleteBoard}
        />
      )}
    </div>
  );
};

export default Index;