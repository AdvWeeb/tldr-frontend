import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { MailboxList, FOLDER_TO_LABEL_MAP } from '@/components/dashboard/MailboxList';
import { EmailList } from '@/components/dashboard/EmailList';
import { EmailDetail } from '@/components/dashboard/EmailDetail';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { FilteringSortingToolbar } from '@/components/toolbar/FilteringSortingToolbar';
import { SearchResults } from '@/components/search/SearchResults';
import { useMailboxes, useEmails, useEmail, useEmailMutations } from '@/hooks/useEmail';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useUIStore } from '@/store/uiStore';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Inbox() {
  const [searchParams] = useSearchParams();
  const [selectedMailboxId, setSelectedMailboxId] = useState<number | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  // UI state for view mode and filters
  const { viewMode, filters, sortBy, sortOrder, setSelectedMailboxId: setUIMailboxId } = useUIStore();

  // Data Fetching
  const { data: mailboxes = [], isLoading: isLoadingMailboxes } = useMailboxes();
  
  // Debug mailboxes
  useEffect(() => {
    console.log('All mailboxes:', mailboxes);
    console.log('Selected mailbox ID:', selectedMailboxId);
  }, [mailboxes, selectedMailboxId]);
  
  // Set first mailbox as selected when mailboxes load
  useEffect(() => {
    if (mailboxes.length > 0 && selectedMailboxId === null) {
      console.log('Setting first mailbox as selected:', mailboxes[0]);
      setSelectedMailboxId(mailboxes[0].id);
      setUIMailboxId(mailboxes[0].id);
    }
  }, [mailboxes, selectedMailboxId, setUIMailboxId]);
  
  // Handle emailId from URL query params (e.g., from Kanban board)
  useEffect(() => {
    const emailIdParam = searchParams.get('emailId');
    if (emailIdParam) {
      const emailId = parseInt(emailIdParam, 10);
      if (!isNaN(emailId)) {
        setSelectedEmailId(emailId);
      }
    }
  }, [searchParams]);
  
  // Build email query params based on selected folder
  const getEmailQueryParams = () => {
    const params: any = {
      mailboxId: selectedMailboxId ?? undefined,
      search: searchTerm,
      page,
      limit: pageSize,
      sortBy,
      sortOrder,
      ...filters, // Include filters from UI store
    };

    // If taskStatus filter is active, don't add folder-based label filters
    // because taskStatus is more specific than folder labels
    const hasTaskStatusFilter = filters.taskStatus !== undefined && filters.taskStatus !== null;

    // Handle user labels (format: "label:LABEL_ID")
    if (selectedFolder.startsWith('label:')) {
      const labelId = selectedFolder.replace('label:', '');
      if (!hasTaskStatusFilter) {
        params.label = labelId;
      }
      return params;
    }

    // Handle core folders - skip label filters if taskStatus is active
    if (!hasTaskStatusFilter) {
      switch (selectedFolder) {
        case 'favorites':
          params.isStarred = true;
          break;
        case 'snoozed':
          params.isSnoozed = true;
          break;
        case 'inbox':
          params.label = 'INBOX';
          break;
        case 'drafts':
          params.label = 'DRAFT';
          break;
        case 'sent':
          params.label = 'SENT';
          break;
        case 'spam':
          params.label = 'SPAM';
          break;
        case 'bin':
          params.includeDeleted = true;
          break;
        case 'archive':
          // Archive = emails without INBOX label (handled by backend with special logic)
          params.excludeLabel = 'INBOX';
          break;
        default:
          // Check if it's in the folder map
          const gmailLabel = FOLDER_TO_LABEL_MAP[selectedFolder];
          if (gmailLabel) {
            params.label = gmailLabel;
          }
          break;
      }
    }

    return params;
  };
  
  const { 
    data: emailData, 
    isLoading: isLoadingEmails, 
    refetch: refreshEmails 
  } = useEmails(getEmailQueryParams());
  
  const { data: selectedEmail } = useEmail(selectedEmailId);
  const { toggleStar, markAsRead, deleteEmail } = useEmailMutations();

  const emails = emailData?.data || [];
  const totalEmails = emailData?.meta.totalItems || 0;

  // Get current mailbox info
  const currentMailbox = mailboxes.find(m => m.id === selectedMailboxId);
  
  // Check if current mailbox is syncing
  const isSyncing = currentMailbox?.syncStatus === 'syncing' || currentMailbox?.syncStatus === 'pending';
  
  
  // When selectedEmail is loaded from URL param, update mailbox if needed
  useEffect(() => {
    if (selectedEmail && selectedEmail.mailboxId && selectedEmail.mailboxId !== selectedMailboxId) {
      console.log('Switching to mailbox from selected email:', selectedEmail.mailboxId);
      setSelectedMailboxId(selectedEmail.mailboxId);
      setUIMailboxId(selectedEmail.mailboxId);
    }
  }, [selectedEmail, selectedMailboxId, setUIMailboxId]);
  
  // Auto-refresh emails when sync completes
  useEffect(() => {
    if (!isSyncing && currentMailbox?.syncStatus === 'synced') {
      console.log('Sync completed, refreshing emails...');
      refreshEmails();
    }
  }, [isSyncing, currentMailbox?.syncStatus]);

  // Reset selection and page when mailbox changes
  // BUT preserve selection if it came from URL params
  useEffect(() => {
    const emailIdParam = searchParams.get('emailId');
    const hasUrlEmailId = emailIdParam && !isNaN(parseInt(emailIdParam, 10));
    
    if (!hasUrlEmailId) {
      setSelectedEmailId(null);
    }
    setPage(1);
    setIsMobileMenuOpen(false);
  }, [selectedMailboxId, searchParams]);

  // Reset page when folder changes
  // BUT preserve selection if it came from URL params
  useEffect(() => {
    const emailIdParam = searchParams.get('emailId');
    const hasUrlEmailId = emailIdParam && !isNaN(parseInt(emailIdParam, 10));
    
    if (!hasUrlEmailId) {
      setSelectedEmailId(null);
    }
    setPage(1);
  }, [selectedFolder, searchParams]);

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
    <div className="flex flex-col h-screen bg-white">
      <Navigation />
      
      {/* Loading State */}
      {mailboxes.length === 0 && isLoadingMailboxes ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#10F9A0]/10 border-2 border-[#10F9A0] rounded-full">
              <div className="w-12 h-12 border-3 border-[#10F9A0] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-[#0A0A0A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Setting up your mailbox...
              </h2>
              <p className="text-base text-[#0A0A0A]/60" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Connecting to Gmail and syncing your emails. This may take a moment.
              </p>
            </div>
          </div>
        </div>
      ) : mailboxes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md text-center space-y-4">
            <h2 className="text-3xl font-bold italic text-[#0A0A0A]" style={{ fontFamily: 'Instrument Serif, serif' }}>
              No emails found
            </h2>
            <p className="text-base text-[#0A0A0A]/60" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Your inbox is empty
            </p>
          </div>
        </div>
      ) : viewMode === 'SEARCH_VIEW' ? (
        // Search View - Full width search results
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="container mx-auto px-8 py-8 max-w-6xl">
            <SearchResults onEmailClick={setSelectedEmailId} />
          </div>
        </div>
      ) : (
      <div className="flex-1 flex overflow-hidden relative">

        {/* Left Sidebar (Mailboxes) - Desktop (LG+) only */}
        <aside className="hidden lg:block w-64 border-r-2 border-[#0A0A0A]/10 bg-[#FFF8F0] overflow-y-auto flex-shrink-0">
          <MailboxList
            mailboxes={mailboxes}
            selectedMailboxId={selectedMailboxId}
            onSelectMailbox={setSelectedMailboxId}
            currentMailbox={currentMailbox}
            selectedFolder={selectedFolder}
            onSelectFolder={setSelectedFolder}
          />
        </aside>

        {/* Mobile/Tablet Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 z-50 bg-white lg:hidden flex flex-col">
            <div className="p-4 border-b-2 border-[#0A0A0A]/10 flex items-center justify-between bg-[#FFF8F0]">
              <span className="font-bold text-[#0A0A0A] text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Mailboxes
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:bg-[#0A0A0A]/5 rounded-full"
              >
                <X className="h-5 w-5 text-[#0A0A0A]" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto bg-[#FFF8F0]">
              <MailboxList 
                mailboxes={mailboxes}
                selectedMailboxId={selectedMailboxId}
                onSelectMailbox={setSelectedMailboxId}
                currentMailbox={currentMailbox}
                selectedFolder={selectedFolder}
                onSelectFolder={setSelectedFolder}
              />
            </div>
          </div>
        )}

        {/* Middle Column (Email List) */}
        <main className={`
          flex flex-col border-r-2 border-[#0A0A0A]/10 bg-white
          w-full md:w-[400px] md:flex-none
          ${selectedEmailId ? 'hidden md:flex' : 'flex'}
        `}>
          {/* Mobile/Tablet Header for Menu */}
          <div className="lg:hidden p-3 border-b-2 border-[#0A0A0A]/10 flex items-center bg-[#FFF8F0]">
             <Button 
               variant="ghost" 
               size="icon" 
               onClick={() => setIsMobileMenuOpen(true)}
               className="hover:bg-[#0A0A0A]/5 rounded-full"
             >
               <Menu className="h-5 w-5 text-[#0A0A0A]" />
             </Button>
             <span className="ml-3 font-bold capitalize text-[#0A0A0A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
               {selectedFolder}
             </span>
          </div>

          {/* Filtering and Sorting Toolbar */}
          <FilteringSortingToolbar />

          <EmailList 
            emails={emails}
            selectedEmailId={selectedEmailId}
            onSelectEmail={setSelectedEmailId}
            isLoading={isLoadingEmails}
            isSyncing={isSyncing}
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
               <div className="md:hidden border-b-2 border-[#0A0A0A]/10 p-3 flex items-center bg-[#FFF8F0]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedEmailId(null)}
                    className="font-medium hover:bg-[#0A0A0A]/5 rounded-full px-4"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    ← Back to List
                  </Button>
               </div>
             )}
             
             <div className="flex-1 overflow-hidden">
                {selectedMailboxId !== null ? (
                  <>
                    {console.log('Inbox - Rendering EmailDetail with mailboxId:', selectedMailboxId)}
                    <EmailDetail 
                      email={selectedEmail}
                      mailboxId={selectedMailboxId}
                      onClose={() => setSelectedEmailId(null)}
                    />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center p-8">
                    <p className="text-[#0A0A0A]/60 font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Loading mailbox...
                    </p>
                  </div>
                )}
             </div>
          </div>
        </aside>

      </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp />
    </div>
  );
}
