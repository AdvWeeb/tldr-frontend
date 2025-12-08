import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { useMailboxes, useEmails } from '@/hooks/useEmail';
import { Loader2 } from 'lucide-react';

export function Kanban() {
  const [selectedMailboxId, setSelectedMailboxId] = useState<number | null>(null);

  // Fetch mailboxes
  const { data: mailboxes = [], isLoading: isLoadingMailboxes } = useMailboxes();

  // Set first mailbox as selected when mailboxes load
  useEffect(() => {
    if (mailboxes.length > 0 && selectedMailboxId === null) {
      setSelectedMailboxId(mailboxes[0].id);
    }
  }, [mailboxes, selectedMailboxId]);

  // Fetch all emails for the selected mailbox
  const { data: emailData, isLoading: isLoadingEmails } = useEmails({
    mailboxId: selectedMailboxId ?? undefined,
    limit: 50, // Get all emails
  });

  const emails = emailData?.data || [];
  const currentMailbox = mailboxes.find(m => m.id === selectedMailboxId);

  if (isLoadingMailboxes) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Email Kanban</h1>
          <p className="text-muted-foreground">
            Manage your emails with a visual workflow
          </p>
          {currentMailbox && (
            <p className="text-sm text-muted-foreground mt-2">
              Mailbox: <span className="font-medium">{currentMailbox.email}</span>
            </p>
          )}
        </div>

        {/* Kanban Board */}
        {isLoadingEmails ? (
          <div className="flex items-center justify-center h-[500px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <KanbanBoard emails={emails} mailboxId={selectedMailboxId} />
        )}
      </div>
    </div>
  );
}
