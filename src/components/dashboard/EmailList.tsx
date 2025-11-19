import type { Email } from '@/types/email';
import { cn } from '@/lib/utils';
import { Search, RotateCw, CheckSquare, Trash2, MailOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
  isLoading: boolean;
  onSearch: (term: string) => void;
  onRefresh: () => void;
}

// Helper for date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(date);
  }
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

export function EmailList({ 
  emails, 
  selectedEmailId, 
  onSelectEmail, 
  isLoading,
  onSearch,
  onRefresh
}: EmailListProps) {
  
  return (
    <div className="flex flex-col h-full border-r bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-4 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search mail" 
            className="pl-8" 
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh">
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Action Bar (Optional based on requirement) */}
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50/50">
        <Button variant="ghost" size="sm" className="h-8">
          <CheckSquare className="mr-2 h-4 w-4" /> Select
        </Button>
        <div className="ml-auto flex gap-1">
             <Button variant="ghost" size="icon" className="h-8 w-8">
                <MailOpen className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
               <div key={i} className="flex items-center space-x-4">
                 <Skeleton className="h-12 w-12 rounded-full" />
                 <div className="space-y-2">
                   <Skeleton className="h-4 w-[250px]" />
                   <Skeleton className="h-4 w-[200px]" />
                 </div>
               </div>
            ))}
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground p-4 text-center">
            <p>No emails found</p>
          </div>
        ) : (
          <div className="divide-y">
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => onSelectEmail(email.id)}
                className={cn(
                  "flex flex-col gap-1 p-4 cursor-pointer hover:bg-accent transition-colors",
                  selectedEmailId === email.id ? "bg-accent" : "bg-white",
                  !email.isRead && "font-semibold bg-blue-50/50"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">{email.sender.name}</span>
                  <span className={cn(
                      "text-xs whitespace-nowrap",
                      !email.isRead ? "text-blue-600" : "text-muted-foreground"
                  )}>
                    {formatDate(email.timestamp)}
                  </span>
                </div>
                <div className="text-sm truncate">{email.subject}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {email.preview}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

