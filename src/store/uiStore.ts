import { create } from 'zustand';

export type ViewMode = 'BOARD_VIEW' | 'SEARCH_VIEW';
export type SortBy = 'receivedAt' | 'subject' | 'fromEmail';
export type SortOrder = 'ASC' | 'DESC';

export interface EmailFilters {
  isRead?: boolean;
  isStarred?: boolean;
  hasAttachments?: boolean;
  category?: 'primary' | 'social' | 'promotions' | 'updates' | 'forums';
  taskStatus?: 'none' | 'todo' | 'in_progress' | 'done';
  fromEmail?: string;
  label?: string;
  isSnoozed?: boolean;
}

interface UIState {
  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  // Filters
  filters: EmailFilters;
  setFilters: (filters: Partial<EmailFilters>) => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;

  // Sorting
  sortBy: SortBy;
  sortOrder: SortOrder;
  setSorting: (sortBy: SortBy, sortOrder: SortOrder) => void;

  // UI states
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;

  // Selected mailbox for filtering
  selectedMailboxId: number | null;
  setSelectedMailboxId: (id: number | null) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial view mode
  viewMode: 'BOARD_VIEW',
  setViewMode: (mode) => set({ viewMode: mode }),

  // Search state
  searchQuery: '',
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    // Automatically switch to search view when query is entered
    if (query.trim()) {
      set({ viewMode: 'SEARCH_VIEW' });
    }
  },
  clearSearch: () => {
    set({
      searchQuery: '',
      viewMode: 'BOARD_VIEW',
      isSearching: false
    });
  },

  // Filters
  filters: {},
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },
  clearFilters: () => set({ filters: {} }),
  hasActiveFilters: () => {
    const { filters } = get();
    return Object.keys(filters).length > 0;
  },

  // Sorting (default: newest first)
  sortBy: 'receivedAt',
  sortOrder: 'DESC',
  setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),

  // UI states
  isSearching: false,
  setIsSearching: (isSearching) => set({ isSearching }),

  // Mailbox selection
  selectedMailboxId: null,
  setSelectedMailboxId: (id) => set({ selectedMailboxId: id }),
}));
