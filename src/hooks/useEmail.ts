import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailApi, type EmailQueryParams, type UpdateEmailData } from '@/services/emailApi';

export const useMailboxes = () => {
  return useQuery({
    queryKey: ['mailboxes'],
    queryFn: emailApi.getMailboxes,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
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
    },
  });

  const toggleStar = useMutation({
    mutationFn: ({ id, isStarred }: { id: number; isStarred: boolean }) =>
      emailApi.updateEmail(id, { isStarred }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email'] });
    },
  });

  const markAsRead = useMutation({
    mutationFn: ({ id, isRead }: { id: number; isRead: boolean }) => 
      emailApi.updateEmail(id, { isRead }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email'] });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] }); // Unread count might change
    },
  });

  const deleteEmail = useMutation({
    mutationFn: (id: number) => emailApi.deleteEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email'] });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
    },
  });

  const syncMailbox = useMutation({
    mutationFn: (mailboxId: number) => emailApi.syncMailbox(mailboxId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });

  return {
    updateEmail,
    toggleStar,
    markAsRead,
    deleteEmail,
    syncMailbox,
  };
};

