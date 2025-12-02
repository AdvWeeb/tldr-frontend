import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Inbox,
  Send,
  File,
  Trash2,
  Archive,
  Star,
  Folder,
  Plus,
  X
} from 'lucide-react';

interface MailboxListProps {
  mailboxes: any[]; // Backend mailbox type
  selectedMailboxId: number | null;
  onSelectMailbox: (id: number) => void;
}

export function MailboxList({ mailboxes, selectedMailboxId, onSelectMailbox }: Readonly<MailboxListProps>) {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  
  const getIcon = () => {
    return <Inbox className="h-4 w-4" />;
  };

  return (
    <div className="flex flex-col gap-1 py-2">
      {/* Compose Button */}
      <div className="px-4 mb-2">
        <button 
          onClick={() => setIsComposeOpen(true)}
          className="flex items-center justify-center w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full shadow-md font-medium transition-all"
        >
           <Plus className="h-5 w-5" />
           <span className="lg:inline">Compose</span>
        </button>
      </div>

      <h2 className="px-4 py-2 text-lg font-semibold tracking-tight">
        Mailboxes
      </h2>
      <nav className="grid gap-1 px-2">
        {mailboxes.map((mailbox) => (
          <button
            key={mailbox.id}
            onClick={() => onSelectMailbox(mailbox.id)}
            className={cn(
              "flex items-center justify-between whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              selectedMailboxId === mailbox.id
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "hover:bg-muted hover:text-accent-foreground text-gray-600"
            )}
          >
            <div className="flex items-center gap-3">
              {getIcon()}
              <span>{mailbox.email}</span>
            </div>
            {mailbox.unreadCount && mailbox.unreadCount > 0 && (
              <span className={cn(
                "ml-auto text-xs",
                selectedMailboxId === mailbox.id 
                  ? "text-primary-foreground" 
                  : "text-muted-foreground"
              )}>
                {mailbox.unreadCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Compose Modal Mockup */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">New Message</h3>
                    <button onClick={() => setIsComposeOpen(false)} className="text-gray-500 hover:text-gray-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                    <input placeholder="To" className="w-full p-2 border-b focus:outline-none focus:border-blue-500 transition-colors" />
                    <input placeholder="Subject" className="w-full p-2 border-b focus:outline-none focus:border-blue-500 transition-colors" />
                    <textarea placeholder="Message..." className="w-full h-40 p-2 resize-none focus:outline-none" />
                </div>
                <div className="p-3 border-t flex justify-end gap-2 bg-gray-50">
                     <button onClick={() => setIsComposeOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded transition-colors">Discard</button>
                     <button onClick={() => setIsComposeOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition-colors">Send</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
