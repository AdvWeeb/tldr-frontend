import { Mail, AlertCircle, Loader2, BrainCircuit, Search as SearchIcon, Star, Paperclip } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useEmailSearch, useSemanticSearch } from '@/hooks/useEmail';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SearchResultsProps {
  onEmailClick: (emailId: number) => void;
}

export function SearchResults({ onEmailClick }: SearchResultsProps) {
  const { searchQuery, clearSearch, selectedMailboxId } = useUIStore();
  const [searchMode, setSearchMode] = useState<'semantic' | 'fuzzy'>('semantic');

  const fuzzySearch = useEmailSearch({
    q: searchQuery,
    mailboxId: selectedMailboxId || undefined,
    threshold: 0.2,
    fields: 'all',
  }, searchMode === 'fuzzy');

  const semanticSearch = useSemanticSearch({
    q: searchQuery,
    mailboxId: selectedMailboxId || undefined,
    minSimilarity: 0.3,
  }, searchMode === 'semantic');

  const activeSearch = searchMode === 'semantic' ? semanticSearch : fuzzySearch;
  const { data, isLoading, error, isError } = activeSearch;

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
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#10F9A0]" />
        <p className="text-sm font-medium text-[#0A0A0A]/60">Searching emails...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="p-6 bg-[#FF6B6B]/10 border-2 border-[#FF6B6B] rounded-[2rem]">
          <AlertCircle className="h-12 w-12 text-[#FF6B6B]" />
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-xl font-bold text-[#0A0A0A]">Failed to fetch results</h3>
          <p className="text-sm text-[#0A0A0A]/60">
            {error instanceof Error ? error.message : 'Please try again.'}
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] rounded-full px-6 py-2 font-semibold shadow-[3px_3px_0px_0px_rgba(10,10,10,1)] hover:shadow-[5px_5px_0px_0px_rgba(10,10,10,1)] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="p-6 bg-[#FFF8F0] border-2 border-[#0A0A0A]/10 rounded-[2rem]">
          <Mail className="h-12 w-12 text-[#0A0A0A]/30" />
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-xl font-bold text-[#0A0A0A]">No emails match your search</h3>
          <p className="text-sm text-[#0A0A0A]/60">
            Try adjusting your search query or filters
          </p>
          <Button 
            onClick={clearSearch}
            className="bg-[#10F9A0] text-[#0A0A0A] border-2 border-[#0A0A0A] rounded-full px-6 py-2 font-semibold shadow-[3px_3px_0px_0px_rgba(10,10,10,1)] hover:shadow-[5px_5px_0px_0px_rgba(10,10,10,1)] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200"
          >
            Clear Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-[#0A0A0A]">Search Results</h2>
          <p className="text-sm text-[#0A0A0A]/60 font-medium">
            Found {data.meta.totalResults} {data.meta.totalResults === 1 ? 'email' : 'emails'} matching "<span className="font-semibold text-[#0A0A0A]">{searchQuery}</span>"
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-[#FFF8F0] p-1.5 rounded-full border-2 border-[#0A0A0A]/10">
          <Button 
            size="sm" 
            onClick={() => setSearchMode('semantic')}
            className={cn(
              "gap-2 rounded-full font-semibold transition-all duration-200",
              searchMode === 'semantic' 
                ? "bg-[#C77DFF] text-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] hover:bg-[#C77DFF]" 
                : "bg-transparent hover:bg-white text-[#0A0A0A] border-2 border-transparent"
            )}
          >
            <BrainCircuit className="h-4 w-4" />
            AI Semantic
          </Button>
          <Button 
            size="sm" 
            onClick={() => setSearchMode('fuzzy')}
            className={cn(
              "gap-2 rounded-full font-semibold transition-all duration-200",
              searchMode === 'fuzzy' 
                ? "bg-[#10F9A0] text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] hover:bg-[#10F9A0]" 
                : "bg-transparent hover:bg-white text-[#0A0A0A] border-2 border-transparent"
            )}
          >
            <SearchIcon className="h-4 w-4" />
            Fuzzy
          </Button>
        </div>

        <Button 
          onClick={clearSearch}
          className="bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] rounded-full px-5 py-2 font-semibold hover:bg-[#FFF8F0] transition-colors"
        >
          Back to Board
        </Button>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {data.data.map((email: any) => (
          <Card
            key={email.id}
            className="p-5 cursor-pointer border-2 border-[#0A0A0A]/10 rounded-xl hover:border-[#10F9A0] hover:shadow-[4px_4px_0px_0px_rgba(16,249,160,1)] hover:-translate-y-0.5 transition-all duration-200"
            onClick={() => onEmailClick(email.id)}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <Avatar className="h-11 w-11 border-2 border-[#0A0A0A]">
                <AvatarFallback className="bg-[#10F9A0] text-[#0A0A0A] font-semibold">
                  {email.fromName ? email.fromName[0].toUpperCase() : email.fromEmail[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Email Content */}
              <div className="flex-1 min-w-0 space-y-2.5">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold truncate text-[#0A0A0A]">
                      {email.fromName || email.fromEmail}
                    </span>
                    {!email.isRead && (
                      <div className="h-2 w-2 rounded-full bg-[#10F9A0] border border-[#0A0A0A] flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-[#0A0A0A]/50 whitespace-nowrap font-medium">
                    {formatDate(email.receivedAt)}
                  </span>
                </div>

                {/* Subject */}
                <p className="font-semibold text-sm truncate text-[#0A0A0A]">{email.subject || '(No subject)'}</p>

                {/* Snippet or AI Summary */}
                <p className="text-sm text-[#0A0A0A]/70 line-clamp-2 leading-relaxed">
                  {email.aiSummary || email.snippet || 'No content preview'}
                </p>

                {/* Badges Row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Relevance Score */}
                  <Badge className={cn(
                    "text-xs font-semibold border-2",
                    searchMode === 'semantic' 
                      ? "border-[#C77DFF] bg-[#C77DFF]/10 text-[#0A0A0A] hover:bg-[#C77DFF]/10" 
                      : "border-[#10F9A0] bg-[#10F9A0]/10 text-[#0A0A0A] hover:bg-[#10F9A0]/10"
                  )}>
                    {searchMode === 'semantic' 
                      ? `${Math.round((email.similarity || 0) * 100)}% relevance` 
                      : `${Math.round((email.relevance || 0) * 100)}% match`
                    }
                  </Badge>

                  {/* Category */}
                  <Badge className="text-xs font-semibold bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] capitalize hover:bg-white">
                    {email.category}
                  </Badge>

                  {/* Task Status */}
                  {email.taskStatus !== 'none' && (
                    <Badge className="text-xs font-semibold bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] capitalize hover:bg-[#0A0A0A]">
                      {email.taskStatus.replace('_', ' ')}
                    </Badge>
                  )}

                  {/* Attachments */}
                  {email.hasAttachments && (
                    <Badge className="text-xs font-semibold bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] hover:bg-white flex items-center gap-1.5">
                      <Paperclip className="h-3 w-3" />
                      Attachments
                    </Badge>
                  )}

                  {/* Starred */}
                  {email.isStarred && (
                    <Badge className="text-xs font-semibold bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] hover:bg-white flex items-center gap-1.5">
                      <Star className="h-3 w-3 text-[#FF6B6B]" />
                      Starred
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
        <div className="text-center text-sm text-[#0A0A0A]/60 font-medium pt-4 px-4 py-2 bg-[#FFF8F0] rounded-full inline-block mx-auto">
          Page {data.meta.page} of {data.meta.totalPages}
        </div>
      )}
    </div>
  );
}
