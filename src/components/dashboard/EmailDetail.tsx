import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { 
  Reply, 
  ReplyAll, 
  Forward, 
  Trash2, 
  MoreVertical, 
  Star, 
  Clock,
  CornerUpLeft,
  Download,
  Mail,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ComposeEmailModal } from './ComposeEmailModal';
import apiClient from '@/services/apiClient';
import { useEmailMutations } from '@/hooks/useEmail';
import { toast } from 'sonner';

interface EmailDetailProps {
  email: any; // Backend email detail type
  mailboxId: number;
  onClose?: () => void; // For mobile view
}

export function EmailDetail({ email, mailboxId, onClose }: EmailDetailProps) {
  const [composeMode, setComposeMode] = useState<'compose' | 'reply' | 'replyAll' | 'forward' | null>(null);
  const { toggleStar, markAsRead, deleteEmail, summarizeEmail } = useEmailMutations();
  
  const handleToggleStar = () => {
    if (email) {
      toggleStar.mutate({ id: email.id, isStarred: !email.isStarred });
    }
  };

  const handleDelete = () => {
    if (email && confirm('Are you sure you want to delete this email?')) {
      deleteEmail.mutate(email.id);
    }
  };

  const handleMarkAsUnread = () => {
    if (email) {
      markAsRead.mutate({ id: email.id, isRead: false });
    }
  };

  const handleOpenInGmail = () => {
    if (email?.gmailMessageId) {
      const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${email.gmailMessageId}`;
      window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSummarize = () => {
    if (email) {
      toast.promise(
        summarizeEmail.mutateAsync(email.id),
        {
          loading: 'Generating AI summary...',
          success: () => `Summary generated successfully!`,
          error: 'Failed to generate summary',
        }
      );
    }
  };
  
  const handleDownloadAttachment = async (attachmentId: number, filename: string) => {
    try {
      const response = await apiClient.get(`/attachments/${attachmentId}`, {
        responseType: 'blob',
      });
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download attachment:', error);
      alert('Failed to download attachment. Please try again.');
    }
  };
  
  // Reset compose mode and mark as read when email changes
  useEffect(() => {
    setComposeMode(null);
    if (email && !email.isRead) {
      markAsRead.mutate({ id: email.id, isRead: true });
    }
  }, [email?.id]);
  
  console.log('EmailDetail - mailboxId:', mailboxId, 'email:', email);
  
  if (!email) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-white">
        <div className="bg-[#FFF8F0] p-8 rounded-[2rem] border-2 border-[#0A0A0A]/10 mb-6">
            <CornerUpLeft className="h-12 w-12 text-[#0A0A0A]/30" />
        </div>
        <h3 className="font-bold text-2xl mb-3 text-[#0A0A0A]">
          Select an email to read
        </h3>
        <p className="max-w-xs text-[#0A0A0A]/60">
          Click on an email from the list to view its contents here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Actions Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-[#0A0A0A]/10 sticky top-0 bg-white/98 backdrop-blur z-10">
        <div className="flex items-center gap-1">
          {onClose && (
             <Button 
               variant="ghost" 
               size="icon" 
               onClick={onClose} 
               className="md:hidden rounded-full hover:bg-[#FFF8F0]"
             >
               <CornerUpLeft className="h-4 w-4" />
             </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            title="Reply" 
            onClick={() => setComposeMode('reply')}
            className="rounded-full hover:bg-[#FFF8F0]"
          >
            <Reply className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            title="Reply All" 
            onClick={() => setComposeMode('replyAll')}
            className="rounded-full hover:bg-[#FFF8F0]"
          >
            <ReplyAll className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            title="Forward" 
            onClick={() => setComposeMode('forward')}
            className="rounded-full hover:bg-[#FFF8F0]"
          >
            <Forward className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-[#0A0A0A]/10 mx-2" />
          <Button 
            variant="ghost" 
            size="icon" 
            title="Mark as unread"
            onClick={handleMarkAsUnread}
            className="rounded-full hover:bg-[#FFF8F0]"
          >
            <Mail className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              title={email.isStarred ? "Unstar" : "Star"}
              onClick={handleToggleStar}
              className="rounded-full hover:bg-[#FFF8F0]"
            >
                <Star className={cn(
                  "h-4 w-4",
                  email.isStarred ? 'text-[#FF6B6B] fill-[#FF6B6B]' : 'text-[#0A0A0A]/30'
                )} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full text-[#FF6B6B] hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/10" 
              title="Delete"
              onClick={handleDelete}
              disabled={deleteEmail.isPending}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              title="Open in Gmail"
              onClick={handleOpenInGmail}
              className="rounded-full hover:bg-[#FFF8F0]"
            >
                <ExternalLink className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full hover:bg-[#FFF8F0]"
            >
                <MoreVertical className="h-4 w-4" />
            </Button>
        </div>
      </div>

      {/* Email Header */}
      <div className="p-8">
        <div className="flex items-start justify-between mb-8">
           <h1 className="text-3xl font-bold italic leading-tight text-[#0A0A0A]">
             {email.subject || '(No subject)'}
           </h1>
           {email.labels && email.labels.length > 0 && (
               <div className="flex gap-2">
                   {email.labels.map((label: string) => (
                       <span 
                         key={label} 
                         className="px-3 py-1 bg-[#FFF8F0] border-2 border-[#0A0A0A] rounded-full text-xs font-semibold uppercase"
                       >
                         {label}
                       </span>
                   ))}
               </div>
           )}
        </div>
        
        <div className="flex items-start gap-4 mb-8">
          <Avatar className="h-12 w-12 border-2 border-[#0A0A0A]">
            <AvatarImage src={undefined} />
            <AvatarFallback className="bg-[#10F9A0] text-[#0A0A0A] font-semibold text-lg">
              {(email.fromName || email.fromEmail).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
                <div className="font-semibold text-[#0A0A0A] text-base">
                  {email.fromName || email.fromEmail}
                </div>
                <div className="text-xs text-[#0A0A0A]/50 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(email.receivedAt).toLocaleString()}
                </div>
            </div>
            <div className="text-sm text-[#0A0A0A]/60 truncate">
              {`<${email.fromEmail}>`}
            </div>
            <div className="text-sm text-[#0A0A0A]/60 mt-1">
                To: <span className="text-[#0A0A0A]">{email.toEmails && email.toEmails.length > 0 ? email.toEmails.join(', ') : 'Me'}</span>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-[#0A0A0A]/10 my-8" />

        {/* AI Summary */}
        {email.aiSummary ? (
          <div className="mb-8 p-6 bg-gradient-to-br from-[#C77DFF]/10 to-[#10F9A0]/10 border-2 border-[#C77DFF] rounded-[2rem]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-[#C77DFF]" />
              <span className="text-sm font-semibold uppercase tracking-wide text-[#0A0A0A]">
                AI Summary
              </span>
            </div>
            <p className="text-base text-[#0A0A0A]/80 leading-relaxed">
              {email.aiSummary}
            </p>
          </div>
        ) : (
          <div className="mb-8">
            <Button
              onClick={handleSummarize}
              disabled={summarizeEmail.isPending}
              className="bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] rounded-full px-5 py-2 font-semibold shadow-[3px_3px_0px_0px_rgba(199,125,255,1)] hover:shadow-[5px_5px_0px_0px_rgba(199,125,255,1)] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {summarizeEmail.isPending ? 'Generating...' : 'Generate AI Summary'}
            </Button>
          </div>
        )}

        {/* Email Body */}
        <div 
            className="prose prose-sm max-w-none text-[#0A0A0A]/80 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: email.bodyHtml || email.snippet || '' }}
        />
        
        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
            <div className="mt-10 p-6 border-2 border-[#0A0A0A]/10 rounded-[2rem] bg-[#FFF8F0]">
                <p className="text-sm font-semibold uppercase tracking-wide mb-4 text-[#0A0A0A]">
                  Attachments ({email.attachments.length})
                </p>
                <div className="flex flex-wrap gap-3">
                    {email.attachments.map((attachment: any) => (
                        <button
                            key={attachment.id}
                            onClick={() => handleDownloadAttachment(attachment.id, attachment.filename)}
                            className="group flex items-center gap-3 p-4 bg-white border-2 border-[#0A0A0A] rounded-xl hover:shadow-[4px_4px_0px_0px_rgba(16,249,160,1)] hover:-translate-y-0.5 transition-all duration-200 max-w-xs cursor-pointer"
                        >
                            <div className="flex-shrink-0 w-12 h-12 bg-[#10F9A0] border-2 border-[#0A0A0A] rounded-lg flex items-center justify-center text-[#0A0A0A] text-xs font-semibold">
                                {attachment.filename.split('.').pop()?.toUpperCase() || 'FILE'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#0A0A0A] truncate">
                                    {attachment.filename}
                                </p>
                                <p className="text-xs text-[#0A0A0A]/60">
                                    {(attachment.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                            <Download className="h-4 w-4 text-[#0A0A0A]/40 group-hover:text-[#0A0A0A]" />
                        </button>
                    ))}
                </div>
            </div>
        )}

      </div>
      
      {/* Compose Modal - Only render when email exists */}
      {email && (
        <ComposeEmailModal
          isOpen={composeMode !== null}
          onClose={() => setComposeMode(null)}
          mode={composeMode || 'compose'}
          mailboxId={mailboxId}
          originalEmail={{
            subject: email.subject,
            fromEmail: email.fromEmail,
            fromName: email.fromName,
            toEmails: email.toEmails,
            ccEmails: email.ccEmails,
            bodyHtml: email.bodyHtml,
            bodyText: email.bodyText,
            gmailMessageId: email.gmailMessageId,
            gmailThreadId: email.gmailThreadId,
          }}
        />
      )}
    </div>
  );
}

