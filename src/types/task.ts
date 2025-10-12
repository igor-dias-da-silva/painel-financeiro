export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string; // Corresponds to due_date in Supabase
  tags: string[];
  columnId: string; // Corresponds to column_id in Supabase
  order: number;
}

// This Column interface is for UI components that might not need all Supabase fields
// For database interactions, use the Column interface from '@/lib/database'
export interface Column {
  id: string;
  title: string;
  color?: string; // This is a local UI property, not directly from Supabase
}