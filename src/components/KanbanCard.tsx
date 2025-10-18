import { Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KanbanCardProps {
  task: Task;
}

export const KanbanCard = ({ task }: KanbanCardProps) => {
  return (
    <Card>
      <CardHeader className="p-3">
        <CardTitle className="text-sm font-medium">{task.content || task.title}</CardTitle>
      </CardHeader>
      {task.description && (
        <CardContent className="p-3 pt-0">
          <p className="text-xs text-muted-foreground">{task.description}</p>
        </CardContent>
      )}
    </Card>
  );
};