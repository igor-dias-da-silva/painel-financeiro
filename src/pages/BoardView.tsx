"use client";

import { useState } from 'react';
import { KanbanBoard } from '@/components/KanbanBoard';
import { Header } from '@/components/Header';
import { Board, Column, Task } from '@/types';

// Mock data - in a real app, this would come from an API
const initialBoards: Board[] = [
  {
    id: 'board-1',
    name: 'Project Phoenix',
    columns: [
      { id: 'col-1', title: 'To Do', taskIds: ['task-1', 'task-2'] },
      { id: 'col-2', title: 'In Progress', taskIds: ['task-3'] },
      { id: 'col-3', title: 'Done', taskIds: ['task-4'] },
    ],
    tasks: [
      { id: 'task-1', content: 'Analyze project requirements' },
      { id: 'task-2', content: 'Create wireframes' },
      { id: 'task-3', content: 'Develop main feature' },
      { id: 'task-4', content: 'Deploy to production' },
    ]
  },
  {
    id: 'board-2',
    name: 'Marketing Campaign',
    columns: [
        { id: 'mcol-1', title: 'Ideas', taskIds: ['mtask-1'] },
        { id: 'mcol-2', title: 'Executing', taskIds: [] },
        { id: 'mcol-3', title: 'Completed', taskIds: ['mtask-2'] },
    ],
    tasks: [
        { id: 'mtask-1', content: 'Brainstorm Q3 initiatives' },
        { id: 'mtask-2', content: 'Launch social media ads' },
    ]
  }
];


export default function BoardView() {
  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(initialBoards[0]?.id || null);

  const handleCreateBoard = (name: string) => {
    const newBoard: Board = {
      id: `board-${Date.now()}`,
      name,
      columns: [
        { id: 'new-col-1', title: 'To Do', taskIds: [] },
        { id: 'new-col-2', title: 'In Progress', taskIds: [] },
        { id: 'new-col-3', title: 'Done', taskIds: [] },
      ],
      tasks: [],
    };
    setBoards(prev => [...prev, newBoard]);
    setSelectedBoardId(newBoard.id);
  };

  const handleBoardUpdate = (updatedBoard: Board) => {
    setBoards(prev => prev.map(b => b.id === updatedBoard.id ? updatedBoard : b));
  };

  const handleDeleteBoard = (id: string) => {
    setBoards(prev => prev.filter(b => b.id !== id));
    if (selectedBoardId === id) {
      setSelectedBoardId(boards[0]?.id || null);
    }
  };

  const board = boards.find(b => b.id === selectedBoardId);

  return (
    <div className="flex flex-col h-screen">
      <Header
        boards={boards}
        selectedBoardId={selectedBoardId}
        onSelectBoard={setSelectedBoardId}
        onCreateBoard={handleCreateBoard}
      />
      <main className="flex-1 overflow-hidden">
        {board ? (
          <KanbanBoard
            key={board.id}
            boardId={board.id}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">No Board Selected</h2>
              <p className="text-muted-foreground">
                Please select a board from the dropdown or create a new one.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}