import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { MailboxList } from '@/components/dashboard/MailboxList';
import { EmailList } from '@/components/dashboard/EmailList';
import { EmailDetail } from '@/components/dashboard/EmailDetail';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { useMailboxes, useEmails, useEmail, useEmailMutations } from '@/hooks/useEmail';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Inbox() {
  const [selectedMailboxId, setSelectedMailboxId] = useState<number | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  // Data Fetching
  const { data: mailboxes = [] } = useMailboxes();
  
  // Set first mailbox as selected when mailboxes load
  useEffect(() => {
    if (mailboxes.length > 0 && selectedMailboxId === null) {
      setSelectedMailboxId(mailboxes[0].id);
    }
  }, [mailboxes, selectedMailboxId]);
  
  const { 
    data: emailData, 
    isLoading: isLoadingEmails, 
    refetch: refreshEmails 
  } = useEmails({ 
    mailboxId: selectedMailboxId ?? undefined, 
    search: searchTerm,
    page,
    limit: pageSize,
  });
  
  const { data: selectedEmail } = useEmail(selectedEmailId);
  const { toggleStar, markAsRead, deleteEmail } = useEmailMutations();

  const emails = emailData?.data || [];
  const totalEmails = emailData?.meta.totalItems || 0;

  // Reset selection and page when mailbox changes
  useEffect(() => {
    setSelectedEmailId(null);
    setPage(1);
    setIsMobileMenuOpen(false);
  }, [selectedMailboxId]);

  // Reset page when search term changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // Keyboard navigation handlers
  const handleNext = () => {
    if (emails.length === 0) return;
    
    if (!selectedEmailId) {
      setSelectedEmailId(emails[0].id);
    } else {
      const currentIndex = emails.findIndex(e => e.id === selectedEmailId);
      if (currentIndex < emails.length - 1) {
        setSelectedEmailId(emails[currentIndex + 1].id);
      } else if (page < Math.ceil(totalEmails / pageSize)) {
        // Move to next page
        setPage(page + 1);
        // Wait for new data and select first email
        setTimeout(() => {
          if (emails.length > 0) {
            setSelectedEmailId(emails[0].id);
          }
        }, 100);
      }
    }
  };

  const handlePrevious = () => {
    if (emails.length === 0) return;
    
    if (!selectedEmailId) {
      setSelectedEmailId(emails[emails.length - 1].id);
    } else {
      const currentIndex = emails.findIndex(e => e.id === selectedEmailId);
      if (currentIndex > 0) {
        setSelectedEmailId(emails[currentIndex - 1].id);
      } else if (page > 1) {
        // Move to previous page
        setPage(page - 1);
      }
    }
  };

  const handleOpen = () => {
    if (selectedEmailId && selectedEmail && !selectedEmail.isRead) {
      markAsRead.mutate({ id: selectedEmailId, isRead: true });
    }
  };

  const handleClose = () => {
    setSelectedEmailId(null);
  };

  const handleStar = () => {
    if (selectedEmailId && selectedEmail) {
      toggleStar.mutate({ 
        id: selectedEmailId, 
        isStarred: !selectedEmail.isStarred 
      });
    }
  };

  const handleDelete = () => {
    if (selectedEmailId) {
      deleteEmail.mutate(selectedEmailId);
      // Select next email after deletion
      const currentIndex = emails.findIndex(e => e.id === selectedEmailId);
      if (currentIndex < emails.length - 1) {
        setSelectedEmailId(emails[currentIndex + 1].id);
      } else if (currentIndex > 0) {
        setSelectedEmailId(emails[currentIndex - 1].id);
      } else {
        setSelectedEmailId(null);
      }
    }
  };

  const handleSearch = () => {
    const searchInput = document.getElementById('email-search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };

  // Enable keyboard navigation
  useKeyboardNavigation({
    enabled: true,
    onNext: handleNext,
    onPrevious: handlePrevious,
    onOpen: handleOpen,
    onClose: handleClose,
    onStar: handleStar,
    onDelete: handleDelete,
    onSearch: handleSearch,
    onRefresh: refreshEmails,
  });

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navigation />
      
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidebar (Mailboxes) - Desktop (LG+) only */}
        <aside className="hidden lg:block w-64 border-r bg-gray-50/50 overflow-y-auto flex-shrink-0">
          <MailboxList 
            mailboxes={mailboxes}
            selectedMailboxId={selectedMailboxId}
            onSelectMailbox={setSelectedMailboxId}
          />
        </aside>

        {/* Mobile/Tablet Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 z-50 bg-background lg:hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="font-bold">Mailboxes</span>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <MailboxList 
                mailboxes={mailboxes}
                selectedMailboxId={selectedMailboxId}
                onSelectMailbox={setSelectedMailboxId}
              />
            </div>
          </div>
        )}

        {/* Middle Column (Email List) */}
        <main className={`
          flex flex-col border-r bg-white
          w-full md:w-[350px] md:flex-none
          ${selectedEmailId ? 'hidden md:flex' : 'flex'} 
        `}>
          {/* Mobile/Tablet Header for Menu */}
          <div className="lg:hidden p-2 border-b flex items-center bg-gray-50">
             <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
               <Menu className="h-5 w-5" />
             </Button>
             <span className="ml-2 font-semibold capitalize">{selectedMailboxId}</span>
          </div>

          <EmailList 
            emails={emails}
            selectedEmailId={selectedEmailId}
            onSelectEmail={setSelectedEmailId}
            isLoading={isLoadingEmails}
            onSearch={setSearchTerm}
            onRefresh={refreshEmails}
            page={page}
            totalEmails={totalEmails}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </main>

        {/* Right Column (Email Detail) */}
        <aside className={`
          bg-white overflow-hidden flex-1
          ${selectedEmailId ? 'fixed inset-0 z-40 md:static md:flex' : 'hidden md:flex'}
        `}>
          <div className="w-full h-full flex flex-col">
             {/* Mobile Back Button Wrapper - Only shown on mobile when detailed is open */}
             {selectedEmailId && (
               <div className="md:hidden border-b p-2 flex items-center bg-white">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEmailId(null)}>
                    ← Back to List
                  </Button>
               </div>
             )}
             
             <div className="flex-1 overflow-hidden">
                <EmailDetail 
                  email={selectedEmail} 
                  onClose={() => setSelectedEmailId(null)}
                />
             </div>
          </div>
        </aside>

      </div>

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp />
    </div>
  );
}
