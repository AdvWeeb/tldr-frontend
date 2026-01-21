import { Link, useLocation } from 'react-router-dom';
import { Mail, Search, X, Inbox, Kanban, Menu, Zap } from 'lucide-react';
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
          {/* Enhanced Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 text-2xl font-bold flex-shrink-0 text-[#0A0A0A] group relative"
          >
            <div className="relative">
              {/* Animated glow effect on hover */}
              <div className="absolute inset-0 bg-[#10F9A0] blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-2xl"></div>
              {/* Main logo container */}
              <div className="relative p-3 bg-gradient-to-br from-[#10F9A0] via-[#10F9A0] to-[#0FD88E] border-2 border-[#0A0A0A] rounded-2xl shadow-[3px_3px_0px_0px_rgba(10,10,10,0.2)] group-hover:shadow-[5px_5px_0px_0px_rgba(10,10,10,0.3)] group-hover:-translate-y-0.5 group-hover:rotate-2 transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]">
                <Mail className="h-6 w-6 text-[#0A0A0A]" strokeWidth={2.5} />
                {/* Small decorative zap icon */}
                <Zap className="h-3 w-3 text-[#0A0A0A] absolute -top-1 -right-1 fill-[#FFD700]" />
              </div>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="italic leading-none text-2xl" style={{ fontFamily: 'Instrument Serif, serif' }}>TL;DR</span>
              <span className="text-[10px] font-normal tracking-wider text-[#0A0A0A]/60 uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Email Simplified</span>
            </div>
          </Link>

          {/* Navigation Tabs (only when authenticated) */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              <Link
                to="/inbox"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 border-2 ${
                  location.pathname === '/inbox'
                    ? 'bg-[#10F9A0] text-[#0A0A0A] border-[#0A0A0A] shadow-[3px_3px_0px_0px_rgba(10,10,10,0.2)]'
                    : 'bg-white text-[#0A0A0A]/60 border-transparent hover:bg-[#FFF8F0] hover:text-[#0A0A0A]'
                }`}
              >
                <Inbox className="h-4 w-4" />
                <span>Inbox</span>
              </Link>
              <Link
                to="/kanban"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 border-2 ${
                  location.pathname === '/kanban'
                    ? 'bg-[#10F9A0] text-[#0A0A0A] border-[#0A0A0A] shadow-[3px_3px_0px_0px_rgba(10,10,10,0.2)]'
                    : 'bg-white text-[#0A0A0A]/60 border-transparent hover:bg-[#FFF8F0] hover:text-[#0A0A0A]'
                }`}
              >
                <Kanban className="h-4 w-4" />
                <span>Kanban</span>
              </Link>
            </div>
          )}

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
              <>
                {/* Mobile Navigation Menu (visible on small screens) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline"
                      className="lg:hidden border-2 border-[#0A0A0A]/20 rounded-xl hover:bg-[#FFF8F0] hover:border-[#0A0A0A]/40"
                    >
                      <Menu className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-56 border-2 border-[#0A0A0A] rounded-2xl shadow-[4px_4px_0px_0px_rgba(10,10,10,0.1)] p-2"
                  >
                    <DropdownMenuLabel className="font-semibold text-[#0A0A0A]">Navigation</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[#0A0A0A]/10" />
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link to="/inbox" className="font-medium flex items-center gap-2">
                        <Inbox className="h-4 w-4" />
                        Inbox
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link to="/kanban" className="font-medium flex items-center gap-2">
                        <Kanban className="h-4 w-4" />
                        Kanban
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Account Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 hover:bg-[#FFF8F0] px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-[#0A0A0A]/20">
                      <Avatar className="h-9 w-9 border-2 border-[#0A0A0A] shadow-sm">
                        <AvatarFallback className="bg-gradient-to-br from-[#10F9A0] to-[#0FD88E] text-[#0A0A0A] font-bold">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-[#0A0A0A] hidden md:inline">{displayName}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-56 border-2 border-[#0A0A0A] rounded-2xl shadow-[4px_4px_0px_0px_rgba(10,10,10,0.1)] p-2"
                  >
                    <DropdownMenuLabel className="font-semibold text-[#0A0A0A]">
                      <div className="flex flex-col">
                        <span>{displayName}</span>
                        <span className="text-xs font-normal text-[#0A0A0A]/60">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[#0A0A0A]/10" />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="text-[#FF6B6B] font-medium rounded-xl cursor-pointer hover:bg-[#FF6B6B]/10 flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
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
