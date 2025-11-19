export interface Mailbox {
  id: string;
  name: string;
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'archive' | 'custom';
  unreadCount?: number;
  icon?: string;
}

export interface Email {
  id: string;
  mailboxId: string;
  sender: {
    name: string;
    email: string;
    avatar?: string;
  };
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  labels?: string[];
}

export interface EmailFilter {
  mailboxId: string;
  page?: number;
  limit?: number;
  search?: string;
}

