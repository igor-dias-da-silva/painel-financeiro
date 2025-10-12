export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  tags: string[];
  columnId: string;
  order: number;
}

export interface Column {
  id: string;
  title: string;
  color?: string;
}

// The Board interface from src/lib/database.ts is now the source of truth for Supabase boards.
// This file's Board interface is no longer needed as it was for local storage.
// Keeping it minimal for other components that might still reference it locally.
// The actual Board type for Supabase interactions is in src/lib/database.ts