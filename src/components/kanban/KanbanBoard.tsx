import { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { useEmailMutations } from '@/hooks/useEmail';
import { toast } from 'sonner';

interface KanbanBoardProps {
  emails: any[];
  mailboxId: number | null;
}

// Kanban columns configuration
const COLUMNS = [
  { id: 'inbox', title: 'Inbox', taskStatus: 'none' },
  { id: 'todo', title: 'To Do', taskStatus: 'todo' },
  { id: 'in_progress', title: 'In Progress', taskStatus: 'in_progress' },
  { id: 'done', title: 'Done', taskStatus: 'done' },
];

export function KanbanBoard({ emails, mailboxId }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Record<string, any[]>>({
    inbox: [],
    todo: [],
    in_progress: [],
    done: [],
  });

  const { updateEmail } = useEmailMutations();

  // Organize emails into columns based on taskStatus
  useEffect(() => {
    const organized: Record<string, any[]> = {
      inbox: [],
      todo: [],
      in_progress: [],
      done: [],
    };

    emails.forEach((email) => {
      // Filter out snoozed emails
      if (email.snoozedUntil && new Date(email.snoozedUntil) > new Date()) {
        return;
      }

      switch (email.taskStatus) {
        case 'todo':
          organized.todo.push(email);
          break;
        case 'in_progress':
          organized.in_progress.push(email);
          break;
        case 'done':
          organized.done.push(email);
          break;
        case 'none':
        default:
          organized.inbox.push(email);
          break;
      }
    });

    setColumns(organized);
  }, [emails]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const emailId = parseInt(draggableId);

    // Find the email being moved
    const movedEmail = sourceColumn.find((email) => email.id === emailId);
    if (!movedEmail) return;

    // Update columns optimistically
    const newSourceColumn = Array.from(sourceColumn);
    newSourceColumn.splice(source.index, 1);

    const newDestColumn = Array.from(destColumn);
    newDestColumn.splice(destination.index, 0, movedEmail);

    setColumns({
      ...columns,
      [source.droppableId]: newSourceColumn,
      [destination.droppableId]: newDestColumn,
    });

    // Determine new taskStatus based on destination column
    const columnConfig = COLUMNS.find((col) => col.id === destination.droppableId);
    const newTaskStatus = columnConfig?.taskStatus || 'none';

    // Update email on backend
    updateEmail.mutate(
      {
        id: emailId,
        data: { taskStatus: newTaskStatus as any },
      },
      {
        onError: (error) => {
          // Revert on error
          setColumns({
            ...columns,
            [source.droppableId]: sourceColumn,
            [destination.droppableId]: destColumn,
          });
          toast.error('Failed to update email status');
          console.error('Update error:', error);
        },
        onSuccess: () => {
          toast.success('Email status updated');
        },
      }
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((column) => (
          <Droppable key={column.id} droppableId={column.id}>
            {(provided, snapshot) => (
              <KanbanColumn
                title={column.title}
                emails={columns[column.id]}
                provided={provided}
                isDraggingOver={snapshot.isDraggingOver}
              />
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
