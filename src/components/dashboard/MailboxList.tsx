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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ComposeEmailModal } from './ComposeEmailModal';
import { useMailboxStats, useMailboxLabels } from '@/hooks/useEmail';

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
    <div className="flex flex-col h-full bg-white">
      {/* Account Header */}
      <div className="p-4 border-b">
        <div className="mb-3">
          <div className="font-semibold text-foreground">
            {currentMailbox?.email?.split('@')[0] || 'Baked Design'}
          </div>
          <div className="text-sm text-muted-foreground">
            {currentMailbox?.email || 'work@baked.design'}
          </div>
        </div>

        {/* Compose Button */}
        <Button
          onClick={() => setIsComposeOpen(true)}
          variant="outline"
          className="w-full justify-center gap-2"
        >
          <Edit className="h-4 w-4" />
          <span>New email</span>
        </Button>
      </div>

      {/* Core Folders */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-3 mb-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2">
            Core
          </div>
        </div>

        <nav className="space-y-0.5 px-2">
          {corefolders.map((folder) => {
            const Icon = folder.icon;
            const isActive = selectedFolder === folder.id;
            return (
              <Button
                key={folder.id}
                variant="ghost"
                onClick={() => onSelectFolder(folder.id)}
                className={cn(
                  "w-full justify-between h-auto py-2 px-3 font-normal",
                  isActive && "bg-blue-100 text-blue-900 hover:bg-blue-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{folder.name}</span>
                </div>
                {folder.count > 0 && (
                  <span className="text-xs text-muted-foreground">{folder.count}</span>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Management Section */}
        <div className="mt-4 px-3">
          <Button
            variant="ghost"
            onClick={() => setIsManagementOpen(!isManagementOpen)}
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2 h-auto hover:text-foreground"
          >
            <span>Management</span>
            <ChevronDown className={cn("h-3 w-3 transition-transform", isManagementOpen && "rotate-180")} />
          </Button>
        </div>

        {isManagementOpen && (
          <nav className="space-y-0.5 px-2">
            {managementFolders.map((folder) => {
              const Icon = folder.icon;
              const isActive = selectedFolder === folder.id;
              return (
                <Button
                  key={folder.id}
                  variant="ghost"
                  onClick={() => onSelectFolder(folder.id)}
                  className={cn(
                    "w-full justify-between h-auto py-2 px-3 font-normal",
                    isActive && "bg-blue-100 text-blue-900 hover:bg-blue-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{folder.name}</span>
                  </div>
                  {folder.count > 0 && (
                    <span className="text-xs text-muted-foreground">{folder.count}</span>
                  )}
                </Button>
              );
            })}
          </nav>
        )}

        {/* User Labels Section */}
        {userLabels.length > 0 && (
          <>
            <div className="mt-4 px-3">
              <Button
                variant="ghost"
                onClick={() => setIsLabelsOpen(!isLabelsOpen)}
                className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2 h-auto hover:text-foreground"
              >
                <span>Labels</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform", isLabelsOpen && "rotate-180")} />
              </Button>
            </div>

            {isLabelsOpen && (
              <nav className="space-y-0.5 px-2">
                {userLabels.map((label) => {
                  const isActive = selectedFolder === `label:${label.id}`;
                  return (
                    <Button
                      key={label.id}
                      variant="ghost"
                      onClick={() => onSelectFolder(`label:${label.id}`)}
                      className={cn(
                        "w-full justify-between h-auto py-2 px-3 font-normal",
                        isActive && "bg-blue-100 text-blue-900 hover:bg-blue-100"
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
                        <span className="text-xs text-muted-foreground">{label.messagesUnread}</span>
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
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
              Accounts
            </div>
            <div className="space-y-1 px-2">
              {mailboxes.map((mailbox) => (
                <Button
                  key={mailbox.id}
                  variant="ghost"
                  onClick={() => onSelectMailbox(mailbox.id)}
                  className={cn(
                    "w-full justify-start gap-2 h-auto py-2 px-3 font-normal",
                    selectedMailboxId === mailbox.id && "bg-accent"
                  )}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {mailbox.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate flex-1 text-left">{mailbox.email}</span>
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
