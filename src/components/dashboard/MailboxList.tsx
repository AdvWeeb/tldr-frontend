import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Inbox,
  Star,
  FileText,
  Send,
  Archive,
  AlertCircle,
  Trash2,
  ChevronDown,
  Edit,
  Tag,
  Clock,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ComposeEmailModal } from './ComposeEmailModal';
import { useMailboxStats, useMailboxLabels, useEmailMutations } from '@/hooks/useEmail';

interface MailboxListProps {
  mailboxes: any[]; // Backend mailbox type
  selectedMailboxId: number | null;
  onSelectMailbox: (id: number) => void;
  currentMailbox?: any; // Current selected mailbox info
  selectedFolder?: string;
  onSelectFolder?: (folderId: string) => void;
}

// Map folder IDs to Gmail labels for filtering
export const FOLDER_TO_LABEL_MAP: Record<string, string | null> = {
  inbox: 'INBOX',
  favorites: 'STARRED',
  drafts: 'DRAFT',
  sent: 'SENT',
  archive: null, // Special case: emails without INBOX label
  spam: 'SPAM',
  bin: 'TRASH',
};

export function MailboxList({ 
  mailboxes, 
  selectedMailboxId, 
  onSelectMailbox, 
  currentMailbox,
  selectedFolder = 'inbox',
  onSelectFolder = () => {}
}: Readonly<MailboxListProps>) {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isLabelsOpen, setIsLabelsOpen] = useState(true);

  const { data: stats } = useMailboxStats(selectedMailboxId);
  const { data: labels } = useMailboxLabels(selectedMailboxId);
  const { disconnectMailbox, syncMailbox } = useEmailMutations();

  const handleDisconnect = () => {
    if (selectedMailboxId && confirm('Disconnect this mailbox? You can reconnect it later.')) {
      disconnectMailbox.mutate(selectedMailboxId);
    }
  };

  const handleSync = () => {
    if (selectedMailboxId) {
      // Force full sync to fetch ALL emails (including those with custom labels)
      syncMailbox.mutate({ mailboxId: selectedMailboxId, fullSync: true });
    }
  };

  // Mail folders with their counts
  const folders = [
    { id: 'inbox', name: 'Inbox', icon: Inbox, count: stats?.inbox?.unread ?? 0, section: 'core' },
    { id: 'favorites', name: 'Starred', icon: Star, count: stats?.starred?.total ?? 0, section: 'core' },
    { id: 'snoozed', name: 'Snoozed', icon: Clock, count: stats?.snoozed?.total ?? 0, section: 'core' },
    { id: 'drafts', name: 'Drafts', icon: FileText, count: stats?.drafts?.total ?? 0, section: 'core' },
    { id: 'sent', name: 'Sent', icon: Send, count: stats?.sent?.total ?? 0, section: 'core' },
    { id: 'archive', name: 'Archive', icon: Archive, count: 0, section: 'management' },
    { id: 'spam', name: 'Spam', icon: AlertCircle, count: stats?.spam?.total ?? 0, section: 'management' },
    { id: 'bin', name: 'Trash', icon: Trash2, count: stats?.trash?.total ?? 0, section: 'management' },
  ];

  const corefolders = folders.filter(f => f.section === 'core');
  const managementFolders = folders.filter(f => f.section === 'management');
  const userLabels = labels?.user ?? [];

  return (
    <div className="flex flex-col h-full bg-[#FFF8F0]">
      {/* Account Header */}
      <div className="p-4 border-b-2 border-[#0A0A0A]/10">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="font-bold text-[#0A0A0A] text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {currentMailbox?.email?.split('@')[0] || 'Baked Design'}
            </div>
            <div className="text-sm text-[#0A0A0A]/60" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {currentMailbox?.email || 'work@baked.design'}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSync}
              disabled={syncMailbox.isPending}
              className="h-8 w-8 text-[#0A0A0A]/50 hover:text-[#10F9A0] hover:bg-[#10F9A0]/10"
              title="Sync mailbox"
            >
              <RefreshCw className={`h-4 w-4 ${syncMailbox.isPending ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDisconnect}
              className="h-8 w-8 text-[#0A0A0A]/50 hover:text-red-500 hover:bg-red-50"
              title="Disconnect mailbox"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Compose Button */}
        <Button
          onClick={() => setIsComposeOpen(true)}
          className="w-full bg-[#10F9A0] text-[#0A0A0A] border-2 border-[#0A0A0A] rounded-full px-4 py-2.5 font-semibold shadow-[3px_3px_0px_0px_rgba(10,10,10,1)] hover:shadow-[5px_5px_0px_0px_rgba(10,10,10,1)] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
        >
          <Edit className="h-4 w-4 mr-2" />
          <span>New email</span>
        </Button>
      </div>

      {/* Core Folders */}
      <div className="flex-1 overflow-y-auto py-3">
        <div className="px-3 mb-2">
          <div className="text-xs font-semibold text-[#0A0A0A]/50 uppercase tracking-wide mb-1 px-2">
            Core
          </div>
        </div>

        <nav className="space-y-1 px-2">
          {corefolders.map((folder) => {
            const Icon = folder.icon;
            const isActive = selectedFolder === folder.id;
            return (
              <Button
                key={folder.id}
                variant="ghost"
                onClick={() => onSelectFolder(folder.id)}
                className={cn(
                  "w-full justify-between h-auto py-2 px-3 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-[#10F9A0] text-[#0A0A0A] hover:bg-[#10F9A0] font-semibold shadow-[2px_2px_0px_0px_rgba(10,10,10,0.1)]" 
                    : "hover:bg-white/60 text-[#0A0A0A]/80 font-normal"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{folder.name}</span>
                </div>
                {folder.count > 0 && (
                  <span className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full",
                    isActive ? "bg-[#0A0A0A]/10" : "bg-white text-[#0A0A0A]/60"
                  )}>
                    {folder.count}
                  </span>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Management Section */}
        <div className="mt-6 px-3">
          <Button
            variant="ghost"
            onClick={() => setIsManagementOpen(!isManagementOpen)}
            className="flex items-center gap-2 text-xs font-semibold text-[#0A0A0A]/50 uppercase tracking-wide mb-1 px-2 h-auto hover:text-[#0A0A0A]"
          >
            <span>Management</span>
            <ChevronDown className={cn("h-3 w-3 transition-transform", isManagementOpen && "rotate-180")} />
          </Button>
        </div>

        {isManagementOpen && (
          <nav className="space-y-1 px-2">
            {managementFolders.map((folder) => {
              const Icon = folder.icon;
              const isActive = selectedFolder === folder.id;
              return (
                <Button
                  key={folder.id}
                  variant="ghost"
                  onClick={() => onSelectFolder(folder.id)}
                  className={cn(
                    "w-full justify-between h-auto py-2 px-3 rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-[#10F9A0] text-[#0A0A0A] hover:bg-[#10F9A0] font-semibold shadow-[2px_2px_0px_0px_rgba(10,10,10,0.1)]" 
                      : "hover:bg-white/60 text-[#0A0A0A]/80 font-normal"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{folder.name}</span>
                  </div>
                  {folder.count > 0 && (
                    <span className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      isActive ? "bg-[#0A0A0A]/10" : "bg-white text-[#0A0A0A]/60"
                    )}>
                      {folder.count}
                    </span>
                  )}
                </Button>
              );
            })}
          </nav>
        )}

        {/* User Labels Section */}
        {userLabels.length > 0 && (
          <>
            <div className="mt-6 px-3">
              <Button
                variant="ghost"
                onClick={() => setIsLabelsOpen(!isLabelsOpen)}
                className="flex items-center gap-2 text-xs font-semibold text-[#0A0A0A]/50 uppercase tracking-wide mb-1 px-2 h-auto hover:text-[#0A0A0A]"
              >
                <span>Labels</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform", isLabelsOpen && "rotate-180")} />
              </Button>
            </div>

            {isLabelsOpen && (
              <nav className="space-y-1 px-2">
                {userLabels.map((label) => {
                  const isActive = selectedFolder === `label:${label.id}`;
                  return (
                    <Button
                      key={label.id}
                      variant="ghost"
                      onClick={() => onSelectFolder(`label:${label.id}`)}
                      className={cn(
                        "w-full justify-between h-auto py-2 px-3 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-[#10F9A0] text-[#0A0A0A] hover:bg-[#10F9A0] font-semibold shadow-[2px_2px_0px_0px_rgba(10,10,10,0.1)]" 
                          : "hover:bg-white/60 text-[#0A0A0A]/80 font-normal"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Tag 
                          className="h-4 w-4" 
                          style={{ 
                            color: label.backgroundColor || undefined,
                          }}
                        />
                        <span className="truncate">{label.name}</span>
                      </div>
                      {(label.messagesUnread ?? 0) > 0 && (
                        <span className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-full",
                          isActive ? "bg-[#0A0A0A]/10" : "bg-white text-[#0A0A0A]/60"
                        )}>
                          {label.messagesUnread}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </nav>
            )}
          </>
        )}

        {/* Mailbox Switcher (if multiple mailboxes) */}
        {mailboxes.length > 1 && (
          <div className="mt-6 px-3">
            <div className="text-xs font-semibold text-[#0A0A0A]/50 uppercase tracking-wide mb-3 px-2">
              Accounts
            </div>
            <div className="space-y-1 px-2">
              {mailboxes.map((mailbox) => (
                <Button
                  key={mailbox.id}
                  variant="ghost"
                  onClick={() => onSelectMailbox(mailbox.id)}
                  className={cn(
                    "w-full justify-start gap-3 h-auto py-2 px-3 rounded-xl transition-all duration-200",
                    selectedMailboxId === mailbox.id 
                      ? "bg-white text-[#0A0A0A] font-semibold shadow-[2px_2px_0px_0px_rgba(10,10,10,0.1)]" 
                      : "hover:bg-white/60 text-[#0A0A0A]/80 font-normal"
                  )}
                >
                  <Avatar className="h-7 w-7 border-2 border-[#0A0A0A]">
                    <AvatarFallback className="text-xs font-semibold bg-[#10F9A0] text-[#0A0A0A]">
                      {mailbox.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate flex-1 text-left text-sm">{mailbox.email}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      <ComposeEmailModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        mode="compose"
        mailboxId={selectedMailboxId || undefined}
      />
    </div>
  );
}
