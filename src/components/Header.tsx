import React from 'react';
import { Board } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface HeaderProps {
  boards: Board[];
  selectedBoardId: string | null;
  onSelectBoard: (id: string) => void;
  onCreateBoard: (name: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  boards,
  selectedBoardId,
  onSelectBoard,
  onCreateBoard,
}) => {
  const handleCreate = () => {
    const boardName = prompt('Enter the name for the new board:');
    if (boardName) {
      onCreateBoard(boardName);
    }
  };

  return (
    <header className="p-4 border-b bg-card text-card-foreground flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">Kanban Board</h1>
        <Select value={selectedBoardId || ''} onValueChange={onSelectBoard}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a board" />
          </SelectTrigger>
          <SelectContent>
            {boards.map(board => (
              <SelectItem key={board.id} value={board.id}>
                {board.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Create Board
      </Button>
    </header>
  );
};