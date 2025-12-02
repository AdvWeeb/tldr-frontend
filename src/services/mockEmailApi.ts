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
  const emails: Email[] = [];
  const senders = [
    { name: 'Alice Smith', email: 'alice@example.com', avatar: 'https://i.pravatar.cc/150?u=alice' },
    { name: 'Bob Jones', email: 'bob@example.com', avatar: 'https://i.pravatar.cc/150?u=bob' },
    { name: 'Carol Williams', email: 'carol@example.com', avatar: 'https://i.pravatar.cc/150?u=carol' },
    { name: 'David Brown', email: 'david@example.com', avatar: 'https://i.pravatar.cc/150?u=david' },
    { name: 'Emma Davis', email: 'emma@example.com', avatar: 'https://i.pravatar.cc/150?u=emma' },
    { name: 'Frank Miller', email: 'frank@example.com', avatar: 'https://i.pravatar.cc/150?u=frank' },
    { name: 'Grace Wilson', email: 'grace@example.com', avatar: 'https://i.pravatar.cc/150?u=grace' },
    { name: 'Henry Moore', email: 'henry@example.com', avatar: 'https://i.pravatar.cc/150?u=henry' },
    { name: 'Support Team', email: 'support@service.com' },
    { name: 'Newsletter', email: 'news@tech.com' },
    { name: 'Mom', email: 'mom@family.com' },
  ];

  const subjects = [
    'Project Update: Q4 Goals',
    'Lunch tomorrow?',
    'Meeting Notes',
    'Ticket Resolved',
    'Weekly Report',
    'Action Required: Review Document',
    'Family Dinner Plans',
    'Conference Registration',
    'Password Reset Request',
    'Invoice Available',
    'New Features Released',
    'System Maintenance Notice',
  ];

  const mailboxes = ['inbox', 'inbox', 'inbox', 'inbox', 'sent', 'personal', 'work'];

  // Generate 150 emails
  for (let i = 1; i <= 150; i++) {
    const sender = senders[i % senders.length];
    const subject = subjects[i % subjects.length];
    const mailboxId = mailboxes[i % mailboxes.length];
    const hoursAgo = i * 2;
    
    emails.push({
      id: String(i),
      mailboxId,
      sender,
      subject: `${subject} ${i > 12 ? `#${i}` : ''}`,
      preview: `This is email preview text for message ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit...`,
      body: `<p>This is the body of email ${i}.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Best regards,<br>${sender.name}</p>`,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * hoursAgo).toISOString(),
      isRead: i > 5,
      isStarred: i % 10 === 0,
      hasAttachments: i % 7 === 0,
    });
  }

  return emails;
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

    // Pagination
    const page = filter.page || 1;
    const limit = filter.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filtered.slice(startIndex, endIndex);

    return {
      emails: paginated,
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

