import type { DroppableProvided } from '@hello-pangea/dnd';
import { EmailCard } from './EmailCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  title: string;
  emails: any[];
  provided: DroppableProvided;
  isDraggingOver: boolean;
  color?: string;
}

export function KanbanColumn({
  title,
  emails,
  provided,
  isDraggingOver,
  color = '#6B7280',
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-250px)] bg-white border-2 border-[#0A0A0A] rounded-[2rem] min-w-[280px] shadow-[4px_4px_0px_0px_rgba(10,10,10,0.1)] overflow-hidden">
      {/* Column Header */}
      <div 
        className="p-5 border-b-2 border-[#0A0A0A] bg-[#FFF8F0]"
      >
        <div className="flex items-center gap-2 mb-1">
          <div 
            className="w-3 h-3 rounded-full border-2 border-[#0A0A0A]"
            style={{ backgroundColor: color }}
          />
          <h3 className="font-bold text-lg text-[#0A0A0A]">{title}</h3>
        </div>
        <p className="text-sm text-[#0A0A0A]/60 font-medium">{emails.length} {emails.length === 1 ? 'email' : 'emails'}</p>
      </div>

      {/* Column Content */}
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        className={cn(
          'flex-1 overflow-y-auto p-4 space-y-3',
          isDraggingOver && 'bg-[#10F9A0]/10'
        )}
      >
        {emails.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-[#0A0A0A]/50">
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
