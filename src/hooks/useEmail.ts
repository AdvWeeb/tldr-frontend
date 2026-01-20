import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailApi, type EmailQueryParams, type UpdateEmailData, type FuzzySearchParams, type SendEmailData } from '@/services/emailApi';

export const useMailboxes = () => {
  const query = useQuery({
    queryKey: ['mailboxes'],
    queryFn: emailApi.getMailboxes,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    refetchInterval: (query) => {
      // Poll every 3 seconds if any mailbox is syncing
      const mailboxes = query.state.data as any[] | undefined;
      const isSyncing = mailboxes?.some(m => 
        m.syncStatus === 'syncing' || m.syncStatus === 'pending'
      );
      return isSyncing ? 3000 : false;
    },
  });
  return query; // This includes data, isLoading, refetch, etc.
};

export const useMailboxStats = (mailboxId: number | null) => {
  return useQuery({
    queryKey: ['mailboxStats', mailboxId],
    queryFn: () => emailApi.getMailboxStats(mailboxId!),
    enabled: !!mailboxId,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
};

export const useMailboxLabels = (mailboxId: number | null) => {
  return useQuery({
    queryKey: ['mailboxLabels', mailboxId],
    queryFn: () => emailApi.getMailboxLabels(mailboxId!),
    enabled: !!mailboxId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useEmails = (params: EmailQueryParams = {}) => {
  return useQuery({
    queryKey: ['emails', params],
    queryFn: () => emailApi.getEmails(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
};

export const useEmail = (id: number | null) => {
  return useQuery({
    queryKey: ['email', id],
    queryFn: () => emailApi.getEmail(id!),
    enabled: !!id, // Only fetch if id is present
    staleTime: 60 * 1000, // Cache for 1 minute
  });
};

export const useEmailMutations = () => {
  const queryClient = useQueryClient();

  const updateEmail = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmailData }) =>
      emailApi.updateEmail(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email'] });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      queryClient.invalidateQueries({ queryKey: ['mailboxStats'] });
    },
  });

  const toggleStar = useMutation({
    mutationFn: ({ id, isStarred }: { id: number; isStarred: boolean }) =>
      emailApi.updateEmail(id, { isStarred }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email'] });
      queryClient.invalidateQueries({ queryKey: ['mailboxStats'] });
    },
  });

  const markAsRead = useMutation({
    mutationFn: ({ id, isRead }: { id: number; isRead: boolean }) => 
      emailApi.updateEmail(id, { isRead }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email'] });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] }); // Unread count might change
      queryClient.invalidateQueries({ queryKey: ['mailboxStats'] });
    },
  });

  const deleteEmail = useMutation({
    mutationFn: (id: number) => emailApi.deleteEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email'] });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      queryClient.invalidateQueries({ queryKey: ['mailboxStats'] });
    },
  });

  const syncMailbox = useMutation({
    mutationFn: (mailboxId: number) => emailApi.syncMailbox(mailboxId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });

  const connectMailbox = useMutation({
    mutationFn: (data: { code: string; codeVerifier?: string }) => 
      emailApi.connectGmailMailbox(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
    },
  });

  const sendEmail = useMutation({
    mutationFn: (data: SendEmailData) => emailApi.sendEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
    },
  });

  const summarizeEmail = useMutation({
    mutationFn: (emailId: number) => emailApi.summarizeEmail(emailId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email'] });
    },
  });

  const moveEmailToColumn = useMutation({
    mutationFn: ({ emailId, columnId, sourceColumnId, archiveFromInbox }: { emailId: number; columnId: number; sourceColumnId?: number; archiveFromInbox?: boolean }) =>
      emailApi.moveEmailToColumn(emailId, columnId, sourceColumnId, archiveFromInbox),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });

  return {
    updateEmail,
    toggleStar,
    markAsRead,
    deleteEmail,
    syncMailbox,
    connectMailbox,
    sendEmail,
    summarizeEmail,
    moveEmailToColumn,
  };
};

export const useKanbanColumns = () => {
  return useQuery({
    queryKey: ['kanbanColumns'],
    queryFn: emailApi.getKanbanColumns,
    staleTime: 5 * 60 * 1000,
  });
};

export const useKanbanMutations = () => {
  const queryClient = useQueryClient();

  const createColumn = useMutation({
    mutationFn: emailApi.createKanbanColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanbanColumns'] });
    },
  });

  const updateColumn = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      emailApi.updateKanbanColumn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanbanColumns'] });
    },
  });

  const deleteColumn = useMutation({
    mutationFn: (id: number) => emailApi.deleteKanbanColumn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanbanColumns'] });
    },
  });

  const initializeColumns = useMutation({
    mutationFn: emailApi.initializeDefaultColumns,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanbanColumns'] });
    },
  });

  return {
    createColumn,
    updateColumn,
    deleteColumn,
    initializeColumns,
  };
};

export const useEmailSearch = (params: FuzzySearchParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['emailSearch', params],
    queryFn: () => emailApi.fuzzySearch(params),
    enabled: enabled && !!params.q, // Only search if enabled and query exists
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
};

export const useSemanticSearch = (params: any, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['semanticSearch', params],
    queryFn: () => emailApi.semanticSearch(params),
    enabled: enabled && !!params.q,
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  });
};

export const useSearchSuggestions = (q: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['searchSuggestions', q],
    queryFn: () => emailApi.getSearchSuggestions(q),
    enabled: enabled && q.length >= 2, // Only fetch if query is at least 2 chars
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
