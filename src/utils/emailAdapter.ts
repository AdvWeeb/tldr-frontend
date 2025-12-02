// Adapter to convert backend email data to frontend types
import type { Email as BackendEmail, EmailDetail as BackendEmailDetail, Mailbox as BackendMailbox } from '@/services/emailApi';
import type { Email as FrontendEmail, Mailbox as FrontendMailbox } from '@/types/email';

export const adaptBackendMailboxToFrontend = (mailbox: BackendMailbox): FrontendMailbox => {
  return {
    id: mailbox.id.toString(),
    name: mailbox.email.split('@')[0], // Use email prefix as name
    type: 'custom', // Backend doesn't have type, default to custom
    unreadCount: mailbox.unreadCount,
  };
};

export const adaptBackendEmailToFrontend = (email: BackendEmail): FrontendEmail => {
  return {
    id: email.id.toString(),
    mailboxId: email.mailboxId.toString(),
    sender: {
      name: email.fromName || email.fromEmail,
      email: email.fromEmail,
      // Backend doesn't provide avatar, could use a service like Gravatar
      avatar: undefined,
    },
    subject: email.subject || '(No subject)',
    preview: email.snippet || '',
    body: '', // Not included in list view
    timestamp: email.receivedAt,
    isRead: email.isRead,
    isStarred: email.isStarred,
    hasAttachments: email.hasAttachments,
    labels: [], // Will be populated from detail view if needed
  };
};

export const adaptBackendEmailDetailToFrontend = (email: BackendEmailDetail): FrontendEmail => {
  return {
    id: email.id.toString(),
    mailboxId: email.mailboxId.toString(),
    sender: {
      name: email.fromName || email.fromEmail,
      email: email.fromEmail,
      avatar: undefined,
    },
    subject: email.subject || '(No subject)',
    preview: email.snippet || '',
    body: email.bodyHtml || email.bodyText || '',
    timestamp: email.receivedAt,
    isRead: email.isRead,
    isStarred: email.isStarred,
    hasAttachments: email.hasAttachments,
    labels: email.labels || [],
  };
};
