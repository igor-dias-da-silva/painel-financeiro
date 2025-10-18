export interface Task {
  id: string;
  content: string;
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface Board {
    id: string;
    name: string;
    columns?: Column[];
    tasks?: Task[];
}