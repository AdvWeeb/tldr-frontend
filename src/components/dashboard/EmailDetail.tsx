import type { Email } from '@/types/email';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Reply, 
  ReplyAll, 
  Forward, 
  Trash2, 
  MoreVertical, 
  Star, 
  Clock,
  CornerUpLeft
} from 'lucide-react';

interface EmailDetailProps {
  email: Email | null | undefined;
  onClose?: () => void; // For mobile view
}

export function EmailDetail({ email, onClose }: EmailDetailProps) {
  if (!email) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-muted-foreground p-8 text-center bg-gray-50/50">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
            <CornerUpLeft className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Select an email to read</h3>
        <p className="max-w-xs">Click on an email from the list to view its contents here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Actions Header */}
      <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white/95 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          {onClose && (
             <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
               <CornerUpLeft className="h-4 w-4" />
             </Button>
          )}
          <Button variant="ghost" size="icon" title="Reply">
            <Reply className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Reply All">
            <ReplyAll className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Forward">
            <Forward className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" title="Star">
                <Star className={`h-4 w-4 ${email.isStarred ? 'text-yellow-400 fill-yellow-400' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" title="Delete">
                <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
            </Button>
        </div>
      </div>

      {/* Email Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
           <h1 className="text-2xl font-bold leading-tight">{email.subject}</h1>
           {email.labels && email.labels.length > 0 && (
               <div className="flex gap-2">
                   {email.labels.map(label => (
                       <span key={label} className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{label}</span>
                   ))}
               </div>
           )}
        </div>
        
        <div className="flex items-start gap-4 mb-6">
          <Avatar>
            <AvatarImage src={email.sender.avatar} />
            <AvatarFallback>{email.sender.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
                <div className="font-semibold">{email.sender.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(email.timestamp).toLocaleString()}
                </div>
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {`<${email.sender.email}>`}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
                To: <span className="text-gray-700">Me</span>
            </div>
          </div>
        </div>

        <div className="border-t my-6" />

        {/* Email Body */}
        <div 
            className="prose prose-sm max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: email.body }}
        />
        
        {/* Attachments placeholder if needed */}
        {email.hasAttachments && (
            <div className="mt-8 p-4 border rounded bg-gray-50">
                <p className="text-sm font-medium mb-2">Attachments</p>
                <div className="flex gap-2">
                    <div className="h-16 w-24 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                        File.pdf
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}

