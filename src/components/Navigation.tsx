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
    <nav className="border-b-2 border-[#0A0A0A]/10 bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-8 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 text-2xl font-bold flex-shrink-0 text-[#0A0A0A] hover:scale-105 transition-transform duration-200"
          >
            <div className="p-2 bg-[#10F9A0] border-2 border-[#0A0A0A] rounded-xl">
              <Mail className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline italic" style={{ fontFamily: 'Instrument Serif, serif' }}>TL;DR</span>
          </Link>

          {/* Search Bar (only on inbox/kanban pages) */}
          {showSearchBar && (
            <div className="flex-1 max-w-2xl relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0A0A0A]/40" />
                  <Input
                    type="search"
                    placeholder="Search emails (subject, sender, content)..."
                    value={localQuery}
                    onChange={(e) => {
                      setLocalQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="pl-10 pr-10 border-2 border-[#0A0A0A]/20 rounded-xl focus:border-[#10F9A0] focus:ring-2 focus:ring-[#10F9A0]/20"
                  />
                  {localQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A0A0A]/50 hover:text-[#0A0A0A] rounded-full p-1 hover:bg-[#FFF8F0] transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#0A0A0A]/20 rounded-2xl shadow-[4px_4px_0px_0px_rgba(10,10,10,0.1)] z-50 max-h-80 overflow-auto">
                  {suggestions.contacts.length > 0 && (
                    <div className="p-3 border-b-2 border-[#0A0A0A]/10">
                      <div className="text-xs font-semibold text-[#0A0A0A]/50 mb-2 px-2 uppercase tracking-wide">Contacts</div>
                      {suggestions.contacts.map((contact, i) => (
                        <button
                          key={`contact-${i}`}
                          onClick={() => handleSuggestionClick(contact)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-[#FFF8F0] rounded-xl flex items-center gap-3 transition-colors"
                        >
                          <Avatar className="h-6 w-6 border-2 border-[#0A0A0A]">
                            <AvatarFallback className="text-xs bg-[#10F9A0] text-[#0A0A0A] font-semibold">
                              {contact[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">{contact}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {suggestions.keywords.length > 0 && (
                    <div className="p-3">
                      <div className="text-xs font-semibold text-[#0A0A0A]/50 mb-2 px-2 uppercase tracking-wide">Keywords</div>
                      {suggestions.keywords.map((keyword, i) => (
                        <button
                          key={`keyword-${i}`}
                          onClick={() => handleSuggestionClick(keyword)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-[#FFF8F0] rounded-xl flex items-center gap-3 transition-colors"
                        >
                          <Search className="h-4 w-4 text-[#0A0A0A]/40" />
                          <span className="truncate">{keyword}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {suggestions.contacts.length === 0 && suggestions.keywords.length === 0 && localQuery.length >= 2 && (
                    <div className="p-6 text-center text-sm text-[#0A0A0A]/60">
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
                  <button className="flex items-center gap-3 hover:bg-[#FFF8F0] px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer">
                    <Avatar className="h-9 w-9 border-2 border-[#0A0A0A]">
                      <AvatarFallback className="bg-[#10F9A0] text-[#0A0A0A] font-semibold">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-[#0A0A0A] hidden md:inline">{displayName}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 border-2 border-[#0A0A0A] rounded-2xl shadow-[4px_4px_0px_0px_rgba(10,10,10,0.1)] p-2"
                >
                  <DropdownMenuLabel className="font-semibold text-[#0A0A0A]">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#0A0A0A]/10" />
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                    <Link to="/inbox" className="font-medium">Inbox</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                    <Link to="/kanban" className="font-medium">Kanban</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                    <Link to="/" className="font-medium">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#0A0A0A]/10" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="text-[#FF6B6B] font-medium rounded-xl cursor-pointer hover:bg-[#FF6B6B]/10"
                  >
                    {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                asChild
                className="bg-[#10F9A0] text-[#0A0A0A] border-2 border-[#0A0A0A] rounded-full px-6 py-2 font-semibold shadow-[3px_3px_0px_0px_rgba(10,10,10,1)] hover:shadow-[5px_5px_0px_0px_rgba(10,10,10,1)] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
              >
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
