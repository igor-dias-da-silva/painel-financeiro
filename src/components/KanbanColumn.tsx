import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Task, Column } from '@/types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
}

export const KanbanColumn = ({ column, tasks }: KanbanColumnProps) => {
  return (
    <div className="w-72 flex-shrink-0 bg-muted rounded-lg p-2 flex flex-col">
      <h2 className="font-semibold p-2 text-lg">{column.title}</h2>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex-grow min-h-[200px] rounded-md p-2 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/10' : 'bg-transparent'}`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-2"
                  >
                    <KanbanCard task={task} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};