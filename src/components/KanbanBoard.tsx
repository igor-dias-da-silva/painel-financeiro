"use client";

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';

import { Column, Task } from '@/types';
import { Button } from '@/components/ui/button';
import { KanbanColumn } from './KanbanColumn';
import { CreateTaskDialog } from './CreateTaskDialog';
import { useBoardStore } from '@/store/boardStore';

// Mock functions to simulate API calls
// Replace these with your actual API calls
const getBoardData = async (boardId: string): Promise<{ columns: Column[], tasks: Task[] }> => {
  console.log(`Fetching data for board ${boardId}`);
  // In a real app, you'd fetch this from your backend
  return {
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
  };
};

const updateTaskOrderInDb = async (data: { columns: Column[] }) => {
  console.log('Updating task order in DB:', data);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return data;
};


interface KanbanBoardProps {
  boardId: string;
}

export const KanbanBoard = ({ boardId }: KanbanBoardProps) => {
  const queryClient = useQueryClient();
  const { setColumns: setColumnsInStore, columns: columnsFromStore } = useBoardStore();
  
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task>>({});
  const [showCreateTask, setShowCreateTask] = useState(false);

  const { data: boardData, isLoading, isError } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => getBoardData(boardId),
    enabled: !!boardId,
  });

  useEffect(() => {
    if (boardData) {
      const initialColumns = boardData.columns || [];
      const initialTasks = boardData.tasks?.reduce((acc, task) => {
        acc[task.id] = task;
        return acc;
      }, {} as Record<string, Task>) || {};
      
      setColumns(initialColumns);
      setTasks(initialTasks);
      setColumnsInStore(initialColumns);
    }
  }, [boardData, setColumnsInStore]);

  const { mutate: updateTaskOrder } = useMutation({
    mutationFn: updateTaskOrderInDb,
    onMutate: async (newData: { columns: Column[] }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['board', boardId] });

      // Snapshot the previous value
      const previousBoardData = queryClient.getQueryData(['board', boardId]);

      // Optimistically update to the new value
      setColumns(newData.columns);

      // Return a context object with the snapshotted value
      return { previousBoardData };
    },
    onError: (err, newColumns, context) => {
      // Rollback to the previous value on error
      if (context?.previousBoardData) {
        const { columns: prevColumns } = context.previousBoardData as { columns: Column[] };
        setColumns(prevColumns);
      }
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });


  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = columns.find(c => c.id === source.droppableId);
    const finishColumn = columns.find(c => c.id === destination.droppableId);

    if (!startColumn || !finishColumn) {
      return;
    }

    // Moving within the same column
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds,
      };

      const newColumns = columns.map(c => (c.id === newColumn.id ? newColumn : c));
      setColumns(newColumns);
      updateTaskOrder({ columns: newColumns });
      return;
    }

    // Moving from one column to another
    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStartColumn = {
      ...startColumn,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinishColumn = {
      ...finishColumn,
      taskIds: finishTaskIds,
    };

    const newColumns = columns.map(c => {
      if (c.id === newStartColumn.id) return newStartColumn;
      if (c.id === newFinishColumn.id) return newFinishColumn;
      return c;
    });

    setColumns(newColumns);
    updateTaskOrder({ columns: newColumns });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading board.</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full w-full p-4 space-x-4 overflow-x-auto">
        {columns.map(column => {
          const columnTasks = column.taskIds.map(taskId => tasks[taskId]).filter(Boolean);
          return (
            <KanbanColumn key={column.id} column={column} tasks={columnTasks} />
          );
        })}
        <div className="w-72 flex-shrink-0">
            <Button 
              variant="outline" 
              className="w-full h-12 border-dashed"
              onClick={() => setShowCreateTask(true)}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Task
            </Button>
        </div>
      </div>
      <CreateTaskDialog
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
      />
    </DragDropContext>
  );
};