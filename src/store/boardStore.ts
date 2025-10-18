import { create } from 'zustand';

interface Column {
  id: string;
  title: string;
}

interface BoardState {
  columns: Column[];
  setColumns: (columns: Column[]) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  columns: [],
  setColumns: (columns) => set({ columns }),
}));