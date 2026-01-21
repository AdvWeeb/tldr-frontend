import { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { useEmailMutations, useKanbanColumns } from '@/hooks/useEmail';
import { toast } from 'sonner';
import { Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KanbanSettingsModal } from './KanbanSettingsModal';
import { useUIStore } from '@/store/uiStore';

interface KanbanBoardProps {
  emails: any[];
}

export function KanbanBoard({ emails }: KanbanBoardProps) {
  const { data: dbColumns = [], isLoading: isLoadingColumns } = useKanbanColumns();
  const [columns, setColumns] = useState<Record<string, any[]>>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { filters } = useUIStore();

  const { moveEmailToColumn } = useEmailMutations();

  // Organize emails into columns based on database configuration
  useEffect(() => {
    if (dbColumns.length === 0) return;

    const organized: Record<string, any[]> = {};
    dbColumns.forEach(col => {
      organized[col.id.toString()] = [];
    });

    emails.forEach((email) => {
      // Hide snoozed emails by default unless snoozed filter is active
      const isSnoozedFilterActive = filters.isSnoozed === true;
      const isEmailSnoozed = email.isSnoozed || (email.snoozedUntil && new Date(email.snoozedUntil) > new Date());
      
      if (isEmailSnoozed && !isSnoozedFilterActive) {
        return; // Skip snoozed emails when filter is not active
      }
      
      let targetColumn = null;

      // Priority 1: Use columnId if set (most reliable for custom columns)
      if (email.columnId) {
        targetColumn = dbColumns.find(c => c.id === email.columnId);
      }

      // Priority 2: Match based on taskStatus (for task-based columns)
      if (!targetColumn) {
        if (email.taskStatus === 'todo' || email.taskStatus === 'to_do') {
          targetColumn = dbColumns.find(c => c.title.toLowerCase() === 'to do' || c.title.toLowerCase() === 'todo');
        } else if (email.taskStatus === 'in_progress') {
          targetColumn = dbColumns.find(c => c.title.toLowerCase() === 'in progress');
        } else if (email.taskStatus === 'done') {
          targetColumn = dbColumns.find(c => c.title.toLowerCase() === 'done');
        }
      }

      // Priority 3: Check Gmail label-based columns
      if (!targetColumn) {
        // Ensure labels is an array (handle string from API)
        let emailLabels: string[] = [];
        if (Array.isArray(email.labels)) {
          emailLabels = email.labels;
        } else if (typeof email.labels === 'string' && email.labels) {
          emailLabels = (email.labels as string).split(',').map((l: string) => l.trim());
        }
        
        // Check for Starred column (isStarred flag or STARRED label)
        if (email.isStarred || emailLabels.includes('STARRED')) {
          targetColumn = dbColumns.find(col => col.gmailLabelId === 'STARRED');
        }
        
        // Check for Important column (IMPORTANT label in email.labels)
        if (!targetColumn && emailLabels.includes('IMPORTANT')) {
          targetColumn = dbColumns.find(col => col.gmailLabelId === 'IMPORTANT');
        }
        
        // Default to Inbox for emails with INBOX label or no specific categorization
        if (!targetColumn && (emailLabels.includes('INBOX') || email.taskStatus === 'none')) {
          targetColumn = dbColumns.find(col => col.gmailLabelId === 'INBOX');
        }
      }
      
      // Final fallback to Inbox or first column
      const targetId = targetColumn?.id.toString() || 
                      dbColumns.find(c => c.gmailLabelId === 'INBOX')?.id.toString() || 
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
    const sourceColumnId = parseInt(source.droppableId);
    const destColConfig = dbColumns.find(c => c.id === columnId);
    const sourceColConfig = dbColumns.find(c => c.id === sourceColumnId);

    // Call moveEmailToColumn to sync Gmail labels and update taskStatus
    moveEmailToColumn.mutate({
      emailId,
      columnId,
      sourceColumnId,
      archiveFromInbox: sourceColConfig?.gmailLabelId === 'INBOX' && destColConfig?.gmailLabelId !== 'INBOX'
    }, {
      onSuccess: () => {
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
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-10 w-10 animate-spin text-[#10F9A0]" />
          <p className="text-sm font-medium text-[#0A0A0A]/60">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          onClick={() => setIsSettingsOpen(true)}
          className="bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] rounded-full px-5 py-2 font-semibold shadow-[3px_3px_0px_0px_rgba(199,125,255,1)] hover:shadow-[5px_5px_0px_0px_rgba(199,125,255,1)] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Board Settings
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
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
