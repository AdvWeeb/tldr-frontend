import { Link, useLocation } from 'react-router-dom';
import { Mail, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore, getUserDisplayName } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';
import { useUIStore } from '@/store/uiStore';
import { useSearchSuggestions } from '@/hooks/useEmail';
import { useState, type FormEvent, useRef, useEffect } from 'react';

export function Navigation() {
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();
  const location = useLocation();
  const { searchQuery, setSearchQuery, clearSearch } = useUIStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: suggestions } = useSearchSuggestions(localQuery, showSuggestions);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Only show search bar on inbox and kanban pages
  const showSearchBar = isAuthenticated && ['/inbox', '/kanban'].includes(location.pathname);

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2); // Max 2 letters
  };

  const handleLogout = () => {
    logoutMutation.mutate(false);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchQuery(localQuery.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLocalQuery(suggestion);
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    clearSearch();
    setShowSuggestions(false);
  };

  const displayName = getUserDisplayName(user);

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold flex-shrink-0">
            <Mail className="h-6 w-6" />
            <span className="hidden sm:inline">TL;DR</span>
          </Link>

          {/* Search Bar (only on inbox/kanban pages) */}
          {showSearchBar && (
            <div className="flex-1 max-w-2xl relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search emails (subject, sender, content)..."
                    value={localQuery}
                    onChange={(e) => {
                      setLocalQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="pl-10 pr-10"
                  />
                  {localQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-80 overflow-auto">
                  {suggestions.contacts.length > 0 && (
                    <div className="p-2 border-b">
                      <div className="text-xs font-semibold text-muted-foreground mb-1 px-2 uppercase tracking-wider">Contacts</div>
                      {suggestions.contacts.map((contact, i) => (
                        <button
                          key={`contact-${i}`}
                          onClick={() => handleSuggestionClick(contact)}
                          className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm flex items-center gap-2"
                        >
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[10px]">{contact[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="truncate">{contact}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {suggestions.keywords.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs font-semibold text-muted-foreground mb-1 px-2 uppercase tracking-wider">Keywords</div>
                      {suggestions.keywords.map((keyword, i) => (
                        <button
                          key={`keyword-${i}`}
                          onClick={() => handleSuggestionClick(keyword)}
                          className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm flex items-center gap-2"
                        >
                          <Search className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate">{keyword}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {suggestions.contacts.length === 0 && suggestions.keywords.length === 0 && localQuery.length >= 2 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No suggestions found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Right side - Auth buttons */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                    <Avatar>
                      <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{displayName}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/inbox">Inbox</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/kanban">Kanban</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="text-red-600"
                  >
                    {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
