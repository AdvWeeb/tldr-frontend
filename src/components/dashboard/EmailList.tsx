import { cn } from '@/lib/utils';
import { Search, RotateCw, CheckSquare, Trash2, MailOpen, Mail, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { List } from 'react-virtualized';
import 'react-virtualized/styles.css';
import { useRef, useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useEmailMutations } from '@/hooks/useEmail';

interface EmailListProps {
  emails: any[]; // Backend email type
  selectedEmailId: number | null;
  onSelectEmail: (id: number) => void;
  isLoading: boolean;
  isSyncing?: boolean;
  onSearch: (term: string) => void;
  onRefresh: () => void;
  page: number;
  totalEmails: number;
  pageSize: number;
  onPageChange: (page: number) => void;
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
  isSyncing = false,
  onSearch,
  onRefresh,
  page,
  totalEmails,
  pageSize,
  onPageChange,
}: EmailListProps) {
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toggleStar, markAsRead, deleteEmail } = useEmailMutations();
  const [selectedEmails, setSelectedEmails] = useState<number[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const handleToggleStar = (e: React.MouseEvent, emailId: number, isStarred: boolean) => {
    e.stopPropagation();
    toggleStar.mutate({ id: emailId, isStarred: !isStarred });
  };

  const toggleSelectAll = () => {
    if (selectedEmails.length === emails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(emails.map(e => e.id));
    }
  };

  const toggleEmailSelection = (e: React.MouseEvent, emailId: number) => {
    e.stopPropagation();
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleDeleteSelected = () => {
    const emailsToDelete = selectedEmails.length > 0 ? selectedEmails : (selectedEmailId ? [selectedEmailId] : []);
    
    if (emailsToDelete.length === 0) {
      toast.error('No emails selected');
      return;
    }

    const count = emailsToDelete.length;
    toast.promise(
      Promise.all(emailsToDelete.map(id => deleteEmail.mutateAsync(id))),
      {
        loading: `Deleting ${count} email${count > 1 ? 's' : ''}...`,
        success: () => {
          setSelectedEmails([]);
          setIsSelectMode(false);
          return `${count} email${count > 1 ? 's' : ''} deleted`;
        },
        error: `Failed to delete email${count > 1 ? 's' : ''}`,
      }
    );
  };

  const markSelectedAsRead = () => {
    const emailsToMark = selectedEmails.length > 0 ? selectedEmails : (selectedEmailId ? [selectedEmailId] : []);
    emailsToMark.forEach(id => {
      markAsRead.mutate({ id, isRead: true });
    });
    setSelectedEmails([]);
  };

  const markSelectedAsUnread = () => {
    const emailsToMark = selectedEmails.length > 0 ? selectedEmails : (selectedEmailId ? [selectedEmailId] : []);
    emailsToMark.forEach(id => {
      markAsRead.mutate({ id, isRead: false });
    });
    setSelectedEmails([]);
  };

  // Scroll to selected email when it changes
  useEffect(() => {
    if (selectedEmailId && listRef.current) {
      const index = emails.findIndex(e => e.id === selectedEmailId);
      if (index !== -1) {
        listRef.current.scrollToRow(index);
      }
    }
  }, [selectedEmailId, emails]);

  const totalPages = Math.ceil(totalEmails / pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalEmails);

  // Email row renderer for react-virtualized
  const rowRenderer = ({ index, key, style }: { index: number; key: string; style: React.CSSProperties }) => {
    const email = emails[index];
    if (!email) return null;

    const isSelected = selectedEmails.includes(email.id);

    return (
      <div
        key={key}
        style={style}
        onClick={() => !isSelectMode && onSelectEmail(email.id)}
        className={cn(
          "flex flex-col gap-1.5 px-4 py-3 cursor-pointer transition-all duration-150 border-b border-[#0A0A0A]/5",
          selectedEmailId === email.id 
            ? "bg-[#FFF8F0] border-l-4 border-l-[#10F9A0]" 
            : "bg-white hover:bg-[#FFF8F0]/50",
          !email.isRead && "bg-[#10F9A0]/5",
          isSelected && "bg-[#C77DFF]/10"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {isSelectMode && (
              <Checkbox
                checked={isSelected}
                onClick={(e) => toggleEmailSelection(e, email.id)}
                className="flex-shrink-0"
              />
            )}
            <button
              onClick={(e) => handleToggleStar(e, email.id, email.isStarred)}
              className="flex-shrink-0 hover:scale-110 transition-transform"
              title={email.isStarred ? "Unstar" : "Star"}
            >
              <Star className={cn(
                "h-4 w-4",
                email.isStarred ? "text-[#FF6B6B] fill-[#FF6B6B]" : "text-gray-300 hover:text-[#FF6B6B]"
              )} />
            </button>
            <span className={cn(
              "truncate",
              !email.isRead ? "font-bold text-[#0A0A0A]" : "font-medium text-[#0A0A0A]/80"
            )} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {email.fromName || email.fromEmail}
            </span>
          </div>
          <span className={cn(
              "text-xs whitespace-nowrap font-medium",
              !email.isRead ? "text-[#10F9A0] font-bold" : "text-[#0A0A0A]/50"
          )} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {formatDate(email.receivedAt)}
          </span>
        </div>
        <div className={cn(
          "text-sm truncate pl-6",
          !email.isRead ? "font-semibold text-[#0A0A0A]" : "text-[#0A0A0A]/70"
        )} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {email.subject || '(No subject)'}
        </div>
        <div className="text-xs text-[#0A0A0A]/50 truncate pl-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {email.snippet}
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full border-r-2 border-[#0A0A0A]/10 bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b-2 border-[#0A0A0A]/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#0A0A0A]/40" />
          <Input 
            placeholder="Search mail (press / to focus)" 
            className="pl-9 border-2 border-[#0A0A0A]/20 rounded-xl focus:border-[#10F9A0] focus:ring-2 focus:ring-[#10F9A0]/20" 
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            onChange={(e) => onSearch(e.target.value)}
            id="email-search-input"
          />
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onRefresh} 
          title="Refresh (r)"
          className="rounded-full hover:bg-[#10F9A0]/10"
        >
          <RotateCw className={cn("h-4 w-4 text-[#0A0A0A]", isSyncing && "animate-spin text-[#10F9A0]")} />
        </Button>
      </div>

      {/* Sync Status Banner */}
      {isSyncing && (
        <div className="bg-[#10F9A0]/10 border-b-2 border-[#10F9A0] px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-[#0A0A0A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <RotateCw className="h-4 w-4 animate-spin text-[#10F9A0]" />
          <span>Syncing emails from Gmail...</span>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center gap-2 p-2 border-b-2 border-[#0A0A0A]/10 bg-[#FFF8F0]">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 rounded-full font-medium hover:bg-white"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          onClick={() => {
            setIsSelectMode(!isSelectMode);
            if (!isSelectMode) {
              setSelectedEmails([]);
            }
          }}
        >
          <CheckSquare className="mr-2 h-4 w-4" /> 
          {isSelectMode ? 'Cancel' : 'Select'}
        </Button>
        {isSelectMode && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 rounded-full font-medium hover:bg-white"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            onClick={toggleSelectAll}
          >
            {selectedEmails.length === emails.length ? 'Deselect All' : 'Select All'}
          </Button>
        )}
        {selectedEmails.length > 0 && (
          <span className="text-xs font-bold text-[#0A0A0A] px-2 py-1 bg-white rounded-full" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {selectedEmails.length} selected
          </span>
        )}
        <div className="ml-auto flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-white" 
              title="Mark as read"
              onClick={markSelectedAsRead}
              disabled={!selectedEmailId && selectedEmails.length === 0}
            >
                <MailOpen className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-white" 
              title="Mark as unread"
              onClick={markSelectedAsUnread}
              disabled={!selectedEmailId && selectedEmails.length === 0}
            >
                <Mail className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full text-[#FF6B6B] hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/10" 
              title="Delete (#)"
              onClick={handleDeleteSelected}
              disabled={!selectedEmailId && selectedEmails.length === 0}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-hidden" ref={containerRef}>
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
          <div className="flex flex-col items-center justify-center h-40 p-4 text-center">
            <p className="text-[#0A0A0A]/60 font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>No emails found</p>
          </div>
        ) : (
          <List
            ref={listRef}
            height={containerRef.current?.clientHeight || 600}
            rowCount={emails.length}
            rowHeight={95}
            width={containerRef.current?.clientWidth || 350}
            rowRenderer={rowRenderer}
            overscanRowCount={5}
            scrollToIndex={selectedEmailId ? emails.findIndex(e => e.id === selectedEmailId) : undefined}
          />
        )}
      </div>
      
      {/* Pagination */}
      <div className="p-3 border-t-2 border-[#0A0A0A]/10 flex items-center justify-between text-sm bg-[#FFF8F0]">
        <span className="font-medium text-[#0A0A0A]/70" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {totalEmails > 0 ? `${startIndex}-${endIndex} of ${totalEmails}` : 'No emails'}
        </span>
        <div className="flex gap-1 items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            title="Previous page (k)"
            className="h-8 w-8 rounded-full hover:bg-white disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-3 flex items-center font-bold text-[#0A0A0A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {page}/{totalPages || 1}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            title="Next page (j)"
            className="h-8 w-8 rounded-full hover:bg-white disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

