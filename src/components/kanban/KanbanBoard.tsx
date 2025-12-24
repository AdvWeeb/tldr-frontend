import { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { useEmailMutations, useKanbanColumns } from '@/hooks/useEmail';
import { toast } from 'sonner';
import { Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KanbanSettingsModal } from './KanbanSettingsModal';

interface KanbanBoardProps {
  emails: any[];
  mailboxId: number | null;
}

export function KanbanBoard({ emails, mailboxId }: KanbanBoardProps) {
  const { data: dbColumns = [], isLoading: isLoadingColumns } = useKanbanColumns();
  const [columns, setColumns] = useState<Record<string, any[]>>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { updateEmail, moveEmailToColumn } = useEmailMutations();

  // Organize emails into columns based on database configuration
  useEffect(() => {
    if (dbColumns.length === 0) return;

    const organized: Record<string, any[]> = {};
    dbColumns.forEach(col => {
      organized[col.id.toString()] = [];
    });

    emails.forEach((email) => {
      // Filter out snoozed emails
      if (email.snoozedUntil && new Date(email.snoozedUntil) > new Date()) {
        return;
      }

      // Find column by matching Gmail labels or taskStatus
      let targetColumn = dbColumns.find(col => 
        col.gmailLabelId && email.labels?.includes(col.gmailLabelId)
      );

      if (!targetColumn) {
        // Fallback to taskStatus mapping for default flow
        if (email.taskStatus === 'todo') {
          targetColumn = dbColumns.find(c => c.title.toLowerCase() === 'todo' || c.title.toLowerCase() === 'important');
        } else if (email.taskStatus === 'in_progress') {
          targetColumn = dbColumns.find(c => c.title.toLowerCase() === 'in progress');
        } else if (email.taskStatus === 'done') {
          targetColumn = dbColumns.find(c => c.title.toLowerCase() === 'done');
        }
      }
      
      // Fallback to "Inbox" or the first column
      const targetId = targetColumn?.id.toString() || 
                      dbColumns.find(c => c.title.toLowerCase() === 'inbox')?.id.toString() || 
                      dbColumns[0]?.id.toString();

      if (targetId && organized[targetId]) {
        organized[targetId].push(email);
      }
    });

    setColumns(organized);
  }, [emails, dbColumns]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const emailId = parseInt(draggableId);
    const columnId = parseInt(destination.droppableId);

    const movedEmail = sourceColumn.find((email) => email.id === emailId);
    if (!movedEmail) return;

    // Update UI optimistically
    const newSourceColumn = Array.from(sourceColumn);
    newSourceColumn.splice(source.index, 1);

    const newDestColumn = Array.from(destColumn);
    newDestColumn.splice(destination.index, 0, movedEmail);

    setColumns({
      ...columns,
      [source.droppableId]: newSourceColumn,
      [destination.droppableId]: newDestColumn,
    });

    // Sync with backend and Gmail
    const destColConfig = dbColumns.find(c => c.id === columnId);
    const newTaskStatus = destColConfig?.title.toLowerCase() === 'todo' ? 'todo' : 
                         destColConfig?.title.toLowerCase() === 'in progress' ? 'in_progress' :
                         destColConfig?.title.toLowerCase() === 'done' ? 'done' : 'none';

    // Call moveEmailToColumn to sync Gmail labels
    moveEmailToColumn.mutate({
      emailId,
      columnId,
      archiveFromInbox: destination.droppableId !== source.droppableId && source.droppableId === dbColumns.find(c => c.title.toLowerCase() === 'inbox')?.id.toString()
    }, {
      onSuccess: () => {
        // Also update task status for UI consistency
        updateEmail.mutate({ id: emailId, data: { taskStatus: newTaskStatus as any } });
        toast.success(`Moved to ${destColConfig?.title}`);
      },
      onError: (error) => {
        setColumns({
          ...columns,
          [source.droppableId]: sourceColumn,
          [destination.droppableId]: destColumn,
        });
        toast.error('Failed to move email');
        console.error('Move error:', error);
      }
    });
  };

  if (isLoadingColumns) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Board Settings
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {dbColumns.map((column) => (
            <Droppable key={column.id} droppableId={column.id.toString()}>
              {(provided, snapshot) => (
                <KanbanColumn
                  title={column.title}
                  emails={columns[column.id.toString()] || []}
                  provided={provided}
                  isDraggingOver={snapshot.isDraggingOver}
                  color={column.color}
                />
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <KanbanSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
