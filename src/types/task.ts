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

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}