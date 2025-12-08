import type { DroppableProvided } from '@hello-pangea/dnd';
import { EmailCard } from './EmailCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  title: string;
  emails: any[];
  provided: DroppableProvided;
  isDraggingOver: boolean;
}

export function KanbanColumn({
  title,
  emails,
  provided,
  isDraggingOver,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-250px)] bg-muted/30 rounded-lg">
      {/* Column Header */}
      <div className="p-4 border-b bg-card rounded-t-lg">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{emails.length} emails</p>
      </div>

      {/* Column Content */}
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        className={cn(
          'flex-1 overflow-y-auto p-3 space-y-3',
          isDraggingOver && 'bg-accent/50'
        )}
      >
        {emails.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            No emails
          </div>
        ) : (
          <>
            {emails.map((email, index) => (
              <EmailCard key={email.id} email={email} index={index} />
            ))}
            {provided.placeholder}
          </>
        )}
      </div>
    </div>
  );
}
