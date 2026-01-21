import { Draggable } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Clock,
  Star,
  Paperclip,
  Mail,
  MoreVertical,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmailMutations } from '@/hooks/useEmail';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EmailCardProps {
  email: any;
  index: number;
}

export function EmailCard({ email, index }: EmailCardProps) {
  const { toggleStar, updateEmail } = useEmailMutations();
  const navigate = useNavigate();

  const handleSnooze = (hours: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const snoozeUntil = new Date();
    snoozeUntil.setHours(snoozeUntil.getHours() + hours);

    updateEmail.mutate(
      {
        id: email.id,
        data: { snoozedUntil: snoozeUntil.toISOString() },
      },
      {
        onSuccess: () => {
          toast.success(`Email snoozed for ${hours} hour(s)`);
        },
        onError: () => {
          toast.error('Failed to snooze email');
        },
      }
    );
  };

  const handleUnsnooze = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    updateEmail.mutate(
      {
        id: email.id,
        data: { snoozedUntil: null },
      },
      {
        onSuccess: () => {
          toast.success('Email unsnoozed');
        },
        onError: () => {
          toast.error('Failed to unsnooze email');
        },
      }
    );
  };

  const handleToggleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStar.mutate({ id: email.id, isStarred: !email.isStarred });
  };

  const handleCardClick = () => {
    navigate(`/inbox?emailId=${email.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Draggable draggableId={email.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card
            className={cn(
              'cursor-grab active:cursor-grabbing transition-all duration-200 border-2 border-[#0A0A0A] rounded-xl hover:shadow-[4px_4px_0px_0px_rgba(16,249,160,1)] hover:-translate-y-0.5',
              snapshot.isDragging && 'shadow-[6px_6px_0px_0px_rgba(16,249,160,1)] scale-105 rotate-2',
              !email.isRead && 'bg-[#10F9A0]/10 border-l-4 border-l-[#10F9A0]'
            )}
            onClick={handleCardClick}
          >
            <CardHeader className="p-4 pb-2">
              {/* Snooze Banner */}
              {email.isSnoozed && email.snoozedUntil && (
                <div className="mb-3 p-3 bg-[#FF6B6B]/10 border-2 border-[#FF6B6B] rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#FF6B6B] font-semibold">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      Until {new Date(email.snoozedUntil).toLocaleString()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUnsnooze}
                    className="h-6 px-3 text-[#FF6B6B] hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/10 font-semibold rounded-full"
                  >
                    Unsnooze
                  </Button>
                </div>
              )}
              
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <Avatar className="h-9 w-9 border-2 border-[#0A0A0A]">
                    <AvatarFallback className="text-xs bg-[#10F9A0] text-[#0A0A0A] font-semibold">
                      {(email.fromName || email.fromEmail)
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate text-[#0A0A0A]">
                      {email.fromName || email.fromEmail}
                    </p>
                    <p className="text-xs text-[#0A0A0A]/50 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(email.receivedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full hover:bg-[#FFF8F0]"
                    onClick={handleToggleStar}
                  >
                    <Star
                      className={cn(
                        'h-4 w-4',
                        email.isStarred
                          ? 'text-[#FF6B6B] fill-[#FF6B6B]'
                          : 'text-gray-300'
                      )}
                    />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-full hover:bg-[#FFF8F0]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-2 border-[#0A0A0A] rounded-xl shadow-[4px_4px_0px_0px_rgba(10,10,10,0.1)]">
                      {email.isSnoozed ? (
                        <DropdownMenuItem onClick={handleUnsnooze} className="rounded-lg cursor-pointer">
                          <Clock className="h-4 w-4 mr-2" />
                          Unsnooze
                        </DropdownMenuItem>
                      ) : (
                        <>
                          <DropdownMenuItem onClick={(e) => handleSnooze(1, e)} className="rounded-lg cursor-pointer">
                            <Calendar className="h-4 w-4 mr-2" />
                            Snooze 1 hour
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleSnooze(4, e)} className="rounded-lg cursor-pointer">
                            <Calendar className="h-4 w-4 mr-2" />
                            Snooze 4 hours
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleSnooze(24, e)} className="rounded-lg cursor-pointer">
                            <Calendar className="h-4 w-4 mr-2" />
                            Snooze 1 day
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleSnooze(72, e)} className="rounded-lg cursor-pointer">
                            <Calendar className="h-4 w-4 mr-2" />
                            Snooze 3 days
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleSnooze(168, e)} className="rounded-lg cursor-pointer">
                            <Calendar className="h-4 w-4 mr-2" />
                            Snooze 1 week
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-3">
              {/* Subject */}
              <h4
                className={cn(
                  'text-sm line-clamp-2 text-[#0A0A0A]',
                  !email.isRead ? 'font-semibold' : 'font-normal'
                )}
              >
                {email.subject || '(No subject)'}
              </h4>

              {/* AI Summary or Snippet */}
              {email.aiSummary ? (
                <div className="flex items-start gap-2 p-2 bg-[#C77DFF]/10 border-2 border-[#C77DFF] rounded-lg">
                  <Sparkles className="h-3.5 w-3.5 text-[#C77DFF] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#0A0A0A]/80 flex-1 leading-relaxed">
                    {email.aiSummary}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#0A0A0A]/60 line-clamp-3 leading-relaxed">
                  {email.snippet || 'No preview available'}
                </p>
              )}

              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {!email.isRead && (
                  <Badge className="text-xs bg-[#10F9A0] text-[#0A0A0A] border-2 border-[#0A0A0A] font-semibold hover:bg-[#10F9A0]">
                    <Mail className="h-3 w-3 mr-1" />
                    Unread
                  </Badge>
                )}
                {email.hasAttachments && (
                  <Badge className="text-xs bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] font-semibold hover:bg-white">
                    <Paperclip className="h-3 w-3 mr-1" />
                    {email.attachments?.length || 1}
                  </Badge>
                )}
                {email.category && email.category !== 'primary' && (
                  <Badge className="text-xs bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] font-semibold capitalize hover:bg-white">
                    {email.category}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
