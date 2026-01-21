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
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-[#10F9A0]" />
            <p className="text-sm font-medium text-[#0A0A0A]/60">Loading mailboxes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold italic text-[#0A0A0A] mb-3" style={{ fontFamily: 'Instrument Serif, serif' }}>
                Email Kanban
              </h1>
              <p className="text-base text-[#0A0A0A]/70 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Manage your emails with a visual workflow
              </p>
              {currentMailbox && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFF8F0] border-2 border-[#0A0A0A] rounded-full mt-2">
                  <div className="w-2 h-2 bg-[#10F9A0] rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-[#0A0A0A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {currentMailbox.email}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Load More Summaries Button */}
              {emailsWithoutSummary.length > 0 && summarizingCount === 0 && (
                <Button
                  onClick={handleLoadMoreSummaries}
                  className="bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(199,125,255,1)] hover:shadow-[5px_5px_0px_0px_rgba(199,125,255,1)] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate {Math.min(emailsWithoutSummary.length, MIN_SUMMARIZED_EMAILS)} Summaries
                </Button>
              )}
              
              {/* Summarizing indicator */}
              {summarizingCount > 0 && (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-[#C77DFF]/10 border-2 border-[#C77DFF] rounded-full">
                  <Sparkles className="h-4 w-4 text-[#C77DFF] animate-pulse" />
                  <span className="text-sm font-bold text-[#0A0A0A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Generating {summarizingCount} {summarizingCount === 1 ? 'summary' : 'summaries'}...
                  </span>
                </div>
              )}
              
              {/* Summary stats */}
              {!isLoadingEmails && (
                <div className="px-4 py-2 bg-[#10F9A0]/10 border-2 border-[#10F9A0] rounded-full">
                  <span className="text-sm font-bold text-[#0A0A0A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {summarizedCount}/{emails.length} summarized
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filtering and Sorting Toolbar */}
        {viewMode === 'BOARD_VIEW' && (
          <div className="mb-8">
            <FilteringSortingToolbar />
          </div>
        )}

        {/* Content: Kanban Board or Search Results */}
        {isLoadingEmails ? (
          <div className="flex items-center justify-center h-[500px]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-[#10F9A0]" />
              <p className="text-sm font-medium text-[#0A0A0A]/60">Loading emails...</p>
            </div>
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
