import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { FilteringSortingToolbar } from '@/components/toolbar/FilteringSortingToolbar';
import { SearchResults } from '@/components/search/SearchResults';
import { useMailboxes, useEmails, useEmailMutations } from '@/hooks/useEmail';
import { useUIStore } from '@/store/uiStore';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const MIN_SUMMARIZED_EMAILS = 5; // Minimum number of emails that should have summaries

export function Kanban() {
  const [selectedMailboxId, setSelectedMailboxId] = useState<number | null>(null);
  const [, setSelectedEmailId] = useState<number | null>(null);
  const [summarizingCount, setSummarizingCount] = useState(0);

  // UI state for view mode and filters
  const { viewMode, filters, sortBy, sortOrder, setSelectedMailboxId: setUIMailboxId } = useUIStore();

  // Fetch mailboxes
  const { data: mailboxes = [], isLoading: isLoadingMailboxes } = useMailboxes();

  // Get summarize mutation
  const { summarizeEmail } = useEmailMutations();

  // Set first mailbox as selected when mailboxes load
  useEffect(() => {
    if (mailboxes.length > 0 && selectedMailboxId === null) {
      setSelectedMailboxId(mailboxes[0].id);
      setUIMailboxId(mailboxes[0].id);
    }
  }, [mailboxes, selectedMailboxId, setUIMailboxId]);

  // Fetch all emails for the selected mailbox with filters and sorting
  const { data: emailData, isLoading: isLoadingEmails } = useEmails({
    mailboxId: selectedMailboxId ?? undefined,
    limit: 100, // Get more emails for filtering
    sortBy,
    sortOrder,
    ...filters, // Spread filters from UI store
  });

  const emails = emailData?.data || [];
  const currentMailbox = mailboxes.find(m => m.id === selectedMailboxId);

  // Count emails that already have summaries
  const summarizedCount = emails.filter(email => email.aiSummary).length;
  const emailsWithoutSummary = emails.filter(email => !email.aiSummary && !email.snoozedUntil);

  // Function to summarize more emails (called by button)
  const handleLoadMoreSummaries = () => {
    const toSummarize = emailsWithoutSummary.slice(0, MIN_SUMMARIZED_EMAILS);
    
    if (toSummarize.length === 0) {
      toast.info('All emails already have summaries!');
      return;
    }

    setSummarizingCount(toSummarize.length);
    toast.info(`Generating AI summaries for ${toSummarize.length} emails...`);

    // Summarize emails one by one to avoid overwhelming the API
    toSummarize.forEach((email, index) => {
      setTimeout(() => {
        summarizeEmail.mutate(email.id, {
          onSuccess: () => {
            console.log(`Summary generated for email ${email.id}`);
            setSummarizingCount(prev => Math.max(0, prev - 1));
          },
          onError: (error) => {
            console.error(`Failed to summarize email ${email.id}:`, error);
            setSummarizingCount(prev => Math.max(0, prev - 1));
          },
        });
      }, index * 1000); // Stagger by 1 second each
    });
  };

  // Auto-summarize ONLY if we have less than MIN_SUMMARIZED_EMAILS with summaries
  // This runs once when emails load, not on every refresh if we already have enough
  const [hasAutoSummarized, setHasAutoSummarized] = useState(false);
  
  useEffect(() => {
    if (!hasAutoSummarized && emails.length > 0 && !isLoadingEmails) {
      // Only auto-summarize if we have fewer than MIN_SUMMARIZED_EMAILS with summaries
      if (summarizedCount < MIN_SUMMARIZED_EMAILS) {
        const needed = MIN_SUMMARIZED_EMAILS - summarizedCount;
        const toSummarize = emailsWithoutSummary.slice(0, needed);
        
        if (toSummarize.length > 0) {
          setHasAutoSummarized(true);
          setSummarizingCount(toSummarize.length);
          toast.info(`Generating AI summaries for ${toSummarize.length} emails...`);

          toSummarize.forEach((email, index) => {
            setTimeout(() => {
              summarizeEmail.mutate(email.id, {
                onSuccess: () => {
                  setSummarizingCount(prev => Math.max(0, prev - 1));
                },
                onError: () => {
                  setSummarizingCount(prev => Math.max(0, prev - 1));
                },
              });
            }, index * 1000);
          });
        }
      }
      setHasAutoSummarized(true); // Mark as checked even if no summarization needed
    }
  }, [emails.length, hasAutoSummarized, isLoadingEmails, summarizedCount]);

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
          <div className="flex items-center justify-between">
            <div>
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
            <div className="flex items-center gap-3">
              {/* Load More Summaries Button */}
              {emailsWithoutSummary.length > 0 && summarizingCount === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMoreSummaries}
                  className="flex items-center gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  Generate {Math.min(emailsWithoutSummary.length, MIN_SUMMARIZED_EMAILS)} Summaries
                </Button>
              )}
              
              {/* Summarizing indicator */}
              {summarizingCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                  <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
                  <span className="text-sm text-purple-900 font-medium">
                    Generating {summarizingCount} {summarizingCount === 1 ? 'summary' : 'summaries'}...
                  </span>
                </div>
              )}
              
              {/* Summary stats */}
              {!isLoadingEmails && (
                <span className="text-xs text-muted-foreground">
                  {summarizedCount}/{emails.length} summarized
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Filtering and Sorting Toolbar */}
        {viewMode === 'BOARD_VIEW' && <FilteringSortingToolbar />}

        {/* Content: Kanban Board or Search Results */}
        {isLoadingEmails ? (
          <div className="flex items-center justify-center h-[500px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : viewMode === 'SEARCH_VIEW' ? (
          <div className="mt-6">
            <SearchResults onEmailClick={setSelectedEmailId} />
          </div>
        ) : (
          <KanbanBoard emails={emails} />
        )}
      </div>
    </div>
  );
}
