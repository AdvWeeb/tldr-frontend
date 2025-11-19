import type { Email, Mailbox, EmailFilter } from '@/types/email';

// Mock Data
const mockMailboxes: Mailbox[] = [
  { id: 'inbox', name: 'Inbox', type: 'inbox', unreadCount: 3 },
  { id: 'starred', name: 'Starred', type: 'custom', icon: 'Star' },
  { id: 'sent', name: 'Sent', type: 'sent' },
  { id: 'drafts', name: 'Drafts', type: 'drafts', unreadCount: 1 },
  { id: 'archive', name: 'Archive', type: 'archive' },
  { id: 'trash', name: 'Trash', type: 'trash' },
  { id: 'personal', name: 'Personal', type: 'custom', unreadCount: 2 },
  { id: 'work', name: 'Work', type: 'custom' },
];

const generateMockEmails = (): Email[] => {
  return [
    {
      id: '1',
      mailboxId: 'inbox',
      sender: { name: 'Alice Smith', email: 'alice@example.com', avatar: 'https://i.pravatar.cc/150?u=alice' },
      subject: 'Project Update: Q4 Goals',
      preview: 'Hi team, wanted to share the latest updates on our Q4 goals...',
      body: '<p>Hi team,</p><p>Wanted to share the latest updates on our Q4 goals. We are making great progress.</p><p>Best,<br>Alice</p>',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      isRead: false,
      isStarred: true,
      hasAttachments: true,
    },
    {
      id: '2',
      mailboxId: 'inbox',
      sender: { name: 'Bob Jones', email: 'bob@example.com', avatar: 'https://i.pravatar.cc/150?u=bob' },
      subject: 'Lunch tomorrow?',
      preview: 'Hey, are you free for lunch tomorrow at 12:30? There is a new place...',
      body: '<p>Hey,</p><p>Are you free for lunch tomorrow at 12:30? There is a new place down the street.</p>',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      isRead: false,
      isStarred: false,
      hasAttachments: false,
    },
    {
      id: '3',
      mailboxId: 'inbox',
      sender: { name: 'Support Team', email: 'support@service.com' },
      subject: 'Ticket #12345 Resolved',
      preview: 'Your support ticket has been resolved. Please let us know if you...',
      body: '<p>Your support ticket has been resolved.</p><p>Please let us know if you need further assistance.</p>',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      isRead: true,
      isStarred: false,
      hasAttachments: false,
    },
    {
      id: '4',
      mailboxId: 'sent',
      sender: { name: 'Me', email: 'me@example.com' },
      subject: 'Re: Project Update',
      preview: 'Thanks for the update, Alice. Looks good to me.',
      body: '<p>Thanks for the update, Alice. Looks good to me.</p>',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      isRead: true,
      isStarred: false,
      hasAttachments: false,
    },
    {
      id: '5',
      mailboxId: 'personal',
      sender: { name: 'Mom', email: 'mom@family.com' },
      subject: 'Family Dinner',
      preview: 'Don\'t forget about dinner this Sunday!',
      body: '<p>Don\'t forget about dinner this Sunday! Love you.</p>',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      isRead: false,
      isStarred: true,
      hasAttachments: false,
    }
  ];
};

let mockEmails = generateMockEmails();

// API Service
export const mockEmailApi = {
  getMailboxes: async (): Promise<Mailbox[]> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate latency
    return mockMailboxes;
  },

  getEmails: async (filter: EmailFilter): Promise<{ emails: Email[], total: number }> => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate latency
    
    let filtered = mockEmails;
    
    // Filter by mailbox
    if (filter.mailboxId === 'starred') {
        filtered = filtered.filter(e => e.isStarred);
    } else {
        filtered = filtered.filter(e => e.mailboxId === filter.mailboxId);
    }

    // Simple search
    if (filter.search) {
      const term = filter.search.toLowerCase();
      filtered = filtered.filter(e => 
        e.subject.toLowerCase().includes(term) || 
        e.sender.name.toLowerCase().includes(term) ||
        e.body.toLowerCase().includes(term)
      );
    }

    return {
      emails: filtered,
      total: filtered.length
    };
  },

  getEmail: async (id: string): Promise<Email | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockEmails.find(e => e.id === id) || null;
  },

  toggleStar: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    mockEmails = mockEmails.map(e => 
      e.id === id ? { ...e, isStarred: !e.isStarred } : e
    );
  },

  markAsRead: async (id: string, isRead: boolean): Promise<void> => {
     await new Promise(resolve => setTimeout(resolve, 200));
     mockEmails = mockEmails.map(e => 
       e.id === id ? { ...e, isRead } : e
     );
  },

  deleteEmail: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    mockEmails = mockEmails.map(e => 
        e.id === id ? { ...e, mailboxId: 'trash' } : e
    );
  }
};

