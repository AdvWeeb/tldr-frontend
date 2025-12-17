import { Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useEmailSearch } from '@/hooks/useEmail';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface SearchResultsProps {
  onEmailClick: (emailId: number) => void;
}

export function SearchResults({ onEmailClick }: SearchResultsProps) {
  const { searchQuery, clearSearch, selectedMailboxId } = useUIStore();

  const { data, isLoading, error, isError } = useEmailSearch({
    q: searchQuery,
    mailboxId: selectedMailboxId || undefined,
    threshold: 0.2,
    fields: 'all',
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Searching emails...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Failed to fetch results</h3>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Please try again.'}
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Mail className="h-12 w-12 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">No emails match your search</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search query or filters
          </p>
          <Button variant="outline" onClick={clearSearch}>
            Clear Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Results Header */}
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Search Results</h2>
          <p className="text-sm text-muted-foreground">
            Found {data.meta.totalItems} {data.meta.totalItems === 1 ? 'email' : 'emails'} matching "{searchQuery}"
          </p>
        </div>
        <Button variant="ghost" onClick={clearSearch}>
          Back to Board
        </Button>
      </div>

      {/* Results List */}
      <div className="space-y-2">
        {data.data.map((email) => (
          <Card
            key={email.id}
            className="p-4 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => onEmailClick(email.id)}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {email.fromName ? email.fromName[0].toUpperCase() : email.fromEmail[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Email Content */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold truncate">
                      {email.fromName || email.fromEmail}
                    </span>
                    {!email.isRead && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(email.receivedAt)}
                  </span>
                </div>

                {/* Subject */}
                <p className="font-medium text-sm truncate">{email.subject || '(No subject)'}</p>

                {/* Snippet or AI Summary */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {email.aiSummary || email.snippet || 'No content preview'}
                </p>

                {/* Badges Row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Relevance Score */}
                  <Badge variant="outline" className="text-xs">
                    {Math.round(email.relevance * 100)}% match
                  </Badge>

                  {/* Category */}
                  <Badge
                    variant="secondary"
                    className="text-xs capitalize"
                  >
                    {email.category}
                  </Badge>

                  {/* Task Status */}
                  {email.taskStatus !== 'none' && (
                    <Badge variant="default" className="text-xs capitalize">
                      {email.taskStatus.replace('_', ' ')}
                    </Badge>
                  )}

                  {/* Attachments */}
                  {email.hasAttachments && (
                    <Badge variant="outline" className="text-xs">
                      📎 Attachments
                    </Badge>
                  )}

                  {/* Starred */}
                  {email.isStarred && (
                    <Badge variant="outline" className="text-xs">
                      ⭐ Starred
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination Info */}
      {data.meta.totalPages > 1 && (
        <div className="text-center text-sm text-muted-foreground pt-4">
          Page {data.meta.currentPage} of {data.meta.totalPages}
        </div>
      )}
    </div>
  );
}
