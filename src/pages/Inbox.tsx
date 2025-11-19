import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { MailboxList } from '@/components/dashboard/MailboxList';
import { EmailList } from '@/components/dashboard/EmailList';
import { EmailDetail } from '@/components/dashboard/EmailDetail';
import { useMailboxes, useEmails, useEmail } from '@/hooks/useEmail';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Inbox() {
  const [selectedMailboxId, setSelectedMailboxId] = useState('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data Fetching
  const { data: mailboxes = [] } = useMailboxes();
  const { 
    data: emailData, 
    isLoading: isLoadingEmails, 
    refetch: refreshEmails 
  } = useEmails({ 
    mailboxId: selectedMailboxId, 
    search: searchTerm 
  });
  
  const { data: selectedEmail } = useEmail(selectedEmailId);

  // Reset selection when mailbox changes
  useEffect(() => {
    setSelectedEmailId(null);
    setIsMobileMenuOpen(false);
  }, [selectedMailboxId]);

  const emails = emailData?.emails || [];

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
    </div>
  );
}
