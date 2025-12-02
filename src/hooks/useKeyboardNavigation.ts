import { useEffect, useCallback } from 'react';

interface KeyboardNavigationProps {
  enabled: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onOpen: () => void;
  onClose?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onStar?: () => void;
  onCompose?: () => void;
  onSearch?: () => void;
  onRefresh?: () => void;
}

/**
 * Custom hook for keyboard navigation in email dashboard
 * 
 * Keyboard shortcuts:
 * - j/ArrowDown: Next email
 * - k/ArrowUp: Previous email
 * - Enter: Open selected email
 * - Escape: Close email detail
 * - e: Archive email
 * - #/Delete: Delete email
 * - s: Star/unstar email
 * - c: Compose new email
 * - /: Focus search
 * - r: Refresh email list
 */
export function useKeyboardNavigation({
  enabled,
  onNext,
  onPrevious,
  onOpen,
  onClose,
  onArchive,
  onDelete,
  onStar,
  onCompose,
  onSearch,
  onRefresh,
}: KeyboardNavigationProps) {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Allow Escape even in inputs
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
      return;
    }

    // Prevent default for handled keys
    const handledKeys = ['j', 'k', 'e', 's', 'c', 'r', '/', 'ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Delete', '#'];
    if (handledKeys.includes(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      case 'j':
      case 'ArrowDown':
        onNext();
        break;
      case 'k':
      case 'ArrowUp':
        onPrevious();
        break;
      case 'Enter':
        onOpen();
        break;
      case 'Escape':
        if (onClose) onClose();
        break;
      case 'e':
        if (onArchive) onArchive();
        break;
      case 'Delete':
      case '#':
        if (onDelete) onDelete();
        break;
      case 's':
        if (onStar) onStar();
        break;
      case 'c':
        if (onCompose) onCompose();
        break;
      case '/':
        if (onSearch) onSearch();
        break;
      case 'r':
        if (onRefresh) onRefresh();
        break;
      default:
        break;
    }
  }, [enabled, onNext, onPrevious, onOpen, onClose, onArchive, onDelete, onStar, onCompose, onSearch, onRefresh]);

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);
}
