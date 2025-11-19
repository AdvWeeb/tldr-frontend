import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockEmailApi } from '@/services/mockEmailApi';
import type { EmailFilter } from '@/types/email';

export const useMailboxes = () => {
  return useQuery({
    queryKey: ['mailboxes'],
    queryFn: mockEmailApi.getMailboxes,
  });
};

export const useEmails = (filter: EmailFilter) => {
  return useQuery({
    queryKey: ['emails', filter],
    queryFn: () => mockEmailApi.getEmails(filter),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new
  });
};

export const useEmail = (id: string | null) => {
  return useQuery({
    queryKey: ['email', id],
    queryFn: () => mockEmailApi.getEmail(id!),
    enabled: !!id, // Only fetch if id is present
  });
};

export const useEmailMutations = () => {
  const queryClient = useQueryClient();

  const toggleStar = useMutation({
    mutationFn: (id: string) => mockEmailApi.toggleStar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email'] });
    },
  });

  const markAsRead = useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) => 
      mockEmailApi.markAsRead(id, isRead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email'] });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] }); // Unread count might change
    },
  });

  const deleteEmail = useMutation({
    mutationFn: (id: string) => mockEmailApi.deleteEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email'] });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
    },
  });

  return {
    toggleStar,
    markAsRead,
    deleteEmail,
  };
};

